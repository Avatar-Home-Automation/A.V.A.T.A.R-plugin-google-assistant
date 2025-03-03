import GoogleAssistant from 'google-assistant';
import * as streamBuffers from 'stream-buffers';
import fs from 'fs-extra';
import * as path from 'node:path';
import _ from 'underscore';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

var Locale; 
var assistantConfig;
var isNew = true;
var records = [];
var onRecord = false;

export async function init() {

	if (!await Avatar.lang.addPluginPak("google-assistant")) return
	Locale = await Avatar.lang.getPak("google-assistant", Config.language)

	if (!fs.existsSync(path.resolve(__dirname, 'credentials/' + Config.modules['google-assistant'].authorization.credentials)))
		return Locale ? error(Locale.get("error.credential")) : "google-assistant: The Credentials file doesn't exist, check the documentation... Exit.";
	if (!fs.existsSync(path.resolve(__dirname, 'credentials/' + Config.modules['google-assistant'].authorization.tokens)))
		return Locale ? error(Locale.get("error.token")): "google-assistant: The Tokens file doesn't exist, check the documentation... Exit.";

	assistantConfig = {
	  auth: {
		keyFilePath: path.resolve(__dirname, 'credentials/' + Config.modules['google-assistant'].authorization.credentials),
		savedTokensPath: path.resolve(__dirname, 'credentials/' + Config.modules['google-assistant'].authorization.tokens)
	  },
	  conversation: {
		lang: 'fr-FR', // by default, set below by the client language
		audio: {
	      encodingIn: 'LINEAR16', 
	      sampleRateIn: 16000,
	      encodingOut: 'MP3',
	      sampleRateOut: 24000
		},
		screen: {
	    	isOn: false, // set this to true if you want to output results to the screen (search 'screen-data' for displaying a HTML page)
    	}
	  }
	};
  
	Avatar.listen('GoogleAssistant', data => {
		formatSentence (data.sentence, sentence => {
			start(data, data.client, sentence, (text, continueConversation) => {
				if (data.callback)
					data.callback(text, (!continueConversation) ? false : true);
			}, ((data.audio == null) ? true : data.audio));
		});
	});
}


const errStart = (msg, callback) => {
	error(msg);
	Avatar.Speech.end(data.client, true);
	if (callback) callback();
}


export async function action(data, callback) {

	Locale = await Avatar.lang.getPak("google-assistant", data.language);
	if (!Locale) 
		return errStart("No language pack available. first, add a language pack for the current language.", callback);
		
	if (!assistantConfig) 
		return errStart(Locale.get("error.config"), callback);

	if (!Config.modules['google-assistant'].noResponse[assistantConfig.conversation.lang]) 
		return errStart(Locale.get("error.noResponse"), callback);
		
	if (!Config.modules['google-assistant'].noAskmeResponse[assistantConfig.conversation.lang]) 
		return errStart(Locale.get("error.noAskmeResponse"), callback);

	if (!Config.modules['google-assistant'].askmeResponse[assistantConfig.conversation.lang]) 
		return errStart(Locale.get("error.AskmeResponse"), callback);

	const tblActions = {
		start: () => {
			formatSentence (data.action.sentence, (sentence) => {
				start(data, data.client, sentence, (text, continueConversation) => {
						if (text) {
							Avatar.speak(text, data.client, () => {
								if (!continueConversation) Avatar.Speech.end(data.client);
							}, false);
						} else if (!continueConversation) {
							Avatar.Speech.end(data.client);
						}
				}, ((data.audio == null) ? true : data.audio));
			});
		}
	};

	info("google-assistant:", data.action.command, L.get("plugin.from"), data.client);
	tblActions[data.action.command]();

	callback();
 
}



function start (data, client, sentence, callback, audio) {

	const clientFrom = Avatar.getTrueClient(client);
	const clientInfos = Avatar.Socket.getClient(clientFrom);
	assistantConfig.conversation.lang = clientInfos.language || 'fr-FR';

	if (audio === null) audio = true;

	const startConversation = conversation => {
	  	conversation
		.on('audio-data', (audio_data) => {
			if (audio) {
				if (audio_data || audio_data == null) {
					if (!onRecord) {
						records = [];
						onRecord = true;
					}
					records.push (audio_data);
				}
			}
    	})
		.on('screen-data', buffer => {
			// html page
			// const html = new TextDecoder().decode(buffer.data);
			// console.log('html page:', html)
    	})
		.on('response', text => {
			// response by text, not used since 2024... :-(
		})
		.on('ended', (err, continueConversation) => {
			if (err) {
				warn(Locale.get(["error.conversation", err]));
				isNew = true;
				conversation.end();
				onRecord = false;
				return (callback) ? callback() : null;
			}

			if (continueConversation) {
				info(Locale.get("assistant.continue"));
				ConversationNextbyStream (conversation, data, client, callback, audio);
			} else {
				if (audio === true && onRecord) {
					playAudio (client, retval => {
						if (retval) {
							if (callback) callback(null, false);
						} else
							if (callback) callback(Config.modules['google-assistant'].noResponse[assistantConfig.conversation.lang], false);
					})
				} else {
					// A error message if required...
					if (callback) callback(Config.modules['google-assistant'].noResponse[assistantConfig.conversation.lang], false);
				}
				audio = null;
				isNew = true;
				conversation.end();
				onRecord = false;
			}
		})
		.on('error', (err) => {
			error(Locale.get(["error.conversation", err]));
		  if (callback) callback();
		});
	};

	const assistant = new GoogleAssistant(assistantConfig.auth);
	assistant
		.on('ready', function() {
			assistantConfig.conversation.isNew = isNew;
			assistantConfig.conversation.textQuery = sentence;
			assistant.start(assistantConfig.conversation);
		})
		.on('started', startConversation)
		.on('error', (err) => {
			error(Locale.get(["error.conversation", err]));
		  	if (callback) callback();
	});

}


function ConversationNextbyStream (conversation, data, client, callback, audio) {

	playAudio (client, () => {

		let timeout = Math.round(Config.modules['google-assistant'].waitForAnswer * 1000);
		info(Locale.get(["assistant.waiting", Config.modules['google-assistant'].waitForAnswer.toString()+'s']));
		
		Avatar.askme (null, client, Config.modules['google-assistant'].askmeResponse[assistantConfig.conversation.lang], timeout, (answer, end) => {
			end(client);
			if (!answer) {
				return Avatar.speak(Config.modules['google-assistant'].noAskmeResponse[assistantConfig.conversation.lang], client, () => {
					isNew = true;
					conversation.end();
					onRecord = false;
					if (callback) callback();
				}, false);
			}

			if (answer && answer.indexOf('tts_answer') !== -1) {
				var answer = answer.split(':')[1];
				isNew = false;
				onRecord = false;
				return start (data, client, answer, callback, audio);
			}

			Avatar.speak(Config.modules['google-assistant'].noAskmeResponse[assistantConfig.conversation.lang], client, () => {
				 isNew = true;
				 onRecord = false;
				 conversation.end();
				 if (callback) callback();
			}, false);
		});
	})

}


function toBuffer (recorded){
	var osb = new streamBuffers.WritableStreamBuffer({
	  initialSize: (100 * 1024), 
	  incrementAmount: (10 * 1024) 
	});
	for(var i = 0 ; i < recorded.length ; i++) {
	  osb.write(new Buffer.from(recorded[i], 'binary'));
	}
	osb.end();
	return osb.getContents();
}


function playAudio (client, callback) {

	let clientFolder = (client.indexOf(' ') != -1) ? client.replace(/ /g,"_") : client;
	clientFolder = reformatString(clientFolder);
	let dirname;
	if (!Avatar.Socket.isServerSpeak(client)) {
		dirname = __dirname;
	} else {
		if (Config.modules['google-assistant'].speechPlugin)
			dirname = Config.modules[Config.modules['google-assistant'].speechPlugin].platform[process.platform].sharedFolder;
		else {
			error (Locale.get("error.noSpeechPlugin"));
			return callback(false);
		}
	}

	fs.ensureDirSync(path.resolve(dirname, "audio", clientFolder));
	let file = path.resolve(dirname, "audio", clientFolder, 'audio.mp3');
	fs.writeFile(file, toBuffer(records));
	if (!Avatar.Socket.isServerSpeak(client)) {
		let music = `http://${Config.http.ip}:${Config.http.port}/audio.mp3`
		let staticPath = path.resolve(dirname, "audio", clientFolder);
		Avatar.static.set(staticPath, () => {
			Avatar.play(music, client, 'url', false, () => {
				callback(true);
			});
		});

	} else {  
		let file = path.resolve(dirname)+'@@'+'/audio/'+clientFolder+'/audio.mp3';
		Avatar.play(file, client, 'url', false, () => {
			callback(true);
		})
	}
}



function formatSentence(sentence, callback) {
	if (!Config.modules['google-assistant'].formatSentence[assistantConfig.conversation.lang])
	 	Config.modules['google-assistant'].formatSentence[assistantConfig.conversation.lang] = {exec: false}

	if (Config.modules['google-assistant'].formatSentence[assistantConfig.conversation.lang].exec) {
		var even = _.find(Config.modules['google-assistant'].formatSentence.replace, num => {
			return sentence.toLowerCase().indexOf(num[0].toLowerCase()) !== -1;
		});

		if (even) {
			sentence = sentence.toLowerCase().replace(even[0].toLowerCase(), even[1]);
		}
	}
	return callback(sentence);

}


function fixedCharCodeAt (str, idx) {
    idx = idx || 0;
    var code = str.charCodeAt(idx);
    var hi, low;

    if (0xD800 <= code && code <= 0xDBFF) {
        hi = code;
        low = str.charCodeAt(idx+1);
        if (isNaN(low)) {
            throw Locale.get("error.charCode");
        }
        return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
    }
    if (0xDC00 <= code && code <= 0xDFFF) {
        return false;
    }
    return code;
}


function reformatString (tts) {

	for (var i = 0; i < tts.length; i++) {
      let num = parseInt(fixedCharCodeAt(tts, i));
      if (num > 128 || isNaN(num)) {
		       tts = tts.replace(tts[i], '_');
      }
	}
  tts = reformatStringNext (tts);
  tts = tts.replace(/_/g, '');
	return tts;
}


function reformatStringNext (str) {

  var accent = [
      / /g, /'/g,
      /"/g, /\?/g,
      /:/g, /\|/g,
      /\//g, /\\/g,
      /\>/g, /\</g,
      /!/g, /\./g,
      /\(/g, /\)/g,
      /\{/g, /\}/g,
      /\[/g, /\]/g,
      /\#/g, /\@/g,
      /\-/g, /\&/g,
      /\;/g, /\,/g,
      /\^/g, /\$/g,
      /\~/g, /\=/g,
      /\*/g, /\`/g
  ];
  for(var i = 0; i < accent.length; i++){
      str = str.replace(accent[i], '_');
  }

  return str;
}
# Development

It is possible to trigger a Google Assistant action from another plugin using a trigger, which can be useful in several situations, such as:

* **Controlling voice commands:** If you want to have full control over the voice commands that trigger Google Assistant, or if you prefer not to use Assistant's voice responses to give your own answers.
* **Managing multiple actions:** If you have multiple actions to execute, one of which involves a device controlled by Google Assistant, while the others require specific actions not related to Google Assistant.

You can use the `trigger` function of Avatar to execute a Google Assistant action from another plugin. This function allows sending a voice command to Google Assistant and receiving a response if necessary.

**Syntax:**

``` js
Avatar.trigger(ListenerName, Object)
``` 

**Parameters:**

* **ListenerName** : Always 'GoogleAssistant'
* **Object**: An object containing the following parameters:
    * **client** (Required): The name of the client sending the command.
    * **sentence** (Required): The natural language sentence sent to Google Assistant. Use _data.rawSentence_ to retrieve the sentence in natural language. 
    * **audio** (Optional): Allows or disallows Google Assistant to vocalize its responses. The default value is true (vocalizes). Set to false if you do not want a vocal response.
    * **callback** (Optional): A function to execute after the command has been processed by Google Assistant. This function takes two parameters:
        * **text**: null if there is no response or an error message defined in the _Config.modules['google-assistant'].noResponse_ parameter if the assistant doesn't respond.
        * **continueConversation**: Indicates whether the conversation should continue. Set to false if it's not a question/answer game, or true if it is.ç

**Example call in a plugin:**

``` js
Avatar.speak("I'll take care of it", data.client, false, () => {
    Avatar.trigger('GoogleAssistant', {
        client: data.client,
        sentence: data.rawSentence,
        audio: false,
        callback: function(err, continueConversation) {
            // Ends the conversation
            Avatar.Speech.end(data.client);

            if (err) {
                // error, do stuff
                return;
            }

            // Do stuff
        }
    });
});
```

In this example, a text is vocalized by A.V.A.T.A.R, then the command is sent to Google Assistant, and the voice response is disabled with the audio: false option. The callback function is then called to handle the end of the conversation or execute other actions.

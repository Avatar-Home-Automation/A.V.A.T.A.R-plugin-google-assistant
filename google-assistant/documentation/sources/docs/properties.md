# Properties

## Configuration Properties

The properties below allow you to customize the plugin's behavior.  
These properties are located in the _google-assistant.prop_ file and can be accessed directly from `Plugin Studio`.

### Note on `{LANG}`

`{LANG}` is a placeholder that must be replaced by the corresponding language code for the current language in use (e.g., `fr-FR` for French, `en-EN` for English, etc.). This ensures the plugin's settings are adapted to the [supported languages](supported-languages.md).

| <div style="width:170px">Parameter</div> | <div style="width:160px">Type</div> | Default<br>Value | Description |
|:-----|:---:|:---:|:---|
| `authorization/`<br>`credentials` | string | _credentials.json_ | OAuth client of the Google Assistant project |
| `authorization/`<br>`tokens` | string | _tokens.json_ | Access key for the device registered with the OAuth client |
| `formatSentence/`<br>`{LANG}/`<br>`exec` | boolean | true | Determines whether the `formatSentence/{LANG}/replace` property is verified or ignored. |
| `formatSentence/`<br>`{LANG}/`<br>`replace` | array of arrays of string<br>[["to replace","replaced by"]] | | Corrects user-dictated sentences so that they are properly interpreted by Google Assistant.<br><br>For example, suppose the user vocalizes the command **"écho perroquet"**<br>The corresponding Google Assistant action is **"Echo Perroquet"**.<br><br>By adding the **["écho perroquet", "Echo Perroquet"]** array to this property, the command will automatically be transformed into "Echo Perroquet", enabling Google Assistant to match the action.|
| `waitForAnswer` | integer | 15 | Waiting time in seconds for the user's response during a conversation with the Assistant. |
| `noResponse/{LANG}` | string | | Phrase spoken by A.V.A.T.A.R if the Assistant's response is empty. You can include multiple phrases separated by pipes (`|`). |
| `askmeResponse/{LANG}` | object | | Possible responses during a question/answer dialogue with the Assistant. |
| `noAskmeResponse/{LANG}` | string | | Phrase spoken by A.V.A.T.A.R when the expected user response exceeds the specified timeout (`waitForAnswer`). |
| `speechPlugin` | string | sonosPlayer | Plugin used to override the `speak()` and `play()` functions if the sound is redirected to Wi-Fi speakers. |

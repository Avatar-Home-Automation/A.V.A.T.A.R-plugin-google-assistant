# Register a device

1. Do a right click on [this link](https://console.actions.google.com/) and in the menu click on `Open link in a new tab` to open the `Actions on Google` Window
2. A new window opens with Actions on Google

    ![](img/actions-google.png){width="600"}

3. Click on the `New project` button

    - Enter answers to basic questions 

4. The `New project` window appears

    ![](img/new-project.png){width="400"}

    - Select your Google Project as Project Name
    - Choisissez le langage par défaut pour vos actions
    - Choisissez votre pays ou région
    - Click on the `Import project` button

5. The `Actions Console` window appears

    ![](img/device-registration.png){width="600"}

    - At the bottom of the page, click on the 'Device registration' link
  
6. In the `Device registration` page

    ![](img/register-model-button.png){width="400"}

    - Click on the `REGISTER MODEL` button

7. In the `REGISTER MODEL` window

    ![](img/register-model-window.png){width="400"}

    - Enter a product name (e.g. _My devices_)
    - Enter a Manufacturer name (e.g. _Avatar_)
    - Select a device type
        - You can select "Light" (you can come back to it later)
    - Click on `REGISTER MODEL`



Dans l'onglet suivant "Download credentials file" , cliquez sur "Download credentials.json". Enregistrez le fichier credentials.json dans le répertoire credentials du plug-in Google-Assistant (si le nom du fichier enregistré n'est pas credentials.json, renommez-le
Dans l'onglet suivant "Specify traits", cliquez sur la case à cocher "All 7 traits". (Vous pourrez revenir sur les différentes capacités que votre appareils prend en charge plus tard)
Dans la fenêtre "Device Registration", vous devez voir votre device
Vous devez maintenant installer le SDK et récupérer une clé d'accès au client, ce que nous allons faire au chapitre suivant.
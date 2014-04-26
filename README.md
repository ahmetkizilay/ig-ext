# IG-EXT

This is chrome extension for viewing Instagram images within a popup screen. Currently this is a work in progress project.


### Authentication
Instagram has two-factor authentication system to interact with the API. In order to handle the second step of the authentication phase (which uses the client_secret), I am using a node.js app to redirect the requests for me. The url of this app should be added to the manifest.json file, and the app should be running to successfully complete the authentication phase. The source code of the app [is/will be] available on GitHub, as well.

###### I will keep editing this file later on as the project progresses...
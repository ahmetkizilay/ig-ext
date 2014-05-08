# IG-EXT
This is chrome extension for viewing Instagram images within a popup screen. Once you are authenticated with Instagram, you can view photos you liked, quickly view your friends profiles, and search for users and hashtags.


### Authentication
Instagram has two-factor authentication system to interact with the API. In order to handle the second step of the authentication phase (which uses the client_secret), I am using a node.js app to redirect the requests for me. The url of this app should be added to the manifest.json file, and the app should be running to successfully complete the authentication phase. The source code of the app is available on [GitHub](1https://github.com/artsince/ig-auth-post-wrapper), as well.

The client\_id is stored in the config variable in [background.js](https://github.com/artsince/ig-ext/blob/master/background.js) file at the moment. You need to change it to your own client\_id when you want to use the code. (I should move it to a separate config file, but currently it does not seem to be an urgent necessity)

### Instagram API
[ig-api.js](https://github.com/artsince/ig-ext/blob/master/ig-api.js) file contains a wrapper method for all the endpoints in the [Instagram API](http://instagram.com/developer/endpoints/). Even though, all methods have a pretty uniform implementation, some methods don't yet have a routine to select for specific parameters the endpoints accept. That is because I did not have to use those methods for this application, and hopefully I will find a way to incorporate those other methods to the application in some way.

### Third-Party Libraries

I started this project with Bootstrap support, however I soon realized that I am only using a tiny fraction of the whole library. So, I removed the library and rewrote the design without any references to it.

I developed a javascript library called [notify.js](https://github.com/artsince/notify.js) to display notification messages. It is very simple and small, but it does the job. And it was fun to code...

Finally, I developed another javascript library called [history.js](https://github.com/artsince/history.js) to keep track of navigation between pages. Later I found out that I could have used the built-in history object for this, therefore I am likely to remove this library and start using the built-in object instead.

### Why
I just enjoy exploring Instagram, and I thought I could work on a project like this to polish my Javascript skills. I am not really planning on releasing it as a product on the Chrome WebStore or anywhere else. However, if you are dying to install this amazing app on your browser, just let me know...

### License
MIT


###### I will keep editing this file later on as the project progresses...
const functions = require("firebase-functions");
const fetch = require("node-fetch");
const firebase = require('firebase-admin');
firebase.initializeApp();

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello!");
// });

exports.scheduledFunctionVideo = functions.pubsub.schedule('every 36 hours').onRun((context) => {

    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };
    
    fetch("https://youtube.googleapis.com/youtube/v3/search?maxResults=20&order=date&q=flamengo&key=", requestOptions)
        .then(response => response.json())
        .then(res => { return Object.values(res) })
        .then((res) => { getArrayEndpoint(res) })
        .catch(error => console.log('error', error));
    
    function getArrayEndpoint(res) {
        //console.log(JSON.stringify(res[5]));
        const result = res[5].map((el) => {
            //console.log(el.id.videoId);
            insertInDataBase(el.id.videoId)
        })
    }
    
    async function insertInDataBase(videoId) {
        // console.log(videoId);
        let usuarios = await firebase.database().ref('videos');
        let key = usuarios.push().key;
    
        usuarios.child(key).set({
            idYoutube:videoId         
        });
    }
    
    return null;
});

exports.scheduledFunctionNews = functions.pubsub.schedule('every 12 hours').onRun((context) => {

    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    arrayReceive = []

    fetch("https://www.flaresenha.com//wp-json/wp/v2/posts?_embed", requestOptions)
        .then(response => response.json())
        .then(res => { return Object.values(res) })
        .then((res) => { getArrayEndpoint(res) })
        .catch(error => console.log('error', error));

    function getArrayEndpoint(res) {
        for (var i = 0; i < 3; i++) {
            const title = res[i].title.rendered
            const urlBackground = res[i]._embedded["wp:featuredmedia"][0]["source_url"]
            const text = res[i].content.rendered
            const date = res[i].date
            insertInDataBase(title, urlBackground, text, date)
            console.log(title);
        }
    }

    async function insertInDataBase(title, urlBackground, text, date) {

        let usuarios = await firebase.database().ref('noticias');
        let key = usuarios.push().key;

        usuarios.child(key).set({   
            title: title,
            urlBackground: urlBackground,
            text: text,
            dataPub: date,
        });
    }

    //console.log('This will be run every 5 minutes!');
    return null;
});

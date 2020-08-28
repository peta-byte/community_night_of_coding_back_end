const restify = require('restify');
const builder = require('botbuilder');
const request = require('request');


// Setup Restify Server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
const connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata 
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

const memoryStorage = new builder.MemoryBotStorage();

// This is the default message handler.
const bot = new builder.UniversalBot(connector, function (session) {
    session.send('Hmmm...that seems to be a tough one. Please, try a different phrase or ask me another question.');
}).set('storage', memoryStorage);

//Set LUIS & Bing connection variables
const luisAppId = process.env.LuisAppId;
const luisAPIKey = process.env.LuisAPIKey;
const luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';
const bingAPIKey = process.env.BingAPIKey;
const bingMode = 'Spell';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v2.0/apps/' + luisAppId + '?subscription-key=' + 
luisAPIKey+'&verbose=true&spellCheck=true&mode='+bingMode+'&bing-spell-check-subscription-key='+bingAPIKey;

//Set the QnA Maker service connection variables
const qnamaker_endpointKey = process.env.QnAAuthKey;
const qnamaker_hostName = process.env.QnAEndpointHostName;
const chit_chat_kbID = process.env.QnAChitchatKBId;
const about_kbID = process.env.QnAAboutKBId;

const chit_chatUrl = qnamaker_hostName+'/knowledgebases/'+chit_chat_kbID+'/generateAnswer';
const aboutUrl = qnamaker_hostName+'/knowledgebases/'+about_kbID+'/generateAnswer';

// Create a recognizer that gets intents from LUIS, and add it to the bot
const recognizer = new builder.LuisRecognizer(LuisModelUrl);
bot.recognizer(recognizer);

// Add a dialog for each intent that the LUIS app recognizes.

//The dialog that handles queries intended for the 'Chit-chat' knowledgebase
bot.dialog('Chit-chat',
    (session) => {
        let userQuery = session.message.text;
        let body = JSON.stringify({"question": userQuery});
        let options = {
            url: chit_chatUrl,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'EndpointKey '+qnamaker_endpointKey
            },
            body: body,
            method: 'POST'
        };
        //Make a request to the QnAMaker Service API
        request(options, (error, response)=> {
            if(error){
                console.log('Error from the Chit-chat dialog: %s', error.message);
            }
            else if (response.statusCode !== 200) {
                console.log('REST request returned ' + response.statusCode + '; body: ' + JSON.stringify(response.body));
            }
            else {
                let res = JSON.parse(response.body);
                if(res.answers.length !== 0){
                    if(res.answers[0].answer !== 'No good match found in KB.'){
                      let answer = res.answers[0].answer;
                      session.send(answer);  
                    }else{
                       session.send('Hmmm...that seems to be a tough one. Please, try a different phrase or ask me another question.');
                    }
                    
                }else{
                    console.log('Hmmm...I do not seem to have any answers for this query.');
                }                
            }
            session.endDialog(); 
        });
     }
).triggerAction({
    matches: 'Chit-chat'
});

//The dialog that handles queries intended for the 'About' knowledgebase
bot.dialog('About',
    (session) => {
        let userQuery = session.message.text;
        let body = JSON.stringify({"question": userQuery});
        let options = {
            url: aboutUrl,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'EndpointKey '+qnamaker_endpointKey
            },
            body: body,
            method: 'POST'
        };
        //Make a request to the QnAMaker Service API
        request(options, (error, response)=> {
            if(error){
                console.log('Error from the About Dialog: %s', error.message);
            }
            else if (response.statusCode !== 200) {
                console.log('REST request returned ' + response.statusCode + '; body: ' + JSON.stringify(response.body));
            }
            else {
                let res = JSON.parse(response.body);
                if(res.answers.length !== 0){
                    if(res.answers[0].answer !== 'No good match found in KB.'){
                      let answer = res.answers[0].answer;
                      session.send(answer);  
                    }else{
                        session.send('Hmmm...that seems to be a tough one. Please, try a different phrase or ask me another question.');
                    }
                    
                }else{
                    console.log('Hmmm...I do not seem to have any answers for this query.');
                }                
            }
            session.endDialog(); 
        });        
    }
).triggerAction({
    matches: 'About'
});



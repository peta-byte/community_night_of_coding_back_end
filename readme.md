# The Community Night of Coding - Chatbot AI Project

This was a volunteer project created for the Community Night of Coding Event on December 4th, 2018 in Arkansas.
It was meant as a welcome to the world of Artificial Intelligence for its audience.

It was a conversational Chatbot with predetermined responses. It employed the use of Azure Cognitive Services to make appropriate responses to users queries.

It was built with JavaScript.


## Back-end Application

It was built using Node.js and the Azure Bot Service SDK v3.

The wep app bot was hosted on Azure with connections to other cognitive services, like LUIS, QnAMaker and the Bing SpellCheck API.

LUIS, Language Understanding Intelligent Service, directed the users' utterances to the correct intent handlers in the Bot that corresponded to two KnowledgeBases.

The Bing SpellCheck API corrected mispellings in utterances and ensured LUIS interpreted the correct words.

The QnAMaker Service connected to two KnowledgeBases: About and Chit-chat. This was where the Bot drew answers for the users. 





# BGG Catalog Buddy (BCB)
![image](https://github.com/user-attachments/assets/7f9199c9-8593-4d2a-8813-5d430a1a6cc2)

BGG Catalog Buddy is a web application tool to import data exported from the BGG Catalog mobile app [Android](https://play.google.com/store/apps/details?id=com.gadestudios.boardgame), [iOS](https://apps.apple.com/es/app/bgg-catalog/id1558147475), and present the data in an alternative way.

This application was inspired by the Playdates feature in the app. This feature gives each player a final score based on how they did in all games in a single "playdate", with their scores being weighted based on the weight of each game. The information displayed in the BGG Catalog app is only for a single "day" 
(you could in theory create a playdate and just add weeks, months worth of plays, however it would get a little complicated, and you would lose the thrill of finding out that you actually won the playdate because you came second in every game, whereas the winner always swapped).

What would it look like, if you took weeks, months, or maybe even years worth of plays and or playdates, and combined it into a single score? Well, this tool was designed to show that. 

This application is till a WIP and has been made with a desktop PC in mind. Mobile will "work", however it won't look great to be honest.

## Important Things to Note:
This application has been tailored to how I use BGG Catalog, so, there is a good chance that the way you those BGG Catalog, might result in the imported data not being compatible. The main things that you need to do in order to have this application behave is:
- Ensure a location is setup and setup for **EVERY** play/playdate. The application filters by location, and as it stands, a location is required for every play.
- Ensure when you are completing a play, that you specify who the winner is, this application will **NOT** assume that the person with the higher score is the winner

## Features and Tools:
Currently, BCB allows you to see information about players, and about games in your collection. When you select a player or game on the home page, you will be sent to the relevant details page. Along the bottom, you will see an option to select the location you want to see information on, as well as a date range (defaults to the last 6 months):
![image](https://github.com/user-attachments/assets/adbc7541-257d-4ed9-a643-de097a5c7771)

If the selected location and date range has some plays, you should see the page populate:
![image](https://github.com/user-attachments/assets/59fae780-8f18-4ad1-b37d-3b94526cd819)
![image](https://github.com/user-attachments/assets/533c1ae8-c305-4f6b-b52d-fd6d7095dee9)


## How it Works:
BCB works off of the exported data from BGG Catalog:

Open BGG Catalog and open your settings menu:
![image](https://github.com/user-attachments/assets/365df934-709b-4f8c-8353-ffa753103ad5)

Click "Backups":
![image](https://github.com/user-attachments/assets/1118726b-7ac0-4a78-af92-6544920b1830)

Click "Create backup":
![image](https://github.com/user-attachments/assets/f684cbcc-68a9-438c-a61d-768c57725007)

Select either "Text Only" or "Text and Images":
![image](https://github.com/user-attachments/assets/7068bf1c-0b51-4f77-b2dc-89606a628e54)

"Text and Images" will be best to use for your very first import. This contains images you have selected for Players.
"Text Only" will be best to use when you have imported players and their images before, and have only added new plays, playdates etc.


Now this part is only for those who don't know where the backup files are stored on your phone, or those who want to quickly share the file to aid with getting the file on a desktop PC:

Click "See Backups": 
`![image](https://github.com/user-attachments/assets/461da61c-706f-419b-a48e-2fd5fdfafafc)

Click the triple dots near the backup you just made, then click Share.
![image](https://github.com/user-attachments/assets/394980ae-da55-4963-8d7a-c8cf75c3880a)


Once you have your file, open up [BCB](https://dariengmadden.github.io/BGGCatalogBuddy/). Click the "Import Data" button, and then select your file. The app should then begin to read the file, storing all your games, plays, players and locations. It will also talk to the BGG API to collect additional information for the games you have imported.
![image](https://github.com/user-attachments/assets/6f2cbaa7-7896-4b47-8f65-1272f3451b08)

You can now use the application!

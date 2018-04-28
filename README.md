# fifa-world-cup-2018-game
NodeJS, ExpressJS, MongoDB and AngularJS application for a multiplayer game like Fantasy Premier League

# Setup
1. Install MongoDB
2. Run `npm install`
3. Run the following from the project root directory
  * `mongoimport --db fifa --collection players --type csv --drop --file FullData.csv --headerline`
  * `mongoimport --db fifa --collection stadiums --type json --drop --file stadiums.json --jsonArray`
  * `mongoimport --db fifa --collection teams --type json --drop --file teams.json --jsonArray`
  * `mongoimport --db fifa --collection groups --type json --drop --file groups.json --jsonArray`
  * `mongoimport --db fifa --collection knockout --type json --drop --file knockout.json --jsonArray`
4. Run `node index.js`
5. Visit `https://fantasyfifaworldcup2018.localtunnel.me`

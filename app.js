const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializingDbWithServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("running at 3000 port");
    });
  } catch (e) {
    console.log(`Error ${e}`);
    process.exit(1);
  }
};

initializingDbWithServer();

// API 1 Return a list of players in the player table.
app.get("/players/", async (request, response) => {
  const sqlQuery = `SELECT * FROM player_details`;
  const fetchingData = await db.all(sqlQuery);
  console.log(fetchingData);
  response.send(fetchingData);
});

// API 2 Return a specific player based on the player ID
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const sqlQuery = `SELECT * FROM player_details WHERE player_id = ${playerId}`;
  const fetchingData = await db.get(sqlQuery);
  console.log(fetchingData);
  response.send(fetchingData);
});

// API 3 Updates the details of a specific player based on the player ID
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const sqlQuery = `UPDATE player_details SET player_name="Raju" WHERE player_id=${playerId}`;
  const fetchingData = await db.run(sqlQuery);
  console.log(fetchingData);
  response.send("Player Details Updated");
});

// API 4  Returns the match details of a specific match
app.get("/matches/:matchId", async (request, response) => {
  const { matchId } = request.params;
  const sqlQuery = `SELECT * FROM match_details WHERE match_id = ${matchId}`;
  const fetchingData = await db.get(sqlQuery);
  console.log(fetchingData);
  response.send(fetchingData);
});

// API 5 Returns a list of all matches of a player
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const sqlQuery = `SELECT match_details.match_id, match_details.match, match_details.year FROM
   match_details INNER JOIN player_match_score ON match_details.match_id = player_match_score.match_id WHERE player_match_score.player_id = ${playerId}`;
  const fetchingData = await db.all(sqlQuery);
  console.log(fetchingData);
  response.send(fetchingData);
});

// API 6 Returns a list of players of a specific match
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const sqlQuery = `SELECT player_details.player_id, player_details.player_name FROM 
  player_details INNER JOIN player_match_score ON player_details.player_id = player_match_score.player_id WHERE match_id = ${matchId}`;
  const fetchingData = await db.all(sqlQuery);
  console.log(fetchingData);
  response.send(fetchingData);
});

// API 7 Returns the statistic of the total score, fours, sixes of a specific player based on the player ID.
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const sqlQuery = `SELECT player_details.player_id, player_details.player_name,
    sum(player_match_score.score) as totalScore, sum(player_match_score.fours) as totalFours, 
    sum(player_match_score.sixes) as totalSixes FROM player_details INNER JOIN player_match_score ON player_details.player_id = 
    player_match_score.player_id WHERE player_match_score.player_id = ${playerId}
    GROUP BY player_match_score.player_id;`;
  const fetchingData = await db.get(sqlQuery);
  console.log(fetchingData);
  response.send(fetchingData);
});

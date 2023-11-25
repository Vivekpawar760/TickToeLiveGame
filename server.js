const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tic_tac_toe_db'
});

db.connect((err) => {
    if (err) {
        console.log('MySQL Connection Error: ', err);
        throw err;
    }
    console.log('MySQL Connected');
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.post('/addPlayer', (req, res) => {
    const { player_name, unique_value } = req.body;
    const insertPlayerQuery = `INSERT INTO Players (player_name, unique_value) VALUES ('${player_name}', '${unique_value}')`;

    db.query(insertPlayerQuery, (err, result) => {
        if (err) throw err;
        res.send('Player added successfully!');
    });
});

app.get('/getPlayers', (req, res) => {
    const getPlayersQuery = 'SELECT * FROM Players';

    db.query(getPlayersQuery, (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});

// ... other routes for game logic

// Server listening
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

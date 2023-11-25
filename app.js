const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const path = require('path'); // Import the 'path' module

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

// Serve static files (including the index.html file)
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'GameStart.html'));
});

app.get('/gamebord', (req, res) => {
    res.sendFile(path.join(__dirname, 'gamebord.html'));
});

// Routes
app.post('/addPlayer', async (req, res) => {
    const { player_name, unique_value } = req.body;
    // Validate if the player_name and unique_value are provided
    if (!player_name) {
        return res.status(400).send('Player name is required.');
    }
    try {
        console.log("Callllllllllllllll");
        let StoreData = {};
        const result = await fetchPlayers('SELECT * FROM games where player1_id is null or player2_id is null limit 1');
        try {
            if (result.length > 0) {
                let column = 'player1_id';
                if (result[0].player1_id) {
                    column = 'player2_id';
                }
                StoreData = {
                    'playerName': player_name,
                    'gameId': result[0].id,
                    'playerType': column,
                }
                let Insertquery = `UPDATE games SET ${column} = '${player_name}' WHERE id = ${result[0].id}`;
                const game = await fetchPlayers(Insertquery);
            } else {
                let Insertquery = `INSERT INTO games (player1_id) VALUES ('${player_name}')`;
                const game = await fetchPlayers(Insertquery);
                // console.log(game);
                StoreData = {
                    'playerName': player_name,
                    'gameId': game.insertId,
                    'playerType': 'player1_id',
                }
            }
            io.emit('newPlayer', { player_name });
        } catch (error) {
            console.log("eee ", error);
        }
        res.send({ status: '1', message: 'success', data: StoreData });
    } catch (error) {
        console.log("erro", error);
        res.status(500).send(error);
    }
});

app.get('/getPlayers', (req, res) => {
    const getPlayersQuery = 'SELECT * FROM Players';

    db.query(getPlayersQuery, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error fetching players.');
        }

        res.send(result);
    });
});

app.post('/check_waiting_players', async (req, res) => {
    const getPlayersQuery = `SELECT * FROM games where id = ${req.body.gameID}`;

    const gameRunning = await fetchPlayers(getPlayersQuery);

    res.status(200).send({ status: '1', message: 'success', data: gameRunning });
});


const fetchPlayers = (getPlayersQuery) => {
    return new Promise((resolve, reject) => {
        db.query(getPlayersQuery, (err, result) => {
            if (err) {
                console.error(err);
                reject('Error fetching players.');
            } else {
                console.log(result);
                resolve(result);
            }
        });
    });
};
// Socket.IO logic
let waitingPlayer = null;

io.on('connection', (socket) => {
    console.log('A user connected');

    // Listen for player joining the game
    socket.on('joinGame', (playerObj) => {
        console.log("waitingPlayer =================> ", waitingPlayer);
        if (waitingPlayer?.gameID) {
            // If there is a waiting player, start the game
            console.log('on joinGame', playerObj);
            io.emit('startGame', playerObj);
            waitingPlayer = null;
        } else {
            // If no waiting player, set the current player as waiting
            waitingPlayer = playerObj;
            console.log('no waiting', waitingPlayer);
        }
    });

    socket.on('GameMove', (element) => {
        console.log("GameMove", element);
        socket.broadcast.emit('ReciveGameMove', element);
    });

    socket.on('Winnersend', (element) => {
        console.log("Winnersend", element);
        socket.broadcast.emit('WinnerRec', element);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
        socket.broadcast.emit('reset');
    });
});

// Server listening
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

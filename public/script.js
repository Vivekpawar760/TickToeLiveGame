let GameDetails = {};
let playerObj = JSON.parse(localStorage.getItem('playerObj'));
const playerName = playerObj?.playerName;
const gameID = playerObj?.gameID;
const playerType = playerObj?.playerType;

const socket = io();
document.addEventListener('DOMContentLoaded', async function () {
    let waitingMessage = document.getElementById('waiting_message');
    let gameBoard = document.getElementById('gameContainer');
    let matchheading = document.getElementById('matchheading');
    let boxtext = document.getElementsByClassName('boxtext');
    let Heading = document.getElementById('Heading');

    waitingMessage.style.display = 'none';
    gameBoard.style.display = 'none';



    // gameData.player1_id || !gameData.player2_id

    let usernameDisplay = document.getElementById('namde');

    if (gameID) {
        // usernameDisplay?.innerText = playerName;
        (async () => {
            await check_waiting_players(gameID);
        })();
    } else {
        window.location.href = "/";
    }

    socket.on('startGame', (data) => {
        check_waiting_players(data.gameID);
        // waitingMessage.style.display = 'none';
        // gameBoard.style.display = 'block';
        // Heading.innerText = `Hello ${playerName} you are ${playerType == 'player1_id' ? 'x' : 'o'}  
        //                 ${GameDetails.player1_id} vs ${GameDetails.player2_id}`;
    });

    async function check_waiting_players(gameID) {
        waitingMessage.style.display = 'none';
        gameBoard.style.display = 'none';
        // Function to make AJAX call and add the player
        fetch('/check_waiting_players', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ gameID: gameID }),
        }).then(response => {
            if (!response.ok) {
                throw new Error(`Error adding player: ${response.statusText}`);
            }
            return response.json();
        }).then(data => {
            if (data?.data?.length > 0) {
                // console.log(data);
                const gameData = data.data[0];
                GameDetails = data.data[0];
                if (!gameData.player1_id || !gameData.player2_id) {
                    waitingMessage.style.display = 'block';
                } else {
                    gameBoard.style.display = 'block';
                    if (gameBoard) {
                        // console.log(gameBoard);
                        // matchheading.innerHTML = `Match is start ${gameData.player1_id} vs ${gameData.player2_id}`;
                        Heading.innerText = `Hello ${playerName} you are ${playerType == 'player1_id' ? 'x' : 'o'}  
                        ${GameDetails.player1_id} vs ${GameDetails.player2_id}`;
                    }
                }
            } else {
                window.location.href = "/";
            }
        }).catch(error => {
            console.error('Error adding player:', error);
        });
    }



    // console.log("Welcome to Tic Tac Toe");

    let music = new Audio("music.mp3");
    let audioTurn = new Audio("ting.mp3");
    let gameover = new Audio("gameover.mp3");
    let turn = 'x';
    let isgameover = false;

    // Function to change the turn
    const changeTurn = () => {
        return turn === "x" ? "0" : "x";
    };

    // Function to check for a win
    const checkWin = () => {
        console.log("check win or not");
        let wins = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];
        // console.log("boxtext", boxtext);
        wins.forEach(e => {
            if ((boxtext[e[0]].innerText === boxtext[e[1]].innerText) &&
                (boxtext[e[2]].innerText === boxtext[e[1]].innerText) &&
                (boxtext[e[0]].innerText !== "")) {
                Winner(e[0]);
                socket.emit('Winnersend', e[0]);
            }
        });
    };

    // Game Logic
    let boxes = document.getElementsByClassName("box");
    Array.from(boxes).forEach(element => {
        element.addEventListener('click', (e) => {
            // movement(element);
            const clickedIndex = Array.from(boxes).indexOf(e.currentTarget);
            console.log(element);
            let boxtext = element.querySelector('.boxtext');
            if (boxtext.innerText === '') {
                let Player = 'player2_id';
                if (turn == 'x') Player = 'player1_id';
                console.log("Player===>", Player, turn);
                if (!isgameover && playerType == Player) {
                    boxtext.innerText = turn;
                    turn = changeTurn();
                    audioTurn.play();
                    document.getElementsByClassName("info")[0].innerText = turchcheck(turn);
                    socket.emit('GameMove', clickedIndex);
                }
                checkWin();
            }
        });
    });

    socket.on('ReciveGameMove', receivedElement => {
        console.log("================> ", playerName);
        if (checkIsSameGame()) movement(receivedElement);
    });

    socket.on('WinnerRec', receivedElement => {
        // console.log("================> ", receivedElement);
        if (checkIsSameGame()) Winner(receivedElement);
    });

    socket.on('reset', receivedElement => {
        Reset();
    });

    const checkIsSameGame = () => {
        console.log("GameDetails", GameDetails.id);
        return gameID == GameDetails.id;
        return true
    }

    const movement = (index) => {
        console.log("index=======>", boxes[index]);
        let boxtext = boxes[index].querySelector('.boxtext');
        boxtext.innerText = turn;
        turn = changeTurn();
        audioTurn.play();
        document.getElementsByClassName("info")[0].innerText = turchcheck(turn);
    }

    const Winner = (index) => {
        document.querySelector('.info').innerText = boxtext[index].innerText + " Won";
        isgameover = true;
        document.querySelector('.imgbox').getElementsByTagName('img')[0].style.width = "200px";
        // document.querySelector(".line").style.transform = `translate(${e[3]}vw, ${e[4]}vw) rotate(${e[5]}deg)`;
        // document.querySelector(".line").style.width = "20vw";
    }

    const turchcheck = (turn) => {
        return "Turn for " + turn;
    }

    const Reset = () => {
        let boxtexts = document.querySelectorAll('.boxtext');
        Array.from(boxtexts).forEach(element => {
            element.innerText = "";
        });
        turn = "x";
        isgameover = false;
        document.querySelector(".line").style.width = "0vw";
        document.getElementsByClassName("info")[0].innerText = turchcheck(turn);
        document.querySelector('.imgbox').getElementsByTagName('img')[0].style.width = "0px";
    }


    // Add onclick listener to reset button
    document.getElementById('reset').addEventListener('click', () => {
        Reset();
    });


});

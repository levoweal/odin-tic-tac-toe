function Gameboard() {
    const board =[];

    for (let i = 0; i < 3; i++) {
        board[i] = [];
        for (let j = 0; j < 3; j++) {
            board[i].push(Cell());
        }
    }

    const getBoard = () => board;
    const putMark = (cell, playerMark) => board[cell.row][cell.col].addMark(playerMark);

    return { getBoard, putMark };
}

function Cell() {
    let value = '';

    const addMark = (playerMark) => value = playerMark;
    const getValue = () => value;

    return { addMark, getValue };
}

function GameController() {
    //put players as parameters later
    //to use user input for player names

    const board = Gameboard();

    const players = [
        {
            name: 'Player One',
            mark: 'X'
        },
        {
            name: 'Player Two',
            mark: 'O'
        }
    ];

    let currentPlayer = players[0];

    const nextPlayer = () => 
        currentPlayer = (currentPlayer === players[0]) ? players[1] : players[0];

    const getCurrentPlayer = () => currentPlayer;

    const playRound = (cell) => {
        board.putMark(cell, getCurrentPlayer().mark);
        nextPlayer();
    }

    //win condition code goes here

    return { getCurrentPlayer, playRound, getBoard: board.getBoard};
}

function ScreenController() {
    const game = GameController();
    const textDiv = document.querySelector('.text');
    const boardDiv = document.querySelector('.board');

    const updateBoard = () => {
        boardDiv.textContent = '';

        const board = game.getBoard();
        const currentPlayer = game.getCurrentPlayer();

        textDiv.textContent = `hello ${currentPlayer.name}, your urn`;

        board.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const cellBtn = document.createElement('button');
                cellBtn.className = 'cell';
                cellBtn.dataset.row = rowIndex;
                cellBtn.dataset.col = colIndex;
                cellBtn.textContent = cell.getValue();
                boardDiv.appendChild(cellBtn);
            })
        })
    }

    function clickHandler(e) {
        const btn = e.target.closest('.cell');
        if (!btn) return;
        if (btn.textContent) return;

        game.playRound({row: btn.dataset.row, col: btn.dataset.col});
        updateBoard();
    }

    boardDiv.addEventListener('click', clickHandler);
    updateBoard();
}

ScreenController();
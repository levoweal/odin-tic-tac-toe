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
    const boardReset = () => board.forEach(row => row.forEach(cell => cell.valueReset()));

    return { getBoard, putMark, boardReset };
}

function Cell() {
    let value = '';

    const addMark = (playerMark) => value = playerMark;
    const getValue = () => value;
    const valueReset = () => value = '';

    return { addMark, getValue, valueReset };
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

    const winCondition = () => {
        const currentBoard = board.getBoard().map(row => row.map(cell => cell.getValue()));
        const currentMark = getCurrentPlayer().mark;

        const winLines = [];
        for (let r = 0; r < 3; r++) { winLines.push( [[r,0],[r,1],[r,2]] ) };
        for (let c = 0; c < 3; c++) { winLines.push( [[0,c],[1,c],[2,c]] ) };
        winLines.push( [[0,0],[1,1],[2,2]] );
        winLines.push( [[0,2],[1,1],[2,0]] );

        return winLines.some(line => line.every(([r,c]) => 
            currentBoard[r][c] === currentMark));
    };

    const drawCondition = () => {
        const currentBoard = board.getBoard().map(row => row.map(cell => cell.getValue()));
        return currentBoard.every(row => row.every(cell => cell !== '')) && !winCondition();
    }

    const playRound = (cell) => {
        board.putMark(cell, getCurrentPlayer().mark);
        if (winCondition()) return;
        nextPlayer();
    };

    const gameReset = () => {
        board.boardReset();
        currentPlayer = players[0];
    };

    return { 
        getCurrentPlayer, 
        playRound, 
        getBoard: board.getBoard, 
        winCondition,
        drawCondition,
        gameReset 
    };
}

function ScreenController() {
    const game = GameController();
    const textDiv = document.querySelector('.text');
    const boardDiv = document.querySelector('.board');
    const resetBtn = document.querySelector('.reset');

    const updateBoard = () => {
        boardDiv.textContent = '';

        const board = game.getBoard();
        const currentPlayer = game.getCurrentPlayer();

        if (game.winCondition()) {
            textDiv.textContent = `${currentPlayer.name} won the game yipee, gg ez`;
        } else if (game.drawCondition()) {
            textDiv.textContent = `game over, itsa drow, gg both loser`;
        } else {
            textDiv.textContent = `hello ${currentPlayer.name}, your urn`;
        }

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
        if (game.winCondition()) return;
        if (game.drawCondition()) return;

        game.playRound({row: btn.dataset.row, col: btn.dataset.col});
        updateBoard();
    }

    resetBtn.addEventListener('click', () => {
        game.gameReset();
        updateBoard();
    })

    boardDiv.addEventListener('click', clickHandler);
    updateBoard();
}

ScreenController();
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

function GameController(playerOneName, playerTwoName) {
    const board = Gameboard();

    const players = [
        {
            getName: playerOneName,
            mark: 'X'
        },
        {
            getName: playerTwoName,
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

        for (const line of winLines) {
    		if (line.every(([r,c]) => currentBoard[r][c] === currentMark)) return line;
  	    }
        return null;
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
    const textDiv = document.querySelector('.text');
    const boardDiv = document.querySelector('.board');
    const resetBtn = document.querySelector('.reset');

    const winLine = document.createElement('div');
    winLine.className = 'win-line';
    winLine.style.display = 'none';
    boardDiv.appendChild(winLine);

    const drawWinLine = (line) => {
        const [[ar,ac],[br,bc],[cr,cc]] = line;
        winLine.className = 'win-line';
        winLine.style.display = '';

        if (ar === br && br === cr) {
            winLine.classList.add('win-line--row', `row-${ar + 1}`);
        } else if (ac === bc && bc === cc) {
            winLine.classList.add('win-line--col', `col-${ac + 1}`);
        } else {
            winLine.classList.add('win-line--diag', (ar === 0 && ac === 0) ? 'top-left' : 'top-right');
        }
    };

    function InputFactory(id, labelText) {
        const inputDiv = document.createElement('div');

        const label = document.createElement('label');
        label.htmlFor = id;
        label.className = id;

        const span = document.createElement('span');
        span.textContent = labelText;

        const input = document.createElement('input');
        input.type = 'text';
        input.id = id;

        const getValue = () => input.value;

        label.appendChild(span);
        label.appendChild(input);

        const button = document.createElement('button');
        button.className = 'confirm';
        button.textContent = 'Confirm';

        button.addEventListener('click', () => {
            const confirmedName = document.createElement('p');
            confirmedName.textContent = `${labelText}: ${input.value}`;
            confirmedName.className = 'confirmed-name';

            label.remove();
            button.remove();
            inputDiv.appendChild(confirmedName);
        })

        inputDiv.appendChild(label);
        inputDiv.appendChild(button);

        return {inputDiv, getValue};
    }

    const playerOne = InputFactory('player-one', 'Player One');
    const playerTwo = InputFactory('player-two', 'Player Two');

    boardDiv.appendChild(playerOne.inputDiv);
    boardDiv.appendChild(playerTwo.inputDiv);

    const game = GameController(playerOne.getValue, playerTwo.getValue);

    const updateBoard = () => {
        boardDiv.textContent = '';
        winLine.className = 'win-line';
        winLine.style.display = 'none';
        boardDiv.appendChild(winLine);

        const board = game.getBoard();
        const currentPlayer = game.getCurrentPlayer();
        const winningLine = game.winCondition();

        if (winningLine) {
            textDiv.textContent = `${currentPlayer.getName()} won the game yipee, gg ez`;
            drawWinLine(winningLine);
        } else if (game.drawCondition()) {
            textDiv.textContent = `game over, itsa drow, gg both loser`;
        } else {
            textDiv.textContent = `hello ${currentPlayer.getName()}, your urn`;
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

    //updateBoard();
}

ScreenController();
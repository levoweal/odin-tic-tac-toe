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
    const startBtn = document.querySelector('.start');

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
        inputDiv.className = 'input-name';

        const label = document.createElement('label');
        label.htmlFor = id;
        label.className = id;

        const span = document.createElement('span');
        span.textContent = labelText;

        const input = document.createElement('input');
        input.type = 'text';
        input.id = id;
        input.placeholder = labelText;

        let confirmedName = labelText;

        label.appendChild(span);
        label.appendChild(input);

        const confirmButton = document.createElement('button');
        confirmButton.className = 'confirm';
        confirmButton.textContent = 'Confirm';

        confirmButton.addEventListener('click', () => {
            confirmedName = input.value || labelText;

            const confirmedNameEl = document.createElement('p');
            confirmedNameEl.textContent = `${labelText}: ${confirmedName}`;
            confirmedNameEl.className = 'confirmed-name';

            label.remove();
            confirmButton.remove();
            inputDiv.appendChild(confirmedNameEl);
        })

        inputDiv.appendChild(label);
        inputDiv.appendChild(confirmButton);

        const getValue = () => confirmedName;

        const resetInput = () => {
            const confirmedNameEl = inputDiv.querySelector('.confirmed-name');
            if (confirmedNameEl) confirmedNameEl.remove();
            if (!inputDiv.contains(label)) inputDiv.appendChild(label);
            if (!inputDiv.contains(confirmButton)) inputDiv.appendChild(confirmButton);
            input.value = '';
        }

        return {inputDiv, getValue, resetInput};
    }

    const playerOne = InputFactory('player-one', 'Player One');
    const playerTwo = InputFactory('player-two', 'Player Two');

    const game = GameController(playerOne.getValue, playerTwo.getValue);

    const resetBoard = () => {
        boardDiv.textContent = '';
        winLine.className = 'win-line';
        winLine.style.display = 'none';
        boardDiv.appendChild(winLine);
    }

    const updateBoard = () => {
        resetBoard();

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

    function boardHandler(e) {
        const btn = e.target.closest('.cell');
        if (!btn) return;
        if (btn.textContent) return;
        if (game.winCondition()) return;
        if (game.drawCondition()) return;

        game.playRound({row: btn.dataset.row, col: btn.dataset.col});
        updateBoard();
    }

    function fullResetHandler() {
        game.gameReset();
        resetBoard();

        playerOne.resetInput();
        playerTwo.resetInput();
        boardDiv.appendChild(playerOne.inputDiv);
        boardDiv.appendChild(playerTwo.inputDiv);

        resetBtn.textContent = 'Start New Game';
        startBtn.textContent = 'Reset Player Names';
    }

    function resetHandler() {
        game.gameReset();
        updateBoard();

        resetBtn.textContent = 'Reset Current Game';
        startBtn.textContent = 'Start New Game';
    }

    resetBtn.addEventListener('click', resetHandler);
    startBtn.addEventListener('click', fullResetHandler);
    boardDiv.addEventListener('click', boardHandler);

    boardDiv.appendChild(playerOne.inputDiv);
    boardDiv.appendChild(playerTwo.inputDiv);
}

ScreenController();
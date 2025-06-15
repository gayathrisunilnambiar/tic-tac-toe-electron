class SinglePlayerGame {
    constructor() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];

        this.initializeElements();
        this.attachEventListeners();
        this.loadSettings();
    }

    initializeElements() {
        // Window controls
        this.minimizeBtn = document.getElementById('minimize');
        this.closeBtn = document.getElementById('close');

        // Game elements
        this.cells = document.querySelectorAll('.cell');
        this.winScreen = document.getElementById('win-screen');
        this.winImage = document.getElementById('win-image');

        // Game controls
        this.replayBtn = document.getElementById('replay');
        this.returnHomeBtn = document.getElementById('return-home');
        this.playAgainBtn = document.getElementById('play-again');
        this.winReturnHomeBtn = document.getElementById('win-return-home');
    }

    attachEventListeners() {
        // Window controls
        this.minimizeBtn.addEventListener('click', () => window.electron.minimize());
        this.closeBtn.addEventListener('click', () => window.electron.close());

        // Game controls
        this.replayBtn.addEventListener('click', () => this.resetGame());
        this.returnHomeBtn.addEventListener('click', () => window.electron.navigate('index.html'));
        this.playAgainBtn.addEventListener('click', () => this.resetGame());
        this.winReturnHomeBtn.addEventListener('click', () => window.electron.navigate('index.html'));

        // Cell clicks
        this.cells.forEach(cell => {
            cell.addEventListener('click', () => this.handleCellClick(cell));
        });
    }

    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('settings')) || {
            soundEffects: true,
            music: true,
            difficulty: 'easy'
        };
        this.difficulty = settings.difficulty;
    }

    handleCellClick(cell) {
        if (!this.gameActive || this.currentPlayer === 'O') return;

        const index = parseInt(cell.dataset.index);
        if (this.board[index] !== null) return;

        this.makeMove(index);

        if (this.gameActive && this.currentPlayer === 'O') {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    makeMove(index) {
        this.board[index] = this.currentPlayer;
        this.updateBoard();

        if (this.checkWin()) {
            this.handleWin();
        } else if (this.checkDraw()) {
            this.handleDraw();
        } else {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        }
    }

    makeAIMove() {
        const emptyCells = this.board
            .map((cell, index) => cell === null ? index : null)
            .filter(cell => cell !== null);

        if (emptyCells.length > 0) {
            let move;
            switch (this.difficulty) {
                case 'easy':
                    move = this.getRandomMove(emptyCells);
                    break;
                case 'medium':
                    move = Math.random() < 0.5 ? this.getRandomMove(emptyCells) : this.getBestMove();
                    break;
                case 'hard':
                    move = this.getBestMove();
                    break;
                default:
                    move = this.getRandomMove(emptyCells);
            }
            this.makeMove(move);
        }
    }

    getRandomMove(emptyCells) {
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    getBestMove() {
        // Simple AI: Try to win, block opponent, or take center
        const emptyCells = this.board
            .map((cell, index) => cell === null ? index : null)
            .filter(cell => cell !== null);

        // Try to win
        for (const index of emptyCells) {
            this.board[index] = 'O';
            if (this.checkWin()) {
                this.board[index] = null;
                return index;
            }
            this.board[index] = null;
        }

        // Block opponent
        for (const index of emptyCells) {
            this.board[index] = 'X';
            if (this.checkWin()) {
                this.board[index] = null;
                return index;
            }
            this.board[index] = null;
        }

        // Take center if available
        if (this.board[4] === null) return 4;

        // Take a random corner
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(index => this.board[index] === null);
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }

        // Take any available move
        return this.getRandomMove(emptyCells);
    }

    updateBoard() {
        this.cells.forEach((cell, index) => {
            cell.innerHTML = '';
            if (this.board[index] !== null) {
                const img = document.createElement('img');
                img.src = `../assets/${this.board[index]}.svg`;
                cell.appendChild(img);
            }
        });
    }

    checkWin() {
        return this.winningCombinations.some(combination => {
            const [a, b, c] = combination;
            return this.board[a] !== null &&
                this.board[a] === this.board[b] &&
                this.board[a] === this.board[c];
        });
    }

    checkDraw() {
        return this.board.every(cell => cell !== null);
    }

    handleWin() {
        this.gameActive = false;
        this.winImage.src = `../assets/${this.currentPlayer}-wins.svg`;
        this.winScreen.classList.add('active');
    }

    handleDraw() {
        this.gameActive = false;
        this.winImage.src = '../assets/gameboard.svg';
        this.winScreen.classList.add('active');
    }

    resetGame() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.winScreen.classList.remove('active');
        this.updateBoard();
    }
}

// Initialize the game when the window loads
window.addEventListener('load', () => {
    new SinglePlayerGame();
}); 
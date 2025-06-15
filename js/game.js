// renderer/js/game-logic.js

class TicTacToe {
    constructor() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameMode = null;
        this.gameActive = false;
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
        // Screens
        this.startScreen = document.getElementById('start-screen');
        this.modeScreen = document.getElementById('mode-screen');
        this.howToPlayScreen = document.getElementById('how-to-play-screen');
        this.settingsScreen = document.getElementById('settings-screen');
        this.aboutScreen = document.getElementById('about-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.winScreen = document.getElementById('win-screen');

        // Start screen buttons
        this.startGameBtn = document.getElementById('start-game');
        this.howToPlayBtn = document.getElementById('how-to-play');
        this.settingsBtn = document.getElementById('settings');
        this.aboutBtn = document.getElementById('about');

        // Mode selection
        this.singlePlayerBtn = document.getElementById('single-player');
        this.multiPlayerBtn = document.getElementById('multi-player');

        // Return home buttons
        this.modeReturnHomeBtn = document.getElementById('mode-return-home');
        this.instructionsReturnHomeBtn = document.getElementById('instructions-return-home');
        this.settingsReturnHomeBtn = document.getElementById('settings-return-home');
        this.aboutReturnHomeBtn = document.getElementById('about-return-home');

        // Game controls
        this.replayBtn = document.getElementById('replay');
        this.returnHomeBtn = document.getElementById('return-home');
        this.playAgainBtn = document.getElementById('play-again');
        this.winReturnHomeBtn = document.getElementById('win-return-home');

        // Window controls
        this.minimizeBtn = document.getElementById('minimize');
        this.closeBtn = document.getElementById('close');

        // Game elements
        this.cells = document.querySelectorAll('.cell');
        this.winImage = document.getElementById('win-image');

        // Settings elements
        this.soundEffectsCheckbox = document.getElementById('sound-effects');
        this.musicCheckbox = document.getElementById('music');
        this.difficultySelect = document.getElementById('difficulty');
    }

    attachEventListeners() {
        // Start screen navigation
        this.startGameBtn.addEventListener('click', () => {
            console.log('Start game clicked');
            this.showScreen(this.modeScreen);
        });
        this.howToPlayBtn.addEventListener('click', () => {
            console.log('How to play clicked');
            this.showScreen(this.howToPlayScreen);
        });
        this.settingsBtn.addEventListener('click', () => {
            console.log('Settings clicked');
            this.showScreen(this.settingsScreen);
        });
        this.aboutBtn.addEventListener('click', () => {
            console.log('About clicked');
            this.showScreen(this.aboutScreen);
        });

        // Return home buttons
        this.modeReturnHomeBtn.addEventListener('click', () => {
            console.log('Mode return home clicked');
            this.showScreen(this.startScreen);
        });
        this.instructionsReturnHomeBtn.addEventListener('click', () => {
            console.log('Instructions return home clicked');
            this.showScreen(this.startScreen);
        });
        this.settingsReturnHomeBtn.addEventListener('click', () => {
            console.log('Settings return home clicked');
            this.showScreen(this.startScreen);
        });
        this.aboutReturnHomeBtn.addEventListener('click', () => {
            console.log('About return home clicked');
            this.showScreen(this.startScreen);
        });

        // Mode selection
        const singlePlayerOverlay = document.getElementById('single-player');
        const multiPlayerOverlay = document.getElementById('multi-player');

        if (singlePlayerOverlay) {
            singlePlayerOverlay.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Single player clicked');
                window.electron.navigate('singleplayer.html');
            });
        } else {
            console.error('Single player overlay not found');
        }

        if (multiPlayerOverlay) {
            multiPlayerOverlay.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Multi player clicked');
                window.electron.navigate('multiplayer.html');
            });
        } else {
            console.error('Multi player overlay not found');
        }

        // Game controls
        this.replayBtn.addEventListener('click', () => this.resetGame());
        this.returnHomeBtn.addEventListener('click', () => this.showScreen(this.startScreen));
        this.playAgainBtn.addEventListener('click', () => this.resetGame());
        this.winReturnHomeBtn.addEventListener('click', () => this.showScreen(this.startScreen));

        // Window controls
        this.minimizeBtn.addEventListener('click', () => {
            console.log('Minimize clicked');
            window.electron.minimize();
        });
        this.closeBtn.addEventListener('click', () => {
            console.log('Close clicked');
            window.electron.close();
        });

        // Cell clicks
        this.cells.forEach(cell => {
            cell.addEventListener('click', () => this.handleCellClick(cell));
        });

        // Settings changes
        this.soundEffectsCheckbox.addEventListener('change', () => this.saveSettings());
        this.musicCheckbox.addEventListener('change', () => this.saveSettings());
        this.difficultySelect.addEventListener('change', () => this.saveSettings());
    }

    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('settings')) || {
            soundEffects: true,
            music: true,
            difficulty: 'easy'
        };

        this.soundEffectsCheckbox.checked = settings.soundEffects;
        this.musicCheckbox.checked = settings.music;
        this.difficultySelect.value = settings.difficulty;
    }

    saveSettings() {
        const settings = {
            soundEffects: this.soundEffectsCheckbox.checked,
            music: this.musicCheckbox.checked,
            difficulty: this.difficultySelect.value
        };
        localStorage.setItem('settings', JSON.stringify(settings));
    }

    startGame(mode) {
        this.gameMode = mode;
        this.gameActive = true;
        this.currentPlayer = 'X';
        this.board = Array(9).fill(null);
        this.showScreen(this.gameScreen);
        this.updateBoard();
    }

    handleCellClick(cell) {
        if (!this.gameActive) return;

        const index = parseInt(cell.dataset.index);
        if (this.board[index] !== null) return;

        this.makeMove(index);

        if (this.gameMode === 'single' && this.gameActive && this.currentPlayer === 'O') {
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
            const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.makeMove(randomIndex);
        }
    }

    updateBoard() {
        this.cells.forEach((cell, index) => {
            cell.innerHTML = '';
            if (this.board[index] !== null) {
                const img = document.createElement('img');
                img.src = `assets/${this.board[index]}.svg`;
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
        this.winImage.src = `assets/${this.currentPlayer}-wins.svg`;
        this.showScreen(this.winScreen);
    }

    handleDraw() {
        this.gameActive = false;
        this.winImage.src = 'assets/gameboard.svg';
        this.showScreen(this.winScreen);
    }

    resetGame() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.showScreen(this.gameScreen);
        this.updateBoard();
    }

    showScreen(screen) {
        [
            this.startScreen,
            this.modeScreen,
            this.howToPlayScreen,
            this.settingsScreen,
            this.aboutScreen,
            this.gameScreen,
            this.winScreen
        ].forEach(s => {
            s.classList.remove('active');
        });
        screen.classList.add('active');
    }
}

// Initialize the game when the window loads
window.addEventListener('load', () => {
    new TicTacToe();
});

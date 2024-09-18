document.addEventListener('DOMContentLoaded', () => {
    const playAiBtn = document.getElementById('play-ai');
    const playMultiplayerBtn = document.getElementById('play-multiplayer');
    const markerNote = document.getElementById('marker-note');
    const gameBox = document.getElementById('game-box');
    const selectXBtn = document.getElementById('select-x');
    const selectOBtn = document.getElementById('select-o');
    const instructionsBtn = document.getElementById('instructions');
    const resetGameBtn = document.getElementById('reset-game');
    const instructionsPopup = document.getElementById('instructions-popup');
    const closeInstructionsBtn = document.getElementById('close-instructions');
    const aiResultsContainer = document.getElementById('ai-results-container');
    const aiResultsTableBody = document.getElementById('ai-results-table').getElementsByTagName('tbody')[0];
    



    let selectedMarker = '';
    let aiMarker = '';
    let gameMode = '';
    let board = Array(9).fill(null);
    let currentPlayer = '';
    let gameOver = false;
    let matchCount = 0;
    let isUserInputAllowed = true; // Variable to track if user input is allowed


    const showAiResultsContainer = () => {
        const aiContainer = document.getElementById('ai-results-container');
        
        // Add both the show and ai-flash classes
        aiContainer.classList.add('show', 'ai-flash');
        
        // After 1 second (matching the animation duration), remove the ai-flash class
        setTimeout(() => {
            aiContainer.classList.remove('ai-flash'); 
        }, 1000); 
    };
    
    const hideAiResultsContainer = () => {
        const aiContainer = document.getElementById('ai-results-container');
        
        // Remove the show class to hide the container with a smooth transition
        aiContainer.classList.remove('show');
    };
    

    const resetGame = () => {
        board = Array(9).fill(null);
        gameOver = false;
        createGameBoard();
        
        if (gameMode === 'ai') {
            selectXBtn.style.display = 'inline';
            selectOBtn.style.display = 'inline';
            markerNote.textContent = `Selected Marker: ${selectedMarker || 'None'}`;
            showAiResultsContainer();
        } else if (gameMode === 'multiplayer') {
            selectXBtn.style.display = 'none';
            selectOBtn.style.display = 'none';
            const player1Marker = selectedMarker || 'O'; // Change default to 'O'
            const player2Marker = player1Marker === 'O' ? 'X' : 'O'; // Change default to 'X'
            markerNote.textContent = `Player1: ${player1Marker} ; Player2: ${player2Marker}`;
            hideAiResultsContainer();
        } else {
            selectXBtn.style.display = 'none';
            selectOBtn.style.display = 'none';
            markerNote.textContent = `Selected Marker: ${selectedMarker || 'None'}`;
            hideAiResultsContainer();
        }
    };
    

// Load the sound files
const xSound = new Audio('music/X.mp3');  // Ensure to replace with the correct path
const oSound = new Audio('music/O.mp3');  // Ensure to replace with the correct path

// Function to play sounds based on the marker
const playSound = (marker) => {
    if (marker === 'X') {
        xSound.play();  // Play sound when X is selected
    } else if (marker === 'O') {
        oSound.play();  // Play sound when O is selected
    }
};

// Load the sound file
const buttonClickSound = new Audio('music/box.mp3'); // Replace with your sound file path

// Function to play the sound
const playButtonClickSound = () => {
    buttonClickSound.play();
};

// Attach event listeners to the buttons and elements
document.getElementById('play-ai').addEventListener('click', playButtonClickSound);
document.getElementById('play-multiplayer').addEventListener('click', playButtonClickSound);
document.getElementById('select-x').addEventListener('click', playButtonClickSound);
document.getElementById('select-o').addEventListener('click', playButtonClickSound);
document.getElementById('reset-game').addEventListener('click', playButtonClickSound);
document.getElementById('instructions').addEventListener('click', playButtonClickSound);

    
    const createGameBoard = () => {
        gameBox.innerHTML = '';
        board.forEach((_, index) => {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = index;
            cell.addEventListener('click', () => handleCellClick(cell));
            gameBox.appendChild(cell);
        });
    
        // Ensure cells are clickable based on the selected mode
        if (gameMode) {
            const cells = document.querySelectorAll('.cell');
            cells.forEach(cell => cell.addEventListener('click', () => handleCellClick(cell)));
        }
    };

    const triggerShadowEffect = (result) => {
        const aiContainer = document.getElementById('ai-results-container');
        
        // Remove any previous shadow classes
        aiContainer.classList.remove('ai-loss-shadow', 'ai-win-shadow', 'ai-draw-shadow');
        
        // Check if container is visible
        if (window.getComputedStyle(aiContainer).display !== 'none') {
            if (result === 'AI') {
                aiContainer.classList.add('ai-loss-shadow'); // Add shadow effect for AI loss
            } else if (result === selectedMarker) {
                aiContainer.classList.add('ai-win-shadow'); // Add shadow effect for user win
            } else if (result === 'Draw') {
                console.log('Draw detected!'); // Log for debugging
                aiContainer.classList.add('ai-draw-shadow'); // Add shadow effect for draw
            }
    
            // Log to check if the shadow class is added
            console.log('Shadow effect applied:', result);
    
            // Remove the shadow effect after a delay
            setTimeout(() => {
                aiContainer.classList.remove('ai-loss-shadow', 'ai-win-shadow', 'ai-draw-shadow');
            }, 2000); // Adjust the duration if needed
        } else {
            console.log('AI container is not visible');
        }
    };

    const aiMove = () => {
        let bestMove = getBestMove();
        board[bestMove.index] = aiMarker;
        const aiCell = document.querySelector(`div[data-index="${bestMove.index}"]`);
        aiCell.textContent = aiMarker;
        aiCell.classList.add('cell');
        aiCell.classList.add('show'); // Trigger animation
    
        // Play sound for AI's marker (X or O)
        setTimeout(() => {
            if (aiMarker === 'X') {
                xSound.play();
            } else if (aiMarker === 'O') {
                oSound.play();
            }
        }, 100); // Adjust timing as needed
    
        if (checkWin(aiMarker)) {
            setTimeout(() => {
                showPopup('AI wins!');
                updateAiResultsTable('AI');
                triggerShadowEffect('AI');
                resetGame();
            }, 100);
            gameOver = true;
        } else if (board.every(cell => cell)) {
            setTimeout(() => {
                showPopup('It\'s a draw!');
                updateAiResultsTable('Draw');
                triggerShadowEffect('Draw');
                resetGame();
            }, 100);
            gameOver = true;
        }
        
    
        if (!gameOver) {
            currentPlayer = selectedMarker;
        }
    };
    
    const getBestMove = () => {
        const emptyIndices = board.reduce((acc, cell, index) => {
            if (!cell) acc.push(index);
            return acc;
        }, []);

        let bestMove = null;
        let bestScore = -Infinity;

        emptyIndices.forEach(index => {
            board[index] = aiMarker;
            let score = minimax(board, 0, false);
            board[index] = null;

            if (score > bestScore) {
                bestScore = score;
                bestMove = { index };
            }
        });

        return bestMove;
    };

    const minimax = (board, depth, isMaximizing) => {
        if (checkWin(aiMarker)) return 10 - depth;
        if (checkWin(selectedMarker)) return depth - 10;
        if (board.every(cell => cell)) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            board.forEach((cell, index) => {
                if (!cell) {
                    board[index] = aiMarker;
                    let score = minimax(board, depth + 1, false);
                    board[index] = null;
                    bestScore = Math.max(score, bestScore);
                }
            });
            return bestScore;
        } else {
            let bestScore = Infinity;
            board.forEach((cell, index) => {
                if (!cell) {
                    board[index] = selectedMarker;
                    let score = minimax(board, depth + 1, true);
                    board[index] = null;
                    bestScore = Math.min(score, bestScore);
                }
            });
            return bestScore;
        }
    };

    const checkWin = (player) => {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], 
            [0, 3, 6], [1, 4, 7], [2, 5, 8], 
            [0, 4, 8], [2, 4, 6]
        ];

        return winPatterns.some(pattern => {
            return pattern.every(index => board[index] === player);
        });
    };

    const updateAiResultsTable = (winner) => {
        matchCount++;
        const row = document.createElement('tr');
        const matchCell = document.createElement('td');
        const winnerCell = document.createElement('td');
        matchCell.textContent = matchCount;
        winnerCell.textContent = winner;
        row.appendChild(matchCell);
        row.appendChild(winnerCell);
        aiResultsTableBody.appendChild(row);
    };

    let popupVisible = false;

const showPopup = (message) => {
    if (popupVisible) return; // Prevent multiple popups

    popupVisible = true;
    
    const popup = document.createElement('div');
    popup.className = 'popup popup-show'; // Ensure you have a .popup class in your CSS
    popup.textContent = message;
    
    document.body.appendChild(popup);
    
    // Automatically remove the popup after a few seconds
    setTimeout(() => {
        popup.classList.remove('popup-show'); // Start hiding animation
        setTimeout(() => {
            popup.remove();
            popupVisible = false; // Allow new popups
        }, 400); // Match the duration of the hiding animation
    }, 3000); // Adjust the timeout as needed
};

const handleCellClick = (cell) => {
    const index = cell.dataset.index;

    // If the box is already filled, game is over, or input is not allowed, return early
    if (board[index] || gameOver || !isUserInputAllowed) return;

    // Check if the game mode is not selected
    if (!gameMode) {
        showPopup('Please select a game mode before making a move.');
        triggerShrinkEffect(); // Trigger shrink effect on the container
        return;
    }

    // Check if a marker is not selected in AI mode
    if (gameMode === 'ai' && !selectedMarker) {
        showPopup('Please select a marker before making a move.');
        triggerShrinkEffect(); // Trigger shrink effect on the container
        return;
    }

    // Multiplayer mode logic
    if (gameMode === 'multiplayer') {
        if (currentPlayer === '' && board.every(cell => cell === null)) {
            currentPlayer = 'O'; // First move is always 'O'
        } else if (currentPlayer === 'O') {
            currentPlayer = 'X';
        } else if (currentPlayer === 'X') {
            currentPlayer = 'O';
        }
    }

    board[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add('cell');
    cell.classList.add('show'); // Trigger animation

    // Play sound for X or O with slight delay to match animation
    setTimeout(() => {
        if (currentPlayer === 'X') {
            xSound.play();
        } else if (currentPlayer === 'O') {
            oSound.play();
        }
    }, 100); // Adjust timing as needed

    if (checkWin(currentPlayer)) {
        setTimeout(() => {
            showPopup(`${currentPlayer} wins!`);
            if (gameMode === 'ai') {
                updateAiResultsTable(currentPlayer);
                triggerShadowEffect(currentPlayer);
            }
            resetGame();
        }, 100);
        gameOver = true;
        return;
    }

    if (board.every(cell => cell)) {
        setTimeout(() => {
            showPopup('It\'s a draw!');
            if (gameMode === 'ai') {
                updateAiResultsTable('Draw');
                triggerShadowEffect('Draw');
            }
            resetGame();
        }, 100);
        gameOver = true;
        return;
    }

    if (gameMode === 'ai' && !gameOver) {
        isUserInputAllowed = false;
        setTimeout(() => {
            aiMove();
            isUserInputAllowed = true;
        }, 800);
    }
};

const triggerShrinkEffect = () => {
    const container = document.getElementById('container');

    // Save the current box-shadow style
    const originalBoxShadow = container.style.boxShadow;

    // Add the shrinking and red shadow classes
    container.classList.add('shrink', 'red-shadow');

    // After 2 seconds, remove the shrinking and red shadow classes and restore the original shadow
    setTimeout(() => {
        container.classList.remove('shrink', 'red-shadow');
        container.style.boxShadow = originalBoxShadow; // Restore the original shadow
    }, 2000);
};



const triggerShakeEffect = (button) => {
    button.classList.add('shake');
    setTimeout(() => {
        button.classList.remove('shake');
    }, 500);
};

    
    selectXBtn.addEventListener('click', () => {
        if (gameMode === 'ai') {
            selectedMarker = 'X';
            aiMarker = 'O';
            currentPlayer = 'X';
            markerNote.textContent = `Selected Marker: X; AI: O`;
            resetGame();
        } else {
            triggerShakeEffect(selectXBtn);
        }
    });
    
    selectOBtn.addEventListener('click', () => {
        if (gameMode === 'ai') {
            selectedMarker = 'O';
            aiMarker = 'X';
            currentPlayer = 'O';
            markerNote.textContent = `Selected Marker: O; AI: X`;
            resetGame();
        } else {
            triggerShakeEffect(selectOBtn);
        }
    });

    playAiBtn.addEventListener('click', () => {
        gameMode = 'ai';
        markerNote.textContent = `Selected Marker: ${selectedMarker || 'None'}`;
        showAiResultsContainer();
        matchCount = 0; // Reset the match count when entering AI mode
        resetGame();
    });

    playMultiplayerBtn.addEventListener('click', () => {
        gameMode = 'multiplayer';
        const player1Marker = selectedMarker || 'X';
        const player2Marker = player1Marker === 'X' ? 'O' : 'X';
        markerNote.textContent = `Player1: ${player1Marker} ; Player2: ${player2Marker}`;
        hideAiResultsContainer();
        matchCount = 0; // Reset the match count when switching to multiplayer
        resetGame();
    });

    selectXBtn.addEventListener('click', () => {
        if (gameMode === 'ai') {
            selectedMarker = 'X';
            aiMarker = 'O';
            currentPlayer = 'X';
            markerNote.textContent = `Selected Marker: X; AI: O`;
            resetGame();
        }
    });
    
    selectOBtn.addEventListener('click', () => {
        if (gameMode === 'ai') {
            selectedMarker = 'O';
            aiMarker = 'X';
            currentPlayer = 'O';
            markerNote.textContent = `Selected Marker: O; AI: X`;
            resetGame();
        }
    });

    resetGameBtn.addEventListener('click', () => {
        resetGame();
        aiResultsTableBody.innerHTML = '';
        if (gameMode === 'ai') {
            matchCount = 0; // Reset the match count
        }
    });

    const triggerColorChange = () => {
        container.classList.add('color-change');
        setTimeout(() => {
            container.classList.remove('color-change');
        }, 1000); // Match the duration of the animation
    };
    
    selectXBtn.addEventListener('click', () => {
        if (gameMode !== 'ai') { // Check if not in AI mode
            triggerColorChange();
        }
        if (gameMode === 'ai') {
            selectedMarker = 'X';
            aiMarker = 'O';
            currentPlayer = 'X';
            markerNote.textContent = `Selected Marker: X; AI: O`;
            resetGame();
        }
    });
    
    selectOBtn.addEventListener('click', () => {
        if (gameMode !== 'ai') { // Check if not in AI mode
            triggerColorChange();
        }
        if (gameMode === 'ai') {
            selectedMarker = 'O';
            aiMarker = 'X';
            currentPlayer = 'O';
            markerNote.textContent = `Selected Marker: O; AI: X`;
            resetGame();
        }
    });
    
    instructionsBtn.addEventListener('click', () => {
        instructionsPopup.style.display = 'block';
    });

    closeInstructionsBtn.addEventListener('click', () => {
        instructionsPopup.style.display = 'none';
    });

    resetGameBtn.addEventListener('click', () => {
        resetGame();
        aiResultsTableBody.innerHTML = '';
    });

    createGameBoard();
    addColorBoxShadow(); // Call the function to add the box shadow
});
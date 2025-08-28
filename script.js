const resetBtn = document.getElementById("reset");
const startBtn = document.getElementById("start");
const modeInputs = document.querySelectorAll('input[name="mode"]');
const symbolInputs = document.querySelectorAll('input[name="symbol"]');
const turnIndicator = document.getElementById("turn-indicator");
const playerScoreSpan = document.getElementById("player-score");
const opponentScoreSpan = document.getElementById("opponent-score");
const drawScoreSpan = document.getElementById("draw-score");
const player1Input = document.getElementById("player1-name");
const player2Input = document.getElementById("player2-name");
const boardSizeSelect = document.getElementById("board-size");
const gameBoard = document.getElementById("game-board");
const timerDisplay = document.getElementById("timer");


// game variables
let size = 3; 
let board = [];
let cells = [];
let playerSymbol = "X";
let aiSymbol = "O";
let currentPlayer = "X";
let gameOver = false;
let mode = "ai";

let turnTime = 10; 
let timerInterval;
let timerRunning = false;

let playerScore = 0;
let opponentScore = 0;
let drawScore = 0;


// get the name of the current player
function getPlayerName(symbol) {
  if (mode === "friend") return symbol === "X" ? player1Input.value : player2Input.value;
  return symbol === playerSymbol ? player1Input.value : player2Input.value;
}


// update the scoreboard
function updateScore(winner) {
  if (winner === playerSymbol) {
    playerScore++;
    playerScoreSpan.textContent = `Player: ${playerScore}`;
  } else if (winner === aiSymbol || (mode === "friend" && winner !== "Draw")) {
    opponentScore++;
    opponentScoreSpan.textContent = `Opponent: ${opponentScore}`;
  } else if (winner === "Draw") {
    drawScore++;
    drawScoreSpan.textContent = `Draws: ${drawScore}`;
  }
}


// show whose turn it is
function updateTurnIndicator() {
  if (!gameOver) {
    turnIndicator.textContent = `Current Turn: ${getPlayerName(currentPlayer)}`;
  } else {
    turnIndicator.textContent = `Game Over`;
  }
}


// start the timer
function startTimer() {
  clearInterval(timerInterval);
  let timeLeft = turnTime;
  timerDisplay.textContent = `Time left: ${timeLeft}s`;

  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `Time left: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      switchTurn();
    }
  }, 1000);

  timerRunning = true;
}


// switch turns
function switchTurn() {
  if(gameOver) return;

  if(mode === "ai" && currentPlayer === playerSymbol){
    currentPlayer = aiSymbol;
    updateTurnIndicator();
    setTimeout(aiMove, 300);
  } else {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    updateTurnIndicator();
    if(mode === "ai" && currentPlayer === aiSymbol) setTimeout(aiMove, 300);
  }
  startTimer();
}


// highlight the winner
function highlightWinner(combo) {
  combo.forEach(i => cells[i].classList.add("winner"));
}


// add effects
function addHoverEffect() {
  cells.forEach(cell => {
    cell.addEventListener("mouseenter", () => {
      if (!board[cell.dataset.index] && !gameOver) {
        cell.setAttribute("data-hover", currentPlayer);
      }
    });
    cell.addEventListener("mouseleave", () => {
      cell.removeAttribute("data-hover");
    });
  });
}


// create the game board size
function createBoard() {
  board = Array(size * size).fill("");
  gameBoard.innerHTML = "";
  gameBoard.style.gridTemplateColumns = `repeat(${size}, 100px)`;

  for (let i = 0; i < size * size; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    gameBoard.appendChild(cell);
    cell.addEventListener("click", handleClick);
  }

  cells = document.querySelectorAll(".cell");
  addHoverEffect();
}

// check if there is a winner
function checkWinner() {
  for (let r = 0; r < size; r++) {
    let row = board.slice(r*size, r*size+size);
    if (row.every(val => val && val === row[0])) return {winner: row[0], combo: [...Array(size)].map((_,i)=> r*size+i)};
  }
  for (let c = 0; c < size; c++) {
    let col = Array(size).fill().map((_,i) => board[i*size+c]);
    if (col.every(val => val && val === col[0])) return {winner: col[0], combo: [...Array(size)].map((_,i)=> i*size+c)};
  }
  let diag1 = Array(size).fill().map((_,i) => board[i*size+i]);
  if (diag1.every(val => val && val === diag1[0])) return {winner: diag1[0], combo: [...Array(size)].map((_,i)=> i*size+i)};
  let diag2 = Array(size).fill().map((_,i) => board[i*size + (size-1-i)]);
  if (diag2.every(val => val && val === diag2[0])) return {winner: diag2[0], combo: [...Array(size)].map((_,i)=> i*size + (size-1-i))};

  return board.includes("") ? null : {winner: "Draw", combo: []};
}


// place X or O on the board
function makeMove(index, player) {
  board[index] = player;
  cells[index].textContent = player;
  cells[index].classList.add(player);
}


// making AI move
function aiMove() {
  const emptyCells = board.map((val,i) => val === "" ? i : null).filter(v => v !== null);
  if (emptyCells.length === 0) return;

  for (let i of emptyCells) {
    board[i] = aiSymbol;
    if (checkWinner()?.winner === aiSymbol) {
      makeMove(i, aiSymbol);
      finalizeAIMove();
      return;
    }
    board[i] = "";
  }
// block player from winning
  for (let i of emptyCells) {
    board[i] = playerSymbol;
    if (checkWinner()?.winner === playerSymbol) {
      board[i] = "";
      makeMove(i, aiSymbol);
      finalizeAIMove();
      return;
    }
    board[i] = "";
  }

  const center = Math.floor(board.length/2);
  if (board[center] === "") { makeMove(center, aiSymbol); finalizeAIMove(); return; }

  const corners = [0, size-1, board.length-size, board.length-1].filter(i => board[i]==="");
  if (corners.length>0) { makeMove(corners[Math.floor(Math.random()*corners.length)], aiSymbol); finalizeAIMove(); return; }

  const sides = emptyCells.filter(i => !corners.includes(i) && i!==center);
  if (sides.length>0) { makeMove(sides[Math.floor(Math.random()*sides.length)], aiSymbol); finalizeAIMove(); }
}

function finalizeAIMove() {
  const result = checkWinner();
  if(result){
    highlightWinner(result.combo);
    updateScore(result.winner);
    if(result.winner !== "Draw") confetti({ particleCount: 100, spread: 70, origin: { y:0.6 } });
    setTimeout(()=>alert(result.winner === "Draw" ? "It's a draw!" : `${getPlayerName(result.winner)} wins!`),100);
    gameOver=true;
    clearInterval(timerInterval);
  } else {
    currentPlayer = playerSymbol; 
    updateTurnIndicator();
    startTimer();
  }
}

function handleClick(e) {
  const index = e.target.dataset.index;
  if(!board[index] && !gameOver && timerRunning){
    makeMove(index,currentPlayer);
    const result = checkWinner();
    if(result){
      highlightWinner(result.combo);
      updateScore(result.winner);
      if(result.winner !== "Draw") confetti({ particleCount: 100, spread: 70, origin: { y:0.6 } });
      setTimeout(()=>alert(result.winner === "Draw" ? "It's a draw!" : `${getPlayerName(result.winner)} wins!`),100);
      gameOver=true;
      clearInterval(timerInterval);
      timerRunning = false;
      return;
    }
// switch turns
    if(mode==="ai"){
      currentPlayer=aiSymbol;
      updateTurnIndicator();
      setTimeout(aiMove,300);
    } else if(mode==="friend"){
      currentPlayer = currentPlayer==="X" ? "O":"X";
      updateTurnIndicator();
    }
    startTimer();
  }
}
// reset timer to start a new game
function resetGame(){
  createBoard();
  currentPlayer = playerSymbol; 
  gameOver=false;
  updateTurnIndicator();
  clearInterval(timerInterval);
  timerRunning = false;
}

modeInputs.forEach(input => input.addEventListener("change",()=>{
  mode=input.value;
  resetGame();
}));

symbolInputs.forEach(input => input.addEventListener("change",()=>{
  playerSymbol=input.value;
  aiSymbol = playerSymbol==="X"?"O":"X";
  currentPlayer = playerSymbol; 
  resetGame();
}));

boardSizeSelect.addEventListener("change",()=>{size=parseInt(boardSizeSelect.value); resetGame();});

startBtn.addEventListener("click", () => {
  if(!timerRunning && !gameOver){
    startTimer();
    updateTurnIndicator();
  }
});

createBoard();
updateTurnIndicator();
resetBtn.addEventListener("click", resetGame);









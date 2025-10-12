// elements
const gameboard = document.querySelector("#gameboard")
const infoDisplay = document.querySelector("#info")
const startCells = ["", "", "", "", "", "", "", "", ""]
let go = "circle"

infoDisplay.textContent = "Circle goes first"

function createBoard() {
  startCells.forEach((_cell, index) => {
    const cellElement = document.createElement("div")
    cellElement.classList.add("square")
    cellElement.id = index
    cellElement.addEventListener("click", addGo)
    gameboard.append(cellElement)
  })
}
createBoard()

// addGo
function addGo(e) {
  const goDisplay = document.createElement("div")
  goDisplay.classList.add(go)
  e.target.append(goDisplay)
  go = go === "circle" ? "cross" : "circle"
  infoDisplay.textContent = "it is now " + go + "'s go"
  e.target.removeEventListener("click", addGo)
  checkScore()
}

// check score
function checkScore() {
  const allSquares = document.querySelectorAll(".square")
  const winningCombos = [
    [0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]
  ]

  let winner = false

  winningCombos.forEach(array => {
    const circleWins = array.every(cell => 
      allSquares[cell].firstChild?.classList.contains("circle"))
    if (circleWins) {
      infoDisplay.textContent = "Circle Wins!"
      allSquares.forEach(square => square.replaceWith(square.cloneNode(true))) //remove any event listeners from all of the squares
      winner = true
  }
  })

    winningCombos.forEach(array => {
    const crossWins = array.every(cell => 
      allSquares[cell].firstChild?.classList.contains("cross"))
    if (crossWins) {
      infoDisplay.textContent = "Cross Wins!"
      allSquares.forEach(square => square.replaceWith(square.cloneNode(true))) //remove any event listeners from all of the squares
      winner = true
  }
  })

  // draw game
  if (!winner && [...allSquares].every(square => square.firstChild)) {
    infoDisplay.textContent = "It's a Draw!"
  }
}

// restart button
const restartButton = document.querySelector("#restart")

restartButton.addEventListener("click", restartGame)

function restartGame() {
  gameboard.innerHTML = "" // clear board
  // reset who goes first
  go = "circle"
  infoDisplay.textContent = "Circle goes first"
  // refreash board
  createBoard()
}



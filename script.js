// Game configuration and state variables
const GOAL_CANS = 25;
const GAME_TIME = 30;
let currentCans = 0;
let score = 0;
let secondsLeft = GAME_TIME;
let gameActive = false;
let spawnInterval;
let timerInterval;

const grid = document.querySelector('.game-grid');
const currentCansElement = document.getElementById('current-cans');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const feedbackElement = document.getElementById('feedback');
const startButton = document.getElementById('start-game');

function createGrid() {
  grid.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    grid.appendChild(cell);
  }
}

function updateStats() {
  currentCansElement.textContent = currentCans;
  scoreElement.textContent = score;
  timerElement.textContent = secondsLeft;
}

function showFeedback(message, type = 'info') {
  feedbackElement.textContent = message;
  feedbackElement.className = `feedback ${type}`;
}

function createWaterCanCell() {
  const cells = document.querySelectorAll('.grid-cell');
  const randomCell = cells[Math.floor(Math.random() * cells.length)];
  randomCell.innerHTML = `
    <div class="water-can-wrapper">
      <div class="water-can"></div>
    </div>
  `;
}

function createObstacleCell() {
  const cells = document.querySelectorAll('.grid-cell');
  const randomCell = cells[Math.floor(Math.random() * cells.length)];
  randomCell.innerHTML = '<div class="obstacle" aria-label="Obstacle">!</div>';
}

function spawnItem() {
  if (!gameActive) return;

  const cells = document.querySelectorAll('.grid-cell');
  cells.forEach(cell => (cell.innerHTML = ''));

  const shouldSpawnObstacle = Math.random() < 0.2;
  const targetCell = cells[Math.floor(Math.random() * cells.length)];

  if (shouldSpawnObstacle) {
    targetCell.innerHTML = '<div class="obstacle" aria-label="Obstacle">!</div>';
  } else {
    targetCell.innerHTML = `
      <div class="water-can-wrapper">
        <div class="water-can"></div>
      </div>
    `;
  }
}

function handleCellClick(event) {
  const cell = event.target.closest('.grid-cell');
  if (!cell || !gameActive) return;

  if (cell.querySelector('.water-can')) {
    currentCans += 1;
    score += 100;
    updateStats();

    if (currentCans >= GOAL_CANS) {
      endGame(true);
      return;
    }

    const milestones = [5, 10, 15, 20];
    if (milestones.includes(currentCans)) {
      score += 50;
      updateStats();
      showFeedback(`Milestone reached! ${currentCans} water cans collected. Bonus points earned!`, 'success');
    } else {
      showFeedback('Fresh water secured! Keep going!', 'success');
    }

    spawnItem();
  } else if (cell.querySelector('.obstacle')) {
    score = Math.max(0, score - 40);
    secondsLeft = Math.max(0, secondsLeft - 3);
    updateStats();
    showFeedback('That obstacle cost you time and points. Stay sharp!', 'danger');
    spawnItem();
  }
}

function tickTimer() {
  if (!gameActive) return;

  secondsLeft -= 1;
  updateStats();

  if (secondsLeft <= 0) {
    endGame(false);
  }
}

function startGame() {
  clearInterval(spawnInterval);
  clearInterval(timerInterval);

  currentCans = 0;
  score = 0;
  secondsLeft = GAME_TIME;
  gameActive = true;
  startButton.textContent = 'Restart Game';
  createGrid();
  updateStats();
  showFeedback('Collect water cans quickly and avoid obstacles!', 'info');
  spawnItem();
  spawnInterval = setInterval(spawnItem, 1000);
  timerInterval = setInterval(tickTimer, 1000);
}

function endGame(won) {
  gameActive = false;
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  createGrid();
  updateStats();

  if (won) {
    showFeedback(`Mission complete! You collected ${currentCans} water cans and scored ${score} points.`, 'success');
  } else {
    showFeedback('Time is up! The mission ended before you reached the goal.', 'danger');
  }
}

createGrid();
updateStats();
showFeedback('Press start to begin your rescue mission.', 'info');

grid.addEventListener('click', handleCellClick);
startButton.addEventListener('click', startGame);

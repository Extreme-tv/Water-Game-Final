// Game configuration and state variables
const DIFFICULTIES = {
  easy: { label: 'Easy', goal: 15, time: 45, obstacleChance: 0.12, spawnInterval: 1400, bonus: 25 },
  normal: { label: 'Normal', goal: 20, time: 30, obstacleChance: 0.2, spawnInterval: 1000, bonus: 50 },
  hard: { label: 'Hard', goal: 25, time: 20, obstacleChance: 0.3, spawnInterval: 700, bonus: 75 }
};

let currentDifficulty = 'normal';
let currentDifficultyConfig = DIFFICULTIES[currentDifficulty];
let currentCans = 0;
let score = 0;
let secondsLeft = currentDifficultyConfig.time;
let gameActive = false;
let spawnInterval;
let timerInterval;

const grid = document.querySelector('.game-grid');
const currentCansElement = document.getElementById('current-cans');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const goalDisplayElement = document.getElementById('goal-display');
const goalCountElement = document.getElementById('goal-count');
const feedbackElement = document.getElementById('feedback');
const startButton = document.getElementById('start-game');
const collectSound = document.getElementById('collect-sound');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');

function createGrid() {
  grid.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    grid.appendChild(cell);
  }
}

function updateDifficultyUI() {
  currentDifficultyConfig = DIFFICULTIES[currentDifficulty];
  goalDisplayElement.textContent = currentDifficultyConfig.goal;
  goalCountElement.textContent = currentDifficultyConfig.goal;
  timerElement.textContent = gameActive ? secondsLeft : currentDifficultyConfig.time;

  difficultyButtons.forEach((button) => {
    const isActive = button.dataset.difficulty === currentDifficulty;
    button.classList.toggle('active', isActive);
  });
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

function playCollectionSound() {
  if (!collectSound) return;
  collectSound.currentTime = 0;
  collectSound.play().catch(() => {});
}

function showEffect(cell, type) {
  cell.innerHTML = '';
  const effect = document.createElement('div');
  effect.className = `effect ${type}`;
  effect.textContent = type === 'collect' ? '💧' : '⚠';
  cell.appendChild(effect);

  setTimeout(() => {
    if (cell.firstChild?.classList?.contains('effect')) {
      cell.innerHTML = '';
    }
  }, 220);
}

function spawnItem() {
  if (!gameActive) return;

  const cells = document.querySelectorAll('.grid-cell');
  cells.forEach((cell) => (cell.innerHTML = ''));

  const shouldSpawnObstacle = Math.random() < currentDifficultyConfig.obstacleChance;
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
    playCollectionSound();
    showEffect(cell, 'collect');
    updateStats();

    if (currentCans >= currentDifficultyConfig.goal) {
      endGame(true);
      return;
    }

    const milestoneThresholds = [5, 10, 15, 20];
    if (milestoneThresholds.includes(currentCans)) {
      score += currentDifficultyConfig.bonus;
      updateStats();
      showFeedback(`Milestone reached! ${currentCans} water cans collected. Bonus points earned!`, 'success');
    } else {
      showFeedback('Fresh water secured! Keep going!', 'success');
    }

    setTimeout(spawnItem, 180);
  } else if (cell.querySelector('.obstacle')) {
    score = Math.max(0, score - 40);
    secondsLeft = Math.max(0, secondsLeft - 3);
    showEffect(cell, 'obstacle');
    updateStats();
    showFeedback('That obstacle cost you time and points. Stay sharp!', 'danger');
    setTimeout(spawnItem, 180);
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

  currentDifficultyConfig = DIFFICULTIES[currentDifficulty];
  currentCans = 0;
  score = 0;
  secondsLeft = currentDifficultyConfig.time;
  gameActive = true;
  startButton.textContent = 'Restart Game';
  createGrid();
  updateStats();
  updateDifficultyUI();
  showFeedback(`Difficulty: ${currentDifficultyConfig.label}. Collect ${currentDifficultyConfig.goal} cans before time runs out!`, 'info');
  spawnItem();
  spawnInterval = setInterval(spawnItem, currentDifficultyConfig.spawnInterval);
  timerInterval = setInterval(tickTimer, 1000);
}

function endGame(won) {
  gameActive = false;
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  createGrid();
  updateStats();
  updateDifficultyUI();

  if (won) {
    showFeedback(`Mission complete! You collected ${currentCans} water cans and scored ${score} points.`, 'success');
  } else {
    showFeedback('Time is up! The mission ended before you reached the goal.', 'danger');
  }
}

function handleDifficultyChange(event) {
  const selectedDifficulty = event.currentTarget.dataset.difficulty;
  if (!selectedDifficulty || !DIFFICULTIES[selectedDifficulty]) return;

  currentDifficulty = selectedDifficulty;
  updateDifficultyUI();

  if (!gameActive) {
    secondsLeft = currentDifficultyConfig.time;
    updateStats();
    showFeedback(`${currentDifficultyConfig.label} mode selected. Press start to play.`, 'info');
  }
}

createGrid();
updateDifficultyUI();
updateStats();
showFeedback('Press start to begin your rescue mission.', 'info');

grid.addEventListener('click', handleCellClick);
startButton.addEventListener('click', startGame);
difficultyButtons.forEach((button) => button.addEventListener('click', handleDifficultyChange));

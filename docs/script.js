const road = document.getElementById('road');
const car = document.getElementById('car');
const car2 = document.getElementById('car2');
const scoreDisplay = document.getElementById('score');
const highestScoreDisplay = document.getElementById('highestScore');
const startButton = document.getElementById('startButton');
const gameOverText = document.getElementById('gameOverText');

let carPositionX;
let carPositionY;
let car2PositionX;
let car2PositionY;
let initialCarSpeed = 5;
let carSpeed = initialCarSpeed;
let initialObstacleSpeed = 2;
let obstacleSpeed = initialObstacleSpeed;
let initialCoinSpeed = 2;
let coinSpeed = initialCoinSpeed;
let gameOver = false;
let score = 0;
let highestScore = 0;
let carMoveInterval = null;
let car2MoveInterval = null;
let gameLoopInterval = null;
let carMoveDirection = { left: false, right: false, up: false, down: false };
let car2MoveDirection = { left: false, right: false, up: false, down: false };
let activeIntervals = [];
let rareMineActive = false;

const coinSizes = [
    { size: 20, value: 5 },
    { size: 30, value: 10 },
    { size: 0, value: 15 }
];

startButton.addEventListener('click', startGame);

document.addEventListener('keydown', (e) => {
    if (e.key === 'a' || e.key === 'A') {
        carMoveDirection.left = true;
    } else if (e.key === 'd' || e.key === 'D') {
        carMoveDirection.right = true;
    } else if (e.key === 'w' || e.key === 'W') {
        carMoveDirection.up = true;
    } else if (e.key === 's' || e.key === 'S') {
        carMoveDirection.down = true;
    } else if (e.key === 'ArrowLeft') {
        car2MoveDirection.left = true;
    } else if (e.key === 'ArrowRight') {
        car2MoveDirection.right = true;
    } else if (e.key === 'ArrowUp') {
        car2MoveDirection.up = true;
    } else if (e.key === 'ArrowDown') {
        car2MoveDirection.down = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'a' || e.key === 'A') {
        carMoveDirection.left = false;
    } else if (e.key === 'd' || e.key === 'D') {
        carMoveDirection.right = false;
    } else if (e.key === 'w' || e.key === 'W') {
        carMoveDirection.up = false;
    } else if (e.key === 's' || e.key === 'S') {
        carMoveDirection.down = false;
    } else if (e.key === 'ArrowLeft') {
        car2MoveDirection.left = false;
    } else if (e.key === 'ArrowRight') {
        car2MoveDirection.right = false;
    } else if (e.key === 'ArrowUp') {
        car2MoveDirection.up = false;
    } else if (e.key === 'ArrowDown') {
        car2MoveDirection.down = false;
    }
});

function moveCar() {
    if (carMoveDirection.left && carPositionX > 0) {
        carPositionX -= 10;
    }
    if (carMoveDirection.right && carPositionX < road.offsetWidth - car.offsetWidth) {
        carPositionX += 10;
    }
    if (carMoveDirection.up && carPositionY > 0) {
        carPositionY -= 10;
    }
    if (carMoveDirection.down && carPositionY < road.offsetHeight - car.offsetHeight) {
        carPositionY += 10;
    }
    car.style.left = `${carPositionX}px`;
    car.style.top = `${carPositionY}px`;
}

function moveCar2() {
    if (car2MoveDirection.left && car2PositionX > 0) {
        car2PositionX -= 10;
    }
    if (car2MoveDirection.right && car2PositionX < road.offsetWidth - car2.offsetWidth) {
        car2PositionX += 10;
    }
    if (car2MoveDirection.up && car2PositionY > 0) {
        car2PositionY -= 10;
    }
    if (car2MoveDirection.down && car2PositionY < road.offsetHeight - car2.offsetHeight) {
        car2PositionY += 10;
    }
    car2.style.left = `${car2PositionX}px`;
    car2.style.top = `${car2PositionY}px`;
}

function stopCar2() {
    clearInterval(car2MoveInterval);
}

function startGame() {
    gameOver = false;
    gameOverText.style.display = 'none';
    startButton.style.display = 'none';
    resetGame();

    clearInterval(carMoveInterval);
    clearInterval(car2MoveInterval);
    clearInterval(gameLoopInterval);

    carMoveInterval = setInterval(moveCar, 50);
    car2MoveInterval = setInterval(moveCar2, 50);
    gameLoopInterval = setInterval(gameLoop, 2000 - carSpeed * 100);
}

function createObstacle() {
    if (gameOver) return;

    const obstacle = document.createElement('div');
    obstacle.className = 'obstacle';

    obstacle.style.left = `${Math.random() * (road.offsetWidth - 50)}px`;
    obstacle.style.top = `-50px`;

    road.appendChild(obstacle);

    const obstacleInterval = setInterval(() => {
        if (gameOver) {
            clearInterval(obstacleInterval);
            return;
        }

        const obstacleTop = parseInt(obstacle.style.top);
        if (obstacleTop > road.offsetHeight) {
            clearInterval(obstacleInterval);
            road.removeChild(obstacle);
        } else {
            obstacle.style.top = `${obstacleTop + obstacleSpeed}px`;
        }

        if (checkCollision(car, obstacle) || checkCollision(car2, obstacle)) {
            gameOver = true;
            gameOverText.style.display = 'block';
            gameOverText.style.top = `${(road.offsetHeight - gameOverText.offsetHeight) / 2}px`;
            startButton.style.display = 'block';
            clearInterval(carMoveInterval);
            clearInterval(gameLoopInterval);
            resetGame();
        }
    }, 20);

    activeIntervals.push(obstacleInterval);
}

function createCoin() {
    if (gameOver) return;

    const coinData = coinSizes[Math.floor(Math.random() * coinSizes.length)];
    const coin = document.createElement('div');
    coin.className = 'coin';
    coin.style.width = `${coinData.size}px`;
    coin.style.height = `${coinData.size}px`;

    coin.style.left = `${Math.random() * (road.offsetWidth - coinData.size)}px`;
    coin.style.top = `-50px`;

    road.appendChild(coin);

    const coinInterval = setInterval(() => {
        if (gameOver) {
            clearInterval(coinInterval);
            road.removeChild(coin);
            return;
        }

        const coinTop = parseInt(coin.style.top);
        if (coinTop > road.offsetHeight) {
            clearInterval(coinInterval);
            road.removeChild(coin);
        } else {
            coin.style.top = `${coinTop + coinSpeed}px`;
        }

        if (checkCollision(car, coin) || checkCollision(car2, coin)) {
            score += coinData.value;
            scoreDisplay.innerText = `Score: ${score}`;
            clearInterval(coinInterval);
            road.removeChild(coin);
        }
    }, 20);

    activeIntervals.push(coinInterval);
}

function checkCollision(car, element) {
    const carRect = car.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    return !(
        carRect.top > elementRect.bottom ||
        carRect.bottom < elementRect.top ||
        carRect.right < elementRect.left ||
        carRect.left > elementRect.right
    );
}

function resetGame() {
    activeIntervals.forEach(interval => clearInterval(interval));
    activeIntervals = [];

    road.querySelectorAll('.obstacle').forEach(obstacle => obstacle.remove());
    road.querySelectorAll('.coin').forEach(coin => coin.remove());
    road.querySelectorAll('.rare-mine').forEach(rareMine => rareMine.remove());

    carPositionX = road.offsetWidth / 2 - car.offsetWidth / 2;
    carPositionY = road.offsetHeight - car.offsetHeight - 10;
    car.style.left = `${carPositionX}px`;
    car.style.top = `${carPositionY}px`;

    car2PositionX = road.offsetWidth / 2 + car.offsetWidth / 2;
    car2PositionY = road.offsetHeight - car.offsetHeight - 10;
    car2.style.left = `${car2PositionX}px`;
    car2.style.top = `${car2PositionY}px`;

    if (score > highestScore) {
        highestScore = score;
        highestScoreDisplay.innerText = `Best Score: ${highestScore}`;
    }

    score = 0;
    scoreDisplay.innerText = `Score: ${score}`;
    carSpeed = initialCarSpeed;
    obstacleSpeed = initialObstacleSpeed;
    coinSpeed = initialCoinSpeed;
    rareMineActive = false;
}

function gameLoop() {
    if (gameOver) return;
    createObstacle();
    createCoin();

    if (Math.random() < 0.01) { // 1% chance to spawn a rare mine
        createRareMine();
    }

    if (score % 50 === 0 && score !== 0 && !rareMineActive) {
        carSpeed += 1;
        obstacleSpeed += 1;
    }
}

function createRareMine() {
    const rareMine = document.createElement('div');
    rareMine.className = 'rare-mine';

    rareMine.style.left = `${Math.random() * (road.offsetWidth - 50)}px`;
    rareMine.style.top = `-50px`;

    road.appendChild(rareMine);

    const rareMineInterval = setInterval(() => {
        if (gameOver) {
            clearInterval(rareMineInterval);
            return;
        }

        const rareMineTop = parseInt(rareMine.style.top);
        if (rareMineTop > road.offsetHeight) {
            clearInterval(rareMineInterval);
            road.removeChild(rareMine);
        } else {
            rareMine.style.top = `${rareMineTop + coinSpeed}px`;
        }

        if (checkCollision(car, rareMine) || checkCollision(car2, rareMine)) {
            clearInterval(rareMineInterval);
            road.removeChild(rareMine);
            activateRareMine();
        }
    }, 20);

    activeIntervals.push(rareMineInterval);
}

function activateRareMine() {
    rareMineActive = true;
    obstacleSpeed = 0; 
    carSpeed *= 2; 
    setTimeout(() => {
        rareMineActive = false;
        obstacleSpeed = initialObstacleSpeed;
        carSpeed = initialCarSpeed;
    }, 10000); // 10 seconds duration
}

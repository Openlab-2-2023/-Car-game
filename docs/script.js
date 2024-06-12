const road = document.getElementById('road');
const car = document.getElementById('car');
const car2 = document.getElementById('car2');
const scoreDisplay = document.getElementById('score');
const highestScoreDisplay = document.getElementById('highestScore');
const startButton = document.getElementById('startButton');
const gameOverText = document.getElementById('gameOverText');

let carPositionX = road.offsetWidth / 2 - car.offsetWidth / 2;
let carPositionY = road.offsetHeight - car.offsetHeight - 10;
let car2PositionX = road.offsetWidth / 2 + car.offsetWidth / 2;
let car2PositionY = road.offsetHeight - car.offsetHeight - 10;
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
let activeIntervals = [];

const coinSizes = [
    { size: 20, value: 5 },
    { size: 30, value: 10 },
    { size: 0, value: 15 }
];

car.style.left = `${carPositionX}px`;
car.style.top = `${carPositionY}px`;

car2.style.left = `${car2PositionX}px`;
car2.style.top = `${car2PositionY}px`;

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
        moveCar2Left();
    } else if (e.key === 'ArrowRight') {
        moveCar2Right();
    } else if (e.key === 'ArrowUp') {
        moveCar2Up();
    } else if (e.key === 'ArrowDown') {
        moveCar2Down();
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
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        stopCar2();
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

function moveCar2Left() {
    clearInterval(car2MoveInterval);
    car2MoveInterval = setInterval(() => {
        if (car2PositionX > 0) {
            car2PositionX -= 10;
            car2.style.left = `${car2PositionX}px`;
        }
    }, 50);
}

function moveCar2Right() {
    clearInterval(car2MoveInterval);
    car2MoveInterval = setInterval(() => {
        if (car2PositionX < road.offsetWidth - car2.offsetWidth) {
            car2PositionX += 10;
            car2.style.left = `${car2PositionX}px`;
        }
    }, 50);
}

function moveCar2Up() {
    clearInterval(car2MoveInterval);
    car2MoveInterval = setInterval(() => {
        if (car2PositionY > 0) {
            car2PositionY -= 10;
            car2.style.top = `${car2PositionY}px`;
        }
    }, 50);
}

function moveCar2Down() {
    clearInterval(car2MoveInterval);
    car2MoveInterval = setInterval(() => {
        if (car2PositionY < road.offsetHeight - car2.offsetHeight) {
            car2PositionY += 10;
            car2.style.top = `${car2PositionY}px`;
        }
    }, 50);
}

function stopCar2() {
    clearInterval(car2MoveInterval);
}

function startGame() {
    gameOver = false;
    gameOverText.style.display = 'none';
    startButton.style.display = 'none';
    resetGame();
    carMoveInterval = setInterval(moveCar, 50);
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
}

function gameLoop() {
    if (gameOver) return;
    createObstacle();
    createCoin();
    carSpeed += 0.1;
    obstacleSpeed += 0.03;
}

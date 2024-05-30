const road = document.getElementById('road');
const car = document.getElementById('car');
const scoreDisplay = document.getElementById('score');
const startButton = document.getElementById('startButton');
const gameOverText = document.getElementById('gameOverText');

let carPositionX = road.offsetWidth / 2 - car.offsetWidth / 2;
let carPositionY = road.offsetHeight - car.offsetHeight - 10;
let initialCarSpeed = 5;
let carSpeed = initialCarSpeed;
let initialObstacleSpeed = 2;
let obstacleSpeed = initialObstacleSpeed;
let initialLeftObstacleSpeed = 3;
let leftObstacleSpeed = initialLeftObstacleSpeed;
let initialCoinSpeed = 2;
let coinSpeed = initialCoinSpeed;
let gameOver = false;
let score = 0;
let carMoveInterval = null;
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

startButton.addEventListener('click', startGame);

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        carMoveDirection.left = true;
    } else if (e.key === 'ArrowRight') {
        carMoveDirection.right = true;
    } else if (e.key === 'ArrowUp') {
        carMoveDirection.up = true;
    } else if (e.key === 'ArrowDown') {
        carMoveDirection.down = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') {
        carMoveDirection.left = false;
    } else if (e.key === 'ArrowRight') {
        carMoveDirection.right = false;
    } else if (e.key === 'ArrowUp') {
        carMoveDirection.up = false;
    } else if (e.key === 'ArrowDown') {
        carMoveDirection.down = false;
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

function startGame() {
    gameOver = false;
    gameOverText.style.display = 'none'; // Skryje upozornenie "Game Over"
    startButton.style.display = 'none'; // Skryje tlačidlo "Start"
    resetGame();
    carMoveInterval = setInterval(moveCar, 50);
    gameLoop();
}

function createObstacle() {
    if (gameOver) return;

    const obstacle = document.createElement('div');
    obstacle.className = 'obstacle';

    const lane = Math.random() < 0.5 ? 'left' : 'right';

    if (lane === 'left') {
        obstacle.style.left = `${Math.random() * (road.offsetWidth / 2 - 50)}px`;
        obstacle.style.top = `-50px`;
    } else {
        obstacle.style.left = `${road.offsetWidth / 2 + Math.random() * (road.offsetWidth / 2 - 50)}px`;
        obstacle.style.top = `-50px`;
    }

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
            obstacle.style.top = `${obstacleTop + (lane === 'left' ? leftObstacleSpeed : obstacleSpeed)}px`;
        }

        if (checkCollision(car, obstacle)) {
            gameOver = true;
            gameOverText.style.display = 'block'; // Zobrazí upozornenie "Game Over"
            gameOverText.style.top = `${(road.offsetHeight - gameOverText.offsetHeight) / 2}px`;
            startButton.style.display = 'block'; // Zobrazí tlačidlo "Start" po skončení hry
            clearInterval(carMoveInterval);
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

    let coinLeft;
    let coinTop = -coinData.size;
    let validPosition = false;

    while (!validPosition) {
        coinLeft = Math.random() * (road.offsetWidth - coinData.size);
        coin.style.left = `${coinLeft}px`;
        coin.style.top = `${coinTop}px`;
        validPosition = true;

        road.appendChild(coin);
        const obstacles = document.querySelectorAll('.obstacle');
        obstacles.forEach(obstacle => {
            if (checkOverlap(coin, obstacle)) {
                validPosition = false;
            }
        });
        if (!validPosition) {
            road.removeChild(coin);
        }
    }

    if (!coin.parentElement) {
        road.appendChild(coin);
    }

    let coinPosition = 0;
    const coinInterval = setInterval(() => {
        if (gameOver) {
            clearInterval(coinInterval);
            if (coin.parentElement) {
                road.removeChild(coin);
            }
            return;
        }
        if (coinPosition > road.offsetHeight) {
            clearInterval(coinInterval);
            road.removeChild(coin);
        } else {
            coinPosition += coinSpeed;
            coin.style.top = `${coinPosition}px`;
            if (checkCollision(car, coin)) {
                score += coinData.value;
                scoreDisplay.innerText = `Skóre: ${score}`;
                clearInterval(coinInterval);
                road.removeChild(coin);
            }
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

function checkOverlap(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();

    return !(
        rect1.top > rect2.bottom ||
        rect1.bottom < rect2.top ||
        rect1.right < rect2.left ||
        rect1.left > rect2.right
    );
}

function resetGame() {
    // Zastavenie všetkých aktívnych intervalov
    activeIntervals.forEach(interval => clearInterval(interval));
    activeIntervals = [];

    // Odstránenie všetkých prekážok a mincí
    const obstacles = document.querySelectorAll('.obstacle');
    const coins = document.querySelectorAll('.coin');
    obstacles.forEach(obstacle => road.removeChild(obstacle));
    coins.forEach(coin => road.removeChild(coin));

    // Resetovanie pozícií auta
    carPositionX = road.offsetWidth / 2 - car.offsetWidth / 2;
    carPositionY = road.offsetHeight - car.offsetHeight - 10;
    car.style.left = `${carPositionX}px`;
    car.style.top = `${carPositionY}px`;

    // Resetovanie skóre a rýchlostí
    score = 0;
    scoreDisplay.innerText = `Skóre: ${score}`;
    carSpeed = initialCarSpeed;
    obstacleSpeed = initialObstacleSpeed;
    leftObstacleSpeed = initialLeftObstacleSpeed;
    coinSpeed = initialCoinSpeed;
}

function gameLoop() {
    if (gameOver) return;
    createObstacle();
    createCoin();
    setTimeout(gameLoop, 2000 - carSpeed * 100);
    carSpeed += 0.1;
    obstacleSpeed += 0.05;
    leftObstacleSpeed += 0.05;
}

startButton.addEventListener('click', startGame);

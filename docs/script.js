const road = document.getElementById('road');
const car = document.getElementById('car');
const scoreDisplay = document.getElementById('score');
let carPosition = road.offsetWidth / 2 - car.offsetWidth / 2;
let speed = 5;
let obstacleSpeed = 2; // Prekážky sa budú pohybovať pomalšie než auto
let gameOver = false;
let score = 0;
let carMoveInterval = null;

const coinSizes = [
    { size: 10, value: 5 },
    { size: 20, value: 10 },
    { size: 30, value: 15 }
];

car.style.left = `${carPosition}px`;

document.addEventListener('keydown', (e) => {
    if (carMoveInterval) return; // Prevent multiple intervals
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        carMoveInterval = setInterval(() => {
            if (e.key === 'ArrowLeft' && carPosition > 0) {
                carPosition -= 10;
            } else if (e.key === 'ArrowRight' && carPosition < road.offsetWidth - car.offsetWidth) {
                carPosition += 10;
            }
            car.style.left = `${carPosition}px`;
        }, 50);
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        clearInterval(carMoveInterval);
        carMoveInterval = null;
    }
});

function createObstacle() {
    if (gameOver) return;

    const obstacle = document.createElement('div');
    obstacle.className = 'obstacle';
    
    // Determine the lane for the obstacle
    const lane = Math.random() < 0.5 ? 'left' : 'right';

    if (lane === 'left') {
        // Left lane (downward moving obstacles)
        obstacle.style.left = `${Math.random() * (road.offsetWidth / 2 - 50)}px`;
        obstacle.style.top = `-50px`;
    } else {
        // Right lane (upward moving obstacles)
        obstacle.style.left = `${road.offsetWidth / 2 + Math.random() * (road.offsetWidth / 2 - 50)}px`;
        obstacle.style.bottom = `-50px`;
    }

    road.appendChild(obstacle);

    const obstacleInterval = setInterval(() => {
        if (gameOver) {
            clearInterval(obstacleInterval);
            return;
        }

        if (lane === 'left') {
            const obstacleTop = parseInt(obstacle.style.top);
            if (obstacleTop > road.offsetHeight) {
                clearInterval(obstacleInterval);
                road.removeChild(obstacle);
            } else {
                obstacle.style.top = `${obstacleTop + obstacleSpeed}px`;
            }
        } else {
            const obstacleBottom = parseInt(obstacle.style.bottom);
            if (obstacleBottom > road.offsetHeight) {
                clearInterval(obstacleInterval);
                road.removeChild(obstacle);
            } else {
                obstacle.style.bottom = `${obstacleBottom + obstacleSpeed}px`;
            }
        }

        if (checkCollision(car, obstacle)) {
            gameOver = true;
            alert('Game Over!');
            resetGame();
        }
    }, 20);
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

        // Temporarily add the coin to the DOM to check its position
        road.appendChild(coin);
        const obstacles = document.querySelectorAll('.obstacle');
        obstacles.forEach(obstacle => {
            if (checkOverlap(coin, obstacle)) {
                validPosition = false;
            }
        });
        // Remove the coin if the position is not valid
        if (!validPosition) {
            road.removeChild(coin);
        }
    }

    // If the coin is not already in the DOM, add it
    if (!coin.parentElement) {
        road.appendChild(coin);
    }

    let coinPosition = 0;
    const coinInterval = setInterval(() => {
        if (coinPosition > road.offsetHeight) {
            clearInterval(coinInterval);
            road.removeChild(coin);
        } else {
            coinPosition += speed;
            coin.style.top = `${coinPosition}px`;
            if (checkCollision(car, coin)) {
                score += coinData.value;
                scoreDisplay.innerText = `Score: ${score}`;
                clearInterval(coinInterval);
                road.removeChild(coin);
            }
        }
    }, 20);
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
    const obstacles = document.querySelectorAll('.obstacle');
    const coins = document.querySelectorAll('.coin');
    obstacles.forEach(obstacle => road.removeChild(obstacle));
    coins.forEach(coin => road.removeChild(coin));
    carPosition = road.offsetWidth / 2 - car.offsetWidth / 2;
    car.style.left = `${carPosition}px`;
    speed = 5;
    obstacleSpeed = 2;
    score = 0;
    scoreDisplay.innerText = `Score: ${score}`;
    gameOver = false;
    setTimeout(gameLoop, 1000); // Delay to ensure obstacles are cleared
}

function gameLoop() {
    if (gameOver) return;
    createObstacle();
    createCoin();
    setTimeout(gameLoop, 2000 - speed * 100);
    speed += 0.1; 
    obstacleSpeed += 0.05; // Increment the speed of obstacles slower than the car's speed
}

gameLoop();

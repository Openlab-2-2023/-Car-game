const road = document.getElementById('road');
const car = document.getElementById('car');
const scoreDisplay = document.getElementById('score');
let carPosition = road.offsetWidth / 2 - car.offsetWidth / 2;
let speed = 2;
let gameOver = false;
let score = 0;

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && carPosition > 0) {
        carPosition -= 10;
    } else if (e.key === 'ArrowRight' && carPosition < road.offsetWidth - car.offsetWidth) {
        carPosition += 10;
    }
    car.style.left = `${carPosition}px`;
});

function createObstacle() {
    if (gameOver) return;

    const obstacle = document.createElement('div');
    obstacle.className = 'obstacle';
    obstacle.style.left = `${Math.random() * (road.offsetWidth - 50)}px`;
    road.appendChild(obstacle);

    let obstaclePosition = 0;
    const obstacleInterval = setInterval(() => {
        if (obstaclePosition > road.offsetHeight) {
            clearInterval(obstacleInterval);
            road.removeChild(obstacle);
        } else {
            obstaclePosition += speed;
            obstacle.style.top = `${obstaclePosition}px`;
            if (checkCollision(car, obstacle)) {
                gameOver = true;
                alert('Game Over!');
            }
        }
    }, 20);
    return obstacle;
}

function createCoin() {
    if (gameOver) return;

    const coin = document.createElement('div');
    coin.className = 'coin';
    
    let coinLeft;
    let validPosition = false;

    while (!validPosition) {
        coinLeft = Math.random() * (road.offsetWidth - 20);
        coin.style.left = `${coinLeft}px`;
        validPosition = true;

        
        const obstacles = document.querySelectorAll('.obstacle');
        obstacles.forEach(obstacle => {
            if (checkOverlap(coin, obstacle)) {
                validPosition = false;
            }
        });
    }

    road.appendChild(coin);

    let coinPosition = 0;
    const coinInterval = setInterval(() => {
        if (coinPosition > road.offsetHeight) {
            clearInterval(coinInterval);
            road.removeChild(coin);
        } else {
            coinPosition += speed;
            coin.style.top = `${coinPosition}px`;
            if (checkCollision(car, coin)) {
                score += 10;
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

function gameLoop() {
    if (gameOver) return;
    createObstacle();
    createCoin();
    setTimeout(gameLoop, 2000 - speed * 100);
    speed += 0.1; 
}

gameLoop();
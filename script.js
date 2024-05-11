//@ts-check
const BOARD_SIZE = 10;
const CELL_SIZE = 50;
const SNAKE_INITIAL_SPEED = 1;
const CANVAS_SIZE = BOARD_SIZE * CELL_SIZE;


/**
 * 
 * @typedef {ReturnType<typeof initializeGameState>} GameState
 */

function initializeGameState() {
    const gameState = {
        score: 0,
        boardLocked: false,
        gameEnded: false,
        time: 0,
        snake: {
            direction: 'right',
            speed: SNAKE_INITIAL_SPEED,
            position: new SnakePosition(),
        },
        food: {
            x: 0,
            y: 0,
        },
    }

    gameState.food = getRandomFoodPosition(gameState);

    return gameState;
}

class SnakePosition {
    constructor(
        initialValue = [
            {
                x: Math.round(BOARD_SIZE / 2),
                y: Math.round(BOARD_SIZE / 2)
            },
            {
                x: Math.round(BOARD_SIZE / 2) + 1,
                y: Math.round(BOARD_SIZE / 2)
            },
        ]
    ) {
        this.value = structuredClone(initialValue);
    }
    /**
     * @param {number} index 
     */

    getSegment(index) {
        return index >= 0 ? this.value[index] : this.value[this.value.length + index];
    }

}
/**
 * 
 * @param {GameState} gameState 
 */
function getRandomFoodPosition(gameState) {
    const rand = () => Math.floor(Math.random() * BOARD_SIZE);
    const foodPosition = { x: rand(), y: rand() };
    while (
        gameState.snake.position.value.some(segment => {
            return segment.x === foodPosition.x && segment.y === foodPosition.y
        })

    ) {
        foodPosition.x = rand();
        foodPosition.y = rand();
    }
    return foodPosition;
}

function getContext() {
    let canvas = document.getElementsByTagName('canvas')[0];
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.height = CANVAS_SIZE;
        canvas.width = CANVAS_SIZE;
        document.body.append(canvas);
    }
    const ctx = canvas.getContext('2d');
    if (ctx === null) {
        throw new Error('Could not get 2d context');
    }
    return ctx;
}

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {GameState} gameState
 */
function drawGame(ctx, gameState) {
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    drawGrid(ctx);
    drawSnake(ctx, gameState.snake);
    drawFood(ctx, gameState.food);
    updateTrackBar(gameState);
}

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 */
function drawGrid(ctx) {
    ctx.beginPath();
    ctx.strokeStyle = 'darkgrey';
    ctx.strokeRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    for (let i = 0; i <= BOARD_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
        ctx.stroke();
    }
}

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {GameState['food']} food 
 */
function drawFood(ctx, food) {
    ctx.beginPath();
    ctx.arc(food.x * CELL_SIZE + CELL_SIZE / 2, food.y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 4, 0, 2 * Math.PI);
    ctx.fillStyle = 'red';
    ctx.fill();
}

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {GameState['snake']} snake 
 */
function drawSnake(ctx, snake) {
    snake.position.value.forEach(segment => {
        ctx.fillStyle = 'green';
        ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    })
}

/**
 * 
 * @param {GameState} gameState 
 */
function updateGameState(gameState) {
    const nextSnakePosition = calcNewSnakePosition(gameState);
    if (isCollidinWithBorders(nextSnakePosition) || isCollidingWithSelf(nextSnakePosition)) {
        alert('Game over');
        window.location.reload();
    }
    if (isCollidingWithFood(gameState, nextSnakePosition)) {
        handleFoodCollision(gameState, nextSnakePosition);
    }
    gameState.snake.position = nextSnakePosition;
    gameState.time += 1;
}

/**
 * 
 * @param {GameState} gameState 
 */
function calcNewSnakePosition(gameState) {
    const { direction, position } = gameState.snake;
    const newPosition = new SnakePosition(position.value);
    switch (direction) {
        case 'right':
            newPosition.getSegment(0).x += 1;
            break;
        case 'left':
            newPosition.getSegment(0).x -= 1;
            break;
        case 'up':
            newPosition.getSegment(0).y -= 1;
            break;
        case 'down':
            newPosition.getSegment(0).y += 1;
            break;
        default:
            throw new Error('Invalid snake direction ' + direction);
    }

    for (let i = 0; i < newPosition.value.length; i++) {
        if (i === 0) continue;
        const segment = newPosition.getSegment(i);
        const prevElementPosition = position.getSegment(i - 1);
        segment.x = prevElementPosition.x;
        segment.y = prevElementPosition.y;
    }
    return newPosition;
}

/**
 * 
 * @param {GameState} gameState 
 * @param {ReturnType<typeof calcNewSnakePosition>} nextSnakePosition 
 */
function isCollidingWithFood(gameState, nextSnakePosition) {
    return nextSnakePosition.getSegment(0).x === gameState.food.x && nextSnakePosition.getSegment(0).y === gameState.food.y
}
/**
 * @param {ReturnType<typeof calcNewSnakePosition>} nextSnakePosition 
 */
function isCollidinWithBorders(nextSnakePosition) {
    return nextSnakePosition.getSegment(0).x < 0 || nextSnakePosition.getSegment(0).x >= BOARD_SIZE || nextSnakePosition.getSegment(0).y < 0 || nextSnakePosition.getSegment(0).y >= BOARD_SIZE;
}
/**
* @param {ReturnType<typeof calcNewSnakePosition>} nextSnakePosition 
*/
function isCollidingWithSelf(nextSnakePosition) {
    return nextSnakePosition.value.some((segment, index) => {
        if (index === 0) return false;
        return segment.x === nextSnakePosition.getSegment(0).x && segment.y === nextSnakePosition.getSegment(0).y
    })
}

/**
 * 
 * @param {GameState} gameState 
 * @param {ReturnType<typeof calcNewSnakePosition>} nextSnakePosition 
 */
function handleFoodCollision(gameState, nextSnakePosition) {
    const newSnakePart = { x: 0, y: 0 };
    // debugger
    if (gameState.snake.position.getSegment(-1)?.x < gameState.snake.position.getSegment(-2)?.x) {
        newSnakePart.x = gameState.snake.position.getSegment(-1)?.x;
        newSnakePart.y = gameState.snake.position.getSegment(-1)?.y;
    }
    if (gameState.snake.position.getSegment(-1)?.x > gameState.snake.position.getSegment(-2)?.x) {
        newSnakePart.x = gameState.snake.position.getSegment(-1)?.x;
        newSnakePart.y = gameState.snake.position.getSegment(-1)?.y;
    }
    if (gameState.snake.position.getSegment(-1)?.y < gameState.snake.position.getSegment(-2)?.y) {
        newSnakePart.y = gameState.snake.position.getSegment(-1)?.y;
        newSnakePart.x = gameState.snake.position.getSegment(-1)?.x;
    }
    if (gameState.snake.position.getSegment(-1)?.y > gameState.snake.position.getSegment(-2)?.y) {
        newSnakePart.y = gameState.snake.position.getSegment(-1)?.y;
        newSnakePart.x = gameState.snake.position.getSegment(-1)?.x;
    }
    nextSnakePosition.value.push(newSnakePart);
    gameState.snake.speed += 0.05;
    gameState.score += 1;
    gameState.food = getRandomFoodPosition(gameState);
}

/**
 * 
 * @param {GameState} gameState 
 */
function addKeyListeners(gameState) {
    let pressed = '';
    let prevSpeed = gameState.snake.speed;
    document.addEventListener('keydown', event => {
        pressed = event.key;
        switch (event.key) {
            case 'ArrowLeft':
                if (gameState.snake.direction === 'right' || gameState.boardLocked) return;
                gameState.snake.direction = 'left';
                gameState.boardLocked = true; // prevent direction change before next animation run
                break;
            case 'ArrowUp':
                if (gameState.snake.direction === 'down' || gameState.boardLocked) return;
                gameState.snake.direction = 'up';
                gameState.boardLocked = true; // prevent direction change before next animation run
                break;
            case 'ArrowRight':
                if (gameState.snake.direction === 'left' || gameState.boardLocked) return;
                gameState.snake.direction = 'right';
                gameState.boardLocked = true; // prevent direction change before next animation run
                break;
            case 'ArrowDown':
                if (gameState.snake.direction === 'up' || gameState.boardLocked) return;
                gameState.snake.direction = 'down';
                gameState.boardLocked = true; // prevent direction change before next animation run
                break;
            default:
                break;
        }
        if (pressed === event.key && prevSpeed === gameState.snake.speed) {
            prevSpeed = gameState.snake.speed;
            gameState.snake.speed = gameState.snake.speed * 2;
            return;
        }

    })
    document.addEventListener('keyup', () => {
        pressed = '';
        gameState.snake.speed = prevSpeed;
    })
}
/**
 * 
 * @param {GameState} gameState 
 */
function updateTrackBar(gameState) {
    let bar = document.querySelector('.track-bar');
    if (!bar) {
        bar = document.createElement('div');
        bar.className = 'track-bar';
        document.body.insertBefore(bar, document.body.firstChild);
    }
    let score = bar.querySelector('.score');
    if (!score) {
        score = document.createElement('span');
        score.className = 'score';
        bar.appendChild(score);
    }
    let snakeLength = bar.querySelector('.snake-length');
    if (!snakeLength) {
        snakeLength = document.createElement('span');
        snakeLength.className = 'snake-length';
        bar.appendChild(snakeLength);
    }
    let time = bar.querySelector('.time');
    if (!time) {
        time = document.createElement('span');
        time.className = 'time';
        bar.appendChild(time);
    }
    let snakeSpeed = bar.querySelector('.snake-speed');
    if (!snakeSpeed) {
        snakeSpeed = document.createElement('span');
        snakeSpeed.className = 'snake-speed';
        bar.appendChild(snakeSpeed);
    }
    score.textContent = `Score: ${gameState.score}`;
    snakeLength.textContent = `Snake length: ${gameState.snake.position.value.length}`;
    time.textContent = `Time: ${displayTimeInMinutesAndSeconds(gameState.time)}`;
    snakeSpeed.textContent = `Snake speed: ${gameState.snake.speed}x`;
}

/**
 * 
 * @param {number} time  
 */
function displayTimeInMinutesAndSeconds(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

/**
 * 
 * @param {GameState} gameState
 */
function animate(gameState) {
    updateGameState(gameState);
    drawGame(getContext(), gameState);
    gameState.boardLocked = false;
    setTimeout(() => {
        requestAnimationFrame(() => animate(gameState));
    }, 1 * 1000 / gameState.snake.speed);
}

const gameState = initializeGameState();
addKeyListeners(gameState);
animate(gameState);

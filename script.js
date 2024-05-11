//@ts-check
const BOARD_SIZE = 10;
const CELL_SIZE = 50;
const SNAKE_INITIAL_SPEED = 1;
const CANVAS_SIZE = BOARD_SIZE * CELL_SIZE;

function getGameState() {
    function getfoodPosition() {
        return Math.floor(Math.random() * BOARD_SIZE);
    }
    const gameState = {
        score: 0,
        boardLocked: false,
        snake: {
            direction: 'right',
            speed: SNAKE_INITIAL_SPEED,
            position: new SnakePosition(),
        },
        food: {
            x: getfoodPosition(),
            y: getfoodPosition(),
        },
    }
    while (
        gameState.snake.position.value.some(segment => {
            return segment.x === gameState.food.x && segment.y === gameState.food.y
        })

    ) {
        gameState.food.x = getfoodPosition();
        gameState.food.y = getfoodPosition();
    }
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
 * @param {ReturnType<typeof getGameState>} gameState
 */
function drawGame(ctx, gameState) {
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    drawGrid(ctx);
    drawSnake(ctx, gameState.snake);
    drawFood(ctx, gameState.food);
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
 * @param {ReturnType<typeof getGameState>['food']} food 
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
 * @param {ReturnType<typeof getGameState>['snake']} snake 
 */
function drawSnake(ctx, snake) {
    snake.position.value.forEach(segment => {
        ctx.fillStyle = 'green';
        ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    })
}

/**
 * 
 * @param {ReturnType<typeof getGameState>} gameState 
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
}

/**
 * 
 * @param {ReturnType<typeof getGameState>} gameState 
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
 * @param {ReturnType<typeof getGameState>} gameState 
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
 * @param {ReturnType<typeof getGameState>} gameState 
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
    gameState.food.x = Math.floor(Math.random() * BOARD_SIZE);
    gameState.food.y = Math.floor(Math.random() * BOARD_SIZE);
}

/**
 * 
 * @param {ReturnType<typeof getGameState>} gameState 
 */
function addKeyListeners(gameState) {
    let pressed = '';
    let prevSpeed = gameState.snake.speed;
    document.addEventListener('keydown', event => {
        pressed = event.key;
        switch (event.key) {
            case 'ArrowLeft':
                if (gameState.snake.direction === 'right') return;
                gameState.snake.direction = 'left';
                break;
            case 'ArrowUp':
                if (gameState.snake.direction === 'down') return;
                gameState.snake.direction = 'up';
                break;
            case 'ArrowRight':
                if (gameState.snake.direction === 'left') return;
                gameState.snake.direction = 'right';
                break;
            case 'ArrowDown':
                if (gameState.snake.direction === 'up') return;
                gameState.snake.direction = 'down';
                break;
            default:
                break;
        }
        if (pressed === event.key && prevSpeed === gameState.snake.speed) {
            console.log('increase speed');
            prevSpeed = gameState.snake.speed;
            gameState.snake.speed = gameState.snake.speed * 2;
            return;
        }

    })
    document.addEventListener('keyup', event => {
        pressed = '';
        gameState.snake.speed = prevSpeed;
        console.log('normal speed');
    })
}

/**
 * 
 * @param {ReturnType<typeof getGameState>} gameState
 */
function animate(gameState) {
    updateGameState(gameState);
    drawGame(getContext(), gameState);
    setTimeout(() => {
        requestAnimationFrame(() => animate(gameState));
    }, 1 * 1000 / gameState.snake.speed);
}
const gameState = getGameState();
addKeyListeners(gameState);
animate(gameState);
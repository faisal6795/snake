import { Component } from '@angular/core';

const BOARD_SIZE = 20;
const COLORS = {
	HEAD: '#01579B',
	BODY: '#4FC3F7',
	DEFAULT: '#B2EBF2',
	GAME_OVER: '#D24D57',
	FRUIT: '#FF5722'
};
const CONTROLS = {
	LEFT: 'ArrowLeft',
	UP: 'ArrowUp',
	RIGHT: 'ArrowRight',
	DOWN: 'ArrowDown'
};

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	host: {
		'(document:keydown)': 'handleKeyboardEvents($event)'
	}
})

export class AppComponent {
	public board = [];
	public obstacles = [];
	public tempDirection: string;
	public isGameOver: boolean;
	public gameStarted: boolean;
	public score = 0;
	public highscore = 0;
	public interval: number;
	public positionTimer: any;
	public fruit = { x: -1, y: -1 }
	public snake = {
		direction: CONTROLS.LEFT,
		parts: [{ x: -1, y: -1 }]
	}

	constructor() {
		this.highscore = +localStorage.getItem('highscore') || this.highscore;
		this.setBoard();
	}

	setBoard() {
		this.board = [];
		for (let i = 0; i < BOARD_SIZE; i++) {
			this.board[i] = [];
			for (let j = 0; j < BOARD_SIZE; j++) {
				this.board[i][j] = false;
			}
		}
	}

	handleKeyboardEvents(event: any) {
		if (event.key === CONTROLS.LEFT && this.snake.direction !== CONTROLS.RIGHT) {
			this.tempDirection = CONTROLS.LEFT;
		} else if (event.key === CONTROLS.UP && this.snake.direction !== CONTROLS.DOWN) {
			this.tempDirection = CONTROLS.UP;
		} else if (event.key === CONTROLS.RIGHT && this.snake.direction !== CONTROLS.LEFT) {
			this.tempDirection = CONTROLS.RIGHT;
		} else if (event.key === CONTROLS.DOWN && this.snake.direction !== CONTROLS.UP) {
			this.tempDirection = CONTROLS.DOWN;
		}
		event.target && this.preventDefaultForArrowKeys(event);
	}

	preventDefaultForArrowKeys(event: KeyboardEvent) {
		if ([CONTROLS.DOWN, CONTROLS.UP, CONTROLS.RIGHT, CONTROLS.LEFT].includes(event.key)) {
			event.preventDefault();
		}
	}

	navigateSnake(direction: string) {
		this.handleKeyboardEvents({ key: direction });
	}

	setColors(column: number, row: number): string {
		if (this.isGameOver) return COLORS.GAME_OVER;
		else if (this.fruit.x === row && this.fruit.y === column) return COLORS.FRUIT;
		else if (this.snake.parts[0].x === row && this.snake.parts[0].y === column) return COLORS.HEAD;
		else if (this.board[column][row]) return COLORS.BODY;
		return COLORS.DEFAULT;
	}

	updatePositions() {
		const newHead = this.repositionHead();
		let thisRef = this;
		if (this.boardCollision(newHead)) return this.gameOver();
		if (this.selfCollision(newHead)) return this.gameOver();
		else if (this.fruitCollision(newHead)) this.eatFruit();

		let oldTail = this.snake.parts.pop();
		this.board[oldTail.y][oldTail.x] = false;

		this.snake.parts.unshift(newHead);
		this.board[newHead.y][newHead.x] = true;

		this.snake.direction = this.tempDirection;
		this.positionTimer = setTimeout(() => thisRef.updatePositions(), thisRef.interval);
	}

	repositionHead() {
		let newHead = Object.assign({}, this.snake.parts[0]);
		switch (this.tempDirection) {
			case CONTROLS.LEFT: newHead.x -= 1;
				break;
			case CONTROLS.RIGHT: newHead.x += 1;
				break;
			case CONTROLS.UP: newHead.y -= 1;
				break;
			case CONTROLS.DOWN: newHead.y += 1;
				break;
		}
		return newHead;
	}

	randomNumber(): number {
		return Math.floor(Math.random() * BOARD_SIZE);
	}

	boardCollision(part: any): boolean {
		return part.x === BOARD_SIZE || part.x === -1 || part.y === BOARD_SIZE || part.y === -1;
	}

	selfCollision(part: any): boolean {
		return this.board[part.y][part.x];
	}

	fruitCollision(part: any): boolean {
		return this.fruit.x === part.x && this.fruit.y === part.y;
	}

	resetFruit() {
		const x = this.randomNumber(),
			y = this.randomNumber();
		if (this.board[y][x]) return this.resetFruit();
		this.fruit = { x, y };
	}

	eatFruit() {
		this.score++;
		const tail = Object.assign({}, this.snake.parts[this.snake.parts.length - 1]);
		this.snake.parts.push(tail);
		this.resetFruit();
		if (this.score % 3 === 0) this.interval -= 15;
	}

	gameOver() {
		this.highscore = this.score > +this.highscore ? this.score : this.highscore;
		localStorage.setItem('highscore', this.highscore.toString());
		this.isGameOver = true;
		this.gameStarted = false;
		this.setBoard();
	}

	newGame() {
		this.resetBoard();
		clearTimeout(this.positionTimer);
		this.isGameOver = false;
		this.gameStarted = true;
		this.score = 0;
		this.tempDirection = CONTROLS.LEFT;
		this.interval = 300;
		this.snake = {
			direction: CONTROLS.LEFT,
			parts: []
		};
		for (let i = 0; i < 3; i++) {
			this.snake.parts.push({ x: 8 + i, y: 8 });
		}
		this.resetFruit();
		this.updatePositions();
	}

	resetBoard() {
		for (let i = 0; i < BOARD_SIZE; i++) {
			for (let j = 0; j < BOARD_SIZE; j++) {
				this.board[i][j] = false;
			}
		}
	}
}

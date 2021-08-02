
import React, {useEffect, useState} from 'react';
import {
  randomIntFromInterval,
  useInterval,
} from '../utils/utils.js';

import './Board.css';


class LinkedListNode {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class LinkedList {
  constructor(value) {
    const node = new LinkedListNode(value);
    this.head = node;
    this.tail = node;
  }
}

const Direction = {
  UP: 'UP',
  RIGHT: 'RIGHT',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
};

const BOARD_SIZE = 20;

const getStartingSnakeLLValue = board => {
  const rowSize = board.length;
  const colSize = board[0].length;
  const startingRow = Math.round(rowSize / 3);
  const startingCol = Math.round(colSize / 3);
  const startingCell = board[startingRow][startingCol];
  return {
    row: startingRow,
    col: startingCol,
    cell: startingCell,
  };
};

const Board = () => {
  const [score, setScore] = useState(0);
  const [board, ] = useState(createBoard(BOARD_SIZE));
  const [snake, setSnake] = useState(
    new LinkedList(getStartingSnakeLLValue(board)),
  );
  const [snakeCells, setSnakeCells] = useState(
    new Set([snake.head.value.cell]),
  );
  // Naively set the starting food cell 5 cells away from the starting snake cell.
  const [foodCell, setFoodCell] = useState(snake.head.value.cell + 5);
  const [direction, setDirection] = useState(Direction.RIGHT);
  const [speed,setSpeed] = useState(150);
  
  useEffect(() => {
    window.addEventListener('keydown', e => {
      handleKeydown(e);
    });
  }, []);
  // `useInterval` is needed; you can't naively do `setInterval` in the
  // `useEffect` above. See the article linked above the `useInterval`
  // definition for details.
  useInterval(() => {
      moveSnake();
      handleSpeed();
  }, speed);

  const handleKeydown = e => {
    const newDirection = getDirectionFromKey(e.key);
    const isValidDirection = newDirection !== '';
    if (!isValidDirection) return;
    const snakeWillRunIntoItself =
      getOppositeDirection(newDirection) === direction && snakeCells.size > 1;
    // Note: this functionality is currently broken, for the same reason that
    // `useInterval` is needed. Specifically, the `direction` and `snakeCells`
    // will currently never reflect their "latest version" when `handleKeydown`
    // is called. I leave it as an exercise to the viewer to fix this :P
    if (snakeWillRunIntoItself) return;
    setDirection(newDirection);
  };

  const moveSnake = () => {
    const currentHeadCoords = {
      row: snake.head.value.row,
      col: snake.head.value.col,
    };

    const nextHeadCoords = getCoordsInDirection(currentHeadCoords, direction);
    // if (isOutOfBounds(nextHeadCoords, board)) {
    //   handleGameOver();
    //   return;
    // }
    const nextHeadCell = board[nextHeadCoords.row][nextHeadCoords.col];
    if (snakeCells.has(nextHeadCell)) {
      handleGameOver();
      return;
    }

    const newHead = new LinkedListNode({
      row: nextHeadCoords.row,
      col: nextHeadCoords.col,
      cell: nextHeadCell,
    });
    const currentHead = snake.head;
    snake.head = newHead;
    currentHead.next = newHead;

    const newSnakeCells = new Set(snakeCells);
    newSnakeCells.delete(snake.tail.value.cell);
    newSnakeCells.add(nextHeadCell);
    

      
    snake.tail = snake.tail.next;
    if (snake.tail === null) snake.tail = snake.head;

    const foodConsumed = nextHeadCell === foodCell;
    if (foodConsumed) {      
      growSnake(newSnakeCells);      
      handleFoodConsumption(newSnakeCells);
    }
    setSnakeCells(newSnakeCells);
  };

  // This function mutates newSnakeCells.
  const growSnake = newSnakeCells => {
    const growthNodeCoords = getGrowthNodeCoords(snake.tail, direction);
    if (isOutOfBounds(growthNodeCoords, board)) {
      // Snake is positioned such that it can't grow; don't do anything.
      return;
    }
    const newTailCell = board[growthNodeCoords.row][growthNodeCoords.col];
    const newTail = new LinkedListNode({
      row: growthNodeCoords.row,
      col: growthNodeCoords.col,
      cell: newTailCell,
    });
    const currentTail = snake.tail;
    snake.tail = newTail;
    snake.tail.next = currentTail;

    newSnakeCells.add(newTailCell);
  };

  const handleFoodConsumption = newSnakeCells => {
    const maxPossibleCellValue = BOARD_SIZE * BOARD_SIZE;
    let nextFoodCell;
    
    while (true) {
      nextFoodCell = randomIntFromInterval(1, maxPossibleCellValue);
      if (newSnakeCells.has(nextFoodCell) || foodCell === nextFoodCell)
        continue;
      break;
    }   

    setFoodCell(nextFoodCell);    
    setScore(score + 1);
  };

  const handleGameOver = () => {
    alert("------------------------------------\n      Game Over \n------------------------------------\n  You scored "+score+" points.\n  Hit Enter to play again !\n------------------------------------")  
    setScore(0);
    const snakeLLStartingValue = getStartingSnakeLLValue(board);
    setSnake(new LinkedList(snakeLLStartingValue));
    setFoodCell(snakeLLStartingValue.cell + 6);
    setSnakeCells(new Set([snakeLLStartingValue.cell]));
    setDirection(Direction.RIGHT);
  };
  const handleSpeed = () => {
    if (score > 5) setSpeed(130);
    else if (score > 8) setSpeed(100);
    else if (score > 12) setSpeed(100);
    else if (score > 16) setSpeed(90);
    else if (score > 18) setSpeed(90);
    else if (score > 22) setSpeed(70);
    else if (score > 26) setSpeed(70);
    else if (score > 30) setSpeed(50);
    
};
  return (
      <div style={{ marginLeft: "auto", marginRight: "auto", textAlign: "center" }}>
          <h3>THE SNAKE GAME</h3>
          <h1>Score : {score} points </h1><br/>
      <div className="board">
        {board.map((row, rowIdx) => (
          <div key={rowIdx} className="row">
            {row.map((cellValue, cellIdx) => {
              const className = getCellClassName(
                cellValue,
                foodCell,
                snakeCells,
                direction,
              );
              return <div key={cellIdx} className={className}></div>;
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

const createBoard = BOARD_SIZE => {
  let counter = 1;
  const board = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    const currentRow = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      currentRow.push(counter++);
    }
    board.push(currentRow);
  }
  return board;
};

const getCoordsInDirection = (coords, direction) => {
    if (direction === Direction.UP) {
        if (coords.row - 1 < 0) {
            return {
            row: BOARD_SIZE-1,
            col: coords.col,
            };
        }
        return {
        row: coords.row - 1,
        col: coords.col,
        };
    }
  if (direction === Direction.RIGHT) {
    if (coords.col + 1 > BOARD_SIZE-1) {
            return {
            row: coords.row,
            col: 0,
            };
        }
      return {
      row: coords.row,
      col: coords.col + 1,
    };
  }
  if (direction === Direction.DOWN) {
      if (coords.row + 1 > BOARD_SIZE-1) {
            return {
            row: 0,
            col: coords.col,
            };
        }
    return {
      row: coords.row + 1,
      col: coords.col,
    };
  }
  if (direction === Direction.LEFT) {
      if (coords.col - 1 < 0) {
            return {
            row: coords.row,
            col: BOARD_SIZE-1,
            };
        }
    return {
      row: coords.row,
      col: coords.col - 1,
    };
  }
};

const isOutOfBounds = (coords, board) => {
  const {row, col} = coords;
  if (row < 0 || col < 0) return true;
  if (row >= board.length || col >= board[0].length) return true;
  return false;
};

const getDirectionFromKey = key => {
  if (key === 'ArrowUp') return Direction.UP;
  if (key === 'ArrowRight') return Direction.RIGHT;
  if (key === 'ArrowDown') return Direction.DOWN;
  if (key === 'ArrowLeft') return Direction.LEFT;
  return '';
};

const getNextNodeDirection = (node, currentDirection) => {
  if (node.next === null) return currentDirection;
  const {row: currentRow, col: currentCol} = node.value;
  const {row: nextRow, col: nextCol} = node.next.value;
  if (nextRow === currentRow && nextCol === currentCol + 1) {
    return Direction.RIGHT;
  }
  if (nextRow === currentRow && nextCol === currentCol - 1) {
    return Direction.LEFT;
  }
  if (nextCol === currentCol && nextRow === currentRow + 1) {
    return Direction.DOWN;
  }
  if (nextCol === currentCol && nextRow === currentRow - 1) {
    return Direction.UP;
  }
  return '';
};

const getGrowthNodeCoords = (snakeTail, currentDirection) => {
  const tailNextNodeDirection = getNextNodeDirection(
    snakeTail,
    currentDirection,
  );
  const growthDirection = getOppositeDirection(tailNextNodeDirection);
  const currentTailCoords = {
    row: snakeTail.value.row,
    col: snakeTail.value.col,
  };
  const growthNodeCoords = getCoordsInDirection(
    currentTailCoords,
    growthDirection,
  );
  return growthNodeCoords;
};

const getOppositeDirection = direction => {
  if (direction === Direction.UP) return Direction.DOWN;
  if (direction === Direction.RIGHT) return Direction.LEFT;
  if (direction === Direction.DOWN) return Direction.UP;
  if (direction === Direction.LEFT) return Direction.RIGHT;
};

const getCellClassName = (
  cellValue,
  foodCell,
  snakeCells,
  direction,
) => {
    let className = 'cell';
    if (cellValue === foodCell) className = 'cell cell-food';
    if (snakeCells.has(cellValue)) className = 'cell cell-snake-body';
    if ([...snakeCells][snakeCells.size - 1] === cellValue) {
        
        className = 'cell cell-snake-head';
        if (direction === Direction.UP) className = className + ' go-top';
        else if (direction === Direction.RIGHT) className = className + ' go-right';
        else if (direction === Direction.DOWN) className = className + ' go-bottom';
        else if (direction === Direction.LEFT) className = className + ' go-left';       
    }
    else if ([...snakeCells][0] === cellValue) {
        
        className = 'cell cell-snake-body';
        if (direction === Direction.UP) className = className + ' go-bottom';
        else if (direction === Direction.RIGHT) className = className + ' go-left';
        else if (direction === Direction.DOWN) className = className + ' go-top';
        else if (direction === Direction.LEFT) className = className + ' go-right';       
    }
    
  return className;
};

export default Board;

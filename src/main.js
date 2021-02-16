import _ from "lodash";
import ut from "util";
import { useImmer } from "use-immer";
import React, { useState } from "react";
import blessed from "blessed";
import { render } from "react-blessed";

const ROWS = 32;

const COLS = 32;

const INTERVAL = 1000;

const PARAMS = { born: { min: 3, max: 3 }, live: { min: 2, max: 3 } };

function gridNew(rows, cols) {
  let grid = new Array(rows);
  for (let y = 0; y < rows; y++) {
    grid[y] = new Array(cols);
  }
  return grid;
}

function gridSeed(grid, rows, cols) {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      grid[y][x] = Math.round(0.8 * Math.random());
    }
  }
}

function gridCreate(rows, cols) {
  let grid = gridNew(rows, cols);
  gridSeed(grid, rows, cols);
  return grid;
}

function gridCount(grid, y, x, rows, cols) {
  let sum = 0;
  for (let v = -1; v < 2; v++) {
    for (let h = -1; h < 2; h++) {
      let yi = (y + v + rows) % rows;
      let xi = (x + h + cols) % cols;
      sum += grid[yi][xi];
    }
  }
  sum -= grid[y][x];
  return sum;
}

function gridNext(grid, rows, cols) {
  let next = gridNew(rows, cols);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let curr = grid[y][x];
      let near = gridCount(grid, y, x, rows, cols);
      if (curr === 0 && near === 3) {
        next[y][x] = 1;
      } else if (curr === 1 && (near < 2 || near > 3)) {
        next[y][x] = 0;
      } else {
        next[y][x] = curr;
      }
    }
  }
  return next;
}

function Button({ action, color, disabled, left, text, top }) {
  return (
    <button
      left={left || 0}
      top={top || 0}
      content={text}
      shrink={true}
      mouse={true}
      onPress={function () {
        if (action && !disabled) {
          action();
        }
      }}
      padding={{ top: 1, right: 2, bottom: 1, left: 2 }}
      style={{
        bg: !disabled ? color : "black",
        fg: !disabled ? "white" : "gray",
        focus: { bold: true },
      }}
    ></button>
  );
}

function TimeControl(props) {
  return (
    <box shrink={true}>
      <Button
        left={1}
        text="START"
        color="green"
        disabled={props.state.timer}
        action={props.fn.start}
      ></Button>
      <Button
        left={10}
        text="STOP"
        color="red"
        disabled={!props.state.timer}
        action={props.fn.stop}
      ></Button>
      <Button
        left={21}
        text="NEXT"
        color="blue"
        disabled={props.state.timer}
        action={props.fn.next}
      ></Button>
      <Button
        left={54}
        text="RESET"
        color="grey"
        action={props.fn.reset}
      ></Button>
    </box>
  );
}

function initialState(rows, cols) {
  return {
    timer: null,
    rows: rows,
    cols: cols,
    grid: gridCreate(rows, cols),
    counter: 0,
  };
}

function GridView(props) {
  let { cols, grid, rows } = props.state;
  return (
    <box label=" Grid " width={2 + 2 * rows} height={2 + cols} border="line">
      {grid.map(function (row, i) {
        return row.map(function (col, j) {
          return (
            <box
              top={i}
              width={2}
              left={2 * j}
              key={i + "_" + j}
              content=""
              style={{ bg: 1 == col ? "yellow" : "black" }}
              shrink={true}
            ></box>
          );
        });
      })}
    </box>
  );
}

function App() {
  let [state, setState] = useImmer(initialState(ROWS, COLS));
  let next_fn = function () {
    let { cols, grid, rows, timer } = state;
    setState(function (draft) {
      draft.counter++;
      draft.grid = gridNext(grid, rows, cols);
    });
  };
  let actions = {
    reset: function () {
      let { cols, grid, rows } = state;
      setState(function (draft) {
        draft.grid = gridCreate(rows, cols);
      });
    },
    next: next_fn,
    start: function () {
      let { timer } = state;
      if (!timer) {
        timer = setInterval(next_fn, INTERVAL);
        setState(function (draft) {
          draft.timer = timer;
        });
      }
    },
    stop: function () {
      let { timer } = state;
      if (timer) {
        clearInterval(timer);
        setState(function (draft) {
          draft.timer = null;
        });
      }
    },
  };
  return (
    <box left={2} top={1} shrink={true}>
      <box shrink={true}>
        <TimeControl state={state} fn={actions}></TimeControl>
      </box>
      <box top={4} shrink={true}>
        <GridView state={state} fn={actions}></GridView>
      </box>
      <box
        top={1}
        width={40}
        shrink={true}
        content={"" + state.counter}
        left={80}
      ></box>
    </box>
  );
}

function Screen() {
  const screen = blessed.screen({
    autoPadding: true,
    smartCSR: true,
    title: "Tui Game of Life",
  });
  screen.key(["q", "C-c", "Esc"], function () {
    this.destroy();
  });
  return screen;
}

function main() {
  render(<App></App>, Screen());
}

main()
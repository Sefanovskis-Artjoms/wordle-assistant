export function createGrid(container, rows = 6, columns = 5) {
  container.innerHTML = "";

  for (let i = 0; i < rows; i++) {
    const rowDiv = document.createElement("div");
    rowDiv.className = `input-row input-row-${i}`;

    for (let j = 0; j < columns; j++) {
      const input = document.createElement("input");
      input.type = "text";
      input.className = "input";
      input.placeholder = " ";

      input.dataset.row = i;
      input.dataset.column = j;

      rowDiv.appendChild(input);
    }
    container.appendChild(rowDiv);
  }
}

export function focusCell(cellElement) {
  cellElement.focus();
}

export function getNextInputElement(
  direction,
  currentInputElement,
  maxRows = 6,
  maxColumns = 5
) {
  // since counting starts from 0 in order for everyting to work as indended
  // row and column is shifted by +1 at start and by -1 in the end
  const row = +currentInputElement.dataset.row + 1;
  const column = +currentInputElement.dataset.column + 1;
  let nextRow;
  let nextColumn;
  if (direction === "ArrowRight") {
    nextRow = row;
    nextColumn = (column % maxColumns) + 1;
  } else if (direction === "ArrowLeft") {
    nextRow = row;
    nextColumn = column - 1 || maxColumns;
  } else if (direction === "ArrowUp") {
    nextRow = row - 1 || maxRows;
    nextColumn = column;
  } else if (direction === "ArrowDown") {
    nextRow = (row % maxRows) + 1;
    nextColumn = column;
  } else if (direction === "next") {
    if (column === maxColumns && row === maxRows) return;
    nextColumn = (column % maxColumns) + 1;
    nextRow = nextColumn === 1 ? row + 1 : row;
  } else if (direction === "previous") {
    if (column === 1 && row === 1) return;
    nextColumn = column - 1 || maxColumns;
    nextRow = nextColumn === maxColumns ? row - 1 : row;
  }
  return document.querySelector(
    `[data-row="${nextRow - 1}"][data-column="${nextColumn - 1}"]`
  );
}

export function updateType(inputElement, type) {
  inputElement.classList.remove("absent", "present", "correct");
  inputElement.classList.add(type);
}

export function clearCell(inputElement) {
  inputElement.classList.remove("absent", "present", "correct");
  inputElement.value = "";
}

export function insertWordIntoGrid(gridContainer, word) {
  let isWordAlreadyInGrid = false;
  let isPlaceForWord = false;
  let indexOfRowToInsert = null;
  const rows = gridContainer.querySelectorAll(".input-row");
  for (const [i, row] of rows.entries()) {
    const inputs = row.querySelectorAll(".input");

    const lettersInRow = Array.from(inputs).map((input) => input.value);
    if (lettersInRow.join("") === word) {
      isWordAlreadyInGrid = true;
      break;
    }

    if (isPlaceForWord) continue;
    const hasNoType = Array.from(inputs).every((input) => {
      return (
        !input.classList.contains("absent") &&
        !input.classList.contains("present") &&
        !input.classList.contains("correct")
      );
    });
    if (hasNoType) {
      isPlaceForWord = true;
      indexOfRowToInsert = i;
    }
  }

  if (isWordAlreadyInGrid || !isPlaceForWord) return false;
  rows[indexOfRowToInsert]
    .querySelectorAll(".input")
    .forEach((input, index) => {
      input.value = word[index];
    });
}

export function checkDisplayedFillerWords(words) {
  const rows = document.querySelectorAll(".input-row");
  const presentWords = new Set();
  rows.forEach((row) => {
    const word = Array.from(row.querySelectorAll(".input"))
      .map((input) => input.value)
      .join("")
      .toUpperCase();
    if (words.includes(word)) {
      presentWords.add(word);
    }
  });
  return [...presentWords];
}

export function setSuggestions(container) {
  container.innerHTML = `<div class="suggestions__empty">Start search to get the results</div>`;
}

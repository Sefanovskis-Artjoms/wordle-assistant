"use strict";

const radioButtonContainer = document.querySelector(".radio-button-container");
const radioButtons = document.querySelectorAll('input[name="letter-status"]');
const inputArea = document.querySelector(".inputs");
const suggestionsContainer = document.querySelector(".suggestions");
const searchBtn = document.querySelector(".search");

const arrowKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
const deleteKeys = ["Delete", "Backspace"];
const numberKeys = ["1", "2", "3"];
const letterKeys = /^[a-z]$/i; // a-z case insensitive

const state = {};
initializeState();

searchBtn.addEventListener("click", () => handleSearchWords());
inputArea.addEventListener("click", (e) => handleAddTypeWithClick(e));
inputArea.addEventListener("keydown", (e) => handleKeyDown(e));
radioButtonContainer.addEventListener("click", (e) => handleTypeSelection(e));

const initializeState = function () {
  state.currentInputElement = null;
  state.currentType = null;
  state.letterDetails = {
    absent: new Map(),
    correct: [new Map(), new Map(), new Map(), new Map(), new Map()],
    present: [new Map(), new Map(), new Map(), new Map(), new Map()],
    // TODO: implement logic where letters can be present multiple times and can be absent if entered too many times
    // It could be implemented by introducing another category of letters in a state
  };
};

const handleKeyDown = (e) => {
  e.preventDefault();
  const targetElement = e.target;
  if (!targetElement.classList.contains("input")) return;
  state.currentInputElement = targetElement;

  if (e.key.match(letterKeys)) {
    handleLetterInput(e.key);
    return;
  }
  if (arrowKeys.includes(e.key)) {
    switchLetterBox(e.key);
    return;
  }
  if (numberKeys.includes(e.key)) {
    const type =
      e.key === "1" ? "absent" : e.key === "2" ? "present" : "correct";
    addType(state.currentInputElement, type, state.currentInputElement.value);
    return;
  }
  if (deleteKeys.includes(e.key)) {
    deleteLetter();
    return;
  }
};

const handleTypeSelection = (e) => {
  const target = e.target;
  if (target.name !== "letter-status") return;

  const clickedValue = target.value;
  // If the same radio is clicked again, treat it as a toggle to uncheck it.
  if (state.currentType === clickedValue) {
    target.checked = false;
    state.currentType = null;
  } else {
    state.currentType = clickedValue;
  }
};

const handleSearchWords = async function () {
  const words = await getWords();
  const filteredWords = filterWords(words);
  suggestionsContainer.innerHTML = "";
  filteredWords.forEach((word) => {
    suggestionsContainer.innerHTML += `<div class="suggestion">${word}</div>`;
  });
};

const getWords = async function () {
  const response = await fetch("valid-wordle-words.txt");
  const text = await response.text();
  const words = text.split("\n").map((word) => word.trim().toUpperCase());
  return words;
};

const canBeInAbsent = function (letter, presentLettersArrays) {
  // Letter can be absent if if in one position it is present but there are no other instances

  // If letter is already present
  for (const presentArray of presentLettersArrays) {
    if (presentArray.includes(letter)) return false;
  }
  return true;
};
const isInAbsent = function (letter, absentLetters) {
  // If letter is already absent
  return absentLetters.includes(letter);
};

const canBeInCorrect = function (
  letter,
  lettersColumn,
  absentLetters,
  correctLettersArray,
  presentLettersArrays
) {
  // If letter is already absent
  if (absentLetters.includes(letter)) return false;
  // If exact same letter in the same column is already maked as present
  if (presentLettersArrays[lettersColumn].includes(letter)) return false;
  // If letter in that column is already correct and its other letter
  if (
    correctLettersArray[lettersColumn] !== null &&
    correctLettersArray[lettersColumn] !== letter
  ) {
    return false;
  }
  return true;
};
const isInCorrect = function (letter, lettersColumn, correctLettersArray) {
  // If letter in that column is already correct
  return correctLettersArray[lettersColumn] === letter;
};

const canBeInPresent = function (letter, absentLetters, correctLettersArray) {
  // If letter is already absent
  if (absentLetters.includes(letter)) return false;
  // If letter is already correct
  if (correctLettersArray.includes(letter)) return false;
  return true;
};
const isInPresent = function (letter, lettersColumn, presentLettersArrays) {
  // If letter is already present in any column
  for (let i = 0; i < presentLettersArrays.length; i++) {
    if (i == lettersColumn && presentLettersArrays[i].includes(letter))
      return true;
  }
  return false;
};

function switchType(targetElement, newType) {
  targetElement.classList.remove("correct");
  targetElement.classList.remove("absent");
  targetElement.classList.remove("present");
  targetElement.classList.add(newType);
}

const handleLetterInput = function (letter) {
  state.currentInputElement.value += letter.toUpperCase();
  if (state.currentInputElement.value.length === 1) {
    return;
  }
  if (state.currentInputElement.value.length > 1) {
    const nextLetter = state.currentInputElement.value.at(-1).toUpperCase();
    state.currentInputElement.value = state.currentInputElement.value
      .at(0)
      .toUpperCase();
    switchLetterBox("next");
    state.currentInputElement.value = nextLetter;
  }
};

const switchLetterBox = function (direction) {
  const row = +state.currentInputElement.dataset.row;
  const column = +state.currentInputElement.dataset.column;
  let nextElement;
  if (direction === "ArrowRight") {
    nextElement = document.querySelector(
      `[data-row="${row}"][data-column="${(column % 5) + 1}"]`
    );
  } else if (direction === "ArrowLeft") {
    nextElement = document.querySelector(
      `[data-row="${row}"][data-column="${column - 1 || 5}"]`
    );
  } else if (direction === "ArrowUp") {
    nextElement = document.querySelector(
      `[data-row="${row - 1 || 6}"][data-column="${column}"]`
    );
  } else if (direction === "ArrowDown") {
    nextElement = document.querySelector(
      `[data-row="${(row % 6) + 1}"][data-column="${column}"]`
    );
  } else if (direction === "next") {
    if (column === 5 && row === 6) return;
    const nextColumn = (column % 5) + 1;
    const nextRow = nextColumn === 1 ? row + 1 : row;
    nextElement = document.querySelector(
      `[data-row="${nextRow}"][data-column="${nextColumn}"]`
    );
  } else if (direction === "previous") {
    if (column === 1 && row === 1) return;
    const previousColumn = column - 1 || 5;
    const previousRow = previousColumn === 5 ? row - 1 : row;
    nextElement = document.querySelector(
      `[data-row="${previousRow}"][data-column="${previousColumn}"]`
    );
  }
  if (!nextElement) return;
  state.currentInputElement = nextElement;
  state.currentInputElement.focus();
};

const handleAddTypeWithClick = (e) => {
  if (!state.currentType) return;

  const targetElement = e.target;
  if (!targetElement.classList.contains("input")) return;

  const letter = targetElement.value.toUpperCase();

  if (targetElement.value == "") return;
  if (targetElement.value.length > 1) return;
  if (!letterKeys.test(letter)) return;

  addType(targetElement, state.currentType, letter);
};

const addType = function (element, type, letter) {
  const row = element.dataset.row - 1;
  const column = element.dataset.column - 1;
  switch (type) {
    case "absent":
      if (!canBeInAbsent(letter, state.letterDetails.present)) return;
      if (!isInAbsent(letter, state.letterDetails.absent)) {
        state.letterDetails.absent.push(letter);
      }
      element.classList.add(type);
      break;

    case "correct":
      if (
        !canBeInCorrect(
          letter,
          column,
          state.letterDetails.absent,
          state.letterDetails.correct,
          state.letterDetails.present
        )
      )
        return;
      if (!isInCorrect(letter, column, state.letterDetails.correct)) {
        state.letterDetails.correct[column] = letter;
      }
      element.classList.add(type);
      break;

    case "present":
      if (
        !canBeInPresent(
          letter,
          state.letterDetails.absent,
          state.letterDetails.correct
        )
      )
        return;
      if (!isInPresent(letter, column, state.letterDetails.present)) {
        state.letterDetails.present[column].push(letter);
      }
      element.classList.add(type);
      break;

    default:
      return;
  }
};

const deleteLetter = function () {
  if (!state.currentInputElement) return;
  const hasAbsent = state.currentInputElement.classList.contains("absent");
  const hasPresent = state.currentInputElement.classList.contains("present");
  const hasCorrect = state.currentInputElement.classList.contains("correct");

  if (
    !hasAbsent &&
    !hasPresent &&
    !hasCorrect &&
    state.currentInputElement.value.length > 0
  ) {
    state.currentInputElement.value = "";
    return;
  }
  if (state.currentInputElement.value.length === 0) {
    switchLetterBox("previous");
    return;
  }

  const letterToRemove = state.currentInputElement.value.toUpperCase();

  if (hasCorrect) {
    state.currentInputElement.classList.remove("correct");
    state.currentInputElement.value = "";

    const sameColumnCorrect = document.querySelectorAll(
      `.correct[data-column="${state.currentInputElement.dataset.column}"]`
    );

    let hasOtherCorrect = false;
    for (const element of sameColumnCorrect) {
      if (element.value.toUpperCase() === letterToRemove) {
        hasOtherCorrect = true;
        break;
      }
    }
    if (!hasOtherCorrect) {
      state.letterDetails.correct[
        state.currentInputElement.dataset.column - 1
      ] = null;
    }
    return;
  }
  if (hasAbsent) {
    state.currentInputElement.classList.remove("absent");
    state.currentInputElement.value = "";

    const otherAbsentLetters = document.querySelectorAll(".absent");
    let hasOtherAbsent = false;
    for (const element of otherAbsentLetters) {
      if (element.value.toUpperCase() === letterToRemove) {
        hasOtherAbsent = true;
        break;
      }
    }
    if (!hasOtherAbsent) {
      state.letterDetails.absent = state.letterDetails.absent;
    }
    return;
  }
};

const filterWords = function (words) {
  // Get all words where correct letters match
  const wordsWithCorrectLetters = words.filter((word) => {
    for (let i = 0; i < state.letterDetails.correct.length; i++) {
      if (
        state.letterDetails.correct[i] !== null &&
        word.charAt(i) !== state.letterDetails.correct[i]
      ) {
        return false;
      }
    }
    return true;
  });
  // Get all words where arent absent letters
  const wordsWithoutAbsentLetters = wordsWithCorrectLetters.filter((word) => {
    for (const letter of state.letterDetails.absent) {
      if (word.includes(letter)) return false;
    }
    return true;
  });
  // Get all words where present letters are included
  const wordsWithPresentLetters = wordsWithoutAbsentLetters.filter((word) => {
    const allPresentLetters = [...new Set(state.letterDetails.present.flat())];
    // Get all words where present letters are included
    for (const letter of allPresentLetters) {
      if (!word.includes(letter)) return false;
    }
    // Get all words where present letter is not in the incorrect position
    for (let i = 0; i < state.letterDetails.present.length; i++) {
      if (state.letterDetails.present[i].includes(word.charAt(i))) {
        return false;
      }
    }
    return true;
  });
  return wordsWithPresentLetters;
};

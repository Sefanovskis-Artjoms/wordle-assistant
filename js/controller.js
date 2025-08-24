import * as model from "./model/index.js";
import * as view from "./view/index.js";
import { getWords } from "./api.js";

const radioButtonContainer = document.querySelector(".radio-button-wrapper");
const inputArea = document.querySelector(".inputs");
const suggestionsContainer = document.querySelector(".suggestions");
const fillerList = document.querySelector(".filler-word-list");
const searchBtn = document.querySelector(".btn-search");
const resetBtn = document.querySelector(".btn-reset");

const arrowKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
const deleteKeys = ["Delete", "Backspace"];
const numberKeys = ["1", "2", "3"];
const searchKeys = ["Enter"];
const letterKeys = /^[a-z]$/i;

let wordList = [];
const state = new model.State();
view.createGrid(inputArea);
view.setSuggestions(suggestionsContainer);
view.displayFillerWords(fillerList, state.getFillerWords());
loadWords();

resetBtn.addEventListener("click", () => handleReset());
searchBtn.addEventListener("click", () => handleSearchWords());
inputArea.addEventListener("click", (e) => handleAddTypeWithClick(e));
inputArea.addEventListener("keydown", (e) => handleInputAreaKeyDown(e));
radioButtonContainer.addEventListener("click", (e) => handleTypeSelection(e));
suggestionsContainer.addEventListener("click", (e) =>
  handleGetWordFromSuggestions(e)
);
fillerList.addEventListener("click", (e) => handleGetWordFromFillers(e));

async function loadWords() {
  searchBtn.disabled = true;
  searchBtn.textContent = "Loading words...";
  wordList = await getWords();
  searchBtn.disabled = false;
  searchBtn.textContent = "Search";
}

const handleReset = function () {
  state.resetState();
  view.createGrid(inputArea);
  view.clearSearchResults(suggestionsContainer);
  manageFillerWordUse();
  radioButtonContainer
    .querySelectorAll("input")
    .forEach((input) => (input.checked = false));
  view.setSuggestions(suggestionsContainer);
};

const handleInputAreaKeyDown = (e) => {
  e.preventDefault();
  const targetElement = e.target;
  if (!targetElement.classList.contains("input")) return;
  state.currentInputElement = targetElement;
  if (e.key.match(letterKeys)) {
    handleLetterInput(e.key);
    manageFillerWordUse();
    return;
  }
  if (arrowKeys.includes(e.key)) {
    switchLetterBoxWithArrows(e.key);
    return;
  }
  if (numberKeys.includes(e.key)) {
    const type =
      e.key === "1" ? "absent" : e.key === "2" ? "present" : "correct";
    addType(state.currentInputElement, type);
    return;
  }
  if (deleteKeys.includes(e.key)) {
    deleteLetter();
    manageFillerWordUse();
    return;
  }
  if (searchKeys.includes(e.key)) {
    handleSearchWords();
    return;
  }
};

const handleLetterInput = function (letter) {
  state.currentInputElement.value += letter.toUpperCase();
  if (state.currentInputElement.value.length <= 1) {
    return;
  }

  const nextLetter = state.currentInputElement.value.at(-1).toUpperCase();
  state.currentInputElement.value = state.currentInputElement.value
    .at(0)
    .toUpperCase();
  const nextElement = view.getNextInputElement(
    "next",
    state.currentInputElement
  );
  if (!nextElement) return;
  if (
    nextElement.classList.contains("correct") ||
    nextElement.classList.contains("present") ||
    nextElement.classList.contains("absent")
  ) {
    return;
  }
  state.currentInputElement = nextElement;
  state.currentInputElement.value = nextLetter;
  view.focusCell(state.currentInputElement);
};

const switchLetterBoxWithArrows = function (direction) {
  const nextElement = view.getNextInputElement(
    direction,
    state.currentInputElement
  );
  state.currentInputElement = nextElement;
  view.focusCell(state.currentInputElement);
};

const addType = function (element, type) {
  const letter = element.value.toUpperCase();
  const column = +element.dataset.column;

  if (!letter) return;

  if (type === "absent") {
    if (!state.setAbsentLetter(letter)) {
      return;
    }
  } else if (type === "present") {
    if (!state.setPresentLetter(letter, column)) {
      return;
    }
  } else if (type === "correct") {
    if (!state.setCorrectLetter(letter, column)) {
      return;
    }
  }
  view.updateType(element, type);
};

const deleteLetter = function () {
  if (!state.currentInputElement) return;
  const hasAbsent = state.currentInputElement.classList.contains("absent");
  const hasPresent = state.currentInputElement.classList.contains("present");
  const hasCorrect = state.currentInputElement.classList.contains("correct");
  const letterToRemove = state.currentInputElement.value.toUpperCase();
  const letterColumn = +state.currentInputElement.dataset.column;

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
    state.currentInputElement = view.getNextInputElement(
      "previous",
      state.currentInputElement
    );
    view.focusCell(state.currentInputElement);
    return;
  }

  view.clearCell(state.currentInputElement);

  if (hasCorrect) {
    state.removeCorrectLetter(letterToRemove, letterColumn);
    return;
  }
  if (hasPresent) {
    state.removePresentLetter(letterToRemove, letterColumn);
    return;
  }
  if (hasAbsent) {
    state.removeAbsentLetter(letterToRemove);
    return;
  }
};

const handleTypeSelection = function (e) {
  const targetElement = e.target;
  if (targetElement.name !== "letter-status") return;

  const clickedValue = targetElement.value;
  // If the same radio is clicked again, treat it as a toggle to uncheck it.
  if (state.currentType === clickedValue) {
    targetElement.checked = false;
    state.currentType = null;
  } else {
    state.currentType = clickedValue;
  }
};

const handleAddTypeWithClick = function (e) {
  if (!state.currentType) return;

  const targetElement = e.target;
  if (!targetElement.classList.contains("input")) return;
  if (targetElement.value == "") return;
  if (targetElement.value.length > 1) return;
  if (!letterKeys.test(targetElement.value.toUpperCase())) return;

  addType(targetElement, state.currentType);
};

const handleSearchWords = function () {
  if (wordList.length === 0) return;
  const filteredWords = model.filterWords(
    wordList,
    state.getCorrectLetters(),
    state.getPresentLetters(),
    state.getAbsentLetters()
  );

  view.displaySearchResults(suggestionsContainer, filteredWords);
};

const handleGetWordFromSuggestions = function (e) {
  const targetElement = e.target;
  if (!targetElement.classList.contains("suggestions__result")) return;

  const word = targetElement.textContent.trim();
  view.insertWordIntoGrid(inputArea, word);
  manageFillerWordUse();
};

const handleGetWordFromFillers = function (e) {
  const targetElement = e.target;
  if (!targetElement.classList.contains("filler-word")) return;

  const word = targetElement.textContent.trim();
  view.insertWordIntoGrid(inputArea, word);
  manageFillerWordUse();
};

const manageFillerWordUse = function () {
  const usedWords = view.checkDisplayedFillerWords(state.getFillerWords());
  view.setUsedFillerWords(fillerList, usedWords);
};

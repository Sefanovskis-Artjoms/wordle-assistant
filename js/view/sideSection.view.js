export function displayFillerWords(container, words) {
  container.innerHTML = "";

  const fragment = document.createDocumentFragment();
  words.forEach((word) => {
    const element = document.createElement("li");
    element.className = "filler-word";
    element.textContent = word;
    fragment.appendChild(element);
  });

  container.appendChild(fragment);
}

export function setUsedFillerWords(container, usedWords) {
  const fillerWords = container.querySelectorAll(".filler-word");
  fillerWords.forEach((wordElement) => {
    const word = wordElement.textContent;
    if (usedWords.includes(word)) {
      wordElement.classList.add("used");
    } else {
      wordElement.classList.remove("used");
    }
  });
}

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

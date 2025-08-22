export function displaySearchResults(container, words) {
  container.innerHTML = "";
  if (words.length === 0) {
    container.innerHTML = `<div class="suggestions__no-results">No word matched given filters. It may be because we don't have necesarry word in our list or your query is incorrect.</div>`;
    return;
  }
  _renderByChunks(container, words);
}

function _renderByChunks(container, wordsToRender, chunkSize = 50) {
  let currentIndex = 0;

  function renderNextChunk() {
    const fragment = document.createDocumentFragment();
    const end = Math.min(currentIndex + chunkSize, wordsToRender.length);
    for (let i = 0; i < end; i++) {
      const element = document.createElement("div");
      element.className = "suggestions__result";
      element.textContent = wordsToRender[i];
      fragment.appendChild(element);
    }
    container.appendChild(fragment);
    currentIndex = end;

    if (currentIndex < wordsToRender.length) {
      requestAnimationFrame(renderNextChunk);
    }
  }

  renderNextChunk();
}

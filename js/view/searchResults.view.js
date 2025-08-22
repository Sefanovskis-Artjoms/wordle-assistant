export function displaySearchResults(container, words) {
  container.innerHTML = "";
  _renderByChunks(container, words);
}

export function displayEmptySearchResults(container, words) {
  container.innerHTML = `<span class="search__no-results">No word matched given filters. It may be because we don't have necesarry word in our list or your query is incorrect. Either way you can check the list of all possible combinations of letters for the given query for an inspiration.</span>`;
  return;
}

function _renderByChunks(container, elementsToRender, chunkSize = 50) {
  let currentIndex = 0;

  function renderNextChunk() {
    const fragment = document.createDocumentFragment();
    const end = Math.min(currentIndex + chunkSize, elementsToRender.length);
    for (let i = 0; i < end; i++) {
      const element = document.createElement("span");
      element.className = "search__result";
      element.textContent = elementsToRender[i];
      fragment.appendChild(element);
    }
    container.appendChild(fragment);
    currentIndex = end;

    if (currentIndex < elementsToRender.length) {
      requestAnimationFrame(renderNextChunk);
    }
  }

  renderNextChunk();
}

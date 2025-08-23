export class State {
  currentInputElement = null;
  currentType = null;
  #fillerWords = ["SLANT", "PRICE", "DOUGH", "BUMPY", "FAKED", "JOWLY"];
  #absentLetters = new Map();
  #correctLetters = [new Map(), new Map(), new Map(), new Map(), new Map()];
  #presentLetters = [new Map(), new Map(), new Map(), new Map(), new Map()];

  resetState() {
    this.currentInputElement = null;
    this.currentType = null;
    this.#absentLetters.clear();
    this.#correctLetters.forEach((map) => map.clear());
    this.#presentLetters.forEach((map) => map.clear());
  }

  getFillerWords() {
    return [...this.#fillerWords];
  }

  getAbsentLetters() {
    return [...this.#absentLetters.keys()];
  }

  getCorrectLetters() {
    return this.#correctLetters.map((map) => map.keys().next().value || null);
  }

  getPresentLetters() {
    return this.#presentLetters.map((map) => [...map.keys()]);
  }

  setAbsentLetter(letter) {
    if (!this.#canBeInAbsent(letter)) return false;
    if (this.#absentLetters.has(letter)) {
      this.#absentLetters.set(letter, this.#absentLetters.get(letter) + 1);
      return true;
    }
    this.#absentLetters.set(letter, 1);
    return true;
  }

  setCorrectLetter(letter, position) {
    if (!this.#canBeInCorrect(letter, position)) return false;
    if (this.#correctLetters[position].has(letter)) {
      this.#correctLetters[position].set(
        letter,
        this.#correctLetters[position].get(letter) + 1
      );
      return true;
    }
    this.#correctLetters[position].set(letter, 1);
    return true;
  }

  setPresentLetter(letter, position) {
    if (!this.#canBeInPresent(letter, position)) return false;
    if (this.#presentLetters[position].has(letter)) {
      this.#presentLetters[position].set(
        letter,
        this.#presentLetters[position].get(letter) + 1
      );
      return true;
    }
    this.#presentLetters[position].set(letter, 1);
    return true;
  }

  #canBeInAbsent(letter) {
    if (this.#absentLetters.has(letter)) return true;
    if (this.#correctLetters.some((map) => map.has(letter))) return false;
    if (this.#presentLetters.some((map) => map.has(letter))) return false;
    return true;
  }

  #canBeInCorrect(letter, position) {
    if (this.#correctLetters[position].has(letter)) return true;
    if (this.#correctLetters[position].size > 0) return false;
    if (this.#presentLetters[position].has(letter)) return false;
    if (this.#absentLetters.has(letter)) return false;
    return true;
  }

  #canBeInPresent(letter, position) {
    if (this.#presentLetters[position].has(letter)) return true;
    if (this.#absentLetters.has(letter)) return false;
    if (this.#correctLetters[position].has(letter)) return false;
    return true;
  }

  removeAbsentLetter(letter) {
    if (!this.#absentLetters.has(letter)) return;
    if (this.#absentLetters.get(letter) > 1) {
      this.#absentLetters.set(letter, this.#absentLetters.get(letter) - 1);
      return;
    }
    this.#absentLetters.delete(letter);
  }

  removePresentLetter(letter, position) {
    if (!this.#presentLetters[position].has(letter)) return;
    if (this.#presentLetters[position].get(letter) > 1) {
      this.#presentLetters[position].set(
        letter,
        this.#presentLetters[position].get(letter) - 1
      );
      return;
    }
    this.#presentLetters[position].delete(letter);
  }

  removeCorrectLetter(letter, position) {
    if (!this.#correctLetters[position].has(letter)) return;
    if (this.#correctLetters[position].get(letter) > 1) {
      this.#correctLetters[position].set(
        letter,
        this.#correctLetters[position].get(letter) - 1
      );
      return;
    }
    this.#correctLetters[position].delete(letter);
  }
}

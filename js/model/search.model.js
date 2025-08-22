export function filterWords(
  words,
  correctLetters,
  presentLetters,
  absentLetters
) {
  console.log(absentLetters);
  const absentSet = new Set(absentLetters);
  const allPresentLetters = [...new Set(presentLetters.flat())];

  return words.filter((word) => {
    // 1. Filter out words that dont contain correct letters
    for (let i = 0; i < correctLetters.length; i++) {
      if (correctLetters[i] === null) continue;
      if (word.charAt(i) !== correctLetters[i]) {
        return false;
      }
    }

    // 2. Filter out words that don't contain present letters
    for (const letter of allPresentLetters) {
      if (!word.includes(letter)) return false;
    }

    // 3. and 4. Filter out words that contain what it shouldn't
    for (let i = 0; i < word.length; i++) {
      const letter = word[i];

      // 3. Filter out words that contain absent letters
      if (absentSet.has(letter)) return false;

      // 4. Filter out words that have present letters in the wrong position
      if (!presentLetters[i]) continue;
      if (presentLetters[i].includes(letter)) {
        return false;
      }
    }

    return true;
  });
}

export async function getWords() {
  try {
    const response = await fetch("../valid-wordle-words.txt");
    if (!response.ok) {
      throw new Error("Error while fetching word file");
    }
    const text = await response.text();
    const words = text.split("\n").map((word) => word.trim().toUpperCase());
    return words;
  } catch (error) {
    console.error("Error while reading word file:", error);
    return [];
  }
}

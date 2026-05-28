export const isValidChunk = (chunk: string): boolean => {
    // check if the given chunk is a complete sentence or ends with a punctuation mark that typically indicates the end of a sentence.
    const sentenceEndingPunctuation = /[.!?…]$/; // regex to match common sentence-ending punctuation marks
    // Check if the chunks ends with comma or semicolon or colon which often indicates a natural pause in speech and can be a good point to update the transcript for better user experience.
    const pausePunctuation = /[,;:]$/; // regex to match common pause-indicating punctuation marks
    return sentenceEndingPunctuation.test(chunk.trim()) || pausePunctuation.test(chunk.trim());
}
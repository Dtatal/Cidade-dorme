import { JaroWinklerDistance } from 'natural';

export default function findSimilarValue(incorrectValue: string, predefinedValues: string[]): string | null {
  let maxSimilarity = 0;
  let closestMatch: string | null = null;

  // Iterate through predefined values
  for (const predefinedValue of predefinedValues) {
    const similarity = JaroWinklerDistance(incorrectValue, predefinedValue);
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      closestMatch = predefinedValue;
    }
  }

  return maxSimilarity > 0.8 ? closestMatch : null; // Adjust threshold as needed
}
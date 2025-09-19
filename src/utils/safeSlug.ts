export function encodePathSegmentSafe(input: string): string {
  // Encode all reserved chars, then replace '%' to avoid server auto-decoding
  // Example: 'CI/CD' -> 'CI~2FCD'
  return encodeURIComponent(input).replace(/%/g, '~');
}

export function decodePathSegmentSafe(input: string): string {
  // Reverse of encodePathSegmentSafe
  return decodeURIComponent(input.replace(/~/g, '%'));
}


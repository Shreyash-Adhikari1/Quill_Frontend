const HTML_TAG_PATTERN = /(?:<|&lt;|&#x?0*3c;)\s*\/?\s*[a-z][^>]*(?:>|&gt;|&#x?0*3e;)?/i;
const DANGEROUS_INLINE_PATTERN = /\b(?:on[a-z]+\s*=|javascript\s*:|vbscript\s*:|data\s*:\s*text\/html|srcdoc\s*=)/i;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

export function hasStoredXssPayload(value: string) {
  return HTML_TAG_PATTERN.test(value) || DANGEROUS_INLINE_PATTERN.test(value) || CONTROL_CHARACTER_PATTERN.test(value);
}

export function plainTextOnlyMessage(fieldName: string) {
  return `${fieldName} must be plain text, without HTML or script content`;
}

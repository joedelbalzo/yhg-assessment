/**
 * Validates an email address using a regular expression.
 *
 * @param {string} email - The email address to validate.
 * @returns {boolean} True if the email is valid, false otherwise.
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a code using a regular expression.
 *
 * @param {string} code - The code to validate.
 * @returns {boolean} True if the code is valid, false otherwise.
 */
export const isValidCode = (code: string): boolean => {
  const codeRegex = /^[A-Za-z0-9]{4,7}$/;
  return codeRegex.test(code);
};

/**
 * Validates a state or library input string.
 *
 * @param {string} input - The input string to validate.
 * @returns {boolean} True if the input is valid, false otherwise.
 */
export const isValidInput = (input: string): boolean => {
  const inputRegex = /^[A-Za-z' -]+$/; // Allows only letters, spaces, dashes, and apostrophes
  return inputRegex.test(input.trim());
};

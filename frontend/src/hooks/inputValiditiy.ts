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
  const codeRegex = /^\d{1,10}$/; // Adjust this regex according to the valid code format
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

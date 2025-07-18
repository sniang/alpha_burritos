/**
 * Gets the current timestamp in ISO-like format based on Europe/Paris timezone.
 * Format: YYYY-MM-DD HH:MM:SS
 * 
 * @returns {string} Formatted timestamp string
 * @author Samuel Niang
 */
export const getCurrentTimestamp = () => {
  const now = new Date();

  const options = {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };

  const parts = new Intl.DateTimeFormat('fr-FR', options)
    .formatToParts(now)
    .reduce((acc, part) => {
      if (part.type !== 'literal') acc[part.type] = part.value;
      return acc;
    }, {});

  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
};

/**
 * Extracts year, month, and day from a filename with format xxx-YYYY-MM-DD_xxx.json.
 * 
 * @param {string} jsonFilename - Filename to parse
 * @returns {Object} Object containing year, month, and day as strings
 * @throws {Error} If filename format is invalid or year/month/day format is incorrect
 * @author Samuel Niang
 */
export const parseDateFromFilename = (jsonFilename) => {
  const match = jsonFilename.match(/-(\d{4})-(\d{2})-(\d{2})_/);
  if (!match) {
    throw new Error("Invalid filename format: year, month, or day not found.");
  }
  const [, year, month, day] = match;
  return { year, month, day };
};

/**
 * Ensures a number is formatted as a two-digit string.
 * Examples: 1 -> "01", 10 -> "10"
 * 
 * @param {number|string} number - The number to format
 * @returns {string} Two-digit formatted string
 * @author Samuel Niang
 */
export const padToTwoDigits = (number) => String(number).padStart(2, "0");

/**
 * Validates a filename to prevent directory traversal attacks.
 * Ensures the file has a .json extension and doesn't contain path traversal patterns.
 * 
 * @param {string} jsonFilename - Filename to validate
 * @throws {Error} If filename is invalid
 * @author Samuel Niang
 */
export const validateFilename = (jsonFilename) => {
  if (!jsonFilename.endsWith('.json') || jsonFilename.includes('..')) {
    throw new Error('Invalid file name');
  }
};

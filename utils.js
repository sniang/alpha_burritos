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
 * Extracts year and month from a filename with format xxx-YYYY-MM-xxx.json.
 * 
 * @param {string} jsonFilename - Filename to parse
 * @returns {Object} Object containing year and month as strings
 * @throws {Error} If filename format is invalid or year/month format is incorrect
 * @author Samuel Niang
 */
export const parseYearMonthFromFilename = (jsonFilename) => {
  const parts = jsonFilename.split("-");
  if (parts.length < 3) {
    throw new Error("Invalid filename format: year and month not found.");
  }
  const [, year, month] = parts;
  if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(month)) {
    throw new Error("Invalid year or month format.");
  }
  return { year, month };
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

/**
 * Returns the current timestamp in 'YYYY-MM-DD HH:mm:ss' format.
 * The timestamp is adjusted to the 'Europe/Rome' timezone.
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

// Parse year and month from a filename (format: xxx-YYYY-MM-xxx.json)
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

// Utility function to ensure numbers are two digits (e.g., '1' -> '01')
export const padToTwoDigits = (number) => String(number).padStart(2, "0");

// Validate filename to prevent directory traversal attacks
export const validateFilename = (jsonFilename) => {
  if (!jsonFilename.endsWith('.json') || jsonFilename.includes('..')) {
    throw new Error('Invalid file name');
  }
};

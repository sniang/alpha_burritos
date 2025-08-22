import React, { useState, useEffect } from "react";

/**
 * TimeStampSelector is a React component that renders a dropdown menu for selecting
 * a JSON file based on its acquisition timestamp. It fetches available JSON files
 * from a backend API, parses their filenames to extract human-readable timestamps,
 * and allows the user to select one. The selected file and any errors encountered
 * during fetching are managed via state passed in as props.
 *
 * @component
 * @author Samuel Niang
 * @param {Object} props
 * @param {string[]} props.jsonFiles - Array of JSON file names available for selection.
 * @param {Function} props.setJsonFiles - Setter function to update the list of JSON files.
 * @param {string} props.selectedFile - Currently selected JSON file name.
 * @param {Function} props.setSelectedFile - Setter function to update the selected file.
 * @param {Error|null} props.error - Error object if fetching files fails, otherwise null.
 * @param {Function} props.setError - Setter function to update the error state.
 * @param {string} props.year - Year for fetching JSON files.
 * @param {string} props.month - Month for fetching JSON files.
 * @param {string} props.day - Day for fetching JSON files.
 *
 * @example
 * <TimeStampSelector
 *   jsonFiles={jsonFiles}
 *   setJsonFiles={setJsonFiles}
 *   selectedFile={selectedFile}
 *   setSelectedFile={setSelectedFile}
 *   error={error}
 *   setError={setError}
 *   year={year}
 *   month={month}
 *   day={day}
 * />
 */
/**
 * TimeStampSelector component renders a dropdown to select a JSON file by timestamp.
 * Fetches available JSON files from backend and parses filenames for display.
 */
function TimeStampSelector({
  jsonFiles,
  setJsonFiles,
  selectedFile,
  setSelectedFile,
  error,
  setError,
  year,
  month,
  day,
  fileFromUrl=null
}) {
  // Fetch JSON files from backend API on mount
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch(`/api/${year}/${month}/${day}/json`);
        if (!res.ok) {
          throw new Error(`${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        // Filter out any non-data files (keeping only files matching the pattern data-*.json)
        // Then sort files in descending order to prioritize the most recent files
        const filteredData = data
          .filter(file => file.match(/^data-.*\.json$/))
          .sort()
          .reverse();
        setJsonFiles(filteredData); // Update available files
        if (fileFromUrl && filteredData.includes(fileFromUrl)) {
          setSelectedFile(fileFromUrl); // Pre-select file from URL if valid
        } else if (!selectedFile && filteredData.length > 0) {
          setSelectedFile(filteredData[0]); // Set default selected file
        }
        if (fileFromUrl && !filteredData.includes(fileFromUrl)) {
          alert(`File not found: ${fileFromUrl}`);
        }
      } catch (error) {
        setError(error); // Set error if fetch fails
      }
    };
    fetchFiles();
  }, [year, month, day, fileFromUrl]);

  // Handle dropdown selection change
  const handleSelectChange = (event) => {
    setSelectedFile(event.target.value); // Update selected file
    console.log('Selected file:', event.target.value);
  };
  return (
    <label>
      Timestamp:
      <select
        value={selectedFile}
        onChange={handleSelectChange}
      >
        <option value="" disabled>Acquisition timestamp</option>

        {!error && jsonFiles.map((file, index) => (
          <option key={index} value={file}>{parseTimestamp(file)}</option>
        ))}
      </select>
    </label>
  );

}

export default TimeStampSelector;

/**
 * Parses a filename to extract a human-readable timestamp.
 * Assumes filename format: data-YYYY-MM-DD_HH-MM-SS.json
 * Returns string in format: "YYYY-MM-DD HH:MM:SS" or null if not matched.
 *
 * @param {string} filename - The JSON filename to parse.
 * @returns {string|null} - The parsed timestamp or null if format is invalid.
 */
function parseTimestamp(filename) {
  const m = filename.match(/data-(\d{4}-\d{2}-\d{2})_(\d{2}-\d{2}-\d{2})\.json/);
  return m ? `${m[1]} ${m[2].replace(/-/g, ':')}` : null;
}

/**
 * Parses a filename to extract date components.
 * Assumes filename format: data-YYYY-MM-DD_HH-MM-SS.json
 * Returns an object with year, month, day, hour, minute, second or null if not matched.
 *
 * @param {string} filename - The JSON filename to parse.
 * @returns {Object|null} - The parsed date components or null if format is invalid.
 */
function getDateFromFileName(filename) {
  const m = filename.match(/data-(\d{4}-\d{2}-\d{2})_(\d{2}-\d{2}-\d{2})\.json/);
  return m ? {
    year: parseInt(m[1].split('-')[0]),
    month: parseInt(m[1].split('-')[1]),
    day: parseInt(m[1].split('-')[2]),
    hour: parseInt(m[2].split('-')[0]),
    minute: parseInt(m[2].split('-')[1]),
    second: parseInt(m[2].split('-')[2])
  } : null;
}
export { parseTimestamp, getDateFromFileName };

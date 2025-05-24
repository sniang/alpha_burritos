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
}) {
  // Fetch JSON files from backend API on mount
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/${year}/${month}/json`);
        if (!res.ok) {
          throw new Error(`${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        setJsonFiles(data); // Update available files
        setSelectedFile(data[0]); // Set default selected file
      } catch (error) {
        setError(error); // Set error if fetch fails
      }
    };
    fetchFiles();
  }, []);

  // Handle dropdown selection change
  const handleSelectChange = (event) => {
    setSelectedFile(event.target.value); // Update selected file
    console.log('Selected file:', event.target.value);
  };

  /**
   * Parses a filename to extract and format the timestamp.
   * @param {string} filename - The JSON filename.
   * @returns {string|null} - Formatted timestamp or null if not matched.
   */
  function parseTimestamp(filename) {
    const match = filename.match(/data-(\d{4}-\d{2}-\d{2})_(\d{2}-\d{2}-\d{2})\.json/);
    if (!match) return null;

    const [, date, time] = match;
    const formattedTime = time.replace(/-/g, ':');
    return `${date} ${formattedTime}`;
  }
  return (
    <div>
      <select
        value={selectedFile}
        onChange={handleSelectChange}
        className="border rounded p-2"
        defaultValue = {jsonFiles[0]}
      >
        <option value="" disabled>Select an acquisition timestamp</option>

        {!error && jsonFiles.map((file, index) => (
          <option key={index} value={file}>{parseTimestamp(file)}</option>
        ))}
      </select>
    </div>
  );

}

export default TimeStampSelector;
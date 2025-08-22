import { useState, useEffect } from "react";

/**
 * AutoRefresh component provides an auto-refresh toggle for periodically fetching JSON files
 * from a backend API based on the selected year, month and day.
 * When enabled, it fetches the files
 * every 2 seconds and updates the parent state with the latest file list and selection.
 *
 * @author Samuel Niang
 * @component
 * @param {Object} props - Component props.
 * @param {string} props.selectedFile - The currently selected JSON file.
 * @param {Function} props.setJsonFiles - Callback to update the list of JSON files.
 * @param {Function} props.setSelectedFile - Callback to update the currently selected file.
 * @param {Function} props.setError - Callback to handle and display errors.
 * @param {string|number} props.year - The year used to fetch files from the API.
 * @param {string|number} props.month - The month used to fetch files from the API.
 * @param {string|number} props.day - The day used to fetch files from the API.
 *
 * @returns {JSX.Element} A checkbox UI for toggling auto-refresh functionality.
 */

let Nfiles = -1;
function AutoRefresh({
    selectedFile,
    setJsonFiles,
    setSelectedFile,
    setError,
    year,
    month,
    day
}) {
    // State to track whether auto-refresh is enabled
    const [autoRefresh, setAutoRefresh] = useState(true);

    /**
     * Fetch JSON files from backend API.
     * Updates the parent state with the sorted file list and selects the latest file.
     */
    const fetchFiles = async () => {
        try {
            // Fetch files from backend using year and month
            const res = await fetch(`/api/${year}/${month}/${day}/json`);
            if (!res.ok) {
                // Throw error if response is not ok
                throw new Error(`${res.status} ${res.statusText}`);
            }
            const data = await res.json();

            if (Nfiles !== data.length) {
                Nfiles = data.length; // Update the file count
                // Filter out any non-data files (keeping only files matching the pattern data-*.json)
                // Then sort files in descending order to prioritize the most recent files
                const filteredData = data
                    .filter(file => file.match(/^data-.*\.json$/))
                    .sort()
                    .reverse();
                setJsonFiles(filteredData); // Update available files
                let fileToSelect = filteredData[0];
                const searchParams = new URLSearchParams(window.location.search);
                const json_id = searchParams.get("id");
                if (json_id && json_id !== selectedFile) {
                    try {
                        const res = await fetch(`/api/json/${json_id}`);
                        if (!res.ok) throw new Error('Failed to fetch JSON');
                        fileToSelect = json_id;
                        setAutoRefresh(false);
                    } catch (error) {
                        alert(`Failed to fetch JSON from URL: ${json_id}`);
                    }
                }
                setSelectedFile(fileToSelect); // Set default selected file
                window.history.replaceState({}, "", window.location.pathname);
            }
        } catch (error) {
            // Pass error to parent
            setError(error);
        }
    };

    /**
     * Effect to handle auto-refresh logic.
     * Sets up an interval to fetch files every 2 seconds when auto-refresh is enabled.
     * Cleans up the interval on unmount or when dependencies change.
     */
    useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(fetchFiles, 2000);
        return () => clearInterval(interval);
    }, [autoRefresh, year, month, day]);
    useEffect(() => {
        fetchFiles();
    }, []);

    /**
     * Handler for checkbox change to toggle auto-refresh.
     * @param {Event} e - The change event.
     */
    const handleCheckboxChange = (e) => {
        setAutoRefresh(e.target.checked);
    };

    // Render the auto-refresh checkbox UI
    return (
        <div>
            <label>
                <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={handleCheckboxChange}
                />
                Auto-refresh
            </label>
        </div>
    );
}

export default AutoRefresh;

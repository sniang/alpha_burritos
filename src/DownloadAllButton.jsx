import React, { useState } from "react";

/**
 * DownloadAllButton component allows users to download all signal files for a selected JSON file.
 * It fetches the list of available detectors and downloads signal files for each detector.
 *
 * @author Samuel Niang
 *
 * @component
 * @param {Object} props - Component props.
 * @param {string} props.selectedFile - The filename of the selected signal (JSON format).
 * @returns {JSX.Element} A button that triggers the download of all signal files and displays errors if any.
 */
const DownloadAllButton = ({ selectedFile }) => {
    // State to store any error that occurs during download
    const [error, setError] = useState(null);

    /**
     * Handles downloading the signal file from the server.
     * @param {string} jsonFilename - The name of the JSON file to download.
     * @param {string} detector - The selected detector name.
     * @param {boolean} csv - Whether to download the file in CSV format.
     */
    const downloadSignalFile = async (jsonFilename, detector, csv = false) => {
        try {
            // Fetch the file from the backend API
            let response;
            if (csv) {
                response = await fetch(`/api/signal/csv/${detector}/${jsonFilename}`);
            } else {
                response = await fetch(`/api/signal/${detector}/${jsonFilename}`);
            }
            console.log(`/api/signal/${detector}/${jsonFilename}`)
            if (!response.ok) {
                // If the response is not OK, throw an error
                throw new Error('Failed to fetch file');
            }
            // Convert the response to a Blob
            const blob = await response.blob();
            // Create a temporary URL for the Blob
            const url = window.URL.createObjectURL(blob);

            // Create a temporary anchor element to trigger the download
            const a = document.createElement('a');
            a.href = url;
            // Set the download filename using the detector and original filename
            if (csv) {
                a.download = jsonFilename.replace('.json', '.csv').replace('data', detector);
            } else {
                a.download = jsonFilename.replace('.json', '.txt').replace('data', detector);
            }
            document.body.appendChild(a);
            a.click();
            a.remove();

            // Clean up the temporary URL
            window.URL.revokeObjectURL(url);
        } catch (error) {
            // Set the error state if something goes wrong
            setError(error);
        }
    };

    /**
     * Fetches the list of available detectors for the selected file.
     * @returns {Promise<string[]>} Array of detector names.
     */
    const getDetectorList = async () => {
        try {
            // Fetch parameter data from backend API
            const res = await fetch(`/api/json/${selectedFile}`);
            if (!res.ok) {
                // Throw error if response is not ok
                throw new Error('Network response was not ok');
            }
            // Parse JSON data and return detector keys
            const data = await res.json();
            return Object.keys(data);
        } catch (error) {
            // Set error state if fetch fails
            setError(error);
            return [];
        }
    };

    /**
     * Downloads signal files for all available detectors.
     * @param {string} jsonFilename - The name of the JSON file to download signals for.
     */
    const downloadAllSignalFiles = async (jsonFilename, csv=false) => {
        try {
            // Get all available detectors
            const detectors = await getDetectorList();
            // Download signal file for each detector
            for (const detector of detectors) {
                await downloadSignalFile(jsonFilename, detector, csv);
            }
        } catch (error) {
            setError(error);
        }
    }

    return (
        <>
            {/* Download button triggers the downloadAllSignalFiles function */}
            <button onClick={() => downloadAllSignalFiles(selectedFile)}>
                Download the signals (.txt)
            </button>
            <button onClick={() => downloadAllSignalFiles(selectedFile, true)}>
                Download the signals (.csv)
            </button>
            {/* Display error message if an error occurred */}
            {error && <span> Error: {error.message}</span>}
        </>
    );
};

export default DownloadAllButton;

import React, { useState } from "react";

/**
 * DownloadAllButton component allows users to download the signal files.
 * Handles download logic, error reporting,
 * and file naming conventions.
 *
 * @author Samuel Niang
 *
 * @component
 * @param {Object} props - Component props.
 * @param {string} props.selectedFile - The filename of the selected signal (JSON format).
 * @returns {JSX.Element} A button that triggers the download of the signal file and displays errors if any.
 */
const DownloadAllButton = ({ selectedFile }) => {
    // State to store any error that occurs during download
    const [error, setError] = useState(null);

    /**
     * Handles downloading the signal file from the server.
     * @param {string} jsonFilename - The name of the JSON file to download.
     * @param {string} detector - The selected detector name.
     */
    const downloadSignalFile = async (jsonFilename, detector) => {
        try {
            // Fetch the file from the backend API
            const response = await fetch(`http://localhost:3001/api/signal/${detector}/${jsonFilename}`);
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
            a.download = detector + "_" + jsonFilename.replace('.json', '.txt');
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

    const getDetectorList = async() => {
            try {
                // Fetch parameter data from backend API
                const res = await fetch(`http://localhost:3001/api/json/${selectedFile}`);
                if (!res.ok) {
                    // Throw error if response is not ok
                    throw new Error('Network response was not ok');
                }
                // Parse JSON data
                const data = await res.json();
                return Object.keys(data);
            } catch (error) {
                // Set error state if fetch fails
                setError(error);
                return [];
            }
        };

    const downloadAllSignalFiles = async (jsonFilename) => {
        try {
            const detectors = await getDetectorList();
            for (const detector of detectors) {
                await downloadSignalFile(jsonFilename, detector);
            }
        } catch (error) {
            setError(error);
        }
    }

    return (
        <>
            {/* Download button triggers the downloadSignalFile function */}
            <button onClick={() => downloadAllSignalFiles(selectedFile)}>
                Download the signals
            </button>
            {/* Display error message if an error occurred */}
            {error && <span> Error: {error.message}</span>}
        </>
    );
};

export default DownloadAllButton;

import React, { useState } from "react";

/**
 * DownloadButton component allows users to download a signal file from the server
 * based on the selected file and detector. Handles download logic, error reporting,
 * and file naming conventions.
 *
 * @author Samuel Niang
 *
 * @component
 * @param {Object} props - Component props.
 * @param {string} props.selectedFile - The filename of the selected signal (JSON format).
 * @param {string} props.selectedDetector - The name of the selected detector.
 * @returns {JSX.Element} A button that triggers the download of the signal file and displays errors if any.
 */
const DownloadButton = ({ selectedFile, selectedDetector }) => {
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

    return (
        <>
            {/* Download button triggers the downloadSignalFile function */}
            <button onClick={() => downloadSignalFile(selectedFile, selectedDetector)}>
                Download the signal
            </button>
            {/* Display error message if an error occurred */}
            {error && <span> Error: {error.message}</span>}
        </>
    );
};

export default DownloadButton;

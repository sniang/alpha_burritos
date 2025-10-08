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
const DownloadButton = ({ selectedFile, selectedDetector}) => {
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

    return (
        <div style={{ display: 'flex', gap: '10px' }}>
            {/* Download button triggers the downloadSignalFile function */}
            <button onClick={() => downloadSignalFile(selectedFile, selectedDetector)}>
                Download signal (.txt)
            </button>
            <button onClick={() => downloadSignalFile(selectedFile, selectedDetector, true)}>
                Download signal (.csv)
            </button>
            {/* Display error message if an error occurred */}
            {error && <span> Error: {error.message}</span>}
        </div>
    );
};

export default DownloadButton;

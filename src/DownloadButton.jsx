import React, { useState } from "react";

const DownloadButton = ({ selectedFile, selectedDetector }) => {

    const [error, setError] = useState(null);

    const downloadSignalFile = async (jsonFilename, detector) => {
        try {
            const response = await fetch(`http://localhost:3001/api/signal/${detector}/${jsonFilename}`);
            console.log(`/api/signal/${detector}/${jsonFilename}`)
            if (!response.ok) {
                throw new Error('Failed to fetch file');
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = detector+"_"+jsonFilename.replace('.json', '.txt'); // or whatever name you prefer
            document.body.appendChild(a);
            a.click();
            a.remove();

            // Clean up
            window.URL.revokeObjectURL(url);
        } catch (error) {
            setError(error);
        }
    };
    return (
        <>
            <button onClick={() => downloadSignalFile(selectedFile, selectedDetector)}>
                Download the signal
            </button>
            {error && <span> Error: {error.message}</span>}
        </>

    );
};

export default DownloadButton;

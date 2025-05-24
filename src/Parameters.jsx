import React, { useState, useEffect } from "react";

/**
 * Parameters component fetches and displays parameter data for a selected file.
 * 
 * Given a `selectedFile` prop, it retrieves parameter information from a backend API,
 * handles loading and error states, and renders formatted parameter values for predefined locations.
 * 
 * @component
 * @param {Object} props
 * @param {string} props.selectedFile - The name or identifier of the file whose parameters are to be fetched and displayed.
 * @returns {JSX.Element|null} Rendered parameter information, error message, or null if no file is selected.
 * 
 * @author Samuel Niang
 */
const Parameters = ({ selectedFile }) => {
    // State to hold fetched parameters
    const [parameters, setParameters] = useState(null);
    // State to hold any error that occurs during fetch
    const [error, setError] = useState(null);
    // List of locations to display parameters for
    const locations = ["PDS", "BDS", "DSAT", "USAT", "PMT11"];

    /**
     * Formats a number to five significant digits.
     * @param {number} num - The number to format.
     * @returns {string} The formatted number.
     */
    function formatToFiveSignificantDigits(num) {
        return Number(num).toPrecision(5);
    }

    // Fetch parameters when selectedFile changes
    useEffect(() => {
        const fetchParameters = async () => {
            try {
                // Fetch parameter data from backend API
                const res = await fetch(`http://localhost:3001/api/json/${selectedFile}`);
                if (!res.ok) {
                    // Throw error if response is not ok
                    throw new Error('Network response was not ok');
                }
                // Parse JSON data
                const data = await res.json();
                setParameters(data);
            } catch (error) {
                // Set error state if fetch fails
                setError(error);
            }
        };

        if (selectedFile) {
            // Only fetch if a file is selected
            console.log('Fetching:', selectedFile);
            fetchParameters();
            console.log('Parameters:', parameters);
        }
    }, [selectedFile]);

    // Render error message if error occurred
    if (error) {
        return (
            <div>
                <h2>Parameters</h2>
                <p className="error">Something went wrong while loading the parameters: {error.message}</p>
            </div>
        );
    }

    // Render parameters if available
    if (parameters) {
        const parameterKeys = [
            { key: "area", label: "Area [V·ns]" },
            { key: "fwhm", label: "FWHM [ns]" },
            { key: "peak", label: "Peak [V]" },
            { key: "rise", label: "Rise [ns]" },
            { key: "time peak", label: "Time Peak [ns]" },
        ];

        const validLocations = locations.filter((loc) => parameters[loc]);

        return (
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: `150px repeat(${validLocations.length}, min-content)`,
                    gap: "4px 8px",
                    fontSize: "0.85rem",
                    lineHeight: "1.2",
                    alignItems: "center",
                    border: "solid 2px #e33933",
                    padding: "10px",
                    borderRadius: "10px"
                }}
            >
                {/* Header row */}
                <div style={{ fontWeight: "600" }}>Parameters</div>
                {validLocations.map((loc) => (
                    <div key={loc} style={{ fontWeight: "600" }}>{loc}</div>
                ))}

                {/* Parameter rows */}
                {parameterKeys.map(({ key, label }) => (
                    <React.Fragment key={key}>
                        <div>{label}</div>
                        {validLocations.map((loc) => (
                            <div key={`${loc}-${key}`}>
                                {formatToFiveSignificantDigits(parameters[loc][key])}
                            </div>
                        ))}
                    </React.Fragment>
                ))}
            </div>
        );
    }

    // Render nothing if no file is selected and no error
    return null;
};

export default Parameters;
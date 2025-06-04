import React, { useState, useEffect } from "react";
import { parseTimestamp } from "./TimeStampSelector";
import "./CSS/Parameters.css"; 


/**
 * Parameters component fetches and displays parameter data for a selected file.
 * 
 * Given a `selectedFile` prop, it retrieves parameter information from a backend API,
 * displays loading and error states appropriately, and renders formatted parameter values
 * for the detector locations specified in detectorList.
 * 
 * @component
 * @param {Object} props
 * @param {string} props.selectedFile - The name or identifier of the file whose parameters are to be fetched and displayed.
 * @param {string[]} props.detectorList - Array of detector locations to display.
 * @param {Function} props.setDetectorList - Setter function to update the detector list.
 * @returns {JSX.Element|null} Rendered parameter information, error message, or null if no file is selected.
 * 
 * @author Samuel Niang
 */
const Parameters = ({ selectedFile, detectorList, setDetectorList }) => {
    // State to hold fetched parameters data
    const [parameters, setParameters] = useState(null);
    // State to track and display any API fetch errors
    const [error, setError] = useState(null);

    /**
     * Formats a number to five significant digits for consistent display.
     * @param {number} num - The number to format.
     * @returns {string} The formatted number with five significant digits.
     */
    function formatToFiveSignificantDigits(num) {
        return Number(num).toPrecision(5);
    }

    // Fetch parameters when selectedFile changes
    useEffect(() => {
        const fetchParameters = async () => {
            try {
                // Request parameter data from backend API for the selected file
                const res = await fetch(`/api/json/${selectedFile}`);
                if (!res.ok) {
                    // Handle HTTP error responses
                    throw new Error('Network response was not ok');
                }
                // Parse and store the JSON response data
                const data = await res.json();
                setParameters(data);
                // Update detectorList with all available detector locations from the data
                setDetectorList(Object.keys(data));
            } catch (error) {
                // Store error state for user display
                setError(error);
                setDetectorList([]); // Clear detector list on error
            }
        };

        if (selectedFile) {
            // Only attempt to fetch data if a file is selected
            fetchParameters();
        }
    }, [selectedFile]);

    // Display error information if fetch failed
    if (error) {
        return (
            <div>
                <h2>Parameters</h2>
                <p className="error">Something went wrong while loading the parameters: {error.message}</p>
            </div>
        );
    }

    // Render parameter data grid if data is available
    if (parameters) {
        // Define parameter keys and their display labels
        const parameterKeys = [
            { key: "area", label: "Area [V·ns]" },
            { key: "fwhm", label: "FWHM [ns]" },
            { key: "peak", label: "Peak [mV]" },
            { key: "rise", label: "Rise [ns]" },
            { key: "time peak", label: "Time Peak [ns]" },
            { key: "dt", label: "dt [ns]" },
        ];

        // Filter out any detector locations that don't exist in the parameters data
        const validdetectorList = detectorList.filter((loc) => parameters[loc]);

        return (
            <div id="parametersBlock">
                <h4>{parseTimestamp(selectedFile)}</h4>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: `120px repeat(${validdetectorList.length}, min-content)`,
                        gap: "15px 5px",
                        fontSize: "0.9rem",
                        alignItems: "center",
                    }}
                >
                    {/* Header row with parameter name and detector locations */}
                    <div style={{ fontWeight: "bold" }}>Parameters</div>
                    {validdetectorList.map((loc) => (
                        <div key={loc} style={{ fontWeight: "bold" }}>{loc}</div>
                    ))}

                    {/* Data rows for each parameter across all detectors */}
                    {parameterKeys.map(({ key, label }) => (
                        <React.Fragment key={key}>
                            <div>{label}</div>
                            {validdetectorList.map((loc) => (
                                <div key={`${loc}-${key}`}>
                                    {formatToFiveSignificantDigits(parameters[loc][key])}
                                </div>
                            ))}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        );
    }

    // Return null if no file is selected or data hasn't loaded yet
    return null;
};

export default Parameters;
import React, { useState, useEffect } from "react";
import { parseTimestamp } from "./TimeStampSelector";
import "./CSS/Parameters.css";

// Parameter keys and display labels
export const parameterKeys = [
    { key: "area", label: "Area [V·ns]" },
    { key: "fwhm", label: "FWHM [ns]" },
    { key: "peak", label: "Peak [mV]" },
    { key: "rise", label: "Rise [ns]" },
    { key: "time peak", label: "Time Peak [ns]" },
    { key: "dt", label: "Interval [ns]" },
    { key: "time arrival", label: "Arrival [ns]" },
];

/**
 * Displays parameter data for a selected file and list of detectors.
 *
 * Fetches parameter information from a backend API when a file is selected,
 * handles loading and error states, and renders a table of parameter values
 * for each detector in the provided detectorList. Allows toggling the table orientation.
 *
 * @param {Object} props
 * @param {string} props.selectedFile - The file to fetch parameters for.
 * @param {string[]} props.detectorList - List of detector locations to display.
 * @param {Function} props.setDetectorList - Updates the detector list.
 * @param {Function} props.setSelectedDetector - Sets the currently selected detector.
 * @returns {JSX.Element|null}
 *  * 
 * @author Samuel Niang */
const Parameters = ({ selectedFile, detectorList, setDetectorList, setSelectedDetector }) => {
    // Holds fetched parameter data
    const [parameters, setParameters] = useState(null);
    // Tracks API fetch errors
    const [error, setError] = useState(null);
    // Controls table orientation
    const [reverseTable, setReverseTable] = useState(true);
    const [displayTable, setDisplayTable] = useState(false);

    /**
     * Formats a number to five significant digits.
     * @param {number} num
     * @returns {string}
     */
    function formatToFiveSignificantDigits(num) {
        return Number(num).toPrecision(5);
    }

    // Fetch parameters when selectedFile changes
    useEffect(() => {
        const fetchParameters = async () => {
            try {
                const res = await fetch(`/api/json/${selectedFile}`);
                if (!res.ok) throw new Error('Network response was not ok');
                const data = await res.json();
                setParameters(data);
                setDetectorList(Object.keys(data));
                // Ensure selected detector is valid
                const dataKeys = Object.keys(data);
                const areArraysEqual =
                    dataKeys.length === detectorList.length &&
                    dataKeys.every((key, idx) => key === detectorList[idx]);
                if (dataKeys.length === 0 || !areArraysEqual) {
                    setSelectedDetector(dataKeys[0]);
                }
            } catch (error) {
                setError(error);
                setDetectorList([]);
            }
        };

        if (selectedFile) {
            fetchParameters();
            setDisplayTable(false);
        }
    }, [selectedFile]);

    /**
     * 
     * @returns {string} A formatted table of parameters for each detector.
     * If reverseTable is true, parameters are rows and detectors are columns.
     * If reverseTable is false, detectors are rows and parameters are columns.
     */
    const makeTable = () => {
        if (!parameters) return "";
        const keys = Object.keys(parameters);
        if (keys.length === 0) return "";
        if (reverseTable) {
            const header = ["Parameters", ...keys].join("\t");
            console.log(parameters)
            const rows = parameterKeys.map(({ key, label }) => {
                const values = keys.map((loc) => formatToFiveSignificantDigits(parameters[loc][key]));
                return [label, ...values].join("\t");
            });
            return [header, ...rows].join("\n");
        } else {
            const header = ["Location", ...parameterKeys.map(({ label }) => label)].join("\t");
            const rows = keys.map((loc) => {
                const values = parameterKeys.map(({ key }) => formatToFiveSignificantDigits(parameters[loc][key]));
                return [loc, ...values].join("\t\t");
            });
            return [header, ...rows].join("\n");
        }
    };

    const displayButtons = () => {
        return (
            <div style={{ display: "flex", gap: "10px" }}>
                <button
                    className="button"
                    onClick={() => setReverseTable(!reverseTable)}>
                    Reverse Table
                </button>
                {displayTable && <button
                    className="button"
                    onClick={() => setDisplayTable(!displayTable)}>
                    Back
                </button>}
            </div>);
    };

    // Show error if fetch failed
    if (error) {
        return (
            <div>
                <h2>Parameters</h2>
                <p className="error">Something went wrong while loading the parameters: {error.message}</p>
            </div>
        );
    }

    // Render parameter table if data is available
    if (parameters) {

        // Only show detectors present in the data
        const validDetectorList = detectorList.filter((loc) => parameters[loc]);

        if (reverseTable) {
            // Table: parameters as rows, detectors as columns
            return (
                <div id="parametersBlock" className="blocks">
                    <h4>{parseTimestamp(selectedFile)}</h4>
                    {displayTable && (<textarea
                        value={makeTable()}
                        readOnly
                    />)}
                    {!displayTable && <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: `120px repeat(${validDetectorList.length}, min-content)`,
                            gap: "10px 5px",
                            fontSize: "0.9rem",
                            alignItems: "center",
                            marginBottom: "10px"
                        }}
                        onClick={() => setDisplayTable(!displayTable)}
                    >

                        {/* Header row */}
                        <div style={{ fontWeight: "bold" }}>Parameters</div>
                        {validDetectorList.map((loc) => (
                            <div key={loc} style={{ fontWeight: "bold" }}>{loc}</div>
                        ))}

                        {/* Parameter rows */}
                        {parameterKeys.map(({ key, label }) => (
                            <React.Fragment key={key}>
                                <div>{label}</div>
                                {validDetectorList.map((loc) => (
                                    <div key={`${loc}-${key}`}>
                                        {formatToFiveSignificantDigits(parameters[loc][key])}
                                    </div>
                                ))}
                            </React.Fragment>
                        ))}
                    </div>}
                    {displayButtons()}
                </div>
            );
        }

        // Table: detectors as rows, parameters as columns
        return (
            <div id="parametersBlock" className="blocks">
                <h4>{parseTimestamp(selectedFile)}</h4>
                {displayTable && (<textarea
                    value={makeTable()}
                    readOnly
                />)}
                {!displayTable && <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: `80px repeat(${parameterKeys.length}, min-content)`,
                        gap: "10px 5px",
                        fontSize: "0.9rem",
                        alignItems: "center",
                        marginBottom: "10px"
                    }}
                    onClick={() => setDisplayTable(!displayTable)}
                >
                    {/* Header row */}
                    <div style={{ fontWeight: "bold" }}>Location</div>
                    {parameterKeys.map(({ key, label }) => (
                        <div key={key} style={{ fontWeight: "bold" }}>{label}</div>
                    ))}

                    {/* Detector rows */}
                    {validDetectorList.map((loc) => (
                        <React.Fragment key={loc}>
                            <div>{loc}</div>
                            {parameterKeys.map(({ key }) => (
                                <div key={`${loc}-${key}`}>
                                    {formatToFiveSignificantDigits(parameters[loc][key])}
                                </div>
                            ))}
                        </React.Fragment>
                    ))}
                </div>}
                {displayButtons()}
            </div>
        );
    }

    // Nothing to show if no file selected or data not loaded
    return null;
};

export default Parameters;



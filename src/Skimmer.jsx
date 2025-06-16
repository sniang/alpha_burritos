import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./CSS/Skimmer.css";
import { parseTimestamp } from "./TimeStampSelector";
import DetectorSelector from "./DetectorSelector";
import { parameterKeys } from "./Parameters";

/**
 * Formats a numeric value to a consistent precision.
 * @param {number|null|undefined} value - The value to format
 * @returns {string} Formatted value or "N/A" if value is null/undefined
 */
const formatValue = (value) => {
    if (value === undefined || value === null) return "N/A";
    return Number(value).toPrecision(5);
};

/**
 * Generates formatted text content from the processed JSON data.
 * @param {Array<string>} jsonFilesSorted - Sorted array of JSON filenames
 * @param {Array<Object>} data - Array of data objects fetched from JSON files
 * @param {number} startingIndex - Starting index in the files array
 * @param {number} endingIndex - Ending index in the files array
 * @param {string} selectedDetector - The currently selected detector
 * @returns {string} Formatted text content for display
 */
const getText = (jsonFilesSorted, data, startingIndex, endingIndex, selectedDetector) => {
    if (!data || data.length === 0) {
        return "No data available.";
    }
    
    // Create header row with parameter labels
    const headerRow = ["Timestamp\t\t"];
    parameterKeys.forEach(({ label }) => {
        headerRow.push(label);
    });
    
    const rows = [headerRow.join("\t")];
    
    // Get only the files within the selected range
    const jsonFilesSortedSlice = jsonFilesSorted.slice(startingIndex, endingIndex + 1);
    
    // Build data rows with timestamp and parameter values
    jsonFilesSortedSlice.forEach((file, index) => {
        const row = [parseTimestamp(file)];
        
        parameterKeys.forEach(({ key }) => {
            const detectorData = data[index]?.[selectedDetector];
            row.push(detectorData && detectorData[key] !== undefined ? 
                formatValue(detectorData[key]) : "N/A");
        });
        
        rows.push(row.join("\t\t"));
    });
    
    return rows.join("\n");
};

/**
 * Skimmer component for browsing and viewing JSON data files within a selected range.
 * 
 * This component allows users to select a detector and a range of JSON files to view.
 * It fetches the selected files, processes them, and displays their content in a text area.
 * 
 * @component
 * @author Samuel Niang
 * 
 * @param {Object} props - Component props
 * @param {Array<string>} props.jsonFiles - List of available JSON file names
 * @param {string} props.selectedDetector - The currently selected detector
 * @param {Function} props.setSelectedDetector - Function to update the selected detector
 * @param {Array<string>} props.detectorList - List of available detectors
 * 
 * @returns {JSX.Element} The rendered Skimmer component
 * 
 * @example
 * <Skimmer 
 *   jsonFiles={availableFiles}
 *   selectedDetector={detector}
 *   setSelectedDetector={updateDetector}
 *   detectorList={detectors}
 * />
 */
const Skimmer = ({ jsonFiles, selectedDetector, setSelectedDetector, detectorList }) => {
    // State for managing the data and UI
    const [startingIndex, setStartingIndex] = useState(0);
    const [endingIndex, setEndingIndex] = useState(0);
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Sort JSON files alphabetically for consistent display
    const jsonFilesSorted = useMemo(() => 
        jsonFiles ? [...jsonFiles].sort((a, b) => a.localeCompare(b)) : []
    , [jsonFiles]);
    
    /**
     * Fetches data for the selected range of JSON files
     * Uses Promise.all to fetch multiple files concurrently
     */
    const fetchData = useCallback(async () => {
        if (!jsonFilesSorted.length) return;
        
        setIsLoading(true);
        setData([]);
        
        try {
            const fileSlice = jsonFilesSorted.slice(startingIndex, endingIndex + 1);
            const localData = await Promise.all(
                fileSlice.map(async (file) => {
                    const res = await fetch(`/api/json/${file}`);
                    if (!res.ok) throw new Error(`Failed to fetch ${file}`);
                    return res.json();
                })
            );
            setData(localData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [jsonFilesSorted, startingIndex, endingIndex]);
    
    // Fetch data when component mounts or dependencies change
    useEffect(() => {
        if (jsonFilesSorted.length > 0) {
            fetchData();
        }
    }, [fetchData, jsonFilesSorted.length]);
    
    // Early return if no files are available
    if (!jsonFiles || jsonFiles.length === 0) {
        return <div className="skimmer-container">No JSON files available.</div>;
    }
    
    // Generate the text content to display in the textarea
    const textContent = useMemo(() => 
        getText(jsonFilesSorted, data, startingIndex, endingIndex, selectedDetector)
    , [jsonFilesSorted, data, startingIndex, endingIndex, selectedDetector]);

    return (
        <div className="skimmer-container blocks">
            <h2>Skimmer</h2>
            {/* Control panel for detector and range selection */}
            <div className="skimmer-controls">
                <DetectorSelector
                    selectedDetector={selectedDetector}
                    setSelectedDetector={setSelectedDetector}
                    detectorList={detectorList}
                />
                {/* Starting timestamp selector */}
                <label>
                    Starting:
                    <select
                        value={startingIndex}
                        onChange={(e) => setStartingIndex(Number(e.target.value))}
                    >
                        <option value="" disabled>Acquisition timestamp</option>
                        {jsonFilesSorted.map((file, index) => (
                            <option key={file} value={index}>{parseTimestamp(file)}</option>
                        ))}
                    </select>
                </label>
                {/* Ending timestamp selector */}
                <label>
                    Ending:
                    <select
                        value={endingIndex}
                        onChange={(e) => setEndingIndex(Number(e.target.value))}
                    >
                        <option value="" disabled>Acquisition timestamp</option>
                        {jsonFilesSorted.map((file, index) => (
                            <option key={file} value={index}>{parseTimestamp(file)}</option>
                        ))}
                    </select>
                </label>
            </div>
            {/* Display loading indicator or data */}
            {isLoading ? (
                <div className="loading-indicator">Loading data...</div>
            ) : (
                <textarea
                    value={textContent}
                    readOnly
                    className="skimmer-textarea"
                />
            )}
        </div>
    );
};

export default Skimmer;
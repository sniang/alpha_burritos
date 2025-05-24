/**
 * @file DetectorSelector.jsx
 * @author Samuel Niang
 * @description A React component that provides a dropdown menu for selecting different types of detectors
 */

import React, {useState} from "react";

/**
 * DetectorSelector component allows users to choose between different detector options
 * @param {string} selectedDetector - The currently selected detector value
 * @param {function} setSelectedDetector - Function to update the selected detector
 * @returns {JSX.Element} A select element with detector options
 */
const DetectorSelector = ({selectedDetector, setSelectedDetector}) => {
    // State to manage the selected detector
    const handleChange = (event) => {
        setSelectedDetector(event.target.value);
    };

    return (
        <label>
            Select a detector:
            <select value={selectedDetector} onChange={handleChange}>
                <option value="PDS">PDS</option>
                <option value="BDS">BDS</option>
                <option value="DSAT">DSAT</option>
                <option value="USAT">USAT</option>
                <option value="PMT11">PMT11</option>
            </select>
        </label>
    );
};

export default DetectorSelector;
/**
 * @file DetectorSelector.jsx
 * @author Samuel Niang
 * @description A React component that provides a dropdown menu for selecting different types of detectors
 */
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";


/**
 * DetectorSelector component allows users to choose between different detector options
 * @param {string} selectedDetector - The currently selected detector value
 * @param {function} setSelectedDetector - Function to update the selected detector
 * @param {string[]} detectorList - Array of detector options to display in the dropdown
 * @returns {JSX.Element} A select element with detector options
 */
const DetectorSelector = ({ selectedDetector, setSelectedDetector, detectorList }) => {
    // Handler for detector selection changes
    const handleChange = (event) => {
        setSelectedDetector(event.target.value);
    };

    return (
        <FormControl size="small" color="success" sx={{ minWidth: 150 }}>
            <InputLabel>Detector</InputLabel>
            <Select
                value={selectedDetector}
                label="Detector"
                onChange={handleChange}
            >
                {detectorList && detectorList.map((detector) => (
                    <MenuItem key={detector} value={detector}>
                        {detector}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default DetectorSelector;
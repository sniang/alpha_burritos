/**
 * @file DetectorSelector.jsx
 * @author Samuel Niang
 * @description A React component that provides a dropdown menu for selecting different types of detectors
 */

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
        <label>
            Detector:
            <select value={selectedDetector} onChange={handleChange}>
                {detectorList && detectorList.map((detector) => (
                    <option key={detector} value={detector}>
                        {detector}
                    </option>
                ))}
            </select>
        </label>
    );
};

export default DetectorSelector;
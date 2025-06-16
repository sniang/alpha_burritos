import React, { useState } from "react";
import DownloadButton from "./DownloadButton";
import "./CSS/DetectorImage.css";

/**
 * Component that displays an image processed by a specific detector
 * 
 * @component
 * @author Samuel Niang
 * 
 * @param {Object} props - Component props
 * @param {string} props.selectedFile - The name of the image file to display
 * @param {string} props.selectedDetector - The type of detector used to process the image
 * 
 * @returns {JSX.Element} A div containing the processed image
 * 
 * @example
 * <DetectorImage selectedFile={selectedFile} selectedDetector={selectedDetector} />
 */
const DetectorImage = ({ selectedFile, selectedDetector }) => {
    return (
        <div id="detectorImageButtonContainer" className="blocks">
            <img id="detectorImage"
                src={`/api/img/${selectedDetector}/${selectedFile}`}
                alt={`Preview for ${selectedFile} with ${selectedDetector}`}
            />
            <DownloadButton
                selectedFile={selectedFile}
                selectedDetector={selectedDetector}
            />
        </div>
    );
};

export default DetectorImage;
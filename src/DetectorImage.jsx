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
const DetectorImage = ({ selectedFile, selectedDetector, fileVersion }) => {
    // Use fileVersion as cache buster and key
    const imgSrc = `/api/img/${selectedDetector}/${selectedFile}?v=${fileVersion}`;

    return (
        <div id="detectorImageButtonContainer" className="blocks">
            <img
                key={fileVersion}
                id="detectorImage"
                src={imgSrc}
                alt={`Preview for ${selectedFile} with ${selectedDetector}`}
                loading="eager"
                style={{ imageRendering: "auto" }}
                crossOrigin="anonymous"
                ref={img => {
                    if (img) {
                        img.setAttribute("referrerPolicy", "no-referrer");
                    }
                }}
            />
            <DownloadButton
                selectedFile={selectedFile}
                selectedDetector={selectedDetector}
            />
        </div>
    );
};

export default DetectorImage;
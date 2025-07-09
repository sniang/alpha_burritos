import React, { useState } from "react";
import DownloadButton from "./DownloadButton";
import "./CSS/DetectorImage.css";

/**
 * DetectorImage component displays an image processed by a selected detector.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {string} props.selectedFile - Name of the image file to display.
 * @param {string} props.selectedDetector - Detector type used to process the image.
 * @param {number|string} props.fileVersion - Version or cache buster for the image.
 * @returns {JSX.Element} A container with the processed image and a download button.
 *
 * @example
 * <DetectorImage
 *   selectedFile="example.jpg"
 *   selectedDetector="PDS"
 *   fileVersion={1}
 * />
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
import React, { useState } from "react";
import "./CSS/DetectorImage.css";
import DownloadAllButton from "./DownloadAllButton";

/**
 * A React component that displays an image from a selected file using a backend API endpoint.
 * 
 * @component
 * @param {Object} props - The component props
 * @param {string} props.selectedFile - The name or identifier of the selected file to display
 * @param {number} [props.fileVersion=0] - Version counter for the selected file, used to refresh the image
 * @returns {JSX.Element} A div containing an image element with the selected file
 * 
 * @author Samuel Niang
 * @example
 * <DetectorImageAll selectedFile={selectedFile} />
 */
const DetectorImageAll = ({ selectedFile, fileVersion = 0 }) => {
  // State to manage the image source URL, initialized with the selected file and version
  const [imgSrc, setImgSrc] = useState(`/api/img_all/${selectedFile.replace('.json', '.png')}?v=${fileVersion}`);
  // State to manage whether to show all signals in a combined plot or subplots
  const [allSignals, setAllSignals] = useState(false);
  // Function to switch between combined and subplots view
  const switchAllSignals = () => {
    setAllSignals(prev => {
      const newAllSignals = !prev;
      if (newAllSignals) {
        setImgSrc(`/api/img_same/${selectedFile.replace('.json', '.png')}?v=${fileVersion}`);
      } else {
        setImgSrc(`/api/img_all/${selectedFile.replace('.json', '.png')}?v=${fileVersion}`);
      }
      return newAllSignals;
    });
  };
  return (
    <div className="detectorImageContainer blocks">
      <img
        id="detectorImageAll"
        src={imgSrc}
        alt={`Preview for ${selectedFile.replace('.json', '.png')}`}
      />
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          className="green"
          onClick={() => switchAllSignals()}>
          {allSignals ? "Subplots" : "Combined plot"}
        </button>
        <DownloadAllButton selectedFile={selectedFile} />
      </div>
    </div>
  );
}

export default DetectorImageAll;
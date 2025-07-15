import React, {useState} from "react";
import "./CSS/DetectorImage.css";
import DownloadAllButton from "./DownloadAllButton";

/**
 * A React component that displays an image from a selected file using a backend API endpoint.
 * 
 * @component
 * @param {Object} props - The component props
 * @param {string} props.selectedFile - The name or identifier of the selected file to display
 * @returns {JSX.Element} A div containing an image element with the selected file
 * 
 * @author Samuel Niang
 * @example
 * <DetectorImageAll selectedFile={selectedFile} />
 */
const DetectorImageAll = ({selectedFile}) => {
  const imageUrl = `/api/img_all/${selectedFile.replace('.json', '.png')}`;

  return (
    <div className="detectorImageContainer blocks">
      <img
        id="detectorImageAll"
        src={imageUrl}
        alt={`Preview for ${selectedFile}`}
      />
      <DownloadAllButton selectedFile={selectedFile} />
    </div>
  );
}

export default DetectorImageAll;
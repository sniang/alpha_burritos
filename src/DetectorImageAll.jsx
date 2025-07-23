import React, { useState, useEffect, useCallback } from "react";
import "./CSS/DetectorImage.css";
import DownloadAllButton from "./DownloadAllButton";

/**
 * Displays an image for the selected file, allowing toggling between combined and subplot views.
 *
 * @param {Object} props
 * @param {string} props.selectedFile - The selected file name (expects .json extension)
 * @param {number} [props.fileVersion=0] - Version counter to refresh the image
 * @returns {JSX.Element}
 */
const DetectorImageAll = ({ selectedFile, fileVersion = 0 }) => {
  const [allSignals, setAllSignals] = useState(false);

  // Helper to get the image URL based on state
  const getImgSrc = useCallback(() => {
    const base = allSignals ? "img_same" : "img_all";
    return `/api/${base}/${selectedFile.replace('.json', '.png')}?v=${fileVersion}`;
  }, [selectedFile, allSignals, fileVersion]);

  const [imgSrc, setImgSrc] = useState(getImgSrc);

  useEffect(() => {
    setImgSrc(getImgSrc());
  }, [getImgSrc]);

  const handleToggleSignals = () => setAllSignals(prev => !prev);

  return (
    <div className="detectorImageContainer blocks">
      <img
        id="detectorImageAll"
        src={imgSrc}
        alt={`Preview for ${selectedFile.replace('.json', '.png')}`}
      />
      <div style={{ display: "flex", gap: "10px" }}>
        <button className="green" onClick={handleToggleSignals}>
          {allSignals ? "Subplots" : "Combined plot"}
        </button>
        <DownloadAllButton selectedFile={selectedFile} />
      </div>
    </div>
  );
};

export default DetectorImageAll;

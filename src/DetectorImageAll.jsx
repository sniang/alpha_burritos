import { useState, useEffect, useCallback } from "react";
import "./CSS/DetectorImage.css";
import DownloadAllButton from "./DownloadAllButton";
import Button from '@mui/material/Button';
import DrawIcon from '@mui/icons-material/Draw';


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
    const base = allSignals ? "Same" : "Together";
    return `/api/${base}/${selectedFile.replace('.json', '.png').replace('data', base)}?v=${fileVersion}`;
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
        alt={`Preview for ${imgSrc}`}
      />
      <div style={{ display: "flex", gap: "10px" }}>
        <Button color="success" variant="contained" size="small" onClick={handleToggleSignals} startIcon={<DrawIcon />}>
          {allSignals ? "Subplots" : "Combined plot"}
        </Button>
        <DownloadAllButton selectedFile={selectedFile} />
      </div>
    </div>
  );
};

export default DetectorImageAll;

import { useState, useEffect, useCallback } from "react";
import DownloadAllButton from "./DownloadAllButton";
import Button from '@mui/material/Button';
import DrawIcon from '@mui/icons-material/Draw';
import Paper from '@mui/material/Paper';
import Accordion from '@mui/joy/Accordion';
import AccordionDetails from '@mui/joy/AccordionDetails';
import AccordionSummary from '@mui/joy/AccordionSummary';
import Typography from '@mui/material/Typography';

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
    <Accordion defaultExpanded>
      <AccordionSummary><Typography variant="h5">All detectors</Typography></AccordionSummary>
      <AccordionDetails>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: "2px", padding: "10px" }}>
          <img
            id="detectorImageAll"
            src={imgSrc}
            alt={`Preview for ${imgSrc}`}
            style={{ width: '100%' }}
          />
          <div style={{ display: "flex", gap: "10px" }}>
            <Button variant="contained" size="small" onClick={handleToggleSignals} startIcon={<DrawIcon />}>
              {allSignals ? "Subplots" : "Combined plot"}
            </Button>
            <DownloadAllButton selectedFile={selectedFile} />
          </div>
        </div>
      </AccordionDetails>
    </Accordion>
  );
};

export default DetectorImageAll;

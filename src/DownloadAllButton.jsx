import { useState } from "react";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";

/**
 * DownloadAllButton component allows users to download all signal files for a selected JSON file.
 * It fetches the list of available detectors and downloads signal files for each detector.
 *
 * @author Samuel
 *
 * @component
 * @param {Object} props - Component props.
 * @param {string} props.selectedFile - The filename of the selected signal (JSON format).
 * @returns {JSX.Element} A Split Button that triggers the download of all signal files and displays errors if any.
 */
const DownloadAllButton = ({ selectedFile }) => {
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const options = ["Download all (.txt)", "Download all (.csv)"];

  /**
   * Handles downloading a single detector's signal file.
   */
  const downloadSignalFile = async (jsonFilename, detector, csv = false) => {
    try {
      let response = csv
        ? await fetch(`/api/signal/csv/${detector}/${jsonFilename}`)
        : await fetch(`/api/signal/${detector}/${jsonFilename}`);

      if (!response.ok) throw new Error("Failed to fetch file");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = jsonFilename
        .replace(".json", csv ? ".csv" : ".txt")
        .replace("data", detector);
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError(error);
    }
  };

  /**
   * Fetches the list of available detectors for the selected file.
   */
  const getDetectorList = async () => {
    try {
      const res = await fetch(`/api/json/${selectedFile}`);
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();
      return Object.keys(data);
    } catch (error) {
      setError(error);
      return [];
    }
  };

  /**
   * Downloads signal files for all detectors.
   */
  const downloadAllSignalFiles = async (jsonFilename, csv = false) => {
    try {
      const detectors = await getDetectorList();
      for (const detector of detectors) {
        await downloadSignalFile(jsonFilename, detector, csv);
      }
    } catch (error) {
      setError(error);
    }
  };

  // --- Split button handlers ---
  const handleClick = () => {
    downloadAllSignalFiles(selectedFile, selectedIndex === 1);
  };

  const handleMenuItemClick = (event, index) => {
    setSelectedIndex(index);
    setAnchorEl(null);
  };

  const handleToggle = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <ButtonGroup size="small" color="success" variant="contained" aria-label="split button">
        <Button startIcon={<CloudDownloadIcon />} onClick={handleClick}>
          {options[selectedIndex]}
        </Button>
        <Button
          size="small"
          aria-controls={anchorEl ? "split-button-menu" : undefined}
          aria-expanded={anchorEl ? "true" : undefined}
          aria-label="select download format"
          aria-haspopup="menu"
          onClick={handleToggle}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>

      <Menu
        id="split-button-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {options.map((option, index) => (
          <MenuItem
            key={option}
            selected={index === selectedIndex}
            onClick={(event) => handleMenuItemClick(event, index)}
          >
            {option}
          </MenuItem>
        ))}
      </Menu>

      {error && <span style={{ color: "red" }}>Error: {error.message}</span>}
    </div>
  );
};

export default DownloadAllButton;
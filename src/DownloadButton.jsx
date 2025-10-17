import { useState } from "react";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";

/**
 * DownloadButton component allows users to download a signal file from the server
 * based on the selected file and detector. Handles download logic, error reporting,
 * and file naming conventions.
 *
 * @author Samuel
 *
 * @component
 * @param {Object} props - Component props.
 * @param {string} props.selectedFile - The filename of the selected signal (JSON format).
 * @param {string} props.selectedDetector - The name of the selected detector.
 * @returns {JSX.Element} A Split Button that triggers the download of the signal file and displays errors if any.
 */
const DownloadButton = ({ selectedFile, selectedDetector }) => {
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const options = ["Download signal (.txt)", "Download signal (.csv)"];

  /**
   * Handles downloading the signal file from the server.
   * @param {string} jsonFilename - The name of the JSON file to download.
   * @param {string} detector - The selected detector name.
   * @param {boolean} csv - Whether to download the file in CSV format.
   */
  const downloadSignalFile = async (jsonFilename, detector, csv = false) => {
    try {
      let response;
      if (csv) {
        response = await fetch(`/api/signal/csv/${detector}/${jsonFilename}`);
      } else {
        response = await fetch(`/api/signal/${detector}/${jsonFilename}`);
      }
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

  // --- Split button handlers ---
  const handleClick = () => {
    downloadSignalFile(selectedFile, selectedDetector, selectedIndex === 1);
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
        <Button startIcon={<CloudDownloadIcon />} onClick={handleClick}>{options[selectedIndex]}</Button>
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

export default DownloadButton;
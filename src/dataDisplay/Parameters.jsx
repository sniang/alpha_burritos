/**
 * @file Parameters.jsx
 * @description Fetches and displays detector signal parameters (area, FWHM,
 *              peak, rise time, etc.) in a MUI Table with two layout modes
 *              (detectors-as-columns or parameters-as-columns). Clicking the
 *              table switches to a copyable plain-text view. Includes share-link
 *              and reverse-table controls.
 * @author Samuel Niang
 */

import { useState, useEffect } from "react";
import { parseTimestamp } from "../dataSelection/TimeStampSelector";
import PivotTableChartIcon from "@mui/icons-material/PivotTableChart";
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import CancelIcon from "@mui/icons-material/Cancel";
import EditNoteIcon from '@mui/icons-material/EditNote';
import { TextField, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Alert } from "@mui/material";


/** Parameter keys paired with their display labels and units. */
export const parameterKeys = [
  { key: "area", label: "Area [V·ns]" },
  { key: "fwhm", label: "FWHM [ns]" },
  { key: "peak", label: "Peak [mV]" },
  { key: "rise", label: "Rise [ns]" },
  { key: "time peak", label: "Time Peak [ns]" },
  { key: "dt", label: "Interval [ns]" },
  { key: "time arrival", label: "Arrival [ns]" }
];

/**
 * Formats a numeric value for display with 3 significant digits.
 * Returns "N/A" when the value is missing.
 */
const formatValue = (v) =>
  v === undefined || v === null ? "N/A" : Number(v).toPrecision(3);

/**
 * Parameters – table component showing signal parameters for every detector.
 *
 * @param {Object}   props
 * @param {string}   props.selectedFile      - Currently selected JSON filename.
 * @param {string[]} props.detectorList      - List of detector location keys.
 * @param {Function} props.setDetectorList   - Setter to update the detector list.
 * @param {Function} props.setSelectedDetector - Setter for the active detector.
 * @param {*}        props.fileVersion       - Dependency trigger for refetching data.
 */
const Parameters = ({
  selectedFile,
  detectorList,
  setDetectorList,
  setSelectedDetector,
  selectedDetector,
  fileVersion
}) => {

  const [parameters, setParameters] = useState(null);
  const [error, setError] = useState(null);
  const [reverseTable, setReverseTable] = useState(false);      // Toggle between the two table orientations
  const [displayTable, setDisplayTable] = useState(false);      // Toggle plain-text / MUI table view
  const [particleConfig, setParticleConfig] = useState(null);
  const [comment, setComment] = useState("No comment"); // Stores the current comment for the selected file
  const [newComment, setNewComment] = useState(""); // Stores the comment being edited
  const [update, setUpdate] = useState(false); // Controls whether edit mode is active
  const [fitStatus, setFitStatus] = useState([]); // Stores the fit status for the selected file
  const [fftStatus, setFftStatus] = useState(false); // Stores the FFT status for the selected file
  const [cutOff, setCutOff] = useState(0); // Stores the cut-off for the selected file
  /**
   * Fetches parameter JSON for the selected file, populates the detector
   * list, and extracts the particle configuration label if present.
   */
  useEffect(() => {
    const fetchParameters = async () => {
      try {
        const res = await fetch(`/api/json/${selectedFile}`);
        if (!res.ok) throw new Error("Network response was not ok");

        const data = await res.json();
        setParameters(data);
        setDetectorList(Object.keys(data));

        if (
          Object.keys(data)[0] &&
          data[Object.keys(data)[0]] &&
          data[Object.keys(data)[0]].config
        ) {
          setParticleConfig(data[Object.keys(data)[0]].config);
          setFitStatus(Object.keys(data).filter((detector) => data[detector].fit_status));
          setFftStatus(data[Object.keys(data)[0]].fft_status);
          setCutOff(data[Object.keys(data)[0]].cut_off);
        }

        const dataKeys = Object.keys(data);
        if (dataKeys.length > 0) {
          if (!selectedDetector || !dataKeys.includes(selectedDetector)) {
            setSelectedDetector(dataKeys[0]);
          }
        }

      } catch (error) {
        setError(error);
        setDetectorList([]);
      }
    };

    if (selectedFile) {
      fetchParameters();
      setDisplayTable(false);
    }

  }, [selectedFile, fileVersion]);

  const fetchComment = async () => {
    try {
      // Fetch the existing comment for the selected file from the API
      const response = await fetch(`/api/comments/${selectedFile}`);
      if (!response.ok) {
        throw new Error('Failed to fetch comment');
      }
      const data = await response.json();
      // Update the comment state with the fetched data
      setComment(data.comment || "No comment");
      setNewComment(data.comment || "");
    } catch (err) {
      // Handle and display any errors during API call
      setError(err);
      console.error('[ERROR]', 'Comment failed to fetch comment:', err);
    }
  }
  // Fetch the comment when the component mounts or when selectedFile changes
  useEffect(() => {
    if (selectedFile) {
      fetchComment();
    }
  }, [selectedFile]);

  /**
* Handles saving or toggling the comment edit mode
* Makes API request to save the new comment when in edit mode
* Toggles between view and edit mode
*/
  const updateComment = async () => {
    setError(null); // Reset any previous errors
    if (update && newComment !== comment) {
      // Save the new comment via API call when in edit mode and comment is not empty
      try {
        // POST request to save the comment for the selected file
        const response = await fetch(`/api/comments/${selectedFile}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ comment: newComment })
        });
        if (!response.ok) {
          throw new Error('Failed to save comment');
        }
        // Reset states after successful save
        if (newComment !== "") {
          setComment(newComment);
        } else {
          setComment("No comment");
        }
        return setUpdate(!update); // Exit edit mode
      } catch (err) {
        // Handle and display any errors during API call
        setError(err);
        return;
      }
    }
    // Toggle edit mode when not saving or when comment is empty
    setUpdate(!update);
  }

  /**
   * Builds a fixed-width plain-text representation of the parameter
   * table for easy copy-paste. Layout depends on `reverseTable`.
   * Each column is padded to the widest value in that column.
   */
  const makeTable = () => {

    if (!parameters) return "";

    const keys = Object.keys(parameters);

    // Build a 2D grid of strings (rows × cols) including headers
    let grid;

    if (reverseTable) {
      grid = [
        ["Parameters", ...keys],
        ...parameterKeys.map(({ key, label }) => [
          label,
          ...keys.map((loc) => formatValue(parameters[loc][key]))
        ])
      ];
    } else {
      grid = [
        ["Location", ...parameterKeys.map(({ label }) => label)],
        ...keys.map((loc) => [
          loc,
          ...parameterKeys.map(({ key }) => formatValue(parameters[loc][key]))
        ])
      ];
    }

    // Compute the max width for each column
    const colCount = grid[0].length;
    const colWidths = Array.from({ length: colCount }, (_, c) =>
      Math.max(...grid.map((row) => (row[c] || "").length))
    );

    // Pad each cell and join with two-space separator
    return grid
      .map((row) =>
        row.map((cell, c) => cell.padEnd(colWidths[c])).join("  ")
      )
      .join("\n");
  };


  /**
   * Renders the action buttons row: share link, reverse table,
   * and (when in text view) a back button.
   */
  const displayButtons = () => {
    return (
      <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap", justifyContent: "center" }}>
        <Button
          startIcon={<PivotTableChartIcon />}
          size="small"
          variant="contained"
          onClick={() => setReverseTable(!reverseTable)}
        >
          Reverse Table
        </Button>

        {/* Button text changes based on edit mode */}
        <Button startIcon={<EditNoteIcon />} size="small" variant="contained" onClick={updateComment}>{!update ? "Update comments" : "Save comments"}</Button>
        {/* Cancel button only appears in edit mode */}
        {update && <Button startIcon={<CancelIcon />} size="small" color="error" variant="contained" onClick={() => setUpdate(!update)}>Cancel</Button>}
        {/* Back button only appears in text view mode */}
        {displayTable && <Button startIcon={<CancelIcon />} size="small" color="secondary" variant="contained" onClick={() => setDisplayTable(false)}> Back </Button>}
      </div>
    );
  };


  // Nothing to render until data arrives
  if (!parameters) return null;

  // Keep only detectors that actually exist in the fetched data
  const validDetectorList = detectorList.filter(
    (loc) => parameters[loc]
  );

  return (

    <div style={{ flex: 1, padding: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', gap: "2px", minWidth: 0, maxWidth: '100%', width: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>

      <Typography variant="h6" sx={{ mb: 2 }}>
        {particleConfig && `${capitalizeFirstLetter(particleConfig)} - `}
        {parseTimestamp(selectedFile)}
      </Typography>

      {/* Plain-text view (copyable) */}
      {displayTable ? (

        <pre
          style={{
            background: "#f5f5f5",
            padding: "10px",
            borderRadius: "6px",
            fontSize: "0.65rem",
            overflowX: "auto",
            marginBottom: "10px",
            textAlign: "left",
            maxWidth: "100%",
            width: "100%",
            boxSizing: "border-box"
          }}
        >
          {makeTable()}
        </pre>

      ) : (
        <TableContainer
          component={Paper}
          sx={{ maxWidth: "100%", width: "100%", overflowX: "auto", mb: 1 }}
          onClick={() => setDisplayTable(true)}
        >

          <Table size="small" sx={{ tableLayout: "auto" }}>

            <TableHead>

              {reverseTable ? (

                <TableRow>

                  <TableCell sx={{ padding: "4px 6px" }}>
                    <Typography variant="body2" fontWeight={600}>
                      Parameters
                    </Typography>
                  </TableCell>

                  {validDetectorList.map((loc) => (
                    <TableCell key={loc} align="center" sx={{ padding: "4px 6px" }}>
                      <Typography variant="body2" fontWeight={600}>
                        {loc}
                      </Typography>
                    </TableCell>
                  ))}

                </TableRow>

              ) : (

                <TableRow>

                  <TableCell sx={{ padding: "4px 6px" }}>
                    <Typography variant="body2" fontWeight={600}>
                      Location
                    </Typography>
                  </TableCell>

                  {parameterKeys.map(({ key, label }) => (
                    <TableCell key={key} align="center" sx={{ padding: "4px 6px" }}>
                      <Typography variant="body2" fontWeight={600}>
                        {label}
                      </Typography>
                    </TableCell>
                  ))}

                </TableRow>

              )}

            </TableHead>

            {/* Reversed layout: parameters as rows, detectors as columns */}
            <TableBody>

              {reverseTable
                ? parameterKeys.map(({ key, label }) => (

                  <TableRow key={key}>

                    <TableCell sx={{ padding: "4px 6px" }}>
                      <Typography variant="body2">
                        {label}
                      </Typography>
                    </TableCell>

                    {validDetectorList.map((loc) => (
                      <TableCell
                        key={`${loc}-${key}`}
                        align="center"
                        sx={{ padding: "4px 6px" }}
                      >
                        <Typography variant="body2">
                          {formatValue(parameters[loc][key])}
                        </Typography>
                      </TableCell>
                    ))}

                  </TableRow>

                ))

                /* Default layout: detectors as rows, parameters as columns */
                : validDetectorList.map((loc) => (

                  <TableRow key={loc}>

                    <TableCell sx={{ padding: "4px 6px" }}>
                      <Typography variant="body2">
                        {loc}
                      </Typography>
                    </TableCell>

                    {parameterKeys.map(({ key }) => (
                      <TableCell
                        key={`${loc}-${key}`}
                        align="center"
                        sx={{ padding: "4px 6px" }}
                      >
                        <Typography variant="body2">
                          {formatValue(parameters[loc][key])}
                        </Typography>
                      </TableCell>
                    ))}

                  </TableRow>

                ))}

            </TableBody>

          </Table>

        </TableContainer>

      )}
      <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.5, alignSelf: 'flex-start' }}>
        <MonitorHeartIcon fontSize="small" />
        {fitStatus.length > 0 ? "Fit successful for detectors: " + fitStatus.join(", ") : "No fit has been performed"}
      </Typography>
      <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.5, alignSelf: 'flex-start' }}>
        <GraphicEqIcon fontSize="small" />
        {fftStatus === true
          ? `FFT filter active (cut-off: ${cutOff ?? "N/A"} MHz)`
          : fftStatus === false
            ? "No FFT filter has been performed"
            : "We don't have information about the FFT filter status"}
      </Typography>
      {update && <TextField 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)} 
                    label="Write a comment..." 
                  />}
      {!update && <Alert severity="info">
                    {comment}
                  </Alert>}
      {displayButtons()}
      {error && <Alert severity="error">{error.message}</Alert>}
    </div>
  );
};

export default Parameters;


/**
 * Capitalizes the first letter of a string.
 *
 * @param {string} str - Input string.
 * @returns {string} The string with its first character uppercased.
 */
export function capitalizeFirstLetter(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
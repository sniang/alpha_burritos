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
import Button from "@mui/material/Button";
import ShareIcon from "@mui/icons-material/Share";
import PivotTableChartIcon from "@mui/icons-material/PivotTableChart";
import CancelIcon from "@mui/icons-material/Cancel";

import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from "@mui/material";

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
  fileVersion
}) => {

  const [parameters, setParameters] = useState(null);
  const [error, setError] = useState(null);
  const [reverseTable, setReverseTable] = useState(false);      // Toggle between the two table orientations
  const [displayTable, setDisplayTable] = useState(false);      // Toggle plain-text / MUI table view
  const [particleConfig, setParticleConfig] = useState(null);

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
        }

        const dataKeys = Object.keys(data);
        if (dataKeys.length > 0) {
          setSelectedDetector(dataKeys[0]);
        }

      } catch (error) {
        setError(error);
        console.error("[ERROR]", error);
        setDetectorList([]);
      }
    };

    if (selectedFile) {
      fetchParameters();
      setDisplayTable(false);
    }

  }, [selectedFile, fileVersion]);


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
      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>

        <Button
          size="small"
          variant="contained"
          startIcon={<ShareIcon />}
          onClick={() => {

            const url = new URL(window.location.href);
            url.searchParams.set("id", selectedFile);

            const text = url.toString();

            navigator.clipboard.writeText(text)
              .then(() => alert("Share link copied"))
              .catch(() => alert("Copy failed"));

          }}
        >
          Share link
        </Button>

        <Button
          startIcon={<PivotTableChartIcon />}
          size="small"
          variant="contained"
          onClick={() => setReverseTable(!reverseTable)}
        >
          Reverse Table
        </Button>

        {displayTable && (
          <Button
            startIcon={<CancelIcon />}
            size="small"
            variant="contained"
            onClick={() => setDisplayTable(false)}
          >
            Back
          </Button>
        )}

      </div>
    );
  };


  // Error state: show heading + message
  if (error) {
    return (
      <div>
        <Typography variant="h5">Parameters</Typography>
        <p className="error">
          Something went wrong while loading parameters: {error.message}
        </p>
      </div>
    );
  }

  // Nothing to render until data arrives
  if (!parameters) return null;

  // Keep only detectors that actually exist in the fetched data
  const validDetectorList = detectorList.filter(
    (loc) => parameters[loc]
  );

  return (

    <Paper sx={{ flex: 1, minWidth: "300px", padding: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', gap: "2px"}}>

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
            textAlign: "left"
          }}
        >
          {makeTable()}
        </pre>

      ) : (
        <TableContainer
          component={Paper}
          sx={{ maxWidth: "100%", overflowX: "auto", mb: 1 }}
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

      {displayButtons()}

    </Paper>
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
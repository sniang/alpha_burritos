import { useState, useEffect } from "react";
import { parseTimestamp } from "./TimeStampSelector";
import "./CSS/Parameters.css";
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

// Parameter keys and display labels
export const parameterKeys = [
    { key: "area", label: "Area [V·ns]" },
    { key: "fwhm", label: "FWHM [ns]" },
    { key: "peak", label: "Peak [mV]" },
    { key: "rise", label: "Rise [ns]" },
    { key: "time peak", label: "Time Peak [ns]" },
    { key: "dt", label: "Interval [ns]" },
    { key: "time arrival", label: "Arrival [ns]" },
];

// Format value for display in table
const formatValue = (v) =>
    v === undefined || v === null ? "N/A" : Number(v).toPrecision(3);

/**
 * Displays parameter data for a selected file and list of detectors.
 *
 * Fetches parameter information from a backend API when a file is selected,
 * handles loading and error states, and renders a table of parameter values
 * for each detector in the provided detectorList. Allows toggling the table orientation.
 *
 * @param {Object} props
 * @param {string} props.selectedFile - The file to fetch parameters for.
 * @param {string[]} props.detectorList - List of detector locations to display.
 * @param {Function} props.setDetectorList - Updates the detector list.
 * @param {Function} props.setSelectedDetector - Sets the currently selected detector.
 * @param {number} props.fileVersion - Version counter for selectedFile.
 *
 * @author Samuel Niang
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
    const [reverseTable, setReverseTable] = useState(true);
    const [displayTable, setDisplayTable] = useState(false);
    const [particleConfig, setParticleConfig] = useState(null);

    useEffect(() => {
        const fetchParameters = async () => {
            try {
                const res = await fetch(`/api/json/${selectedFile}`);
                if (!res.ok) throw new Error("Network response was not ok");

                const data = await res.json();
                setParameters(data);
                setDetectorList(Object.keys(data));

                if (
                    Object.keys(data) &&
                    Object.keys(data)[0] &&
                    data[Object.keys(data)[0]] &&
                    data[Object.keys(data)[0]].config
                ) {
                    setParticleConfig(data[Object.keys(data)[0]].config);
                }

                const dataKeys = Object.keys(data);
                const areArraysEqual =
                    dataKeys.length === detectorList.length &&
                    dataKeys.every((key, idx) => key === detectorList[idx]);

                if (dataKeys.length === 0 || !areArraysEqual) {
                    setSelectedDetector(dataKeys[0]);
                }
            } catch (error) {
                setError(error);
                console.error("[ERROR]", "Parameters failed to fetch parameters:", error);
                setDetectorList([]);
            }
        };

        if (selectedFile) {
            fetchParameters();
            setDisplayTable(false);
        }
    }, [selectedFile, fileVersion]);

    /**
     * Build a tab-separated text version of the currently displayed table.
     */
    const makeTable = () => {
        if (!parameters) return "";
        const keys = Object.keys(parameters);
        if (keys.length === 0) return "";

        if (reverseTable) {
            const header = ["Parameters", ...keys].join("\t");
            const rows = parameterKeys.map(({ key, label }) => {
                const values = keys.map((loc) => formatValue(parameters[loc][key]));
                return [label, ...values].join("\t");
            });
            return [header, ...rows].join("\n");
        } else {
            const header = ["Location", ...parameterKeys.map(({ label }) => label)].join("\t");
            const rows = keys.map((loc) => {
                const values = parameterKeys.map(({ key }) =>
                    formatValue(parameters[loc][key])
                );
                return [loc, ...values].join("\t");
            });
            return [header, ...rows].join("\n");
        }
    };

    const displayButtons = () => {
        return (
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <Button
                    size="small"
                    variant="contained"
                    color="success"
                    onClick={() => {
                        const url = new URL(window.location.href);
                        url.searchParams.set("id", selectedFile);
                        const text = url.toString();

                        if (navigator.clipboard && navigator.clipboard.writeText) {
                            navigator.clipboard
                                .writeText(text)
                                .then(() => alert("Share link copied to clipboard"))
                                .catch(() => alert("Error copying link"));
                        } else {
                            const textarea = document.createElement("textarea");
                            textarea.value = text;
                            textarea.style.position = "fixed";
                            textarea.style.left = "-9999px";
                            document.body.appendChild(textarea);
                            textarea.select();
                            try {
                                document.execCommand("copy");
                                alert("Share link copied to clipboard");
                            } catch (err) {
                                alert("Error copying link");
                            }
                            document.body.removeChild(textarea);
                        }
                    }}
                    startIcon={<ShareIcon />}
                >
                    Share link
                </Button>

                <Button
                    startIcon={<PivotTableChartIcon />}
                    size="small"
                    variant="contained"
                    color="success"
                    onClick={() => setReverseTable(!reverseTable)}
                >
                    Reverse Table
                </Button>

                {displayTable && (
                    <Button
                        startIcon={<CancelIcon />}
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={() => setDisplayTable(false)}
                    >
                        Back
                    </Button>
                )}
            </div>
        );
    };

    if (error) {
        return (
            <div>
                <Typography variant="h5">Parameters</Typography>
                <p className="error">
                    Something went wrong while loading the parameters: {error.message}
                </p>
            </div>
        );
    }

    if (!parameters) return null;

    const validDetectorList = detectorList.filter((loc) => parameters[loc]);

    return (
        <div id="parametersBlock" className="blocks">
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                {particleConfig && `${capitalizeFirstLetter(particleConfig)} - `}
                {parseTimestamp(selectedFile)}
            </Typography>

            {displayTable ? (
                <textarea value={makeTable()} readOnly />
            ) : (
                <TableContainer
                    component={Paper}
                    onClick={() => setDisplayTable(true)}
                    sx={{
                        mb: 1,
                        maxWidth: "100%",
                        overflowX: "auto",
                        cursor: "pointer"
                    }}
                >
                    <Table size="small">
                        <TableHead>
                            {reverseTable ? (
                                <TableRow>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={600}>
                                            Parameters
                                        </Typography>
                                    </TableCell>
                                    {validDetectorList.map((loc) => (
                                        <TableCell key={loc}>
                                            <Typography variant="body2" fontWeight={600}>
                                                {loc}
                                            </Typography>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ) : (
                                <TableRow>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={600}>
                                            Location
                                        </Typography>
                                    </TableCell>
                                    {parameterKeys.map(({ key, label }) => (
                                        <TableCell key={key}>
                                            <Typography variant="body2" fontWeight={600}>
                                                {label}
                                            </Typography>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            )}
                        </TableHead>

                        <TableBody>
                            {reverseTable
                                ? parameterKeys.map(({ key, label }) => (
                                      <TableRow key={key}>
                                          <TableCell>
                                              <Typography variant="body2">{label}</Typography>
                                          </TableCell>
                                          {validDetectorList.map((loc) => (
                                              <TableCell key={`${loc}-${key}`}>
                                                  <Typography variant="body2">
                                                      {formatValue(parameters[loc][key])}
                                                  </Typography>
                                              </TableCell>
                                          ))}
                                      </TableRow>
                                  ))
                                : validDetectorList.map((loc) => (
                                      <TableRow key={loc}>
                                          <TableCell>
                                              <Typography variant="body2">{loc}</Typography>
                                          </TableCell>
                                          {parameterKeys.map(({ key }) => (
                                              <TableCell key={`${loc}-${key}`}>
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
        </div>
    );
};

export default Parameters;

// Capitalize the first letter of a string
export function capitalizeFirstLetter(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}
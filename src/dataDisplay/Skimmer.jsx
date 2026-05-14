import { useState, useEffect, useMemo } from "react";
import { parseTimestamp } from "../dataSelection/TimeStampSelector";
import DetectorSelector from "../dataSelection/DetectorSelector";
import { parameterKeys } from "../dataDisplay/Parameters";
import SaveIcon from '@mui/icons-material/Save';
import Button from '@mui/material/Button';
import CancelIcon from '@mui/icons-material/Cancel';
import SkimmerPlot from "./SkimmerPlot.jsx";
import { Switch, FormControl, InputLabel, Select, MenuItem, TextField, FormControlLabel, Box, Typography, Paper, Table as MuiTable, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";

/**
 * Displays the skimmer workspace used to inspect a subset of acquisitions,
 * export the visible table as CSV, and request a plot for the current selection.
 *
 * @component
 * @author Samuel Niang
 * @param {Object} props - Component props
 * @param {Array<string>} props.jsonFiles - List of available JSON file names
 * @param {string} props.selectedDetector - The currently selected detector
 * @param {Function} props.setSelectedDetector - Function to update the selected detector
 * @param {Array<string>} props.detectorList - List of available detectors
 * @returns {JSX.Element} The rendered Skimmer component
 */
const Skimmer = ({ jsonFiles, selectedDetector, setSelectedDetector, detectorList }) => {
    const [endingIndex, setEndingIndex] = useState(0);
    const [startingIndex, setStartingIndex] = useState(0);
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [particles, setParticles] = useState("antiprotons");
    const [isTableTextArea, setIsTableTextArea] = useState(false);
    const [isSwitchOn, setIsSwitchOn] = useState(false);
    const [nValue, setNValue] = useState(3);

    // Keep a sorted copy so the selectors always display a stable order.
    const jsonFilesSorted = useMemo(
        () => (jsonFiles ? [...jsonFiles].sort((a, b) => b.localeCompare(a)) : []),
        [jsonFiles]
    );

    // Load the JSON payloads for the currently selected acquisition range.
    useEffect(() => {
        if (!jsonFilesSorted.length) return;
        setIsLoading(true);
        setData([]);
        const startIdx = isSwitchOn ? 0 : startingIndex;
        const endingIdx = isSwitchOn ? jsonFilesSorted.length : endingIndex;

        (async () => {
            try {
                const fileSlice = jsonFilesSorted.slice(startIdx, endingIdx + 1);
                const localData = await Promise.all(fileSlice.map(async (file) => {
                    const res = await fetch(`/api/json/${file}`);
                    if (!res.ok) throw new Error(`Failed to fetch ${file}`);
                    return res.json();
                }));
                localData.sort((a, b) => {
                    const keyA = Object.keys(a)[0], keyB = Object.keys(b)[0];
                    return a[keyA].signal.localeCompare(b[keyB].signal);
                });
                setData(localData);
            } catch (error) {
                console.error('[ERROR]', "Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [jsonFilesSorted, startingIndex, endingIndex, isSwitchOn]);

    // Keep only the rows that match the selected particle type.
    useEffect(() => {
        const newFilteredData = data.filter(line => line[Object.keys(line)[0]].config === particles);
        setFilteredData(newFilteredData);
    }, [particles, data]);

    // Clamp the "last N acquisitions" value to the available data.
    const handleNValueChange = (value) => {
        let N;
        if (value < 1) N = 1;
        else if (value > filteredData.length) N = filteredData.length;
        else N = value;
        setNValue(N);
    };

    // Early exit when no acquisitions are available for the selected date.
    if (!jsonFiles || !jsonFiles.length) {
        return (
            <Paper elevation={3} sx={{ width: '100%', padding: 2, border: '2px solid black' }}>
                No JSON files available.
            </Paper>
        );
    }

    // Shared formatter used by the table and CSV export.
    const formatValue = v => (v === undefined || v === null) ? "N/A" : Number(v).toPrecision(3);

    // Selection controls for particle type, detector, and acquisition range.
    const Selectors = () => (
        <>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel sx={{ fontSize: 13 }}>Particle</InputLabel>
                    <Select sx={{ fontSize: 13 }} value={particles} onChange={e => setParticles(e.target.value)} label="Particle">
                        <MenuItem sx={{ fontSize: 13 }} value="positrons">Positrons</MenuItem>
                        <MenuItem sx={{ fontSize: 13 }} value="antiprotons">Antiprotons</MenuItem>
                    </Select>
                </FormControl>

                <DetectorSelector
                    selectedDetector={selectedDetector}
                    setSelectedDetector={setSelectedDetector}
                    detectorList={detectorList}
                />

                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel sx={{ fontSize: 13 }}>Acquisition timestamp</InputLabel>
                    <Select sx={{ fontSize: 13 }} value={endingIndex} onChange={e => setEndingIndex(Number(e.target.value))} label="Acquisition timestamp">
                        {jsonFilesSorted.map((file, i) => (
                            <MenuItem sx={{ fontSize: 13 }} key={file} value={i}>
                                {parseTimestamp(file)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel sx={{ fontSize: 13 }}>Acquisition timestamp</InputLabel>
                    <Select sx={{ fontSize: 13 }} value={startingIndex} onChange={e => setStartingIndex(Number(e.target.value))} label="Acquisition timestamp">
                        <MenuItem sx={{ fontSize: 13 }} value="" disabled>
                            Acquisition timestamp
                        </MenuItem>
                        {jsonFilesSorted.map((file, i) => (
                            <MenuItem sx={{ fontSize: 13 }} key={file} value={i}>
                                {parseTimestamp(file)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>
            <Box display="flex" alignItems="center" gap={2} justifyContent="center" flexWrap="wrap">
                <FormControlLabel
                    control={
                        <Switch
                            checked={isSwitchOn}
                            onChange={e => setIsSwitchOn(e.target.checked)}
                        />
                    }
                    label="Last N acquisitions"
                />
                <TextField
                    label="N"
                    type="number"
                    variant="outlined"
                    size="small"
                    value={nValue}
                    onChange={e => handleNValueChange(Number(e.target.value))}
                    disabled={!isSwitchOn}
                    sx={{ width: '100px' }}
                />
            </Box>
        </>
    );

    // Default MUI table view for the current skimmer selection.
    const Table = () => {
        let localData = filteredData;
        if (isSwitchOn) {
            localData = localData.slice(Math.max(localData.length - nValue, 0), localData.length);
        }

        return (
            <TableContainer
                component={Paper}
                sx={{ maxWidth: "800px", overflowX: "auto", mb: 1 }}
                onClick={() => setIsTableTextArea(true)}
            >
                <MuiTable size="small" sx={{ tableLayout: "auto" }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ padding: "4px 6px", minWidth: 150 }}>
                                <Typography variant="body2" fontWeight={600}>Timestamps</Typography>
                            </TableCell>
                            {parameterKeys.map(({ label }) => (
                                <TableCell key={label} align="center" sx={{ padding: "4px 6px" }}>
                                    <Typography variant="body2" fontWeight={600}>{label}</Typography>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {localData.map((line, index) => {
                            const key1 = Object.keys(line)[0];
                            const timestamp = parseTimestamp(line[key1]?.signal.replace('.txt', '.json')) || "N/A";
                            return (
                                <TableRow key={`${key1}-${index}`}>
                                    <TableCell sx={{ padding: "4px 6px" }}>
                                        <Typography variant="body2">{timestamp}</Typography>
                                    </TableCell>
                                    {parameterKeys.map(({ key }) => (
                                        <TableCell key={key} align="center" sx={{ padding: "4px 6px", minWidth: 50 }}>
                                            <Typography variant="body2">{formatValue(line?.[selectedDetector]?.[key])}</Typography>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            );
                        })}
                        {/* Mean row */}
                        <TableRow>
                            <TableCell sx={{ padding: "4px 6px" }}>
                                <Typography variant="body2" fontWeight={600}>Mean</Typography>
                            </TableCell>
                            {parameterKeys.map(({ key }) => (
                                <TableCell key={key} align="center" sx={{ padding: "4px 6px", minWidth: 50 }}>
                                    <Typography variant="body2" fontWeight={600}>
                                        {formatValue(localData.reduce((acc, line) => acc + line?.[selectedDetector]?.[key], 0) / localData.length)}
                                    </Typography>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableBody>
                </MuiTable>
            </TableContainer>
        );
    };

    // Plain-text view used after clicking the table for easy copy/paste.
    const TableTextArea = () => {
        let localData = filteredData;
        if (isSwitchOn) {
            localData = localData.slice(Math.max(localData.length - nValue, 0), localData.length);
        }

        // Build a 2D grid of strings (headers + data rows + separator + mean)
        const grid = [
            ["Timestamps", ...parameterKeys.map(({ label }) => label)],
            ...localData.map(line => {
                const key1 = Object.keys(line)[0];
                const timestamp = parseTimestamp(line[key1]?.signal.replace('.txt', '.json')) || "N/A";
                return [timestamp, ...parameterKeys.map(({ key }) => formatValue(line?.[selectedDetector]?.[key]))];
            }),
            ["Mean", ...parameterKeys.map(({ key }) =>
                formatValue(localData.reduce((acc, line) => acc + line?.[selectedDetector]?.[key], 0) / localData.length)
            )]
        ];

        // Compute max width per column
        const colCount = grid[0].length;
        const colWidths = Array.from({ length: colCount }, (_, c) =>
            Math.max(...grid.map((row) => (row[c] || "").length))
        );

        // Format rows with padding
        const formatRow = (row) => row.map((cell, c) => cell.padEnd(colWidths[c])).join("  ");
        const lineWidth = formatRow(grid[0]).length;
        const dataRows = grid.slice(0, -1).map(formatRow);
        const separator = "-".repeat(lineWidth);
        const meanRow = formatRow(grid[grid.length - 1]);

        const tableText = [...dataRows, separator, meanRow].join("\n");

        return (
            <pre
                style={{
                    background: "#f5f5f5",
                    padding: "10px",
                    borderRadius: "6px",
                    fontSize: "0.65rem",
                    overflowX: "auto",
                    marginBottom: "10px",
                    textAlign: "center",
                    width: "100%",
                    maxWidth: "750px",
                    cursor: "text"
                }}
            >
                {tableText}
            </pre>
        );
    };

    // Exports the currently visible rows as a CSV file.
    const DownloadCSVButton = () => {
        const filename = `burrito_${particles}_data.csv`;
        if (!data) return null;
        const headers = ["Timestamps", ...parameterKeys.map(({ label }) => label)];
        let localData = filteredData;
        if (isSwitchOn) {
            localData = localData.slice(Math.max(localData.length - nValue, 0), localData.length);
        }

        const rows = localData
            .map(line => {
                const key1 = Object.keys(line)[0];
                const timestamp = parseTimestamp(line[key1]?.signal.replace('.txt', '.json')) || "N/A";
                const values = parameterKeys.map(({ key }) => formatValue(line?.[selectedDetector]?.[key]));
                return [timestamp, ...values];
            });
        const downloadCSV = () => {
            const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url; link.download = filename; link.click();
            URL.revokeObjectURL(url);
        };
        return (
            <Button
                startIcon={<SaveIcon />}
                variant="contained"
                size="small"
                onClick={downloadCSV}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
                Download the summary (.csv)
            </Button>
        );
    };

    return (
        <Paper elevation={3} sx={{ width: '100%', padding: 2, border: '2px solid black', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: "10px" }}>
            <Typography variant="h5">Skimmer</Typography>
            <Selectors />
            {isLoading && <div className="loading-indicator">Loading data...</div>}
            {!isLoading && data && !isTableTextArea && <Table />}
            {!isLoading && data && isTableTextArea && <TableTextArea />}
            <div style={{ display: "flex", gap: "10px" }}>
                {!isLoading && data && <DownloadCSVButton />}
                {!isLoading && filteredData && (
                    <SkimmerPlot
                        filteredData={filteredData}
                        selectedDetector={selectedDetector}
                        isSwitchOn={isSwitchOn}
                        nValue={nValue}
                    />
                )}
                {!isLoading && data && isTableTextArea && (
                    <Button startIcon={<CancelIcon />} color="secondary" size="small" variant="contained" onClick={() => setIsTableTextArea(false)}>
                        Back
                    </Button>
                )}
            </div>
        </Paper>
    );
};

export default Skimmer;

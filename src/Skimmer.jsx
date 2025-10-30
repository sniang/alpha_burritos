import React, { useState, useEffect, useMemo } from "react";
import "./CSS/Skimmer.css";
import { parseTimestamp } from "./TimeStampSelector";
import DetectorSelector from "./DetectorSelector";
import { parameterKeys } from "./Parameters";
import SaveIcon from '@mui/icons-material/Save';
import Button from '@mui/material/Button';
import CancelIcon from '@mui/icons-material/Cancel';
import { Switch, FormControl, InputLabel, Select, MenuItem, TextField, FormControlLabel, Box } from "@mui/material";


/**
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

    // Sort JSON files alphabetically for consistent display
    const jsonFilesSorted = useMemo(() =>
        jsonFiles ? [...jsonFiles].sort((a, b) => b.localeCompare(a)) : []
        , [jsonFiles]);

    // Fetch data when component mounts or dependencies change
    useEffect(() => {
        if (!jsonFilesSorted.length) return;
        setIsLoading(true); setData([]);
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
            } catch (error) { console.error("Error fetching data:", error); }
            finally { setIsLoading(false); }
        })();
    }, [jsonFiles, startingIndex, endingIndex, isSwitchOn]);

    // Handle changes to the particle selection
    useEffect(() => {
        const newFilteredData = data.filter(line => line[Object.keys(line)[0]].config === particles);
        setFilteredData(newFilteredData);
    }, [particles, data]);
    
    // Handle changes to the N value input
    const handleNValueChange = (value) => {
        let N = 1;
        if (value < 1) N = 1;
        else if (value > filteredData.length) N = filteredData.length;
        else N = value;
        setNValue(N);
    };

    // Early return if no files are available
    if (!jsonFiles || !jsonFiles.length)
        return <div className="skimmer-container">No JSON files available.</div>;

    const formatValue = v => (v === undefined || v === null) ? "N/A" : Number(v).toPrecision(3);

    // Control panel for detector and range selection
    const Selectors = () => (
        <><div className="skimmer-controls">
            <FormControl size="small" color="success" sx={{ minWidth: 150 }}>
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

            <FormControl size="small" color="success" sx={{ minWidth: 150 }}>
                <InputLabel sx={{ fontSize: 13 }}>Acquisition timestamp</InputLabel>
                <Select sx={{ fontSize: 13 }} value={endingIndex} onChange={e => setEndingIndex(Number(e.target.value))} label="Acquisition timestamp">
                    {jsonFilesSorted.map((file, i) =>
                        <MenuItem sx={{ fontSize: 13 }} key={file} value={i}>{parseTimestamp(file)}</MenuItem>
                    )}
                </Select>
            </FormControl>

            <FormControl size="small" color="success" sx={{ minWidth: 150 }}>
                <InputLabel sx={{ fontSize: 13 }}>Acquisition timestamp</InputLabel>
                <Select sx={{ fontSize: 13 }} value={startingIndex} onChange={e => setStartingIndex(Number(e.target.value))} label="Acquisition timestamp">
                    <MenuItem sx={{ fontSize: 13 }} value="" disabled>Acquisition timestamp</MenuItem>
                    {jsonFilesSorted.map((file, i) =>
                        <MenuItem sx={{ fontSize: 13 }} key={file} value={i}>{parseTimestamp(file)}</MenuItem>
                    )}
                </Select>
            </FormControl>


        </div>
            <Box display="flex" alignItems="center" gap={2}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={isSwitchOn}
                            onChange={e => setIsSwitchOn(e.target.checked)}
                            color="success"
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
                    color="success"
                    sx={{ width: '100px' }}
                />
            </Box>
        </>

    );

    // Table display
    const Table = () => {
        let localData = filteredData
        if (isSwitchOn) { localData = localData.slice(Math.max(localData.length - nValue, 0), localData.length); }
        return (
            <div className="skimmer-grid" onClick={() => setIsTableTextArea(true)}>
                <span>Timestamps</span>
                {parameterKeys.map(({ label }) => <span key={label}>{label}</span>)}
                {localData.map((line, index) => {
                    const key1 = Object.keys(line)[0];
                    const timestamp = parseTimestamp(line[key1]?.signal.replace('.txt', '.json')) || "N/A";
                    return (
                        <React.Fragment key={`${key1}-${index}`}>
                            <span>{timestamp}</span>
                            {parameterKeys.map(({ key }) =>
                                <span key={key}>{formatValue(line?.[selectedDetector]?.[key])}</span>
                            )}
                        </React.Fragment>
                    );
                })}
                {/* Mean row */}
                <span style={{ fontWeight: 'bold' }}>Mean</span>
                {parameterKeys.map(({ key }) =>
                    <span key={key} style={{ fontWeight: 'bold' }}>{formatValue(localData.reduce((acc, line) => acc + line?.[selectedDetector]?.[key], 0) / localData.length)}</span>
                )}
            </div>

        )
    };


    // Textarea table display
    const TableTextArea = () => {
        const headers = ["Timestamps\t\t", ...parameterKeys.map(({ label }) => label)];
        let localData = filteredData;
        if (isSwitchOn) { localData = localData.slice(Math.max(localData.length - nValue, 0), localData.length); }
        const rows = localData
            .map(line => {
                const key1 = Object.keys(line)[0];
                const timestamp = parseTimestamp(line[key1]?.signal.replace('.txt', '.json')) || "N/A";
                const values = parameterKeys.map(({ key }) => formatValue(line?.[selectedDetector]?.[key]));
                return [timestamp, ...values].join("\t\t");
            });
        let tableText = [headers.join("\t"), ...rows].join("\n");
        const meanRow = "\nMean\t\t\t\t" +
            parameterKeys.map(({ key }) =>
                formatValue(localData.reduce((acc, line) => acc + line?.[selectedDetector]?.[key], 0) / localData.length)
            ).join("\t\t");
        // Mean row
        tableText += '\n' + '-'.repeat(2.5 * meanRow.length);
        tableText += meanRow;
        return <textarea className="skimmer-textarea" readOnly value={tableText} />;
    };

    // CSV download button
    const DownloadCSVButton = () => {
        const filename = `burrito_${particles}_data.csv`;
        if (!data) return null;
        const headers = ["Timestamps", ...parameterKeys.map(({ label }) => label)];
        let localData = filteredData;
        if (isSwitchOn) { localData = localData.slice(Math.max(localData.length - nValue, 0), localData.length); }
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
                color="success"
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
        <div className="skimmer-container blocks" style={{ minWidth: "850px" }}>
            <h2>Skimmer</h2>
            <Selectors />
            {isLoading && <div className="loading-indicator">Loading data...</div>}
            {!isLoading && data && !isTableTextArea && <Table />}
            {!isLoading && data && isTableTextArea && <TableTextArea />}
            <div style={{ display: "flex", gap: "10px" }}>
                {!isLoading && data && <DownloadCSVButton />}
                {!isLoading && data && isTableTextArea && <Button startIcon={<CancelIcon />} color="error" size="small" variant="contained" onClick={() => setIsTableTextArea(false)}>Back</Button>}
            </div>
        </div>
    );
};

export default Skimmer;

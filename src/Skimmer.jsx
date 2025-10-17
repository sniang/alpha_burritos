import { useState, useEffect, useMemo } from "react";
import "./CSS/Skimmer.css";
import { parseTimestamp } from "./TimeStampSelector";
import DetectorSelector from "./DetectorSelector";
import { parameterKeys } from "./Parameters";
import SaveIcon from '@mui/icons-material/Save';
import Button from '@mui/material/Button';


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
    const [isLoading, setIsLoading] = useState(false);
    const [particles, setParticles] = useState("antiprotons");
    const [isTableTextArea, setIsTableTextArea] = useState(false);

    // Sort JSON files alphabetically for consistent display
    const jsonFilesSorted = useMemo(() =>
        jsonFiles ? [...jsonFiles].sort((a, b) => b.localeCompare(a)) : []
        , [jsonFiles]);

    // Fetch data when component mounts or dependencies change
    useEffect(() => {
        if (!jsonFilesSorted.length) return;
        setIsLoading(true); setData([]);
        (async () => {
            try {
                const fileSlice = jsonFilesSorted.slice(startingIndex, endingIndex + 1);
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
    }, [jsonFiles, startingIndex, endingIndex]);

    // Early return if no files are available
    if (!jsonFiles || !jsonFiles.length)
        return <div className="skimmer-container">No JSON files available.</div>;

    const formatValue = v => (v === undefined || v === null) ? "N/A" : Number(v).toPrecision(5);

    // Control panel for detector and range selection
    const Selectors = () => (
        <div className="skimmer-controls">
            <label>Particle:
                <select value={particles} onChange={e => setParticles(e.target.value)}>
                    <option value="positrons">Positrons</option>
                    <option value="antiprotons">Antiprotons</option>
                </select>
            </label>
            <DetectorSelector
                selectedDetector={selectedDetector}
                setSelectedDetector={setSelectedDetector}
                detectorList={detectorList}
            />
            <label>
                Starting:
                <select value={endingIndex} onChange={e => setEndingIndex(Number(e.target.value))}>
                    <option value="" disabled>Acquisition timestamp</option>
                    {jsonFilesSorted.map((file, i) =>
                        <option key={file} value={i}>{parseTimestamp(file)}</option>
                    )}
                </select>
            </label>
            <label>
                Ending:
                <select value={startingIndex} onChange={e => setStartingIndex(Number(e.target.value))}>
                    <option value="" disabled>Acquisition timestamp</option>
                    {jsonFilesSorted.map((file, i) =>
                        <option key={file} value={i}>{parseTimestamp(file)}</option>
                    )}
                </select>
            </label>
        </div>
    );

    // Table display
    const Table = () => (
        <div className="skimmer-grid" onClick={() => setIsTableTextArea(true)}>
            <span>Timestamps</span>
            {parameterKeys.map(({ label }) => <span key={label}>{label}</span>)}
            {data.filter(line => line[Object.keys(line)[0]].config === particles).map(line => {
                const key1 = Object.keys(line)[0];
                const timestamp = parseTimestamp(line[key1]?.signal.replace('.txt', '.json')) || "N/A";
                return (
                    <>
                        <span>{timestamp}</span>
                        {parameterKeys.map(({ key }) =>
                            <span key={key}>{formatValue(line?.[selectedDetector]?.[key])}</span>
                        )}
                    </>
                );
            })}
        </div>
    );

    // Textarea table display
    const TableTextArea = () => {
        const headers = ["Timestamps\t\t", ...parameterKeys.map(({ label }) => label)];
        const rows = data
            .filter(line => line[Object.keys(line)[0]].config === particles)
            .map(line => {
                const key1 = Object.keys(line)[0];
                const timestamp = parseTimestamp(line[key1]?.signal.replace('.txt', '.json')) || "N/A";
                const values = parameterKeys.map(({ key }) => formatValue(line?.[selectedDetector]?.[key]));
                return [timestamp, ...values].join("\t\t");
            });
        const tableText = [headers.join("\t"), ...rows].join("\n");
        return <textarea className="skimmer-textarea" readOnly value={tableText} />;
    };

    // CSV download button
    const DownloadCSVButton = () => {
        const filename = `burrito_${particles}_data.csv`;
        if (!data) return null;
        const headers = ["Timestamps", ...parameterKeys.map(({ label }) => label)];
        const rows = data
            .filter(line => line[Object.keys(line)[0]].config === particles)
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
        <div className="skimmer-container blocks">
            <h2>Skimmer</h2>
            <Selectors />
            {isLoading && <div className="loading-indicator">Loading data...</div>}
            {!isLoading && data && !isTableTextArea && <Table />}
            {!isLoading && data && isTableTextArea && <TableTextArea />}
            <div style={{display: "flex", gap: "10px"}}>
                {!isLoading && data && <DownloadCSVButton />}
                {!isLoading && data && isTableTextArea && <button onClick={() => setIsTableTextArea(false)}>Back to Table</button>}
            </div>
        </div>
    );
};

export default Skimmer;

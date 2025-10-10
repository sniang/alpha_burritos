import { useState, useEffect, useMemo } from "react";
import "./CSS/Skimmer.css";
import { parseTimestamp } from "./TimeStampSelector";
import DetectorSelector from "./DetectorSelector";
import { parameterKeys } from "./Parameters";
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

    const fetchData = async () => {
        if (!jsonFilesSorted.length) return;
        setIsLoading(true);
        setData([]);
        try {
            const fileSlice = jsonFilesSorted.slice(startingIndex, endingIndex + 1);
            const localData = await Promise.all(
                fileSlice.map(async (file) => {
                    const res = await fetch(`/api/json/${file}`);
                    if (!res.ok) throw new Error(`Failed to fetch ${file}`);
                    return res.json();
                })
            );
            localData.sort((a, b) => {
                const keyA = Object.keys(a)[0];
                const keyB = Object.keys(b)[0];
                return a[keyA].signal.localeCompare(b[keyB].signal);
            });
            // setData(localData.filter(d => d[Object.keys(d)[0]].config === particles));
            setData(localData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    }

    // Fetch data when component mounts or dependencies change
    useEffect(() => {
        if (jsonFilesSorted.length > 0) {
            fetchData();
        }
    }, [jsonFiles, startingIndex, endingIndex]);

    // Early return if no files are available
    if (!jsonFiles || jsonFiles.length === 0) {
        return <div className="skimmer-container">No JSON files available.</div>;
    }

    const formatValue = (value) => {
        if (value === undefined || value === null) return "N/A";
        return Number(value).toPrecision(5);
    };

    const Selectors = () => (
        <div className="skimmer-controls">
            {/* Particle type */}
            <label>Particle:
                <select
                    value={particles}
                    onChange={(e) => setParticles(e.target.value)}
                >
                    <option value="positrons">Positrons</option>
                    <option value="antiprotons">Antiprotons</option>
                </select>
            </label>
            {/* Detector selector */}
            <DetectorSelector
                selectedDetector={selectedDetector}
                setSelectedDetector={setSelectedDetector}
                detectorList={detectorList}
            />
            {/* Starting timestamp selector */}
            <label>
                Starting:
                <select
                    value={endingIndex}
                    onChange={(e) => setEndingIndex(Number(e.target.value))}
                >
                    <option value="" disabled>Acquisition timestamp</option>
                    {jsonFilesSorted.map((file, index) => (
                        <option key={file} value={index}>{parseTimestamp(file)}</option>
                    ))}
                </select>
            </label>
            {/* Ending timestamp selector */}
            <label>
                Ending:
                <select
                    value={startingIndex}
                    onChange={(e) => setStartingIndex(Number(e.target.value))}
                >
                    <option value="" disabled>Acquisition timestamp</option>
                    {jsonFilesSorted.map((file, index) => (
                        <option key={file} value={index}>{parseTimestamp(file)}</option>
                    ))}
                </select>
            </label>
        </div>
    );

    const Table = () => (
        <div className="skimmer-grid" onClick={() => setIsTableTextArea(true)}>
            <span>Timestamps</span>
            {parameterKeys.map(({ label }) => <span key={label}>{label}</span>)}
            {data.filter(line => line[Object.keys(line)[0]].config === particles).map((line) => {
                let key1 = Object.keys(line)[0];
                const timestamp = parseTimestamp(line[key1]?.signal.replace('.txt', '.json')) || "N/A";
                return (<><span>{timestamp}</span> {parameterKeys.map(({ key }) => <span key={key}>{formatValue(line?.[selectedDetector]?.[key])}</span>)}</>);
            })}
        </div>
    );

    const TableTextArea = () => {
        const headers = ["Timestamps\t\t", ...parameterKeys.map(({ label }) => label)];

        const rows = data
            .filter(line => line[Object.keys(line)[0]].config === particles)
            .map((line) => {
                const key1 = Object.keys(line)[0];
                const timestamp = parseTimestamp(line[key1]?.signal.replace('.txt', '.json')) || "N/A";
                const values = parameterKeys.map(({ key }) => formatValue(line?.[selectedDetector]?.[key]));
                return [timestamp, ...values].join("\t\t");
            });

        const tableText = [headers.join("\t"), ...rows].join("\n");

        return (
            <textarea
                className="skimmer-textarea"
                readOnly
                value={tableText}
            />
        );
    };

    const DownloadCSVButton = () => {
        const filename = `burrito_${particles}_data.csv`;
        if (!data) return null;

        const headers = ["Timestamps", ...parameterKeys.map(({ label }) => label)];

        const rows = data
            .filter(line => line[Object.keys(line)[0]].config === particles)
            .map((line) => {
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
            link.href = url;
            link.download = filename;
            link.click();
            URL.revokeObjectURL(url);
        };

        return (
            <button
                onClick={downloadCSV}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
                Download CSV
            </button>
        );
    };

    return (
        <div className="skimmer-container blocks">
            <h2>Skimmer</h2>
            {/* Control panel for detector and range selection */}
            <Selectors />
            {/* Display loading indicator or data */}
            {isLoading && <div className="loading-indicator">Loading data...</div>}
            {!isLoading && data && !isTableTextArea && <Table />}
            {!isLoading && data && isTableTextArea && <TableTextArea />}
            {!isLoading && data && <DownloadCSVButton />}
            {!isLoading && data && isTableTextArea && <button onClick={() => setIsTableTextArea(false)}>Back to Table</button>}
        </div>
    );
};

export default Skimmer;


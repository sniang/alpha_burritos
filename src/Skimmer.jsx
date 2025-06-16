import React, { useState, useEffect } from "react";
import "./CSS/Skimmer.css";
import { parseTimestamp } from "./TimeStampSelector";
import DetectorSelector from "./DetectorSelector";
import { parameterKeys } from "./Parameters";


const getText = (jsonFiles, data, startingIndex, endingIndex) => {
    let text = "Timestamp\t\t";
    if (!data || data.length === 0) {
        return "No data available.";
    }
    parameterKeys.forEach(({ label }) => {
        text += `${label}\t`;
    });
    text += "\n";
    const jsonFilesSlice = jsonFiles.slice(startingIndex, endingIndex + 1)
    jsonFilesSlice.map((file, index) => {
        text += `${parseTimestamp(jsonFilesSlice[index])}\t`;
        parameterKeys.forEach(({ key }) => {
            if (!data[index] || !data[index]["PMT11"] || !data[index]["PMT11"][key]) {
                text += "N/A\t"; // Handle missing data gracefully
                return;
            } else {
                let value = data[index]["PMT11"][key];
                text += `${Number(value).toPrecision(5)}\t`;
            }

        });
        text += "\n";
    });
    return text;
}

const Skimmer = ({ jsonFiles, selectedDetector, setSelectedDetector, detectorList }) => {
    const [startingIndex, setStartingIndex] = useState(0);
    const [endingIndex, setEndingIndex] = useState(1);
    const [data, setData] = useState([]);

    if (!jsonFiles || jsonFiles.length === 0) {
        return <div className="skimmer-container">No JSON files available.</div>;
    }

    useEffect(() => {

        const fetchData = async () => {

            setData([]);
            try {
                const fileSlice = jsonFiles.slice(startingIndex, endingIndex + 1);
                const localData = await Promise.all(
                    fileSlice.map(async (file) => {
                        const res = await fetch(`/api/json/${file}`);
                        if (!res.ok) throw new Error('Network response was not ok');
                        return res.json();
                    })
                );
                setData(localData);
                console.log("Data fetched successfully:", localData);
            }
            catch (error) {
                console.error("Error fetching data:", error);
                setData([]);
            }
        }

        if (jsonFiles.length > 0) {
            console.log("Fetching data...");
            fetchData();
        }
    }
        , [startingIndex, endingIndex]);

    return (
        <div className="skimmer-container">
            <h2>Skimmer</h2>
            <div className="skimmer-controls">
                {/* <DetectorSelector
                    selectedDetector={selectedDetector}
                    setSelectedDetector={setSelectedDetector}
                    detectorList={detectorList}
                /> */}
                <label>
                    Starting:
                    <select
                        value={startingIndex}
                        onChange={(event) => setStartingIndex(parseInt(event.target.value))}
                    >
                        <option value="" disabled>Acquisition timestamp</option>
                        {jsonFiles.map((file, index) => (
                            <option key={index} value={index}>{parseTimestamp(file)}</option>
                        ))}
                    </select>
                </label>
                <label>
                    Ending:
                    <select
                        value={endingIndex}
                        onChange={(event) => setEndingIndex(parseInt(event.target.value))}
                    >
                        <option value="" disabled>Acquisition timestamp</option>
                        {jsonFiles.map((file, index) => (
                            <option key={index} value={index}>{parseTimestamp(file)}</option>
                        ))}
                    </select>
                </label>
            </div>
            {data &&
                <textarea
                    value={getText(jsonFiles, data, startingIndex, endingIndex)}
                    readOnly
                    className="skimmer-textarea"
                />}
        </div>
    );
}
export default Skimmer;
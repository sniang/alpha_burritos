import Button from '@mui/material/Button';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import MessageAlert from '../app/MessageAlert.jsx';
import { useState } from 'react';

/**
 * Renders the action used to request a skimmer plot from the backend
 * for the currently selected detector and acquisition subset.
 *
 * @component
 * @author Samuel Niang
 * @param {Object} props - Component props
 * @param {Array<Object>} props.filteredData - Acquisition rows already filtered by particle type
 * @param {string} props.selectedDetector - Detector whose data should be plotted
 * @param {boolean} props.isSwitchOn - Whether the "Last N acquisitions" mode is enabled
 * @param {number} props.nValue - Number of acquisitions to keep when "Last N" mode is enabled
 * @returns {JSX.Element} The rendered SkimmerPlot component
 */
const SkimmerPlot = ({ filteredData, selectedDetector, isSwitchOn, nValue }) => {
    const [alertMessage, setAlertMessage] = useState(null);

    // Build the list of selected JSON files and trigger plot generation.
    const handleMakePlot = async () => {
        if (filteredData.length === 0) {
            setAlertMessage('No data available for plotting.');
            return;
        }

        try {
            setAlertMessage('Preparing data for plotting...');

            let localData = filteredData;
            if (isSwitchOn) {
                localData = localData.slice(Math.max(localData.length - nValue, 0), localData.length);
            }

            const selectedToPlot = { jsonFiles: [] };
            localData.forEach((line) => {
                if (!line[selectedDetector]) {
                    throw new Error(`Selected detector "${selectedDetector}" not found in data line.`);
                }
                selectedToPlot.jsonFiles.push(`${line[selectedDetector].timestamp}.json`);
            });

            const result = await fetch(`/api/skimmer/${selectedDetector}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ jsonFiles: selectedToPlot.jsonFiles }),
            });

            if (!result.ok) {
                const errorData = await result.json();
                throw new Error(errorData.message || 'Failed to prepare plot data');
            }

            setAlertMessage(`New plot available! (Data prepared for detector: ${selectedDetector})`);
        } catch (error) {
            setAlertMessage(`Error preparing data for plotting: ${error.message}`);
        }
    };

    return (
        <>
            <MessageAlert
                message={alertMessage}
                setMessage={setAlertMessage}
            />
            <Button
                variant="contained"
                size="small"
                onClick={handleMakePlot}
                startIcon={<AutoGraphIcon />}
            >
                Make a plot
            </Button>
        </>
    );
};

export default SkimmerPlot;

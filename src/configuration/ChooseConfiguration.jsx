import { useState, useEffect } from "react";
import Button from '@mui/material/Button';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import InfoIcon from '@mui/icons-material/Info';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import MessageAlert from "../app/MessageAlert.jsx";
import {Paper, Alert, Typography} from "@mui/material";
import ConfigTable from "./ConfigTable.jsx";
/**
 * ChooseConfiguration component provides UI controls for selecting the analysis configuration
 * ("positrons" or "antiprotons") and toggling the "fit" option. It fetches the current configuration
 * from the backend, allows users to update it, and displays configuration details. Also includes
 * a "Re-analyse" button to trigger re-analysis of the selected file.
 *
 * @component
 * @param {Object} props
 * @param {string} props.selectedFile - The filename to re-analyse.
 * @param {Function} props.forceRefreshSelectedFile - Callback to refresh the selected file after re-analysis.
 * @returns {JSX.Element|null} The configuration selection UI, or null if configuration is not loaded.
 */

const ChooseConfiguration = ({ selectedFile, forceRefreshSelectedFile }) => {
  // State for error messages
  const [error, setError] = useState(null);
  // State for configuration data fetched from backend
  const [data, setData] = useState(null);
  // State for positron configuration data
  const [positronConfig, setPositronConfig] = useState(null);
  // State for antiproton configuration data
  const [antiprotonConfig, setAntiprotonConfig] = useState(null);
  // State for keys of the configuration object (for details display)
  const [dataKeys, setDataKeys] = useState([]);
  // State to toggle display of configuration details
  const [showDetails, setShowDetails] = useState(false);
  // State for displaying messages (e.g., success messages)
  const [message, setMessage] = useState(null);
  // State to open MessageAlert component
  const [openAlert, setOpenAlert] = useState(false);
    // Timestamp message
  const [timestampMessage, setTimestampMessage] = useState(null);
  // State for difference in seconds between current time and latest dump timestamp
  const [diffInSeconds, setDiffInSeconds] = useState(null);
  // latest type dump
  const [latestParticle, setLatestParticle] = useState(null);
  // Fetch configuration data from backend on mount and every 500ms
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current configuration from backend API
        const response = await fetch('/api/configuration');
        if (!response.ok) throw new Error('Error fetching configuration');
        const result = await response.json();
        // Validate the configuration data
        if (!result || Object.keys(result).length === 0) {
          throw new Error('No configuration data available');
        }
        if (!result.configData.config || (result.configData.config !== 'positrons' && result.configData.config !== 'antiprotons')) {
          throw new Error('Config has to be defined (positrons or antiprotons)');
        }
        // Set configuration data and its keys for details display
        setData(result.configData);
        setDataKeys(Object.keys(result.configData));
        // Set positron and antiproton configurations
        setPositronConfig(result.configPos);
        setAntiprotonConfig(result.configPbar);
      } catch (err) {
        setError(err);
        setData(null);
        setDataKeys([]);
      }
    };
    fetchData();
    // Poll for configuration updates every 500ms
    const interval = setInterval(fetchData, 500);
    return () => clearInterval(interval);
  }, []);

  // fetch latest dump timestamp
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const response = await fetch('/api/latest');
        if (!response.ok) throw new Error('Error fetching latest dump timestamp');
        const result = await response.json();
        // Handle the latest dump timestamp as needed
        const currentTimestamp = Date.now();
        // Split date and time
        const [datePart, timePart] = result.latest.split("_");
        const formattedTime = timePart.replace(/-/g, ":");
        // Build ISO string
        const isoString = `${datePart}T${formattedTime}`;
        const date = new Date(isoString);
        const diffInSec = Math.floor((currentTimestamp - date.getTime()) / 1000);
        if (diffInSec !== diffInSeconds) {
          setDiffInSeconds(diffInSec);
          if (result.particle) {
            setLatestParticle(result.particle);
            if (diffInSec > 0 && diffInSec <= 2) {
              setMessage(`New acquisition: ${result.latest.replace('_', ' ')} -  From ${result.particle}'s trigger`);
              setOpenAlert(true);
            }
          }
        }
        setTimestampMessage(result.latest.replace('_', ' '));
      } catch (err) {
        const errorMessage = `${err.message}
            ChooseConfiguration failed to fetch latest dump timestamp`;
        console.error('[ERROR]', errorMessage);
        setError(errorMessage);
        setDiffInSeconds(null);
        setLatestParticle(null);
        setTimestampMessage(null);
      }
    };
    // Poll for latest dump timestamp every 200 ms
    const interval = setInterval(fetchLatest, 200);
    return () => clearInterval(interval);
  }, []);

  /**
   * Handles changing the configuration or toggling the fit option.
   * Sends the updated configuration to the backend.
   * @param {string} newConfig - The new configuration type ("positrons" or "antiprotons")
   * @param {boolean} newFit - The new fit value
   */
  const handleConfigChange = async (newConfig = data.config, newFit = data.fit) => {
    setError(null);
    // Validate config type
    if (newConfig !== 'positrons' && newConfig !== 'antiprotons')
      throw new Error('Config has to be defined (positrons or antiprotons)');
    let newData = null
    // Select the appropriate default config object
    if (newConfig === 'positrons') {
      newData = positronConfig;
    } else if (newConfig === 'antiprotons') {
      newData = antiprotonConfig;
    }
    // Set the fit property
    newData.fit = newFit;
    try {
      // Send updated configuration to backend API
      const response = await fetch('/api/configuration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData),
      });
      if (!response.ok) {
        throw new Error(`Failed to update configuration: ${response.statusText}`);
      }
    }
    catch (error) {
      setError(error);
    }
  }

  /**
   * Handles the "Re-analyse" action for the selected file.
   * Sends a request to the backend to re-analyse the file.
   */
  const handleReAnalyse = async () => {
    setError(null);
    setShowDetails(false);
    try {
      setMessage("Re-analyzing the file...");
      setOpenAlert(true);
      // Call backend API to re-analyse the selected file
      const response = await fetch(`/api/reanalyse/${selectedFile}`)
      if (!response.ok) {
        throw new Error('Error re-analysing the file');
      }
      const result = await response.json();
      // Optionally handle result here
      if (result.success) {
        setMessage('Re-analysis successful');
        forceRefreshSelectedFile();
        setOpenAlert(true);
      }
    }
    catch (error) {
      setMessage(`${error.message}`);
      setOpenAlert(true);
    }
  }

  if (!data && error) return (
    <Paper elevation={3} sx={{ width: '100%', padding: 2, border: '2px solid black', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: "10px" }}>
      <Typography variant="h5">Offline Analysis Configuration</Typography>
      <Alert severity="error">{error.message}</Alert>
    </Paper>
  );

  return data && (
    <Paper elevation={3} sx={{ width: '100%', padding: 2, border: '2px solid black', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: "2px" }}>
      <MessageAlert message={message} open={openAlert} setOpen={setOpenAlert} />
      <Typography variant="h5">Offline Analysis Configuration</Typography>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
        <Button startIcon={<AddCircleOutlineIcon />} style={{ opacity: data.config !== 'positrons' ? 0.5 : 1 }} onClick={() => handleConfigChange('positrons')}>
          Positrons
        </Button>
        {/* Button to select antiprotons configuration */}
        <Button
          startIcon={<RemoveCircleOutlineIcon />}
          style={{ opacity: data.config !== 'antiprotons' ? 0.5 : 1 }}
          onClick={() => handleConfigChange('antiprotons')}
        >
          Antiprotons
        </Button>
        {/* Button to toggle fit option */}
        <Button
          startIcon={<MonitorHeartIcon />}
          style={{ opacity: data.fit ? 1 : 0.5 }}
          onClick={() => { handleConfigChange(data.config, !data.fit); }}
        >
          {data.fit ? "Fit enabled" : "Fit disabled"}
        </Button>
        {/* Button to trigger re-analysis */}
        <Button
          onClick={handleReAnalyse}
          startIcon={<PsychologyIcon />}
        >
          Re-analyse
        </Button>
        {/* Button to show/hide configuration details */}
        <Button startIcon={<InfoIcon />} onClick={() => { setShowDetails(!showDetails); }}
        >
          {showDetails ? "Hide details" : "Show details"}
        </Button>
        <a
          href="https://alphacpc05.cern.ch/elog/ALPHA/36053"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button startIcon={<AutoStoriesIcon />} >
            Go to the guide
          </Button>
        </a>
      </div>
      <ConfigTable showDetails={showDetails} data={data} dataKeys={dataKeys} />
      {/* Display timestamp message if any */}
      {timestampMessage && <Alert severity="info">{`Latest acquisition: ${timestampMessage} - From the ${latestParticle} trigger`}</Alert>}
      {!timestampMessage && <Alert severity="error">An error occurred while fetching the latest acquisition timestamp.</Alert>}
      {/* Display error message if any */}
      {error && <Alert severity="error">{error.message}</Alert>}
    </Paper>
  );
}

export default ChooseConfiguration;
import { useState, useEffect, useRef } from "react";
import Button from '@mui/material/Button';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import InfoIcon from '@mui/icons-material/Info';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import MessageAlert from "../app/MessageAlert.jsx";
import { Alert, Typography, AccordionDetails, Accordion, AccordionSummary } from "@mui/material";
import ConfigTable from "./ConfigTable.jsx";

const ChooseConfiguration = ({ selectedFile, forceRefreshSelectedFile }) => {
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [positronConfig, setPositronConfig] = useState(null);
  const [antiprotonConfig, setAntiprotonConfig] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [message, setMessage] = useState(null);
  const [timestampMessage, setTimestampMessage] = useState(null);
  const [latestParticle, setLatestParticle] = useState(null);
  const prevDiffRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/configuration');
        if (!response.ok) throw new Error('Error fetching configuration');
        const result = await response.json();
        if (!result || Object.keys(result).length === 0)
          throw new Error('No configuration data available');
        if (!result.configData.config || (result.configData.config !== 'positrons' && result.configData.config !== 'antiprotons'))
          throw new Error('Config has to be defined (positrons or antiprotons)');
        setData(result.configData);
        setPositronConfig(result.configPos);
        setAntiprotonConfig(result.configPbar);
        setError(null);
      } catch (err) {
        setError(err);
        setData(null);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const response = await fetch('/api/latest');
        if (!response.ok) throw new Error('Error fetching latest dump timestamp');
        const result = await response.json();
        const [datePart, timePart] = result.latest.split("_");
        const diffInSec = Math.floor((Date.now() - new Date(`${datePart}T${timePart.replace(/-/g, ":")}`).getTime()) / 1000);
        if (diffInSec !== prevDiffRef.current) {
          prevDiffRef.current = diffInSec;
          if (result.particle) {
            setLatestParticle(result.particle);
            if (diffInSec > 0 && diffInSec <= 2)
              setMessage(`New acquisition: ${result.latest.replace('_', ' ')} - From ${result.particle}'s trigger`);
          }
        }
        setTimestampMessage(result.latest.replace('_', ' '));
      } catch (err) {
        setTimestampMessage(null);
        setLatestParticle(null);
      }
    };
    const interval = setInterval(fetchLatest, 200);
    return () => clearInterval(interval);
  }, []);

  const handleConfigChange = async (newConfig = data.config, newFit = data.fit) => {
    setError(null);
    if (newConfig !== 'positrons' && newConfig !== 'antiprotons')
      throw new Error('Config has to be defined (positrons or antiprotons)');
    const baseConfig = newConfig === 'positrons' ? positronConfig : antiprotonConfig;
    try {
      const response = await fetch('/api/configuration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...baseConfig, fit: newFit }),
      });
      if (!response.ok) throw new Error(`Failed to update configuration: ${response.statusText}`);
    } catch (err) {
      setError(err);
    }
  };

  const handleReAnalyse = async () => {
    setError(null);
    setShowDetails(false);
    setMessage("Re-analyzing the file...");
    try {
      const response = await fetch(`/api/reanalyse/${selectedFile}`, { method: 'POST', credentials: 'include' });
      if (!response.ok) throw new Error('Error re-analysing the file');
      const result = await response.json();
      if (result.success) {
        setMessage('Re-analysis successful');
        forceRefreshSelectedFile();
      }
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <Accordion sx={{ width: '100%', paddingRight: 2, paddingLeft: 2, border: '2px solid black' }} defaultExpanded>
      <AccordionSummary expandIcon={<ArrowDownwardIcon />}>
        <Typography variant="h6">Offline Analysis Configuration</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: "2px" }}>
        {!data && error && <Alert severity="error">{error.message}</Alert>}
        {data && (
          <>
            <MessageAlert message={message} setMessage={setMessage} />
            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
              <Button
                startIcon={<AddCircleOutlineIcon />}
                style={{ opacity: data.config !== 'positrons' ? 0.5 : 1 }}
                onClick={() => handleConfigChange('positrons')}
              >
                Positrons
              </Button>
              <Button
                startIcon={<RemoveCircleOutlineIcon />}
                style={{ opacity: data.config !== 'antiprotons' ? 0.5 : 1 }}
                onClick={() => handleConfigChange('antiprotons')}
              >
                Antiprotons
              </Button>
              <Button
                startIcon={<MonitorHeartIcon />}
                style={{ opacity: data.fit ? 1 : 0.5 }}
                onClick={() => handleConfigChange(data.config, !data.fit)}
              >
                {data.fit ? "Fit enabled" : "Fit disabled"}
              </Button>
              <Button onClick={handleReAnalyse} startIcon={<PsychologyIcon />}>
                Re-analyse
              </Button>
              <Button startIcon={<InfoIcon />} onClick={() => setShowDetails(!showDetails)}>
                {showDetails ? "Hide details" : "Show details"}
              </Button>
              <a href="https://alphacpc05.cern.ch/elog/ALPHA/36053" target="_blank" rel="noopener noreferrer">
                <Button startIcon={<AutoStoriesIcon />}>Go to the guide</Button>
              </a>
            </div>
            <ConfigTable showDetails={showDetails} data={data} dataKeys={Object.keys(data)} />
            {timestampMessage
              ? <Alert severity="info">{`Latest acquisition: ${timestampMessage} - From the ${latestParticle} trigger`}</Alert>
              : <Alert severity="error">An error occurred while fetching the latest acquisition timestamp.</Alert>
            }
            {error && <Alert severity="error">{error.message ?? error}</Alert>}
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default ChooseConfiguration;

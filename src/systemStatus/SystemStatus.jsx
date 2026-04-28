/**
 * @file SystemStatus.jsx
 * @description Panel that displays the overall system status, including
 *              worker monitors (acquisition, analysis, temperature), an
 *              expert-mode toggle, a temperature dialog, and a logout button.
 *              In expert mode, provides controls to start/stop Python workers.
 * @author Samuel Niang
 */
import { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import WorkerMonitor from './WorkerMonitor.jsx';
import { Typography, Alert } from '@mui/material';
import TemperatureDisplay from './TemperatureDisplay.jsx';
import PitayaStatus from './PitayaStatus.jsx';
import Switch from '@mui/material/Switch';
import LogoutIcon from '@mui/icons-material/Logout';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import DescriptionIcon from '@mui/icons-material/Description';
import RouterIcon from '@mui/icons-material/Router';
import Button from "@mui/material/Button";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

/** List of worker processes to monitor. */
const monitors = ["acquisition", "analysis", "temperature"];

/**
 * SystemStatus – top-level status bar showing worker health, expert-mode
 * toggle, and a logout action.
 *
 * @param {Object}   props
 * @param {Function} props.handleLogout - Callback invoked when the user clicks "Log out".
 */
export default function SystemStatus({handleLogout, expertMode, setExpertMode}) {
    const [displayTemperature, setDisplayTemperature] = useState(false);
    const [scriptError, setScriptError] = useState(null);
    const [logDialog, setLogDialog] = useState({ open: false, name: '', log: '' });
    const [configData, setConfigData] = useState(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch('/api/configuration');
                if (!res.ok) return;
                const result = await res.json();
                setConfigData(result.configData);
            } catch (_) {}
        };
        fetchConfig();
        const interval = setInterval(fetchConfig, 500);
        return () => clearInterval(interval);
    }, []);

    const pitayaKeys = configData ? Object.keys(configData).filter(k => k.startsWith('red_pitaya_')).sort() : [];

    const handlePitayaToggle = async (pitayaKey) => {
        const newData = { ...configData, [pitayaKey]: !configData[pitayaKey] };
        try {
            const res = await fetch('/api/configuration', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData),
            });
            if (!res.ok) throw new Error(`Failed to update configuration: ${res.statusText}`);
        } catch (err) {
            setScriptError(err.message);
        }
    };

    /**
     * Fetches and displays the log for a given script.
     * @param {string} name - The script key (acquisition, analysis, temperature).
     */
    const handleShowLogs = async (name) => {
        try {
            const res = await fetch(`/api/logs/${name}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || `Failed to fetch logs for ${name}`);
            setLogDialog({ open: true, name, log: data.log || '(no logs available)' });
        } catch (err) {
            setScriptError(err.message);
        }
    };

    /**
     * Calls the start or stop API for a given script name.
     * @param {'start'|'stop'} action - The action to perform.
     * @param {string} name - The script key (acquisition, analysis, temperature).
     */
    const handleScript = async (action, name) => {
        setScriptError(null);
        try {
            const res = await fetch(`/api/${action}/${name}`, { method: 'POST', credentials: 'include' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || `Failed to ${action} ${name}`);
        } catch (err) {
            setScriptError(err.message);
        }
    };

    return (
        <Paper elevation={3} sx={{ width: '100%', padding: 2, border: '2px solid black', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: "10px" }}>
            {/* Header row: title + expert-mode switch */}
            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="h5">System Status</Typography>
                <Switch checked={expertMode} onChange={(e) => setExpertMode(e.target.checked)} />
                <Typography variant="body1">{expertMode ? "Expert Mode: ON" : "Expert Mode: OFF"}</Typography>
            </div>

            {/* Worker monitors row + logout button */}
            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                {monitors.map(monitor => (
                    <WorkerMonitor
                        key={monitor}
                        monitor={monitor}
                        /* Clicking the temperature monitor toggles the temperature dialog. */
                        {...(monitor === "temperature" ? { onClick: () => setDisplayTemperature(!displayTemperature) } : {})}
                    />
                ))}
            </div>

            {/* Expert mode: start/stop controls for each Python worker */}
            {expertMode && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', width: '100%', marginTop: '20px', maxWidth: '400px' }}>
                    {monitors.map(name => (
                        <div key={name} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, mr: 0.5, flex: 1 }}>{name}</Typography>
                            <Button sx={{flex: 1}} size="small" variant="contained" color="success" startIcon={<PlayArrowIcon />} onClick={() => handleScript('start', name)}>Start</Button>
                            <Button sx={{flex: 1}} size="small" variant="contained" color="error" startIcon={<StopIcon />} onClick={() => handleScript('stop', name)}>Stop</Button>
                            <Button sx={{flex: 1}} size="small" variant="outlined" startIcon={<DescriptionIcon />} onClick={() => handleShowLogs(name)}>Logs</Button>
                        </div>
                    ))}
                    {/* Acquisition card enable/disable toggles */}
                    {pitayaKeys.length > 0 && <>
                        <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>
                            Signal analysis per acquisition card
                        </Typography>
                        <Alert severity="info" sx={{ py: 0.5, fontSize: '0.75rem' }}>
                            Disabling a card only excludes it from the offline analysis. The device stays on and all data is still recorded on EOS.
                        </Alert>
                    </>}
                    {pitayaKeys.length > 0 && pitayaKeys.map((key, idx) => {
                        const channels = configData?.Mapping?.[key] || [];
                        const ch1 = channels.find(c => c[0].includes("ch1"))?.[1] || "-";
                        const ch2 = channels.find(c => c[0].includes("ch2"))?.[1] || "-";
                        const enabled = configData?.[key];
                        return (
                            <div key={key} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, mr: 0.5, flex: 1 }}>
                                    {`Pitaya ${idx + 1} (${ch1} / ${ch2})`}
                                </Typography>
                                <Button
                                    sx={{ flex: 1 }}
                                    size="small"
                                    variant="contained"
                                    color={enabled ? "success" : "error"}
                                    startIcon={<RouterIcon />}
                                    onClick={() => handlePitayaToggle(key)}
                                >
                                    {enabled ? "Enabled" : "Disabled"}
                                </Button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Red Pitaya connection status */}
            <PitayaStatus expertMode={expertMode}/>
            
            {/* Display error from start/stop actions */}
            {scriptError && <Alert severity="error" sx={{ mt: 1 }} onClose={() => setScriptError(null)}>{scriptError}</Alert>}

            {/* Logout button */}
            <Button onClick={handleLogout} startIcon={<LogoutIcon />} variant="contained">Log out</Button>

            {/* Modal dialog with live Pitaya temperature readings */}
            <TemperatureDisplay display={displayTemperature} setDisplay={setDisplayTemperature} />

            {/* Log dialog */}
            <Dialog open={logDialog.open} onClose={() => setLogDialog({ ...logDialog, open: false })} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Logs: {logDialog.name}
                    <IconButton onClick={() => setLogDialog({ ...logDialog, open: false })}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, fontSize: '0.85rem', maxHeight: '60vh', overflow: 'auto' }}>
                        {logDialog.log}
                    </pre>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleShowLogs(logDialog.name)}>Refresh</Button>
                    <Button onClick={() => setLogDialog({ ...logDialog, open: false })}>Close</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
} 

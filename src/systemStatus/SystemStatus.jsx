/**
 * @file SystemStatus.jsx
 * @description Panel that displays the overall system status, including
 *              worker monitors (acquisition, analysis, temperature), an
 *              expert-mode toggle, a temperature dialog, and a logout button.
 * @author Samuel Niang
 */

import Paper from '@mui/material/Paper';
import { useState } from 'react';
import WorkerMonitor from './WorkerMonitor.jsx';
import { Typography } from '@mui/material';
import TemperatureDisplay from './TemperatureDisplay.jsx';
import Switch from '@mui/material/Switch';
import LogoutIcon from '@mui/icons-material/Logout';
import Button from "@mui/material/Button";

/** List of worker processes to monitor. */
const monitors = ["acquisition", "analysis", "temperature"];

/**
 * SystemStatus – top-level status bar showing worker health, expert-mode
 * toggle, and a logout action.
 *
 * @param {Object}   props
 * @param {Function} props.handleLogout - Callback invoked when the user clicks "Log out".
 */
export default function SystemStatus({handleLogout}) {
    const [expertMode, setExpertMode] = useState(false);
    const [displayTemperature, setDisplayTemperature] = useState(false);

    return (
        <Paper elevation={3} sx={{ width: '100%', padding: 2, border: '2px solid black', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: "2px" }}>
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
                        pollingInterval={2000}
                        /* Clicking the temperature monitor toggles the temperature dialog. */
                        {...(monitor === "temperature" ? { onClick: () => setDisplayTemperature(!displayTemperature) } : {})}
                    />
                ))}

                <Button onClick={handleLogout} startIcon={<LogoutIcon />} variant="contained">Log out</Button>
            </div>

            {/* Modal dialog with live Pitaya temperature readings */}
            <TemperatureDisplay display={displayTemperature} setDisplay={setDisplayTemperature} />
        </Paper>
    );
} 

import Paper from '@mui/material/Paper';
import { useState } from 'react';
import WorkerMonitor from './WorkerMonitor.jsx';
import { Typography } from '@mui/material';
import TemperatureDisplay from './TemperatureDisplay.jsx';
import Switch from '@mui/material/Switch';
import LogoutIcon from '@mui/icons-material/Logout';
import Button from "@mui/material/Button";

export default function SystemStatus({handleLogout}) {
    const [expertMode, setExpertMode] = useState(false);
    const [displayTemperature, setDisplayTemperature] = useState(false);
    return (
        <Paper elevation={3} sx={{ width: '100%', padding: 2, border: '2px solid red', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: "2px" }}>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="h5">System Status</Typography>
                <Switch checked={expertMode} onChange={(e) => setExpertMode(e.target.checked)} />
                <Typography variant="body1">{expertMode ? "Expert Mode: ON" : "Expert Mode: OFF"}</Typography>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
                <WorkerMonitor monitor="acquisition" pollingInterval={5000} />
                <WorkerMonitor monitor="analysis" pollingInterval={5000} />
                <WorkerMonitor monitor="temperature" pollingInterval={5000} onClick={() => setDisplayTemperature(!displayTemperature)} />
                <Button onClick={handleLogout} startIcon={<LogoutIcon />} variant="contained">Log out</Button>
            </div>

            <TemperatureDisplay display={displayTemperature} />
        </Paper>
    );
} 

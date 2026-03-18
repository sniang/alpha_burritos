/**
 * @file PitayaStatus.jsx
 * @description Displays the connection status of all Red Pitaya devices.
 *              Polls the backend every second and shows a chip per device.
 * @author Samuel Niang
 */
import { useEffect, useState } from 'react';
import Chip from '@mui/material/Chip';
import PowerIcon from '@mui/icons-material/Power';
import PowerOffIcon from '@mui/icons-material/PowerOff';
import BlockIcon from '@mui/icons-material/Block';

const POLL_INTERVAL = 1000; // ms

export default function PitayaStatus() {
  const [pitayas, setPitayas] = useState([]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/pitaya-status');
        if (!res.ok) throw new Error('HTTP error');
        const data = await res.json();
        setPitayas(data.pitayas || []);
      } catch {
        // keep previous state on error
      }
    };

    fetchStatus();
    const id = setInterval(fetchStatus, POLL_INTERVAL);
    return () => clearInterval(id);
  }, []);

  if (pitayas.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
      {pitayas.map(({ name, status }) => {
        const color = status === 'on' ? 'success' : status === 'disabled' ? 'default' : 'error';
        const icon = status === 'on' ? <PowerIcon /> : status === 'disabled' ? <BlockIcon /> : <PowerOffIcon />;
        const label = `${name}: ${status.toUpperCase()}`;
        return <Chip key={name} color={color} icon={icon} label={label} size="small" />;
      })}
    </div>
  );
}

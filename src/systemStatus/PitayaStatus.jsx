/**
 * @file PitayaStatus.jsx
 * @description Displays the connection status of all Red Pitaya devices.
 *              Polls the backend at a regular interval and renders:
 *                - Color-coded chips for each pitaya (expert mode only).
 *                - Error alerts for every pitaya that is not ON (always visible).
 * @author Samuel Niang
 */

import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import PowerIcon from '@mui/icons-material/Power';
import PowerOffIcon from '@mui/icons-material/PowerOff';
import BlockIcon from '@mui/icons-material/Block';

/** Polling interval (ms) for fetching pitaya status from the backend. */
const POLL_INTERVAL = 1000;

/**
 * PitayaStatus Component
 *
 * Periodically queries `/api/pitaya-status` and displays the connection
 * state of each Red Pitaya board.
 *
 * @param {Object}  props
 * @param {boolean} props.expertMode - When true, detailed status chips are shown.
 * @returns {JSX.Element|null} Status chips and/or error alerts, or null while loading.
 */
export default function PitayaStatus({ expertMode }) {
  const [pitayas, setPitayas] = useState([]);

  useEffect(() => {
    /** Fetches the latest pitaya status from the backend API. */
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/pitaya-status');
        if (!res.ok) throw new Error('HTTP error');
        const data = await res.json();
        setPitayas(data.pitayas || []);
      } catch {
        // Keep previous state on network or server errors
      }
    };

    // Initial fetch, then poll at the configured interval
    fetchStatus();
    const id = setInterval(fetchStatus, POLL_INTERVAL);

    // Cleanup: stop polling when the component unmounts
    return () => clearInterval(id);
  }, []);

  // Nothing to render until the first successful fetch
  if (pitayas.length === 0) return null;

  // Pitayas whose status is anything other than "on"
  const problemPitayas = pitayas.filter(({ status }) => status !== 'on' && status !== 'disabled');

  return (
    <>
      {/* Expert mode: one chip per pitaya with color-coded connection state */}
      {expertMode && (
        <>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Network connection per acquisition card
          </Typography>
          <Alert severity="info" sx={{ py: 0.5, fontSize: '0.75rem', maxWidth: '400px' }}>
            These chips indicate whether each Red Pitaya is reachable on the network.
          </Alert>
        </>
      )}
      {expertMode && (
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '8px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '400px',
        }}>
          {pitayas.map(({ name, status }) => {
            const color = status === 'on'
              ? 'success'
              : status === 'disabled'
                ? 'default'
                : 'error';

            const icon = status === 'on'
              ? <PowerIcon />
              : status === 'disabled'
                ? <BlockIcon />
                : <PowerOffIcon />;

            return (
              <Chip
                key={name}
                color={color}
                icon={icon}
                label={`${name}: ${status.toUpperCase()}`}
                size="small"
              />
            );
          })}
        </div>
      )}

      {/* Always visible: error alert for every pitaya that is not ON */}
      {problemPitayas.length > 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          width: '100%',
          maxWidth: '500px',
          margin: '10px auto',
        }}>
          {problemPitayas.map(({ name, status }) => (
            <Alert key={name} severity="error">
              {name} is {status.toUpperCase()} — Stop all scripts immediately.
            </Alert>
          ))}
        </div>
      )}
    </>
  );
}

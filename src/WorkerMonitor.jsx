
/**
 * @file WorkerMonitor.jsx
 * @description React component that monitors the status of a Python worker process.
 *              Displays a visual indicator (chip) showing whether the worker is running or stopped.
 * @author Samuel Niang
 */

import { useEffect, useState } from "react";
import Chip from '@mui/material/Chip';
import HeartBrokenSharpIcon from '@mui/icons-material/HeartBrokenSharp';
import DeviceHubSharpIcon from '@mui/icons-material/DeviceHubSharp';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';

/**
 * WorkerMonitor Component
 *
 * Polls the backend API at regular intervals to check the status of a specified
 * Python worker process. Renders a Material-UI Chip that visually indicates
 * whether the worker is running (green) or stopped/error (red).
 *
 * @param {Object} props - Component props
 * @param {string} props.monitor - The name/identifier of the worker pidfile to monitor
 * @returns {JSX.Element} A Chip component displaying the worker status
 */
function WorkerMonitor({ monitor }) {
  // Track the current worker status: "unknown", "running", "stopped", or "error"
  const [status, setStatus] = useState("unknown");

  useEffect(() => {
    /**
     * Set up a polling interval to check the worker status every second.
     * Fetches the status from the backend API and updates the component state.
     */
    const intervalId = setInterval(async () => {
      try {
        const res = await fetch(`/api/status/${monitor}`);
        if (!res.ok) throw new Error("HTTP error");
        const data = await res.json();
        setStatus(data.worker);
      } catch (e) {
        // If the API call fails, set status to "error"
        setStatus("error");
      }
    }, 1000);

    // Cleanup: clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [monitor]);

  // Render a success chip if the worker is running, otherwise render an error chip
  if (status === "running") {
    return (
      <Chip
        color="success"
        icon={monitor === "temperature" ? <DeviceThermostatIcon /> : <DeviceHubSharpIcon />}
        label={`${monitor}: ${status}`}
      />
    );
  } else {
    return (
      <Chip
        color="error"
        icon={<HeartBrokenSharpIcon />}
        label={`${monitor}: ${status}`}
      />
    );
  }
}

export default WorkerMonitor;
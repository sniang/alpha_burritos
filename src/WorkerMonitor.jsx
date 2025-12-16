
import { useEffect, useState } from "react";
import Chip from '@mui/material/Chip';
import HeartBrokenSharpIcon from '@mui/icons-material/HeartBrokenSharp';
import DeviceHubSharpIcon from '@mui/icons-material/DeviceHubSharp';

function WorkerMonitor({monitor}) {
  const [status, setStatus] = useState("unknown");

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const res = await fetch(`/api/status/${monitor}`);
        if (!res.ok) throw new Error("HTTP error");
        const data = await res.json();
        setStatus(data.worker);
      } catch (e) {
        setStatus("error");
      }
    }, 1000); 

    return () => clearInterval(intervalId);
  }, []);
    if (status === "running") {
    return <Chip color="success" icon={<DeviceHubSharpIcon />} label={`Python ${monitor}: ${status}`} />;
  } else {
    return <Chip color="error" icon={<HeartBrokenSharpIcon />} label={`Python ${monitor}: ${status}`} />;
  }
}

export default WorkerMonitor;
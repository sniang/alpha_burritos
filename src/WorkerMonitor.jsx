
import { useEffect, useState } from "react";
import Chip from '@mui/material/Chip';

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
    return <Chip color="success" label={`Python ${monitor}: ${status}`} />;
  } else {
    return <Chip color="error" label={`Python ${monitor}: ${status}`} />;
  }
}

export default WorkerMonitor;
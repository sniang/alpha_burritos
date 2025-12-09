
import { useEffect, useState } from "react";

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


    return <span style={{color: (status === "running" ? "green" : "red")}}>Python {monitor}: {status}</span>;
}

export default WorkerMonitor;
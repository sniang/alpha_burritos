
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
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (status === "stopped" || status === "error") {
      alert("Python worker " + monitor + " is " + status);
    }
  }, [status]);

  return <div>Python {monitor}: {status}</div>;
}

export default WorkerMonitor;
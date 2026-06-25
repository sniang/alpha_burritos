/**
 * PlotRanges Component
 * Allows users to configure custom x (time) and y (voltage) axis ranges for plots.
 * Sends the configured ranges to the server via a POST request.
 *
 * @author Samuel Niang
 */

import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import { useEffect, useState } from 'react';

const PlotRanges = () => {
  // State holding the current range settings and whether each axis range is enabled
  const [ranges, setRanges] = useState({ x: false, y: false, xmin: 0, xmax: 120, ymin: 0, ymax: 250 });
  // State holding the last error message, if any
  const [error, setError] = useState(null);

  // Posts the given plot ranges to the server
  const sendPlotRanges = async (newRanges) => {
    try {
      const response = await fetch('/api/plot-ranges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRanges),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Fetches the current plot ranges from the server and updates the state
  const getPlotRanges = async () => {
    try {
      const response = await fetch('/api/plot-ranges');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setRanges(data);
    } catch (error) {
      setError(error.message);
    }
  };

  // On mount: send the default ranges to the server and start polling every 200ms
  useEffect(() => {
    sendPlotRanges(ranges);
    const interval = setInterval(getPlotRanges, 200);
    return () => clearInterval(interval);
  }, []);

  // Updates the ranges state and immediately syncs the new value to the server
  const handleChangeRanges = (newRanges) => {
    setRanges(newRanges);
    sendPlotRanges(newRanges);
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center', alignItems: 'center', marginTop: '20px', marginBottom: '20px' }}>
      <Typography variant="h6" gutterBottom>Plot Ranges</Typography>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, auto)', gap: '15px', justifyContent: 'center', alignItems: 'center' }}>
        {/* Time (X-axis) range controls */}
        <Typography variant="subtitle1" gutterBottom>Time</Typography>
        <Switch checked={ranges.x} onChange={(e) => handleChangeRanges({ ...ranges, x: e.target.checked })} />
        <TextField
          label="x min [µs]"
          type="number"
          value={ranges.xmin}
          onChange={e => handleChangeRanges({ ...ranges, xmin: Number(e.target.value) })}
          disabled={!ranges.x}
          sx={{ width: '100px' }}
          size="small"
        />
        <TextField
          label="x max [µs]"
          type="number"
          value={ranges.xmax}
          onChange={e => handleChangeRanges({ ...ranges, xmax: Number(e.target.value) })}
          disabled={!ranges.x}
          sx={{ width: '100px' }}
          size="small"
        />

        {/* Voltage (Y-axis) range controls */}
        <Typography variant="subtitle1" gutterBottom>Voltage</Typography>
        <Switch checked={ranges.y} onChange={(e) => handleChangeRanges({ ...ranges, y: e.target.checked })} />
        <TextField
          label="y min [mV]"
          type="number"
          value={ranges.ymin}
          onChange={e => handleChangeRanges({ ...ranges, ymin: Number(e.target.value) })}
          disabled={!ranges.y}
          sx={{ width: '100px' }}
          size="small"
        />
        <TextField
          label="y max [mV]"
          type="number"
          value={ranges.ymax}
          onChange={e => handleChangeRanges({ ...ranges, ymax: Number(e.target.value) })}
          disabled={!ranges.y}
          sx={{ width: '100px' }}
          size="small"
        />

      </div>
    </div>
  );
};

export default PlotRanges;
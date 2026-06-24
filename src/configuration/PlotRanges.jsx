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

  // Posts the current plot ranges to the server
  const sendPlotRanges = async () => {
    try {
      const response = await fetch('/api/plot-ranges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ranges),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error posting plot ranges:', error);
    }
  };

  // Send default plot ranges to the server on initial mount
  useEffect(() => {
    sendPlotRanges();
  }, []);

  // Post the plot ranges to the server whenever they change (only if a range is enabled)
  useEffect(() => () => {
    if (ranges.x || ranges.y) {
      sendPlotRanges();
    }
  }, [ranges]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center', alignItems: 'center', marginTop: '20px', marginBottom: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, auto)', gap: '15px', justifyContent: 'center', alignItems: 'center' }}>

        {/* Time (X-axis) range controls */}
        <Typography variant="subtitle1" gutterBottom>Time</Typography>
        <Switch checked={ranges.x} onChange={(e) => setRanges({ ...ranges, x: e.target.checked })} />
        <TextField
          label="x min [µs]"
          type="number"
          value={ranges.xmin}
          onChange={e => setRanges({ ...ranges, xmin: Number(e.target.value) })}
          disabled={!ranges.x}
          sx={{ width: '100px' }}
          size="small"
        />
        <TextField
          label="x max [µs]"
          type="number"
          value={ranges.xmax}
          onChange={e => setRanges({ ...ranges, xmax: Number(e.target.value) })}
          disabled={!ranges.x}
          sx={{ width: '100px' }}
          size="small"
        />

        {/* Voltage (Y-axis) range controls */}
        <Typography variant="subtitle1" gutterBottom>Voltage</Typography>
        <Switch checked={ranges.y} onChange={(e) => setRanges({ ...ranges, y: e.target.checked })} />
        <TextField
          label="y min [mV]"
          type="number"
          value={ranges.ymin}
          onChange={e => setRanges({ ...ranges, ymin: Number(e.target.value) })}
          disabled={!ranges.y}
          sx={{ width: '100px' }}
          size="small"
        />
        <TextField
          label="y max [mV]"
          type="number"
          value={ranges.ymax}
          onChange={e => setRanges({ ...ranges, ymax: Number(e.target.value) })}
          disabled={!ranges.y}
          sx={{ width: '100px' }}
          size="small"
        />

      </div>
    </div>
  );
};

export default PlotRanges;
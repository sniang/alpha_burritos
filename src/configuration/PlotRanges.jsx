import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { useEffect, useState } from 'react';

const PlotRanges = () => {
  const [ranges, setRanges] = useState({x: false, y: false, xmin: 0, xmax: 100, ymin: 0, ymax: 100});

  useEffect(() => async () => {
    // post the plot ranges to the server whenever they change
    const sendPlotRanges = async () => {
      try {
        const response = await fetch('/api/plot-ranges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ranges)
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error posting plot ranges:', error);
      }
    };
    if (ranges.x || ranges.y) {
      sendPlotRanges();
    }
  }, [ranges]);

      return (
    <FormGroup>
      <FormControlLabel control={<Switch defaultChecked />} label="x range" />
      <FormControlLabel control={<Switch defaultChecked />} label="y range" />
    </FormGroup>
  );
};

export default PlotRanges;
import TimeStampSelector from '../dataSelection/TimeStampSelector.jsx'
import DetectorSelector from '../dataSelection/DetectorSelector.jsx'
import DateSelector from '../dataSelection/DateSelector.jsx'
import AutoRefresh from '../dataSelection/AutoRefresh.jsx'
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import Accordion from '@mui/joy/Accordion';
import AccordionDetails from '@mui/joy/AccordionDetails';
import AccordionSummary from '@mui/joy/AccordionSummary';

const DataSelection = ({ selectedFile, updateState, year, month, day, jsonFiles, detectorList, selectedDetector }) => {
    const [error, setError] = useState(null);
    
    return (
      <Accordion defaultExpanded>
        <AccordionSummary><Typography variant="h5">Data Selection</Typography></AccordionSummary>
        <AccordionDetails>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: "20px", flexWrap: "wrap", padding: "10px", width: "100%" }}>
                  {/* AutoRefresh: Handles periodic refresh of file list */}
        <AutoRefresh
          selectedFile={selectedFile}
          year={year}
          month={month}
          day={day}
          setJsonFiles={(value) => updateState('jsonFiles', value)}
          setSelectedFile={(value) => updateState('selectedFile', value)}
          setError={setError}
        />
        {/* DateSelector: Allows user to pick year, month and day */}
        <DateSelector
          year={year}
          month={month}
          day={day}
          setYear={(value) => updateState('year', value)}
          setMonth={(value) => updateState('month', value)}
          setDay={(value) => updateState('day', value)}
        />
        {/* TimeStampSelector: Lets user pick a file (timestamp) */}
        <TimeStampSelector
          year={year}
          month={month}
          day={day}
          jsonFiles={jsonFiles}
          setJsonFiles={(value) => updateState('jsonFiles', value)}
          selectedFile={selectedFile}
          setSelectedFile={(value) => updateState('selectedFile', value)}
          error={error}
          setError={setError}
        />
        {/* DetectorSelector: Lets user pick a detector from the list */}
        <DetectorSelector
          selectedDetector={selectedDetector}
          setSelectedDetector={(value) => updateState('selectedDetector', value)}
          detectorList={detectorList}
        />
        </div>
        {/* Show error alert if there's an error fetching files */}
        {error && (
          <Alert severity="error">
            {error.message || 'An error occurred while fetching files'}
          </Alert>
        )}
        </AccordionDetails>
      </Accordion>
    );
  };

export default DataSelection;
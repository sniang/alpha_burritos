import Parameters from '../dataDisplay/Parameters.jsx'
import DetectorImageAll from '../dataDisplay/DetectorImageAll.jsx'
import DetectorImage from '../dataDisplay/DetectorImage.jsx'
import Skimmer from './Skimmer.jsx'
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';

/**
 * DataDisplay component renders the detector data visualization section.
 * Includes parameter controls, individual detector image, all detector images,
 * and a skimmer for browsing files and detectors.
 * Only renders when a file is selected.
 *
 * @component
 * @author Samuel Niang
 * @param {Object} props - Component props.
 * @param {string} props.selectedFile - Currently selected JSON data file.
 * @param {Array} props.detectorList - List of available detectors for the selected file.
 * @param {string} props.selectedDetector - Currently selected detector.
 * @param {number} props.fileVersion - Version counter used as cache buster for images.
 * @param {Array} props.jsonFiles - Array of available JSON data files.
 * @param {Function} props.updateState - Function to update a single property in the global state.
 * @returns {JSX.Element|null} The data display UI, or null if no file is selected.
 */
const DataDisplay = ({ selectedFile, detectorList, selectedDetector, fileVersion, jsonFiles, updateState }) => {
  if (!selectedFile) return (
    <Paper
      elevation={3}
      sx={{
        width: '100%',
        padding: 2,
        border: '2px solid black',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Alert sx={{ width: '200px' }} severity="warning">
        No data to display
      </Alert>
    </Paper>
  );

  return (
    <>
      {/* Paper container: switches to column layout on small screens (<900px>) */}
      <Paper
        elevation={3}
        sx={{
          width: '100%',
          padding: 2,
          border: '2px solid black',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: 'stretch',
          gap: "10px",
          flexWrap: 'wrap',
          overflow: 'hidden',
          '@media (max-width: 900px)': { flexDirection: 'column' },
        }}
      >
        {/* Parameters: Controls for detector selection and parameter adjustment */}
        <Parameters
          selectedFile={selectedFile}
          detectorList={detectorList}
          setDetectorList={(value) => updateState('detectorList', value)}
          setSelectedDetector={(value) => updateState('selectedDetector', value)}
          selectedDetector={selectedDetector}
          fileVersion={fileVersion}
        />
        {/* Show image for selected detector if one is chosen */}
        {selectedDetector && (
          <DetectorImage
            selectedFile={selectedFile}
            selectedDetector={selectedDetector}
            detectorList={detectorList}
            fileVersion={fileVersion}
          />
        )}
      </Paper>

      {/* Show all detector images for the selected file */}
      <DetectorImageAll selectedFile={selectedFile} fileVersion={fileVersion} />

      {/* Skimmer: Allows browsing through files and detectors */}
      <Skimmer
        jsonFiles={jsonFiles}
        selectedDetector={selectedDetector}
        setSelectedDetector={(value) => updateState('selectedDetector', value)}
        detectorList={detectorList}
      />
    </>
  );
};

export default DataDisplay;
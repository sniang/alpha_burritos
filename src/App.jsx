import { useState } from 'react'
import './CSS/App.css'
import TimeStampSelector from './TimeStampSelector.jsx'
import Parameters from './Parameters.jsx'
import DetectorImageAll from './DetectorImageAll.jsx'
import DetectorSelector from './DetectorSelector.jsx'
import DetectorImage from './DetectorImage.jsx'
import YearMonthSelector from './YearMonthSelector.jsx'
import MainTitle from './MainTitle.jsx'
import AutoRefresh from './AutoRefresh.jsx'
import Comment from './Comment.jsx'

/**
 * Root component of the application that orchestrates detector visualization and data management.
 * Manages the global state including file selection, detector options, and temporal navigation.
 * Coordinates interactions between child components through centralized state management.
 * 
 * @component
 * @author Samuel Niang
 * @returns {JSX.Element} The root application interface with navigation controls and visualization components
 * 
 * @state {Object} state - Application's global state object
 * @state {string[]} state.jsonFiles - List of available JSON data files for selection
 * @state {string} state.selectedFile - Currently selected data file path/identifier
 * @state {string} state.selectedDetector - Currently active detector identifier (default: 'PDS')
 * @state {Error|null} state.error - Error state for application-wide error handling
 * @state {number} state.year - Currently selected year for temporal data filtering
 * @state {number} state.month - Currently selected month (1-12) for temporal data filtering
 * @state {Array} state.detectorList - List of available detectors from the current dataset
 */

function App() {
  // Initialize application state with default values
  const [state, setState] = useState({
    jsonFiles: [],
    selectedFile: '',
    selectedDetector: 'PDS',
    error: null,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    detectorList: []
  });

  const { jsonFiles, selectedFile, selectedDetector, error, year, month, detectorList } = state;

  // Display error message if application encounters an error
  if (error) {
    return (
      <>
        <MainTitle />
        <p className="error">Something went wrong: {error.message}</p>
      </>
    )
  }

  /**
   * Updates a specific property in the application state while preserving other values
   * Uses functional state update pattern to ensure state immutability
   * 
   * @param {string} key - The state property key to update
   * @param {any} value - The new value to assign to the specified property
   */
  const updateState = (key, value) => {
    setState(prevState => ({ ...prevState, [key]: value }));
  };

  /**
   * Conditionally renders detector visualization components
   * Only displays visualization when a data file is selected
   * Groups related detector visualization components
   * 
   * @returns {JSX.Element|null} Detector visualization components or null if no file selected
   */
  const renderDetectorComponents = () => {
    if (!selectedFile) return null;

    return (
      <>
        <div id='detector-block'>
          <Parameters
            selectedFile={selectedFile}
            detectorList={detectorList}
            setDetectorList={(value) => updateState('detectorList', value)}
          />
          {selectedDetector && <DetectorImage selectedFile={selectedFile} selectedDetector={selectedDetector} />}
        </div>
        {selectedFile && <Comment selectedFile={selectedFile} />}
        <DetectorImageAll selectedFile={selectedFile} />
      </>
    );
  };


  /**
   * Renders the control and selection components for the application
   * Organizes year/month selectors, timestamp selector, auto-refresh, and detector selector
   * Conditionally renders detector selector only when a file is selected
   * 
   * @returns {JSX.Element} A container with all selection and control components
   */
  const renderSelectorComponents = () => {
    return (
      <div id='selects-block'>
        <AutoRefresh
          year={year}
          month={month}
          setJsonFiles={(value) => updateState('jsonFiles', value)}
          setSelectedFile={(value) => updateState('selectedFile', value)}
          setError={(value) => updateState('error', value)}
        />
        <YearMonthSelector
          year={year}
          month={month}
          setYear={(value) => updateState('year', value)}
          setMonth={(value) => updateState('month', value)}
        />
        <TimeStampSelector
          year={year}
          month={month}
          jsonFiles={jsonFiles}
          setJsonFiles={(value) => updateState('jsonFiles', value)}
          selectedFile={selectedFile}
          setSelectedFile={(value) => updateState('selectedFile', value)}
          error={error}
          setError={(value) => updateState('error', value)}
        />
        {selectedFile && <DetectorSelector
          selectedDetector={selectedDetector}
          setSelectedDetector={(value) => updateState('selectedDetector', value)}
          detectorList={detectorList}
        />}
      </div>
    );
  }

  return (
    <>
      <MainTitle />
      {renderSelectorComponents()}
      {renderDetectorComponents()}
    </>
  )
}

export default App

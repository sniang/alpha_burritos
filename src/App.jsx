import { useState } from 'react'
import './CSS/App.css'
import TimeStampSelector from './TimeStampSelector.jsx'
import Parameters from './Parameters.jsx'
import DetectorImageAll from './DetectorImageAll.jsx'
import DetectorSelector from './DetectorSelector.jsx'
import DetectorImage from './DetectorImage.jsx'
import YearMonthSelector from './YearMonthSelector.jsx'
import MainTitle from './MainTitle.jsx'

/**
 * Root component of the application that orchestrates detector visualization and data management.
 * Handles state management for file selection, detector selection, and temporal navigation.
 * 
 * @component
 * @author Samuel Niang
 * @returns {JSX.Element} The root application interface
 * 
 * @state {Object} state - Application's global state
 * @state {string[]} state.jsonFiles - Available JSON data files
 * @state {string} state.selectedFile - Currently active data file
 * @state {string} state.selectedDetector - Active detector identifier (default: 'PDS')
 * @state {Error|null} state.error - Error state for application-wide error handling
 * @state {number} state.year - Selected year for data filtering
 * @state {number} state.month - Selected month for data filtering (1-12)
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
  });

  const { jsonFiles, selectedFile, selectedDetector, error, year, month } = state;

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
   * Updates a specific state property while maintaining state immutability
   * @param {string} key - State property identifier
   * @param {any} value - New value to be assigned
   */
  const updateState = (key, value) => {
    setState(prevState => ({ ...prevState, [key]: value }));
  };

  /**
   * Conditionally renders detector visualization components
   * Only displays when a file is selected
   * @returns {JSX.Element|null} Detector visualization components or null
   */
  const renderDetectorComponents = () => {
    if (!selectedFile) return null;

    return (
      <>
        <div id='detector-block'>
          <Parameters selectedFile={selectedFile} />
          {selectedDetector && <DetectorImage selectedFile={selectedFile} selectedDetector={selectedDetector} />}
        </div>
        <DetectorImageAll selectedFile={selectedFile} />
      </>
    );
  };

  return (
    <>
      <MainTitle />
      <div id='selects-block'>
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
        />}
      </div>
      {renderDetectorComponents()}
    </>
  )
}

export default App

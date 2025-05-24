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
 * Main application component that manages the state and rendering of detector-related components.
 * 
 * @component
 * @author Samuel Niang
 * @returns {JSX.Element} The rendered App component
 * 
 * @state {Object} state - The component's state object
 * @state {Array} state.jsonFiles - List of available JSON files
 * @state {string} state.selectedFile - Currently selected file
 * @state {string} state.selectedDetector - Currently selected detector (defaults to 'PDS')
 * @state {Error|null} state.error - Error object if any error occurs
 * @state {number} state.year - Current year
 * @state {number} state.month - Current month (1-12)
 */

function App() {
  // Initialize state with default values
  const [state, setState] = useState({
    jsonFiles: [],
    selectedFile: '',
    selectedDetector: 'PDS',
    error: null,
    year: new Date().getFullYear(), // Current year
    month: new Date().getMonth() + 1 // Current month (1-12)
  });

  // Destructure state for easier access
  const { jsonFiles, selectedFile, selectedDetector, error, year, month } = state;

  // Error handling - display error message if something goes wrong
  if (error) {
    return (
      <>
        <MainTitle />
        <p className="error">Something went wrong: {error.message}</p>
      </>
    )
  }

  /**
   * Updates a single state property while preserving other state values
   * @param {string} key - The state property to update
   * @param {any} value - The new value for the property
   */
  const updateState = (key, value) => {
    setState(prevState => ({ ...prevState, [key]: value }));
  };

  /**
   * Renders detector-related components when a file is selected
   * @returns {JSX.Element|null} Detector components or null if no file is selected
   */
  const renderDetectorComponents = () => {
    if (!selectedFile) return null;
    
    return (
      <>
        <Parameters selectedFile={selectedFile} />
        <DetectorImageAll selectedFile={selectedFile} />
        <DetectorSelector 
          selectedDetector={selectedDetector} 
          setSelectedDetector={(value) => updateState('selectedDetector', value)} 
        />
        {selectedDetector && <DetectorImage selectedFile={selectedFile} selectedDetector={selectedDetector} />}
      </>
    );
  };

  // Main component render
  return (
    <>
      <MainTitle />
      {/* Year and month selection controls */}
      <div className='selects-block'>
      <YearMonthSelector
        year={year}
        month={month}
        setYear={(value) => updateState('year', value)}
        setMonth={(value) => updateState('month', value)}
      />
      {/* File selection and timestamp controls */}
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
      </div>
      {/* Render detector components when a file is selected */}
      {renderDetectorComponents()}
    </>
  )
}

export default App

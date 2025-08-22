import { useState, useEffect } from 'react'
import './CSS/App.css'
import TimeStampSelector, { getDateFromFileName } from './TimeStampSelector.jsx'
import Parameters from './Parameters.jsx'
import DetectorImageAll from './DetectorImageAll.jsx'
import DetectorSelector from './DetectorSelector.jsx'
import DetectorImage from './DetectorImage.jsx'
import DateSelector from './DateSelector.jsx'
import MainTitle from './MainTitle.jsx'
import AutoRefresh from './AutoRefresh.jsx'
import Comment from './Comment.jsx'
import Skimmer from './Skimmer.jsx'
import LoginForm from './LoginForm.jsx'
import ChooseConfiguration from './ChooseConfiguration.jsx'

/**
 * Root component of the application that orchestrates detector visualization and data management.
 * Manages the global state including file selection, detector options, and temporal navigation.
 * Coordinates interactions between child components through centralized state management.
 * 
 * @component
 * @author Samuel Niang
 * State:
 * - jsonFiles: Array of available JSON data files
 * - selectedFile: Currently selected data file
 * - selectedDetector: Currently selected detector
 * - error: Error object for global error handling
 * - year: Selected year for filtering data
 * - month: Selected month for filtering data
 * - day: Selected day for filtering data
 * - detectorList: List of detectors available in the selected file
 * - isLoggedIn: Boolean indicating authentication status
 * - fileVersion: Version counter for selectedFile (for image refresh)
 *
 * @returns {JSX.Element} The main application UI
 **/
function App() {
  // Global state for the application, all major UI state is centralized here
  const [state, setState] = useState({
    jsonFiles: [],           // List of available JSON files for selection
    selectedFile: '',        // Currently selected JSON file
    selectedDetector: '',    // Currently selected detector
    error: null,             // Error object for error handling
    year: new Date().getFullYear(), // Default to current year
    month: new Date().getMonth() + 1, // Default to current month (1-based)
    day: new Date().getDate(), // Default to current day
    detectorList: [],        // List of detectors in the selected file
    isLoggedIn: false,       // Authentication status
    fileVersion: 0,          // Version counter for selectedFile (for image refresh)
  });

  // Destructure state for easier access in render
  const { jsonFiles, selectedFile, selectedDetector, error, year, month, day, detectorList, isLoggedIn, fileVersion } = state;

  /**
   * Helper to update a single property in the state object.
   * This keeps state updates concise and consistent.
   * @param {string} key - State property to update
   * @param {any} value - New value for the property
   * @returns {void}
   */
  const updateState = (key, value) => {
    setState(prevState => ({ ...prevState, [key]: value }));
  };

  // Special setter to force refresh of selectedFile (increments fileVersion)
  const forceRefreshSelectedFile = () => {
    setState(prevState => ({
      ...prevState,
      fileVersion: prevState.fileVersion + 1
    }));
  };

  // On mount, check if the user is authenticated by calling the profile API.
  // If not authenticated, set isLoggedIn to false.
  // @returns {void}
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch('/api/profile', { credentials: 'include' });
        if (!res.ok) throw new Error('Not authenticated');
        await res.json();
        updateState('isLoggedIn', true);
      } catch (error) {
        updateState('isLoggedIn', false);
      }
    };
    checkLogin();
  }, []);

  // Handle logout by calling the logout API and clearing the state.
  // This will also clear the authentication cookie.
  const handleLogout = async () => {
    try {
      const res = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include' // This sends the cookie!
      });
      if (!res.ok) throw new Error('Logout failed');
      updateState('isLoggedIn', false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Show login form if not authenticated.
  // MainTitle is always shown for branding/context.
  // @returns {JSX.Element|null}
  if (!isLoggedIn) {
    return <>
      <MainTitle />
      <LoginForm onLogin={() => window.location.reload()} />
    </>;
  }

  // Show error message if an error occurred anywhere in the app.
  // This is a global error boundary for the main UI.
  // @returns {JSX.Element|null}
  if (error) {
    return (
      <>
        <MainTitle />
        <p className="error">Something went wrong: {error.message}</p>
      </>
    )
  }

  /**
   * Renders detector-related components if a file is selected.
   * Includes parameter controls, detector images, comments, and skimmer.
   * Only shown after a file is chosen.
   * @returns {JSX.Element|null} The detector-related UI or null if no file selected
   */
  const renderDetectorComponents = () => {
    if (!selectedFile) return null; // Don't render if no file is selected

    return (
      <>
        <div id='detector-block'>
          {/* Parameters: Controls for detector selection and parameter adjustment */}
          <Parameters
            selectedFile={selectedFile}
            detectorList={detectorList}
            setDetectorList={(value) => updateState('detectorList', value)}
            setSelectedDetector={(value) => updateState('selectedDetector', value)}
            fileVersion={fileVersion}
          />
          {/* Show image for selected detector if one is chosen */}
          {selectedDetector && <DetectorImage selectedFile={selectedFile} selectedDetector={selectedDetector} detectorList={detectorList} fileVersion={fileVersion} />}
          {/* Comment section for the selected file */}
          <Comment selectedFile={selectedFile} />
        </div>
        {/* Show all detector images for the selected file */}
        <DetectorImageAll selectedFile={selectedFile} fileVersion={fileVersion} />
        {/* Skimmer: Allows browsing through files and detectors */}
        {/* <Skimmer
          jsonFiles={jsonFiles}
          selectedDetector={selectedDetector}
          setSelectedDetector={(value) => updateState('selectedDetector', value)}
          detectorList={detectorList}
        /> */}
      </>
    );
  };

  /**
   * Renders the controls for selecting year, month, timestamp, and detector.
   * Also includes auto-refresh functionality.
   * These controls are always visible when logged in.
   * @returns {JSX.Element} The selector controls UI
   */
  const renderSelectorComponents = () => {
    return (
      <div id="selects-block">
        {/* AutoRefresh: Handles periodic refresh of file list */}
        <AutoRefresh
          selectedFile={selectedFile}
          year={year}
          month={month}
          day={day}
          setJsonFiles={(value) => updateState('jsonFiles', value)}
          setSelectedFile={(value) => updateState('selectedFile', value)}
          setError={(value) => updateState('error', value)}
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
          setError={(value) => updateState('error', value)}
        />
        {/* DetectorSelector: Lets user pick a detector from the list */}
        <DetectorSelector
          selectedDetector={selectedDetector}
          setSelectedDetector={(value) => updateState('selectedDetector', value)}
          detectorList={detectorList}
        />
      </div>
    );
  }

  // Main render: Show title, selectors, and detector components (if file selected)
  // @returns {JSX.Element} The main application UI
  return (
    <>
      <MainTitle />
      <button onClick={handleLogout}>Log out</button>
      {renderSelectorComponents()}
      <ChooseConfiguration
        selectedFile={selectedFile}
        forceRefreshSelectedFile={forceRefreshSelectedFile}
      />
      {renderDetectorComponents()}
    </>
  )
}

export default App

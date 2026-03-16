import { useState, useEffect } from 'react'
import TimeStampSelector from '../dataSelection/TimeStampSelector.jsx'
import DetectorSelector from '../dataSelection/DetectorSelector.jsx'
import DateSelector from '../dataSelection/DateSelector.jsx'
import MainTitle from './MainTitle.jsx'
import AutoRefresh from '../dataSelection/AutoRefresh.jsx'
import LoginForm from './LoginForm.jsx'
import ChooseConfiguration from '../configuration/ChooseConfiguration.jsx'
import SystemStatus from '../systemStatus/SystemStatus.jsx'
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import DataDisplay from '../dataDisplay/DataDisplay.jsx'

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
  if (!isLoggedIn && !error) {
    return <>
      <MainTitle />
      <LoginForm onLogin={() => window.location.reload()} />
    </>;
  }

  // Show error message if an error occurred anywhere in the app.
  // This is a global error boundary for the main UI.
  // @returns {JSX.Element|null}
  if (error) {
    const errorMessage = String(error.message || error);
    return (
      <>
        <MainTitle />
        <div className="blocks">
          {errorMessage.split('\n').map((line, index) => (
            <span key={index}>
              {line}
              <br />
            </span>
          ))}
          {error.bashCode && <strong>What you can try to fix this</strong>}
          {error.bashCode && <pre className="bash-viewer">{error.bashCode}</pre>}
        </div>
      </>
    )
  }

  /**
   * Renders the controls for selecting year, month, timestamp, and detector.
   * Also includes auto-refresh functionality.
   * These controls are always visible when logged in.
   * @returns {JSX.Element} The selector controls UI
   */
  const renderSelectorComponents = () => {
    return (
    <Paper elevation={3} sx={{ width: '100%', padding: 2, border: '2px solid black', display: 'flex', flexDirection: 'column', gap: "10px", justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="h5" sx={{ mb: 1 }}>Data selection</Typography>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: "20px", flexWrap: "wrap" }}>
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
      </Paper>
    );
  }

  // Main render: Show title, selectors, and detector components (if file selected)
  // @returns {JSX.Element} The main application UI
  return (
    <>
      <MainTitle />
      <SystemStatus handleLogout={handleLogout} />
      {renderSelectorComponents()}
      <ChooseConfiguration
        selectedFile={selectedFile}
        forceRefreshSelectedFile={forceRefreshSelectedFile}
      />
      <DataDisplay
        selectedFile={selectedFile}
        detectorList={detectorList}
        selectedDetector={selectedDetector}
        fileVersion={fileVersion}
        jsonFiles={jsonFiles}
        updateState={updateState}
      />
    </>
  )
}

export default App

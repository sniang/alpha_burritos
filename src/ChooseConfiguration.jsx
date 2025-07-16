import React, { use } from "react";
import { useState, useEffect } from "react";
import './CSS/ChooseConfiguration.css';
import positronConfig from './assets/default_config_positrons.json';
import antiprotonConfig from './assets/default_config_antiprotons.json';

/**
 * ChooseConfiguration component provides UI controls for selecting the analysis configuration
 * ("positrons" or "antiprotons") and toggling the "fit" option. It fetches the current configuration
 * from the backend, allows users to update it, and displays configuration details. Also includes
 * a "Re-analyse" button to trigger re-analysis of the selected file.
 *
 * @component
 * @param {Object} props
 * @param {string} props.selectedFile - The filename to re-analyse.
 * @param {Function} props.forceRefreshSelectedFile - Callback to refresh the selected file after re-analysis.
 * @returns {JSX.Element|null} The configuration selection UI, or null if configuration is not loaded.
 */

const ChooseConfiguration = ({ selectedFile, forceRefreshSelectedFile }) => {
  // State for error messages
  const [error, setError] = useState(null);
  // State for configuration data fetched from backend
  const [data, setData] = useState(null);
  // State for keys of the configuration object (for details display)
  const [dataKeys, setDataKeys] = useState([]);
  // State to toggle display of configuration details
  const [showDetails, setShowDetails] = useState(false);
  // State for displaying messages (e.g., success messages)
  const [message, setMessage] = useState(null);

  // Fetch configuration data from backend on mount and every 500ms
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current configuration from backend API
        const response = await fetch('/api/configuration');
        if (!response.ok) throw new Error('Error fetching configuration');
        const result = await response.json();
        // Validate the configuration data
        if (!result || Object.keys(result).length === 0) {
          throw new Error('No configuration data available');
        }
        if (!result.config || (result.config !== 'positrons' && result.config !== 'antiprotons')) {
          throw new Error('Config has to be defined (positrons or antiprotons)');
        }
        // Set configuration data and its keys for details display
        setData(result);
        setDataKeys(Object.keys(result));
      } catch (err) {
        // Handle errors and reset data
        setError(err.message);
        setData(null);
        setDataKeys([]);
      }
    };
    fetchData();
    // Poll for configuration updates every 500ms
    const interval = setInterval(fetchData, 500);
    return () => clearInterval(interval);
  }, []);

  /**
   * Handles changing the configuration or toggling the fit option.
   * Sends the updated configuration to the backend.
   * @param {string} newConfig - The new configuration type ("positrons" or "antiprotons")
   * @param {boolean} newFit - The new fit value
   */
  const handleConfigChange = async (newConfig = data.config, newFit = data.fit) => {
    setError(null);
    // Validate config type
    if (newConfig !== 'positrons' && newConfig !== 'antiprotons')
      throw new Error('Config has to be defined (positrons or antiprotons)');
    let newData = null
    // Select the appropriate default config object
    if (newConfig === 'positrons') {
      newData = positronConfig;
    } else if (newConfig === 'antiprotons') {
      newData = antiprotonConfig;
    }
    // Set the fit property
    newData.fit = newFit;
    try {
      // Send updated configuration to backend API
      fetch('/api/configuration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData),
      })
    }
    catch (error) {
      // Handle errors during update
      setError('Error updating configuration: ' + error.message);
    }
  }

  /**
   * Handles the "Re-analyse" action for the selected file.
   * Sends a request to the backend to re-analyse the file.
   */
  const handleReAnalyse = async () => {
    setError(null);
    setShowDetails(false);
    try {
      setMessage("Re-analyzing the file...");
      // Call backend API to re-analyse the selected file
      const response = await fetch(`/api/reanalyse/${selectedFile}`)
      if (!response.ok) {
        throw new Error('Error re-analysing the file');
      }
      const result = await response.json();
      // Optionally handle result here
      if (result.success) {
        setMessage('Re-analysis successful');
        forceRefreshSelectedFile();
      }
    }
    catch (error) {
      // Handle errors during re-analysis
      setError(error.message);
    }
    finally {
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null);
        setError(null);
      }, 3000);
    }
  }

  // If no configuration data is loaded, render nothing
  if (!data) return null;

  return (
    <div id="ChooseConfig" className="blocks">
      <h3>Choose configuration</h3>
      <div className="buttonBlock">
        {/* Button to select positrons configuration */}
        <button
          className="green"
          style={{ opacity: data.config !== 'positrons' ? 0.5 : 1 }}
          onClick={() => handleConfigChange('positrons')}
        >
          Positrons
        </button>
        {/* Button to select antiprotons configuration */}
        <button
          className="green"
          style={{ opacity: data.config !== 'antiprotons' ? 0.5 : 1 }}
          onClick={() => handleConfigChange('antiprotons')}
        >
          Antiprotons
        </button>
        {/* Button to toggle fit option */}
        <button
          className="green"
          style={{ opacity: data.fit ? 1 : 0.5 }}
          onClick={() => { handleConfigChange(data.config, !data.fit); }}
        >
          {data.fit ? "Fit enabled" : "Fit disabled"}
        </button>
        {/* Button to trigger re-analysis */}
        <button onClick={handleReAnalyse}>
          Re-analyse
        </button>
        {/* Button to show/hide configuration details */}
        <button
          onClick={() => { setShowDetails(!showDetails); }}
        >
          {showDetails ? "Hide details" : "Show details"}
        </button>
        <a
          href="https://alphacpc05.cern.ch/elog/ALPHA/36053"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button>
            Go to the guide
          </button>
        </a>
      </div>
      {/* Display configuration details if toggled */}
      {showDetails && (
        <div style={{ display: 'flex', flexDirection: "column", alignItems: "center" }}>
          <strong>Details of the configuration</strong>
          <ul>
            {dataKeys.map((key) => {
              if (key === "Mapping") return null;
              return (
                <li key={key}>
                  <strong>{key}:</strong> {data[key].toString()}
                </li>
              );
            })
            }
          </ul>
          {/* Display Mapping details if available */}
          {data.Mapping && <>
            <strong>Mapping</strong>
            <ul>
              {Object.keys(data.Mapping).map((key, index) => (
                <li key={key + String(index)}>
                  <strong>{key}:</strong> <ul>
                    {data.Mapping[key].map((item, itemIndex) => (
                      <li key={item + String(itemIndex)}>{item.join('; ')}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </>}
        </div>
      )}
      {/* Display error message if any */}
      {error && <p>{error}</p>}
      {/* Display success message if any */}
      {message && <p>{message}</p>}
    </div>
  );
}

export default ChooseConfiguration;

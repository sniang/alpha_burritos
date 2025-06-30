import React from "react";
import { useState, useEffect } from "react";
import './CSS/ChooseConfiguration.css';

const ChooseConfiguration = ({selectedFile}) => {
  const [config, setConfig] = useState('positrons');
  const [fit, setFit] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [dataKeys, setDataKeys] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/configuration');
        if (!response.ok) throw new Error('Error fetching configuration');
        const result = await response.json();
        if (!result || Object.keys(result).length === 0) {
          throw new Error('No configuration data available');
        }
        if (!result.config || (result.config !== 'positrons' && result.config !== 'antiprotons')) {
          throw new Error('Config has to be defined (positrons or antiprotons)');
        }
        setData(result);
        setDataKeys(Object.keys(result));
        setError(null);
        setFit(result.fit || false);
        setConfig(result.config);
      } catch (err) {
        setError(err.message);
        setData(null);
        setDataKeys([]);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleConfigChange = (newConfig) => {
    if (newConfig !== 'positrons' && newConfig !== 'antiprotons')
      throw new Error('Config has to be defined (positrons or antiprotons)');
    setConfig(newConfig);
    // Optionally, you can also update the fit state based on the new config
    if (newConfig === 'positrons') {
      console.log('Positrons configuration selected');
    } else if (newConfig === 'antiprotons') {
      console.log('Antiprotons configuration selected');
    }
  }

  return (
    <div id="ChooseConfig" className="blocks">
      <h3>Choose configuration (it's not working it)</h3>
      <div className="buttonBlock">
        <button
          className="green"
          style={{ opacity: config !== 'positrons' ? 0.5 : 1 }}
          onClick={() => handleConfigChange('positrons')}
        >
          Positrons
        </button>
        <button
          className="green"
          style={{ opacity: config !== 'antiprotons' ? 0.5 : 1 }}
          onClick={() => handleConfigChange('antiprotons')}
        >
          Antiprotons
        </button>
        <button
          className="green"
          style={{ opacity: fit ? 1 : 0.5 }}
          onClick={() => { setFit(!fit);}}
        >
          {fit ? "Fit enabled" : "Fit disabled"}
        </button>
        <button>
          Redo the analysis
        </button>
        <button
          onClick={() => { setShowDetails(!showDetails);}}
        >
          {showDetails ? "Hide details" : "Show details"}
        </button>
      </div>
      {showDetails && data && (
        <div>
          <strong>Details of the configuration</strong>
          <ul>
            {dataKeys.map((key) => (
              <li key={key}>
                <strong>{key}:</strong> {data[key] ? JSON.stringify(data[key]) : "No data available"}
              </li>
            ))}
          </ul>
        </div>
          )}
          {error && (
            <div>
              <p>{error}</p>
            </div>
          )}
          
    </div>
  );
}

export default ChooseConfiguration;




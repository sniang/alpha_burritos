import { useState } from 'react'
import alphaLogo from './assets/ALPHA_Logo_png.png'
import './App.css'
import TimeStampSelector from './TimeStampSelector.jsx'
import Parameters from './Parameters.jsx'
import DetectorImageAll from './DetectorImageAll.jsx'
import DetectorSelector from './DetectorSelector.jsx'
import DetectorImage from './DetectorImage.jsx'

function App() {

  const [jsonFiles, setJsonFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [selectedDetector, setSelectedDetector] = useState('PDS');
  const [error, setError] = useState(null);

  if (error) {
    return (
      <>
        <h1 style={{ display: 'flex', gap: '50px' }}><img src={alphaLogo} alt="Logo of the ALPHA experiment" width="100px" />  ALPHA Burritos Detectors</h1>
        <p className="error">Something went wrong: {error.message}</p>
      </>
    )
  }

  return (
    <>

      <h1 style={{ display: 'flex', gap: '50px' }}><img src={alphaLogo} alt="Logo of the ALPHA experiment" width="100px" />  ALPHA Burritos Detectors</h1>

      <TimeStampSelector
        jsonFiles={jsonFiles}
        setJsonFiles={setJsonFiles}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        error={error}
        setError={setError}
      />
      {selectedFile && <Parameters selectedFile={selectedFile} />}
      {selectedFile && <DetectorImageAll selectedFile={selectedFile} />}
      {selectedFile && <DetectorSelector  selectedDetector={selectedDetector} setSelectedDetector={setSelectedDetector}/>}
      {selectedFile && selectedDetector && <DetectorImage selectedFile={selectedFile} selectedDetector={selectedDetector} />}
    </>
  )
}

export default App

import { useState } from 'react'
import './CSS/App.css'
import TimeStampSelector from './TimeStampSelector.jsx'
import Parameters from './Parameters.jsx'
import DetectorImageAll from './DetectorImageAll.jsx'
import DetectorSelector from './DetectorSelector.jsx'
import DetectorImage from './DetectorImage.jsx'
import YearMonthSelector from './YearMonthSelector.jsx'
import MainTitle from './MainTitle.jsx'

function App() {

  const [jsonFiles, setJsonFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [selectedDetector, setSelectedDetector] = useState('PDS');
  const [error, setError] = useState(null);
  const currentDate = new Date();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  if (error) {
    return (
      <>
        <MainTitle />
        <p className="error">Something went wrong: {error.message}</p>
      </>
    )
  }

  return (
    <>
      <MainTitle />
      <YearMonthSelector
        year={year}
        setYear={setYear}
        month={month}
        setMonth={setMonth}
      />
      <TimeStampSelector
        year={year}
        month={month}
        jsonFiles={jsonFiles}
        setJsonFiles={setJsonFiles}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        error={error}
        setError={setError}
      />
      {selectedFile && <Parameters selectedFile={selectedFile} />}
      {selectedFile && <DetectorImageAll selectedFile={selectedFile} />}
      {selectedFile && <DetectorSelector selectedDetector={selectedDetector} setSelectedDetector={setSelectedDetector} />}
      {selectedFile && selectedDetector && <DetectorImage selectedFile={selectedFile} selectedDetector={selectedDetector} />}
    </>
  )
}

export default App

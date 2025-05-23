import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import TimeStampSelector from './TimeStampSelector.jsx'
import Parameters from './Parameters.jsx'
import e from 'cors'

function App() {

  const [jsonFiles, setJsonFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [error, setError] = useState(null);

  if (error) {
    return (
      <>
        <h1>ALPHA Burritos</h1>
        <p className="error">Something went wrong: {error.message}</p>
      </>
    )
  }

  return (
    <>

      <h1>ALPHA Burritos</h1>
      <TimeStampSelector
        jsonFiles={jsonFiles}
        setJsonFiles={setJsonFiles}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        error={error}
        setError={setError}
      />
      <Parameters selectedFile={selectedFile} selectedImageAll={selectedImageAll} setSelectedImageAll={setSelectedImageAll} />
    </>
  )
}

export default App

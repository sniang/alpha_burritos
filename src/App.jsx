import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import TimeStampSelector from './TimeStampSelector.jsx'

function App() {

  const [jsonFiles, setJsonFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [error, setError] = useState(null);

  return (
    <>
      <h1>ALPHA Burritos</h1>

      {error && <p className="error">{error}</p>}
      {!error && jsonFiles &&
      (<TimeStampSelector 
        jsonFiles={jsonFiles}
         setJsonFiles={setJsonFiles}
         selectedFile={selectedFile}
         setSelectedFile={setSelectedFile}
         error={error}
         setError={setError}
         />)
         }
    </>
  )
}

export default App

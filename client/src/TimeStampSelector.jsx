import React, {useState, useEffect} from "react";

function TimeStampSelector() {
  const [jsonFiles, setJsonFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');

  useEffect(() => {
    fetch('http://localhost:3001/api/json-files')
      .then(res => res.json())
      .then(setJsonFiles)
      .catch(console.error);
  }, []);

  const handleSelectChange = (event) => {
    setSelectedFile(event.target.value);
    console.log('Selected file:', event.target.value);
  };

  return (
    <div>
      <select
        value={selectedFile}
        onChange={handleSelectChange}
        className="border rounded p-2"
      >
        <option value="" disabled>Select a file</option>
        {jsonFiles.map((file, index) => (
          <option key={index} value={file}>{file}</option>
        ))}
      </select>
    </div>
  );
}
export default TimeStampSelector;
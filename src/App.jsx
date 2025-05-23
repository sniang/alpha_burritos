import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import DetectorSelector from './DetectorSelector.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>ALPHA Burritos</h1>
      <DetectorSelector />
    </>
  )
}

export default App

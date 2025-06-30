  import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'
import App from './App.jsx'
import OGFAlgorithm from './OGFAlgorithm.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/ogf-algorithm" element={<OGFAlgorithm />} />
      </Routes>
    </Router>
  </StrictMode>,
)

  import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'
import App from './App.tsx'
import AlgorithmExplanation from './pages/AlgorithmExplanation.tsx';

import HowToUse from './pages/HowToUse.tsx';
import Examples from './pages/Examples.tsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router basename="/functionFinder">
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/algorithms" element={<AlgorithmExplanation />} />
        <Route path="/how-to-use" element={<HowToUse />} />
        <Route path="/examples" element={<Examples />} />
      </Routes>
    </Router>
  </StrictMode>,
)

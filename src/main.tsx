  import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'
import App from './App.tsx'
import AlgorithmExplanation from './AlgorithmExplanation.tsx';

import HowToUse from './HowToUse.tsx';
import Examples from './Examples.tsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/algorithms" element={<AlgorithmExplanation />} />
        <Route path="/how-to-use" element={<HowToUse />} />
        <Route path="/examples" element={<Examples />} />
      </Routes>
    </Router>
  </StrictMode>,
)

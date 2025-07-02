import { useState } from 'react';
import 'katex/dist/katex.min.css';
import './styles/App.css';
import { BlockMath } from 'react-katex';
import './styles/App.css';
import { Link } from 'react-router-dom';
import { useRecurrenceAnalysis } from './hooks/useRecurrenceAnalysis.ts';

function App() {
  const [copied, setCopied] = useState({});
  const {
    sequence, setSequence,
    degree, setDegree,
    extendLength, setExtendLength,
    error, setError,
    polynomialRecurrenceError, setPolynomialRecurrenceError,
    algebraicRecurrenceError, setAlgebraicRecurrenceError,
    rationalFunction, setRationalFunction,
    polynomialRecurrenceResult, setPolynomialRecurrenceResult,
    algebraicRecurrenceResult, setAlgebraicRecurrenceResult,
    ogfExtendedSequence, setOgfExtendedSequence,
    algebraicDifferentialEquationResult, setAlgebraicDifferentialEquationResult,
    algebraicDifferentialEquationError, setAlgebraicDifferentialEquationError,
    egfAlgebraicDifferentialEquationResult, setEgfAlgebraicDifferentialEquationResult,
    egfAlgebraicDifferentialEquationError, setEgfAlgebraicDifferentialEquationError,
    handleFindAll
  } = useRecurrenceAnalysis();

  const handleTweet = () => {
    const terms = sequence.split(',').map(s => s.trim()).filter(s => s !== '');
    const sequenceSnippet = terms.slice(0, 5).join(', ') + (terms.length > 5 ? '...' : '');
    let tweetContent = `I found a recurrence for ${sequenceSnippet}!\n`;

    if (rationalFunction && rationalFunction.P_latex && rationalFunction.Q_latex) {
      tweetContent += ` Rational: (${rationalFunction.P_latex})/(${rationalFunction.Q_latex}).\n`;
    }

    if (algebraicRecurrenceResult && !algebraicRecurrenceResult.error && algebraicRecurrenceResult.algebraicRecurrenceEquation) {
      tweetContent += ` Algebraic: ${algebraicRecurrenceResult.algebraicRecurrenceEquation}.\n`;
    }

    if (polynomialRecurrenceResult && !polynomialRecurrenceResult.error && polynomialRecurrenceResult.polynomialRecurrenceEquation) {
      tweetContent += ` P-Rec: ${polynomialRecurrenceResult.polynomialRecurrenceEquation}.\n`;
    }


    const appUrl = `${window.location.origin}${window.location.pathname}?sequence=${encodeURIComponent(sequence)}&degree=${encodeURIComponent(degree)}&extendLength=${encodeURIComponent(extendLength)}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetContent + ` ${appUrl}`)}`;
    window.open(twitterUrl, '_blank');
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied({ [id]: true });
    setTimeout(() => setCopied({ [id]: false }), 2000);
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Sequence Recurrence Finder</h1>
      <div className="mb-3">
        <label htmlFor="sequenceInput" className="form-label">Enter a sequence (comma-separated):</label>
        <textarea
          className="form-control"
          id="sequenceInput"
          rows="3"
          value={sequence}
          onChange={(e) => {
            const filteredValue = e.target.value.replace(/[^0-9,-\s]/g, '');
            setSequence(filteredValue);
          }}
          placeholder="e.g., 1, 1, 2, 3, 5, 8"
        ></textarea>
      </div>

      <div className="row mb-3">
        <div className="col">
            <label htmlFor="degreeInput" className="form-label">Degree:</label>
            <input
                type="number"
                className="form-control"
                id="degreeInput"
                value={degree}
                onChange={(e) => {
                    const newValue = parseInt(e.target.value, 10);
                    if (isNaN(newValue) || newValue < 0) {
                        setDegree('0');
                    } else {
                        setDegree(e.target.value);
                    }
                }}
            />
        </div>
        <div className="col">
            <label htmlFor="extendLengthInput" className="form-label">Extend Length:</label>
            <input
                type="number"
                className="form-control"
                id="extendLengthInput"
                value={extendLength}
                onChange={(e) => {
                    const newValue = parseInt(e.target.value, 10);
                    if (isNaN(newValue) || newValue < 0) {
                        setExtendLength('0');
                    } else {
                        setExtendLength(e.target.value);
                    }
                }}
            />
        </div>
      </div>
      <button className="btn btn-primary" onClick={handleFindAll}>Find The Recurrence</button>
      <button className="btn btn-info ms-2" onClick={handleTweet}>Tweet Results</button>
      <p className="text-muted mt-2">Calculations are performed modulo the prime p = 1000003.</p>

      {rationalFunction && (
        <div className="alert alert-info mt-4 position-relative" role="alert">
          <p>Rational Function:</p>          <button className="btn btn-sm btn-outline-secondary position-absolute top-0 end-0 mt-2 me-2" onClick={() => copyToClipboard(`Constant Recursive Relation: (${rationalFunction.P_latex})/(${rationalFunction.Q_latex})
${ogfExtendedSequence}`, 'rational')}>{copied['rational'] ? 'Copied!' : 'Copy'}</button>          <BlockMath math={String.raw`\frac{${rationalFunction.P_latex}}{${rationalFunction.Q_latex}}`} />          <p>Extended Sequence:</p>          <pre className="extended-sequence-output">{ogfExtendedSequence}</pre>
        </div>
      )}

      {algebraicRecurrenceResult && !algebraicRecurrenceResult.error && (
        <div className="alert alert-info mt-4 position-relative" role="alert">
          <p>Algebraic Equation:</p>
          <button className="btn btn-sm btn-outline-secondary position-absolute top-0 end-0 mt-2 me-2" onClick={() => copyToClipboard(algebraicRecurrenceResult.algebraicRecurrenceEquation, 'algebraic')}>{copied['algebraic'] ? 'Copied!' : 'Copy'}</button>
          <BlockMath math={algebraicRecurrenceResult.algebraicRecurrenceEquation} />
          <p>Extended Sequence:</p>
          <pre className="extended-sequence-output">{
            typeof algebraicRecurrenceResult.sequence === 'string' 
              ? algebraicRecurrenceResult.sequence.replace("Extended Sequence:", "").trim() 
              : ''
          }</pre>
        </div>
      )}

      {algebraicRecurrenceError && (
        <div className="alert alert-danger mt-4" role="alert">
          <p>Algebraic Equation:</p> {algebraicRecurrenceError}
        </div>
      )}

      {polynomialRecurrenceResult && !polynomialRecurrenceResult.error && (
        <div className="alert alert-info mt-4 position-relative" role="alert">
          <p>Polynomial Recurrence:</p>
          <button className="btn btn-sm btn-outline-secondary position-absolute top-0 end-0 mt-2 me-2" onClick={() => copyToClipboard(polynomialRecurrenceResult.polynomialRecurrenceEquation, 'polynomial')}>{copied['polynomial'] ? 'Copied!' : 'Copy'}</button>
          <BlockMath math={polynomialRecurrenceResult.polynomialRecurrenceEquation} />
          <p>Extended Sequence:</p>
          <pre className="extended-sequence-output">{
            typeof polynomialRecurrenceResult.sequence === 'string' 
              ? polynomialRecurrenceResult.sequence.replace("Extended Sequence:", "").trim() 
              : ''
          }</pre>
        </div>
      )}

      {polynomialRecurrenceError && (
        <div className="alert alert-danger mt-4" role="alert">
          <p>Polynomial Recurrence:</p> {polynomialRecurrenceError}
        </div>
      )}

      {algebraicDifferentialEquationResult && (
        <div className="alert alert-info mt-4 position-relative" role="alert">
          <p>Algebraic Differential Equation:</p>
          <button className="btn btn-sm btn-outline-secondary position-absolute top-0 end-0 mt-2 me-2" onClick={() => copyToClipboard(algebraicDifferentialEquationResult.equation, 'ade')}>{copied['ade'] ? 'Copied!' : 'Copy'}</button>
          <BlockMath math={algebraicDifferentialEquationResult.equation} />
          <p>Extended Sequence:</p>
          <pre className="extended-sequence-output">{algebraicDifferentialEquationResult.sequence}</pre>
        </div>
      )}

      {algebraicDifferentialEquationError && (
        <div className="alert alert-danger mt-4" role="alert">
          <p>Algebraic Differential Equation:</p> {algebraicDifferentialEquationError}
        </div>
      )}

      {egfAlgebraicDifferentialEquationResult && (
        <div className="alert alert-info mt-4 position-relative" role="alert">
          <p>Algebraic Differential Equation for EGF:</p>
          <button className="btn btn-sm btn-outline-secondary position-absolute top-0 end-0 mt-2 me-2" onClick={() => copyToClipboard(egfAlgebraicDifferentialEquationResult.equation, 'egfade')}>{copied['egfade'] ? 'Copied!' : 'Copy'}</button>
          <BlockMath math={egfAlgebraicDifferentialEquationResult.equation} />
          <p>Extended Sequence:</p>
          <pre className="extended-sequence-output">{egfAlgebraicDifferentialEquationResult.sequence}</pre>
        </div>
      )}

      {egfAlgebraicDifferentialEquationError && (
        <div className="alert alert-danger mt-4" role="alert">
          <p>EGF Algebraic Differential Equation:</p> {egfAlgebraicDifferentialEquationError}
        </div>
      )}

      {error && (
        <div className="alert alert-danger mt-4" role="alert">
          {error}
        </div>
      )}
      <Link to="/how-to-use" className="me-3">How to Use</Link>
      <Link to="/algorithms" className="me-3">Learn about the Algorithms</Link>
      <Link to="/examples" className="me-3">Examples</Link>
      <a href="https://x.com/37zigen" target="_blank" rel="noopener noreferrer" className="me-3">DM OK (Twitter)</a>
      <a href="https://github.com/Maruoka842/functionFinder" target="_blank" rel="noopener noreferrer">GitHub</a>
    </div>
  );
}

export default App;
import { useState } from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import { Link } from 'react-router-dom';
import { useRecurrenceAnalysis } from './hooks/useRecurrenceAnalysis';

function App() {
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


    const appUrl = `https://example.com/sequence-solver?sequence=${encodeURIComponent(sequence)}&degree=${encodeURIComponent(degree)}&extendLength=${encodeURIComponent(extendLength)}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetContent + ` ${appUrl}`)}`;
    window.open(twitterUrl, '_blank');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
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
            const filteredValue = e.target.value.replace(/[^0-9,\s]/g, '');
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
          <p>Constant Recursive Relation:</p>
          <button className="btn btn-sm btn-outline-secondary position-absolute top-0 end-0 mt-2 me-2" onClick={() => copyToClipboard(`(${rationalFunction.P_latex})/(${rationalFunction.Q_latex})`)}>Copy</button>
          <BlockMath math={String.raw`\frac{${rationalFunction.P_latex}}{${rationalFunction.Q_latex}}`} />
          <pre>{ogfExtendedSequence}</pre>
        </div>
      )}

      {algebraicRecurrenceResult && !algebraicRecurrenceResult.error && (
        <div className="alert alert-info mt-4 position-relative" role="alert">
          <p>Algebraic Recursive Relation:</p>
          <button className="btn btn-sm btn-outline-secondary position-absolute top-0 end-0 mt-2 me-2" onClick={() => copyToClipboard(algebraicRecurrenceResult.algebraicRecurrenceEquation)}>Copy</button>
          <BlockMath math={algebraicRecurrenceResult.algebraicRecurrenceEquation} />
          <pre>{algebraicRecurrenceResult.sequence}</pre>
        </div>
      )}

      {algebraicRecurrenceError && (
        <div className="alert alert-danger mt-4" role="alert">
          <p>Algebraic Recurrence Relation:</p> {algebraicRecurrenceError}
        </div>
      )}

      {polynomialRecurrenceResult && !polynomialRecurrenceResult.error && (
        <>
            <div className="alert alert-secondary mt-4 position-relative" role="alert">
                <p>Polynomial Recursive Relation:</p>
                <button className="btn btn-sm btn-outline-secondary position-absolute top-0 end-0 mt-2 me-2" onClick={() => copyToClipboard(polynomialRecurrenceResult.polynomialRecurrenceEquation)}>Copy</button>
                <BlockMath math={polynomialRecurrenceResult.polynomialRecurrenceEquation} />
                <pre>{polynomialRecurrenceResult.sequence}</pre>
            </div>
        </>
      )}

      {polynomialRecurrenceError && (
        <div className="alert alert-danger mt-4" role="alert">
          <p>Polynomial Recurrence:</p> {polynomialRecurrenceError}
        </div>
      )}

      {error && (
        <div className="alert alert-danger mt-4" role="alert">
          {error}
        </div>
      )}
      <Link to="/ogf-algorithm">Learn about the Algorithm</Link>
    </div>
  );
}

export default App;
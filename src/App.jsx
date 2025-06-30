import { useState } from 'react';
import { analyze_polynomial_recurrence, analyze_algebraic_recurrence, extend_sequence_from_constant_recursive, findRationalFunction, polyToLatex, pow, modinv, mod } from './recurrence.js';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import { Link } from 'react-router-dom';

function App() {
  const [sequence, setSequence] = useState('');
  const [degree, setDegree] = useState('1');
  const [extendLength, setExtendLength] = useState('20');
  const [error, setError] = useState('');
  const [polynomialRecurrenceError, setPolynomialRecurrenceError] = useState('');
  const [algebraicRecurrenceError, setAlgebraicRecurrenceError] = useState('');
  const [rationalFunction, setRationalFunction] = useState(null);
  const [polynomialRecurrenceResult, setPolynomialRecurrenceResult] = useState(null);
  const [algebraicRecurrenceResult, setAlgebraicRecurrenceResult] = useState(null);
  const [ogfExtendedSequence, setOgfExtendedSequence] = useState('');

  const handleTweet = () => {
    const terms = sequence.split(',').map(s => s.trim()).filter(s => s !== '');
    const sequenceSnippet = terms.slice(0, 5).join(', ') + (terms.length > 5 ? '...' : '');
    let tweetContent = `For the sequence ${sequenceSnippet}, `;

    if (rationalFunction && rationalFunction.P_latex && rationalFunction.Q_latex) {
      const ogfCombinedLength = rationalFunction.P_latex.length + rationalFunction.Q_latex.length;
      if (ogfCombinedLength < 40) { // Arbitrary limit for "short" OGF
        tweetContent += ` c-rec: (${rationalFunction.P_latex})/(${rationalFunction.Q_latex}).`;
      }
    }

    if (algebraicRecurrenceResult && algebraicRecurrenceResult.algebraicRecurrenceEquation && !algebraicRecurrenceResult.error) {
      const algEq = algebraicRecurrenceResult.algebraicRecurrenceEquation;
      if (algEq.length < 50) { // Arbitrary limit for "short" algebraic equation
        tweetContent += ` algbraic-rec: ${algEq}.`;
      } else {
        tweetContent += ` I found an algebraic recurrence.`;
      }
    }

    if (polynomialRecurrenceResult && polynomialRecurrenceResult.polynomialRecurrenceEquation && !polynomialRecurrenceResult.error) {
      const polyEq = polynomialRecurrenceResult.polynomialRecurrenceEquation;
      if (polyEq.length < 50) { // Arbitrary limit for "short" polynomial equation
        tweetContent += ` p-rec: ${polyEq}.`;
      } else {
        tweetContent += ` I found a polynomial recurrence.`;
      }
    }


    const tweetText = `${tweetContent} \nhttps://example.com/sequence-solver`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleFindAll = () => {
    setError('');
    setPolynomialRecurrenceError('');
    setAlgebraicRecurrenceError('');
    setRationalFunction(null);
    setPolynomialRecurrenceResult(null);
    setAlgebraicRecurrenceResult(null);
    setOgfExtendedSequence('');

    const terms = sequence.split(',').map(s => s.trim()).filter(s => s !== '').map(s => Number(BigInt(s) % BigInt(mod)));
    if (terms.some(isNaN)) {
      setError('Invalid input: Please enter a comma-separated list of numbers.');
      return;
    }

    const n = parseInt(extendLength, 10);
    const d = parseInt(degree, 10);
    if (isNaN(n) || isNaN(d)) {
      setError('Invalid input: Please enter valid numbers for degree and extend length.');
      return;
    }

    // Rational Function Part
    const rationalFuncResult = findRationalFunction(terms);
    if (rationalFuncResult.error) {
      setError(rationalFuncResult.error);
    } else {
      setRationalFunction(rationalFuncResult);
      const extended = extend_sequence_from_constant_recursive(rationalFuncResult.P, rationalFuncResult.Q, terms, n);
      setOgfExtendedSequence(extended.map((val, i) => `${i}: ${val}`).join('\n'));
    }

    // Polynomial Recurrence Part
    const polyResult = analyze_polynomial_recurrence(n, terms, d);
    setPolynomialRecurrenceResult(polyResult);
    if (polyResult.error) {
      setPolynomialRecurrenceError(polyResult.error);
    } else {
      setPolynomialRecurrenceError('');
    }

    // Algebraic Recurrence Part
    const algResult = analyze_algebraic_recurrence(n, terms, d);
    setAlgebraicRecurrenceResult(algResult);
    if (algResult.error) {
      setAlgebraicRecurrenceError(algResult.error);
    } else {
      setAlgebraicRecurrenceError('');
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Sequence Tools</h1>
      <div className="mb-3">
        <label htmlFor="sequenceInput" className="form-label">Enter a sequence (comma-separated):</label>
        <textarea
          className="form-control"
          id="sequenceInput"
          rows="3"
          value={sequence}
          onChange={(e) => setSequence(e.target.value)}
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
        <div className="alert alert-info mt-4" role="alert">
          <p>Constant Recursive Relation:</p>
          <BlockMath math={String.raw`\frac{${rationalFunction.P_latex}}{${rationalFunction.Q_latex}}`} />
          <pre>{ogfExtendedSequence}</pre>
        </div>
      )}

      {algebraicRecurrenceResult && !algebraicRecurrenceResult.error && (
        <div className="alert alert-info mt-4" role="alert">
          <p>Algebraic Recursive Relation:</p>
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
            <div className="alert alert-secondary mt-4" role="alert">
                <p>Polynomial Recursive Relation:</p>
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

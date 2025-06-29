import { useState } from 'react';
import { show_extended_sequence } from './recurrence.js';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';

function App() {
  const [sequence, setSequence] = useState('');
  const [degree, setDegree] = useState('1');
  const [extendLength, setExtendLength] = useState('20');
  const [error, setError] = useState('');
  const [rationalFunction, setRationalFunction] = useState(null);
  const [extendedSequence, setExtendedSequence] = useState('');

  const mod = 1000003;

  function pow(a, n) {
    if (n == 0) return 1;
    return pow(a * a % mod, Math.floor(n / 2)) * (n % 2 == 1 ? a : 1) % mod;
  }

  function modinv(a) {
    return pow(a, mod - 2);
  }

  const polyToLatex = (coeffs) =>
    coeffs
      .map((c, i) => {
        if (c === 0) return null;
        const sign = c < 0 ? '-' : i === 0 ? '' : '+';
        const val = Math.abs(c);
        if (val === 0) return null;

        let term;
        if (i === 0) {
          term = `${val}`;
        } else if (i === 1) {
          term = val === 1 ? 'x' : `${val}x`;
        } else {
          term = val === 1 ? `x^${i}` : `${val}x^${i}`;
        }
        return `${sign} ${term}`;
      })
      .filter(Boolean)
      .join(' ')
      .replace(/^\+ /, '');

  const findRationalFunction = (terms) => {
    if (terms.some(isNaN)) {
      return { error: "Invalid input: Please enter a comma-separated list of numbers." };
    }
    if (terms.length < 4 || terms.length % 2 !== 0) {
      return { error: "Invalid input: Please enter an even number of terms (at least 4)." };
    }
    const N = Math.floor(terms.length / 2);
    const size = 2 * N + 1;
    let A0 = new Array(size).fill(0);
    let B0 = new Array(size).fill(0);
    let A1 = new Array(size).fill(0);
    let B1 = new Array(size).fill(0);

    A0[2 * N] = 1;
    for (let i = 0; i < terms.length; i++) A1[i] = terms[i];
    B1[0] = 1;

    let deg = 2 * N - 1;
    while (deg > N) {
      if (A1[deg] === 0) {
        deg--;
        continue;
      }
      for (let i = size - 1; i >= deg; i--) {
        if (A0[i] !== 0) {
          const q = (A0[i] * modinv(A1[deg])) % mod;
          for (let j = 0; i - deg + j < 2 * N + 1; j++) {
            A0[i - deg + j] = (A0[i - deg + j] - A1[j] * q) % mod;
            B0[i - deg + j] = (B0[i - deg + j] - B1[j] * q) % mod;
          }
        }
      }
      [A0, A1] = [A1, [...A0]];
      [B0, B1] = [B1, [...B0]];
    }

    const invConst = modinv(B1[0]);
    for (let i = 0; i < size; i++) {
      B1[i] = (B1[i] * invConst) % mod;
      A1[i] = (A1[i] * invConst) % mod;
    }
    for (let i = 0; i < size; i++) {
      B1[i] = (B1[i] + mod) % mod;
      A1[i] = (A1[i] + mod) % mod;
    }
    for (let i = 0; i < size; i++) {
      if (Math.abs(B1[i] - mod) < Math.abs(B1[i])) B1[i] -= mod;
      if (Math.abs(A1[i] - mod) < Math.abs(A1[i])) A1[i] -= mod;
    }
    A1.length = N;
    B1.length = N + 1;

    return { P_latex: polyToLatex(A1), Q_latex: polyToLatex(B1) };
  };

  const handleFindAll = () => {
    setError('');
    setRationalFunction(null);
    setExtendedSequence('');

    const terms = sequence.split(',').map(s => s.trim()).filter(s => s !== '').map(Number);
    if (terms.some(isNaN)) {
      setError('Invalid input: Please enter a comma-separated list of numbers.');
      return;
    }

    try {
      // Rational Function Part
      const rationalFuncResult = findRationalFunction(terms);
      if (rationalFuncResult.error) {
        setError(rationalFuncResult.error);
      } else {
        setRationalFunction(rationalFuncResult);
      }

      // Extended Sequence Part
      const n = parseInt(extendLength, 10);
      const d = parseInt(degree, 10);
      if (isNaN(n) || isNaN(d)) {
        setError('Invalid input: Please enter valid numbers for degree and extend length.');
        return;
      }
      const extendedSequenceResult = show_extended_sequence(n, terms, d);
      setExtendedSequence(extendedSequenceResult);

    } catch (e) {
      setError('Error: ' + e.message);
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
                onChange={(e) => setDegree(e.target.value)}
            />
        </div>
        <div className="col">
            <label htmlFor="extendLengthInput" className="form-label">Extend Length:</label>
            <input
                type="number"
                className="form-control"
                id="extendLengthInput"
                value={extendLength}
                onChange={(e) => setExtendLength(e.target.value)}
            />
        </div>
      </div>
      <button className="btn btn-primary" onClick={handleFindAll}>Find Recurrence, Extend & Find OGF</button>
      <p className="text-muted mt-2">Calculations are performed modulo the prime p = 1000003.</p>

      {error && (
        <div className="alert alert-danger mt-4" role="alert">
          {error}
        </div>
      )}

      {rationalFunction && (
        <div className="alert alert-info mt-4" role="alert">
          <p>Ordinary Generating Function:</p>
          <BlockMath math={String.raw`\frac{${rationalFunction.P_latex}}{${rationalFunction.Q_latex}}`} />
        </div>
      )}

      {extendedSequence && (
        <div className="alert alert-secondary mt-4" role="alert">
          <p>Extended Sequence:</p>
          <pre>{extendedSequence}</pre>
        </div>
      )}
    </div>
  );
}

export default App;

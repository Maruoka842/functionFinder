import { useState } from 'react';

function App() {
  const [sequence, setSequence] = useState('');
  const [result, setResult] = useState('');
  const mod = 1000003;

  function pow(a, n) {
    if (n == 0) return 1;
    return pow(a * a % mod, Math.floor(n / 2)) * (n % 2 == 1 ? a : 1) % mod;
  }

  function modinv(a) {
    return pow(a, mod - 2);
  }
  const findRationalFunction = (terms) => {
    if (terms.some(isNaN)) {
      setResult('Invalid input: Please enter a comma-separated list of numbers.');
      return null;
    }
    if (terms.length < 4 || terms.length % 2 !== 0) {
      setResult('Invalid input: Please enter an even number of terms (at least 4).');
      return null;
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
    return { A1, B1 };
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Rational Function Finder</h1>
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
      <button
        className="btn btn-primary"
        onClick={() => {
          const terms = sequence
            .split(',')
            .map(s => s.trim())
            .filter(s => s !== '')
            .map(Number);

          if (terms.some(isNaN)) {
            setResult('Invalid input: Please enter a comma-separated list of numbers.');
            return;
          }

          try {
            const factorial = [1];
            for (let i = 1; i < terms.length; i++) {
              factorial[i] = factorial[i - 1] * i % mod;
            }

            const termsEGF = terms.map((val, i) => val * modinv(factorial[i]) % mod);
            const result1 = findRationalFunction(terms);
            if (!result1) return;
            const { A1, B1 } = result1;
            const result2 = findRationalFunction(termsEGF);
            if(!result2) return;
            const { A1: A2, B1: B2 } = result2;
            for (let i = 0; i < A2.length; i++) {
              A2[i] = A2[i] * factorial[i] % mod;
              B2[i] = B2[i] * factorial[i] % mod;
            }
            const polyToString = (coeffs) =>
              coeffs
                .map((c, i) => {
                  if (c === 0) return null;
                  const sign = c < 0 ? '- ' : i === 0 ? '' : '+ ';
                  const val = Math.abs(c);
                  const term = i === 0 ? `${val}` : i === 1 ? `${val}x` : `${val}x^${i}`;
                  return `${sign}${term}`;
                })
                .filter(Boolean)
                .join(' ');
            const polyEGFToString = (coeffs) =>
              coeffs
                .map((c, i) => {
                  if (c === 0) return null;
                  const sign = c < 0 ? '- ' : i === 0 ? '' : '+ ';
                  const val = Math.abs(c);
                  const term = i === 0 ? `${val}` : i === 1 ? `${val}x` : `${val}x^${i}/${i}!`;
                  return `${sign}${term}`;
                })
                .filter(Boolean)
                .join(' ');

            setResult(
              `Ordinary GF:\n(${polyToString(A1)}) / (${polyToString(B1)})`
            );
          } catch (e) {
            setResult('Error: ' + e.message);
          }
        }}
      >
        Find Function
      </button>
      {result && (
        <div className="alert alert-info mt-4" role="alert">
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
}

export default App;

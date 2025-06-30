import { useState, useEffect } from 'react';
import { analyze_polynomial_recurrence, extend_linear_recurrence_sequence, analyze_algebraic_recurrence, findRationalFunction, mod } from '../recurrence.js';

export const useRecurrenceAnalysis = () => {
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlSequence = params.get('sequence');
    const urlDegree = params.get('degree');
    const urlExtendLength = params.get('extendLength');

    if (urlSequence) {
      setSequence(urlSequence);
    }
    if (urlDegree) {
      setDegree(urlDegree);
    }
    if (urlExtendLength) {
      setExtendLength(urlExtendLength);
    }
  }, []);

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
      const extended = extend_linear_recurrence_sequence([], rationalFuncResult.Q, terms, n);
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

  return {
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
  };
};
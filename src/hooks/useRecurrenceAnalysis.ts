import { useState, useEffect } from 'react';
import { analyzePolynomialRecurrence, extendSequenceFromLinearRecurrence, analyzeAlgebraicRecurrence, findRationalFunction, mod, findAlgebraicDifferentialEquation, generateAlgebraicDifferentialEquationString, transformToEGF, extendSequenceFromAlgebraicDifferentialEquation, FACTORIAL } from '../recurrence.ts';

interface RationalFunctionResult {
  P: number[];
  Q: number[];
  P_latex: string;
  Q_latex: string;
  error?: string;
}

interface PolynomialRecurrenceResult {
  info?: string;
  polynomialRecurrenceEquation?: string;
  sequence?: string;
  error?: string;
}

interface AlgebraicRecurrenceResult {
  algebraicRecurrenceEquation?: string;
  sequence?: string;
  error?: string;
}

interface AlgebraicDifferentialEquationResult {
  equation: string;
  sequence: string;
}

interface AlgebraicDifferentialEquationSolution {
  partition: number[][];
  v: number[];
}

export const useRecurrenceAnalysis = () => {
  const [sequence, setSequence] = useState<string>('');
  const [degree, setDegree] = useState<string>('1');
  const [extendLength, setExtendLength] = useState<string>('20');
  const [error, setError] = useState<string>('');
  const [polynomialRecurrenceError, setPolynomialRecurrenceError] = useState<string>('');
  const [algebraicRecurrenceError, setAlgebraicRecurrenceError] = useState<string>('');
  const [rationalFunction, setRationalFunction] = useState<RationalFunctionResult | null>(null);
  const [polynomialRecurrenceResult, setPolynomialRecurrenceResult] = useState<PolynomialRecurrenceResult | null>(null);
  const [algebraicRecurrenceResult, setAlgebraicRecurrenceResult] = useState<AlgebraicRecurrenceResult | null>(null);
  const [algebraicDifferentialEquationResult, setAlgebraicDifferentialEquationResult] = useState<AlgebraicDifferentialEquationResult | null>(null);
  const [algebraicDifferentialEquationError, setAlgebraicDifferentialEquationError] = useState<string>('');
  const [egfAlgebraicDifferentialEquationResult, setEgfAlgebraicDifferentialEquationResult] = useState<AlgebraicDifferentialEquationResult | null>(null);
  const [egfAlgebraicDifferentialEquationError, setEgfAlgebraicDifferentialEquationError] = useState<string>('');
  const [ogfExtendedSequence, setOgfExtendedSequence] = useState<string>('');

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
    setAlgebraicDifferentialEquationResult(null);
    setAlgebraicDifferentialEquationError('');
    setEgfAlgebraicDifferentialEquationResult(null);
    setEgfAlgebraicDifferentialEquationError('');

    const terms = sequence.split(',').map(s => s.trim()).filter(s => s !== '').map(s => Number((BigInt(s) % BigInt(mod) + BigInt(mod)) % BigInt(mod)));
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
      const extended = extendSequenceFromLinearRecurrence([], rationalFuncResult.Q, terms, n);
      setOgfExtendedSequence(extended.map((val, i) => `${i}: ${val}`).join('\n'));
    }

    // Polynomial Recurrence Part
    const polyResult = analyzePolynomialRecurrence(n, terms, d);
    setPolynomialRecurrenceResult(polyResult);
    if (polyResult.error) {
      setPolynomialRecurrenceError(polyResult.error);
    } else {
      setPolynomialRecurrenceError('');
    }

    // Algebraic Recurrence Part
    const algResult = analyzeAlgebraicRecurrence(n, terms, d);
    setAlgebraicRecurrenceResult(algResult);
    if (algResult.error) {
      setAlgebraicRecurrenceError(algResult.error);
    }
    else {
      setAlgebraicRecurrenceError('');
    }

    // Algebraic Differential Equation Part
    try {
      const adeqResult: AlgebraicDifferentialEquationSolution | null = findAlgebraicDifferentialEquation(terms, d);
      if (adeqResult) {
        const extended = extendSequenceFromAlgebraicDifferentialEquation(adeqResult.v, adeqResult.partition, terms, n);
        setAlgebraicDifferentialEquationResult({
          equation: generateAlgebraicDifferentialEquationString(adeqResult),
          sequence: extended.map((val, i) => `${i}: ${val}`).join('\n'),
        });
      } else {
        // This else block should ideally not be reached if findAlgebraicDifferentialEquation throws an error
        setAlgebraicDifferentialEquationResult(null);
        setAlgebraicDifferentialEquationError('Error: Could not find algebraic differential equation.');
      }
    } catch (e: any) {
      setAlgebraicDifferentialEquationError('Error: ' + e.message);
    }
    // EGF Algebraic Differential Equation of EGF Part
    try {
      const egfTerms = transformToEGF(terms);
      const egfAdeqResult: AlgebraicDifferentialEquationSolution | null = findAlgebraicDifferentialEquation(egfTerms, d);
      if (egfAdeqResult) {
        const extended = extendSequenceFromAlgebraicDifferentialEquation(egfAdeqResult.v, egfAdeqResult.partition, egfTerms, n);
        const ogfExtended = extended.map((val, i) => (val * FACTORIAL[i]) % mod);
        setEgfAlgebraicDifferentialEquationResult({
          equation: generateAlgebraicDifferentialEquationString(egfAdeqResult),
          sequence: ogfExtended.map((val, i) => `${i}: ${val}`).join('\n'),
        });
      } else {
        // This else block should ideally not be reached if findAlgebraicDifferentialEquation throws an error
        setEgfAlgebraicDifferentialEquationResult(null);
        setEgfAlgebraicDifferentialEquationError('Error: Could not find algebraic differential equation for EGF.');
      }
    } catch (e: any) {
      setEgfAlgebraicDifferentialEquationError('Error: ' + e.message);
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
    algebraicDifferentialEquationResult, setAlgebraicDifferentialEquationResult,
    algebraicDifferentialEquationError, setAlgebraicDifferentialEquationError,
    egfAlgebraicDifferentialEquationResult, setEgfAlgebraicDifferentialEquationResult,
    egfAlgebraicDifferentialEquationError, setEgfAlgebraicDifferentialEquationError,
    handleFindAll
  };
};
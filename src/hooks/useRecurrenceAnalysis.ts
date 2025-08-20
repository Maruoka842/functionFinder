import { useState, useEffect } from 'react';
import { analyzePolynomialRecurrence, extendSequenceFromLinearRecurrence, analyzeAlgebraicRecurrence, findRationalFunction, findAlgebraicDifferentialEquation, generateAlgebraicDifferentialEquationString, transformToEGF, extendSequenceFromAlgebraicDifferentialEquation, getFactorialArray } from '../logic/recurrence.ts';

interface RationalFunctionResult {
  P: bigint[];
  Q: bigint[];
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
  v: bigint[];
}

export const useRecurrenceAnalysis = () => {
  const [sequence, setSequence] = useState<string>('');
  const [degree, setDegree] = useState<string>('1');
  const [extendLength, setExtendLength] = useState<string>('20');
  const [mod, setMod] = useState<string>('1000003');
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
    const urlMod = params.get('mod');

    if (urlSequence) {
      setSequence(urlSequence);
    }
    if (urlDegree) {
      setDegree(urlDegree);
    }
    if (urlExtendLength) {
      setExtendLength(urlExtendLength);
    }
    if (urlMod) {
      setMod(urlMod);
    }
  }, []);

  const handleFindAll = () => {
    try {
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

      const modValue = BigInt(mod);
      const factorial = getFactorialArray(modValue);
      const terms = sequence.split(',').map(s => s.trim()).filter(s => s !== '').map(s => BigInt(s));

      const n = parseInt(extendLength, 10);
      const d = parseInt(degree, 10);
      if (isNaN(n) || isNaN(d)) {
        setError('Invalid input: Please enter valid numbers for degree and extend length.');
        return;
      }

      // Rational Function Part
      const rationalFuncResult = findRationalFunction(terms, modValue);
      if (rationalFuncResult.error) {
        setError(rationalFuncResult.error);
      } else {
        setRationalFunction(rationalFuncResult);
        const extended = extendSequenceFromLinearRecurrence([], rationalFuncResult.Q, terms, n, modValue);
        setOgfExtendedSequence(extended.map((val, i) => `${i}: ${val}`).join('\n'));
      }

      // Polynomial Recurrence Part
      const polyResult = analyzePolynomialRecurrence(n, terms, d, modValue);
      setPolynomialRecurrenceResult(polyResult);
      if (polyResult.error) {
        setPolynomialRecurrenceError(polyResult.error);
      } else {
        setPolynomialRecurrenceError('');
      }

      // Algebraic Recurrence Part
      const algResult = analyzeAlgebraicRecurrence(n, terms, d, modValue);
      setAlgebraicRecurrenceResult(algResult);
      if (algResult.error) {
        setAlgebraicRecurrenceError(algResult.error);
      }
      else {
        setAlgebraicRecurrenceError('');
      }

      // Algebraic Differential Equation Part
      try {
        const adeqResult: AlgebraicDifferentialEquationSolution | null = findAlgebraicDifferentialEquation(terms, d, modValue, factorial);
        if (adeqResult) {
          const extended = extendSequenceFromAlgebraicDifferentialEquation(adeqResult.v, adeqResult.partition, terms, n, modValue, factorial);
          setAlgebraicDifferentialEquationResult({
            equation: generateAlgebraicDifferentialEquationString(adeqResult, modValue),
            sequence: extended.map((val, i) => `${i}: ${val}`).join('\n'),
          });
        } else {
          setAlgebraicDifferentialEquationResult(null);
          setAlgebraicDifferentialEquationError('Error: Could not find algebraic differential equation.');
        }
      } catch (e: any) {
        setAlgebraicDifferentialEquationError('Error: ' + e.message);
      }
      // EGF Algebraic Differential Equation of EGF Part
      try {
        const egfTerms = transformToEGF(terms, modValue, factorial);
        const egfAdeqResult: AlgebraicDifferentialEquationSolution | null = findAlgebraicDifferentialEquation(egfTerms, d, modValue, factorial);
        if (egfAdeqResult) {
          const extended = extendSequenceFromAlgebraicDifferentialEquation(egfAdeqResult.v, egfAdeqResult.partition, egfTerms, n, modValue, factorial);
          const ogfExtended = extended.map((val, i) => (val * factorial[i]) % modValue);
          setEgfAlgebraicDifferentialEquationResult({
            equation: generateAlgebraicDifferentialEquationString(egfAdeqResult, modValue),
            sequence: ogfExtended.map((val, i) => `${i}: ${val}`).join('\n'),
          });
        } else {
          setEgfAlgebraicDifferentialEquationResult(null);
          setEgfAlgebraicDifferentialEquationError('Error: Could not find algebraic differential equation for EGF.');
        }
      } catch (e: any) {
        setEgfAlgebraicDifferentialEquationError('Error: ' + e.message);
      }
    } catch (e: any) {
      setError('An unexpected error occurred: ' + e.message);
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
    handleFindAll,
    mod, setMod
  };
};
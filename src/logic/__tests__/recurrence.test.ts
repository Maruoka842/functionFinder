import { modPow, modInv, mulPoly, extendSequenceFromLinearRecurrence, findRationalFunction, mod, transformToEGF } from '../recurrence';

describe('modPow', () => {
  test('2^3 % mod should be 8 % mod', () => {
    expect(modPow(2, 3)).toBe(8 % mod);
  });

  test('any number to the power of 0 should be 1', () => {
    expect(modPow(123, 0)).toBe(1);
  });
});

describe('modInv', () => {
  test('inverse of 2 mod 1000003 should be 500002', () => {
    expect(modInv(2)).toBe(500002);
  });
});

describe('mulPoly', () => {
  test('should multiply two polynomials correctly', () => {
    const a = [1, 2]; // 1 + 2x
    const b = [3, 4]; // 3 + 4x
    const result = mulPoly(a, b); // 3 + 4x + 6x + 8x^2 = 3 + 10x + 8x^2
    expect(result).toEqual([3, 10, 8]);
  });

  test('should handle empty polynomials', () => {
    const a: number[] = [];
    const b = [1, 2];
    const result = mulPoly(a, b);
    expect(result).toEqual([]);
  });

  test('should handle zero polynomials', () => {
    const a = [0];
    const b = [1, 2];
    const result = mulPoly(a, b);
    expect(result).toEqual([0, 0]); // Corrected expectation
  });
});

describe('extendSequenceFromLinearRecurrence', () => {
  test('should extend a sequence from a linear recurrence', () => {
    // Fibonacci sequence: a_n = a_{n-1} + a_{n-2}
    // Q = [1, -1, -1] (from 1 - x - x^2)
    const P: number[] = [];
    const Q = [1, mod - 1, mod - 1]; // 1 - x - x^2 mod mod
    const initial_terms = [1, 1];
    const n = 5;
    const extended = extendSequenceFromLinearRecurrence(P, Q, initial_terms, n);
    expect(extended).toEqual([1, 1, 2, 3, 5, 8]); // Corrected expectation
  });
});

describe('findRationalFunction', () => {
  test('should find rational function for Fibonacci sequence', () => {
    const terms = [1, 1, 2, 3, 5, 8];
    const result = findRationalFunction(terms);
    expect(result.P_latex).toBe("1");
    expect(result.Q_latex).toBe("1 - x - x^{2}");
  });

  test('should return error for invalid input (isNaN)', () => {
    const terms = [1, NaN, 2, 3];
    const result = findRationalFunction(terms);
    expect(result.error).toBe("Invalid input: Please enter a comma-separated list of numbers.");
  });

  test('should return error for insufficient terms', () => {
    const terms = [1, 2, 3];
    const result = findRationalFunction(terms);
    expect(result.error).toBe("Invalid input: Please enter at least 4 non-zero terms after leading zeros.");
  });

  test('should handle sequences starting with zeros', () => {
    const terms = [0, 0, 1, 1, 2, 3, 5, 8];
    const result = findRationalFunction(terms);
    expect(result.P_latex).toBe("x^{2}(1)");
    expect(result.Q_latex).toBe("1 - x - x^{2}");
  });

  test('should handle all zero sequence', () => {
    const terms = [0, 0, 0, 0];
    const result = findRationalFunction(terms);
    expect(result.P_latex).toBe("0");
    expect(result.Q_latex).toBe("1");
  });
});

describe('transformToEGF', () => {
  test('should transform sequence to EGF correctly', () => {
    const terms = [1, 1, 2, 6]; // 0!, 1!, 2!, 3!
    const expectedEGF = [1, 1, 1, 1]; // 1/0!, 1/1!, 2/2!, 6/3!
    const result = transformToEGF(terms);
    expect(result).toEqual(expectedEGF);
  });

  test('should handle empty sequence', () => {
    const terms: number[] = [];
    const result = transformToEGF(terms);
    expect(result).toEqual([]);
  });
});

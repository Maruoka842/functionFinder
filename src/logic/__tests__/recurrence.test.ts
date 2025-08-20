import { modPow, modInv, mulPoly, extendSequenceFromLinearRecurrence, findRationalFunction, mod, transformToEGF } from '../recurrence';

describe('modPow', () => {
  test('2^3 % mod should be 8 % mod', () => {
    expect(modPow(2n, 3n)).toBe(8n % mod);
  });

  test('any number to the power of 0 should be 1', () => {
    expect(modPow(123n, 0n)).toBe(1n);
  });
});

describe('modInv', () => {
  test('inverse of 2 mod 1000003 should be 500002', () => {
    expect(modInv(2n)).toBe(500002n);
  });
});

describe('mulPoly', () => {
  test('should multiply two polynomials correctly', () => {
    const a = [1n, 2n]; // 1 + 2x
    const b = [3n, 4n]; // 3 + 4x
    const result = mulPoly(a, b); // 3 + 4x + 6x + 8x^2 = 3 + 10x + 8x^2
    expect(result).toEqual([3n, 10n, 8n]);
  });

  test('should handle empty polynomials', () => {
    const a: bigint[] = [];
    const b = [1n, 2n];
    const result = mulPoly(a, b);
    expect(result).toEqual([]);
  });

  test('should handle zero polynomials', () => {
    const a = [0n];
    const b = [1n, 2n];
    const result = mulPoly(a, b);
    expect(result).toEqual([0n, 0n]); // Corrected expectation
  });
});

describe('extendSequenceFromLinearRecurrence', () => {
  test('should extend a sequence from a linear recurrence', () => {
    // Fibonacci sequence: a_n = a_{n-1} + a_{n-2}
    // Q = [1, -1, -1] (from 1 - x - x^2)
    const P: bigint[] = [];
    const Q = [1n, mod - 1n, mod - 1n]; // 1 - x - x^2 mod mod
    const initial_terms = [1n, 1n];
    const n = 5;
    const extended = extendSequenceFromLinearRecurrence(P, Q, initial_terms, n);
    expect(extended).toEqual([1n, 1n, 2n, 3n, 5n, 8n]); // Corrected expectation
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
    const terms = [1n, 1n, 2n, 6n]; // 0!, 1!, 2!, 3!
    const expectedEGF = [1n, 1n, 1n, 1n]; // 1/0!, 1/1!, 2/2!, 6/3!
    const result = transformToEGF(terms);
    expect(result).toEqual(expectedEGF);
  });

  test('should handle empty sequence', () => {
    const terms: bigint[] = [];
    const result = transformToEGF(terms);
    expect(result).toEqual([]);
  });
});

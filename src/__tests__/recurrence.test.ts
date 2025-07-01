import { modPow, modInv } from '../recurrence';

describe('modPow', () => {
  test('2^3 % mod should be 8 % mod', () => {
    expect(modPow(2, 3)).toBe(8 % 1000003);
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

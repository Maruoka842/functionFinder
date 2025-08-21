export function getFactorialArray(max: number, mod: bigint): bigint[] {
  const fact: bigint[] = Array(max).fill(1n);
  for (let i = 1; i < max; i++) {
    fact[i] = (fact[i - 1] * BigInt(i)) % mod;
  }
  return fact;
}

export function modPow(a: bigint, n: bigint, mod: bigint): bigint {
  let res = 1n;
  a %= mod;
  while (n > 0) {
    if (n % 2n === 1n) res = (res * a) % mod;
    a = (a * a) % mod;
    n /= 2n;
  }
  return res;
}

export function modInv(a: bigint, mod: bigint): bigint {
  return modPow(a, mod - 2n, mod);
}

function comb(n: bigint, k: bigint, mod: bigint, factorial: bigint[]): bigint {
  if (k < 0 || k > n) return 0n;
  const num = factorial[Number(n)];
  const den = (factorial[Number(k)] * factorial[Number(n - k)]) % mod;
  return (num * modInv(den, mod)) % mod;
}

function normalizeCoefficients(coeffs: bigint[][], mod: bigint): bigint[][] {
  let normalizer = 1n;
  let ABS = mod;
  for (let a = 1n; a < 100n; ++a) {
    let nABS = 0n;
    for (let i = 0; i < coeffs.length; ++i) {
      for (let j = 0; j < coeffs[i].length; ++j) {
        let np = (coeffs[i][j] * a) % mod;
        if (np < 0) np += mod;
        nABS = nABS > (np < mod - np ? np : mod - np) ? nABS : (np < mod - np ? np : mod - np);
      }
    }
    if (nABS < ABS) {
      ABS = nABS;
      normalizer = a;
    }
  }
  for (let i = 0; i < coeffs.length; ++i) {
    for (let j = 0; j < coeffs[i].length; ++j) {
      coeffs[i][j] = (coeffs[i][j] * normalizer) % mod;
    }
  }
  return coeffs;
}

function findPolynomialRecurrence(terms: bigint[], deg: number, mod: bigint) {
  const n = terms.length;
  const B = Math.floor((n + 2) / (deg + 2));
  const C = B * (deg + 1);
  const R = n - (B - 1);

  if (B < 2 || R < C - 1) {
    throw new Error("Could not find polynomial recurrence.");
  }

  let mat: bigint[][] = Array.from({ length: R }, () => Array(C).fill(0n));
  for (let y = 0; y < R; ++y) {
    for (let b = 0; b < B; ++b) {
      let v = ((terms[y + b] % mod) + mod) % mod;
      for (let d = 0; d <= deg; ++d) {
        mat[y][b * (deg + 1) + d] = v;
        v = (v * BigInt(y + b)) % mod;
      }
    }
  }

  let rank = 0;
  const invCache = new Map<bigint, bigint>();
  const getInv = (val: bigint) => {
    if (!invCache.has(val)) {
      invCache.set(val, modInv(val, mod));
    }
    return invCache.get(val)!;
  };

  for (let x = 0; x < C; ++x) {
    let pivot = -1;
    for (let y = rank; y < R; ++y) {
      if (mat[y][x] !== 0n) {
        pivot = y;
        break;
      }
    }
    if (pivot === -1) break;

    if (pivot !== rank) {
      [mat[rank], mat[pivot]] = [mat[pivot], mat[rank]];
    }

    const inv = getInv(mat[rank][x]);
    for (let x2 = x; x2 < C; ++x2) {
      mat[rank][x2] = (mat[rank][x2] * inv) % mod;
    }

    for (let y = rank + 1; y < R; ++y) {
      if (mat[y][x] === 0n) continue;
      const coeff = mod - mat[y][x];
      for (let x2 = x; x2 < C; ++x2) {
        mat[y][x2] = (mat[y][x2] + coeff * mat[rank][x2]) % mod;
      }
    }

    ++rank;
  }
  if (rank === C) {
    throw new Error("Could not find polynomial recurrence.");
  }

  for (let y = rank - 1; y >= 0; --y) {
    if (mat[y][rank] === 0n) continue;
    if (mat[y][y] !== 1n) throw new Error("mat[y][y] must be 1");
    const c = (mod - mat[y][rank]) % mod;
    for (let y2 = 0; y2 < y; ++y2) {
      mat[y2][rank] = (mat[y2][rank] + c * mat[y2][y]) % mod;
    }
  }

  const order = Math.floor(rank / (deg + 1));
  const ret: bigint[][] = Array.from({ length: order + 1 }, () => Array(deg + 1).fill(0n));
  ret[0][rank % (deg + 1)] = 1n;

  for (let y = rank - 1; y >= 0; --y) {
    const k = order - Math.floor(y / (deg + 1));
    const d = y % (deg + 1);
    ret[k][d] = (mod - mat[y][rank]) % mod;
  }

  normalizeCoefficients(ret, mod);

  return {
    coeffs: ret,
    order,
    deg,
    last: n - 1,
    nonTrivialTerms: (n - ((deg + 2) * (order + 1) - 2))
  };
}

export function transformToEGF(terms: bigint[], mod: bigint, factorial: bigint[]): bigint[] {
  const egfTerms: bigint[] = [];
  for (let i = 0; i < terms.length; i++) {
    if (factorial[i] === 0n) {
      throw new Error("Factorial is zero modulo mod, cannot compute EGF term.");
    }
    const invFactorial = modInv(factorial[i], mod);
    egfTerms.push((terms[i] * invFactorial) % mod);
  }
  return egfTerms;
}

export function findAlgebraicDifferentialEquation(sequence: bigint[], K: number, mod: bigint) {
  let N = sequence.length;
  let deg = 0;
  const factorial = getFactorialArray(N + K + 2, mod);

  while (comb(BigInt(deg + 1 + K), BigInt(deg + 1), mod, factorial) <= BigInt(N - Math.max(0, K - 2))) {
    deg++;
  }
  if (deg === 0) {
    return null;
  }

  const partition: bigint[][] = [];
  dfs(partition, Array(deg).fill(0n), 0, BigInt(K), mod);

  const basis = partition.map(p => {
    let poly: bigint[] = [1n];
    for (const j of p) {
      if (j === 0n) continue;
      else if (j === 1n) poly = mulPoly(poly, [0n, 1n], mod);
      else poly = mulPoly(poly, differentiate(sequence, j - 2n, mod), mod);
      poly = poly.slice(0, N);
    }
    const paddedPoly = [...poly, ...Array(N - poly.length).fill(0n)];
    return paddedPoly;
  });

  N -= Math.max(0, K - 2);
  const mat: bigint[][] = Array.from({ length: N }, (_, i) =>
    basis.map((b) => b[i] ?? 0n)
  );

  const invCache = new Map<bigint, bigint>();
  const getInv = (val: bigint) => {
    if (!invCache.has(val)) {
      invCache.set(val, modInv(val, mod));
    }
    return invCache.get(val)!;
  };

  const used: boolean[] = Array(N).fill(false);
  for (let i = 0; i < mat[0].length; i++) {
    let pivot = 0;
    while (pivot < mat.length && (used[pivot] || mat[pivot][i] === 0n))
      pivot++;
    if (pivot === mat.length) {
      continue;
    }
    used[pivot] = true;

    for (let np = 0; np < mat.length; np++) {
      if (np !== pivot && mat[np][i] !== 0n) {
        const c = (mat[np][i] * getInv(mat[pivot][i])) % mod;
        for (let j = 0; j < mat[np].length; j++) {
          mat[np][j] = (mat[np][j] - (mat[pivot][j] * c) % mod + mod) % mod;
        }
      }
    }
  }

  for (let i = 0; i < mat[0].length; i++) {
    let found = false;
    for (let j = 0; j < mat.length; j++) {
      if (mat[j][i] !== 0n) {
        let ni = i - 1;
        while (ni >= 0 && mat[j][ni] === 0n) ni--;
        if (ni >= 0) found = true;
      }
    }
    if (!found) continue;

    const v: bigint[] = Array(basis.length).fill(0n);
    v[i] = 1n;
    for (let j = 0; j < mat.length; j++) {
      if (mat[j][i] !== 0n) {
        let ni = 0;
        while (mat[j][ni] === 0n) ni++;
        v[ni] = (-mat[j][i] * getInv(mat[j][ni]) % mod + mod) % mod;
      }
    }
    normalizeCoefficients([v], mod);
    return { partition, v };
  }

  return null;
}


function dfs(partition: bigint[][], cur: bigint[], id: number, K: bigint, mod: bigint) {
  if (id === cur.length) {
    partition.push([...cur]);
    return;
  }
  for (let i = id === 0 ? 0n : cur[id - 1]; i <= K; i++) {
    cur[id] = i;
    dfs(partition, cur, id + 1, K, mod);
  }
}


function differentiate(a: bigint[], k: bigint, mod: bigint): bigint[] {
  let df = [...a];
  for (let t = 0n; t < k; t++) {
    const next: bigint[] = new Array(df.length).fill(0n);
    for (let i = 0; i + 1 < df.length; i++) {
      next[i] = (df[i + 1] * BigInt(i + 1)) % mod;
    }
    df = next;
  }
  return df;
}


function extendSequenceFromPolynomialRecurrence(n: number, coeffs: bigint[][], terms: bigint[], mod: bigint): bigint[] {
  let ret: bigint[] = new Array(Math.max(n + 1, terms.length)).fill(0n);
  for (let i = 0; i < terms.length; i++) ret[i] = terms[i];

  const order = coeffs.length - 1;
  if (order < 0) return ret;
  const deg = coeffs[0].length - 1;

  if (terms.length < order) {
    throw new Error("Not enough terms provided for the given order.");
  }

  for (let m = terms.length; m <= n; ++m) {
    let s = 0n;
    for (let i = 1; i <= order; ++i) {
      const k = m - i;
      let t = ret[k];
      for (let d = 0; d <= deg; ++d) {
        s = (s + t * coeffs[i][d]) % mod;
        t = (t * BigInt(k)) % mod;
      }
    }

    let denom = 0n;
    let mpow = 1n;
    for (let d = 0; d <= deg; ++d) {
      denom = (denom + mpow * coeffs[0][d]) % mod;
      mpow = (mpow * BigInt(m)) % mod;
    }

    ret[m] = (mod - s) * modInv((denom + mod) % mod, mod) % mod;
    if (ret[m] < 0) ret[m] += mod;
  }
  return ret;
}

export function analyzePolynomialRecurrence(n: number, terms: bigint[], degree: number, mod: bigint) {
  if (terms.length === 0) {
    return { error: "Extended Sequence:\n(No input terms)" };
  }
  try {
    const relation = findPolynomialRecurrence(terms, degree, mod);
    const { coeffs, order, deg, last, nonTrivialTerms } = relation;
    const extended_terms = extendSequenceFromPolynomialRecurrence(n, coeffs, terms, mod);

    let info_string = `verified up to a[${last}] (number of non-trivial terms: ${nonTrivialTerms})\n`;

    let result_string = `Extended Sequence:\n`;
    for (let i = 0; i < extended_terms.length; ++i) {
      let val = extended_terms[i];
      result_string += `${i}: ${val.toString()}\n`;
    }

    return {
      info: info_string,
      polynomialRecurrenceEquation: generatePolynomialRecurrenceEquationString(coeffs, order, deg, mod),
      sequence: result_string
    };
  } catch (e: any) {
    return { error: 'Error: ' + e.message };
  }
}


function generatePolynomialRecurrenceEquationString(coeffs: bigint[][], order: number, deg: number, mod: bigint): string {
  const factorial = getFactorialArray(deg + 1, mod);
  const w: bigint[][] = Array.from({ length: order + 1 }, () => Array(deg + 1).fill(0n));
  for (let i = 0; i <= order; i++) {
    for (let d = 0; d <= deg; d++) {
      const c = coeffs[i][d];
      if (c === 0n) continue;
      for (let k = 0; k <= d; k++) {
        const sign = ((d - k) % 2 === 0) ? 1n : mod - 1n;
        const power = modPow(BigInt(i), BigInt(d - k), mod);
        const term = comb(BigInt(d), BigInt(k), mod, factorial) * sign % mod * power % mod;
        w[i][k] = (w[i][k] + (c * term % mod)) % mod;
      }
    }
  }

  let equation_parts: string[] = [];
  for (let i = 0; i <= order; i++) {
    let poly_parts: string[] = [];
    for (let d = deg; d >= 0; d--) {
      let val = w[i][d];
      if (val === 0n) continue;
      if (val > mod / 2n) val -= mod;
      if (val === 0n) continue;

      let term_str = "";
      const is_negative = val < 0n;
      const abs_val = val > 0 ? val : -val;

      term_str = is_negative ? " - " : " + ";

      if (abs_val !== 1n || d === 0) {
        term_str += abs_val.toString();
        if (d > 0) term_str += " ";
      }

      if (d > 0) {
        term_str += (d === 1) ? "n" : `n^{${d}}`;
      }
      poly_parts.push(term_str);
    }

    if (poly_parts.length > 0) {
      let poly_str = poly_parts.join("").trim();
      if (poly_str.startsWith('+')) {
        poly_str = poly_str.substring(1).trim();
      }
      else if (poly_str.startsWith('-')) {
        poly_str = "-" + poly_str.substring(1).trim();
      }

      const term_name = (i === 0) ? "a_n" : `a_{n-${i}}`;
      let final_term_str = "";

      if (poly_str === "1") {
        final_term_str = term_name;
      } else if (poly_str === "-1") {
        final_term_str = `-${term_name}`;
      } else {
        if (poly_parts.length > 1) {
          poly_str = `(${poly_str})`;
        }
        final_term_str = `${poly_str} ${term_name}`;
      }
      equation_parts.push(final_term_str);
    }
  }

  let final_equation = "";
  for (let i = 0; i < equation_parts.length; i++) {
    const part = equation_parts[i];
    if (i === 0) {
      final_equation = part;
    } else {
      if (part.startsWith('-')) {
        final_equation += ` - ${part.substring(1)}`;
      } else {
        final_equation += ` + ${part}`;
      }
    }
  }
  return final_equation + " = 0";
}


export function analyzeAlgebraicRecurrence(n: number, terms: bigint[], degree: number, mod: bigint) {
  if (terms.length === 0) {
    return { error: "Algebraic Recurrence:\n(No input terms)" };
  }
  try {
    const algebraic_relation_coeffs = findAlgebraicEquation(terms, degree, mod);
    const algebraicRecurrenceEquation = generateAlgebraicRecurrenceEquationString(algebraic_relation_coeffs, degree, mod);
    const extended_terms = extendSequenceFromAlgebraicRecurrence(algebraic_relation_coeffs, terms, n, mod);

    let result_string = `Extended Sequence:\n`;
    for (let i = 0; i < extended_terms.length; ++i) {
      let val = extended_terms[i];
      result_string += `${i}: ${val.toString()}\n`;
    }

    return {
      algebraicRecurrenceEquation: algebraicRecurrenceEquation,
      sequence: result_string
    };
  } catch (e: any) {
    return { error: 'Error: ' + e.message };
  }
}

export function generateAlgebraicRecurrenceEquationString(coeffs: bigint[][], deg: number, mod: bigint): string {
  const poly_strings: string[] = [];
  for (let i = 0; i < coeffs.length; i++) {
    const terms: { sign: string; term: string }[] = [];
    for (let j = 0; j <= deg; j++) {
      let val = coeffs[i][j];
      if (val === 0n) continue;
      if (val > mod / 2n) val -= mod;
      if (val === 0n) continue;

      const sign = val < 0n ? " - " : " + ";
      const abs_val = val > 0 ? val : -val;

      let term = "";
      if (abs_val !== 1n || j === 0) {
        term += abs_val.toString();
      }
      if (j > 0) {
        term += (j === 1) ? "x" : `x^{${j}}`;
      }
      terms.push({ sign, term });
    }

    if (terms.length > 0) {
      let poly = "";
      for (let k = 0; k < terms.length; k++) {
        if (k > 0) poly += terms[k].sign;
        else poly += (terms[k].sign == " - " ? "-" : "");
        poly += terms[k].term;
      }

      if (poly === "1" && i > 0) {
        poly = "";
      } else if (poly === "-1" && i > 0) {
        poly = "-";
      } else if (terms.length > 1) {
        poly = `(${poly})`;
      }

      if (i > 0) {
        poly += (i === 1) ? "f" : `f^{${i}}`;
      }
      poly_strings.push(poly);
    }
  }

  if (poly_strings.length === 0) return "0 = 0";

  return poly_strings.join(" + ").replace(/\+ -/g, ' - ') + " = 0";
}

export function findAlgebraicEquation(sequence: bigint[], D: number, mod: bigint): bigint[][] {
  const N = sequence.length;
  const K = Math.min(Math.floor(N / (D + 1)), N);
  if (K <= 1) {
    throw new Error("Could not find algebraic recurrence");
  }

  const A: bigint[][] = Array.from({ length: K }, () => Array(N).fill(0n));
  A[0][0] = 1n;
  for (let i = 0; i + 1 < K; ++i) {
    A[i + 1] = mulPoly(A[i], sequence, mod).slice(0, N);
  }

  const mat: bigint[][] = Array.from({ length: N }, () => Array(K * (D + 1)).fill(0n));
  for (let i = 0; i < K; ++i) {
    for (let j = 0; j < N; ++j) {
      for (let k = 0; k <= Math.min(D, j); ++k) {
        mat[j][(D + 1) * i + k] = A[i][j - k];
      }
    }
  }

  const invCache = new Map<bigint, bigint>();
  const getInv = (val: bigint) => {
    if (!invCache.has(val)) {
      invCache.set(val, modInv(val, mod));
    }
    return invCache.get(val)!;
  };

  const used: boolean[] = Array(N).fill(false);
  for (let i = 0; i < mat[0].length; ++i) {
    let pivot = 0;
    while (pivot < mat.length && (used[pivot] || mat[pivot][i] === 0n)) ++pivot;
    if (pivot === mat.length) continue;
    used[pivot] = true;
    for (let npivot = 0; npivot < mat.length; ++npivot) {
      if (mat[npivot][i] !== 0n && npivot !== pivot) {
        const c = (mat[npivot][i] * getInv(mat[pivot][i])) % mod;
        for (let j = 0; j < mat[npivot].length; ++j) {
          mat[npivot][j] = (mat[npivot][j] - (mat[pivot][j] * c) % mod + mod) % mod;
        }
      }
    }
  }
  for (let i = 0; i < mat[0].length; ++i) {
    let found = false;
    for (let j = 0; j < N; ++j) {
      if (mat[j][i] !== 0n) {
        let ni = i - 1;
        while (ni >= 0 && mat[j][ni] === 0n) --ni;
        if (ni >= 0) found = true;
      }
    }
    if (!found) continue;
    const P: bigint[][] = Array.from({ length: K }, () => Array(D + 1).fill(0n));
    P[Math.floor(i / (D + 1))][i % (D + 1)] = 1n;
    for (let j = 0; j < N; ++j) {
      if (mat[j][i] !== 0n) {
        let ni = 0;
        while (mat[j][ni] === 0n) ++ni;
        P[Math.floor(ni / (D + 1))][ni % (D + 1)] = (-mat[j][i] * getInv(mat[j][ni]) % mod + mod) % mod;
      }
    }
    normalizeCoefficients(P, mod);
    return P;
  }
  throw new Error(`Could not find algebraic equation.`);

}

export function generateAlgebraicDifferentialEquationString(solution: { partition: bigint[][]; v: bigint[] }, mod: bigint): string {
  const polyByFProduct = new Map<string, bigint[]>();

  for (let i = 0; i < solution.partition.length; i++) {
    let coef = solution.v[i];
    if (coef === 0n) continue;

    if (coef > mod / 2n) {
      coef -= mod;
    }

    const p = solution.partition[i];
    let xPower = 0;
    const fDerivativeOrders: bigint[] = [];

    for (const j of p) {
      if (j === 1n) {
        xPower++;
      } else if (j >= 2n) {
        fDerivativeOrders.push(j - 2n);
      }
    }
    fDerivativeOrders.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    let fProductKey = "";
    if (fDerivativeOrders.length === 0) {
      fProductKey = "1";
    } else {
      const counts = new Map<bigint, number>();
      for (const order of fDerivativeOrders) {
        counts.set(order, (counts.get(order) || 0) + 1);
      }

      const parts: string[] = [];
      for (const order of Array.from(counts.keys()).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))) {
        const count = counts.get(order)!;
        let term = "";
        if (order === 0n) {
          term = "f";
        } else {
          term = `f^{(${order.toString()})}`;
        }

        if (count > 1) {
          term = `(${term})^{${count}}`;
        }
        parts.push(term);
      }
      fProductKey = parts.join("");
    }

    let currentPoly = polyByFProduct.get(fProductKey) || [];
    while (currentPoly.length <= xPower) {
      currentPoly.push(0n);
    }
    currentPoly[xPower] = (currentPoly[xPower] + coef) % mod;
    polyByFProduct.set(fProductKey, currentPoly);
  }

  const equationParts: string[] = [];
  const sortedFProductKeys = Array.from(polyByFProduct.keys()).sort();

  for (const fProductKey of sortedFProductKeys) {
    let polyCoeffs = polyByFProduct.get(fProductKey);
    if (!polyCoeffs) continue;
    polyCoeffs = polyCoeffs.map(c => (c > mod / 2n ? c - mod : c));

    let polyString = polyToLatex(polyCoeffs, mod);

    if (polyString === "") {
      continue;
    }

    let fTermString = fProductKey;
    if (fProductKey === "1") fTermString = "";


    let combinedTerm = "";
    if (polyString === "1" && fTermString.length != 0) {
      combinedTerm = fTermString;
    } else if (polyString === "-1" && fTermString.length != 0) {
      combinedTerm = `-${fTermString}`;
    } else {
      if (polyString.substring(1).includes(" + ") || polyString.substring(1).includes(" - ")) {
        combinedTerm = `(${polyString})${fTermString}`;
      } else {
        combinedTerm = `${polyString}${fTermString}`;
      }
    }
    equationParts.push(combinedTerm);
  }

  let finalEquation = equationParts.join(" + ").replace(/\+ -/g, ' - ');
  if (finalEquation.startsWith("+ ")) {
    finalEquation = finalEquation.substring(2);
  }

  if (finalEquation.length === 0) finalEquation = "0";
  finalEquation += " = 0";
  return finalEquation;
};


export const polyToLatex = (coeffs: bigint[], mod: bigint): string => {
  const terms = coeffs
    .map((c, i) => {
      if (c === 0n) return null;
      let val = c > 0 ? c : -c;

      let termString: string;
      if (i === 0) {
        termString = `${val.toString()}`;
      } else if (i === 1) {
        termString = val === 1n ? 'x' : `${val.toString()}x`;
      } else {
        termString = val === 1n ? `x^{${i}}` : `${val.toString()}x^{${i}}`;
      }

      const sign = c < 0n ? '-' : '+';
      return { sign, termString };
    })
    .filter((t): t is { sign: string; termString: string } => t !== null);

  if (terms.length === 0) {
    return "";
  }

  let result = "";
  for (let i = 0; i < terms.length; i++) {
    const term = terms[i];
    if (i === 0) {
      if (term.sign === '-') {
        result += '-';
      }
      result += term.termString;
    } else {
      result += ` ${term.sign} ${term.termString}`;
    }
  }

  return result;
};

export const findRationalFunction = (terms: bigint[], mod: bigint) => {
  if (terms.length === 0) {
    return { error: "Invalid input: Sequence cannot be empty." };
  }

  let w = 0;
  let currentTerms = [...terms];
  while (currentTerms.length > 0 && currentTerms[0] === 0n) {
    w++;
    currentTerms.shift();
  }

  if (currentTerms.length === 0) {
    return { P: [0n], Q: [1n], P_latex: "0", Q_latex: "1" };
  }

  if (currentTerms.length < 4) {
    return { error: "Invalid input: Please enter at least 4 non-zero terms after leading zeros." };
  }

  const N = Math.floor(currentTerms.length / 2);
  const size = 2 * N + 1;
  let A0: bigint[] = new Array(size).fill(0n);
  let B0: bigint[] = new Array(size).fill(0n);
  let A1: bigint[] = new Array(size).fill(0n);
  let B1: bigint[] = new Array(size).fill(0n);

  A0[2 * N] = 1n;
  for (let i = 0; i < 2 * N; i++) A1[i] = currentTerms[i];
  B1[0] = 1n;
  let deg = 2 * N - 1;

  const invCache = new Map<bigint, bigint>();
  const getInv = (val: bigint) => {
    if (!invCache.has(val)) {
      invCache.set(val, modInv(val, mod));
    }
    return invCache.get(val)!;
  };

  while (deg > N) {
    if (A1[deg] === 0n) {
      deg--;
      continue;
    }
    for (let i = size - 1; i >= deg; i--) {
      if (A0[i] !== 0n) {
        const q = (A0[i] * getInv(A1[deg])) % mod;
        for (let j = 0; i - deg + j < 2 * N + 1; j++) {
          A0[i - deg + j] = (A0[i - deg + j] - A1[j] * q) % mod;
          B0[i - deg + j] = (B0[i - deg + j] - B1[j] * q) % mod;
        }
      }
    }
    [A0, A1] = [A1, [...A0]];
    [B0, B1] = [B1, [...B0]];
  }

  const invConst = getInv(B1[0]);
  for (let i = 0; i < size; i++) {
    B1[i] = (B1[i] * invConst) % mod;
    A1[i] = (A1[i] * invConst) % mod;
  }
  for (let i = 0; i < size; i++) {
    B1[i] = (B1[i] + mod) % mod;
    A1[i] = (A1[i] + mod) % mod;
  }
  for (let i = 0; i < size; i++) {
    if (B1[i] > mod / 2n) B1[i] -= mod;
    if (A1[i] > mod / 2n) A1[i] -= mod;
  }
  A1.length = N;
  B1.length = N + 1;

  let P_latex = polyToLatex(A1, mod);
  if (w > 0) {
    const pStr = P_latex === "1" ? "" : `(${P_latex})`;
    P_latex = (w === 1) ? `x${pStr}` : `x^{${w}}${pStr}`;
  }
  if (P_latex === "") P_latex = "0";

  return { P: A1, Q: B1, P_latex: P_latex, Q_latex: polyToLatex(B1, mod) };
};

export function mulPoly(a: bigint[], b: bigint[], mod: bigint): bigint[] {
  if (a.length === 0 || b.length === 0) return [];
  const n = a.length, m = b.length;
  const res: bigint[] = new Array(n + m - 1).fill(0n);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      res[i + j] = (res[i + j] + a[i] * b[j]) % mod;
    }
  }
  return res;
}


export const extendSequenceFromLinearRecurrence = (P: bigint[], Q: bigint[], initial_terms: bigint[], n: number, mod: bigint): bigint[] => {
  const a: bigint[] = [...initial_terms];
  for (let i = initial_terms.length; i <= n; i++) {
    let next_val = 0n;
    if (i < P.length) {
      next_val = P[i];
    }
    for (let j = 1; j < Q.length; j++) {
      if (i - j >= 0) {
        next_val = (next_val - Q[j] * a[i - j]) % mod;
      }
    }
    a.push((next_val + mod) % mod);
  }
  return a;
};

function mul2(a: bigint[][], b: bigint[][], mod: bigint): bigint[][] {
  const c: bigint[][] = Array(a.length + b.length - 1).fill(null).map(() => [0n, 0n]);
  for (let i = 0; i < a.length; ++i) {
    for (let j = 0; j < 2; ++j) {
      for (let k = 0; k < b.length; ++k) {
        for (let l = 0; l < 2; ++l) {
          if (j + l < 2) {
            c[i + k][j + l] = (c[i + k][j + l] + a[i][j] * b[k][l]) % mod;
          }
        }
      }
    }
  }
  return c;
}

function extendSequenceFromAlgebraicRecurrence(coeffs: bigint[][], terms: bigint[], n: number, mod: bigint): bigint[] {
  let extendedTerms: bigint[] = terms.slice();
  const invCache = new Map<bigint, bigint>();
  const getInv = (val: bigint) => {
    if (!invCache.has(val)) {
      invCache.set(val, modInv(val, mod));
    }
    return invCache.get(val)!;
  };

  for (let i = terms.length; i <= n; ++i) {
    const extendedTerms2: bigint[][] = Array(i + 1).fill(null).map(() => [0n, 0n]);
    for (let j = 0; j < i; ++j) {
      extendedTerms2[j][0] = extendedTerms[j];
    }
    extendedTerms2[i][1] = 1n;

    let g: bigint[][] = Array(i + 1).fill(null).map(() => [0n, 0n]);
    let power: bigint[][] = Array(i + 1).fill(null).map(() => [0n, 0n]);
    power[0][0] = 1n;

    for (let j = 0; j < coeffs.length; ++j) {
      for (let k = 0; k < coeffs[j].length; ++k) {
        let h: bigint[][] = Array(i + 1).fill(null).map(() => [0n, 0n]);
        h[k][0] = coeffs[j][k];
        h = mul2(h, power, mod);
        for (let l = 0; l < g.length; ++l) {
          g[l][0] = (g[l][0] + h[l][0]) % mod;
          g[l][1] = (g[l][1] + h[l][1]) % mod;
        }
      }
      power = mul2(power, extendedTerms2, mod).slice(0, i + 1);
    }

    let id = 0;
    while (id < g.length && g[id][1] === 0n) id++;
    if (id === g.length) throw new Error("The relation can not determine the sequence uniquely.");
    extendedTerms[i] = (mod - getInv(g[id][1]) * g[id][0] % mod) % mod;
  }
  return extendedTerms;
}


export function extendSequenceFromAlgebraicDifferentialEquation(v: bigint[], partition: bigint[][], terms: bigint[], n: number, mod: bigint, factorial: bigint[]): bigint[] {
  let extendedTerms: bigint[] = [...terms];
  const invCache = new Map<bigint, bigint>();
  const getInv = (val: bigint) => {
    if (!invCache.has(val)) {
      invCache.set(val, modInv(val, mod));
    }
    return invCache.get(val)!;
  };

  for (let i = terms.length; i <= n; i++) {
    const basis = partition.map(p => {
      let poly: bigint[][] = [[1n, 0n]];
      for (const j of p) {
        if (j === 0n) continue;
        else if (j === 1n) poly = mul2(poly, [[0n, 0n], [1n, 0n]], mod);
        else {
          let df = differentiate(extendedTerms, j - 2n, mod);
          let df2: bigint[][] = Array(i + 1).fill(null).map(() => [0n, 0n])
          for (let k = 0; k < Math.min(df.length, i + 1); ++k) {
            df2[k][0] = df[k];
          }
          if (i - Number(j - 2n) >= 0) {
            df2[i - Number(j - 2n)][1] = (factorial[i] * getInv(factorial[i - Number(j - 2n)])) % mod;
          }
          poly = mul2(poly, df2, mod);
        }
      }
      return poly;
    });
    let g: bigint[][] = Array(i + 1).fill(null).map(() => [0n, 0n]);
    for (let j = 0; j < basis.length; ++j) {
      for (let k = 0; k < Math.min(i + 1, basis[j].length); ++k) {
        g[k][0] = (g[k][0] + v[j] * basis[j][k][0]) % mod;
        g[k][1] = (g[k][1] + v[j] * basis[j][k][1]) % mod;
      }
    }
    let id = 0;
    while (id < g.length && g[id][1] == 0n) ++id;
    if (id == g.length) {
      throw new Error("The relation can not determine the sequence uniquely.");
    }
    extendedTerms[i] = (mod - getInv(g[id][1]) * g[id][0] % mod) % mod;
  }
  return extendedTerms;
}
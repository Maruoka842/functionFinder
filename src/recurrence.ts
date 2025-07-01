export const mod: number = 1000003;

export const FACTORIAL: number[] = (() => {
  const MAX = 10000;
  const fact: number[] = Array(MAX).fill(1);
  for (let i = 1; i < MAX; i++) {
    fact[i] = fact[i - 1] * i % mod;
  }
  return fact;
})();

export function modPow(a: number, n: number): number {
  if (n === 0) return 1;
  return modPow(a * a % mod, Math.floor(n / 2)) * (n % 2 === 1 ? a : 1) % mod;
}

export function modInv(a: number): number {
  return modPow(a, mod - 2);
}

function gcd(a: number, b: number): number {
  if (a == 0) return b;
  return gcd(b % a, a);
}

function comb(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  return FACTORIAL[n] * modInv(FACTORIAL[k] * FACTORIAL[n - k] % mod) % mod;
}

function normalizeCoefficients(coeffs: number[][]): number[][] {
  let normalizer = 1;
  let ABS = mod;
  for (let a = 1; a < 100; ++a) {
    let nABS = 0;
    for (let i = 0; i < coeffs.length; ++i) {
      for (let j = 0; j < coeffs[i].length; ++j) {
        let np = coeffs[i][j] * a % mod;
        nABS = Math.max(nABS, Math.min(np, mod - np));
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

function findPolynomialRecurrence(terms: number[], deg: number) {
  const n = terms.length;
  const B = Math.floor((n + 2) / (deg + 2));
  const C = B * (deg + 1);
  const R = n - (B - 1);

  if (B < 2 || R < C - 1) {
    throw new Error("Could not find polynomial recurrence.");
  }

  let mat: number[][] = Array.from({ length: R }, () => Array(C).fill(0));
  for (let y = 0; y < R; ++y) {
    for (let b = 0; b < B; ++b) {
      let v = ((terms[y + b] % mod) + mod) % mod;
      for (let d = 0; d <= deg; ++d) {
        mat[y][b * (deg + 1) + d] = v;
        v = (v * (y + b)) % mod;
      }
    }
  }
  let rank = 0;
  for (let x = 0; x < C; ++x) {
    let pivot = -1;
    for (let y = rank; y < R; ++y) {
      if (mat[y][x] !== 0) {
        pivot = y;
        break;
      }
    }
    if (pivot === -1) break;

    if (pivot !== rank) {
      [mat[rank], mat[pivot]] = [mat[pivot], mat[rank]];
    }

    const inv = modInv(mat[rank][x]);
    for (let x2 = x; x2 < C; ++x2) {
      mat[rank][x2] = (mat[rank][x2] * inv) % mod;
    }

    for (let y = rank + 1; y < R; ++y) {
      if (mat[y][x] === 0) continue;
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
    if (mat[y][rank] === 0) continue;
    if (mat[y][y] !== 1) throw new Error("mat[y][y] must be 1");
    const c = (mod - mat[y][rank]) % mod;
    for (let y2 = 0; y2 < y; ++y2) {
      mat[y2][rank] = (mat[y2][rank] + c * mat[y2][y]) % mod;
    }
  }

  const order = Math.floor(rank / (deg + 1));
  const ret: number[][] = Array.from({ length: order + 1 }, () => Array(deg + 1).fill(0));
  ret[0][rank % (deg + 1)] = 1;

  for (let y = rank - 1; y >= 0; --y) {
    const k = order - Math.floor(y / (deg + 1));
    const d = y % (deg + 1);
    ret[k][d] = (mod - mat[y][rank]) % mod;
  }

  normalizeCoefficients(ret);

  return {
    coeffs: ret,
    order,
    deg,
    last: n - 1,
    nonTrivialTerms: (n - ((deg + 2) * (order + 1) - 2))
  };
}

export function transformToEGF(terms: number[]): number[] {
  const egfTerms: number[] = [];
  for (let i = 0; i < terms.length; i++) {
    if (FACTORIAL[i] === 0) {
      // This case should ideally not happen with mod being prime and i < mod
      // but as a safeguard against division by zero if FACTORIAL[i] somehow becomes 0 mod mod
      throw new Error("Factorial is zero modulo mod, cannot compute EGF term.");
    }
    const invFactorial = modInv(FACTORIAL[i]);
    egfTerms.push((terms[i] * invFactorial) % mod);
  }
  return egfTerms;
}

export function findAlgebraicDifferentialEquation(sequence: number[], K: number) {
  let N = sequence.length;
  let deg = 0;
  while (comb(deg + 1 + K, deg + 1) <= N - Math.max(0, K - 2)) deg++;
  if (deg === 0) {
    throw new Error("Could not find algebraic differential equation.");
  }

  const totalPartition = comb(deg + K, deg);
  const partition: number[][] = [];
  dfs(partition, Array(deg).fill(0), 0, K);

  const basis = partition.map(p => {
    let poly: number[] = [1];
    for (const j of p) {
      if (j === 0) continue;// 1
      else if (j === 1) poly = mulPoly(poly, [0, 1]); // x
      else poly = mulPoly(poly, differentiate(sequence, j - 2));// y^{(j-2)}
      poly = poly.slice(0, N);
    }
    return poly.slice(0, N);
  });

  N -= Math.max(0, K - 2);
  const mat: number[][] = Array.from({ length: N }, (_, i) =>
    basis.map(b => b[i] ?? 0)
  );

  const used: boolean[] = Array(N).fill(false);
  for (let i = 0; i < mat[0].length; i++) {
    let pivot = 0;
    while (pivot < mat.length && (used[pivot] || mat[pivot][i] === 0)) pivot++;
    if (pivot === mat.length) continue;
    used[pivot] = true;

    for (let np = 0; np < mat.length; np++) {
      if (np !== pivot && mat[np][i] !== 0) {
        const c = mat[np][i] * modInv(mat[pivot][i]) % mod;
        for (let j = 0; j < mat[np].length; j++) {
          mat[np][j] = (mat[np][j] - mat[pivot][j] * c % mod + mod) % mod;
        }
      }
    }
  }

  for (let i = 0; i < mat[0].length; i++) {
    let found = false;
    for (let j = 0; j < mat.length; j++) {
      if (mat[j][i] !== 0) {
        let ni = i - 1;
        while (ni >= 0 && mat[j][ni] === 0) ni--;
        if (ni >= 0) found = true;
      }
    }
    if (!found) continue;

    const v: number[] = Array(basis.length).fill(0);
    v[i] = 1;
    for (let j = 0; j < mat.length; j++) {
      if (mat[j][i] !== 0) {
        let ni = 0;
        while (mat[j][ni] === 0) ni++;
        v[ni] = (-mat[j][i] * modInv(mat[j][ni]) % mod + mod) % mod;
      }
    }
    normalizeCoefficients([v]);
    return { partition, v };
  }

  return null;
}


function dfs(partition: number[][], cur: number[], id: number, K: number) {
  if (id === cur.length) {
    partition.push([...cur]);
    return;
  }
  for (let i = id === 0 ? 0 : cur[id - 1]; i <= K; i++) {
    cur[id] = i;
    dfs(partition, cur, id + 1, K);
  }
}


function differentiate(a: number[], k: number = 1): number[] {
  let df = [...a];
  for (let t = 0; t < k; t++) {
    const next: number[] = new Array(df.length).fill(0);
    for (let i = 0; i + 1 < df.length; i++) {
      next[i] = df[i + 1] * (i + 1) % mod;
    }
    df = next;
  }
  return df;
}


function extendSequenceFromPolynomialRecurrence(n: number, coeffs: number[][], terms: number[]): number[] {
  let ret: number[] = new Array(Math.max(n + 1, terms.length)).fill(0);
  for (let i = 0; i < terms.length; i++) ret[i] = terms[i];

  const order = coeffs.length - 1;
  if (order < 0) return ret;
  const deg = coeffs[0].length - 1;

  if (terms.length < order) {
    throw new Error("Not enough terms provided for the given order.");
  }

  for (let m = terms.length; m <= n; ++m) {
    let s = 0;
    for (let i = 1; i <= order; ++i) {
      const k = m - i;
      let t = ret[k];
      for (let d = 0; d <= deg; ++d) {
        s = (s + t * coeffs[i][d]) % mod;
        t = (t * k) % mod;
      }
    }

    let denom = 0;
    let mpow = 1;
    for (let d = 0; d <= deg; ++d) {
      denom = (denom + mpow * coeffs[0][d]) % mod;
      mpow = (mpow * m) % mod;
    }

    ret[m] = (mod - s) * modInv((denom + mod) % mod) % mod;
    if (ret[m] < 0) ret[m] += mod;
  }
  return ret;
}

export function analyzePolynomialRecurrence(n: number, terms: number[], degree: number) {
  if (terms.length === 0) {
    return { error: "Extended Sequence:\n(No input terms)" };
  }
  try {
    const relation = findPolynomialRecurrence(terms, degree);
    const { coeffs, order, deg, last, nonTrivialTerms } = relation;
    const extended_terms = extendSequenceFromPolynomialRecurrence(n, coeffs, terms);

    let info_string = `verified up to a[${last}] (number of non-trivial terms: ${nonTrivialTerms})\n`;

    let result_string = `Extended Sequence:\n`;
    for (let i = 0; i < extended_terms.length; ++i) {
      let val = extended_terms[i];
      result_string += `${i}: ${val}\n`;
    }

    return {
      info: info_string,
      polynomialRecurrenceEquation: generatePolynomialRecurrenceEquationString(coeffs, order, deg),
      sequence: result_string
    };
  } catch (e: any) {
    return { error: 'Error: ' + e.message };
  }
}


function generatePolynomialRecurrenceEquationString(coeffs: number[][], order: number, deg: number): string {
  const w: number[][] = Array.from({ length: order + 1 }, () => Array(deg + 1).fill(0));
  for (let i = 0; i <= order; i++) {
    for (let d = 0; d <= deg; d++) {
      const c = coeffs[i][d];
      if (c === 0) continue;
      for (let k = 0; k <= d; k++) {
        const sign = ((d - k) % 2 === 0) ? 1 : mod - 1;
        const power = modPow(i, d - k);
        const term = comb(d, k) * sign % mod * power % mod;
        w[i][k] = (w[i][k] + (c * term % mod)) % mod;
      }
    }
  }

  let equation_parts: string[] = [];
  for (let i = 0; i <= order; i++) {
    let poly_parts: string[] = [];
    for (let d = deg; d >= 0; d--) {
      let val = w[i][d];
      if (val === 0) continue;
      if (val > mod / 2) val -= mod;
      if (val === 0) continue;

      let term_str = "";
      const is_negative = val < 0;
      const abs_val = Math.abs(val);

      term_str = is_negative ? " - " : " + ";

      if (abs_val !== 1 || d === 0) {
        term_str += abs_val;
        if (d > 0) term_str += " ";
      }

      if (d > 0) {
        term_str += (d === 1) ? "m" : `m^{${d}}`;
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

      const term_name = (i === 0) ? "a_m" : `a_{m-${i}}`;
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


export function analyzeAlgebraicRecurrence(n: number, terms: number[], degree: number) {
  if (terms.length === 0) {
    return { error: "Algebraic Recurrence:\n(No input terms)" };
  }
  try {
    const algebraic_relation_coeffs = findAlgebraicEquation(terms, degree);
    const algebraicRecurrenceEquation = generateAlgebraicRecurrenceEquationString(algebraic_relation_coeffs, degree);
    const extended_terms = extendSequenceFromAlgebraicRecurrence(algebraic_relation_coeffs, terms, n); // Extend by 5 terms for demonstration

    let result_string = `Extended Sequence:\n`;
    for (let i = 0; i < extended_terms.length; ++i) {
      let val = extended_terms[i];
      result_string += `${i}: ${val}\n`;
    }

    return {
      algebraicRecurrenceEquation: algebraicRecurrenceEquation,
      sequence: result_string
    };
  } catch (e: any) {
    return { error: 'Error: ' + e.message };
  }
}

export function generateAlgebraicRecurrenceEquationString(coeffs: number[][], deg: number): string {
  const poly_strings: string[] = [];
  for (let i = 0; i < coeffs.length; i++) {
    const terms: { sign: string; term: string }[] = [];
    for (let j = 0; j <= deg; j++) {
      let val = coeffs[i][j];
      if (val === 0) continue;
      if (val > mod / 2) val -= mod;
      if (val === 0) continue;

      const sign = val < 0 ? " - " : " + ";
      const abs_val = Math.abs(val);

      let term = "";
      if (abs_val !== 1 || j === 0) {
        term += abs_val;
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

export function findAlgebraicEquation(sequence: number[], D: number): number[][] {
  const N = sequence.length;
  const K = Math.min(Math.floor(N / (D + 1)), N);
  if (K <= 1) {
    throw new Error("Could not find algebraic recurrence");
  }

  const A: number[][] = Array.from({ length: K }, () => Array(N).fill(0));
  A[0][0] = 1;
  for (let i = 0; i + 1 < K; ++i) {
    A[i + 1] = mulPoly(A[i], sequence).slice(0, N);
  }

  const mat: number[][] = Array.from({ length: N }, () => Array(K * (D + 1)).fill(0));
  for (let i = 0; i < K; ++i) {
    for (let j = 0; j < N; ++j) {
      for (let k = 0; k <= Math.min(D, j); ++k) {
        mat[j][(D + 1) * i + k] = A[i][j - k];
      }
    }
  }

  const used: boolean[] = Array(N).fill(false);
  for (let i = 0; i < mat[0].length; ++i) {
    let pivot = 0;
    while (pivot < mat.length && (used[pivot] || mat[pivot][i] === 0)) ++pivot;
    if (pivot === mat.length) continue;
    used[pivot] = true;
    for (let npivot = 0; npivot < mat.length; ++npivot) {
      if (mat[npivot][i] !== 0 && npivot !== pivot) {
        const c = mat[npivot][i] * modInv(mat[pivot][i]) % mod;
        for (let j = 0; j < mat[npivot].length; ++j) {
          mat[npivot][j] = (mat[npivot][j] - mat[pivot][j] * c % mod + mod) % mod;
        }
      }
    }
  }
  for (let i = 0; i < mat[0].length; ++i) {
    let found = false;
    for (let j = 0; j < N; ++j) {
      if (mat[j][i] !== 0) {
        let ni = i - 1;
        while (ni >= 0 && mat[j][ni] === 0) --ni;
        if (ni >= 0) found = true;
      }
    }
    if (!found) continue;
    const P: number[][] = Array.from({ length: K }, () => Array(D + 1).fill(0));
    P[Math.floor(i / (D + 1))][i % (D + 1)] = 1;
    for (let j = 0; j < N; ++j) {
      if (mat[j][i] !== 0) {
        let ni = 0;
        while (mat[j][ni] === 0) ++ni;
        P[Math.floor(ni / (D + 1))][ni % (D + 1)] = (-mat[j][i] * modInv(mat[j][ni]) % mod + mod) % mod;
      }
    }
    normalizeCoefficients(P);
    return P;
  }
  throw new Error(`Could not find algebraic equation of degree ${D} for the given ${sequence.length} terms.`);

}

export function generateAlgebraicDifferentialEquationString(solution: { partition: number[][]; v: number[] }): string {
  const polyByFProduct = new Map<string, number[]>(); // Key: string representation of f product, Value: array of x coefficients

  for (let i = 0; i < solution.partition.length; i++) {
    let coef = solution.v[i];
    if (coef === 0) continue;

    if (coef > mod / 2) {
      coef -= mod;
    }

    const p = solution.partition[i];
    let xPower = 0;
    const fDerivativeOrders: number[] = []; // Collect all derivative orders for this term

    for (const j of p) {
      if (j === 1) {
        xPower++;
      } else if (j >= 2) {
        fDerivativeOrders.push(j - 2);
      }
    }
    console.log(xPower,fDerivativeOrders,coef);
    // Create a unique key for the f product part
    // Sort to ensure consistent key for same product (e.g., f'f vs ff')
    fDerivativeOrders.sort((a, b) => a - b);
    let fProductKey = "";
    if (fDerivativeOrders.length === 0) {
      fProductKey = ""; //constant term
    } else {
      const counts = new Map<number, number>();
      for (const order of fDerivativeOrders) {
        counts.set(order, (counts.get(order) || 0) + 1);
      }

      const parts: string[] = [];
      for (const order of Array.from(counts.keys()).sort((a, b) => a - b)) {
        const count = counts.get(order)!;
        let term = "";
        if (order === 0) {
          term = "f";
        } else {
          term = `f^{(${order})}`;
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
      currentPoly.push(0);
    }
    currentPoly[xPower] = (currentPoly[xPower] + coef) % mod;
    polyByFProduct.set(fProductKey, currentPoly);
  }

  const equationParts: string[] = [];
  const sortedFProductKeys = Array.from(polyByFProduct.keys()).sort(); // Sort keys for consistent output

  for (const fProductKey of sortedFProductKeys) {
    let polyCoeffs = polyByFProduct.get(fProductKey);
    if (!polyCoeffs) continue; // Should not happen with sorted keys
    polyCoeffs = polyCoeffs.map(c => (c > mod / 2 ? c - mod : c));

    let polyString = polyToLatex(polyCoeffs);

    if (polyString === "") {
      continue;
    }

    let fTermString = "";
    if (fProductKey === "f^(0)") { // Special case for f^0 (no derivatives)
      fTermString = "f";
    } else {
      // Reconstruct the f term string from the key
      // This assumes the key format is "f^(d1)f^(d2)..."
      fTermString = fProductKey.replace(/f\^\((\d+)\)/g, (match, p1) => {
        if (p1 === "0") return "f"; // f^(0) should be just f
        return `f^{(${p1})}`; // Using f^(order) for derivatives
      });
    }

    let combinedTerm = "";
    if (polyString === "1" && fTermString.length != 0) {
      combinedTerm = fTermString;
    } else if (polyString === "-1" && fTermString.length != 0) {
      combinedTerm = `-${fTermString}`;
    } else {
      // Check if polyString contains multiple terms (i.e., has " + " or " - ")
      // by checking if " + " or " - " appears after the first character.
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


export const polyToLatex = (coeffs: number[]): string => {
  const terms = coeffs
    .map((c, i) => {
      if (c === 0) return null;
      const val = Math.abs(c);

      let termString: string;
      if (i === 0) { // Constant term
        termString = `${val}`;
      } else if (i === 1) { // x term
        termString = val === 1 ? 'x' : `${val}x`;
      } else { // x^i term
        termString = val === 1 ? `x^{${i}}` : `${val}x^{${i}}`;
      }

      // Determine sign for this specific term
      const sign = c < 0 ? '-' : '+';
      return { sign, termString };
    })
    .filter(Boolean); // Remove nulls (zero coefficients)

  if (terms.length === 0) {
    return ""; // Return empty string if all coefficients are zero
  }

  // Build the final string
  let result = "";
  for (let i = 0; i < terms.length; i++) {
    const term = terms[i];
    if (!term) continue; // Type guard for filter(Boolean)
    if (i === 0) { // First term
      if (term.sign === '-') {
        result += '-';
      }
      result += term.termString;
    } else { // Subsequent terms
      result += ` ${term.sign} ${term.termString}`;
    }
  }

  return result;
};

export const findRationalFunction = (terms: number[]) => {
  if (terms.some(isNaN)) {
    return { error: "Invalid input: Please enter a comma-separated list of numbers." };
  }
  if (terms.length === 0) {
    return { error: "Invalid input: Sequence cannot be empty." };
  }

  let w = 0;
  let currentTerms = [...terms];
  while (currentTerms.length > 0 && currentTerms[0] === 0) {
    w++;
    currentTerms.shift();
  }

  if (currentTerms.length === 0) {
    // All terms were zero
    return { P: [0], Q: [1], P_latex: "0", Q_latex: "1" };
  }

  if (currentTerms.length < 4) {
    return { error: "Invalid input: Please enter at least 4 non-zero terms after leading zeros." };
  }

  const N = Math.floor(currentTerms.length / 2);
  const size = 2 * N + 1;
  let A0: number[] = new Array(size).fill(0);
  let B0: number[] = new Array(size).fill(0);
  let A1: number[] = new Array(size).fill(0);
  let B1: number[] = new Array(size).fill(0);

  A0[2 * N] = 1;
  for (let i = 0; i < 2 * N; i++) A1[i] = currentTerms[i];
  B1[0] = 1;
  let deg = 2 * N - 1;
  while (deg > N) {
    if (A1[deg] === 0) {
      deg--;
      continue;
    }
    for (let i = size - 1; i >= deg; i--) {
      if (A0[i] !== 0) {
        const q = (A0[i] * modInv(A1[deg])) % mod;
        for (let j = 0; i - deg + j < 2 * N + 1; j++) {
          A0[i - deg + j] = (A0[i - deg + j] - A1[j] * q) % mod;
          B0[i - deg + j] = (B0[i - deg + j] - B1[j] * q) % mod;
        }
      }
    }
    [A0, A1] = [A1, [...A0]];
    [B0, B1] = [B1, [...B0]];
  }

  const invConst = modInv(B1[0]);
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

  let P_latex = polyToLatex(A1);
  if (w > 0) {
    P_latex = (w === 1) ? `x(${P_latex})` : `x^{${w}}(${P_latex})`;
  }
  if (P_latex === "") P_latex = "0"; // Handle case where P is zero after leading zeros removed

  return { P: A1, Q: B1, P_latex: P_latex, Q_latex: polyToLatex(B1) };
};

export function mulPoly(a: number[], b: number[]): number[] {
  const n = a.length, m = b.length;
  const res: number[] = new Array(n + m - 1).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      res[i + j] = (res[i + j] + a[i] * b[j]) % mod;
    }
  }
  return res;
}


export const extendSequenceFromLinearRecurrence = (P: number[], Q: number[], initial_terms: number[], n: number): number[] => {
  const a: number[] = [...initial_terms];
  for (let i = initial_terms.length; i <= n; i++) {
    let next_val = 0;
    if (i < P.length) {
      next_val = P[i];
    }
    for (let j = 1; j < Q.length; j++) {
      next_val = (next_val - Q[j] * a[i - j]) % mod;
    }
    a.push((next_val + mod) % mod);
  }
  return a;
};

// A = sum a[i][j] x^i y^j
// B = sum b[i][j] x^i y^j
// return AB mod y^2
function mul2(a: number[][], b: number[][]): number[][] {
  const c: number[][] = Array(a.length + b.length - 1).fill(null).map(() => [0, 0]);
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

function extendSequenceFromAlgebraicRecurrence(coeffs: number[][], terms: number[], n: number): number[] {
  let extendedTerms: number[] = terms.slice();
  for (let i = terms.length; i <= n; ++i) {
    const extendedTerms2: number[][] = Array(i + 1).fill(null).map(() => [0, 0]);
    for (let j = 0; j < i; ++j) {
      extendedTerms2[j][0] = extendedTerms[j];
    }
    extendedTerms2[i][1] = 1;

    let g: number[][] = Array(i + 1).fill(null).map(() => [0, 0]);
    let power: number[][] = Array(i + 1).fill(null).map(() => [0, 0]);
    power[0][0] = 1;

    for (let j = 0; j < coeffs.length; ++j) {
      for (let k = 0; k < coeffs[j].length; ++k) {
        let h: number[][] = Array(i + 1).fill(null).map(() => [0, 0]);
        h[k][0] = coeffs[j][k];
        h = mul2(h, power);
        for (let l = 0; l < g.length; ++l) {
          g[l][0] = (g[l][0] + h[l][0]) % mod;
          g[l][1] = (g[l][1] + h[l][1]) % mod;
        }
      }
      power = mul2(power, extendedTerms2).slice(0, i + 1);
    }

    let id = 0;
    while (id < g.length && g[id][1] === 0) id++;
    if (id === g.length) throw new Error("The relation can not determine the sequence uniquely.");
    extendedTerms[i] = (mod - modInv(g[id][1]) * g[id][0] % mod) % mod;
  }
  return extendedTerms;
}


export function extendSequenceFromAlgebraicDifferentialEquation(v: number[], partition: number[][], terms: number[], n: number): number[] {
  let extendedTerms: number[] = [...terms];
  for (let i = terms.length; i <= n; i++) {
    const basis = partition.map(p => {
      let poly: number[][] = [[1, 0]];
      for (const j of p) {
        if (j === 0) continue;
        else if (j === 1) poly = mul2(poly, [[0, 0], [1, 0]]); // x
        else {
          let df = differentiate(extendedTerms, j - 2);
          let df2: number[][] = Array(i + 1).fill(null).map(() => [0, 0])
          for (let k = 0; k < Math.min(df.length, i + 1); ++k) {
            df2[k][0] = df[k];
          }
          df2[i - (j - 2)][1] = FACTORIAL[i] * modInv(FACTORIAL[i - (j - 2)]) % mod;
          poly = mul2(poly, df2);
        }
      }
      return poly;
    });
    let g: number[][] = Array(i + 1).fill(null).map(() => [0, 0]);
    for (let j = 0; j < basis.length; ++j) {
      for (let k = 0; k < Math.min(i + 1, basis[j].length); ++k) {
        g[k][0] = (g[k][0] + v[j] * basis[j][k][0]) % mod;
        g[k][1] = (g[k][1] + v[j] * basis[j][k][1]) % mod;
      }
    }
    let id = 0;
    while (id < g.length && g[id][1] == 0) ++id;
    if (id == g.length) {
      throw new Error("The relation can not determine the sequence uniquely.");
    }
    extendedTerms[i] = (mod - modInv(g[id][1]) * g[id][0] % mod) % mod;
  }
  return extendedTerms;
}
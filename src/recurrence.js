export const mod = 1000003;

const FACTORIAL = (() => {
    const MAX = 1000;
    const fact = Array(MAX).fill(1);
    for (let i = 1; i < MAX; i++) {
        fact[i] = fact[i - 1] * i % mod;
    }
    return fact;
})();

function mod_pow(a, n) {
    if (n === 0) return 1;
    return mod_pow(a * a % mod, Math.floor(n / 2)) * (n % 2 === 1 ? a : 1) % mod;
}

function comb(n, k) {
    if (k < 0 || k > n) return 0;
    return FACTORIAL[n] * mod_inv(FACTORIAL[k] * FACTORIAL[n - k] % mod) % mod;
}

function mod_inv(a) {
    a = ((a % mod) + mod) % mod;
    if (a === 0) throw new Error("mod_inv(0) does not exist.");
    let b = mod, s = 1, t = 0;
    while (b) {
        let q = Math.floor(a / b);
        [a, b] = [b, a % b];
        [s, t] = [t, s - q * t];
    }
    return (s + mod) % mod;
}

function find_polynomial_recurrence_relation(terms, deg) {
    const n = terms.length;
    const B = Math.floor((n + 2) / (deg + 2));
    const C = B * (deg + 1);
    const R = n - (B - 1);

    if (B < 2 || R < C - 1) {
        throw new Error("Insufficient terms to determine polynomial recurrence relation");
    }

    let mat = Array.from({ length: R }, () => Array(C).fill(0));
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

        const inv = mod_inv(mat[rank][x]);
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
        throw new Error(`Could not find a polynomial recurrence relation of degree ${deg} for the given ${terms.length} terms.`);
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
    const ret = Array.from({ length: order + 1 }, () => Array(deg + 1).fill(0));
    ret[0][rank % (deg + 1)] = 1;

    for (let y = rank - 1; y >= 0; --y) {
        const k = order - Math.floor(y / (deg + 1));
        const d = y % (deg + 1);
        ret[k][d] = (mod - mat[y][rank]) % mod;
    }

    return {
        coeffs: ret,
        order,
        deg,
        last: n - 1,
        nonTrivialTerms: (n - ((deg + 2) * (order + 1) - 2))
    };
}


function extend_sequence_from_polynomial_recurrence(n, coeffs, terms) {
    let ret = new Array(Math.max(n + 1, terms.length)).fill(0);
    for(let i = 0; i < terms.length; i++) ret[i] = terms[i];

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

        ret[m] = (mod - s) * mod_inv((denom + mod) % mod) % mod;
        if (ret[m] < 0) ret[m] += mod;
    }
    return ret;
}

export function analyze_polynomial_recurrence(n, terms, degree) {
    if (terms.length === 0) {
        return { error: "Extended Sequence:\n(No input terms)" };
    }
    try {
        const relation = find_polynomial_recurrence_relation(terms, degree);
        const { coeffs, order, deg, last, nonTrivialTerms } = relation;
        const extended_terms = extend_sequence_from_polynomial_recurrence(n, coeffs, terms);

        let info_string = `verified up to a[${last}] (number of non-trivial terms: ${nonTrivialTerms})\n`;
        
        let result_string = `Extended Sequence:
`;
        for (let i = 0; i < extended_terms.length; ++i) {
            let val = extended_terms[i];
            result_string += `${i}: ${val}
`;
        }

        return {
            info: info_string,
            polynomialRecurrenceEquation: generate_polynomial_recurrence_equation_string(coeffs, order, deg),
            sequence: result_string
        };
    } catch (e) {
        return { error: 'Error: ' + e.message };
    }
}


function generate_polynomial_recurrence_equation_string(coeffs, order, deg) {
    const w = Array.from({ length: order + 1 }, () => Array(deg + 1).fill(0));
    for (let i = 0; i <= order; i++) {
        for (let d = 0; d <= deg; d++) {
            const c = coeffs[i][d];
            if (c === 0) continue;
            for (let k = 0; k <= d; k++) {
                const sign = ((d - k) % 2 === 0) ? 1 : mod - 1;
                const power = mod_pow(i, d - k);
                const term = comb(d, k) * sign % mod * power % mod;
                w[i][k] = (w[i][k] + (c * term % mod)) % mod;
            }
        }
    }

    let equation_parts = [];
    for (let i = 0; i <= order; i++) {
        let poly_parts = [];
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
            } else if (poly_str.startsWith('-')) {
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
    for(let i = 0; i < equation_parts.length; i++) {
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


export function analyze_algebraic_recurrence(terms, degree) {
    if (terms.length === 0) {
        return { error: "Algebraic Recurrence:\n(No input terms)" };
    }
    try {
        const algebraic_relation_coeffs = find_algebraic_recurrence_relation(terms, degree);
        const algebraicRecurrenceEquation = generate_algebraic_recurrence_equation_string(algebraic_relation_coeffs, degree);
        return {
            algebraicRecurrenceEquation: algebraicRecurrenceEquation
        };
    } catch (e) {
        return { error: 'Error: ' + e.message };
    }
}

export function generate_algebraic_recurrence_equation_string(coeffs, deg) {
    const poly_strings = [];
    for (let i = 0; i < coeffs.length; i++) {
        const terms = [];
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
            terms.push({sign, term});
        }

        if (terms.length > 0) {
            let poly = "";
            for(let k = 0; k < terms.length; k++){
                if(k > 0) poly += terms[k].sign;
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

export function find_algebraic_recurrence_relation(sequence, D) {
  const N = sequence.length;
  const K = Math.min(Math.floor(N / (D + 1)), N);
  if (K <= 1) {
    throw new Error("Insufficient terms to determine algebraic recurrence relation");
  }

  const A = Array.from({ length: K }, () => Array(N).fill(0));
  A[0][0] = 1;
  for (let i = 0; i + 1 < K; ++i) {
    for (let j = 0; j < N; ++j) {
      for (let k = 0; j + k < N; ++k) {
        A[i + 1][j + k] = (A[i + 1][j + k] + A[i][j] * sequence[k]) % mod;
      }
    }
  }

  const mat = Array.from({ length: N }, () => Array(K * (D + 1)).fill(0));
  for (let i = 0; i < K; ++i) {
    for (let j = 0; j < N; ++j) {
      for (let k = 0; k <= Math.min(D, j); ++k) {
        mat[j][(D + 1) * i + k] = A[i][j - k];
      }
    }
  }

  const used = Array(N).fill(false);
  for (let i = 0; i < mat[0].length; ++i) {
    let pivot = 0;
    while (pivot < N && (used[pivot] || mat[pivot][i] === 0)) ++pivot;
    if (pivot === N) continue;
    used[pivot] = true;
    for (let npivot = 0; npivot < N; ++npivot) {
      if (mat[npivot][i] !== 0 && npivot !== pivot) {
        const c = mat[npivot][i] * mod_inv(mat[pivot][i]) % mod;
        for (let j = 0; j < mat[0].length; ++j) {
          mat[npivot][j] = (mat[npivot][j] - mat[pivot][j] * c % mod + mod) % mod;
        }
      }
    }
  }

  for (let i = 0; i < mat[0].length; ++i) {
    let found = false;
    for (let j = 0; j < N; ++j) {
      if (mat[j][i] !== 0) {
        let x = j - 1;
        while (x >= 0 && mat[x][i] === 0) --x;
        if (x >= 0) found = true;
      }
    }
    if (!found) continue;
    const P = Array.from({ length: K }, () => Array(D + 1).fill(0));
    P[Math.floor(i / (D + 1))][i % (D + 1)] = 1;
    for (let j = 0; j < N; ++j) {
      if (mat[j][i] !== 0) {
        let ni = 0;
        while (mat[j][ni] === 0) ++ni;
        P[Math.floor(ni / (D + 1))][ni % (D + 1)] = (-mat[j][i] * mod_inv(mat[j][ni]) % mod + mod) % mod;
      }
    }
    return P;
  }
  throw new Error(`Could not find an algebraic recurrence relation of degree ${D} for the given ${sequence.length} terms.`);

}

export function pow(a, n) {
  if (n == 0) return 1;
  return pow(a * a % mod, Math.floor(n / 2)) * (n % 2 == 1 ? a : 1) % mod;
}

export function modinv(a) {
  return pow(a, mod - 2);
}

export const polyToLatex = (coeffs) =>
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

export const findRationalFunction = (terms) => {
  if (terms.some(isNaN)) {
    return { error: "Invalid input: Please enter a comma-separated list of numbers." };
  }
  if (terms.length < 4) {
    return { error: "Invalid input: Please enter at least 4 terms." };
  }
  const N = Math.floor(terms.length / 2);
  const size = 2 * N + 1;
  let A0 = new Array(size).fill(0);
  let B0 = new Array(size).fill(0);
  let A1 = new Array(size).fill(0);
  let B1 = new Array(size).fill(0);

  A0[2 * N] = 1;
  for (let i = 0; i < 2 * N; i++) A1[i] = terms[i];
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

  return { P: A1, Q: B1, P_latex: polyToLatex(A1), Q_latex: polyToLatex(B1) };
};

export const extend_sequence_from_constant_recursive = (P, Q, initial_terms, n) => {
  const a = [...initial_terms];
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
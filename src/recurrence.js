const mod = 1000003;

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

function find_recurrence_relation(terms, deg) {
    const n = terms.length;
    const B = Math.floor((n + 2) / (deg + 2));
    const C = B * (deg + 1);
    const R = n - (B - 1);

    if (B < 2 || R < C - 1) {
        throw new Error("Insufficient terms to determine recurrence");
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

        const inv = mod_inv(mat[rank][x], mod);
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
        throw new Error(`Could not find a recurrence relation of degree ${deg} for the given ${terms.length} terms.`);
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


function extended(n, coeffs, terms) {
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
        //sum[d=0..deg] coeffs[0][d]m^d a[m]=sum[i=1..order,d=0..deg] -a[m-i]*(m-i)^d*coeffs[i][d]
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

export function show_extended_sequence(n, terms, degree) {
    if (terms.length === 0) {
        return `Extended Sequence:\n(No input terms)`;
    }
    const relation = find_recurrence_relation(terms, degree);
    const { coeffs, order, deg, last, nonTrivialTerms } = relation;
    const extended_terms = extended(n, coeffs, terms);

    let info_string = `[ Found a recurrence relation ]\n- order ${order}\n- degree ${deg}\n- verified up to a(${last}) (number of non-trivial terms: ${nonTrivialTerms})\n`;

    // 展開式生成： sum[i=0..order,d=0..deg] a[m-i]*m^d*w[i][d] = 0
    // w[i][d] = coeffs[i][d] * (m-i)^d 展開時のm^d係数

    function generate_w_string() {
        const w = Array.from({ length: order + 1 }, () => Array(deg + 1).fill(0));
        for (let i = 0; i <= order; i++) {
            for (let d = 0; d <= deg; d++) {
                const c = coeffs[i][d];
                for (let k = 0; k <= d; k++) {
                    const sign = ((d - k) % 2 === 0) ? 1 : mod - 1; // (-1)^{d-k} mod
                    const power = mod_pow(i, d - k);
                    const term = comb(d, k) * sign % mod * power % mod;
                    w[i][k] = (w[i][k] + mod + (c * term % mod)) % mod;
                }
            }
        }

        let str = "Expanded recurrence (mod " + mod + "):\n";

        for (let i = 0; i <= order; i++) {
            for (let d = 0; d <= deg; d++) {
                let val = w[i][d];
                if (val>mod/2) val -= mod;
                if (val === 0) continue;
                if (val == 1) {
                    str += ` + m^${d} * a[m-${i}]`;
                } else {
                    str += ` + ${val} * m^${d} * a[m-${i}]`;
                }
            }
        }
        str += " = 0\n";
        return str;
    }

    
    
    let result_string = `Extended Sequence:\n`;
    for (let i = 0; i < extended_terms.length; ++i) {
        let val = extended_terms[i];
        result_string += `${i}: ${val}\n`;
    }
    return info_string + generate_w_string() + "\n" + result_string;
}

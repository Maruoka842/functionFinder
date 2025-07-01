import React from 'react';
import { Link } from 'react-router-dom';
import { BlockMath, InlineMath } from 'react-katex';

function HowToUse() {
  return (
    <div className="container mt-5">
      <h1>How to Use the Sequence Recurrence Finder</h1>
      <p>This tool helps you find different types of recurrence relations for a given sequence of numbers.</p>

      <h2>1. Entering a Sequence</h2>
      <p>In the main text area, enter the sequence of numbers you want to analyze. The numbers should be separated by commas. For example: <code>1, -1, 2, -3, 5, -8</code>. Input values are processed using arbitrary-precision integers, so any large value is acceptable.</p>

      <h2>2. Setting the Degree</h2>
      <p>The "Degree" input specifies the maximum degree of the coefficient polynomial for algebraic and polynomial recurrences. For algebraic differential equations, degree `d` specifies that the generating function `f` satisfies a differential equation involving <InlineMath math={String.raw`x, f, f', \dots, f^{(d-2)}`} />. A higher degree may find more complex relationships but will take longer to compute.</p>

      <h2>3. Setting the Extend Length</h2>
      <p>The "Extend Length" input determines how many terms of the sequence will be generated and displayed based on the found recurrence relations.</p>

      <h2>4. Interpreting the Results</h2>
      <p>After clicking "Find The Recurrence", the tool will display any found recurrence relations:</p>
      <ul>
        <li>
          <strong>Constant Recurrence (Rational Generating Function): </strong>
          This finds a linear recurrence with constant coefficients, which means the generating function is a rational function (a fraction of two polynomials, P(x)/Q(x)).
        </li>
        <li>
          <strong>Algebraic Equation: </strong>
          This finds a polynomial equation that the generating function satisfies. For example: <code>(1-x)f^2 - f + x = 0</code>.
        </li>
        <li>
          <strong>Polynomial Recurrence (D-finite / Holonomic): </strong>
          This finds a linear recurrence where the coefficients are polynomials in the index `n`. In other words, the generating function satisfies a differential equation whose coefficients are polynomials.
        </li>
        <li>
          <strong>Algebraic Differential Equation: </strong>
          This finds a differential equation that the generating function satisfies. For example: <code>(1-x)f' + f = 0</code>.
        </li>
      </ul>

      <Link to="/" className="btn btn-primary mt-3">Back to the Finder</Link>
    </div>
  );
}

export default HowToUse;


import React from 'react';
import { Link } from 'react-router-dom';

function HowToUse() {
  return (
    <div className="container mt-5">
      <h1>How to Use the Sequence Recurrence Finder</h1>
      <p>This tool helps you find different types of recurrence relations for a given sequence of numbers.</p>

      <h2>1. Entering a Sequence</h2>
      <p>In the main text area, enter the sequence of numbers you want to analyze. The numbers should be separated by commas. For example: <code>1, 1, 2, 3, 5, 8</code>.</p>

      <h2>2. Setting the Degree</h2>
      <p>The "Degree" input specifies the maximum degree of the coefficient polynomial of algebraic and polynomial recurrences you are looking for. A higher degree may find more complex relationships but will take longer to compute.</p>

      <h2>3. Setting the Extend Length</h2>
      <p>The "Extend Length" input determines how many terms of the sequence will be generated and displayed based on the found recurrence relations.</p>

      <h2>4. Interpreting the Results</h2>
      <p>After clicking "Find The Recurrence", the tool will display any found recurrence relations in three categories:</p>
      <ul>
        <li><strong>Constant Recursive Relation:</strong> This is a linear recurrence with constant coefficients, also known as a rational generating function. The result is shown as a fraction of two polynomials, P(x)/Q(x).</li>
        <li><strong>Algebraic Recursive Relation:</strong> This is a recurrence where the generating function is an algebraic function. The result is shown as an equation that the generating function satisfies.</li>
        <li><strong>Polynomial Recursive Relation:</strong> This is a linear recurrence with polynomial coefficients (also known as a P-recurrence). The result is shown as a recurrence relation involving the terms of the sequence, a_n.</li>
      </ul>

      <Link to="/" className="btn btn-primary mt-3">Back to the Finder</Link>
    </div>
  );
}

export default HowToUse;

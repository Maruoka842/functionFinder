
import React from 'react';
import { Link } from 'react-router-dom';

function AlgorithmExplanation() {
  return (
    <div className="container mt-5">
      <h1>About the Algorithms</h1>
      <p>This application uses several algorithms to find recurrence relations in a given sequence of numbers. All calculations are performed modulo a large prime number (1,000,003) to handle large numbers efficiently.</p>

      <h2>1. Rational Function (Rational Generating Function)</h2>
      <p>This algorithm tries to find a linear recurrence with constant coefficients. This is equivalent to finding a rational generating function for the sequence, which is a fraction of two polynomials, P(x)/Q(x).</p>
      <p>The method used is based on the <strong>Extended Euclidean Algorithm for polynomials</strong>, which is a standard way to find Padé approximants. Given a sequence, it constructs two polynomials and then uses a series of polynomial divisions to find the simplest rational function that generates the sequence.</p>

      <h2>2. Polynomial Recurrence (P-Recurrence)</h2>
      <p>This algorithm searches for a linear recurrence relation where the coefficients are not constant, but are instead polynomials in the index <code>n</code>. For example, a relation like <code>{`(n+1)a_n = (2n-1)a_{n-1} + n*a_{n-2}`}</code>.</p>
      <p>The approach is to set up a system of linear equations based on the input sequence and the desired polynomial degree. The coefficients of the polynomials in the recurrence relation are the unknowns. The application then uses <strong>Gaussian elimination</strong> to solve this system and find the coefficients. If a non-trivial solution is found, it means a P-recurrence has been discovered.</p>

      <h2>3. Algebraic Equation</h2>
      <p>This algorithm looks for a more general type of recurrence where the generating function `f(x)` for the sequence satisfies a polynomial equation, such as `(1-x)f(x)^2 - f(x) + x = 0`.</p>
      <p>This is the most complex of the three algorithms. It works by constructing a matrix based on the powers of the generating function and the input sequence. It then uses techniques from linear algebra, including <strong>Gaussian elimination</strong>, to find a linear dependency among the powers of the generating function. This dependency corresponds to the algebraic equation.</p>

      <Link to="/" className="btn btn-primary mt-3">Back to the Finder</Link>
    </div>
  );
}

export default AlgorithmExplanation;

import React from 'react';
import { Link } from 'react-router-dom';

function Examples() {
  return (
    <div className="container mt-5">
      <h1>Examples of Sequences</h1>
      <p>Here are some examples of sequences you can try in the Sequence Recurrence Finder:</p>

      <h2>1. Fibonacci Sequence</h2>
      <p><code>1, 1, 2, 3, 5, 8, 13, 21, 34, 55</code></p>
      <p>This sequence is famous for its constant coefficient linear recurrence.</p>

      <h2>2. Powers of 2</h2>
      <p><code>1, 2, 4, 8, 16, 32, 64, 128</code></p>
      <p>Another simple sequence with a constant coefficient linear recurrence.</p>

      <h2>3. Factorials</h2>
      <p><code>1, 1, 2, 6, 24, 120, 720</code></p>
      <p>This sequence satisfies a polynomial recurrence.</p>

      <h2>4. Catalan Numbers</h2>
      <p><code>1, 1, 2, 5, 14, 42, 132, 429</code></p>
      <p>This sequence satisfies an algebraic recurrence.</p>

      <h2>5. Alternating Sequence</h2>
      <p><code>1, -1, 1, -1, 1, -1</code></p>
      <p>An example of a sequence with negative terms.</p>

      <h2>6. Sequence with Leading Zeros</h2>
      <p><code>0, 0, 1, 1, 2, 3, 5, 8</code></p>
      <p>An example of a sequence starting with zeros, which affects rational function calculation.</p>

      <Link to="/" className="btn btn-primary mt-3">Back to the Finder</Link>
    </div>
  );
}

export default Examples;

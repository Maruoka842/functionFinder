import React from 'react';
import { Link } from 'react-router-dom';

function Examples() {
  return (
    <div className="container mt-5">
      <h1>Examples of Sequences</h1>
      <p>Here are some examples of sequences you can try in the Sequence Recurrence Finder, categorized by the type of recurrence they satisfy:</p>

      <h2>Rational</h2>
      <p>These sequences satisfy a linear recurrence with constant coefficients. Their generating functions are rational functions (P(x)/Q(x)).</p>
      <h5>Constant nummbers</h5>
      <p><code>1, 1, 1, 1, 1, 1, 1, 1, 1, 1</code> <Link to="/?sequence=1,1,1,1,1,1,1,1,1,1,1,1,1,1,1&degree=3&extendLength=20">Try</Link></p>

      <h5>Fibonacci nummbers</h5>
      <p><code>1, 1, 2, 3, 5, 8, 13, 21, 34, 55</code> <Link to="/?sequence=1,1,2,3,5,8,13,21,34,55&degree=1&extendLength=20">Try</Link></p>

      <h5>Powers of 2</h5>
      <p><code>1, 2, 4, 8, 16, 32, 64, 128</code> <Link to="/?sequence=1,2,4,8,16,32,64,128&degree=1&extendLength=20">Try</Link></p>

      <h5>Alternating 1, -1</h5>
      <p><code>1, -1, 1, -1, 1, -1</code> <Link to="/?sequence=1,-1,1,-1,1,-1&degree=1&extendLength=20">Try</Link></p>

      <h2>Algebraic</h2>
      <p>These sequences have generating functions that satisfy a polynomial equation.</p>
      <h5>Catalan numbers</h5>
      <p><code>1, 1, 2, 5, 14, 42, 132, 429</code> <Link to="/?sequence=1,1,2,5,14,42,132,429&degree=1&extendLength=20">Try</Link></p>
      <h5>Motzkin numbers</h5>
      <p><code>1, 1, 2, 4, 9, 21, 51, 127, 323</code> <Link to="/?sequence=1,1,2,4,9,21,51,127,323&degree=2&extendLength=20">Try</Link></p>
      <h5>Diagonal binomials</h5>
      <p><code>1, 2, 6, 20, 70, 252</code> <Link to="/?sequence=1,2,6,20,70,252&degree=1&extendLength=20">Try</Link></p>
      <h5>ABC222 H</h5>
      <p><code>0,1,6,47,420,4059</code> <Link to="/?sequence=0,1,6,47,420,4059,41316,436345,737006,535794,665756,678736&degree=1&extendLength=20">Try</Link></p>

      <h2>D-finite (Polynomial Recurrence/Holonomic)</h2>
      <p>These sequences satisfy a linear recurrence with polynomial coefficients. Their generating functions satisfy a linear differential equation with polynomial coefficients.</p>
      <h5>Factorials</h5>
      <p><code>1, 1, 2, 6, 24, 120, 720</code> <Link to="/?sequence=1,1,2,6,24,120,720&degree=1&extendLength=20">Try</Link></p>
      <h5>yukicoder No.93</h5>
      <p><code>1, 1, 2, 2, 8, 28, 152, 952</code> <Link to="/?sequence=1,1,2,2,8,28,152,952,7208,62296,605864,522934,951268,408314,460283,696500,17045,819809,110051,817027,391750,406848,886786,46633,699032,61450,243777,940538,211999,763310,943144,217768,262364,854737,570686,870372,220002,618363,961813,86297,334626,877521,163352,36748,826053,537680,948030,218226,593090,655673,959753,544220,513944,205002&degree=2&extendLength=20">Try</Link></p>
      <p>Min25 found it.</p>

      <h2>D-algebraic</h2>
      <p>These sequences have generating functions that satisfy a polynomial differential equation.</p>
      <h5>Number of permutations of odd length with up-up or down-down</h5>
      <p><code>0, 1, 0, 2, 0, 14, 0, 204, 0, 5104</code> <Link to="/?sequence=0, 1, 0, 2, 0, 14, 0, 204, 0, 5104, 0, 195040, 0, 570386, 0, 168983, 0, 671563, 0, 226455, 0, 272519, 0, 603129, 0, 298609, 0, 841256, 0, 663822, 0, 476977, 0, 574167, 0, 318955, 0, 57566, 0, 387157&degree=3&extendLength=20">Try</Link></p>
      <p>AtCoder World Tour Final e.</p>
      <h5>Bell numbers</h5>
      <p><code>1, 1, 2, 5, 15, 52, 203, 877, 4140, 21147, 115975, 678570, 4213597, 27644437, 190899322, 1382958545, 10480142147</code> <Link to="/?sequence=1,1,2,5,15,52,203,877,4140,21147,115975,678570,4213597,27644437,190899322,1382958545,10480142147&degree=4&extendLength=20">Try</Link></p>
      <h5>Number of alternating permutations of even length</h5>
      <p><code>1, 0, 1, 0, 5, 0, 61, 0, 1385, 0, 50521, 0, 2702765, 0, 199360981, 0, 19391512145</code> <Link to="/?sequence=1,0,1,0,5,0,61,0,1385,0,50521,0,2702765,0,199360981,0,19391512145&degree=4&extendLength=20">Try</Link></p>

      <Link to="/" className="btn btn-primary mt-3">Back to the Finder</Link>
    </div>
  );
}

export default Examples;

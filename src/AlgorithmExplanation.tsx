
import React from 'react';
import { Link } from 'react-router-dom';
import { BlockMath, InlineMath } from 'react-katex';

function AlgorithmExplanation() {
  return (
    <div className="container mt-5">
      <h1>About the Algorithms</h1>
      <p>数列 <InlineMath math={String.raw`a_0, a_1, a_2, \ldots`}/>を母関数<InlineMath math={String.raw`f(x) = \sum_{i=0}^\infty a_i x^i`}/>によって次のように分類します。</p>
      <ul>
        <li>Rational: ある整数係数多項式 <InlineMath math={String.raw`P(x), Q(x)`}/> を用いて <InlineMath math={String.raw`f(x)=P(x)/Q(x)`}/> と表せる。</li>
        <li>Algebraic: ある非零の整数係数多項式 <InlineMath math={String.raw`P(x)`}/> が <InlineMath math={String.raw`P(f(x))=0`}/> を満たす。</li>
        <li>D-finite: <InlineMath math={String.raw`\sum_{i=0}^d a_i f^{(i)} = 0`}/> 満たす整数列 <InlineMath math={String.raw`a \neq (0,\ldots 0)`}/> が存在する。</li>
        <li>D-algebraic: ある非零の整数係数多項式 <InlineMath math={String.raw`P(x_1,x_2,\ldots,x_d)`}/> が <InlineMath math={String.raw`P(x,f,f^{(1)},\ldots,f^{(d-2)})=0`}/> を満たす。</li>
      </ul>
      <p>
      D-algebraic ⊆ D-finite ⊆ Algebraic ⊆ Rational です。このサイトは、<InlineMath math={String.raw`a_0, a_1, a_2, \ldots`}/> の最初のいくつかの項が与えられたとき、
      数列が上のいずれかのクラスであると仮定して関係式を求め、数列を延長します。
      各クラスとも、<InlineMath math={String.raw`1, x, f^2, xf'f''`}/> のような f からできるべき級数が線形従属と言っています。
      従って、アルゴリズムは4つともほぼ同じで、先頭から N 項が与えられたとき、N 個以下の元を選んで、それらが線形独立であるかガウスの消去法で求め、線形従属であった場合はそれを一つ構成します（<a href="https://judge.yosupo.jp/problem/system_of_linear_equations">library checker</a>）。
      計算量は <InlineMath math={String.raw`O(N^3)`}/> ですが、Rational については Berlekamp ＆ Masseyによる <InlineMath math={String.raw`O(N (\log N)^2)`}/> の<a href="https://ieeexplore.ieee.org/document/1054260/">高速なアルゴリズム</a>があります。
      D-finite の母関数推定については、Min25さんの解説記事があったのですが、削除されてしまいました。
      </p>
      <p>D-algebraicの場合のこのサイトの計算方法を詳しく説明します。まず、入力で与えられた degree, K に対して、<InlineMath math={String.raw`{K + D \choose D} \leq N - K + 2`}/> を満たす最大の D を求めます。
      そして、<InlineMath math={String.raw`1, x, f, f', f'', \ldots, f^{(K-2)}`}/> を D 回以下掛けて出来る<InlineMath math={String.raw`{K + D \choose D} \leq N - K + 2`}/> 個の級数を列挙して
      <InlineMath math={String.raw`g_1,g_2,\ldots,g_{{K+D \choose D}}`}/> とします。そして、<InlineMath math={String.raw`\sum_{i=1}^N a_ig_i = 0`}/> を各 <InlineMath math={String.raw`x^0,x^1,\ldots,x^{N-K+1}`}/>の係数が 0 であるという条件に分けて行列の核空間を求める問題に帰着すればよいです。
      Rationalの場合のBerlekamp&Masseyについては、(分母の次数)≥(分子の次数)となる有理関数のうち分母の次数が最小の保証があります。その他の場合について、最も簡単な式を必ず求める方法があるのか、僕は分かっていません。</p>
      <h1>What for?</h1>
      まず、数列のN項目を求める問題で使えると思います。各クラスごとに機械的に高速な方法があります。
      <ul>
        <li>Rational: Fiduccia, Bostan-Mori で <InlineMath math={String.raw`O(\log N)`}/> </li>
        <li>Algebraic: あるらしいが未読（<a href="https://arxiv.org/abs/1602.00545">論文</a>）。</li>
        <li>D-finite: baby-step, giant-step で <InlineMath math={String.raw`O(\sqrt{p}\log p)`}/></li>
        <li>D-algebraic: 分かりません ╮(´•ω•)╭</li>
      </ul>
      <p>また、母関数が微分方程式から求まることもあるでしょう。</p>
      <Link to="/" className="btn btn-primary mt-3">Back to the Finder</Link>
    </div>
  );
}

export default AlgorithmExplanation;

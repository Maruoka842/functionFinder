# Sequence Recurrence Finder

## Project Overview

This is a web application designed to find various types of recurrence relations for a given sequence of numbers. It can identify rational, algebraic, polynomial (D-finite/holonomic), and algebraic differential equations that the generating function of a sequence satisfies. The tool also extends the sequence based on the found recurrence relations.

## Features

-   **Rational Recurrence:** Finds linear recurrences with constant coefficients (rational generating functions).
-   **Algebraic Equation:** Discovers polynomial equations satisfied by the generating function.
-   **Polynomial Recurrence (D-finite / Holonomic):** Identifies linear recurrences with polynomial coefficients.
-   **Algebraic Differential Equation:** Finds differential equations satisfied by the generating function.
-   **Sequence Extension:** Extends the input sequence based on the found recurrence relations.
-   **Arbitrary-Precision Integer Support:** Handles very large numbers in the input sequence.

## Technology Stack

-   **Frontend:** React, TypeScript
-   **Build Tool:** Vite
-   **Styling:** Bootstrap
-   **Mathematics Rendering:** KaTeX
-   **Testing:** Jest

## Installation and Local Setup

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Maruoka842/functionFinder.git
    cd functionFinder
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## Running Tests

To run the unit tests:

```bash
npm test
```

## Deployment to GitHub Pages

This project is configured for deployment to GitHub Pages. The `homepage` field in `package.json` and `base` in `vite.config.ts` are set up for `https://Maruoka842.github.io/functionFinder`.

To deploy the application:

```bash
npm run deploy
```

This command will build the project and push the `dist` directory content to the `gh-pages` branch of your repository. The site will then be accessible at the `homepage` URL.

## Contact

If you have any questions or feedback, feel free to reach out to the author on Twitter: [@37zigen](https://x.com/37zigen)
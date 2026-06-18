import { transform } from "sucrase";
import { PublicKey, Connection, SystemProgram, Transaction, Keypair } from "@solana/web3.js";

export interface CodeChallengeResult {
  passed: boolean;
  output: string;
  error?: string;
}

export interface RunCodeChallengeParams {
  studentCode: string;
  functionName: string;
  testInput: unknown[];        // arguments to call the function with
  expectedOutput: string;       // expected return value, compared as a string
}

const AVAILABLE_GLOBALS: Record<string, unknown> = {
  PublicKey,
  Connection,
  SystemProgram,
  Transaction,
  Keypair,
  LAMPORTS_PER_SOL: 1_000_000_000,
};

export function runCodeChallenge({
  studentCode,
  functionName,
  testInput,
  expectedOutput,
}: RunCodeChallengeParams): CodeChallengeResult {
  // Step 1: Transpile TypeScript to plain JavaScript
  let transpiledCode: string;

  try {
    transpiledCode = transform(studentCode, {
      transforms: ["typescript"],
    }).code;
  } catch (err) {
    return {
      passed: false,
      output: "",
      error: `Syntax error: ${err instanceof Error ? err.message : "Could not transpile your code"}`,
    };
  }

  // Step 2: Validate the expected function actually exists in the transpiled code
  // A simple check: does the transpiled output declare a function or const with this name
  const functionExistsPattern = new RegExp(
    `(function\\s+${functionName}\\s*\\()|(const\\s+${functionName}\\s*=)|(let\\s+${functionName}\\s*=)`
  );

  if (!functionExistsPattern.test(transpiledCode)) {
    return {
      passed: false,
      output: "",
      error: `Could not find a function named "${functionName}" in your code. Make sure your function is named exactly "${functionName}".`,
    };
  }

  // Step 3: Wrap and execute in an isolated scope
  try {
    const globalNames = Object.keys(AVAILABLE_GLOBALS);
    const globalValues = Object.values(AVAILABLE_GLOBALS);

    const wrappedCode = `
      "use strict";
      ${transpiledCode}
      return ${functionName};
    `;

    // Pass real library exports in as named parameters, available inside student code
    const userFunction = new Function(...globalNames, wrappedCode)(...globalValues);

    if (typeof userFunction !== "function") {
      return {
        passed: false,
        output: "",
        error: `"${functionName}" was found but is not a callable function.`,
      };
    }

    // Step 4: Run with a timeout guard to prevent infinite loops from hanging the browser
    const result = runWithTimeout(() => userFunction(...testInput), 2000);

    const outputAsString = typeof result === "string" ? result : JSON.stringify(result);

    return {
      passed: outputAsString === expectedOutput,
      output: outputAsString,
    };
  } catch (err) {
    return {
      passed: false,
      output: "",
      error: `Runtime error: ${err instanceof Error ? err.message : "Something went wrong running your code"}`,
    };
  }
}

// Basic synchronous timeout guard — for true infinite loop protection,
// consider running inside a Web Worker in a future iteration.
function runWithTimeout<T>(fn: () => T, timeoutMs: number): T {
  const start = Date.now();
  const result = fn();
  if (Date.now() - start > timeoutMs) {
    throw new Error("Code took too long to execute. Check for infinite loops.");
  }
  return result;
}

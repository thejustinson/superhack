"use client";

import React, { useState, useEffect } from "react";
import { MultipleChoice } from "./MultipleChoice";
import { TrueFalse } from "./TrueFalse";
import { CodeChallenge } from "./CodeChallenge";

interface QuizData {
  id: string;
  question: string;
  type: "multiple_choice" | "true_false" | "code_challenge";
  options: any; // Options builder array or JSON
  correct_answer: string;
  explanation?: string | null;
  function_name?: string | null;
  test_input?: any;
  order_index: number;
}

interface QuizProps {
  quizzes: QuizData[];
  onAllPassed: (passed: boolean) => void;
}

export function Quiz({ quizzes, onAllPassed }: QuizProps) {
  const [passedMap, setPassedMap] = useState<Record<string, boolean>>({});

  // Reset progress when quizzes list changes
  useEffect(() => {
    setPassedMap({});
    onAllPassed(quizzes.length === 0);
  }, [quizzes]);

  const handleQuizPass = (quizId: string, passed: boolean) => {
    const nextMap = { ...passedMap, [quizId]: passed };
    setPassedMap(nextMap);

    // Verify if all quizzes in the list are completed successfully
    const allPassed = quizzes.every((q) => nextMap[q.id] === true);
    onAllPassed(allPassed);
  };

  if (!quizzes || quizzes.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: "40px", borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "32px" }}>
      <h3
        style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontWeight: 800,
          fontSize: "1.25rem",
          color: "#f0f0f0",
          marginBottom: "8px",
        }}
      >
        Lesson Challenge
      </h3>
      <p style={{ color: "#888888", fontSize: "0.875rem", margin: "0 0 24px" }}>
        Complete the following verification challenges to unlock completion for this lesson.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {quizzes.map((quiz) => {
          // Parse options if stored as string/JSON
          let parsedOptions = [];
          if (quiz.options) {
            try {
              parsedOptions = typeof quiz.options === "string" 
                ? JSON.parse(quiz.options) 
                : quiz.options;
            } catch (e) {
              parsedOptions = [];
            }
          }

          if (quiz.type === "multiple_choice") {
            return (
              <MultipleChoice
                key={quiz.id}
                question={quiz.question}
                options={parsedOptions}
                correctAnswer={quiz.correct_answer}
                explanation={quiz.explanation}
                isPassed={passedMap[quiz.id]}
                onPass={(passed) => handleQuizPass(quiz.id, passed)}
              />
            );
          }

          if (quiz.type === "true_false") {
            return (
              <TrueFalse
                key={quiz.id}
                question={quiz.question}
                correctAnswer={quiz.correct_answer}
                explanation={quiz.explanation}
                isPassed={passedMap[quiz.id]}
                onPass={(passed) => handleQuizPass(quiz.id, passed)}
              />
            );
          }

          if (quiz.type === "code_challenge") {
            // For code challenges, parsedOptions might store configs like language / starterCode
            const language = parsedOptions?.language ?? "javascript";
            const starterCode = parsedOptions?.starterCode ?? "";

            let testInput: any[] = [];
            if (quiz.test_input) {
              if (Array.isArray(quiz.test_input)) {
                testInput = quiz.test_input;
              } else if (typeof quiz.test_input === "string") {
                try {
                  testInput = JSON.parse(quiz.test_input);
                } catch {
                  testInput = [];
                }
              }
            }

            return (
              <CodeChallenge
                key={quiz.id}
                question={quiz.question}
                correctAnswer={quiz.correct_answer}
                explanation={quiz.explanation}
                language={language}
                starterCode={starterCode}
                functionName={quiz.function_name}
                testInput={testInput}
                isPassed={passedMap[quiz.id]}
                onPass={(passed) => handleQuizPass(quiz.id, passed)}
              />
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { MultipleChoice } from "./MultipleChoice";

interface TrueFalseProps {
  question: string;
  correctAnswer: string; // "true" or "false"
  explanation?: string | null;
  onPass: (passed: boolean) => void;
  isPassed?: boolean;
}

export function TrueFalse({
  question,
  correctAnswer,
  explanation,
  onPass,
  isPassed = false,
}: TrueFalseProps) {
  const options = [
    { label: "True", value: "true" },
    { label: "False", value: "false" },
  ];

  return (
    <MultipleChoice
      question={question}
      options={options}
      correctAnswer={correctAnswer.toLowerCase().trim()}
      explanation={explanation}
      onPass={onPass}
      isPassed={isPassed}
    />
  );
}

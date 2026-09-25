"use client";

/**
 * Respondent flow - the public one-question-at-a-time form fill experience.
 * 
 * Key features (per product.md, this is one of the two most critical pieces):
 * - Full-screen, one question at a time with smooth transitions (Framer Motion)
 * - Keyboard navigation: Enter to advance, arrow keys to go back/forward
 * - Progress indicator
 * - Client + server validation (required, email format, number bounds, etc.)
 * - Thank-you screen on completion
 * 
 * Design goal: Typeform's conversational, polished feel.
 */

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import type { Form, Question } from "@/lib/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Answer type for local state
interface Answer {
  question_id: number;
  value: string;
}

export default function PublicFormPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const router = useRouter();

  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentValue, setCurrentValue] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");

  // Load the published form
  useEffect(() => {
    loadForm();
  }, [slug]);

  async function loadForm() {
    try {
      setLoading(true);
      const data = await api.get<Form>(`/public/forms/${slug}`);
      setForm(data);
      
      // Initialize answers array
      setAnswers(data.questions.map(q => ({ question_id: q.id, value: "" })));
    } catch (error) {
      console.error(error);
      setForm(null);
    } finally {
      setLoading(false);
    }
  }

  // Keyboard navigation - enhanced to support Shift+Enter for long_text
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (completed || submitting || !form) return;
      
      const currentQuestion = form.questions[currentQuestionIndex];
      
      // For long_text, Shift+Enter allows newlines, plain Enter advances
      if (e.key === "Enter" && !e.shiftKey) {
        // Don't prevent default for long_text - let it add newlines on Shift+Enter
        if (currentQuestion.type !== "long_text") {
          e.preventDefault();
        }
        // But for long_text, only advance on plain Enter (not Shift+Enter)
        if (currentQuestion.type === "long_text" && e.shiftKey) {
          return; // Allow newline
        }
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowUp" && currentQuestionIndex > 0) {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        handleNext();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentQuestionIndex, currentValue, completed, submitting, form]);

  // Update current value when question changes
  useEffect(() => {
    if (form && currentQuestionIndex < form.questions.length) {
      const currentQuestion = form.questions[currentQuestionIndex];
      const answer = answers.find(a => a.question_id === currentQuestion.id);
      setCurrentValue(answer?.value || "");
      setError("");
    }
  }, [currentQuestionIndex, form]);

  function handleNext() {
    if (!form) return;
    
    const currentQuestion = form.questions[currentQuestionIndex];
    
    // Validate current answer
    const validationError = validateAnswer(currentQuestion, currentValue);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    // Save the answer
    updateAnswer(currentQuestion.id, currentValue);
    
    // Set direction for animation
    setDirection("forward");
    
    // Move to next question or submit
    if (currentQuestionIndex < form.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setError("");
    } else {
      handleSubmit();
    }
  }

  function handlePrevious() {
    if (currentQuestionIndex > 0) {
      // Save current answer before going back
      if (form) {
        const currentQuestion = form.questions[currentQuestionIndex];
        updateAnswer(currentQuestion.id, currentValue);
      }
      
      // Set direction for animation
      setDirection("backward");
      
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setError("");
    }
  }

  function updateAnswer(questionId: number, value: string) {
    setAnswers(prev =>
      prev.map(a => a.question_id === questionId ? { ...a, value } : a)
    );
  }

  // Client-side validation (matching server-side rules from public.py)
  function validateAnswer(question: Question, value: string): string | null {
    // Required field validation
    if (question.required && !value.trim()) {
      return "This field is required";
    }
    
    // If not required and empty, it's valid
    if (!value.trim()) {
      return null;
    }
    
    // Type-specific validation
    if (question.type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return "Please enter a valid email address";
      }
    }
    
    if (question.type === "number") {
      const num = parseFloat(value);
      if (isNaN(num)) {
        return "Please enter a valid number";
      }
      
      const settings = question.settings_json || {};
      if (settings.min !== undefined && num < settings.min) {
        return `Number must be at least ${settings.min}`;
      }
      if (settings.max !== undefined && num > settings.max) {
        return `Number must be at most ${settings.max}`;
      }
    }
    
    if (question.type === "rating") {
      const rating = parseInt(value);
      const max = question.settings_json?.max || 5;
      if (isNaN(rating) || rating < 1 || rating > max) {
        return `Please select a rating between 1 and ${max}`;
      }
    }
    
    // Multiple choice and dropdown: validate against options
    if (question.type === "multiple_choice" || question.type === "dropdown") {
      const validOptions = question.options.map(opt => opt.label);
      if (!validOptions.includes(value)) {
        return "Please select a valid option";
      }
    }
    
    // Yes/no: validate it's one of the two
    if (question.type === "yes_no") {
      if (value !== "yes" && value !== "no") {
        return "Please select yes or no";
      }
    }
    
    return null;
  }

  async function handleSubmit() {
    if (!form) return;
    
    try {
      setSubmitting(true);
      
      // Format answers for the API
      const formattedAnswers = answers.map(a => ({
        question_id: a.question_id,
        value_text: a.value || null,
      }));
      
      await api.post(`/public/forms/${slug}/responses`, {
        answers: formattedAnswers,
      });
      
      setCompleted(true);
    } catch (error: any) {
      // Server validation errors
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (typeof detail === "string") {
          setError(detail);
        } else if (Array.isArray(detail)) {
          setError(detail[0]?.msg || "Validation error");
        } else {
          setError("Failed to submit form");
        }
      } else {
        setError("Failed to submit form. Please try again.");
      }
      setSubmitting(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-neutral-500">Loading form...</div>
      </div>
    );
  }

  // Form not found or not published - clean empty state
  if (!form) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="h-screen flex flex-col items-center justify-center bg-neutral-50 px-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-6xl mb-6"
        >
          🔍
        </motion.div>
        <h1 className="text-2xl font-semibold text-neutral-900 mb-2">Form not found</h1>
        <p className="text-neutral-600 text-center max-w-md">
          This form doesn't exist or hasn't been published yet. Please check the URL or contact the form creator.
        </p>
      </motion.div>
    );
  }

  // Thank you screen - animated completion
  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="h-screen flex flex-col items-center justify-center bg-neutral-50 px-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-6xl mb-6"
        >
          ✅
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-6xl font-bold text-black mb-6"
        >
          Thank you!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-2xl text-neutral-700 mb-16"
        >
          Your response has been submitted.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-neutral-500"
        >
          You can close this page now.
        </motion.p>
      </motion.div>
    );
  }

  const currentQuestion = form.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / form.questions.length) * 100;

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Progress bar - smooth animated indicator with pure black */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-neutral-100 z-50">
        <motion.div
          className="h-full bg-black"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
      </div>

      {/* Main question area */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: direction === "forward" ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction === "forward" ? -50 : 50 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {/* Question number */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-medium text-neutral-500">
                  {currentQuestionIndex + 1} → {form.questions.length}
                </span>
                {currentQuestion.required && (
                  <span className="text-sm text-red-600">*</span>
                )}
              </div>

              {/* Question title and description - Oversized Typeform style */}
              <h1 className="text-6xl font-bold text-black mb-8 leading-tight">
                {currentQuestion.title}
              </h1>
              {currentQuestion.description && (
                <p className="text-2xl text-neutral-700 mb-16 leading-relaxed">
                  {currentQuestion.description}
                </p>
              )}

              {/* Question input */}
              <div className="mb-6">
                <QuestionInput
                  question={currentQuestion}
                  value={currentValue}
                  onChange={setCurrentValue}
                  onSubmit={handleNext}
                />
              </div>

              {/* Error message - inline with helpful icon */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3"
                >
                  <span className="text-red-600 text-xl">⚠️</span>
                  <div className="flex-1">
                    <p className="text-red-900 font-medium text-sm">{error}</p>
                  </div>
                </motion.div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-4">
                {currentQuestionIndex > 0 && (
                  <button
                    onClick={handlePrevious}
                    className="px-6 py-3 text-neutral-600 hover:text-neutral-900 transition-colors flex items-center gap-2"
                  >
                    <span>↑</span>
                    <span>Back</span>
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={submitting}
                  className="px-8 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {submitting ? "Submitting..." : currentQuestionIndex === form.questions.length - 1 ? "Submit" : "OK"}
                </button>
                <span className="text-sm text-neutral-400">
                  {currentQuestion.type === "long_text" ? (
                    <>
                      <kbd className="px-2 py-1 bg-white border border-neutral-300 rounded text-xs mr-1">Shift+Enter</kbd>
                      for new line, <kbd className="px-2 py-1 bg-white border border-neutral-300 rounded text-xs">Enter ↵</kbd> to continue
                    </>
                  ) : (
                    <>
                      press <kbd className="px-2 py-1 bg-white border border-neutral-300 rounded text-xs">Enter ↵</kbd>
                    </>
                  )}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/**
 * Dynamic question input component that renders the appropriate input
 * for each question type.
 */
function QuestionInput({
  question,
  value,
  onChange,
  onSubmit,
}: {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  // Short text
  if (question.type === "short_text") {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        placeholder="Type your answer here..."
        autoFocus
        className="w-full px-0 py-3 text-2xl border-b-2 border-neutral-300 focus:border-neutral-900 bg-transparent outline-none transition-colors placeholder:text-neutral-400"
      />
    );
  }

  // Long text - Shift+Enter for newlines, Enter to advance
  if (question.type === "long_text") {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          // Shift+Enter adds newline (default behavior)
          // Plain Enter advances to next question
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder="Type your answer here... (Shift+Enter for new line)"
        rows={6}
        autoFocus
        className="w-full px-4 py-3 text-lg border border-neutral-300 rounded-lg focus:border-neutral-900 outline-none transition-colors resize-none placeholder:text-neutral-400"
      />
    );
  }

  // Email
  if (question.type === "email") {
    return (
      <input
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        placeholder="name@example.com"
        autoFocus
        className="w-full px-0 py-3 text-2xl border-b-2 border-neutral-300 focus:border-neutral-900 bg-transparent outline-none transition-colors placeholder:text-neutral-400"
      />
    );
  }

  // Number
  if (question.type === "number") {
    const settings = question.settings_json || {};
    return (
      <div>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          placeholder="Enter a number"
          autoFocus
          className="w-full px-0 py-3 text-2xl border-b-2 border-neutral-300 focus:border-neutral-900 bg-transparent outline-none transition-colors placeholder:text-neutral-400"
        />
        {(settings.min !== undefined || settings.max !== undefined) && (
          <p className="text-sm text-neutral-500 mt-2">
            {settings.min !== undefined && settings.max !== undefined
              ? `Between ${settings.min} and ${settings.max}`
              : settings.min !== undefined
              ? `Minimum: ${settings.min}`
              : `Maximum: ${settings.max}`}
          </p>
        )}
      </div>
    );
  }

  // Multiple choice
  if (question.type === "multiple_choice") {
    return (
      <div className="space-y-3">
        {question.options.map((option) => (
          <button
            key={option.id}
            onClick={() => {
              onChange(option.label);
              // Auto-advance after selection
              setTimeout(onSubmit, 300);
            }}
            className={`w-full flex items-center gap-4 p-5 border-2 rounded-lg transition-all text-left ${
              value === option.label
                ? "border-neutral-900 bg-neutral-50"
                : "border-neutral-300 hover:border-neutral-400"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                value === option.label
                  ? "border-neutral-900 bg-neutral-900"
                  : "border-neutral-400"
              }`}
            >
              {value === option.label && (
                <div className="w-2 h-2 bg-white rounded-full" />
              )}
            </div>
            <span className="text-lg font-medium text-neutral-900">
              {option.label}
            </span>
          </button>
        ))}
      </div>
    );
  }

  // Dropdown - enhanced with better styling
  if (question.type === "dropdown") {
    return (
      <select
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          // If a value is selected (not the placeholder), we could optionally auto-advance
          // but for dropdowns, users might want to change their selection
        }}
        autoFocus
        className="w-full px-4 py-4 text-lg border-2 border-neutral-300 rounded-lg focus:border-neutral-900 outline-none transition-colors bg-white cursor-pointer hover:border-neutral-400"
      >
        <option value="" disabled>Select an option...</option>
        {question.options.map((option) => (
          <option key={option.id} value={option.label}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  // Yes/No
  if (question.type === "yes_no") {
    return (
      <div className="flex gap-4">
        {["yes", "no"].map((option) => (
          <button
            key={option}
            onClick={() => {
              onChange(option);
              // Auto-advance after selection
              setTimeout(onSubmit, 300);
            }}
            className={`flex-1 px-8 py-6 text-xl font-medium border-2 rounded-lg transition-all ${
              value === option
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 hover:border-neutral-400 text-neutral-900"
            }`}
          >
            {option === "yes" ? "Yes" : "No"}
          </button>
        ))}
      </div>
    );
  }

  // Rating
  if (question.type === "rating") {
    const max = question.settings_json?.max || 5;
    const currentRating = parseInt(value) || 0;

    return (
      <div className="space-y-6">
        <div className="flex gap-2 justify-center">
          {Array.from({ length: max }, (_, i) => i + 1).map((rating) => (
            <button
              key={rating}
              onClick={() => {
                onChange(rating.toString());
                // Auto-advance after selection
                setTimeout(onSubmit, 300);
              }}
              className={`w-16 h-16 flex items-center justify-center text-4xl transition-transform hover:scale-110 ${
                rating <= currentRating ? "opacity-100" : "opacity-30"
              }`}
            >
              ⭐
            </button>
          ))}
        </div>
        <div className="flex justify-between text-sm text-neutral-500 px-8">
          <span>1</span>
          <span>{max}</span>
        </div>
      </div>
    );
  }

  return null;
}

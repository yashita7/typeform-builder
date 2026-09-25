/**
 * TypeScript types matching the backend Pydantic schemas.
 * These ensure type safety between frontend and backend.
 */

// ============================================================================
// Question Types
// ============================================================================

export type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'multiple_choice'
  | 'dropdown'
  | 'email'
  | 'number'
  | 'yes_no'
  | 'rating';

// ============================================================================
// Question Option
// ============================================================================

export interface QuestionOption {
  id: number;
  question_id: number;
  label: string;
  order_index: number;
}

export interface QuestionOptionCreate {
  label: string;
  order_index: number;
}

// ============================================================================
// Question
// ============================================================================

export interface Question {
  id: number;
  form_id: number;
  type: QuestionType;
  title: string;
  description: string | null;
  required: boolean;
  order_index: number;
  settings_json: Record<string, any> | null;
  options: QuestionOption[];
}

export interface QuestionCreate {
  type: QuestionType;
  title: string;
  description?: string | null;
  required?: boolean;
  order_index: number;
  settings_json?: Record<string, any> | null;
  options?: QuestionOptionCreate[];
}

export interface QuestionUpdate {
  type?: QuestionType;
  title?: string;
  description?: string | null;
  required?: boolean;
  order_index?: number;
  settings_json?: Record<string, any> | null;
  options?: QuestionOptionCreate[];
}

// ============================================================================
// Form
// ============================================================================

export interface Form {
  id: number;
  title: string;
  description: string | null;
  status: 'draft' | 'published';
  share_slug: string | null;
  theme_json: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  questions: Question[];
}

export interface FormListItem {
  id: number;
  title: string;
  description: string | null;
  status: 'draft' | 'published';
  share_slug: string | null;
  created_at: string;
  updated_at: string;
  response_count: number;
}

export interface FormCreate {
  title: string;
  description?: string | null;
  theme_json?: Record<string, any> | null;
}

export interface FormUpdate {
  title?: string;
  description?: string | null;
  theme_json?: Record<string, any> | null;
}

// ============================================================================
// Answer
// ============================================================================

export interface Answer {
  id: number;
  response_id: number;
  question_id: number;
  value_text: string | null;
  value_json: Record<string, any> | null;
}

export interface AnswerCreate {
  question_id: number;
  value_text?: string | null;
  value_json?: Record<string, any> | null;
}

// ============================================================================
// Response
// ============================================================================

export interface Response {
  id: number;
  form_id: number;
  submitted_at: string;
  completed: boolean;
  started_at: string | null;
  answers: Answer[];
}

export interface ResponseListItem {
  id: number;
  form_id: number;
  submitted_at: string;
  completed: boolean;
}

export interface ResponseCreate {
  answers: AnswerCreate[];
  completed?: boolean;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface ReorderQuestionsRequest {
  question_ids: number[];
}

export interface FormStats {
  total_responses: number;
  completed_responses: number;
  question_stats: Record<string, any>[];
}

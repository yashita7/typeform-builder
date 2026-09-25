"use client";

/**
 * Form builder page - edit form questions with drag-and-drop and live preview.
 * 
 * Features (per product.md):
 * - Drag-and-drop question reordering (@dnd-kit)
 * - Add questions (all 8 types)
 * - Per-question editor: title, description, required, type-specific settings
 * - Live preview panel (mirrors respondent-flow styling)
 * - Autosave with "Saved" indicator
 * - Delete questions
 */

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { api } from "@/lib/api";
import type { Form, Question, QuestionCreate } from "@/lib/types";
import { QuestionListItem } from "@/components/builder/QuestionListItem";
import { QuestionEditor } from "@/components/builder/QuestionEditor";
import { QuestionPreview } from "@/components/builder/QuestionPreview";
import { AddQuestionMenu } from "@/components/builder/AddQuestionMenu";
import { LogicTab } from "@/components/builder/LogicTab";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function FormBuilderPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const formId = parseInt(resolvedParams.id);
  const router = useRouter();

  const [form, setForm] = useState<Form | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<"questions" | "logic">("questions");

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load form and questions
  useEffect(() => {
    loadForm();
  }, [formId]);

  async function loadForm() {
    try {
      setLoading(true);
      const data = await api.get<Form>(`/forms/${formId}`);
      setForm(data);
      setQuestions(data.questions);
      // Auto-select first question if available
      if (data.questions.length > 0 && !selectedQuestionId) {
        setSelectedQuestionId(data.questions[0].id);
      }
    } catch (error) {
      toast.error("Failed to load form");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Add a new question
  async function handleAddQuestion(type: Question["type"]) {
    try {
      const newQuestion: QuestionCreate = {
        type,
        title: getDefaultTitle(type),
        description: "",
        required: false,
        order_index: questions.length,
        settings_json: getDefaultSettings(type),
        options: type === "multiple_choice" || type === "dropdown" 
          ? [{ label: "Option 1", order_index: 0 }]
          : undefined,
      };

      const created = await api.post<Question>(
        `/forms/${formId}/questions`,
        newQuestion
      );
      
      setQuestions([...questions, created]);
      setSelectedQuestionId(created.id);
      toast.success("Question added");
    } catch (error) {
      toast.error("Failed to add question");
      console.error(error);
    }
  }

  // Update a question (autosave)
  async function handleUpdateQuestion(questionId: number, updates: Partial<Question>) {
    try {
      setSaving(true);
      const updated = await api.patch<Question>(
        `/forms/${formId}/questions/${questionId}`,
        updates
      );
      
      setQuestions(questions.map((q) => (q.id === questionId ? updated : q)));
      setLastSaved(new Date());
      
      // Clear saving indicator after a delay
      setTimeout(() => setSaving(false), 500);
    } catch (error) {
      setSaving(false);
      toast.error("Failed to save question");
      console.error(error);
    }
  }

  // Delete a question
  async function handleDeleteQuestion(questionId: number) {
    try {
      await api.delete(`/forms/${formId}/questions/${questionId}`);
      const newQuestions = questions.filter((q) => q.id !== questionId);
      setQuestions(newQuestions);
      
      // Select another question if current was deleted
      if (selectedQuestionId === questionId && newQuestions.length > 0) {
        setSelectedQuestionId(newQuestions[0].id);
      } else if (newQuestions.length === 0) {
        setSelectedQuestionId(null);
      }
      
      toast.success("Question deleted");
    } catch (error) {
      toast.error("Failed to delete question");
      console.error(error);
    }
  }

  // Handle drag end
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);

      const reordered = arrayMove(questions, oldIndex, newIndex);
      setQuestions(reordered);

      // Send reorder request to backend
      try {
        const questionIds = reordered.map((q) => q.id);
        await api.patch(`/forms/${formId}/questions/reorder`, { question_ids: questionIds });
        setLastSaved(new Date());
      } catch (error) {
        toast.error("Failed to reorder questions");
        // Revert on error
        loadForm();
      }
    }
  }

  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-neutral-500">Loading form...</div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-neutral-500">Form not found</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header - Enhanced */}
      <header className="border-b border-neutral-200 bg-white shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/forms")}
                className="text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-xl font-semibold text-neutral-900">
                  {form.title}
                </h1>
                <div className="flex items-center gap-2 text-sm text-neutral-500 mt-1">
                  {saving ? (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </span>
                  ) : lastSaved ? (
                    <span>✓ Saved {formatTime(lastSaved)}</span>
                  ) : (
                    <span>✓ All changes saved</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/forms/${formId}/settings`)}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-all duration-300"
              >
                Settings
              </button>
              <button
                onClick={() => router.push(`/forms/${formId}/responses`)}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-all duration-300"
              >
                Responses
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-1 border-b border-neutral-200 -mb-px">
            <button 
              onClick={() => setActiveTab("questions")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "questions"
                  ? "text-neutral-900 border-b-2 border-neutral-900"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              Questions
            </button>
            <button
              onClick={() => setActiveTab("logic")}
              className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === "logic"
                  ? "text-neutral-900 border-b-2 border-neutral-900"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              Logic
              <span className="text-xs bg-neutral-200 text-neutral-600 px-2 py-0.5 rounded-full">Soon</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content: 3-column layout OR logic tab */}
      {activeTab === "questions" ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Left sidebar: Question list */}
          <div className="w-80 border-r border-neutral-200 bg-neutral-50 overflow-y-auto">
            <div className="p-4">
              <div className="mb-4">
                <AddQuestionMenu onAddQuestion={handleAddQuestion} />
              </div>

              {questions.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">
                  <div className="text-4xl mb-2">📝</div>
                  <p>No questions yet</p>
                  <p className="text-sm">Add your first question to get started</p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={questions.map((q) => q.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {questions.map((question, index) => (
                        <QuestionListItem
                          key={question.id}
                          question={question}
                          index={index}
                          isSelected={selectedQuestionId === question.id}
                          onClick={() => setSelectedQuestionId(question.id)}
                          onDelete={() => handleDeleteQuestion(question.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>

          {/* Center: Question editor */}
          <div className="flex-1 overflow-y-auto bg-white">
            {selectedQuestion ? (
              <QuestionEditor
                question={selectedQuestion}
                onUpdate={(updates) =>
                  handleUpdateQuestion(selectedQuestion.id, updates)
                }
              />
            ) : (
              <div className="flex items-center justify-center h-full text-neutral-500">
                Select a question to edit
              </div>
            )}
          </div>

          {/* Right sidebar: Live preview */}
          <div className="w-96 border-l border-neutral-200 bg-neutral-50 overflow-y-auto">
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-neutral-700">Live Preview</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  This is how respondents will see this question
                </p>
              </div>
              {selectedQuestion ? (
                <QuestionPreview question={selectedQuestion} />
              ) : (
                <div className="text-center py-12 text-neutral-400">
                  No question selected
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto bg-white">
          <LogicTab />
        </div>
      )}
    </div>
  );
}

// Helper functions
function getDefaultTitle(type: Question["type"]): string {
  const defaults: Record<Question["type"], string> = {
    short_text: "Short answer question",
    long_text: "Long answer question",
    multiple_choice: "Multiple choice question",
    dropdown: "Dropdown question",
    email: "Email address",
    number: "Number question",
    yes_no: "Yes or no question",
    rating: "Rating question",
  };
  return defaults[type];
}

function getDefaultSettings(type: Question["type"]): Record<string, any> | null {
  if (type === "rating") {
    return { max: 5 };
  }
  if (type === "number") {
    return { min: 0, max: 100 };
  }
  return null;
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diff < 10) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

"use client";

/**
 * Form responses view - see all submissions for a form.
 * 
 * Features (per product.md "Results / Responses"):
 * - List of all responses with submission timestamp
 * - Click to view individual response in full
 * - Basic summary stats per question (counts for choice questions)
 * - Pagination support (skip/limit from the backend)
 * 
 * Design: Clean table/list layout with stats overview at the top.
 */

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import type { Form, Response } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface ResponseListItem {
  id: number;
  form_id: number;
  submitted_at: string;
  completed: boolean;
}

interface Stats {
  question_id: number;
  question_title: string;
  question_type: string;
  total_answers: number;
  response_count?: number;
  value_distribution?: Record<string, number>;
}

export default function FormResponsesPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const formId = parseInt(resolvedParams.id);
  const router = useRouter();

  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<ResponseListItem[]>([]);
  const [stats, setStats] = useState<Stats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResponseId, setSelectedResponseId] = useState<number | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null);

  useEffect(() => {
    loadData();
  }, [formId]);

  async function loadData() {
    try {
      setLoading(true);
      
      // Load form details
      const formData = await api.get<Form>(`/forms/${formId}`);
      setForm(formData);
      
      // Load responses list
      const responsesData = await api.get<ResponseListItem[]>(`/forms/${formId}/responses`);
      setResponses(responsesData);
      
      // Load stats
      const statsData = await api.get<{ question_stats: Stats[] }>(`/forms/${formId}/stats`);
      setStats(statsData.question_stats || []);
    } catch (error) {
      toast.error("Failed to load responses");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function loadResponseDetail(responseId: number) {
    try {
      const data = await api.get<Response>(`/forms/${formId}/responses/${responseId}`);
      setSelectedResponse(data);
      setSelectedResponseId(responseId);
    } catch (error) {
      toast.error("Failed to load response details");
      console.error(error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-neutral-500">Loading responses...</div>
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
    <div className="min-h-screen bg-neutral-50">
      {/* Header - enhanced with more context */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <button
            onClick={() => router.push("/forms")}
            className="text-neutral-600 hover:text-neutral-900 mb-4 inline-block transition-colors"
          >
            ← Back to dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-neutral-900 mb-1">
                {form.title}
              </h1>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-neutral-600">
                  {responses.length} {responses.length === 1 ? "response" : "responses"}
                </span>
                {responses.length > 0 && (
                  <>
                    <span className="text-neutral-400">•</span>
                    <span className="text-neutral-600">
                      {responses.filter(r => r.completed).length} completed
                    </span>
                  </>
                )}
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-600">
                  {form.questions.length} {form.questions.length === 1 ? "question" : "questions"}
                </span>
                <span className="text-neutral-400">•</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    form.status === "published"
                      ? "bg-green-100 text-green-700"
                      : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {form.status === "published" ? "Published" : "Draft"}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {form.status === "published" && form.share_slug && (
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/f/${form.share_slug}`;
                    navigator.clipboard.writeText(url);
                    toast.success("Link copied to clipboard");
                  }}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Copy link
                </button>
              )}
              <button
                onClick={() => router.push(`/forms/${formId}/edit`)}
                className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
              >
                Edit form
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary stats - enhanced with bar charts */}
        {responses.length > 0 && stats.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-neutral-900">Summary Statistics</h2>
              <span className="text-sm text-neutral-600">
                Based on {responses.length} {responses.length === 1 ? "response" : "responses"}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.map((stat) => (
                <div key={stat.question_id} className="bg-white border border-neutral-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                  <div className="mb-4">
                    <h3 className="font-medium text-neutral-900 mb-1 line-clamp-2">
                      {stat.question_title}
                    </h3>
                    <p className="text-xs text-neutral-500">
                      {getTypeLabel(stat.question_type)}
                    </p>
                  </div>
                  
                  {/* Show stats based on question type - with bar charts for choice questions */}
                  {stat.value_distribution ? (
                    <div className="space-y-3">
                      {Object.entries(stat.value_distribution)
                        .sort(([, a], [, b]) => b - a) // Sort by count descending
                        .map(([option, count]) => {
                          const total = Object.values(stat.value_distribution!).reduce((sum, c) => sum + c, 0);
                          const percentage = total > 0 ? (count / total) * 100 : 0;
                          
                          return (
                            <div key={option}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-neutral-600 truncate mr-2 flex-1">
                                  {option}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-neutral-900">
                                    {count}
                                  </span>
                                  <span className="text-xs text-neutral-500">
                                    ({percentage.toFixed(0)}%)
                                  </span>
                                </div>
                              </div>
                              {/* Bar chart */}
                              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-neutral-900 transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-2xl font-semibold text-neutral-900">
                      {stat.response_count || 0}
                      <span className="text-sm font-normal text-neutral-500 ml-2">
                        {stat.response_count === 1 ? "answer" : "answers"}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Responses list - enhanced table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-neutral-900">All Responses</h2>
            {responses.length > 0 && (
              <span className="text-sm text-neutral-500">
                Showing {responses.length} {responses.length === 1 ? "response" : "responses"}
              </span>
            )}
          </div>
          
          {responses.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center">
              <div className="text-4xl mb-3">📊</div>
              <p className="text-neutral-600 mb-2">No responses yet</p>
              <p className="text-sm text-neutral-500">
                Share your form to start collecting responses
              </p>
            </div>
          ) : (
            <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                      Response ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {responses.map((response) => (
                    <tr
                      key={response.id}
                      className="hover:bg-neutral-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                        #{response.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600">
                        {formatDate(response.submitted_at)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            response.completed
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {response.completed ? "Completed" : "Partial"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => loadResponseDetail(response.id)}
                          className="text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
                        >
                          View details →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Response detail modal with animations */}
      <AnimatePresence>
        {selectedResponse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedResponseId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">
                    Response #{selectedResponse.id}
                  </h2>
                  <p className="text-sm text-neutral-600">
                    Submitted {formatDate(selectedResponse.submitted_at)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedResponseId(null)}
                  className="text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg p-2 transition-all active:scale-95"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {selectedResponse.answers.map((answer, index) => {
                  const question = form.questions.find((q) => q.id === answer.question_id);
                  if (!question) return null;

                  return (
                    <motion.div
                      key={answer.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-neutral-200 pb-6 last:border-0 last:pb-0"
                    >
                      <div className="mb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-neutral-500">
                                Question {index + 1}
                              </span>
                              {question.required && (
                                <span className="text-xs text-red-600">*</span>
                              )}
                            </div>
                            <h3 className="font-medium text-neutral-900">
                              {question.title}
                            </h3>
                          </div>
                          <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded">
                            {getTypeLabel(question.type)}
                          </span>
                        </div>
                      </div>
                      <div className="pl-4 border-l-2 border-neutral-200">
                        {answer.value_text ? (
                          <p className="text-neutral-700 whitespace-pre-wrap">{answer.value_text}</p>
                        ) : (
                          <p className="text-neutral-400 italic">No answer provided</p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    short_text: "Short text",
    long_text: "Long text",
    multiple_choice: "Multiple choice",
    dropdown: "Dropdown",
    email: "Email",
    number: "Number",
    yes_no: "Yes/No",
    rating: "Rating",
  };
  return labels[type] || type;
}

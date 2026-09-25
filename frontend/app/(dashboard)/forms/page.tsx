"use client";

/**
 * Creator dashboard - list of forms with CRUD operations.
 * 
 * Features (per product.md):
 * - List forms with title, status badge, response count
 * - Create form (modal with title input)
 * - Rename inline
 * - Duplicate
 * - Delete (with confirm dialog)
 * - Publish/unpublish
 * - Show shareable link + copy button when published
 * - Toast notifications for all mutations
 * 
 * Design: Clean Typeform-inspired cards with generous whitespace.
 */

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { FormListItem } from "@/lib/types";
import { FormCard } from "@/components/FormCard";
import { CreateFormModal } from "@/components/CreateFormModal";

export default function FormsPage() {
  const [forms, setForms] = useState<FormListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Load forms on mount
  useEffect(() => {
    loadForms();
  }, []);

  async function loadForms() {
    try {
      setLoading(true);
      const data = await api.get<FormListItem[]>("/forms");
      setForms(data);
    } catch (error) {
      toast.error("Failed to load forms");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Create a new form
  async function handleCreate(title: string) {
    try {
      const newForm = await api.post<FormListItem>("/forms", { title });
      setForms([newForm, ...forms]); // Add to top
      toast.success("Form created");
      setIsCreateModalOpen(false);
    } catch (error) {
      // Show actual error message from backend if available
      const message = error instanceof Error ? error.message : "Failed to create form";
      toast.error(message);
      console.error("Create form error:", error);
    }
  }

  // Rename a form
  async function handleRename(id: number, newTitle: string) {
    try {
      const updated = await api.patch<FormListItem>(`/forms/${id}`, {
        title: newTitle,
      });
      setForms(forms.map((f) => (f.id === id ? updated : f)));
      toast.success("Form renamed");
    } catch (error) {
      toast.error("Failed to rename form");
      console.error(error);
    }
  }

  // Duplicate a form
  async function handleDuplicate(id: number) {
    try {
      const duplicated = await api.post<FormListItem>(`/forms/${id}/duplicate`, {});
      setForms([duplicated, ...forms]); // Add to top
      toast.success("Form duplicated");
    } catch (error) {
      toast.error("Failed to duplicate form");
      console.error(error);
    }
  }

  // Delete a form
  async function handleDelete(id: number) {
    try {
      await api.delete(`/forms/${id}`);
      setForms(forms.filter((f) => f.id !== id));
      toast.success("Form deleted");
    } catch (error) {
      toast.error("Failed to delete form");
      console.error(error);
    }
  }

  // Publish a form
  async function handlePublish(id: number) {
    try {
      const updated = await api.post<FormListItem>(`/forms/${id}/publish`, {});
      setForms(forms.map((f) => (f.id === id ? updated : f)));
      toast.success("Form published");
    } catch (error) {
      toast.error("Failed to publish form");
      console.error(error);
    }
  }

  // Unpublish a form
  async function handleUnpublish(id: number) {
    try {
      const updated = await api.post<FormListItem>(`/forms/${id}/unpublish`, {});
      setForms(forms.map((f) => (f.id === id ? updated : f)));
      toast.success("Form unpublished");
    } catch (error) {
      toast.error("Failed to unpublish form");
      console.error(error);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-8 py-16">
        {/* Header with create button - Minimal Typeform style */}
        <div className="flex items-center justify-between mb-20">
          <div>
            <h1 className="text-5xl font-bold text-black mb-4">
              My Forms
            </h1>
            <p className="text-xl text-neutral-600">
              {forms.length > 0 ? `${forms.length} ${forms.length === 1 ? 'form' : 'forms'}` : 'Create and manage your forms'}
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-8 py-4 bg-black text-white rounded-lg hover:bg-neutral-800 transition-all duration-200 font-medium text-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-4"
          >
            + Create form
          </button>
        </div>

        {/* Loading state - Minimal skeleton */}
        {loading && (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white border border-neutral-200 rounded-2xl p-10 h-48">
                  <div className="h-8 bg-neutral-100 rounded w-2/3 mb-6"></div>
                  <div className="h-4 bg-neutral-50 rounded w-1/3 mb-8"></div>
                  <div className="flex gap-4">
                    <div className="h-12 bg-neutral-50 rounded flex-1"></div>
                    <div className="h-12 bg-neutral-50 rounded w-12"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state - Clean and minimal */}
        {!loading && forms.length === 0 && (
          <div className="text-center py-32 bg-white border border-neutral-200 rounded-3xl">
            <div className="text-8xl mb-10">📝</div>
            <h3 className="text-3xl font-bold text-black mb-4">
              No forms yet
            </h3>
            <p className="text-neutral-600 mb-12 text-xl max-w-md mx-auto">
              Create your first form to start collecting responses
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-10 py-5 bg-black text-white rounded-xl hover:bg-neutral-800 transition-all duration-200 font-medium text-lg shadow-md hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-4"
            >
              + Create your first form
            </button>
          </div>
        )}

        {/* Forms list - Single column with large cards and generous spacing */}
        {!loading && forms.length > 0 && (
          <div className="space-y-8">
            {forms.map((form) => (
              <FormCard
                key={form.id}
                form={form}
                onRename={handleRename}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
                onPublish={handlePublish}
                onUnpublish={handleUnpublish}
              />
            ))}
          </div>
        )}

        {/* Create form modal */}
        <CreateFormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreate}
        />
      </div>
    </div>
  );
}

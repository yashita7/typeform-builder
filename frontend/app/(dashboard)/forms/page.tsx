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
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header with create button - Enhanced */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-semibold text-neutral-900 mb-2">
              My Forms
            </h1>
            <p className="text-lg text-neutral-600">
              {forms.length > 0 ? `${forms.length} ${forms.length === 1 ? 'form' : 'forms'}` : 'Create and manage your forms'}
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-all duration-300 font-medium shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
          >
            + Create form
          </button>
        </div>

        {/* Loading state - Enhanced with skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white border border-neutral-200 rounded-xl p-6 h-64">
                  <div className="h-6 bg-neutral-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-neutral-100 rounded w-1/2 mb-8"></div>
                  <div className="h-10 bg-neutral-100 rounded mb-2"></div>
                  <div className="flex gap-2 mt-4">
                    <div className="h-10 bg-neutral-100 rounded flex-1"></div>
                    <div className="h-10 bg-neutral-100 rounded w-10"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state - Enhanced */}
        {!loading && forms.length === 0 && (
          <div className="text-center py-20 bg-white border-2 border-dashed border-neutral-300 rounded-2xl">
            <div className="text-7xl mb-6">📝</div>
            <h3 className="text-2xl font-semibold text-neutral-900 mb-3">
              No forms yet
            </h3>
            <p className="text-neutral-600 mb-8 text-lg">
              Create your first form to start collecting responses
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-8 py-4 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-all duration-300 font-medium text-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
            >
              + Create your first form
            </button>
          </div>
        )}

        {/* Forms grid - Enhanced spacing */}
        {!loading && forms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

"use client";

/**
 * Form settings page with Coming Soon placeholders
 * Per product.md: theme customization and thank-you screen are placeholders
 */

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Form } from "@/lib/types";
import { ComingSoonPanel } from "@/components/ComingSoonPanel";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function FormSettingsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const formId = parseInt(resolvedParams.id);
  const router = useRouter();

  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForm();
  }, [formId]);

  async function loadForm() {
    try {
      setLoading(true);
      const data = await api.get<Form>(`/forms/${formId}`);
      setForm(data);
    } catch (error) {
      toast.error("Failed to load form");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-neutral-500">Loading settings...</div>
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
      {/* Header */}
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
              <p className="text-neutral-600">Form Settings</p>
            </div>
            <button
              onClick={() => router.push(`/forms/${formId}/edit`)}
              className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              Edit questions
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Theme Customization */}
          <ComingSoonPanel
            title="Theme Customization"
            description="Customize your form's appearance with colors, fonts, and backgrounds to match your brand."
            icon="🎨"
            features={[
              "Custom brand colors",
              "Font selection",
              "Background images",
              "Button styles",
              "Logo placement",
            ]}
          />

          {/* Thank You Screen */}
          <ComingSoonPanel
            title="Thank You Screen"
            description="Customize what respondents see after completing your form."
            icon="✨"
            features={[
              "Custom message",
              "Redirect to URL",
              "Social sharing buttons",
              "Download content",
              "Show response summary",
            ]}
          />

          {/* Integrations */}
          <ComingSoonPanel
            title="Integrations & Webhooks"
            description="Connect your form to other tools and automate your workflows."
            icon="🔗"
            features={[
              "Webhook notifications",
              "Zapier integration",
              "Google Sheets sync",
              "Email notifications",
              "Slack notifications",
            ]}
          />

          {/* Team Collaboration */}
          <ComingSoonPanel
            title="Team Collaboration"
            description="Invite team members to collaborate on your forms and manage permissions."
            icon="👥"
            features={[
              "Invite team members",
              "Role-based permissions",
              "Comments & feedback",
              "Version history",
              "Activity logs",
            ]}
          />
        </div>
      </div>
    </div>
  );
}

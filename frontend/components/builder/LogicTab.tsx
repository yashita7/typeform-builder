/**
 * Logic tab for the builder showing Coming Soon panels for logic jumps/branching.
 * Per product.md: logic jumps are explicitly listed as mocked/placeholder.
 */

import { ComingSoonPanel } from "../ComingSoonPanel";

export function LogicTab() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
          Logic & Branching
        </h2>
        <p className="text-neutral-600">
          Create conditional logic to show or hide questions based on previous answers, 
          making your forms smarter and more personalized.
        </p>
      </div>

      <div className="space-y-6">
        <ComingSoonPanel
          title="Conditional Logic Jumps"
          description="Jump to specific questions based on how respondents answer, creating a personalized form experience for each person."
          icon="🔀"
          size="large"
          features={[
            "Skip questions based on answers",
            "Jump to specific questions",
            "Show/hide questions conditionally",
            "Multi-condition rules (AND/OR)",
            "Visual logic flow editor",
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ComingSoonPanel
            title="Advanced Branching"
            description="Create complex multi-path forms with nested conditions and custom endings."
            icon="🌳"
            features={[
              "Multiple endings",
              "Nested conditions",
              "Score-based routing",
              "Custom thank-you screens per path",
            ]}
          />

          <ComingSoonPanel
            title="Calculation Logic"
            description="Perform calculations based on numeric answers and use results in your logic."
            icon="🧮"
            features={[
              "Sum, average, multiply answers",
              "Hidden calculated fields",
              "Display calculations to users",
              "Use in conditional jumps",
            ]}
          />
        </div>
      </div>
    </div>
  );
}

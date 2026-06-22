type OnboardingPanelProps = {
  exampleQuestions: string[];
  onUseExampleQuestion: (question: string) => void;
};

const HOW_SAVANT_WORKS = [
  {
    title: "Upload one paper",
    body: "Drop in a PDF and Savant extracts the text, chunks it, and prepares grounded retrieval for that document.",
  },
  {
    title: "Ask focused questions",
    body: "Query the paper in plain English and Savant searches for supporting evidence before drafting an answer.",
  },
  {
    title: "Verify and explore",
    body: "Inspect citations, see fallback states clearly, and move into the concept graph once the paper is ready.",
  },
  {
    title: "Scale to a workspace",
    body: "Bring in papers from the web, compare multiple documents, and save durable research memory as you learn.",
  },
];

export function OnboardingPanel({ exampleQuestions, onUseExampleQuestion }: OnboardingPanelProps) {
  return (
    <section className="rounded-2xl border border-[#cfb999] bg-[#fffaf2]/80 p-4 shadow-[0_10px_24px_rgba(66,46,20,0.08)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#8a6344]">First Run Guide</div>
          <h2 className="mt-2 text-xl font-semibold text-[#2d2118]">Start with one paper, then let the workflow guide you.</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#6d5742]">
            Savant works best when you treat it like a research workspace rather than a one-shot chatbot. Upload a paper,
            ask a few concrete questions, inspect the evidence, and then move into the graph view for structure.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {HOW_SAVANT_WORKS.map((step, index) => (
              <div key={step.title} className="rounded-xl border border-[#d8c7ab] bg-[#fffdf8] p-3">
                <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#9a7a57]">Step {index + 1}</div>
                <div className="mt-1 text-sm font-semibold text-[#3e3026]">{step.title}</div>
                <div className="mt-1 text-xs leading-relaxed text-[#725e4b]">{step.body}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-md rounded-2xl border border-[#d8c7ab] bg-[#fffdf8] p-4">
          <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#8a6344]">Starter Prompts</div>
          <p className="mt-2 text-xs leading-relaxed text-[#725e4b]">
            These are good first questions once a paper is uploaded. Clicking one will prefill the composer so the user
            can start with a strong research-oriented prompt.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {exampleQuestions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => onUseExampleQuestion(question)}
                className="rounded-full border border-[#cfb999] bg-[#f8efe0] px-3 py-2 text-left text-xs font-mono text-[#5f4734] transition hover:border-[#8a6344] hover:text-[#2c2119]"
              >
                {question}
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-[#ead9ba] bg-[#fbf5e8] p-3 text-xs leading-relaxed text-[#71543c]">
            Sample paper flow:
            Upload one PDF, ask for the methodology, then ask which evidence best supports the conclusion. That usually
            gives the clearest demo of grounded retrieval and citation inspection.
          </div>
        </div>
      </div>
    </section>
  );
}

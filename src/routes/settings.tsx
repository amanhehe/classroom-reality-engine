import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon } from "lucide-react";
import { AppShell } from "../components/app-shell";
import { useLearner } from "../lib/learner-store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings | AI KYRO" },
      { name: "description", content: "Control classroom voices, dialogue length, captions, and voice capture." },
      { property: "og:title", content: "Settings | AI KYRO" },
      { property: "og:description", content: "Control voices, dialogue length, captions, and microphone use." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

const OPTIONS = [
  { key: "readAloud", title: "Classroom voices", detail: "Speak each turn aloud with a distinct voice" },
  { key: "reducedDialogue", title: "Reduced dialogue", detail: "Fewer turns per class, straight to the core idea" },
  { key: "captions", title: "Live captions", detail: "Show every spoken statement as text" },
  { key: "multimodal", title: "Voice capture", detail: "Let the class listen while you explain aloud" },
] as const;

function SettingsPage() {
  const { state, update } = useLearner();

  return (
    <AppShell title="Settings">
      <div className="page-stack">
        <section className="panel">
          <header className="panel-head">
            <span className="panel-icon">
              <SettingsIcon size={18} />
            </span>
            <div>
              <h2>Your classroom</h2>
              <p className="muted">You can decline the microphone and still use everything else.</p>
            </div>
          </header>
          <div className="settings-list">
            {OPTIONS.map((option) => (
              <label key={option.key}>
                <span>
                  <strong>{option.title}</strong>
                  <small>{option.detail}</small>
                </span>
                <input
                  type="checkbox"
                  checked={state.settings[option.key]}
                  onChange={() =>
                    update((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, [option.key]: !prev.settings[option.key] },
                    }))
                  }
                />
              </label>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

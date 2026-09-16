import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Beaker, Sigma, Sparkles, Wand2 } from "lucide-react";
import { AppShell } from "../components/app-shell";
import { MODULES } from "../lib/aikyro-data";
import { generateModule } from "../lib/ai.functions";
import { Button } from "../components/ui/button";
import { useLearner } from "../lib/learner-store";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Class Library | AI KYRO" },
      { name: "description", content: "Choose a concept or type your own topic and have a full class built for it." },
      { property: "og:title", content: "Class Library | AI KYRO" },
      { property: "og:description", content: "Pick a concept, or create your own topic and learn it through discussion." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const navigate = useNavigate();
  const { state, update } = useLearner();
  const [topic, setTopic] = useState("");
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const build = useServerFn(generateModule);

  async function createClass() {
    const text = topic.trim();
    if (!text) return;
    setBuilding(true);
    setError(null);
    try {
      const concept = await build({ data: { topic: text } });
      update((prev) => ({ ...prev, customConcepts: [...prev.customConcepts, concept] }));
      setTopic("");
      await navigate({ to: "/classroom/$conceptId", params: { conceptId: concept.id } });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "That class could not be built — try another wording.");
    } finally {
      setBuilding(false);
    }
  }

  return (
    <AppShell title="Class Library">
      <div className="page-stack">
        <section className="panel">
          <header className="panel-head">
            <span className="panel-icon">
              <Wand2 size={18} />
            </span>
            <div>
              <h2>Bring your own topic</h2>
              <p className="muted">
                Type anything you are stuck on. A teacher and two students are written for it, with a blank to fill and a
                checkpoint at the end.
              </p>
            </div>
          </header>
          <div className="topic-row">
            <input
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && void createClass()}
              placeholder="e.g. why aeroplane wings create lift"
              aria-label="Your topic"
            />
            <Button variant="accent" disabled={!topic.trim() || building} onClick={() => void createClass()}>
              {building ? "Building your class…" : "Build my class"} <ArrowRight size={15} />
            </Button>
          </div>
          {building && <p className="muted">Writing the discussion, the blank and the checkpoint…</p>}
          {error && <p className="error-note">{error}</p>}
        </section>

        {state.customConcepts.length > 0 && (
          <section className="panel">
            <header className="panel-head">
              <span className="panel-icon">
                <Sparkles size={18} />
              </span>
              <div>
                <h2>Your topics</h2>
                <p className="muted">Classes built from what you asked for.</p>
              </div>
              <span className="count-pill">{state.customConcepts.length}</span>
            </header>
            <div className="concept-list">
              {state.customConcepts.map((concept) => (
                <Link key={concept.id} to="/classroom/$conceptId" params={{ conceptId: concept.id }} className="concept-row">
                  <span className="concept-dot" />
                  <span className="concept-name">{concept.name}</span>
                  <span className="bloom-tag">{concept.bloom}</span>
                  <span className="concept-go">
                    Enter class <ArrowRight size={14} />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {MODULES.map((mod, index) => {
          const Icon = index % 2 ? Sigma : Beaker;
          return (
            <section className="panel" key={mod.id}>
              <header className="panel-head">
                <span className="panel-icon">
                  <Icon size={18} />
                </span>
                <div>
                  <h2>{mod.name}</h2>
                  <p className="muted">{mod.blurb}</p>
                </div>
                <span className="count-pill">{mod.concepts.length} concepts</span>
              </header>
              <div className="concept-list">
                {mod.concepts.map((concept) => (
                  <Link
                    key={concept.id}
                    to="/classroom/$conceptId"
                    params={{ conceptId: concept.id }}
                    className="concept-row"
                  >
                    <span className="concept-dot" />
                    <span className="concept-name">{concept.name}</span>
                    <span className="bloom-tag">{concept.bloom}</span>
                    <span className="concept-go">
                      Enter class <ArrowRight size={14} />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </AppShell>
  );
}

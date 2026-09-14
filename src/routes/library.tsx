import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Beaker, Mic, Sigma, Sparkles } from "lucide-react";
import { AppShell } from "../components/app-shell";
import { MODULES } from "../lib/aikyro-data";
import { Button } from "../components/ui/button";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Class Library | AI KYRO" },
      { name: "description", content: "Choose a concept or enter your own topic and start a live classroom discussion." },
      { property: "og:title", content: "Class Library | AI KYRO" },
      { property: "og:description", content: "Pick a concept and learn through a live teacher–student discussion." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [reduced, setReduced] = useState(false);
  const [multimodal, setMultimodal] = useState(false);

  return (
    <AppShell title="Class Library">
      <div className="page-stack">
        <section className="panel">
          <h2>Bring your own topic</h2>
          <p className="muted">
            Type anything you are stuck on. A teacher and two students will work through it with you.
          </p>
          <div className="topic-row">
            <input
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="e.g. why entropy always increases"
              aria-label="Your topic"
            />
            <Button
              variant="accent"
              disabled={!topic.trim()}
              onClick={() => navigate({ to: "/classroom/$conceptId", params: { conceptId: "conservation_of_energy" } })}
            >
              Start class <ArrowRight size={15} />
            </Button>
          </div>
          <div className="option-row">
            <label>
              <input type="checkbox" checked={reduced} onChange={() => setReduced((v) => !v)} />
              <span>
                <strong>Reduced dialogue</strong>
                <small>Fewer turns, straight to the core idea</small>
              </span>
            </label>
            <label>
              <input type="checkbox" checked={multimodal} onChange={() => setMultimodal((v) => !v)} />
              <span>
                <strong>
                  <Mic size={13} /> Voice signal
                </strong>
                <small>Let the class listen while you explain aloud</small>
              </span>
            </label>
          </div>
        </section>

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

        <p className="foot-note">
          <Sparkles size={13} /> Every class ends with a checkpoint, then a retention quiz a few days later.
        </p>
      </div>
    </AppShell>
  );
}

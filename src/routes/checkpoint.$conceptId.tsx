import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { AppShell } from "../components/app-shell";
import { Button } from "../components/ui/button";
import { findConcept } from "../lib/aikyro-data";
import { useLearner } from "../lib/learner-store";

export const Route = createFileRoute("/checkpoint/$conceptId")({
  head: () => ({
    meta: [
      { title: "Checkpoint | AI KYRO" },
      { name: "description", content: "Answer the end-of-class checkpoint and see what still needs work." },
      { property: "og:title", content: "Checkpoint | AI KYRO" },
      { property: "og:description", content: "A short check right after class, then a delayed quiz later." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CheckpointPage,
});

function CheckpointPage() {
  const { conceptId } = useParams({ from: "/checkpoint/$conceptId" });
  const { state, update, addPoints } = useLearner();
  const concept = useMemo(
    () => findConcept(conceptId) ?? state.customConcepts.find((c) => c.id === conceptId),
    [conceptId, state.customConcepts],
  );
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!concept) {
    return (
      <AppShell title="Checkpoint">
        <div className="page-stack">
          <section className="panel">
            <h2>Nothing to check yet</h2>
            <Link to="/library" className="inline-link">
              Pick a concept
            </Link>
          </section>
        </div>
      </AppShell>
    );
  }

  const questions = concept.checkpoint;
  const score = questions.filter((question) => picked[question.id] === question.answer).length;

  function submit() {
    setSubmitted(true);
    const correct = questions.filter((question) => picked[question.id] === question.answer).length;
    addPoints(correct * 5);
    update((prev) => ({
      ...prev,
      completedCheckpoints: { ...prev.completedCheckpoints, [concept.id]: correct },
    }));
  }

  return (
    <AppShell title="Checkpoint">
      <div className="page-stack">
        <section className="panel">
          <header className="panel-head">
            <div>
              <h2>{concept.name}</h2>
              <p className="muted">No hints here — this is the part that measures whether the class worked.</p>
            </div>
          </header>

          <div className="check-list">
            {questions.map((question, index) => (
              <article key={question.id} className="check-card">
                <strong>
                  {index + 1}. {question.prompt}
                </strong>
                <div className="check-options">
                  {question.options.map((option) => {
                    const chosen = picked[question.id] === option;
                    const correct = submitted && option === question.answer;
                    const wrong = submitted && chosen && option !== question.answer;
                    return (
                      <button
                        key={option}
                        className={`check-option ${chosen ? "chosen" : ""} ${correct ? "correct" : ""} ${wrong ? "wrong" : ""}`}
                        onClick={() => !submitted && setPicked((prev) => ({ ...prev, [question.id]: option }))}
                      >
                        {option}
                        {correct && <CheckCircle2 size={15} />}
                        {wrong && <XCircle size={15} />}
                      </button>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>

          {submitted ? (
            <div className="finish-box">
              <p>
                {score} of {questions.length} correct · +{score * 5} points
              </p>
              <Link to="/progress" className="finish-link">
                See your report card
              </Link>
            </div>
          ) : (
            <Button variant="accent" onClick={submit} disabled={Object.keys(picked).length < questions.length}>
              Submit checkpoint
            </Button>
          )}
        </section>
      </div>
    </AppShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ClipboardCheck, Clock3, Lock } from "lucide-react";
import { AppShell } from "../components/app-shell";
import { PENDING_QUIZZES } from "../lib/aikyro-data";
import { Button } from "../components/ui/button";
import { useLearner } from "../lib/learner-store";

export const Route = createFileRoute("/quizzes")({
  head: () => ({
    meta: [
      { title: "Quick Checks | AI KYRO" },
      { name: "description", content: "Answer short retention quizzes a few days after each class to prove the idea stuck." },
      { property: "og:title", content: "Quick Checks | AI KYRO" },
      { property: "og:description", content: "Delayed retention quizzes that show whether learning actually lasted." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuizzesPage,
});

function QuizzesPage() {
  const { state, update, addPoints } = useLearner();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  function submit(id: string) {
    const text = (drafts[id] ?? "").trim();
    if (!text) return;
    update((prev) => ({ ...prev, answeredQuizzes: [...prev.answeredQuizzes, id] }));
    addPoints(10);
  }

  return (
    <AppShell title="Quick Checks">
      <div className="page-stack">
        <section className="panel">
          <header className="panel-head">
            <span className="panel-icon">
              <ClipboardCheck size={18} />
            </span>
            <div>
              <h2>Retention quizzes</h2>
              <p className="muted">Short questions that arrive days later — the real test of whether an idea stayed.</p>
            </div>
          </header>

          <div className="quiz-list">
            {PENDING_QUIZZES.map((quiz) => {
              const done = state.answeredQuizzes.includes(quiz.id);
              return (
                <article key={quiz.id} className={`quiz-card ${quiz.availableNow ? "" : "locked"}`}>
                  <header>
                    <strong>{quiz.conceptName}</strong>
                    <span>
                      {quiz.availableNow ? <Clock3 size={13} /> : <Lock size={13} />} {quiz.dueIn}
                    </span>
                  </header>
                  <p>{quiz.prompt}</p>
                  {done ? (
                    <p className="quiz-done">Answered · +10 points</p>
                  ) : quiz.availableNow ? (
                    <div className="quiz-answer">
                      <textarea
                        rows={2}
                        value={drafts[quiz.id] ?? ""}
                        onChange={(event) => setDrafts((prev) => ({ ...prev, [quiz.id]: event.target.value }))}
                        placeholder="Answer in your own words…"
                        aria-label={`Answer for ${quiz.conceptName}`}
                      />
                      <Button variant="accent" onClick={() => submit(quiz.id)} disabled={!(drafts[quiz.id] ?? "").trim()}>
                        Submit
                      </Button>
                    </div>
                  ) : (
                    <p className="muted">This one unlocks later on purpose — spacing is what makes it stick.</p>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

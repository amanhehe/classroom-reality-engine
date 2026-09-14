import { createFileRoute, Link } from "@tanstack/react-router";
import { HelpCircle } from "lucide-react";
import { AppShell } from "../components/app-shell";
import { useLearner } from "../lib/learner-store";

export const Route = createFileRoute("/questions")({
  head: () => ({
    meta: [
      { title: "My Questions | AI KYRO" },
      { name: "description", content: "Every question you asked in class, with the answer the teacher gave you." },
      { property: "og:title", content: "My Questions | AI KYRO" },
      { property: "og:description", content: "A record of what you asked and what the class answered." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuestionsPage,
});

function QuestionsPage() {
  const { state } = useLearner();

  return (
    <AppShell title="My Questions">
      <div className="page-stack">
        <section className="panel">
          <header className="panel-head">
            <span className="panel-icon">
              <HelpCircle size={18} />
            </span>
            <div>
              <h2>Questions you raised in class</h2>
              <p className="muted">Asking is the point — this is the part a chat window never keeps for you.</p>
            </div>
          </header>

          {state.askedQuestions.length === 0 ? (
            <p className="muted">
              Nothing yet. Join a class from the{" "}
              <Link to="/library" className="inline-link">
                Class Library
              </Link>{" "}
              and ask anything mid-discussion.
            </p>
          ) : (
            <div className="question-list">
              {[...state.askedQuestions].reverse().map((item) => (
                <article key={item.id} className="question-card">
                  <span className="question-concept">{item.conceptName}</span>
                  <strong>{item.question}</strong>
                  <p>{item.answer}</p>
                  <time>{new Date(item.at).toLocaleString()}</time>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

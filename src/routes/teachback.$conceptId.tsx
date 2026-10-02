import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Mic, MicOff } from "lucide-react";
import { AppShell } from "../components/app-shell";
import { Button } from "../components/ui/button";
import { findConcept } from "../lib/aikyro-data";
import { useLearner } from "../lib/learner-store";
import { reviewTeachBack } from "../lib/teachback.functions";

export const Route = createFileRoute("/teachback/$conceptId")({
  head: () => ({
    meta: [
      { title: "Teach It Back | AI KYRO" },
      { name: "description", content: "Explain the idea in your own words, aloud or typed, and get gentle feedback." },
      { property: "og:title", content: "Teach It Back | AI KYRO" },
      { property: "og:description", content: "The best test of understanding: explain it back." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TeachBackPage,
});

type Feedback = { score: number; strengths: string; gap: string; nudge: string };

function TeachBackPage() {
  const { conceptId } = useParams({ from: "/teachback/$conceptId" });
  const { state, addPoints } = useLearner();
  const concept = useMemo(
    () => findConcept(conceptId) ?? state.customConcepts.find((c) => c.id === conceptId),
    [conceptId, state.customConcepts],
  );
  const review = useServerFn(reviewTeachBack);
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const recRef = useRef<{ stop: () => void } | null>(null);

  if (!concept) {
    return (
      <AppShell title="Teach It Back">
        <div className="page-stack">
          <section className="panel">
            <h2>Pick a class first</h2>
            <Link to="/library" className="inline-link">Go to the library</Link>
          </section>
        </div>
      </AppShell>
    );
  }
  const active = concept;

  function toggleMic() {
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    const w = window as unknown as { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      setError("Speaking isn't supported in this browser — please type instead.");
      return;
    }
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = "en-US";
    rec.onresult = (event: any) => {
      let added = "";
      for (let i = event.resultIndex; i < event.results.length; i++) added += event.results[i][0].transcript + " ";
      setText((prev) => (prev + " " + added).trim());
    };
    rec.onend = () => setListening(false);
    rec.start();
    recRef.current = rec;
    setListening(true);
    setError(null);
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const result = await review({ data: { conceptName: active.name, boardText: active.boardText, explanation: text.trim() } });
      setFeedback(result);
      addPoints(result.score * 2);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Feedback failed — try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell title="Teach It Back">
      <div className="page-stack">
        <section className="panel">
          <header className="panel-head">
            <div>
              <h2>Explain “{active.name}” to a friend</h2>
              <p className="muted">Say it aloud or type it. Use your own words — no notes.</p>
            </div>
          </header>
          <textarea
            className="teachback-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={7}
            placeholder="Imagine Maya missed class. How would you explain it?"
            aria-label="Your explanation"
          />
          <div className="topic-row">
            <Button variant="outline" onClick={toggleMic}>
              {listening ? <MicOff size={15} /> : <Mic size={15} />} {listening ? "Stop" : "Speak"}
            </Button>
            <Button variant="accent" disabled={busy || text.trim().length < 5} onClick={() => void submit()}>
              {busy ? "Listening to your explanation…" : "Get feedback"}
            </Button>
          </div>
          {error && <p className="error-note">{error}</p>}
          {feedback && (
            <div className="finish-box">
              <p><strong>Clarity: {feedback.score}/5</strong> · +{feedback.score * 2} points</p>
              <p><strong>What you nailed:</strong> {feedback.strengths}</p>
              <p><strong>What's missing:</strong> {feedback.gap}</p>
              <p><strong>Think about:</strong> {feedback.nudge}</p>
              <Link to="/progress" className="finish-link">See your report card</Link>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

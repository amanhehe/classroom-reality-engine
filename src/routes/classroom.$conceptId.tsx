import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Hand, Lightbulb, Mic, Pause, Play, Send, Volume2 } from "lucide-react";
import classroomImage from "../assets/realistic-classroom.jpg";
import { AppShell } from "../components/app-shell";
import { Button } from "../components/ui/button";
import { findConcept, SPEAKER_META, type Concept, type Speaker, type Turn } from "../lib/aikyro-data";
import { askTheClass } from "../lib/ai.functions";
import { useLearner } from "../lib/learner-store";

export const Route = createFileRoute("/classroom/$conceptId")({
  head: () => ({
    meta: [
      { title: "Live Class | AI KYRO" },
      { name: "description", content: "Watch a teacher and two students work through a concept, and join in as the third student." },
      { property: "og:title", content: "Live Class | AI KYRO" },
      { property: "og:description", content: "A classroom discussion you take part in, with hints, blanks and questions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ClassroomPage,
});

type Line = { id: string; speaker: Speaker; text: string; kind: Turn["type"] };

const VOICE: Record<Speaker, { rate: number; pitch: number }> = {
  teacher: { rate: 0.94, pitch: 1.02 },
  basic_student: { rate: 1.0, pitch: 1.22 },
  advanced_student: { rate: 1.04, pitch: 0.9 },
  learner: { rate: 1, pitch: 1 },
};

function ClassroomPage() {
  const { conceptId } = useParams({ from: "/classroom/$conceptId" });
  const { state, update, addPoints, ready } = useLearner();

  const concept: Concept | undefined = useMemo(
    () => findConcept(conceptId) ?? state.customConcepts.find((c) => c.id === conceptId),
    [conceptId, state.customConcepts],
  );

  const [step, setStep] = useState(0);
  const [lines, setLines] = useState<Line[]>([]);
  const [guess, setGuess] = useState("");
  const [hintShown, setHintShown] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState<Speaker>("teacher");
  const [listening, setListening] = useState(false);
  const askFn = useServerFn(askTheClass);
  const session = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);

  const turns = concept?.turns ?? [];
  const currentTurn = turns[step];

  const speak = useCallback(
    (speaker: Speaker, text: string, onDone?: () => void) => {
      setActive(speaker);
      if (typeof window === "undefined" || !("speechSynthesis" in window) || !state.settings.readAloud) {
        onDone?.();
        return;
      }
      const mine = ++session.current;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/_+/g, "blank"));
      utterance.rate = VOICE[speaker].rate;
      utterance.pitch = VOICE[speaker].pitch;
      utterance.onend = () => {
        if (session.current === mine) onDone?.();
      };
      utterance.onerror = () => onDone?.();
      window.speechSynthesis.speak(utterance);
    },
    [state.settings.readAloud],
  );

  useEffect(() => {
    return () => {
      session.current += 1;
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [lines.length]);

  function pushTurn(turn: Turn) {
    setLines((prev) => [...prev, { id: turn.id, speaker: turn.speaker, text: turn.content, kind: turn.type }]);
  }

  function advance(auto = false) {
    const turn = turns[step];
    if (!turn) return;
    pushTurn(turn);
    setHintShown(false);
    setRevealed(false);
    setGuess("");
    speak(turn.speaker, turn.content, () => {
      if (turn.type === "blank") {
        setPlaying(false);
        return;
      }
      if (auto && step + 1 < turns.length) {
        setStep((s) => s + 1);
      } else {
        setPlaying(false);
        setStep((s) => Math.min(s + 1, turns.length));
      }
    });
    if (!auto) setStep((s) => Math.min(s + 1, turns.length));
  }

  useEffect(() => {
    if (!playing) return;
    const turn = turns[step];
    if (!turn) {
      setPlaying(false);
      return;
    }
    if (lines.some((line) => line.id === turn.id)) return;
    pushTurn(turn);
    if (turn.type === "blank") {
      setPlaying(false);
      speak(turn.speaker, turn.content);
      return;
    }
    speak(turn.speaker, turn.content, () => setStep((s) => s + 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, step]);

  function togglePlay() {
    session.current += 1;
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setPlaying((value) => !value);
  }

  function submitGuess() {
    if (!currentTurn || currentTurn.type !== "blank") return;
    const text = guess.trim();
    if (!text) return;
    setRevealed(true);
    const correct = currentTurn.answer && text.toLowerCase().includes(currentTurn.answer.toLowerCase());
    setLines((prev) => [
      ...prev,
      { id: `${currentTurn.id}_you`, speaker: "learner", text, kind: "dialogue" },
      {
        id: `${currentTurn.id}_reveal`,
        speaker: "teacher",
        text: correct
          ? `Exactly — ${currentTurn.answer}. Notice you got there by reasoning, not by being told.`
          : `Close. The word we want is “${currentTurn.answer}”. ${currentTurn.hint ?? ""}`,
        kind: "dialogue",
      },
    ]);
    if (correct) addPoints(5);
    setStep((s) => s + 1);
  }

  async function ask() {
    const text = question.trim();
    if (!text || !concept) return;
    setAsking(true);
    setAiError(null);
    setLines((prev) => [...prev, { id: `q_${Date.now()}`, speaker: "learner", text, kind: "dialogue" }]);
    setQuestion("");
    try {
      const result = await askFn({
        data: {
          conceptName: concept.name,
          boardText: concept.boardText,
          transcript: lines.map((line) => `${SPEAKER_META[line.speaker].label}: ${line.text}`).join("\n"),
          question: text,
        },
      });
      setLines((prev) => [...prev, { id: `a_${Date.now()}`, speaker: "teacher", text: result.answer, kind: "dialogue" }]);
      speak("teacher", result.answer);
      addPoints(3);
      update((prev) => ({
        ...prev,
        askedQuestions: [
          ...prev.askedQuestions,
          {
            id: `${Date.now()}`,
            conceptId: concept.id,
            conceptName: concept.name,
            question: text,
            answer: result.answer,
            at: new Date().toISOString(),
          },
        ],
      }));
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "The teacher could not answer just now.");
    } finally {
      setAsking(false);
    }
  }

  function startListening() {
    const Recognition =
      typeof window !== "undefined"
        ? ((window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition ??
          (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition)
        : undefined;
    if (!Recognition) {
      setAiError("Speaking aloud is not supported in this browser — please type instead.");
      return;
    }
    const recognition = new (Recognition as new () => {
      lang: string;
      start: () => void;
      onresult: (event: { results: { 0: { 0: { transcript: string } } } }) => void;
      onend: () => void;
      onerror: () => void;
    })();
    recognition.lang = "en-US";
    setListening(true);
    recognition.onresult = (event) => setQuestion(event.results[0][0].transcript);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.start();
  }

  if (!concept) {
    return (
      <AppShell title="Class">
        <div className="page-stack">
          <section className="panel">
            <h2>That class is not here</h2>
            <p className="muted">Pick a concept, or create your own topic.</p>
            <Link to="/library" className="inline-link">
              Go to the Class Library
            </Link>
          </section>
        </div>
      </AppShell>
    );
  }

  const done = step >= turns.length;

  return (
    <AppShell title={concept.name}>
      <div className="classroom-grid">
        <section className="stage" aria-label="Classroom scene">
          <img src={classroomImage} alt="A sunlit classroom" className="stage-photo" width={1920} height={1080} />
          <div className="stage-shade" />
          <div className="stage-sun" />

          <div className="blackboard">
            <small>On the board</small>
            <p>{concept.boardText}</p>
          </div>

          <div className="figures">
            {(["teacher", "basic_student", "advanced_student", "learner"] as Speaker[]).map((who) => (
              <div key={who} className={`figure figure-${who} ${active === who ? "speaking" : ""}`}>
                <span className="figure-focus" aria-hidden="true" />
                <span className="figure-label">
                  <i /> {SPEAKER_META[who].label}
                </span>
                {active === who && (
                  <span className="figure-bars" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                )}
              </div>
            ))}
          </div>

          {lines.length > 0 && (
            <div className={`stage-bubble bubble-${active}`} aria-live="polite">
              <div>
                <strong>{SPEAKER_META[active].label}</strong>
                <span>speaking now</span>
              </div>
              <p>{[...lines].reverse().find((line) => line.speaker === active)?.text ?? ""}</p>
            </div>
          )}

          <div className="stage-controls">
            <Button variant={playing ? "accent" : "glass"} size="icon" onClick={togglePlay} aria-label={playing ? "Pause the class" : "Play the class"}>
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </Button>
            <Button variant="glass" onClick={() => advance()} disabled={done || playing}>
              Next turn <ArrowRight size={14} />
            </Button>
            <span className="stage-progress">
              Turn {Math.min(step + (done ? 0 : 1), turns.length)} of {turns.length}
            </span>
          </div>
        </section>

        <aside className="class-panel" aria-label="Class conversation">
          <header>
            <div>
              <strong>Class conversation</strong>
              <small>{concept.name}</small>
            </div>
            <span className="points-pill">{ready ? state.points : 120} pts</span>
          </header>

          <div className="class-lines" ref={listRef}>
            {lines.length === 0 && <p className="muted">Press play — the teacher will begin.</p>}
            {lines.map((line) => (
              <article key={line.id} className={`class-line line-${line.speaker}`}>
                <span className="line-avatar">{SPEAKER_META[line.speaker].label.slice(0, 1)}</span>
                <div>
                  <header>
                    <strong>{SPEAKER_META[line.speaker].label}</strong>
                    {line.kind === "hint" && (
                      <em>
                        <Lightbulb size={12} /> hint
                      </em>
                    )}
                  </header>
                  <p>{line.text}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => speak(line.speaker, line.text)} aria-label={`Hear ${SPEAKER_META[line.speaker].label}`}>
                  <Volume2 size={14} />
                </Button>
              </article>
            ))}
          </div>

          {currentTurn?.type === "blank" && !revealed && (
            <div className="blank-box">
              <p>
                <Hand size={13} /> Fill the blank before the class moves on.
              </p>
              <div className="blank-row">
                <input
                  value={guess}
                  onChange={(event) => setGuess(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && submitGuess()}
                  placeholder="Your best guess…"
                  aria-label="Your guess"
                />
                <Button variant="accent" onClick={submitGuess} disabled={!guess.trim()}>
                  Commit
                </Button>
              </div>
              <button className="hint-toggle" onClick={() => setHintShown(true)} disabled={hintShown}>
                <Lightbulb size={13} /> {hintShown ? currentTurn.hint : "Show a hint"}
              </button>
            </div>
          )}

          {done && (
            <div className="finish-box">
              <p>Class complete. Now prove it stuck.</p>
              <Link to="/checkpoint/$conceptId" params={{ conceptId: concept.id }} className="finish-link">
                Go to the checkpoint <ArrowRight size={14} />
              </Link>
            </div>
          )}

          <div className="ask-box">
            <label htmlFor="ask">Ask as the third student</label>
            <div className="ask-row">
              <textarea
                id="ask"
                rows={2}
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void ask();
                  }
                }}
                placeholder={listening ? "Listening…" : "Anything at all — even the obvious question"}
              />
              <div className="ask-actions">
                <Button variant={listening ? "accent" : "glass"} size="icon" onClick={startListening} aria-label="Ask by speaking">
                  <Mic size={15} />
                </Button>
                <Button variant="accent" size="icon" onClick={() => void ask()} disabled={asking || !question.trim()} aria-label="Send question">
                  <Send size={15} />
                </Button>
              </div>
            </div>
            {asking && <p className="muted">The teacher is thinking…</p>}
            {aiError && <p className="error-note">{aiError}</p>}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  BookOpen,
  BrainCircuit,
  ChevronRight,
  CircleUserRound,
  Hand,
  Home,
  Library,
  Mic,
  MoreHorizontal,
  Play,
  Send,
  Settings,
  Sparkles,
  Square,
  Volume2,
  Waves,
} from "lucide-react";
import classroomImage from "../assets/realistic-classroom.jpg";
import { Button } from "../components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI KYRO | Live Classroom" },
      { name: "description", content: "Join a realistic, interactive AI classroom and take part in a live lesson." },
      { property: "og:title", content: "AI KYRO Live Classroom" },
      { property: "og:description", content: "A realistic, interactive classroom for active learning." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Conversation = {
  id: number;
  name: string;
  role: string;
  message: string;
  tone: "teacher" | "basic" | "advanced" | "learner";
};

const initialConversation: Conversation[] = [
  { id: 1, name: "Ms. Rivera", role: "Teacher", message: "Why do you think energy changes form instead of disappearing?", tone: "teacher" },
  { id: 2, name: "Maya", role: "Basic Student", message: "I think it transfers from one object to another.", tone: "basic" },
  { id: 3, name: "Arjun", role: "Advanced Student", message: "The total energy in a closed system remains constant.", tone: "advanced" },
];

function Index() {
  const [messages, setMessages] = useState(initialConversation);
  const [answer, setAnswer] = useState("");
  const [micOn, setMicOn] = useState(false);
  const [reading, setReading] = useState(false);
  const [activeNav, setActiveNav] = useState("classroom");

  const speaker = useMemo(() => messages[messages.length - 1] ?? initialConversation[0], [messages]);

  if (!speaker) return null;

  function sendAnswer() {
    const message = answer.trim();
    if (!message) return;
    setMessages((current) => [
      ...current,
      { id: Date.now(), name: "You", role: "Student", message, tone: "learner" },
    ]);
    setAnswer("");
  }

  function readCurrent() {
    setReading((value) => !value);
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    if (!reading) window.speechSynthesis.speak(new SpeechSynthesisUtterance(speaker.message));
  }

  return (
    <main className="classroom-app">
      <img
        src={classroomImage}
        alt="A teacher leading a sunlit classroom of students"
        width={1920}
        height={1080}
        className="classroom-photo"
      />
      <div className="scene-shade" />
      <div className="sun-wash" />

      <nav className="side-rail" aria-label="Primary navigation">
        <div className="brand-mark" aria-label="AI KYRO">K</div>
        <div className="rail-divider" />
        {[
          { id: "home", label: "Home", Icon: Home },
          { id: "classroom", label: "Classroom", Icon: BookOpen },
          { id: "library", label: "Library", Icon: Library },
          { id: "progress", label: "Progress", Icon: BrainCircuit },
        ].map(({ id, label, Icon }) => (
          <Button
            key={id}
            variant={activeNav === id ? "accent" : "ghost"}
            size="icon"
            className="rail-button"
            onClick={() => setActiveNav(id)}
            aria-label={label}
            title={label}
          >
            <Icon size={18} />
          </Button>
        ))}
        <div className="rail-spacer" />
        <Button variant="ghost" size="icon" className="rail-button" aria-label="Settings" title="Settings">
          <Settings size={18} />
        </Button>
        <button className="student-avatar" aria-label="Student profile">K</button>
      </nav>

      <section className="lesson-stage" aria-label="Live classroom scene">
        <header className="lesson-header glass-panel">
          <div className="live-dot"><span /></div>
          <div>
            <p>LIVE CLASS · PHYSICS</p>
            <h1>The Law of Conservation of Energy</h1>
          </div>
          <span className="student-count">12 students</span>
        </header>

        <div className="speaker-pill glass-panel">
          <Waves size={15} />
          <span><strong>{speaker.name}</strong> is speaking</span>
        </div>

        <div className="teacher-caption glass-panel">
          <span className="caption-avatar">MR</span>
          <div>
            <strong>{speaker.role}</strong>
            <p>{speaker.message}</p>
          </div>
          <div className="sound-bars" aria-hidden="true"><i /><i /><i /></div>
        </div>

        <div className="learner-marker">
          <CircleUserRound size={16} />
          <span>You</span>
        </div>

        <div className="lesson-controls glass-panel">
          <Button variant={reading ? "accent" : "glass"} size="icon" onClick={readCurrent} aria-label="Read current message aloud" title="Read aloud">
            <Volume2 size={17} />
          </Button>
          <Button variant={micOn ? "accent" : "glass"} size="icon" onClick={() => setMicOn((value) => !value)} aria-label="Toggle microphone" title="Microphone">
            {micOn ? <Square size={15} /> : <Mic size={17} />}
          </Button>
          <div className="timer-block">
            <span>Your turn</span>
            <strong>00:15</strong>
          </div>
          <div className="timer-track"><span /></div>
          <Button variant="glass" size="icon" aria-label="Resume lesson" title="Resume lesson"><Play size={16} /></Button>
        </div>
      </section>

      <aside className="conversation-panel">
        <header className="conversation-header">
          <div className="conversation-brand"><span><Sparkles size={16} /></span><div><strong>Class conversation</strong><small>AI KYRO · live transcript</small></div></div>
          <Button variant="ghost" size="icon" aria-label="More conversation options"><MoreHorizontal size={18} /></Button>
        </header>

        <div className="conversation-list" aria-live="polite">
          {messages.map((message, index) => (
            <article key={message.id} className={`conversation-message tone-${message.tone} ${index === messages.length - 1 ? "current" : ""}`}>
              <div className="message-avatar">{message.name.slice(0, 1)}</div>
              <div>
                <header><strong>{message.name}</strong><span>{message.role}</span><time>Now</time></header>
                <p>{message.message}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="answer-area">
          <div className="answer-label"><span><Hand size={14} /> It’s your turn</span><strong>00:15</strong></div>
          <div className="answer-input">
            <textarea
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendAnswer();
                }
              }}
              placeholder={micOn ? "Listening…" : "Type your answer…"}
              aria-label="Your answer"
              rows={2}
            />
            <Button variant="accent" size="icon" onClick={sendAnswer} disabled={!answer.trim()} aria-label="Send answer"><Send size={17} /></Button>
          </div>
          <p className="turn-note"><Sparkles size={12} /> Take a moment to think before you respond.</p>
        </div>
      </aside>

      <button className="continue-prompt glass-panel">
        <span>Keep going</span>
        <ChevronRight size={16} />
      </button>
    </main>
  );
}

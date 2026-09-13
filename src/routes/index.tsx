import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
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
  Pause,
  Send,
  Settings,
  Sparkles,
  Square,
  Volume2,
  Waves,
  X,
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
  const [speakerIndex, setSpeakerIndex] = useState(0);
  const [lessonPlaying, setLessonPlaying] = useState(false);
  const speechSession = useRef(0);

  const speaker = useMemo<Conversation>(
    () => messages[speakerIndex] ?? messages[0] ?? {
      id: 0,
      name: "Ms. Rivera",
      role: "Teacher",
      message: "Welcome to class.",
      tone: "teacher",
    },
    [messages, speakerIndex],
  );

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  function sendAnswer() {
    const message = answer.trim();
    if (!message) return;
    setMessages((current) => [
      ...current,
      { id: Date.now(), name: "You", role: "Student", message, tone: "learner" },
    ]);
    setSpeakerIndex(messages.length);
    setAnswer("");
  }

  function speakMessage(index: number, continueLesson = false) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const selected = messages[index];
    if (!selected) return;
    const session = speechSession.current;
    window.speechSynthesis.cancel();
    setSpeakerIndex(index);
    setReading(true);
    const utterance = new SpeechSynthesisUtterance(selected.message);
    utterance.rate = selected.tone === "teacher" ? 0.92 : selected.tone === "advanced" ? 1.02 : 0.97;
    utterance.pitch = selected.tone === "teacher" ? 1.08 : selected.tone === "basic" ? 1.18 : 0.94;
    utterance.onend = () => {
      if (speechSession.current !== session) return;
      setReading(false);
      if (continueLesson && index < messages.length - 1) {
        window.setTimeout(() => speakMessage(index + 1, true), 450);
      } else {
        setLessonPlaying(false);
      }
    };
    utterance.onerror = () => {
      setReading(false);
      setLessonPlaying(false);
    };
    window.speechSynthesis.speak(utterance);
  }

  function toggleCurrentSpeech() {
    if (reading) {
      speechSession.current += 1;
      window.speechSynthesis.cancel();
      setReading(false);
      setLessonPlaying(false);
      return;
    }
    speakMessage(speakerIndex);
  }

  function toggleLesson() {
    if (lessonPlaying) {
      speechSession.current += 1;
      window.speechSynthesis.cancel();
      setLessonPlaying(false);
      setReading(false);
      return;
    }
    speechSession.current += 1;
    setLessonPlaying(true);
    speakMessage(0, true);
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
      <div className="scene-depth" aria-hidden="true" />
      <div className="dust-field" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <i key={index} />)}</div>

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
        <Button variant={activeNav === "settings" ? "accent" : "ghost"} size="icon" className="rail-button" onClick={() => setActiveNav("settings")} aria-label="Settings" title="Settings">
          <Settings size={18} />
        </Button>
        <button className="student-avatar" aria-label="Student profile">K</button>
      </nav>

      <section className="lesson-stage" aria-label="Live classroom scene">
        {activeNav !== "classroom" && (
          <section className="nav-view glass-panel" aria-label={`${activeNav} view`}>
            <header><div><small>AI KYRO</small><h2>{activeNav === "home" ? "Good morning, K" : activeNav === "library" ? "Lesson library" : activeNav === "progress" ? "Learning progress" : "Classroom settings"}</h2></div><Button variant="glass" size="icon" onClick={() => setActiveNav("classroom")} aria-label="Close view"><X size={18} /></Button></header>
            {activeNav === "home" && <div className="nav-view-grid"><button onClick={() => setActiveNav("classroom")}><strong>Resume live class</strong><span>Conservation of Energy · 12 students</span></button><div><strong>Next lesson</strong><span>Forces and motion · Tomorrow, 10:00</span></div></div>}
            {activeNav === "library" && <div className="nav-view-list">{["Energy & Work", "Forces & Motion", "Waves & Sound"].map((item, index) => <button key={item}><span>0{index + 1}</span><strong>{item}</strong><small>{index + 4} lessons</small><ChevronRight size={17} /></button>)}</div>}
            {activeNav === "progress" && <div className="progress-view"><div className="progress-ring"><strong>82%</strong><span>mastery</span></div><div><strong>Physics foundations</strong><span>8 of 10 concepts complete</span><div className="progress-line"><i /></div></div></div>}
            {activeNav === "settings" && <div className="settings-view"><label><span>Classroom voice<strong>Natural voices for each speaker</strong></span><input type="checkbox" defaultChecked /></label><label><span>Scene movement<strong>Camera, light, and atmosphere</strong></span><input type="checkbox" defaultChecked /></label><label><span>Live captions<strong>Show every spoken statement</strong></span><input type="checkbox" defaultChecked /></label></div>}
          </section>
        )}
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
          <Button variant={reading ? "accent" : "glass"} size="icon" onClick={toggleCurrentSpeech} aria-label={reading ? "Stop reading" : "Read current message aloud"} title={reading ? "Stop reading" : "Read aloud"}>
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
          <Button variant={lessonPlaying ? "accent" : "glass"} size="icon" onClick={toggleLesson} aria-label={lessonPlaying ? "Pause lesson" : "Play lesson from beginning"} title={lessonPlaying ? "Pause lesson" : "Play lesson"}>{lessonPlaying ? <Pause size={16} /> : <Play size={16} />}</Button>
        </div>
      </section>

      <aside className="conversation-panel">
        <header className="conversation-header">
          <div className="conversation-brand"><span><Sparkles size={16} /></span><div><strong>Class conversation</strong><small>AI KYRO · live transcript</small></div></div>
          <Button variant="ghost" size="icon" aria-label="More conversation options"><MoreHorizontal size={18} /></Button>
        </header>

        <div className="conversation-list" aria-live="polite">
          {messages.map((message, index) => (
            <article key={message.id} className={`conversation-message tone-${message.tone} ${index === speakerIndex ? "current" : ""}`}>
              <div className="message-avatar">{message.name.slice(0, 1)}</div>
              <div>
                <header><strong>{message.name}</strong><span>{message.role}</span><time>Now</time></header>
                <p>{message.message}</p>
              </div>
              <Button variant="ghost" size="icon" className="message-audio" onClick={() => speakMessage(index)} aria-label={`Hear ${message.name}'s statement`} title={`Hear ${message.name}`}><Volume2 size={15} /></Button>
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

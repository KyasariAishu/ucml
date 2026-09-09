import { useEffect, useRef, useState } from "react";

// Fake log lines to give the brand panel a sense of a live system.
// Swap this out later for real activity pulled from the Django API
// (e.g. recent job runs) if that ever makes sense for the product.
const LOG_LINES = [
  "epoch 12  loss 0.0412  val 0.0507",
  "checkpoint saved -> run_2214",
  "epoch 13  loss 0.0389  val 0.0498",
  "dataset shard 7/12 indexed",
  "epoch 14  loss 0.0361  val 0.0481",
  "worker-3 connected",
  "epoch 15  loss 0.0340  val 0.0470",
  "eval sweep queued",
  "epoch 16  loss 0.0322  val 0.0463",
  "checkpoint saved -> run_2215",
];

function TrainingLog() {
  const [visible, setVisible] = useState([]);
  const i = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible((prev) => {
        const next = [...prev, LOG_LINES[i.current % LOG_LINES.length]];
        i.current += 1;
        return next.slice(-7);
      });
    }, 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="brand-log" aria-hidden="true">
      {visible.map((line, idx) => (
        <div className="brand-log-line" key={idx}>
          <span className="brand-log-caret">›</span> {line}
        </div>
      ))}
      <div className="brand-log-cursor" />
    </div>
  );
}

export default function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <div className="auth-shell">
      <aside className="auth-brand">
        <div className="auth-brand-top">
          <div className="auth-brand-mark">UCML</div>
          <div className="auth-brand-index">v0.1 · mockup</div>
        </div>

        <div className="auth-brand-mid">
          <p className="auth-brand-eyebrow">{eyebrow}</p>
          <h1 className="auth-brand-title">{title}</h1>
          <p className="auth-brand-subtitle">{subtitle}</p>
        </div>

        <TrainingLog />
      </aside>

      <main className="auth-panel">
        <div className="auth-card">{children}</div>
      </main>
    </div>
  );
}

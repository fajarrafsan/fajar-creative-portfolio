type Variant = "profile" | "work" | "experience";
type Kind = "plus" | "sq" | "dot";
type Tone = "ink" | "acid" | "java";

type Mark = { x: string; y: string; kind: Kind; tone: Tone };

/**
 * Quiet field for paper sections. Same language as the dark grids and
 * architecture motes — hairline grid, two brand radials, sparse ticks —
 * inverted onto cream so those blocks don't read as empty. Static: no
 * pointer tracking, no animation. Reduced-motion is a no-op.
 */
const RADIALS: Record<Variant, { acid: string; java: string }> = {
  profile: {
    acid: "absolute -top-[18%] -left-[12%] size-[min(720px,58vw)] rounded-full bg-[radial-gradient(circle,rgba(216,255,62,0.16),transparent_68%)]",
    java: "absolute right-[8%] bottom-[-12%] size-[min(520px,40vw)] rounded-full bg-[radial-gradient(circle,rgba(255,97,60,0.1),transparent_70%)]",
  },
  work: {
    acid: "absolute -top-[22%] right-[-12%] size-[min(680px,52vw)] rounded-full bg-[radial-gradient(circle,rgba(216,255,62,0.13),transparent_68%)]",
    java: "absolute -left-[10%] top-[38%] size-[min(500px,40vw)] rounded-full bg-[radial-gradient(circle,rgba(255,97,60,0.08),transparent_70%)]",
  },
  experience: {
    acid: "absolute -bottom-[18%] left-[6%] size-[min(640px,50vw)] rounded-full bg-[radial-gradient(circle,rgba(216,255,62,0.12),transparent_68%)]",
    java: "absolute -top-[16%] right-[-8%] size-[min(520px,42vw)] rounded-full bg-[radial-gradient(circle,rgba(255,97,60,0.09),transparent_70%)]",
  },
};

const MARKS: Record<Variant, Mark[]> = {
  profile: [
    { x: "7%", y: "14%", kind: "plus", tone: "java" },
    { x: "91%", y: "11%", kind: "plus", tone: "acid" },
    { x: "18%", y: "46%", kind: "sq", tone: "ink" },
    { x: "84%", y: "38%", kind: "dot", tone: "java" },
    { x: "42%", y: "8%", kind: "sq", tone: "acid" },
    { x: "94%", y: "72%", kind: "plus", tone: "ink" },
    { x: "6%", y: "88%", kind: "plus", tone: "acid" },
    { x: "62%", y: "92%", kind: "dot", tone: "ink" },
  ],
  work: [
    { x: "5%", y: "9%", kind: "plus", tone: "ink" },
    { x: "88%", y: "7%", kind: "plus", tone: "java" },
    { x: "14%", y: "34%", kind: "dot", tone: "acid" },
    { x: "76%", y: "28%", kind: "sq", tone: "ink" },
    { x: "96%", y: "58%", kind: "plus", tone: "acid" },
    { x: "8%", y: "68%", kind: "sq", tone: "java" },
    { x: "48%", y: "4%", kind: "dot", tone: "ink" },
    { x: "91%", y: "91%", kind: "plus", tone: "ink" },
  ],
  experience: [
    { x: "6%", y: "10%", kind: "plus", tone: "acid" },
    { x: "92%", y: "8%", kind: "plus", tone: "java" },
    { x: "11%", y: "36%", kind: "sq", tone: "ink" },
    { x: "86%", y: "42%", kind: "dot", tone: "acid" },
    { x: "4%", y: "62%", kind: "plus", tone: "ink" },
    { x: "78%", y: "71%", kind: "sq", tone: "java" },
    { x: "50%", y: "96%", kind: "dot", tone: "ink" },
    { x: "96%", y: "88%", kind: "plus", tone: "acid" },
  ],
};

const TONE: Record<Tone, string> = {
  ink: "text-ink/20",
  acid: "text-acid/40",
  java: "text-java/30",
};

function Glyph({ kind }: { kind: Kind }) {
  if (kind === "plus") {
    return (
      <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
        <path d="M4.5.5v8M.5 4.5h8" stroke="currentColor" strokeWidth="1" />
      </svg>
    );
  }
  if (kind === "sq") {
    return <i className="block size-[3px] bg-current" />;
  }
  return <i className="block size-0.5 rounded-full bg-current" />;
}

export function PaperField({ variant }: { variant: Variant }) {
  const radial = RADIALS[variant];

  return (
    <div className="paper-field" data-variant={variant} aria-hidden="true">
      <div className="paper-field-grid" />
      <div className="paper-field-ticks" />
      <div className="paper-field-fiber" />
      <div className={radial.acid} />
      <div className={radial.java} />
      <div className="paper-field-vignette" />
      {MARKS[variant].map((mark) => (
        <span
          key={`${mark.x}-${mark.y}-${mark.kind}`}
          className={`absolute ${TONE[mark.tone]}`}
          style={{ left: mark.x, top: mark.y }}
        >
          <Glyph kind={mark.kind} />
        </span>
      ))}
    </div>
  );
}

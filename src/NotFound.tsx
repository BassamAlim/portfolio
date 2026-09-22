import { ANG, ME, byId, EMAIL, CV_URL } from './data'
import { ThemeToggle, useTheme } from './theme'
import { Icon } from './App'

// The graph with a missing edge: my direct work, faded, around me in a 600×540 frame.
const W = 600, H = 540, CX = 300, CY = 270, Q: [number, number] = [490, 190]
const at = (x: number, y: number) => ({ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` })
const nodes = ME.map(([id]) => byId[id]).filter((n) => n.id !== 'cortex' && n.id !== 'compliance').map((n) => {
  const a = (ANG[n.id] * Math.PI) / 180
  return { n, x: Math.round(CX + 190 * Math.cos(a)), y: Math.round(CY + 170 * Math.sin(a)) }
})

export default function NotFound() {
  const { dark, toggle } = useTheme()
  return (
    <div className="page nf">
      <nav className="nav">
        <a href="/">BASSAM ABDULRAHIM<span className="accent">*</span></a>
        <div className="nav-links">
          <a href="/#graph" className="wide">Graph</a>
          <a href="/#work" className="wide">Work</a>
          <a href={CV_URL} target="_blank" rel="noopener" className="wide">Résumé</a>
          <a href={`mailto:${EMAIL}`} className="wide">Email</a>
          <ThemeToggle dark={dark} toggle={toggle} />
        </div>
      </nav>

      <main className="nf-main">
        <div className="nf-copy intro1">
          <span className="mono accent nf-code">ERROR 404</span>
          <h1 className="nf-title">Node<br />not found<span className="accent">*</span></h1>
          <p className="soft nf-p"><span className="accent">*</span> This page isn’t connected to anything in my graph. The link may be old, or mistyped.</p>
          <div className="ctas">
            <a className="cta inv" href="/">← Back to the graph</a>
            <a className="cta" href="/#work">See my work</a>
            <a className="cta" href={`mailto:${EMAIL}`}><Icon d={<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>} size={18} />Email me <span className="carrow">↗</span></a>
          </div>
        </div>

        <div className="graph nf-fig intro2" style={{ aspectRatio: `${W} / ${H}` }} aria-hidden="true">
          <svg viewBox={`0 0 ${W} ${H}`}>
            <ellipse cx={CX} cy={CY} rx={190} ry={170} className="ring1" />
            {nodes.map(({ n, x, y }) => <line key={n.id} x1={CX} y1={CY} x2={x} y2={y} stroke="var(--line)" />)}
            <line className="nf-edge" x1={CX} y1={CY} x2={Q[0]} y2={Q[1]} />
          </svg>
          {nodes.map(({ n, x, y }) => (
            <span key={n.id} className={`nf-node ${n.type.toLowerCase()}`} style={at(x, y)}><span className="mark" /><span className="lbl">{n.label}</span></span>
          ))}
          <span className="nf-rel mono accent" style={at(395, 230)}>LINKS TO ?</span>
          <span className="nf-q mono" style={at(...Q)}>?</span>
          <span className="nf-path mono muted" style={at(Q[0], 230)}>{location.pathname} · 404</span>
          <span className="me-pulse" style={at(CX, CY)} />
          <span className="me nf-me" style={at(CX, CY)}>BASSAM</span>
          <span className="nf-cap mono muted">FIG.404 — A MISSING EDGE</span>
        </div>
      </main>

      <footer className="footer mono">
        <span>© {new Date().getFullYear()} Bassam Abdulrahim · Riyadh, Saudi Arabia</span>
        <a href={`mailto:${EMAIL}`}>{EMAIL} ↗</a>
      </footer>
    </div>
  )
}

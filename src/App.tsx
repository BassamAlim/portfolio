import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Graph from './Graph'
import { ThemeToggle, reduceMotion, useTheme } from './theme'
import { NODES, LADDER, KPIS, DISCIPLINES, REL, PAPER, adj, byId, EMAIL, CV_URL, FIRST_YEAR, LAST_YEAR, type GraphNode } from './data'

const PHONE = '(max-width: 760px)'
const usePhone = () => useSyncExternalStore(
  (cb) => { const m = matchMedia(PHONE); m.addEventListener('change', cb); return () => m.removeEventListener('change', cb) },
  () => matchMedia(PHONE).matches,
)

function useCountUp(ms: number) {
  const [k, setK] = useState(0)
  useEffect(() => {
    if (reduceMotion()) return setK(1)
    let raf = 0
    const t0 = performance.now() + 250
    const tick = (now: number) => {
      const x = Math.max(0, Math.min(1, (now - t0) / ms))
      setK(1 - (1 - x) ** 3)
      if (x < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [ms])
  return k
}

/** A native modal <dialog> driven by `open`; Esc and backdrop clicks call onClose. */
function Modal({ open, onClose, className, label, children }: { open: boolean, onClose: () => void, className: string, label: string, children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current!
    if (open && !d.open) d.showModal()
    else if (!open && d.open) d.close()
  }, [open])
  return (
    <dialog ref={ref} className={className} aria-label={label} onClose={onClose} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      {children}
    </dialog>
  )
}

export default function App() {
  const phone = usePhone()
  const { dark, toggle: toggleTheme } = useTheme()
  const [year, setYear] = useState(LAST_YEAR)
  const [sel, setSel] = useState<string | null>(null)
  const [hover, setHover] = useState<string | null>(null)
  const [disc, setDisc] = useState('All')
  const [ready, setReady] = useState(false)
  const [copied, setCopied] = useState(false)
  const [sheetMe, setSheetMe] = useState(false)
  const [menu, setMenu] = useState(false)
  const timer = useRef(0)
  const kk = useCountUp(1400)

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 350)
    return () => { clearTimeout(t); clearInterval(timer.current) }
  }, [])

  const visible = (id: string) => ready && byId[id].year <= year
  const inDisc = (id: string) => {
    const n = byId[id]
    if (disc === 'All' || n.type === 'Me' || n.type === 'Org') return true
    if (n.disc) return n.disc.includes(disc)
    return adj[id].some((m) => byId[m].disc?.includes(disc))
  }
  const focus = hover ?? sel
  // desktop: click toggles the inspector; phone: tap opens the sheet
  const pick = (id: string) => phone ? setSel(id) : setSel((s) => (s === id ? null : id))
  const pickMe = () => { setSel(null); setDisc('All'); if (phone) setSheetMe(true) }
  const closeAll = () => { setSel(null); setSheetMe(false); setMenu(false) }

  const replay = () => {
    clearInterval(timer.current)
    setYear(FIRST_YEAR)
    timer.current = window.setInterval(() => setYear((y) => {
      if (y >= LAST_YEAR) { clearInterval(timer.current); return y }
      return y + 1
    }), 700)
  }

  const copyEmail = () => {
    navigator.clipboard?.writeText(EMAIL).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  let cur = -1
  LADDER.forEach(([y], i) => { if (y <= year) cur = i })

  let rn = 0
  const rows = NODES.filter((n) => n.type === 'Project' || n.type === 'Library').sort((a, b) => b.year - a.year)
    .map((n) => {
      const shown = visible(n.id) && (!phone || inDisc(n.id))
      return { n, shown, no: shown ? String(++rn).padStart(2, '0') : '' }
    })

  const kpis = (
    <dl className="kpis">
      {KPIS.map(([n, suf, l]) => <div key={l}><dd>{Math.round(n * kk)}{suf}</dd><dt>{l}</dt></div>)}
    </dl>
  )

  const chips = (
    <div className="chips" role="group" aria-label="Filter by discipline">
      {DISCIPLINES.map((l) => (
        <button key={l} type="button" className={`btn chip${l === disc ? ' on' : ''}`} aria-pressed={l === disc} onClick={() => setDisc(l)}>{l.toLowerCase()}</button>
      ))}
    </div>
  )

  const graph = (
    <Graph compact={phone} focus={phone ? sel : focus} hasSel={!phone && !!sel} visible={visible} inDisc={inDisc}
      onPick={pick} onHover={setHover} onPickMe={pickMe} />
  )

  const trajectory = (
    <section className="trajectory">
      <div className="side-head">
        <span className="mono muted">TRAJECTORY · <span className="accent">{year}</span></span>
        <button type="button" className="btn inv small" onClick={replay}>▶ Replay</button>
      </div>
      <ol className="ladder">
        {LADDER.map(([y, title, where], i) => (
          <li key={title}>
            <button type="button" className={`tl${y <= year ? ' past' : ''}${i === cur ? ' cur' : ''}`} onClick={() => setYear(y)}>
              <span className="mono muted">{y}</span>
              <span className="tl-rail">
                <span className="tl-dot" />
                {i < LADDER.length - 1 && <span className={`tl-stem${LADDER[i + 1][0] <= year ? ' past' : ''}`} />}
              </span>
              <span className="tl-text"><span className="tlt">{title}</span><span className="muted">{where}</span></span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  )

  const tail = <>
    <Publication phone={phone} />
    <Contact phone={phone} copied={copied} onCopy={copyEmail} />
    <footer className="footer mono">
      <span>© {new Date().getFullYear()} Bassam Abdulrahim · Riyadh{phone ? '' : ', Saudi Arabia'}</span>
      <div className="footer-end">
        <span className="muted">Designed and built by me</span>
        {!phone && <ThemeToggle dark={dark} toggle={toggleTheme} />}
        <a href="#top">{phone ? 'Top ↑' : 'Back to top ↑'}</a>
      </div>
    </footer>
  </>

  if (phone) return (
    <div className="page phone" id="top">
      <header className="bar">
        <span className="bar-name">Bassam A.<span className="accent">*</span></span>
        <div className="bar-actions">
          <ThemeToggle dark={dark} toggle={toggleTheme} label={false} />
          <button type="button" className="btn burger" onClick={() => setMenu(true)} aria-label="Open menu"><span /><span /></button>
        </div>
      </header>

      <div className="mono muted eyebrow intro1">AI ENGINEER · RIYADH</div>
      <h1 className="name intro1">Bassam<br />Abdulrahim<span className="accent">*</span></h1>
      <p className="lede-p intro2"><span className="accent">*</span> I build applied AI systems end to end: agents that reason over enterprise knowledge, retrieval that finds the right passage, and document pipelines that can read scanned Arabic PDFs. Self-hosted, open-weight, from prototype to production.</p>
      <div className="intro2">{kpis}</div>

      <section id="graph" className="fig intro3">
        <div className="fig-head mono"><span>FIG.01 — MY WORK</span><span className="muted">{year} · TAP A NODE</span></div>
        {chips}
        {graph}
        <div className="mono muted legend-line">■ project · □ library · ◎ organisation · tools appear when you open a node</div>
      </section>

      {trajectory}

      <section id="work" className="cards">
        <div className="sec-head mono"><span>WORK</span><span className="muted">{rn} ENTRIES</span></div>
        {rows.map(({ n, shown, no }) => (
          <button key={n.id} type="button" className={`card${shown ? '' : ' gone'}`} tabIndex={shown ? 0 : -1} aria-hidden={!shown} onClick={() => pick(n.id)}>
            <span className="card-meta mono"><span className="accent">{no}</span><span className="muted">{REL[n.id]} · {n.year}</span></span>
            <span className="card-title"><span>{n.label}</span><span className="mono">→</span></span>
            <span className="soft card-what">{n.what!.split('. ')[0].replace(/\.$/, '')}</span>
          </button>
        ))}
      </section>

      {tail}

      <Modal open={!!sel || sheetMe} onClose={closeAll} className="sheet" label="Details">
        <span className="grip" />
        <Inspector key={sel ?? 'me'} node={sel ? byId[sel] : null} visible={visible} onPick={pick} onClose={closeAll} />
      </Modal>

      <Modal open={menu} onClose={() => setMenu(false)} className="menu" label="Menu">
        <div className="menu-head"><span className="mono muted">MENU</span><button type="button" className="btn icon-btn" onClick={() => setMenu(false)} aria-label="Close menu">✕</button></div>
        <nav className="menu-nav">
          <a href="#graph" onClick={() => setMenu(false)}>Graph</a>
          <a href="#work" onClick={() => setMenu(false)}>Work</a>
          <a href="#publication" onClick={() => setMenu(false)}>Paper</a>
          <a href="#contact" onClick={() => setMenu(false)}>Contact<span className="accent">*</span></a>
        </nav>
      </Modal>
    </div>
  )

  return (
    <div className="page">
      <nav className="nav" id="top">
        <span>AI ENGINEER · RIYADH</span>
        <div className="nav-links">
          <a href="#graph">Graph</a>
          <a href="#work">Work</a>
          <a href={CV_URL} target="_blank" rel="noopener">Résumé</a>
          <a href={`mailto:${EMAIL}`}>Email</a>
          <ThemeToggle dark={dark} toggle={toggleTheme} />
        </div>
      </nav>

      <header>
        <h1 className="name intro1">Bassam Abdulrahim<span className="accent">*</span></h1>
        <div className="lede intro2">
          <p className="lede-p"><span className="accent">*</span> I build applied AI systems end to end: agents that reason over enterprise knowledge, retrieval that finds the right passage, and document pipelines that can read scanned Arabic PDFs. I work with self-hosted, open-weight models and take ideas from first prototype to production.</p>
          {kpis}
        </div>
      </header>

      <main className="main intro3" id="graph">
        <aside className="side">
          {trajectory}
          <section className="contact-list">
            <span className="mono muted">GET IN TOUCH</span>
            <div className="crow">
              <span className="cico"><Icon d={ICONS.mail} /></span>
              <a href={`mailto:${EMAIL}`} className="ctext"><b>Email</b><span className="mono muted">{EMAIL}</span></a>
              <button type="button" className={`btn copy${copied ? ' done' : ''}`} onClick={copyEmail} aria-label="Copy email address">{copied ? 'COPIED ✓' : 'COPY'}</button>
            </div>
            <ContactRow href="https://github.com/BassamAlim" label="GitHub" sub="github.com/BassamAlim" icon={ICONS.github} />
            <ContactRow href="https://linkedin.com/in/bassam-abdulrahim" label="LinkedIn" sub="in/bassam-abdulrahim" icon={ICONS.linkedin} />
            <ContactRow href={CV_URL} label="Résumé" sub="PDF" icon={ICONS.cv} />
          </section>
        </aside>

        <section className="fig">
          <div className="fig-head mono"><span>FIG.01 — MY WORK, AS A GRAPH</span>{chips}</div>
          {graph}
        </section>

        <Inspector key={sel ?? 'me'} node={sel ? byId[sel] : null} visible={visible} onPick={setSel} />
      </main>

      <section id="work" className="index">
        <div className="irow ihead mono muted">
          <span>NO.</span><span>PROJECT</span><span className="what">WHAT IT IS</span><span className="role">ROLE</span><span className="yr">RELATION · YEAR</span>
        </div>
        {rows.map(({ n, shown, no }) => (
          <button key={n.id} type="button" className={`irow${focus === n.id ? ' on' : ''}${shown ? '' : ' gone'}`}
            tabIndex={shown ? 0 : -1} aria-hidden={!shown} aria-pressed={sel === n.id}
            onClick={() => pick(n.id)} onMouseEnter={() => setHover(n.id)} onMouseLeave={() => setHover(null)}>
            <span className="mono no">{no}</span>
            <span className="rl">{n.label}</span>
            <span className="what">{n.what!.split('. ')[0].replace(/\.$/, '')}</span>
            <span className="role">{n.role}</span>
            <span className="mono yr">{REL[n.id]} · {n.year}</span>
          </button>
        ))}
      </section>

      {tail}
    </div>
  )
}

const ICONS = {
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>,
  github: <><circle cx="6" cy="5.5" r="2.5" /><circle cx="6" cy="18.5" r="2.5" /><circle cx="18" cy="7.5" r="2.5" /><path d="M6 8v8" /><path d="M18 10c0 4.5-6 3.5-10.2 7" /></>,
  linkedin: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M3 13h18" /></>,
  cv: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6" /><path d="M12 12v6" /><path d="M9 15l3 3 3-3" /></>,
}

export function Icon({ d, size = 17 }: { d: React.ReactNode, size?: number }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
}

function ContactRow({ href, label, sub, icon }: { href: string, label: string, sub: string, icon: React.ReactNode }) {
  return (
    <a className="crow" href={href} target="_blank" rel="noopener">
      <span className="cico"><Icon d={icon} /></span>
      <span className="ctext"><b>{label}</b><span className="mono muted">{sub}</span></span>
      <span className="carrow mono">↗</span>
    </a>
  )
}

function Publication({ phone }: { phone: boolean }) {
  return (
    <section id="publication" className="pub-sec">
      <span className="mono muted sec-label">PUBLICATION</span>
      <a className="pub" href={PAPER.url} target="_blank" rel="noopener">
        <span className="pub-body">
          <span className="pub-title">{PAPER.title}</span>
          <span className="soft pub-authors">{PAPER.authors.map((a, i) => <span key={a}>{i > 0 && ', '}{a === 'B. Abdulrahim' ? <strong>{a}</strong> : a}</span>)}</span>
          <span className="mono muted pub-venue">{phone ? PAPER.venueShort : PAPER.venue}</span>
        </span>
        <span className="mono accent pub-cta">Read the paper <span className="carrow">↗</span></span>
      </a>
    </section>
  )
}

function Contact({ phone, copied, onCopy }: { phone: boolean, copied: boolean, onCopy: () => void }) {
  const copy = <button type="button" className={`btn copy-big${copied ? ' done' : ''}`} onClick={onCopy} aria-label="Copy email address">{copied ? 'COPIED ✓' : phone ? 'COPY EMAIL ADDRESS' : 'COPY'}</button>
  const links: [string, string, React.ReactNode][] = [
    ['https://github.com/BassamAlim', 'GitHub', ICONS.github],
    ['https://linkedin.com/in/bassam-abdulrahim', 'LinkedIn', ICONS.linkedin],
    [CV_URL, phone ? 'Résumé' : 'Résumé (PDF)', ICONS.cv],
  ]
  return (
    <section id="contact" className="contact-sec">
      <span className="mono muted sec-label">GET IN TOUCH</span>
      <div className="contact-body">
        <h2 className="talk">Got a hard AI problem?{phone ? ' ' : <br />}<span className="accent">Let’s talk.</span></h2>
        {!phone && <p className="soft talk-p">I’m always happy to hear about interesting problems in AI and software engineering.</p>}
        <div className="ctas">
          <a className="cta inv" href={`mailto:${EMAIL}`}><Icon d={ICONS.mail} size={18} /><span className="grow">{EMAIL}</span><span className="carrow">↗</span></a>
          {copy}
          <div className="cta-links">
            {links.map(([href, label, icon]) => (
              <a key={label} className="cta" href={href} target="_blank" rel="noopener"><Icon d={icon} size={phone ? 20 : 18} /><span>{label}</span>{!phone && <span className="carrow">↗</span>}</a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Inspector({ node: s, visible, onPick, onClose }: { node: GraphNode | null, visible: (id: string) => boolean, onPick: (id: string) => void, onClose?: () => void }) {
  let kind: string, label: string, from: string, rel: string, to: string, what: string
  let props: [string, string][], linkHead: string, links: string[], urls: [string, string][] = []

  if (!s) {
    kind = 'PERSON'; label = 'Bassam Abdulrahim'; from = 'Bassam'; rel = 'WORKS AT'; to = 'Entropy'
    what = 'AI engineer specialising in generative AI systems: retrieval, agentic workflows and document understanding. First hire at Entropy, where I’m now engineering lead.'
    props = [['role', 'Engineering Lead, Entropy'], ['focus', 'Agents, retrieval, document AI'], ['based in', 'Riyadh, Saudi Arabia'], ['languages', 'Arabic, English']]
    linkHead = 'START WITH'
    links = NODES.filter((n) => n.type === 'Project' && visible(n.id)).map((n) => n.id)
  } else if (s.type === 'Tech') {
    const users = adj[s.id].filter(visible)
    kind = 'TOOL'; label = s.label; from = users.map((m) => byId[m].label).join(', '); rel = 'USES'; to = s.label
    what = `A tool I’ve worked with since ${s.year}.`
    props = [['first used', String(s.year)], ['used in', `${users.length} project${users.length === 1 ? '' : 's'}`]]
    linkHead = 'USED IN'; links = users
  } else {
    const tools = adj[s.id].filter((m) => byId[m].type === 'Tech' && visible(m))
    const work = adj[s.id].filter((m) => byId[m].type !== 'Tech' && visible(m))
    kind = s.type.toUpperCase(); label = s.label; from = 'Bassam'; rel = REL[s.id] ?? 'LINKED'; to = s.label; what = s.what!
    props = [[s.type === 'Org' ? 'period' : 'year', s.period ?? String(s.year)], ['role', s.role!]]
    if (s.org) props.push(['context', s.org])
    if (s.disc) props.push(['disciplines', s.disc.join(', ')])
    linkHead = tools.length ? 'BUILT WITH' : 'CONNECTED'; links = [...tools, ...work]; urls = s.urls ?? []
  }

  return (
    <aside className="inspector" aria-live="polite">
      <div className="ins-head mono">
        {onClose
          ? <><span className="accent">{kind}</span><button type="button" className="btn icon-btn" onClick={onClose} aria-label="Close">✕</button></>
          : <><span>INSPECTOR</span><span className="accent">{kind}</span></>}
      </div>
      <h2 className="ins-title">{label}</h2>
      <div className="triple mono"><span className="box">{from}</span><span className="accent">— {rel} →</span><span className="box inv">{to}</span></div>
      <p className="soft">{what}</p>
      <dl className="props">
        {props.map(([k, v]) => <div key={k}><dt className="mono muted">{k}</dt><dd>{v}</dd></div>)}
      </dl>
      {links.length > 0 && (
        <div className="ins-group">
          <span className="mono muted">{linkHead}</span>
          <div className="pills">{links.map((id) => <button key={id} type="button" className="btn pill" onClick={() => onPick(id)}>{byId[id].label}</button>)}</div>
        </div>
      )}
      {urls.length > 0 && (
        <div className="ins-group">
          <span className="mono muted">LINKS</span>
          <div className="pills">{urls.map(([l, href]) => <a key={href} className="pill ext" href={href} target="_blank" rel="noopener">{l} ↗</a>)}</div>
        </div>
      )}
    </aside>
  )
}

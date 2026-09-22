import { useState, type CSSProperties } from 'react'
import { ANG, ME, OTHER, NODES, POS, REL, RINGS, W, H, CX, CY, adj, byId } from './data'

interface Props {
  focus: string | null
  hasSel: boolean
  visible: (id: string) => boolean
  inDisc: (id: string) => boolean
  onPick: (id: string) => void
  onHover: (id: string | null) => void
  onPickMe: () => void
  /** Phone: my direct work only, no tools, relation shown for the focused node alone. */
  compact?: boolean
}

// Phone geometry: one ring of direct nodes in a 358×380 frame.
const PW = 358, PH = 380, PCX = 179, PCY = 186
const PPOS: Record<string, [number, number]> = { me: [PCX, PCY] }
for (const [id] of ME) {
  const a = (ANG[id] * Math.PI) / 180
  PPOS[id] = [Math.round(PCX + 128 * Math.cos(a)), Math.round(PCY + 150 * Math.sin(a))]
}

export default function Graph({ focus, hasSel, visible, inDisc, onPick, onHover, onPickMe, compact = false }: Props) {
  const [hover, setHover] = useState<string | null>(null)
  const [cross, setCross] = useState<[number, number]>([CX, CY])
  const [w, h, cx, cy, pos] = compact ? [PW, PH, PCX, PCY, PPOS] : [W, H, CX, CY, POS]
  const at = ([x, y]: [number, number]): CSSProperties => ({ left: `${(x / w) * 100}%`, top: `${(y / h) * 100}%` })
  const nb = new Set(focus ? (compact ? [focus] : [focus, 'me', ...adj[focus]]) : [])

  const enter = (id: string) => { if (compact) return; setHover(id); setCross(POS[id]); onHover(id) }
  const leave = () => { if (compact) return; setHover(null); onHover(null) }

  const edge = (a: string, b: string, spoke: boolean, i: number) => {
    const shown = visible(a) && visible(b)
    const hi = !!focus && (a === focus || b === focus)
    const stroke = hi ? 'var(--accent)'
      : spoke ? (focus || !inDisc(b) ? 'var(--line2)' : 'var(--edge-me)')
      : (!focus && inDisc(a) && inDisc(b) ? 'var(--edge)' : 'var(--line2)')
    const [x1, y1] = pos[a], [x2, y2] = pos[b]
    const delay = spoke ? 60 + i * (compact ? 40 : 35) : 320 + i * 18
    return (
      <line key={a + b} x1={x1} y1={y1} x2={x2} y2={y2} pathLength={1} stroke={stroke}
        strokeWidth={hi ? 2 : spoke && !focus && inDisc(b) && !compact ? 1.2 : 1}
        style={{ strokeDashoffset: shown ? 0 : 1, '--d': shown ? `${delay}ms` : '0ms' } as CSSProperties} />
    )
  }

  const nodes = compact ? ME.map(([id]) => byId[id]) : NODES.filter((n) => n.type !== 'Me')

  return (
    <div className={`graph${compact ? ' compact' : ''}`} style={{ aspectRatio: `${w} / ${h}` }} onPointerLeave={leave}>
      {!compact && (
        <div className="cross" style={{ ...at(cross), opacity: hover ? 1 : 0 }}>
          <span>x {cross[0]} · y {cross[1]}</span>
        </div>
      )}

      <svg viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
        {compact
          ? <ellipse cx={cx} cy={cy} rx={128} ry={150} className="ring1" />
          : <>
              <ellipse cx={cx} cy={cy} rx={RINGS.inner[0]} ry={RINGS.inner[1]} className="ring1" />
              <ellipse cx={cx} cy={cy} rx={RINGS.outer[0]} ry={RINGS.outer[1]} className="ring2" />
            </>}
        {ME.map(([id], i) => edge('me', id, true, i))}
        {!compact && OTHER.map(([a, b], i) => edge(a, b, false, i))}
      </svg>

      {ME.map(([id], i) => {
        if (compact && id !== focus) return null
        const [x2, y2] = pos[id], on = focus === id
        return (
          <span key={id} className="appear rel" style={{
            ...at([cx + (x2 - cx) * 0.55, cy + (y2 - cy) * 0.55]),
            opacity: visible(id) ? 1 : 0,
            '--d': visible(id) && !compact ? `${450 + i * 35}ms` : '0ms',
          } as CSSProperties}>
            <span style={{ color: on ? 'var(--accent)' : undefined, opacity: (focus && !on) || !inDisc(id) ? 0.2 : 1 }}>{REL[id]}</span>
          </span>
        )
      })}

      {nodes.map((n, i) => {
        const shown = visible(n.id), isF = n.id === focus
        const lit = inDisc(n.id) && (!focus || nb.has(n.id))
        return (
          <span key={n.id} className="appear" style={{
            ...at(pos[n.id]),
            opacity: shown ? 1 : 0,
            scale: shown ? '1' : '0.2',
            '--d': shown ? `${compact ? 120 + i * 45 : (n.type === 'Tech' ? 380 : 120) + (i + 1) * 18}ms` : '0ms',
          } as CSSProperties}>
            <button type="button" className={`node ${n.type.toLowerCase()}${isF ? ' on' : ''}`}
              disabled={!shown} aria-pressed={isF} style={{ opacity: lit ? 1 : compact ? 0.22 : 0.18 }}
              onClick={() => onPick(n.id)} onMouseEnter={() => enter(n.id)} onMouseLeave={leave}
              onFocus={() => enter(n.id)} onBlur={leave}>
              <span className="mark" />
              <span className="lbl">{n.label}</span>
            </button>
          </span>
        )
      })}

      <span className="me-pulse" style={at([cx, cy])} />
      <button type="button" className={`me${hasSel ? ' idle' : ''}`} style={at([cx, cy])} onClick={onPickMe} aria-label="Show my profile">BASSAM</button>

      <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
      {!compact && <>
        <div className="legend"><span>■ project</span><span>□ library</span><span>◎ organisation</span><span className="tool-glyph">tool</span></div>
        <span className="hint">hover to trace · click to inspect</span>
      </>}
    </div>
  )
}

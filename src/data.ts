export type NodeType = 'Me' | 'Org' | 'Project' | 'Library' | 'Tech'

export interface GraphNode {
  id: string
  label: string
  type: NodeType
  year: number
  what?: string
  role?: string
  period?: string
  org?: string
  disc?: string[]
  urls?: [label: string, href: string][]
}

type RawNode = Omit<GraphNode, 'year'> & { year?: number }

const RAW: RawNode[] = [
  { id: 'me', label: 'Bassam', type: 'Me', year: 2019 },
  { id: 'ksu', label: 'King Saud Univ.', type: 'Org', year: 2019, what: 'B.Sc. Computer Science with first-class honors.', role: 'Student', period: '2019 — 2023' },
  { id: 'masterworks', label: 'Master Works', type: 'Org', year: 2023, what: 'Software engineering trainee: backend services in Laravel, Docker, deployments to Kubernetes.', role: 'Trainee', period: 'Jun — Sep 2023' },
  { id: 'entropy', label: 'Entropy', type: 'Org', year: 2023, what: 'Data and AI arm of Saudi Azm. I joined as the first hire; the company is now 50+ people.', role: 'Data Scientist → Senior → Engineering Lead', period: '2023 — now' },
  { id: 'airaware', label: 'AirAware', type: 'Project', year: 2022, urls: [['Paper · DOI', 'https://doi.org/10.1155/2024/3385463']], disc: ['ML Research'], org: 'King Saud University', what: 'End-to-end ML pipeline predicting flight delays in Saudi Arabia. Published by Wiley in 2024.', role: 'Co-author' },
  { id: 'hidaya', label: 'Hidaya', type: 'Project', year: 2021, urls: [['Google Play', 'https://play.google.com/store/apps/details?id=bassamalim.hidaya'], ['GitHub', 'https://github.com/BassamAlim/Hidaya']], disc: ['Mobile'], org: 'Side project', what: 'Open-source Android app for Muslim users. 18,000+ installs, 37 screens, full Arabic/English RTL.', role: 'Solo · 1,000+ commits' },
  { id: 'asaar', label: 'Asaar', type: 'Project', year: 2024, disc: ['Mobile'], org: 'Side project', what: 'Serverless price tracking across online retailers, with a native Android client.', role: 'Builder' },
  { id: 'faheim', label: 'Faheim', type: 'Project', year: 2024, disc: ['Agents', 'Retrieval'], org: 'Entropy', what: 'Generative-AI financial analyst for the Saudi stock market, over thousands of financial reports. Reached beta with real users.', role: 'Co-builder' },
  { id: 'compliance', label: 'Compliance Agent', type: 'Project', year: 2025, disc: ['Agents', 'Retrieval'], org: 'Entropy', what: 'Cross-checks documents against regulations clause by clause, flagging conflicts with citations to the source.', role: 'Builder' },
  { id: 'cortex', label: 'Cortex', type: 'Project', year: 2025, urls: [['cortex.entropy.sa', 'https://cortex.entropy.sa']], disc: ['Agents', 'Retrieval', 'Document AI'], org: 'Entropy', what: 'Enterprise AI knowledge platform on self-hosted open models: Arabic-first ingestion, knowledge graphs, agentic search.', role: 'Lead engineer → technical owner' },
  { id: 'retrievalengine', label: 'RetrievalEngine', type: 'Library', year: 2025, disc: ['Retrieval'], org: 'Entropy', what: 'Internal library: semantic, BM25 and hybrid retrieval, reranking, evaluation. Reused across client work.', role: 'Designer and builder' },
  { id: 'contentminer', label: 'ContentMiner', type: 'Library', year: 2025, disc: ['Document AI'], org: 'Entropy', what: 'Internal library: parsing, OCR, vision-language extraction and evaluation harnesses.', role: 'Designer and builder' },
  { id: 'yolo', label: 'Object Detection', type: 'Project', year: 2026, disc: ['Vision'], org: 'Entropy', what: 'Collected data and fine-tuned YOLO object detection models for enterprise clients.', role: 'Data and training' },
  { id: 'xgboost', label: 'XGBoost', type: 'Tech' }, { id: 'selenium', label: 'Selenium', type: 'Tech' },
  { id: 'kotlin', label: 'Kotlin/Compose', type: 'Tech' }, { id: 'android', label: 'Android', type: 'Tech' },
  { id: 'go', label: 'Go/Lambda', type: 'Tech' }, { id: 'ultralytics', label: 'Ultralytics', type: 'Tech' },
  { id: 'aws', label: 'AWS', type: 'Tech' }, { id: 'langchain', label: 'LangChain', type: 'Tech' },
  { id: 'fastapi', label: 'FastAPI', type: 'Tech' }, { id: 'openllm', label: 'Open LLMs', type: 'Tech' },
  { id: 'pydantic', label: 'Pydantic AI', type: 'Tech' }, { id: 'nextjs', label: 'Next.js', type: 'Tech' },
  { id: 'neo4j', label: 'Neo4j', type: 'Tech' }, { id: 'restate', label: 'Restate', type: 'Tech' },
  { id: 'qdrant', label: 'Qdrant', type: 'Tech' }, { id: 'vlm', label: 'OCR + VLMs', type: 'Tech' },
]

/** My direct relation to each node: the spokes of the graph. */
export const ME: [id: string, rel: string][] = [
  ['ksu', 'STUDIED AT'], ['masterworks', 'TRAINED AT'], ['entropy', 'WORKS AT'], ['airaware', 'CO-AUTHORED'],
  ['hidaya', 'BUILT'], ['asaar', 'BUILT'], ['faheim', 'CO-BUILT'], ['compliance', 'BUILT'], ['cortex', 'BUILT'],
  ['retrievalengine', 'DESIGNED'], ['contentminer', 'DESIGNED'], ['yolo', 'TRAINED'],
]

export const OTHER: [string, string][] = [
  ['retrievalengine', 'cortex'], ['contentminer', 'cortex'], ['retrievalengine', 'compliance'],
  ['cortex', 'pydantic'], ['cortex', 'qdrant'], ['cortex', 'neo4j'], ['cortex', 'restate'], ['cortex', 'fastapi'], ['cortex', 'nextjs'], ['cortex', 'openllm'], ['cortex', 'aws'],
  ['compliance', 'openllm'], ['contentminer', 'vlm'], ['retrievalengine', 'qdrant'],
  ['faheim', 'langchain'], ['faheim', 'fastapi'], ['faheim', 'aws'], ['yolo', 'ultralytics'],
  ['hidaya', 'kotlin'], ['hidaya', 'android'], ['asaar', 'go'], ['asaar', 'aws'], ['asaar', 'android'],
  ['airaware', 'xgboost'], ['airaware', 'selenium'],
]

// Angle (degrees) of each node around me; tools sit on the outer ring.
export const ANG: Record<string, number> = {
  ksu: 198, airaware: 165, hidaya: 132, asaar: 108, yolo: 72, contentminer: 45, retrievalengine: 18, cortex: 350, compliance: 322, faheim: 296, entropy: 268, masterworks: 234,
  xgboost: 190, selenium: 160, kotlin: 130, android: 110, go: 94, ultralytics: 70, vlm: 50, qdrant: 30, restate: 14, neo4j: 0, nextjs: 345, pydantic: 330, openllm: 314, fastapi: 298, langchain: 283, aws: 262,
}

export const W = 700, H = 600, CX = 350, CY = 290
export const RINGS = { inner: [185, 155], outer: [300, 248] } as const

export const POS: Record<string, [number, number]> = { me: [CX, CY] }
for (const n of RAW) {
  if (n.id === 'me') continue
  const a = (ANG[n.id] * Math.PI) / 180
  const [rx, ry] = n.type === 'Tech' ? RINGS.outer : RINGS.inner
  POS[n.id] = [Math.round(CX + rx * Math.cos(a)), Math.round(CY + ry * Math.sin(a))]
}

export const adj: Record<string, string[]> = Object.fromEntries(RAW.map((n) => [n.id, []]))
for (const [a, b] of OTHER) { adj[a].push(b); adj[b].push(a) }

const rawById = Object.fromEntries(RAW.map((n) => [n.id, n]))
// A tool appears the first year a project that uses it does.
export const NODES: GraphNode[] = RAW.map((n) => ({ ...n, year: n.year ?? Math.min(...adj[n.id].map((m) => rawById[m].year!)) }))
export const byId: Record<string, GraphNode> = Object.fromEntries(NODES.map((n) => [n.id, n]))
export const REL: Record<string, string> = Object.fromEntries(ME)

export const LADDER: [year: number, title: string, where: string][] = [
  [2019, 'B.Sc. Computer Science', 'King Saud University'],
  [2023, 'Software Eng. Trainee', 'Master Works'],
  [2023, 'Data Scientist, first hire', 'Entropy'],
  [2025, 'Senior Data Scientist', 'Entropy'],
  [2026, 'Engineering Lead', 'Entropy'],
]

export const FIRST_YEAR = 2019, LAST_YEAR = 2026
export const DISCIPLINES = ['All', 'Agents', 'Retrieval', 'Document AI', 'Vision', 'Mobile', 'ML Research']

export const KPIS: [n: number, suffix: string, label: string][] = [[15, '+', 'AI PROTOTYPES'], [18, 'K+', 'APP INSTALLS'], [1, '', 'PUBLICATION']]

export const PAPER = {
  title: 'Predicting Flight Delays with Machine Learning: A Case Study from Saudi Arabian Airlines',
  authors: ['M. Alfarhood', 'R. Alotaibi', 'B. Abdulrahim', 'A. Einieh', 'M. Almousa', 'A. Alkhanifer'],
  venue: 'International Journal of Aerospace Engineering · Wiley · 2024 · Article 3385463',
  venueShort: 'INT. J. AEROSPACE ENG. · WILEY · 2024',
  url: 'https://doi.org/10.1155/2024/3385463',
}

export const EMAIL = 'bassamalim@outlook.com'
export const CV_URL = '/files/Bassam_Abdulrahim_CV.pdf'

// Official Tabler paths, from the established Lumus icon set (MIT).
const paths = {
  home: ['M5 12l-2 0l9 -9l9 9l-2 0', 'M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7', 'M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6'],
  search: ['M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0', 'M21 21l-6 -6'],
  arrow: ['M5 12l14 0', 'M13 18l6 -6', 'M13 6l6 6'],
} as const

export function LumusIcon({ name }: { name: keyof typeof paths }) {
  return <svg className="lx-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {paths[name].map((d) => <path d={d} key={d} />)}
  </svg>
}

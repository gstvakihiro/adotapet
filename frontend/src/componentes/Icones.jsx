function Svg({ children, tamanho = 20, ...props }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {children}
    </svg>
  )
}

export function Pata({ tamanho = 24, ...props }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <ellipse cx="12" cy="16.5" rx="5" ry="4.2" />
      <ellipse cx="5.2" cy="10.5" rx="2.2" ry="2.8" />
      <ellipse cx="18.8" cy="10.5" rx="2.2" ry="2.8" />
      <ellipse cx="9" cy="5.6" rx="2.1" ry="2.7" />
      <ellipse cx="15" cy="5.6" rx="2.1" ry="2.7" />
    </svg>
  )
}

export const Seta = (p) => <Svg {...p}><path d="M15 18l-6-6 6-6" /></Svg>
export const Mais = (p) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>
export const Check = (p) => <Svg {...p}><path d="M5 12l5 5L20 7" /></Svg>
export const Fechar = (p) => <Svg {...p}><path d="M6 6l12 12M18 6L6 18" /></Svg>
export const Lapis = (p) => <Svg {...p}><path d="M4 20h4L19 9l-4-4L4 16v4z" /></Svg>
export const Coracao = (p) => <Svg {...p}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></Svg>
export const Local = (p) => <Svg {...p}><path d="M12 21s-6-5.3-6-11a6 6 0 0 1 12 0c0 5.7-6 11-6 11z" /><circle cx="12" cy="10" r="2.2" /></Svg>
export const Email = (p) => <Svg {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></Svg>
export const Telefone = (p) => <Svg {...p}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></Svg>
export const Menu = (p) => <Svg {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Svg>
export const Abaixo = (p) => <Svg {...p}><path d="M6 9l6 6 6-6" /></Svg>
export const Filtro = (p) => <Svg {...p}><path d="M4 6h16M7 12h10M10 18h4" /></Svg>
export const Camera = (p) => <Svg {...p}><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></Svg>

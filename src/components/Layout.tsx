import { useLayoutEffect, useRef } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { LumusIcon } from './LumusIcon'

const links = [
  ['/', '首頁'],
  ['/guide', '規則整理'],
  ['/dictionary', '動詞字典'],
  ['/practice', '快速練習'],
] as const

export function Layout() {
  const { pathname, search } = useLocation()
  const mainRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    mainRef.current?.focus({ preventScroll: true })
  }, [pathname, search])

  return (
    <div className="site-shell" data-lumus-page="japanese">
      <a className="lx-skip-link" href="#main-content">跳到主要內容</a>
      <header className="lx-site-header">
        <div className="lx-container lx-header-inner">
          <div className="lx-brand-group">
            <a className="lx-brand" href="https://lumusxlab.com/" aria-label="Lumus 作品與工具">Lumus</a>
            <NavLink className="lx-site-name" to="/">日文動詞全解析</NavLink>
          </div>
          <nav className="lx-site-nav" aria-label="主要導覽">
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="lx-container page-content" id="main-content" ref={mainRef} tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="lx-site-footer">
        <div className="lx-container lx-footer-inner">
          <span>日文動詞全解析 · Lumus</span>
          <a href="https://lumusxlab.com/"><LumusIcon name="home" />回到作品與工具</a>
        </div>
      </footer>
    </div>
  )
}

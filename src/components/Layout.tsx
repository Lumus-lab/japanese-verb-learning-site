import { Activity } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

const links = [
  ['/', '首頁'],
  ['/guide', '規則整理'],
  ['/dictionary', '動詞字典'],
  ['/practice', '快速練習'],
] as const

export function Layout() {
  return (
    <>
      <header className="site-header">
        <div className="content header-inner">
          <NavLink className="brand" to="/">
            <Activity aria-hidden="true" size={28} />
            <span>日文動詞全解析系統</span>
          </NavLink>
          <nav aria-label="主要導覽">
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/'}>
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="content page-content">
        <Outlet />
      </main>
    </>
  )
}

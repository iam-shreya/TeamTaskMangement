import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <div className={`app-layout ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className="sidebar" id="main-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect x="2" y="2" width="24" height="24" rx="6" fill="url(#logo-grad)" />
                <path d="M8 14l4 4 8-8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="logo-grad" x1="2" y1="2" x2="26" y2="26">
                    <stop stopColor="#6C63FF" />
                    <stop offset="1" stopColor="#00D4AA" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            {!collapsed && <span className="logo-text">Planex</span>}
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle sidebar"
            id="sidebar-toggle-btn"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d={collapsed ? "M6 3l6 6-6 6" : "M12 3l-6 6 6 6"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-dashboard">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              <rect x="11" y="2" width="7" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              <rect x="11" y="8" width="7" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            {!collapsed && <span>Dashboard</span>}
          </NavLink>

          <NavLink to="/projects" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-projects">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            {!collapsed && <span>Projects</span>}
          </NavLink>

          <NavLink to="/teams" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-teams">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="13" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
              <path d="M1 17c0-2.5 2.5-4.5 6-4.5s6 2 6 4.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M13 12.5c2.5 0 5 1.5 5 4.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            {!collapsed && <span>Teams</span>}
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile" id="user-profile">
            <div className="user-avatar" style={{ background: user?.avatar_color || '#6C63FF' }}>
              {initials}
            </div>
            {!collapsed && (
              <div className="user-info">
                <span className="user-name">{user?.name}</span>
                <span className="user-email">{user?.email}</span>
              </div>
            )}
          </div>
          {!collapsed && (
            <button className="logout-btn" onClick={handleLogout} id="logout-btn">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M6 15H4a1 1 0 01-1-1V4a1 1 0 011-1h2M12 12l3-3-3-3M7 9h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

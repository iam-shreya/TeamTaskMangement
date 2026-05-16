import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

export default function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const { data } = await api.get('/dashboard/')
      setData(data)
    } catch (err) {
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="page-loader"><div className="loading-spinner" /><p>Loading dashboard...</p></div>
  }

  if (!data) {
    return <div className="page-empty"><p>Unable to load dashboard data.</p></div>
  }

  const totalByStatus = data.by_status.todo + data.by_status.in_progress + data.by_status.done
  const getPercent = (val) => totalByStatus > 0 ? Math.round((val / totalByStatus) * 100) : 0

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">{greeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's what's happening across your projects</p>
        </div>
      </header>

      {/* Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card" id="stat-total">
          <div className="stat-icon stat-icon-blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" /><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" /><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" /><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" /></svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{data.total_tasks}</span>
            <span className="stat-label">Total Tasks</span>
          </div>
        </div>

        <div className="stat-card" id="stat-progress">
          <div className="stat-icon stat-icon-amber">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" /><path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{data.by_status.in_progress}</span>
            <span className="stat-label">In Progress</span>
          </div>
        </div>

        <div className="stat-card" id="stat-done">
          <div className="stat-icon stat-icon-green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" /><path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{data.by_status.done}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>

        <div className="stat-card" id="stat-overdue">
          <div className="stat-icon stat-icon-red">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01M4.93 19h14.14c1.34 0 2.18-1.46 1.51-2.63L13.51 4.25a1.73 1.73 0 00-3.02 0L3.42 16.37C2.75 17.54 3.59 19 4.93 19z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{data.overdue}</span>
            <span className="stat-label">Overdue</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Status Distribution */}
        <div className="dash-card" id="status-chart">
          <h3 className="dash-card-title">Task Distribution</h3>
          <div className="status-chart">
            <div className="donut-chart">
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--surface-2)" strokeWidth="12" />
                {totalByStatus > 0 && (
                  <>
                    <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-todo)"
                      strokeWidth="12" strokeDasharray={`${getPercent(data.by_status.todo) * 3.14} 314`}
                      strokeDashoffset="0" transform="rotate(-90 60 60)" strokeLinecap="round" />
                    <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-progress)"
                      strokeWidth="12" strokeDasharray={`${getPercent(data.by_status.in_progress) * 3.14} 314`}
                      strokeDashoffset={`${-getPercent(data.by_status.todo) * 3.14}`} transform="rotate(-90 60 60)" strokeLinecap="round" />
                    <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-done)"
                      strokeWidth="12" strokeDasharray={`${getPercent(data.by_status.done) * 3.14} 314`}
                      strokeDashoffset={`${-(getPercent(data.by_status.todo) + getPercent(data.by_status.in_progress)) * 3.14}`} transform="rotate(-90 60 60)" strokeLinecap="round" />
                  </>
                )}
                <text x="60" y="56" textAnchor="middle" className="donut-total">{totalByStatus}</text>
                <text x="60" y="72" textAnchor="middle" className="donut-label">tasks</text>
              </svg>
            </div>
            <div className="status-legend">
              <div className="legend-item">
                <span className="legend-dot" style={{ background: 'var(--color-todo)' }} />
                <span className="legend-text">To Do</span>
                <span className="legend-count">{data.by_status.todo}</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: 'var(--color-progress)' }} />
                <span className="legend-text">In Progress</span>
                <span className="legend-count">{data.by_status.in_progress}</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: 'var(--color-done)' }} />
                <span className="legend-text">Done</span>
                <span className="legend-count">{data.by_status.done}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Team Workload */}
        <div className="dash-card" id="team-workload">
          <h3 className="dash-card-title">Team Workload</h3>
          {data.tasks_per_user.length === 0 ? (
            <p className="empty-text">No tasks assigned yet</p>
          ) : (
            <div className="workload-list">
              {data.tasks_per_user.map((item) => (
                <div key={item.assignee__id} className="workload-item">
                  <div className="workload-user">
                    <div className="user-avatar-sm" style={{ background: item.assignee__avatar_color || '#6C63FF' }}>
                      {item.assignee__name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <span className="workload-name">{item.assignee__name}</span>
                  </div>
                  <div className="workload-bar-wrap">
                    <div
                      className="workload-bar"
                      style={{ width: `${Math.min(100, (item.count / Math.max(...data.tasks_per_user.map(u => u.count))) * 100)}%` }}
                    />
                  </div>
                  <span className="workload-count">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="dash-card dash-card-wide" id="recent-tasks">
          <div className="dash-card-header">
            <h3 className="dash-card-title">My Recent Tasks</h3>
            <Link to="/projects" className="dash-card-link">View all →</Link>
          </div>
          {data.recent_tasks.length === 0 ? (
            <div className="empty-state">
              <p className="empty-text">No tasks assigned to you yet.</p>
              <Link to="/projects" className="btn btn-sm btn-primary">Browse Projects</Link>
            </div>
          ) : (
            <div className="recent-tasks-list">
              {data.recent_tasks.map((task) => (
                <Link key={task.id} to={`/projects/${task.project}`} className="recent-task-item">
                  <div className="task-status-dot-wrap">
                    <span className={`task-status-dot status-${task.status.toLowerCase()}`} />
                  </div>
                  <div className="recent-task-info">
                    <span className="recent-task-title">{task.title}</span>
                    <span className="recent-task-project">{task.project_name}</span>
                  </div>
                  <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </span>
                  {task.due_date && (
                    <span className={`task-due ${task.is_overdue ? 'overdue' : ''}`}>
                      {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Project Stats */}
        <div className="dash-card dash-card-wide" id="project-stats">
          <h3 className="dash-card-title">Projects Overview</h3>
          {data.project_stats.length === 0 ? (
            <div className="empty-state">
              <p className="empty-text">No projects yet.</p>
              <Link to="/projects" className="btn btn-sm btn-primary">Create Project</Link>
            </div>
          ) : (
            <div className="project-stats-grid">
              {data.project_stats.map((proj) => {
                const progress = proj.total > 0 ? Math.round((proj.done / proj.total) * 100) : 0
                return (
                  <Link key={proj.project__id} to={`/projects/${proj.project__id}`} className="project-stat-card">
                    <div className="project-stat-header">
                      <div className="project-color-dot" style={{ background: proj.project__color || '#6C63FF' }} />
                      <span className="project-stat-name">{proj.project__name}</span>
                    </div>
                    <div className="progress-bar-wrap">
                      <div className="progress-bar" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="project-stat-footer">
                      <span>{proj.done}/{proj.total} done</span>
                      <span className="progress-pct">{progress}%</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

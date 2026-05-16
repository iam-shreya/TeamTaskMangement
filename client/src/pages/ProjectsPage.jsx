import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import Modal from '../components/Modal'
import { useToast } from '../context/ToastContext'

const PROJECT_COLORS = ['#6C63FF', '#00D4AA', '#FF6B6B', '#FFB86C', '#50C8FF', '#FF79C6', '#8BE9FD']

export default function ProjectsPage() {
  const { addToast } = useToast()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', color: PROJECT_COLORS[0] })
  const [creating, setCreating] = useState(false)

  useEffect(() => { fetchProjects() }, [])

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects/')
      setProjects(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      await api.post('/projects/', form)
      addToast('Project created!', 'success')
      setShowCreate(false)
      setForm({ name: '', description: '', color: PROJECT_COLORS[0] })
      fetchProjects()
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to create project', 'error')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return <div className="page-loader"><div className="loading-spinner" /><p>Loading projects...</p></div>
  }

  return (
    <div className="projects-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} in your workspace</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)} id="create-project-btn">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          New Project
        </button>
      </header>

      {projects.length === 0 ? (
        <div className="empty-state-full">
          <div className="empty-illustration">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
              <rect x="20" y="30" width="80" height="60" rx="8" stroke="var(--text-tertiary)" strokeWidth="2" strokeDasharray="4 4" />
              <path d="M50 55l10 10 20-20" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3>No projects yet</h3>
          <p>Create your first project to start managing tasks with your team.</p>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Create Your First Project</button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => {
            const progress = project.task_count > 0
              ? Math.round((project.completed_count / project.task_count) * 100)
              : 0
            return (
              <Link key={project.id} to={`/projects/${project.id}`} className="project-card" id={`project-${project.id}`}>
                <div className="project-card-accent" style={{ background: project.color || '#6C63FF' }} />
                <div className="project-card-body">
                  <h3 className="project-card-name">{project.name}</h3>
                  {project.description && (
                    <p className="project-card-desc">{project.description}</p>
                  )}
                  <div className="project-card-meta">
                    <span className="meta-item">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9.5 1.5h-5l-3 3v5l3 3h5l3-3v-5l-3-3z" stroke="currentColor" strokeWidth="1.2" /></svg>
                      {project.task_count} tasks
                    </span>
                    <span className="meta-item">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="5" cy="5" r="3" stroke="currentColor" strokeWidth="1.2" /><circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.2" /></svg>
                      {project.member_count} member{project.member_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="progress-bar-wrap">
                    <div className="progress-bar" style={{ width: `${progress}%`, background: project.color || '#6C63FF' }} />
                  </div>
                  <div className="project-card-footer">
                    <span className={`role-badge role-${project.my_role?.toLowerCase()}`}>{project.my_role}</span>
                    <span className="progress-pct">{progress}%</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Project">
        <form onSubmit={handleCreate} id="create-project-form">
          <div className="form-group">
            <label htmlFor="project-name">Project name</label>
            <input
              id="project-name"
              type="text"
              placeholder="e.g. Website Redesign"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="project-desc">Description <span className="optional">(optional)</span></label>
            <textarea
              id="project-desc"
              placeholder="What is this project about?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Color</label>
            <div className="color-picker">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`color-swatch ${form.color === c ? 'selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => setForm({ ...form, color: c })}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? <span className="btn-loader" /> : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/client'
import Modal from '../components/Modal'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const STATUSES = [
  { key: 'TODO', label: 'To Do', icon: '○' },
  { key: 'IN_PROGRESS', label: 'In Progress', icon: '◐' },
  { key: 'DONE', label: 'Done', icon: '●' },
]

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToast } = useToast()

  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [memberEmail, setMemberEmail] = useState('')
  const [memberRole, setMemberRole] = useState('MEMBER')
  const [addingMember, setAddingMember] = useState(false)
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', priority: 'MEDIUM', due_date: '', assignee: '',
  })
  const [savingTask, setSavingTask] = useState(false)

  const isAdmin = project?.my_role === 'ADMIN'

  useEffect(() => { fetchAll() }, [id])

  const fetchAll = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        api.get(`/projects/${id}/`),
        api.get(`/tasks/project/${id}/`),
      ])
      setProject(projRes.data)
      setTasks(taskRes.data)
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 404) {
        navigate('/projects')
      }
    } finally {
      setLoading(false)
    }
  }

  const openCreateTask = () => {
    setEditingTask(null)
    setTaskForm({ title: '', description: '', priority: 'MEDIUM', due_date: '', assignee: '' })
    setShowTaskModal(true)
  }

  const openEditTask = (task) => {
    setEditingTask(task)
    setTaskForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      due_date: task.due_date || '',
      assignee: task.assignee || '',
    })
    setShowTaskModal(true)
  }

  const handleSaveTask = async (e) => {
    e.preventDefault()
    setSavingTask(true)
    try {
      const payload = { ...taskForm }
      if (!payload.assignee) payload.assignee = null
      if (!payload.due_date) payload.due_date = null

      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}/`, payload)
        addToast('Task updated', 'success')
      } else {
        await api.post(`/tasks/project/${id}/`, payload)
        addToast('Task created', 'success')
      }
      setShowTaskModal(false)
      fetchAll()
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to save task', 'error')
    } finally {
      setSavingTask(false)
    }
  }

  const handleStatusChange = async (task, newStatus) => {
    try {
      await api.put(`/tasks/${task.id}/`, { status: newStatus })
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
      )
      addToast(`Task moved to ${STATUSES.find(s => s.key === newStatus)?.label}`, 'success')
    } catch (err) {
      addToast('Failed to update status', 'error')
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return
    try {
      await api.delete(`/tasks/${taskId}/`)
      addToast('Task deleted', 'success')
      fetchAll()
    } catch (err) {
      addToast('Failed to delete task', 'error')
    }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    setAddingMember(true)
    try {
      await api.post(`/projects/${id}/members/`, { email: memberEmail, role: memberRole })
      addToast('Member added!', 'success')
      setMemberEmail('')
      setMemberRole('MEMBER')
      fetchAll()
    } catch (err) {
      addToast(err.response?.data?.detail || err.response?.data?.email?.[0] || 'Failed to add member', 'error')
    } finally {
      setAddingMember(false)
    }
  }

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member?')) return
    try {
      await api.delete(`/projects/${id}/members/${userId}/`)
      addToast('Member removed', 'success')
      fetchAll()
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to remove member', 'error')
    }
  }

  const handleDeleteProject = async () => {
    if (!confirm('Delete this entire project and all its tasks? This cannot be undone.')) return
    try {
      await api.delete(`/projects/${id}/`)
      addToast('Project deleted', 'success')
      navigate('/projects')
    } catch (err) {
      addToast('Failed to delete project', 'error')
    }
  }

  if (loading) {
    return <div className="page-loader"><div className="loading-spinner" /><p>Loading project...</p></div>
  }

  if (!project) return null

  return (
    <div className="project-detail-page">
      <header className="page-header">
        <div className="project-header-info">
          <div className="project-color-bar" style={{ background: project.color || '#6C63FF' }} />
          <div>
            <h1 className="page-title">{project.name}</h1>
            {project.description && <p className="page-subtitle">{project.description}</p>}
          </div>
        </div>
        <div className="header-actions">
          {isAdmin && (
            <>
              <button className="btn btn-ghost" onClick={() => setShowMemberModal(true)} id="manage-members-btn">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="7" cy="6" r="3" stroke="currentColor" strokeWidth="1.3" /><path d="M1 15c0-2.8 2.7-5 6-5s6 2.2 6 5" stroke="currentColor" strokeWidth="1.3" /><path d="M14 3v6M11 6h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
                Members
              </button>
              <button className="btn btn-primary" onClick={openCreateTask} id="create-task-btn">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                Add Task
              </button>
            </>
          )}
        </div>
      </header>

      {/* Members Bar */}
      <div className="members-bar">
        <div className="members-avatars">
          {project.members?.map((m) => (
            <div
              key={m.id}
              className="member-avatar"
              style={{ background: m.user.avatar_color || '#6C63FF' }}
              title={`${m.user.name} (${m.role})`}
            >
              {m.user.name[0].toUpperCase()}
            </div>
          ))}
        </div>
        <span className="members-count">{project.members?.length} member{project.members?.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Kanban Board */}
      <div className="kanban-board" id="kanban-board">
        {STATUSES.map(({ key, label, icon }) => {
          const columnTasks = tasks.filter((t) => t.status === key)
          return (
            <div key={key} className={`kanban-column column-${key.toLowerCase()}`}>
              <div className="kanban-column-header">
                <span className="column-icon">{icon}</span>
                <h3 className="column-title">{label}</h3>
                <span className="column-count">{columnTasks.length}</span>
              </div>
              <div className="kanban-cards">
                {columnTasks.map((task) => (
                  <div key={task.id} className="task-card" id={`task-${task.id}`}>
                    <div className="task-card-top">
                      <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
                        {task.priority}
                      </span>
                      {(isAdmin || task.assignee === user?.id) && (
                        <div className="task-card-actions">
                          {isAdmin && (
                            <button className="icon-btn" onClick={() => openEditTask(task)} title="Edit task">
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10 1.5l2.5 2.5L4.5 12H2v-2.5L10 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>
                            </button>
                          )}
                          {isAdmin && (
                            <button className="icon-btn icon-btn-danger" onClick={() => handleDeleteTask(task.id)} title="Delete task">
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2.5h4V4M3 4l.7 8h6.6l.7-8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <h4 className="task-card-title">{task.title}</h4>
                    {task.description && (
                      <p className="task-card-desc">{task.description.slice(0, 80)}{task.description.length > 80 ? '…' : ''}</p>
                    )}
                    <div className="task-card-footer">
                      {task.assignee_detail && (
                        <div className="task-assignee">
                          <div className="user-avatar-xs" style={{ background: task.assignee_detail.avatar_color || '#6C63FF' }}>
                            {task.assignee_detail.name[0].toUpperCase()}
                          </div>
                          <span>{task.assignee_detail.name.split(' ')[0]}</span>
                        </div>
                      )}
                      {task.due_date && (
                        <span className={`task-due ${task.is_overdue ? 'overdue' : ''}`}>
                          {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    {/* Status move buttons */}
                    <div className="task-move-actions">
                      {STATUSES.filter(s => s.key !== key).map((s) => (
                        <button
                          key={s.key}
                          className={`move-btn move-${s.key.toLowerCase()}`}
                          onClick={() => handleStatusChange(task, s.key)}
                          title={`Move to ${s.label}`}
                        >
                          {s.icon} {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {columnTasks.length === 0 && (
                  <div className="kanban-empty">No tasks</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Create/Edit Task Modal */}
      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title={editingTask ? 'Edit Task' : 'Create Task'}>
        <form onSubmit={handleSaveTask} id="task-form">
          <div className="form-group">
            <label htmlFor="task-title">Title</label>
            <input id="task-title" type="text" placeholder="Task title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required autoFocus />
          </div>
          <div className="form-group">
            <label htmlFor="task-desc">Description <span className="optional">(optional)</span></label>
            <textarea id="task-desc" placeholder="Describe the task..." value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} rows={3} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="task-priority">Priority</label>
              <select id="task-priority" value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="task-due">Due Date <span className="optional">(optional)</span></label>
              <input id="task-due" type="date" value={taskForm.due_date} onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="task-assignee">Assignee <span className="optional">(optional)</span></label>
            <select id="task-assignee" value={taskForm.assignee} onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}>
              <option value="">Unassigned</option>
              {project.members?.map((m) => (
                <option key={m.user.id} value={m.user.id}>{m.user.name} ({m.role})</option>
              ))}
            </select>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setShowTaskModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={savingTask}>
              {savingTask ? <span className="btn-loader" /> : editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Members Modal */}
      <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} title="Manage Members" size="medium">
        <div className="members-management">
          <form onSubmit={handleAddMember} className="add-member-form" id="add-member-form">
            <div className="form-row">
              <div className="form-group" style={{ flex: 2 }}>
                <input type="email" placeholder="Enter email address" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} required />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <select value={memberRole} onChange={(e) => setMemberRole(e.target.value)}>
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" disabled={addingMember}>
                {addingMember ? <span className="btn-loader" /> : 'Add'}
              </button>
            </div>
          </form>

          <div className="members-list">
            {project.members?.map((m) => (
              <div key={m.id} className="member-row">
                <div className="member-info">
                  <div className="user-avatar-sm" style={{ background: m.user.avatar_color || '#6C63FF' }}>
                    {m.user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="member-name">{m.user.name}</span>
                    <span className="member-email">{m.user.email}</span>
                  </div>
                </div>
                <div className="member-actions">
                  <span className={`role-badge role-${m.role.toLowerCase()}`}>{m.role}</span>
                  {m.user.id !== user?.id && (
                    <button className="icon-btn icon-btn-danger" onClick={() => handleRemoveMember(m.user.id)} title="Remove member">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {isAdmin && (
            <div className="danger-zone">
              <button className="btn btn-danger" onClick={handleDeleteProject} id="delete-project-btn">
                Delete Project
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

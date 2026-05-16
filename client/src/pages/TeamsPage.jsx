import { useState, useEffect } from 'react'
import api from '../api/client'
import Modal from '../components/Modal'
import { useToast } from '../context/ToastContext'

const TEAM_COLORS = ['#6C63FF', '#00D4AA', '#FF6B6B', '#FFB86C', '#50C8FF', '#FF79C6', '#8BE9FD']

export default function TeamsPage() {
  const { addToast } = useToast()
  const [teams, setTeams] = useState([])
  const [teamDetails, setTeamDetails] = useState({})
  const [allUsers, setAllUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showManage, setShowManage] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', color: TEAM_COLORS[0] })
  const [creating, setCreating] = useState(false)
  const [addEmail, setAddEmail] = useState('')
  const [addRole, setAddRole] = useState('MEMBER')
  const [addingMember, setAddingMember] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [teamsRes, usersRes] = await Promise.all([
        api.get('/teams/'),
        api.get('/teams/users/'),
      ])
      setTeams(teamsRes.data)
      setAllUsers(usersRes.data)
      // Fetch details for each team to show members
      const details = {}
      await Promise.all(
        teamsRes.data.map(async (t) => {
          try {
            const { data } = await api.get(`/teams/${t.id}/`)
            details[t.id] = data
          } catch {}
        })
      )
      setTeamDetails(details)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTeamDetail = async (teamId) => {
    try {
      const { data } = await api.get(`/teams/${teamId}/`)
      return data
    } catch {
      return null
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      await api.post('/teams/', form)
      addToast('Team created!', 'success')
      setShowCreate(false)
      setForm({ name: '', description: '', color: TEAM_COLORS[0] })
      fetchData()
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to create team', 'error')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteTeam = async (teamId) => {
    if (!confirm('Delete this team? This cannot be undone.')) return
    try {
      await api.delete(`/teams/${teamId}/`)
      addToast('Team deleted', 'success')
      setShowManage(null)
      fetchData()
    } catch (err) {
      addToast('Failed to delete team', 'error')
    }
  }

  const handleAddMember = async (e, teamId) => {
    e.preventDefault()
    setAddingMember(true)
    try {
      await api.post(`/teams/${teamId}/members/`, { email: addEmail, role: addRole })
      addToast('Member added!', 'success')
      setAddEmail('')
      setAddRole('MEMBER')
      fetchData()
      const updated = await fetchTeamDetail(teamId)
      if (updated) setShowManage(updated)
    } catch (err) {
      addToast(err.response?.data?.detail || err.response?.data?.email?.[0] || 'Failed to add member', 'error')
    } finally {
      setAddingMember(false)
    }
  }

  const handleRemoveMember = async (teamId, userId) => {
    if (!confirm('Remove this member from the team?')) return
    try {
      await api.delete(`/teams/${teamId}/members/${userId}/`)
      addToast('Member removed', 'success')
      fetchData()
      const updated = await fetchTeamDetail(teamId)
      if (updated) setShowManage(updated)
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to remove member', 'error')
    }
  }

  const openManage = async (teamId) => {
    const detail = await fetchTeamDetail(teamId)
    if (detail) setShowManage(detail)
  }

  if (loading) {
    return <div className="page-loader"><div className="loading-spinner" /><p>Loading teams...</p></div>
  }

  return (
    <div className="teams-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Teams</h1>
          <p className="page-subtitle">{teams.length} team{teams.length !== 1 ? 's' : ''} in your workspace</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)} id="create-team-btn">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          New Team
        </button>
      </header>

      {teams.length === 0 ? (
        <div className="empty-state-full">
          <div className="empty-illustration">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
              <circle cx="40" cy="50" r="15" stroke="var(--text-3)" strokeWidth="2" strokeDasharray="4 4" />
              <circle cx="70" cy="50" r="15" stroke="var(--text-3)" strokeWidth="2" strokeDasharray="4 4" />
              <circle cx="55" cy="75" r="15" stroke="var(--primary)" strokeWidth="2.5" />
            </svg>
          </div>
          <h3>No teams yet</h3>
          <p>Create your first team to organize members and collaborate.</p>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Create Your First Team</button>
        </div>
      ) : (
        <div className="teams-grid">
          {teams.map((team) => {
            const detail = teamDetails[team.id]
            const members = detail?.team_members || []
            const showMax = 5
            const extraCount = members.length - showMax

            return (
              <div key={team.id} className="team-card" id={`team-${team.id}`}>
                <div className="team-card-accent" style={{ background: team.color || '#6C63FF' }} />
                <div className="team-card-body">
                  <div className="team-card-header">
                    <h3 className="team-card-name">{team.name}</h3>
                    <button
                      className="btn-manage"
                      onClick={() => openManage(team.id)}
                      id={`manage-team-${team.id}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      Manage
                    </button>
                  </div>
                  {team.description && (
                    <p className="team-card-desc">{team.description}</p>
                  )}
                  <div className="team-card-meta">
                    <span className="meta-item">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="5" cy="5" r="3" stroke="currentColor" strokeWidth="1.2" />
                        <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.2" />
                      </svg>
                      {team.member_count} member{team.member_count !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Avatar row */}
                  {members.length > 0 && (
                    <div className="team-avatars-row">
                      {members.slice(0, showMax).map((m) => (
                        <div
                          key={m.id}
                          className="team-avatar-circle"
                          style={{ background: m.user.avatar_color || '#6C63FF' }}
                          title={m.user.name}
                        >
                          {m.user.name[0].toUpperCase()}
                        </div>
                      ))}
                      {extraCount > 0 && (
                        <div className="team-avatar-more">+{extraCount}</div>
                      )}
                    </div>
                  )}

                  {/* Member table */}
                  {members.length > 0 && (
                    <table className="team-member-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Role</th>
                          <th>Email</th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.map((m) => (
                          <tr key={m.id}>
                            <td>
                              <div className="member-name-cell">
                                <div
                                  className="user-avatar-xs"
                                  style={{ background: m.user.avatar_color || '#6C63FF' }}
                                >
                                  {m.user.name[0].toUpperCase()}
                                </div>
                                {m.user.name}
                              </div>
                            </td>
                            <td>
                              <span className={`role-badge role-${m.role.toLowerCase()}`}>{m.role}</span>
                            </td>
                            <td style={{ color: '#9ca3af', fontSize: '0.82rem' }}>{m.user.email}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Team Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Team">
        <form onSubmit={handleCreate} id="create-team-form">
          <div className="form-group">
            <label htmlFor="team-name">Team name</label>
            <input
              id="team-name"
              type="text"
              placeholder="e.g. Engineering"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="team-desc">Description <span className="optional">(optional)</span></label>
            <textarea
              id="team-desc"
              placeholder="What does this team do?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Color</label>
            <div className="color-picker">
              {TEAM_COLORS.map((c) => (
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
              {creating ? <span className="btn-loader" /> : 'Create Team'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Manage Team Modal */}
      <Modal
        isOpen={!!showManage}
        onClose={() => setShowManage(null)}
        title={showManage ? `Manage - ${showManage.name}` : 'Manage Team'}
        size="medium"
      >
        {showManage && (
          <div className="members-management">
            <form onSubmit={(e) => handleAddMember(e, showManage.id)} className="add-member-form" id="add-team-member-form">
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    required
                    list="user-emails"
                  />
                  <datalist id="user-emails">
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.email}>{u.name}</option>
                    ))}
                  </datalist>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <select value={addRole} onChange={(e) => setAddRole(e.target.value)}>
                    <option value="MEMBER">Member</option>
                    <option value="LEAD">Lead</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" disabled={addingMember} id="add-team-member-btn">
                  {addingMember ? <span className="btn-loader" /> : 'Add'}
                </button>
              </div>
            </form>

            <div className="members-list">
              {showManage.team_members?.map((m) => (
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
                    <button
                      className="icon-btn icon-btn-danger"
                      onClick={() => handleRemoveMember(showManage.id, m.user.id)}
                      title="Remove member"
                      id={`remove-member-${m.user.id}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 4h10M5 4V2.5h4V4M3 4l.7 8h6.6l.7-8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="danger-zone">
              <button className="btn btn-danger" onClick={() => handleDeleteTeam(showManage.id)} id="delete-team-btn">
                Delete Team
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

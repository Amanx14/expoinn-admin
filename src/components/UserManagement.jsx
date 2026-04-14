const roleColors = {
  Admin:              { bg: 'rgba(201,168,76,0.15)',  txt: '#E8C96B' },
  'Event Sales Team': { bg: 'rgba(107,158,201,0.15)', txt: '#93C5FD' },
  Management:         { bg: 'rgba(107,201,158,0.15)', txt: '#6EE7B7' },
};

export default function UserManagement({ 
  users, 
  onAddUser, 
  onToggleUserStatus, 
  onRemoveUser 
}) {
  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>User Management</h1>
          <p>Manage access for admin, event sales team, and management users.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => onAddUser({ id: users.length + 1, name: 'New User', role: 'Event Sales Team', email: 'new@expoinn.com', status: 'active', initials: 'NU' })}>+ Invite User</button>
      </div>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        {['Admin','Event Sales Team','Management'].map(role => {
          const count = users.filter(u => u.role === role).length;
          const rc = roleColors[role] || roleColors['Event Sales Team'];
          return (
            <div key={role} className="stat-card">
              <div className="stat-label">{role}</div>
              <div className="stat-value" style={{ fontSize: '2rem' }}>{count}</div>
              <div className="stat-sub" style={{ color: rc.txt }}>{role === 'Admin' ? 'Full access' : role === 'Event Sales Team' ? 'Booking access' : 'Read & approve'}</div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: 18 }}>Team Members</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(users || []).map(u => {
              const rc = roleColors[u.role] || roleColors['Sales Team'];
              return (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold-dim), var(--gold))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 600, color: 'var(--bg-base)', flexShrink: 0 }}>
                        {u.initials}
                      </div>
                      <span style={{ fontWeight: 500 }}>{u.name}</span>
                    </div>
                  </td>
                  <td className="muted">{u.email}</td>
                  <td>
                    <span style={{ fontSize: '0.74rem', padding: '3px 10px', borderRadius: 99, background: rc.bg, color: rc.txt }}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span 
                      className={`status-pill ${u.status === 'active' ? 'confirmed' : 'cancelled'}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => onToggleUserStatus(u.id)}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm">Edit</button>
                      {u.role !== 'Admin' && <button className="btn btn-ghost btn-sm" style={{ color: '#F87171', borderColor: 'rgba(239,68,68,0.25)' }} onClick={() => onRemoveUser(u.id)}>Remove</button>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Permission matrix */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-title" style={{ marginBottom: 18 }}>Permission Matrix</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Module</th>
              <th>Admin</th>
              <th>Event Sales Team</th>
              <th>Management</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Dashboard', true, true, true],
              ['New Booking', true, true, false],
              ['Edit / Cancel Booking', true, true, false],
              ['Master Data', true, false, false],
              ['User Management', true, false, false],
              ['Reports & Analytics', true, false, true],
              ['AI Insights', true, false, true],
            ].map(([mod, ...perms]) => (
              <tr key={mod}>
                <td style={{ fontWeight: 500 }}>{mod}</td>
                {perms.map((p, i) => (
                  <td key={i}>
                    <span style={{ color: p ? '#4ADE80' : '#4B5563', fontSize: '1rem' }}>{p ? '✓' : '✗'}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

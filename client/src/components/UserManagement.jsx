import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Pagination from './Pagination';
import ConfirmDialog from './ConfirmDialog';

const API_BASE = 'http://localhost:3000/api';

function UserManagement() {
  const { getAuthHeaders, hasPermission, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(25);

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'viewer',
    is_active: true
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const canCreate = hasPermission('users', 'create');
  const canEdit = hasPermission('users', 'edit');
  const canDelete = hasPermission('users', 'delete');

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/users?page=${page}&limit=${limit}`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const result = await response.json();
      setUsers(result.data);
      setTotal(result.total);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      full_name: '',
      role: 'viewer',
      is_active: true
    });
    setFormError('');
    setFormSuccess('');
    setShowForm(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '', // Don't show existing password
      full_name: user.full_name || '',
      role: user.role,
      is_active: user.is_active
    });
    setFormError('');
    setFormSuccess('');
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    try {
      const url = editingUser
        ? `${API_BASE}/users/${editingUser.user_id}`
        : `${API_BASE}/users`;

      const method = editingUser ? 'PUT' : 'POST';

      const body = { ...formData };
      // Don't send empty password on edit
      if (editingUser && !body.password) {
        delete body.password;
      }

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(body)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save user');
      }

      setFormSuccess(result.message || 'User saved successfully');
      setTimeout(() => {
        setShowForm(false);
        fetchUsers();
      }, 1500);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleDelete = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete user');
      }

      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: '#dc3545',
      manager: '#fd7e14',
      analyst: '#0dcaf0',
      viewer: '#6c757d'
    };
    return colors[role] || '#6c757d';
  };

  if (loading && users.length === 0) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="table-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>User Management</h2>
        {canCreate && (
          <button className="btn primary" onClick={handleCreate} style={{ padding: '8px 16px' }}>
            + Create User
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 20 }}>
          {error}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingUser ? 'Edit User' : 'Create User'}</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>

            <form onSubmit={handleFormSubmit}>
              {formError && (
                <div className="alert alert-error" style={{ marginBottom: 20 }}>
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div className="alert alert-success" style={{ marginBottom: 20 }}>
                  {formSuccess}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Username *</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleFormChange}
                    required
                    placeholder="Enter username"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                    placeholder="user@example.com"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleFormChange}
                    placeholder="John Doe (optional)"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Password {!editingUser && '*'}</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleFormChange}
                    required={!editingUser}
                    placeholder={editingUser ? 'Leave blank to keep current' : 'Enter password'}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  required
                >
                  <option value="viewer">Viewer - View only access</option>
                  <option value="analyst">Analyst - View data + manage dashboards</option>
                  <option value="manager">Manager - Full data access (except user management)</option>
                  <option value="admin">Admin - Full system access</option>
                </select>
              </div>

              <div className="form-group" style={{ 
                background: '#f8f9fa', 
                padding: '16px', 
                borderRadius: '8px',
                border: '1px solid #dee2e6'
              }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: 12,
                  cursor: 'pointer',
                  marginBottom: 0
                }}>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleFormChange}
                    style={{
                      width: '18px',
                      height: '18px',
                      marginTop: '2px',
                      cursor: 'pointer',
                      accentColor: '#0066cc'
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>Active Account</div>
                    <div style={{ fontSize: '12px', color: '#6c757d', fontWeight: 'normal' }}>
                      Inactive users cannot log in. Use this to temporarily disable an account without deleting it.
                    </div>
                  </div>
                </label>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24, paddingTop: 20, borderTop: '1px solid #dee2e6' }}>
                <button type="button" className="btn" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  {editingUser ? '💾 Update User' : '✅ Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Full Name</th>
            <th>Role</th>
            <th>Status</th>
            <th>Last Login</th>
            <th>Created</th>
            {(canEdit || canDelete) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.user_id}>
              <td>{user.user_id}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.full_name || '-'}</td>
              <td>
                <span
                  style={{
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'white',
                    backgroundColor: getRoleBadgeColor(user.role),
                    textTransform: 'uppercase'
                  }}
                >
                  {user.role}
                </span>
              </td>
              <td>
                <span
                  style={{
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: 12,
                    backgroundColor: user.is_active ? '#d4edda' : '#f8d7da',
                    color: user.is_active ? '#155724' : '#721c24'
                  }}
                >
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>{user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}</td>
              <td>{new Date(user.created_at).toLocaleDateString()}</td>
              {(canEdit || canDelete) && (
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {canEdit && (
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(user)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                    )}
                    {canDelete && user.user_id !== currentUser?.user_id && (
                      <button
                        className="btn-delete"
                        onClick={() => setDeleteConfirm(user)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {total > 0 && (
        <Pagination
          currentPage={page}
          totalItems={total}
          itemsPerPage={limit}
          onPageChange={setPage}
        />
      )}

      {deleteConfirm && (
        <ConfirmDialog
          message={`Are you sure you want to delete user "${deleteConfirm.username}"?`}
          onConfirm={() => handleDelete(deleteConfirm.user_id)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}

export default UserManagement;

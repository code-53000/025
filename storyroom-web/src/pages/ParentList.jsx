import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getParents, deleteParent, updateParent } from '../services/api'

export default function ParentList() {
  const [parents, setParents] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', phone: '' })

  useEffect(() => {
    loadParents()
  }, [])

  const loadParents = async () => {
    try {
      setLoading(true)
      const res = await getParents({ page_size: 100 })
      if (res.code === 200) {
        setParents(res.data.items || [])
      }
    } catch (err) {
      console.error('加载家长列表失败', err)
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`确定要删除家长 "${name}" 吗？该家长下的所有孩子档案也会被删除。`)) return

    try {
      const res = await deleteParent(id)
      if (res.code === 200) {
        showMessage('success', '删除成功')
        loadParents()
      } else {
        showMessage('error', res.message || '删除失败')
      }
    } catch (err) {
      showMessage('error', err.response?.data?.message || '删除失败')
    }
  }

  const handleEdit = (parent) => {
    setEditingId(parent.id)
    setEditForm({ name: parent.name, phone: parent.phone })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({ name: '', phone: '' })
  }

  const handleSaveEdit = async (id) => {
    if (!editForm.name || !editForm.phone) {
      showMessage('error', '姓名和电话不能为空')
      return
    }

    try {
      const res = await updateParent(id, editForm)
      if (res.code === 200) {
        showMessage('success', '更新成功')
        setEditingId(null)
        loadParents()
      } else {
        showMessage('error', res.message || '更新失败')
      }
    } catch (err) {
      showMessage('error', err.response?.data?.message || '更新失败')
    }
  }

  return (
    <div>
      <div className="page-actions">
        <h1 className="page-title" style={{ marginBottom: 0 }}>
          家长管理
        </h1>
        <Link to="/parents/create" className="btn btn-primary">
          + 添加家长
        </Link>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      {loading ? (
        <div className="card">
          <div className="loading">加载中...</div>
        </div>
      ) : parents.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">👨‍👩‍👧</div>
            <p>还没有添加家长信息</p>
            <Link
              to="/parents/create"
              className="btn btn-primary"
              style={{ marginTop: '16px' }}
            >
              添加第一位家长
            </Link>
          </div>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>姓名</th>
                <th>联系电话</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {parents.map((parent) => (
                <tr key={parent.id}>
                  <td>{parent.id}</td>
                  <td>
                    {editingId === parent.id ? (
                      <input
                        type="text"
                        className="form-input"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        style={{ padding: '4px 8px', fontSize: '14px' }}
                      />
                    ) : (
                      parent.name
                    )}
                  </td>
                  <td>
                    {editingId === parent.id ? (
                      <input
                        type="text"
                        className="form-input"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        style={{ padding: '4px 8px', fontSize: '14px' }}
                      />
                    ) : (
                      parent.phone
                    )}
                  </td>
                  <td>{parent.created_at}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {editingId === parent.id ? (
                        <>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleSaveEdit(parent.id)}
                          >
                            保存
                          </button>
                          <button
                            className="btn btn-default btn-sm"
                            onClick={handleCancelEdit}
                          >
                            取消
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn btn-default btn-sm"
                            onClick={() => handleEdit(parent)}
                          >
                            编辑
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(parent.id, parent.name)}
                          >
                            删除
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getChildren, deleteChild } from '../services/api'

export default function ChildList() {
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    loadChildren()
  }, [])

  const loadChildren = async () => {
    try {
      setLoading(true)
      const res = await getChildren({ parent_id: 1, page_size: 100 })
      if (res.code === 200) {
        setChildren(res.data.items || [])
      }
    } catch (err) {
      console.error('加载孩子档案失败', err)
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`确定要删除 "${name}" 的档案吗？`)) return

    try {
      const res = await deleteChild(id)
      if (res.code === 200) {
        showMessage('success', '删除成功')
        loadChildren()
      } else {
        showMessage('error', res.message || '删除失败')
      }
    } catch (err) {
      showMessage('error', err.response?.data?.message || '删除失败')
    }
  }

  return (
    <div>
      <div className="page-actions">
        <h1 className="page-title" style={{ marginBottom: 0 }}>
          孩子档案
        </h1>
        <Link to="/children/create" className="btn btn-primary">
          + 添加孩子
        </Link>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      {loading ? (
        <div className="card">
          <div className="loading">加载中...</div>
        </div>
      ) : children.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">👶</div>
            <p>还没有添加孩子档案</p>
            <Link
              to="/children/create"
              className="btn btn-primary"
              style={{ marginTop: '16px' }}
            >
              添加第一个孩子
            </Link>
          </div>
        </div>
      ) : (
        <div>
          {children.map((child) => (
            <div key={child.id} className="child-card">
              <div className="child-info">
                <div>
                  <div className="child-name">
                    {child.name}
                    <span
                      style={{
                        marginLeft: '8px',
                        fontSize: '14px',
                        color: '#999',
                        fontWeight: 'normal',
                      }}
                    >
                      {child.gender === 'boy' ? '👦' : child.gender === 'girl' ? '👧' : '🧒'}
                    </span>
                  </div>
                  <div className="child-meta">
                    {child.age}岁 · {child.birthday}
                  </div>
                  {child.notes && (
                    <div style={{ fontSize: '13px', color: '#666', marginTop: '6px' }}>
                      备注：{child.notes}
                    </div>
                  )}
                </div>
                <div className="child-actions">
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(child.id, child.name)}
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

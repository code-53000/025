import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createParent } from '../services/api'

export default function ParentCreate() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name) {
      showMessage('error', '请输入家长姓名')
      return
    }
    if (!formData.phone) {
      showMessage('error', '请输入联系电话')
      return
    }

    try {
      setLoading(true)
      const res = await createParent(formData)
      if (res.code === 201 || res.code === 200) {
        showMessage('success', '创建成功')
        setTimeout(() => {
          navigate('/parents')
        }, 1000)
      } else {
        showMessage('error', res.message || '创建失败')
      }
    } catch (err) {
      showMessage('error', err.response?.data?.message || '创建失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="page-title">添加家长</h1>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">家长姓名 *</label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="请输入家长姓名"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">联系电话 *</label>
            <input
              type="tel"
              name="phone"
              className="form-input"
              placeholder="请输入联系电话"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-default"
              onClick={() => navigate(-1)}
            >
              取消
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? '创建中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

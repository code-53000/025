import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createChild, getParents } from '../services/api'

export default function ChildCreate() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    parent_id: 1,
    name: '',
    gender: 'unknown',
    birthday: '',
    notes: '',
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
      showMessage('error', '请输入孩子姓名')
      return
    }
    if (!formData.birthday) {
      showMessage('error', '请选择生日')
      return
    }

    try {
      setLoading(true)
      const res = await createChild({
        ...formData,
        parent_id: parseInt(formData.parent_id),
      })
      if (res.code === 201 || res.code === 200) {
        showMessage('success', '创建成功')
        setTimeout(() => {
          navigate('/children')
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
      <h1 className="page-title">添加孩子档案</h1>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">孩子姓名 *</label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="请输入孩子姓名"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">性别</label>
              <select
                name="gender"
                className="form-select"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="unknown">保密</option>
                <option value="boy">男孩</option>
                <option value="girl">女孩</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">生日 *</label>
              <input
                type="date"
                name="birthday"
                className="form-input"
                value={formData.birthday}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">备注</label>
            <textarea
              name="notes"
              className="form-textarea"
              placeholder="请输入备注信息（选填）"
              rows="3"
              value={formData.notes}
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

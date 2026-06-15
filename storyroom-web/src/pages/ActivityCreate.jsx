import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createActivity, getActivityTypes, getAgeGroups } from '../services/api'

export default function ActivityCreate() {
  const navigate = useNavigate()
  const [activityTypes, setActivityTypes] = useState([])
  const [ageGroups, setAgeGroups] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    activity_type_id: '',
    age_group_id: '',
    teacher: '',
    location: '',
    start_time: '',
    end_time: '',
    max_participants: '',
    material_description: '',
    description: '',
    staff_id: 1,
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    loadOptions()
  }, [])

  const loadOptions = async () => {
    try {
      const [typeRes, ageRes] = await Promise.all([
        getActivityTypes(),
        getAgeGroups(),
      ])
      if (typeRes.code === 200) {
        setActivityTypes(typeRes.data || [])
      }
      if (ageRes.code === 200) {
        setAgeGroups(ageRes.data || [])
      }
    } catch (err) {
      console.error('加载选项失败', err)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const formatDateTime = (value) => {
    if (!value) return ''
    return value.replace('T', ' ') + ':00'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title) {
      showMessage('error', '请输入活动标题')
      return
    }
    if (!formData.activity_type_id) {
      showMessage('error', '请选择活动类型')
      return
    }
    if (!formData.age_group_id) {
      showMessage('error', '请选择适合年龄段')
      return
    }
    if (!formData.teacher) {
      showMessage('error', '请输入带队老师')
      return
    }
    if (!formData.location) {
      showMessage('error', '请输入活动地点')
      return
    }
    if (!formData.start_time || !formData.end_time) {
      showMessage('error', '请设置活动时间')
      return
    }
    if (!formData.max_participants) {
      showMessage('error', '请输入人数上限')
      return
    }

    try {
      setLoading(true)
      const res = await createActivity({
        ...formData,
        activity_type_id: parseInt(formData.activity_type_id),
        age_group_id: parseInt(formData.age_group_id),
        max_participants: parseInt(formData.max_participants),
        start_time: formatDateTime(formData.start_time),
        end_time: formatDateTime(formData.end_time),
      })
      if (res.code === 201 || res.code === 200) {
        showMessage('success', '创建成功')
        setTimeout(() => {
          navigate(`/activities/${res.data.id}`)
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
      <h1 className="page-title">发布活动</h1>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">活动标题 *</label>
            <input
              type="text"
              name="title"
              className="form-input"
              placeholder="请输入活动标题"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">活动类型 *</label>
              <select
                name="activity_type_id"
                className="form-select"
                value={formData.activity_type_id}
                onChange={handleChange}
              >
                <option value="">请选择活动类型</option>
                {activityTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">适合年龄段 *</label>
              <select
                name="age_group_id"
                className="form-select"
                value={formData.age_group_id}
                onChange={handleChange}
              >
                <option value="">请选择年龄段</option>
                {ageGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">带队老师 *</label>
              <input
                type="text"
                name="teacher"
                className="form-input"
                placeholder="请输入老师姓名"
                value={formData.teacher}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">人数上限 *</label>
              <input
                type="number"
                name="max_participants"
                className="form-input"
                placeholder="请输入人数上限"
                value={formData.max_participants}
                onChange={handleChange}
                min="1"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">活动地点 *</label>
            <input
              type="text"
              name="location"
              className="form-input"
              placeholder="请输入活动地点"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">开始时间 *</label>
              <input
                type="datetime-local"
                name="start_time"
                className="form-input"
                value={formData.start_time}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">结束时间 *</label>
              <input
                type="datetime-local"
                name="end_time"
                className="form-input"
                value={formData.end_time}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">活动介绍</label>
            <textarea
              name="description"
              className="form-textarea"
              placeholder="请输入活动介绍"
              rows="4"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">材料说明</label>
            <textarea
              name="material_description"
              className="form-textarea"
              placeholder="请输入材料说明"
              rows="3"
              value={formData.material_description}
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
              {loading ? '创建中...' : '创建活动'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

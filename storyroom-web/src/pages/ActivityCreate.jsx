import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createActivity,
  getActivityTypes,
  getAgeGroups,
  getMaterials,
  createActivityMaterial,
} from '../services/api'

export default function ActivityCreate() {
  const navigate = useNavigate()
  const [activityTypes, setActivityTypes] = useState([])
  const [ageGroups, setAgeGroups] = useState([])
  const [materials, setMaterials] = useState([])
  const [activityMaterials, setActivityMaterials] = useState([])
  const [selectedMaterialId, setSelectedMaterialId] = useState('')
  const [quantityPerChild, setQuantityPerChild] = useState('1')
  const [materialNotes, setMaterialNotes] = useState('')
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
      const [typeRes, ageRes, matRes] = await Promise.all([
        getActivityTypes(),
        getAgeGroups(),
        getMaterials({ page_size: 100 }),
      ])
      if (typeRes.code === 200) {
        setActivityTypes(typeRes.data || [])
      }
      if (ageRes.code === 200) {
        setAgeGroups(ageRes.data || [])
      }
      if (matRes.code === 200) {
        setMaterials(matRes.data.items || [])
      }
    } catch (err) {
      console.error('加载选项失败', err)
    }
  }

  const handleAddMaterial = () => {
    if (!selectedMaterialId) {
      showMessage('error', '请选择材料')
      return
    }
    if (!quantityPerChild || parseInt(quantityPerChild) <= 0) {
      showMessage('error', '请输入正确的每人用量')
      return
    }

    const existing = activityMaterials.find(
      (m) => m.material_id === parseInt(selectedMaterialId)
    )
    if (existing) {
      showMessage('error', '该材料已添加')
      return
    }

    const material = materials.find((m) => m.id === parseInt(selectedMaterialId))
    setActivityMaterials((prev) => [
      ...prev,
      {
        material_id: parseInt(selectedMaterialId),
        material: material,
        quantity_per_child: parseInt(quantityPerChild),
        notes: materialNotes,
      },
    ])
    setSelectedMaterialId('')
    setQuantityPerChild('1')
    setMaterialNotes('')
  }

  const handleRemoveMaterial = (materialId) => {
    setActivityMaterials((prev) =>
      prev.filter((m) => m.material_id !== materialId)
    )
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
        const activityId = res.data.id
        if (activityMaterials.length > 0) {
          await Promise.all(
            activityMaterials.map((am) =>
              createActivityMaterial({
                activity_id: activityId,
                material_id: am.material_id,
                quantity_per_child: am.quantity_per_child,
                notes: am.notes,
              })
            )
          )
        }
        showMessage('success', '创建成功')
        setTimeout(() => {
          navigate(`/activities/${activityId}`)
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

          <div className="form-group">
            <label className="form-label">活动材料</label>
            {materials.length === 0 ? (
              <p style={{ color: '#999', fontSize: '14px' }}>
                暂无材料，请到「材料库存」页面先添加材料
              </p>
            ) : (
              <>
                <div className="form-row" style={{ alignItems: 'flex-end' }}>
                  <div className="form-group" style={{ flex: 2 }}>
                    <select
                      className="form-select"
                      value={selectedMaterialId}
                      onChange={(e) => setSelectedMaterialId(e.target.value)}
                    >
                      <option value="">选择材料</option>
                      {materials.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}（库存：{m.quantity} {m.unit}）
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="每人用量"
                      min="1"
                      value={quantityPerChild}
                      onChange={(e) => setQuantityPerChild(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 2 }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="备注（可选）"
                      value={materialNotes}
                      onChange={(e) => setMaterialNotes(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <button
                      type="button"
                      className="btn btn-default"
                      onClick={handleAddMaterial}
                    >
                      + 添加
                    </button>
                  </div>
                </div>

                {activityMaterials.length > 0 && (
                  <table className="table" style={{ marginTop: '12px' }}>
                    <thead>
                      <tr>
                        <th>材料名称</th>
                        <th>每人用量</th>
                        <th>库存</th>
                        <th>备注</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityMaterials.map((am) => (
                        <tr key={am.material_id}>
                          <td>{am.material?.name}</td>
                          <td>{am.quantity_per_child} {am.material?.unit}</td>
                          <td>{am.material?.quantity} {am.material?.unit}</td>
                          <td>{am.notes || '-'}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleRemoveMaterial(am.material_id)}
                            >
                              移除
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}
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

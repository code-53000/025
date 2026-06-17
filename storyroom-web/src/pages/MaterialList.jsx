import { useState, useEffect } from 'react'
import {
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from '../services/api'

export default function MaterialList() {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    quantity: '',
    description: '',
  })

  useEffect(() => {
    loadMaterials()
  }, [])

  const loadMaterials = async () => {
    try {
      setLoading(true)
      const res = await getMaterials({ page_size: 100 })
      if (res.code === 200) {
        setMaterials(res.data.items || [])
      }
    } catch (err) {
      console.error('加载材料列表失败', err)
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const resetForm = () => {
    setFormData({ name: '', unit: '', quantity: '', description: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAdd = () => {
    resetForm()
    setShowForm(true)
  }

  const handleEdit = (material) => {
    setFormData({
      name: material.name,
      unit: material.unit,
      quantity: material.quantity,
      description: material.description || '',
    })
    setEditingId(material.id)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name) {
      showMessage('error', '请输入材料名称')
      return
    }
    if (!formData.unit) {
      showMessage('error', '请输入材料单位')
      return
    }

    try {
      const data = {
        ...formData,
        quantity: parseInt(formData.quantity) || 0,
      }

      let res
      if (editingId) {
        res = await updateMaterial(editingId, data)
      } else {
        res = await createMaterial(data)
      }

      if (res.code === 200 || res.code === 201) {
        showMessage('success', editingId ? '更新成功' : '添加成功')
        resetForm()
        loadMaterials()
      } else {
        showMessage('error', res.message || '操作失败')
      }
    } catch (err) {
      showMessage('error', err.response?.data?.message || '操作失败')
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`确定要删除材料「${name}」吗？`)) return

    try {
      const res = await deleteMaterial(id)
      if (res.code === 200) {
        showMessage('success', '删除成功')
        loadMaterials()
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
          材料库存
        </h1>
        <button className="btn btn-primary" onClick={handleAdd}>
          + 添加材料
        </button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      {showForm && (
        <div className="card">
          <h3 className="section-title">
            {editingId ? '编辑材料' : '添加材料'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">材料名称 *</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="如：彩纸、蜡笔等"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">单位 *</label>
                <input
                  type="text"
                  name="unit"
                  className="form-input"
                  placeholder="如：张、盒、个等"
                  value={formData.unit}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">库存数量</label>
                <input
                  type="number"
                  name="quantity"
                  className="form-input"
                  placeholder="0"
                  min="0"
                  value={formData.quantity}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">备注说明</label>
              <textarea
                name="description"
                className="form-textarea"
                placeholder="材料描述或备注"
                rows="2"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-default"
                onClick={resetForm}
              >
                取消
              </button>
              <button type="submit" className="btn btn-primary">
                {editingId ? '保存修改' : '添加'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="card">
          <div className="loading">加载中...</div>
        </div>
      ) : materials.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <p>暂无材料库存</p>
            <button
              className="btn btn-primary"
              style={{ marginTop: '16px' }}
              onClick={handleAdd}
            >
              添加第一个材料
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>材料名称</th>
                <th>单位</th>
                <th>库存数量</th>
                <th>备注</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((material) => (
                <tr key={material.id}>
                  <td>
                    <strong>{material.name}</strong>
                  </td>
                  <td>{material.unit}</td>
                  <td>
                    <span
                      className={`status-tag ${
                        material.quantity <= 0
                          ? 'status-canceled'
                          : material.quantity < 10
                          ? 'status-draft'
                          : 'status-completed'
                      }`}
                    >
                      {material.quantity} {material.unit}
                    </span>
                  </td>
                  <td>{material.description || '-'}</td>
                  <td>
                    <button
                      className="btn btn-default btn-sm"
                      style={{ marginRight: '8px' }}
                      onClick={() => handleEdit(material)}
                    >
                      编辑
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(material.id, material.name)}
                    >
                      删除
                    </button>
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

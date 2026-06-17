import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  getActivity,
  getActivityRegistrations,
  getActivityAttendances,
  getActivityFeedbacks,
  getChildren,
  getParents,
  getMaterials,
  getActivityMaterials,
  getMaterialUsage,
  createRegistration,
  cancelRegistration,
  publishActivity,
  deleteActivity,
  createFeedback,
  createActivityMaterial,
  deleteActivityMaterial,
  createMaterialUsage,
} from '../services/api'

export default function ActivityDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activity, setActivity] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [attendances, setAttendances] = useState([])
  const [feedbacks, setFeedbacks] = useState([])
  const [activityMaterials, setActivityMaterials] = useState([])
  const [materialUsages, setMaterialUsages] = useState([])
  const [parents, setParents] = useState([])
  const [children, setChildren] = useState([])
  const [allMaterials, setAllMaterials] = useState([])
  const [selectedParent, setSelectedParent] = useState('')
  const [selectedChild, setSelectedChild] = useState('')
  const [activeTab, setActiveTab] = useState('info')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })

  const [feedbackParent, setFeedbackParent] = useState('')
  const [feedbackChild, setFeedbackChild] = useState('')
  const [feedbackContent, setFeedbackContent] = useState('')
  const [feedbackRating, setFeedbackRating] = useState('5')
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)

  const [selectedMaterialId, setSelectedMaterialId] = useState('')
  const [quantityPerChild, setQuantityPerChild] = useState('1')
  const [materialNotes, setMaterialNotes] = useState('')

  const [usageMaterialId, setUsageMaterialId] = useState('')
  const [usageQuantity, setUsageQuantity] = useState('')
  const [usageNotes, setUsageNotes] = useState('')

  useEffect(() => {
    loadData()
    loadParents()
    loadAllMaterials()
  }, [id])

  useEffect(() => {
    if (selectedParent) {
      loadChildrenByParent(selectedParent)
    } else {
      setChildren([])
      setSelectedChild('')
    }
  }, [selectedParent])

  useEffect(() => {
    if (feedbackParent) {
      loadFeedbackChildrenByParent(feedbackParent)
    } else {
      setChildren([])
      setFeedbackChild('')
    }
  }, [feedbackParent])

  const loadParents = async () => {
    try {
      const res = await getParents({ page_size: 100 })
      if (res.code === 200) {
        setParents(res.data.items || [])
      }
    } catch (err) {
      console.error('加载家长列表失败', err)
    }
  }

  const loadChildrenByParent = async (parentId) => {
    try {
      const res = await getChildren({ parent_id: parentId, page_size: 100 })
      if (res.code === 200) {
        setChildren(res.data.items || [])
      }
    } catch (err) {
      console.error('加载孩子列表失败', err)
    }
  }

  const loadFeedbackChildrenByParent = async (parentId) => {
    try {
      const res = await getChildren({ parent_id: parentId, page_size: 100 })
      if (res.code === 200) {
        setChildren(res.data.items || [])
      }
    } catch (err) {
      console.error('加载孩子列表失败', err)
    }
  }

  const loadAllMaterials = async () => {
    try {
      const res = await getMaterials({ page_size: 100 })
      if (res.code === 200) {
        setAllMaterials(res.data.items || [])
      }
    } catch (err) {
      console.error('加载材料列表失败', err)
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const [activityRes, regRes, attRes, fbRes, amRes, muRes] = await Promise.all([
        getActivity(id),
        getActivityRegistrations(id),
        getActivityAttendances(id),
        getActivityFeedbacks(id),
        getActivityMaterials(id),
        getMaterialUsage(id),
      ])
      if (activityRes.code === 200) {
        setActivity(activityRes.data)
      }
      if (regRes.code === 200) {
        setRegistrations(regRes.data || [])
      }
      if (attRes.code === 200) {
        setAttendances(attRes.data || [])
      }
      if (fbRes.code === 200) {
        setFeedbacks(fbRes.data || [])
      }
      if (amRes.code === 200) {
        setActivityMaterials(amRes.data.items || [])
      }
      if (muRes.code === 200) {
        setMaterialUsages(muRes.data || [])
      }
    } catch (err) {
      console.error('加载数据失败', err)
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const handleRegister = async () => {
    if (!selectedChild) {
      showMessage('error', '请选择要报名的孩子')
      return
    }

    try {
      const res = await createRegistration({
        activity_id: parseInt(id),
        child_id: parseInt(selectedChild),
      })
      if (res.code === 201 || res.code === 200) {
        showMessage('success', res.message || '报名成功')
        loadData()
        setSelectedChild('')
      } else {
        showMessage('error', res.message || '报名失败')
      }
    } catch (err) {
      showMessage('error', err.response?.data?.message || '报名失败')
    }
  }

  const handleCancelRegistration = async (regId) => {
    if (!window.confirm('确定要取消报名吗？')) return

    try {
      const res = await cancelRegistration(regId)
      if (res.code === 200) {
        showMessage('success', '取消成功')
        loadData()
      } else {
        showMessage('error', res.message || '取消失败')
      }
    } catch (err) {
      showMessage('error', err.response?.data?.message || '取消失败')
    }
  }

  const handlePublish = async () => {
    if (!window.confirm('确定要发布此活动吗？')) return

    try {
      const res = await publishActivity(id)
      if (res.code === 200) {
        showMessage('success', '发布成功')
        loadData()
      } else {
        showMessage('error', res.message || '发布失败')
      }
    } catch (err) {
      showMessage('error', err.response?.data?.message || '发布失败')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('确定要删除此活动吗？此操作不可撤销。')) return

    try {
      const res = await deleteActivity(id)
      if (res.code === 200) {
        showMessage('success', '删除成功')
        navigate('/activities')
      } else {
        showMessage('error', res.message || '删除失败')
      }
    } catch (err) {
      showMessage('error', err.response?.data?.message || '删除失败')
    }
  }

  const handleSubmitFeedback = async (e) => {
    e.preventDefault()

    if (!feedbackChild) {
      showMessage('error', '请选择孩子')
      return
    }
    if (!feedbackContent.trim()) {
      showMessage('error', '请输入反馈内容')
      return
    }

    try {
      const res = await createFeedback({
        activity_id: parseInt(id),
        child_id: parseInt(feedbackChild),
        content: feedbackContent,
        rating: parseInt(feedbackRating),
      })
      if (res.code === 201 || res.code === 200) {
        showMessage('success', '反馈提交成功')
        setFeedbackContent('')
        setFeedbackRating('5')
        setFeedbackParent('')
        setFeedbackChild('')
        setShowFeedbackForm(false)
        loadData()
      } else {
        showMessage('error', res.message || '提交失败')
      }
    } catch (err) {
      showMessage('error', err.response?.data?.message || '提交失败')
    }
  }

  const handleAddActivityMaterial = async () => {
    if (!selectedMaterialId) {
      showMessage('error', '请选择材料')
      return
    }
    if (!quantityPerChild || parseInt(quantityPerChild) <= 0) {
      showMessage('error', '请输入正确的每人用量')
      return
    }

    try {
      const res = await createActivityMaterial({
        activity_id: parseInt(id),
        material_id: parseInt(selectedMaterialId),
        quantity_per_child: parseInt(quantityPerChild),
        notes: materialNotes,
      })
      if (res.code === 201 || res.code === 200) {
        showMessage('success', '添加成功')
        setSelectedMaterialId('')
        setQuantityPerChild('1')
        setMaterialNotes('')
        loadData()
        loadAllMaterials()
      } else {
        showMessage('error', res.message || '添加失败')
      }
    } catch (err) {
      showMessage('error', err.response?.data?.message || '添加失败')
    }
  }

  const handleDeleteActivityMaterial = async (amId, materialName) => {
    if (!window.confirm(`确定要移除材料「${materialName}」吗？`)) return

    try {
      const res = await deleteActivityMaterial(amId)
      if (res.code === 200) {
        showMessage('success', '移除成功')
        loadData()
      } else {
        showMessage('error', res.message || '移除失败')
      }
    } catch (err) {
      showMessage('error', err.response?.data?.message || '移除失败')
    }
  }

  const handleRecordMaterialUsage = async (e) => {
    e.preventDefault()

    if (!usageMaterialId) {
      showMessage('error', '请选择材料')
      return
    }
    if (!usageQuantity || parseInt(usageQuantity) <= 0) {
      showMessage('error', '请输入正确的消耗数量')
      return
    }

    try {
      const res = await createMaterialUsage({
        activity_id: parseInt(id),
        material_id: parseInt(usageMaterialId),
        quantity_used: parseInt(usageQuantity),
        staff_id: 1,
        notes: usageNotes,
      })
      if (res.code === 201 || res.code === 200) {
        showMessage('success', '记录成功')
        setUsageMaterialId('')
        setUsageQuantity('')
        setUsageNotes('')
        loadData()
        loadAllMaterials()
      } else {
        showMessage('error', res.message || '记录失败')
      }
    } catch (err) {
      showMessage('error', err.response?.data?.message || '记录失败')
    }
  }

  if (loading) {
    return (
      <div className="card">
        <div className="loading">加载中...</div>
      </div>
    )
  }

  if (!activity) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon">❓</div>
          <p>活动不存在</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <div className="detail-grid">
        <div className="detail-info">
          <div className="flex-between mb-20">
            <div>
              <h1 className="page-title" style={{ marginBottom: 0 }}>
                {activity.title}
              </h1>
              <div style={{ marginTop: '8px' }}>
                {activity.activity_type && (
                  <span className="activity-type-tag">
                    {activity.activity_type.name}
                  </span>
                )}
                <span
                  className={`status-tag status-${activity.status}`}
                  style={{ marginLeft: '8px' }}
                >
                  {getStatusText(activity.status)}
                </span>
              </div>
            </div>
          </div>

          <div className="tabs">
            <div
              className={`tab-item ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              活动详情
            </div>
            <div
              className={`tab-item ${activeTab === 'registrations' ? 'active' : ''}`}
              onClick={() => setActiveTab('registrations')}
            >
              报名名单 ({registrations.length})
            </div>
            <div
              className={`tab-item ${activeTab === 'attendance' ? 'active' : ''}`}
              onClick={() => setActiveTab('attendance')}
            >
              签到情况
            </div>
            <div
              className={`tab-item ${activeTab === 'materials' ? 'active' : ''}`}
              onClick={() => setActiveTab('materials')}
            >
              材料管理
            </div>
            <div
              className={`tab-item ${activeTab === 'feedback' ? 'active' : ''}`}
              onClick={() => setActiveTab('feedback')}
            >
              活动反馈 ({feedbacks.length})
            </div>
          </div>

          {activeTab === 'info' && (
            <div>
              <ul className="info-list">
                <li>
                  <span className="info-label">带队老师</span>
                  <span className="info-value">{activity.teacher}</span>
                </li>
                <li>
                  <span className="info-label">活动地点</span>
                  <span className="info-value">{activity.location}</span>
                </li>
                <li>
                  <span className="info-label">开始时间</span>
                  <span className="info-value">{activity.start_time}</span>
                </li>
                <li>
                  <span className="info-label">结束时间</span>
                  <span className="info-value">{activity.end_time}</span>
                </li>
                <li>
                  <span className="info-label">适合年龄</span>
                  <span className="info-value">
                    {activity.age_group?.name || '未设置'}
                  </span>
                </li>
                <li>
                  <span className="info-label">人数上限</span>
                  <span className="info-value">{activity.max_participants} 人</span>
                </li>
                <li>
                  <span className="info-label">已报名</span>
                  <span className="info-value">
                    {activity.registered_count} 人
                    {activity.waitlisted_count > 0 && (
                      <span style={{ color: '#fa8c16', marginLeft: '8px' }}>
                        候补 {activity.waitlisted_count} 人
                      </span>
                    )}
                  </span>
                </li>
              </ul>

              {activity.description && (
                <>
                  <div className="divider"></div>
                  <h3 className="section-title">活动介绍</h3>
                  <p style={{ color: '#555', lineHeight: '1.8' }}>
                    {activity.description}
                  </p>
                </>
              )}

              {activity.material_description && (
                <>
                  <div className="divider"></div>
                  <h3 className="section-title">材料说明</h3>
                  <p style={{ color: '#555', lineHeight: '1.8' }}>
                    {activity.material_description}
                  </p>
                </>
              )}
            </div>
          )}

          {activeTab === 'registrations' && (
            <div>
              {registrations.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">👥</div>
                  <p>暂无报名</p>
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>孩子姓名</th>
                      <th>年龄</th>
                      <th>报名状态</th>
                      <th>候补位置</th>
                      <th>报名时间</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((reg) => (
                      <tr key={reg.id}>
                        <td>{reg.child?.name}</td>
                        <td>{reg.child?.age}岁</td>
                        <td>
                          <span className={`status-tag status-${reg.status}`}>
                            {reg.status === 'registered'
                              ? '已报名'
                              : reg.status === 'waitlisted'
                              ? '候补中'
                              : '已取消'}
                          </span>
                        </td>
                        <td>{reg.waitlist_position || '-'}</td>
                        <td>{reg.registered_at}</td>
                        <td>
                          {reg.status !== 'canceled' && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleCancelRegistration(reg.id)}
                            >
                              取消
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'attendance' && (
            <div>
              {attendances.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">✅</div>
                  <p>暂无签到记录</p>
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>孩子姓名</th>
                      <th>签到状态</th>
                      <th>签到时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendances.map((att) => (
                      <tr key={att.id}>
                        <td>{att.child?.name}</td>
                        <td>
                          <span className={`status-tag status-${att.status}`}>
                            {att.status === 'signed'
                              ? '已签到'
                              : att.status === 'leave'
                              ? '已请假'
                              : '未签到'}
                          </span>
                        </td>
                        <td>{att.sign_time || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div style={{ marginTop: '16px' }}>
                <Link
                  to={`/activities/${id}/attendance`}
                  className="btn btn-primary"
                >
                  前往签到
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'materials' && (
            <div>
              <h3 className="section-title">活动材料配置</h3>
              {allMaterials.length === 0 ? (
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
                        {allMaterials.map((m) => (
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
                        className="btn btn-primary"
                        onClick={handleAddActivityMaterial}
                      >
                        + 添加材料
                      </button>
                    </div>
                  </div>
                </>
              )}

              {activityMaterials.length > 0 ? (
                <table className="table" style={{ marginTop: '12px' }}>
                  <thead>
                    <tr>
                      <th>材料名称</th>
                      <th>每人用量</th>
                      <th>当前库存</th>
                      <th>预计总用量</th>
                      <th>备注</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityMaterials.map((am) => (
                      <tr key={am.id}>
                        <td>{am.material?.name}</td>
                        <td>{am.quantity_per_child} {am.material?.unit}</td>
                        <td>{am.material?.quantity} {am.material?.unit}</td>
                        <td>
                          {am.quantity_per_child * (activity?.registered_count || 0)} {am.material?.unit}
                        </td>
                        <td>{am.notes || '-'}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() =>
                              handleDeleteActivityMaterial(am.id, am.material?.name)
                            }
                          >
                            移除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state" style={{ padding: '24px' }}>
                  <div className="empty-state-icon">📦</div>
                  <p>暂无活动材料配置</p>
                </div>
              )}

              <div className="divider"></div>

              <h3 className="section-title">材料消耗记录</h3>
              <form onSubmit={handleRecordMaterialUsage}>
                <div className="form-row" style={{ alignItems: 'flex-end' }}>
                  <div className="form-group" style={{ flex: 2 }}>
                    <select
                      className="form-select"
                      value={usageMaterialId}
                      onChange={(e) => setUsageMaterialId(e.target.value)}
                    >
                      <option value="">选择消耗材料</option>
                      {allMaterials.map((m) => (
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
                      placeholder="消耗数量"
                      min="1"
                      value={usageQuantity}
                      onChange={(e) => setUsageQuantity(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 2 }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="备注（可选）"
                      value={usageNotes}
                      onChange={(e) => setUsageNotes(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <button type="submit" className="btn btn-primary">
                      记录消耗
                    </button>
                  </div>
                </div>
              </form>

              {materialUsages.length > 0 ? (
                <table className="table" style={{ marginTop: '12px' }}>
                  <thead>
                    <tr>
                      <th>材料名称</th>
                      <th>消耗数量</th>
                      <th>备注</th>
                      <th>记录时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materialUsages.map((mu) => (
                      <tr key={mu.id}>
                        <td>{mu.material?.name}</td>
                        <td>{mu.quantity_used} {mu.material?.unit}</td>
                        <td>{mu.notes || '-'}</td>
                        <td>{mu.recorded_at || mu.created_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state" style={{ padding: '24px' }}>
                  <div className="empty-state-icon">📋</div>
                  <p>暂无消耗记录</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'feedback' && (
            <div>
              <div
                className="flex-between"
                style={{ marginBottom: '16px', alignItems: 'center' }}
              >
                <h3 className="section-title" style={{ marginBottom: 0 }}>
                  活动反馈
                </h3>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                >
                  {showFeedbackForm ? '取消录入' : '+ 录入反馈'}
                </button>
              </div>

              {showFeedbackForm && (
                <div className="card" style={{ marginBottom: '16px' }}>
                  <form onSubmit={handleSubmitFeedback}>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">选择家长</label>
                        <select
                          className="form-select"
                          value={feedbackParent}
                          onChange={(e) => setFeedbackParent(e.target.value)}
                        >
                          <option value="">请选择家长</option>
                          {parents.map((parent) => (
                            <option key={parent.id} value={parent.id}>
                              {parent.name}（{parent.phone}）
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">选择孩子</label>
                        <select
                          className="form-select"
                          value={feedbackChild}
                          onChange={(e) => setFeedbackChild(e.target.value)}
                        >
                          <option value="">请选择孩子</option>
                          {feedbackParent &&
                            children.map((child) => (
                              <option key={child.id} value={child.id}>
                                {child.name}（{child.age}岁）
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">评分</label>
                      <select
                        className="form-select"
                        value={feedbackRating}
                        onChange={(e) => setFeedbackRating(e.target.value)}
                      >
                        <option value="5">⭐⭐⭐⭐⭐ 5星</option>
                        <option value="4">⭐⭐⭐⭐ 4星</option>
                        <option value="3">⭐⭐⭐ 3星</option>
                        <option value="2">⭐⭐ 2星</option>
                        <option value="1">⭐ 1星</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">反馈内容 *</label>
                      <textarea
                        className="form-textarea"
                        placeholder="请输入活动反馈内容"
                        rows="4"
                        value={feedbackContent}
                        onChange={(e) => setFeedbackContent(e.target.value)}
                      />
                    </div>
                    <div className="form-actions">
                      <button
                        type="button"
                        className="btn btn-default"
                        onClick={() => setShowFeedbackForm(false)}
                      >
                        取消
                      </button>
                      <button type="submit" className="btn btn-primary">
                        提交反馈
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {feedbacks.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">💬</div>
                  <p>暂无反馈</p>
                </div>
              ) : (
                <div>
                  {feedbacks.map((fb) => (
                    <div key={fb.id} className="child-card">
                      <div className="flex-between">
                        <strong>{fb.child?.name}</strong>
                        <span style={{ color: '#faad14' }}>
                          {'⭐'.repeat(fb.rating || 0)}
                        </span>
                      </div>
                      <p style={{ marginTop: '8px', color: '#555' }}>
                        {fb.content}
                      </p>
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
                        {fb.created_at}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="detail-sidebar">
          <div className="card">
            <h3 className="section-title">快速报名</h3>
            {parents.length === 0 ? (
              <div>
                <p style={{ color: '#999', marginBottom: '12px' }}>
                  还没有家长信息
                </p>
                <Link to="/parents/create" className="btn btn-primary btn-block">
                  添加家长
                </Link>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">选择家长</label>
                  <select
                    className="form-select"
                    value={selectedParent}
                    onChange={(e) => setSelectedParent(e.target.value)}
                  >
                    <option value="">请选择家长</option>
                    {parents.map((parent) => (
                      <option key={parent.id} value={parent.id}>
                        {parent.name}（{parent.phone}）
                      </option>
                    ))}
                  </select>
                </div>
                {selectedParent && (
                  children.length > 0 ? (
                    <>
                      <div className="form-group">
                        <label className="form-label">选择孩子</label>
                        <select
                          className="form-select"
                          value={selectedChild}
                          onChange={(e) => setSelectedChild(e.target.value)}
                        >
                          <option value="">请选择</option>
                          {children.map((child) => (
                            <option key={child.id} value={child.id}>
                              {child.name}（{child.age}岁）
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        className="btn btn-primary btn-block"
                        onClick={handleRegister}
                        disabled={activity.status !== 'published'}
                      >
                        {activity.status === 'published' ? '立即报名' : '活动未发布'}
                      </button>
                    </>
                  ) : (
                    <div>
                      <p style={{ color: '#999', marginBottom: '12px' }}>
                        该家长还没有添加孩子档案
                      </p>
                      <Link
                        to="/children/create"
                        className="btn btn-primary btn-block"
                      >
                        添加孩子档案
                      </Link>
                    </div>
                  )
                )}
              </>
            )}
          </div>

          <div className="card">
            <h3 className="section-title">活动管理</h3>
            <div className="flex gap-8" style={{ flexDirection: 'column' }}>
              {activity.status === 'draft' && (
                <button className="btn btn-success" onClick={handlePublish}>
                  发布活动
                </button>
              )}
              <Link
                to={`/activities/${id}/attendance`}
                className="btn btn-primary"
                style={{ textDecoration: 'none', justifyContent: 'center' }}
              >
                签到管理
              </Link>
              {activity.status === 'draft' && (
                <button
                  className="btn btn-danger"
                  onClick={handleDelete}
                >
                  删除活动
                </button>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="section-title">报名统计</h3>
            <div style={{ fontSize: '14px' }}>
              <div className="flex-between" style={{ padding: '8px 0' }}>
                <span style={{ color: '#666' }}>已报名</span>
                <strong style={{ color: '#1890ff' }}>
                  {activity.registered_count} 人
                </strong>
              </div>
              <div className="flex-between" style={{ padding: '8px 0' }}>
                <span style={{ color: '#666' }}>候补</span>
                <strong style={{ color: '#fa8c16' }}>
                  {activity.waitlisted_count} 人
                </strong>
              </div>
              <div className="flex-between" style={{ padding: '8px 0' }}>
                <span style={{ color: '#666' }}>名额</span>
                <strong>{activity.max_participants} 人</strong>
              </div>
              <div className="flex-between" style={{ padding: '8px 0' }}>
                <span style={{ color: '#666' }}>剩余名额</span>
                <strong style={{ color: activity.registered_count >= activity.max_participants ? '#ff4d4f' : '#52c41a' }}>
                  {Math.max(0, activity.max_participants - activity.registered_count)} 人
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getStatusText(status) {
  const map = {
    draft: '草稿',
    published: '报名中',
    completed: '已完成',
    canceled: '已取消',
  }
  return map[status] || status
}

import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  getActivity,
  getActivityRegistrations,
  getActivityAttendances,
  getActivityFeedbacks,
  getChildren,
  getParents,
  createRegistration,
  cancelRegistration,
  publishActivity,
  deleteActivity,
} from '../services/api'

export default function ActivityDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activity, setActivity] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [attendances, setAttendances] = useState([])
  const [feedbacks, setFeedbacks] = useState([])
  const [parents, setParents] = useState([])
  const [children, setChildren] = useState([])
  const [selectedParent, setSelectedParent] = useState('')
  const [selectedChild, setSelectedChild] = useState('')
  const [activeTab, setActiveTab] = useState('info')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    loadData()
    loadParents()
  }, [id])

  useEffect(() => {
    if (selectedParent) {
      loadChildrenByParent(selectedParent)
    } else {
      setChildren([])
      setSelectedChild('')
    }
  }, [selectedParent])

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

  const loadData = async () => {
    try {
      setLoading(true)
      const activityRes = await getActivity(id)
      if (activityRes.code === 200) {
        setActivity(activityRes.data)
      }

      const regRes = await getActivityRegistrations(id)
      if (regRes.code === 200) {
        setRegistrations(regRes.data || [])
      }

      const attRes = await getActivityAttendances(id)
      if (attRes.code === 200) {
        setAttendances(attRes.data || [])
      }

      const fbRes = await getActivityFeedbacks(id)
      if (fbRes.code === 200) {
        setFeedbacks(fbRes.data || [])
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
              className={`tab-item ${activeTab === 'feedback' ? 'active' : ''}`}
              onClick={() => setActiveTab('feedback')}
            >
              活动反馈
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

          {activeTab === 'feedback' && (
            <div>
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

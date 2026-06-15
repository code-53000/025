import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  getActivity,
  getActivityAttendances,
  getActivityRegistrations,
  signAttendance,
  leaveAttendance,
} from '../services/api'

export default function AttendancePage() {
  const { id } = useParams()
  const [activity, setActivity] = useState(null)
  const [attendances, setAttendances] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [leaveReason, setLeaveReason] = useState('')
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [selectedChild, setSelectedChild] = useState(null)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      setLoading(true)
      const [activityRes, attRes] = await Promise.all([
        getActivity(id),
        getActivityAttendances(id),
      ])
      if (activityRes.code === 200) {
        setActivity(activityRes.data)
      }
      if (attRes.code === 200) {
        setAttendances(attRes.data || [])
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

  const handleSign = async (childId) => {
    try {
      const res = await signAttendance({
        activity_id: parseInt(id),
        child_id: childId,
        staff_id: 1,
      })
      if (res.code === 200) {
        showMessage('success', '签到成功')
        loadData()
      } else {
        showMessage('error', res.message || '签到失败')
      }
    } catch (err) {
      showMessage('error', err.response?.data?.message || '签到失败')
    }
  }

  const handleLeaveClick = (child) => {
    setSelectedChild(child)
    setLeaveReason('')
    setShowLeaveModal(true)
  }

  const handleLeaveSubmit = async () => {
    if (!selectedChild) return

    try {
      const res = await leaveAttendance({
        activity_id: parseInt(id),
        child_id: selectedChild.child?.id,
        leave_reason: leaveReason,
        staff_id: 1,
      })
      if (res.code === 200) {
        showMessage('success', '请假记录成功')
        setShowLeaveModal(false)
        loadData()
      } else {
        showMessage('error', res.message || '请假失败')
      }
    } catch (err) {
      showMessage('error', err.response?.data?.message || '请假失败')
    }
  }

  const signedCount = attendances.filter((a) => a.status === 'signed').length
  const leaveCount = attendances.filter((a) => a.status === 'leave').length
  const absentCount = attendances.filter((a) => a.status === 'absent').length

  if (loading) {
    return (
      <div className="card">
        <div className="loading">加载中...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-actions">
        <div>
          <Link to={`/activities/${id}`} className="btn btn-default btn-sm">
            ← 返回活动详情
          </Link>
          <h1 className="page-title" style={{ marginTop: '12px', marginBottom: 0 }}>
            签到管理 - {activity?.title}
          </h1>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <div className="card">
        <div className="flex-between mb-20">
          <div style={{ fontSize: '14px' }}>
            <span style={{ color: '#666' }}>总报名人数：</span>
            <strong>{attendances.length} 人</strong>
          </div>
          <div style={{ display: 'flex', gap: '20px', fontSize: '14px' }}>
            <div>
              <span style={{ color: '#666' }}>已签到：</span>
              <strong style={{ color: '#52c41a' }}>{signedCount} 人</strong>
            </div>
            <div>
              <span style={{ color: '#666' }}>已请假：</span>
              <strong style={{ color: '#ff4d4f' }}>{leaveCount} 人</strong>
            </div>
            <div>
              <span style={{ color: '#666' }}>未签到：</span>
              <strong style={{ color: '#999' }}>{absentCount} 人</strong>
            </div>
          </div>
        </div>

        {attendances.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <p>暂无报名人员</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>孩子姓名</th>
                <th>年龄</th>
                <th>签到状态</th>
                <th>签到时间</th>
                <th>请假原因</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {attendances.map((att) => (
                <tr key={att.id}>
                  <td>{att.child?.name}</td>
                  <td>{att.child?.age}岁</td>
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
                  <td>{att.leave_reason || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {att.status === 'absent' && (
                        <>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleSign(att.child?.id)}
                          >
                            签到
                          </button>
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => handleLeaveClick(att)}
                          >
                            请假
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showLeaveModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div className="card" style={{ width: '400px', margin: 0 }}>
            <h3 className="section-title">请假登记</h3>
            <p style={{ marginBottom: '16px' }}>
              孩子：<strong>{selectedChild?.child?.name}</strong>
            </p>
            <div className="form-group">
              <label className="form-label">请假原因</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="请输入请假原因"
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
              />
            </div>
            <div className="form-actions" style={{ marginTop: '16px' }}>
              <button
                className="btn btn-default"
                onClick={() => setShowLeaveModal(false)}
              >
                取消
              </button>
              <button className="btn btn-primary" onClick={handleLeaveSubmit}>
                确认请假
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

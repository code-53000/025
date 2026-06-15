import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getActivities, getActivityTypes } from '../services/api'

export default function ActivityList() {
  const [activities, setActivities] = useState([])
  const [activityTypes, setActivityTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [typeId, setTypeId] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 10,
    total: 0,
    total_pages: 0,
  })

  useEffect(() => {
    loadActivityTypes()
  }, [])

  useEffect(() => {
    loadActivities()
  }, [status, typeId, pagination.page])

  const loadActivityTypes = async () => {
    try {
      const res = await getActivityTypes()
      if (res.code === 200) {
        setActivityTypes(res.data || [])
      }
    } catch (err) {
      console.error('加载活动类型失败', err)
    }
  }

  const loadActivities = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.page,
        page_size: pagination.page_size,
      }
      if (status) params.status = status
      if (typeId) params.type_id = typeId

      const res = await getActivities(params)
      if (res.code === 200) {
        setActivities(res.data.items || [])
        setPagination({
          page: res.data.pagination.page,
          page_size: res.data.pagination.page_size,
          total: res.data.pagination.total,
          total_pages: res.data.pagination.total_pages,
        })
      }
    } catch (err) {
      console.error('加载活动失败', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTypeChange = (e) => {
    setTypeId(e.target.value)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleStatusChange = (e) => {
    setStatus(e.target.value)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  return (
    <div>
      <div className="page-actions">
        <h1 className="page-title" style={{ marginBottom: 0 }}>
          活动列表
        </h1>
        <Link to="/activities/create" className="btn btn-primary">
          + 发布活动
        </Link>
      </div>

      <div className="card">
        <div className="filter-group">
          <select
            className="filter-select"
            value={status}
            onChange={handleStatusChange}
          >
            <option value="">全部状态</option>
            <option value="draft">草稿</option>
            <option value="published">报名中</option>
            <option value="completed">已完成</option>
            <option value="canceled">已取消</option>
          </select>

          <select
            className="filter-select"
            value={typeId}
            onChange={handleTypeChange}
          >
            <option value="">全部类型</option>
            {activityTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="card">
          <div className="loading">加载中...</div>
        </div>
      ) : (
        <div className="activity-grid">
          {activities.map((activity) => (
            <Link
              key={activity.id}
              to={`/activities/${activity.id}`}
              className="activity-card"
            >
              <div className="activity-card-header">
                {activity.activity_type && (
                  <span className="activity-type-tag">
                    {activity.activity_type.name}
                  </span>
                )}
                <h3 className="activity-card-title">{activity.title}</h3>
              </div>
              <div className="activity-card-body">
                <div className="activity-info-item">
                  <span>👨‍🏫</span>
                  <span>{activity.teacher}</span>
                </div>
                <div className="activity-info-item">
                  <span>📍</span>
                  <span>{activity.location}</span>
                </div>
                <div className="activity-info-item">
                  <span>⏰</span>
                  <span>{activity.start_time}</span>
                </div>
                {activity.age_group && (
                  <div className="activity-info-item">
                    <span>👶</span>
                    <span>适合 {activity.age_group.name}</span>
                  </div>
                )}
              </div>
              <div className="activity-card-footer">
                <span className="registration-count">
                  已报名 <strong>{activity.registered_count}</strong> / {activity.max_participants} 人
                </span>
                <span className={`status-tag status-${activity.status}`}>
                  {getStatusText(activity.status)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && activities.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <p>暂无活动</p>
          </div>
        </div>
      )}

      {!loading && pagination.total_pages > 1 && (
        <div className="card" style={{ textAlign: 'center' }}>
          <button
            className="btn btn-default"
            disabled={pagination.page <= 1}
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
          >
            上一页
          </button>
          <span style={{ margin: '0 16px' }}>
            第 {pagination.page} / {pagination.total_pages} 页，共 {pagination.total} 条
          </span>
          <button
            className="btn btn-default"
            disabled={pagination.page >= pagination.total_pages}
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
          >
            下一页
          </button>
        </div>
      )}
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

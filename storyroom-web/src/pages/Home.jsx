import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getActivities, getActivityTypes, getAgeGroups } from '../services/api'

export default function Home() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActivities()
  }, [])

  const loadActivities = async () => {
    try {
      setLoading(true)
      const res = await getActivities({ status: 'published', page_size: 6 })
      if (res.code === 200) {
        setActivities(res.data.items || [])
      }
    } catch (err) {
      console.error('加载活动失败', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="card" style={{ background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)' }}>
        <h1 className="page-title">欢迎来到绘本馆活动中心 🎉</h1>
        <p style={{ fontSize: '16px', color: '#666', marginBottom: '20px' }}>
          这里有精彩的故事会、有趣的手工课和温馨的亲子共读活动，快带孩子来参加吧！
        </p>
        <Link to="/activities" className="btn btn-primary btn-lg">
          查看全部活动
        </Link>
      </div>

      <div className="flex-between mb-20">
        <h2 className="page-title" style={{ fontSize: '20px', marginBottom: 0 }}>
          最新活动
        </h2>
        <Link to="/activities" className="btn btn-default">
          查看更多
        </Link>
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
                  {activity.status === 'published' ? '报名中' : activity.status}
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
            <p>暂无活动，敬请期待</p>
          </div>
        </div>
      )}
    </div>
  )
}

import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom'
import Home from './pages/Home'
import ActivityList from './pages/ActivityList'
import ActivityDetail from './pages/ActivityDetail'
import ActivityCreate from './pages/ActivityCreate'
import ChildList from './pages/ChildList'
import ChildCreate from './pages/ChildCreate'
import ParentList from './pages/ParentList'
import ParentCreate from './pages/ParentCreate'
import AttendancePage from './pages/AttendancePage'
import './styles/index.css'

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <div className="container">
            <Link to="/" className="logo">
              <span className="logo-icon">📚</span>
              <span className="logo-text">绘本馆活动中心</span>
            </Link>
            <nav className="nav">
              <NavLink to="/" end className="nav-link">
                首页
              </NavLink>
              <NavLink to="/activities" className="nav-link">
                活动列表
              </NavLink>
              <NavLink to="/activities/create" className="nav-link">
                发布活动
              </NavLink>
              <NavLink to="/parents" className="nav-link">
                家长管理
              </NavLink>
              <NavLink to="/children" className="nav-link">
                孩子档案
              </NavLink>
            </nav>
          </div>
        </header>
        <main className="app-main">
          <div className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/activities" element={<ActivityList />} />
              <Route path="/activities/create" element={<ActivityCreate />} />
              <Route path="/activities/:id" element={<ActivityDetail />} />
              <Route path="/activities/:id/attendance" element={<AttendancePage />} />
              <Route path="/parents" element={<ParentList />} />
              <Route path="/parents/create" element={<ParentCreate />} />
              <Route path="/children" element={<ChildList />} />
              <Route path="/children/create" element={<ChildCreate />} />
            </Routes>
          </div>
        </main>
        <footer className="app-footer">
          <div className="container">
            <p>© 2024 绘本馆活动管理系统</p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App

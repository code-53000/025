import request from '../utils/request'

export const getActivityTypes = () => {
  return request.get('/activity-types')
}

export const getAgeGroups = () => {
  return request.get('/age-groups')
}

export const getActivities = (params = {}) => {
  return request.get('/activities', { params })
}

export const getActivity = (id) => {
  return request.get(`/activities/${id}`)
}

export const createActivity = (data) => {
  return request.post('/activities', data)
}

export const updateActivity = (id, data) => {
  return request.put(`/activities/${id}`, data)
}

export const publishActivity = (id) => {
  return request.post(`/activities/${id}/publish`)
}

export const deleteActivity = (id) => {
  return request.delete(`/activities/${id}`)
}

export const getActivityRegistrations = (activityId) => {
  return request.get(`/activities/${activityId}/registrations`)
}

export const createRegistration = (data) => {
  return request.post('/registrations', data)
}

export const cancelRegistration = (id) => {
  return request.delete(`/registrations/${id}`)
}

export const getActivityAttendances = (activityId) => {
  return request.get(`/activities/${activityId}/attendances`)
}

export const signAttendance = (data) => {
  return request.post('/attendances/sign', data)
}

export const leaveAttendance = (data) => {
  return request.post('/attendances/leave', data)
}

export const getChildren = (params = {}) => {
  return request.get('/children', { params })
}

export const getChild = (id) => {
  return request.get(`/children/${id}`)
}

export const createChild = (data) => {
  return request.post('/children', data)
}

export const updateChild = (id, data) => {
  return request.put(`/children/${id}`, data)
}

export const deleteChild = (id) => {
  return request.delete(`/children/${id}`)
}

export const getParents = (params = {}) => {
  return request.get('/parents', { params })
}

export const getParent = (id) => {
  return request.get(`/parents/${id}`)
}

export const createParent = (data) => {
  return request.post('/parents', data)
}

export const updateParent = (id, data) => {
  return request.put(`/parents/${id}`, data)
}

export const deleteParent = (id) => {
  return request.delete(`/parents/${id}`)
}

export const getActivityFeedbacks = (activityId) => {
  return request.get(`/activities/${activityId}/feedbacks`)
}

export const createFeedback = (data) => {
  return request.post('/feedbacks', data)
}

export const getMaterials = (params = {}) => {
  return request.get('/materials', { params })
}

export const createMaterial = (data) => {
  return request.post('/materials', data)
}

export const updateMaterial = (id, data) => {
  return request.put(`/materials/${id}`, data)
}

export const deleteMaterial = (id) => {
  return request.delete(`/materials/${id}`)
}

export const getMaterialUsage = (activityId) => {
  return request.get(`/activities/${activityId}/material-usage`)
}

export const createMaterialUsage = (data) => {
  return request.post('/material-usage', data)
}

export const getActivityMaterials = (activityId) => {
  return request.get('/activity-materials', { params: { activity_id: activityId } })
}

export const createActivityMaterial = (data) => {
  return request.post('/activity-materials', data)
}

export const updateActivityMaterial = (id, data) => {
  return request.put(`/activity-materials/${id}`, data)
}

export const deleteActivityMaterial = (id) => {
  return request.delete(`/activity-materials/${id}`)
}

export const login = (data) => {
  return request.post('/auth/login', data)
}

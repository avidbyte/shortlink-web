// src/api/table.ts
import request from '@/utils/request'

// 获取表格数据
export function getTableData(params: Record<string, any>): Promise<any> {
  return request.get('/shortlink', { params })
}

// 新增数据
export function addData(data: Record<string, any>): Promise<any> {
  return request.post('/shortlink', data)
}

// 更新数据2
export function updateData(data:Record<string, any>): Promise<any> {
  return request.put(`/shortlink`, data)
}

// 删除数据
export function deleteData(id: string | number): Promise<any> {
  return request.delete(`/shortlink/${id}`)
}


// 切换状态
export function toggleStatus(id: string | number, data: Record<string, any>): Promise<any> {
  return request.put(`/shortlink/${id}`,data)
}

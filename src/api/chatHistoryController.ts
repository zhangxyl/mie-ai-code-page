// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 此处后端没有提供注释 POST /chatHistory/add */
export async function addChatHistory(
  body: API.ChatHistoryAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong>('/chatHistory/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /chatHistory/app/${param0} */
export async function listAppChatHistory(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listAppChatHistoryParams,
  options?: { [key: string]: any }
) {
  const { appId: param0, ...queryParams } = params
  return request<API.BaseResponsePageChatHistory>(`/chatHistory/app/${param0}`, {
    method: 'GET',
    params: {
      // pageSize has a default value: 10
      pageSize: '10',
      ...queryParams,
    },
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /chatHistory/delete */
export async function deleteChatHistory(body: API.DeleteRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/chatHistory/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /chatHistory/delete/admin */
export async function deleteChatHistoryByAdmin(
  body: API.DeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>('/chatHistory/delete/admin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /chatHistory/delete/by-app/admin */
export async function deleteChatHistoryByAppId(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteChatHistoryByAppIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>('/chatHistory/delete/by-app/admin', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /chatHistory/get/admin */
export async function getChatHistoryById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getChatHistoryByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseChatHistory>('/chatHistory/get/admin', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /chatHistory/get/vo */
export async function getChatHistoryVoById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getChatHistoryVOByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseChatHistoryVO>('/chatHistory/get/vo', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /chatHistory/latest */
export async function getLatestChatHistory(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getLatestChatHistoryParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseListChatHistoryVO>('/chatHistory/latest', {
    method: 'GET',
    params: {
      // limit has a default value: 10
      limit: '10',
      ...params,
    },
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /chatHistory/list/page/vo/admin */
export async function listChatHistoryVoByPageAdmin(
  body: API.ChatHistoryQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageChatHistoryVO>('/chatHistory/list/page/vo/admin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

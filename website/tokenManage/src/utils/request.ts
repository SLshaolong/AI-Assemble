/*
 * @Date: 2025-03-10 16:33:26
 * @LastEditors: shaolong sl3037302304@gmail.com
 * @LastEditTime: 2025-03-11 09:54:24
 * @FilePath: /tokenManage/src/utils/request.ts
 * @Description: from shaolong
 */
import { message } from "antd";
import qs from "qs";
interface RequestOptions extends RequestInit {
  data?: any;
}

interface ResponseData {
  code: number;
  data: any;
  message: string;
}

// 错误处理
const handleError = (error: any) => {
  console.error("请求错误:", error);
  // 这里可以添加全局错误提示,比如使用 antd 的 message 组件
  throw error;
};

// 响应处理
const handleResponse = async (response: Response) => {
  // console.log(response);

  if (!response.ok) {
    switch (response.status) {
      case 200:
        return true;
      case 401:
        message.error("资源未授权");
        throw new Error("未授权,请先登录");
      case 400:
        message.error("内容输入有误");
        throw new Error("输入错误,请检查输入内容");
      case 500:
        message.error("服务器错误");
        throw new Error("服务器未知错误");

      default:
        message.error("运行错误，请联系管理员");
        throw new Error(`HTTP error! status: ${response.status}`);
    }
  }
  const data: ResponseData = await response.json();

  // 这里可以根据后端的状态码约定做相应处理
  //   if (data.code !== 200) {
  //     throw new Error(data.message || '请求失败');
  //   }

  return data;
};

const request = async (url: string, options: RequestOptions = {}) => {
  try {
    const { data, ...restOptions } = options;

    // 处理请求URL
    // const finalUrl = url.startsWith('http') ? url : `${baseURL}${url}`;

    // 默认配置
    const defaultOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",

        // 这里可以添加token等通用header
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    };

    // 合并配置
    const finalOptions = {
      ...defaultOptions,
      ...restOptions,
      headers: {
        ...defaultOptions.headers,
        ...(restOptions.headers || {}),
      },
    };

    // 处理请求体
    if (data) {
      finalOptions.body = JSON.stringify(data);
    }

    const response = await fetch(url, finalOptions);
    return await handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// 导出常用请求方法
export const get = (url: string, options?: RequestOptions) =>
  request(url, { ...options, method: "GET" });

export const post = (url: string, data?: any, options?: RequestOptions) =>
  request(url, {
   
    ...options,
    method: "POST",
    data,
  });

export const put = (url: string, data?: any, options?: RequestOptions) =>
  request(url, { ...options, method: "PUT", data });

export const del = (url: string, options?: RequestOptions) =>
  request(url, { ...options, method: "DELETE" });

export default request;

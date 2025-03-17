/*
 * @Date: 2025-03-11 13:04:50
 * @LastEditors: shaolong sl3037302304@gmail.com
 * @LastEditTime: 2025-03-11 13:38:16
 * @FilePath: /tokenManage/src/api/token.ts
 * @Description: from shaolong
 */
import { get, post } from "../utils/request";
export const getAllTokens = () => get("/api/getAllTokens");

export const addNewToken = (data: {
  model_name: string;
  api_key: string;
  supplier: string;
  text:string
}) => post("/api/init_openai", data);

export const setTokenStatus = (data: { key: string; val: number }) =>
  post("/api/setToken", data);

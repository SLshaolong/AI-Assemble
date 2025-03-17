/*
 * @Date: 2025-03-11 08:53:45
 * @LastEditors: shaolong sl3037302304@gmail.com
 * @LastEditTime: 2025-03-11 13:05:00
 * @FilePath: /tokenManage/src/api/login.ts
 * @Description: from shaolong
 */
import { get, post } from "../utils/request"

export const Login =(data:{username:string,password:string})=>post("/api/login",data)

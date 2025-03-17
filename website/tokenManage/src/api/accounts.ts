/*
 * @Date: 2025-03-11 13:50:36
 * @LastEditors: shaolong sl3037302304@gmail.com
 * @LastEditTime: 2025-03-11 14:05:56
 * @FilePath: /tokenManage/src/api/accounts.ts
 * @Description: from shaolong
 */
import { del, get, post, put } from "../utils/request";

export const getAllList =()=>get("/api/user/list")

export const getUserById=(id:string|number) =>get("/api/user/"+id)
export const UpdateUserById=(id:string|number,data:any) =>put("/api/user/"+id,data)
export const delUserById = (id:string|number) =>del("/api/user/"+id)
export const createUser = (data:{username:string,password:string,apikey:string,account:string})=>post("/api/user/create",data)
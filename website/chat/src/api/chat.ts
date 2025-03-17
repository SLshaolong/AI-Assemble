import request from "../utils/request";

/*
 * @Date: 2025-03-12 16:40:11
 * @LastEditors: shaolong sl3037302304@gmail.com
 * @LastEditTime: 2025-03-13 11:36:35
 * @FilePath: /chat/src/api/chat.ts
 * @Description: from shaolong
 */
export const sendMsg = async (
  msg: string,
  key: string,
  chat_id: string,
  files: FileList,
  callback: (data: string) => void,
  callback2: (data: string,str:string) => void
) => {
  const formData = new FormData();
  formData.append("message", msg);
  formData.append("key", key);
  formData.append("chat_id", chat_id);

  for (let i = 0; i < files.length; i++) {
    formData.append("file", files[i]);
  }

  let response: Response | null = null;
  let reader: any;

  try {
    // 设置超时机制（例如 30 秒）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    response = await fetch("/api/webchat", {
      method: "POST",
      headers: {
        Authorization2: localStorage.getItem("token") || "",
      },
      body: formData,
      signal: controller.signal, // 监听超时信号
    });

    clearTimeout(timeoutId); // 请求成功，清除超时

    if (!response.ok) {
      throw new Error(`HTTP 错误！状态码: ${response.status}`);
    }

    reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");

    let str = "";
    let str2 = "";
    while (reader) {
      try {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        // ✅ 解析 SSE 格式的返回数据
        
        // console.log(chunk);
        
        
        const reg = /<span[^>]*>([\s\S]*?)<\/span>/;


        const arr = chunk.match(reg);
        if(arr){
          // console.log(arr[1]);
          str2 += chunk;
        }else{
          str += chunk;
        }
        callback(chunk);
        
      } catch (err) {
        console.error("流读取异常:", err);
        break; // 避免死循环
      }
    }

    callback2(str,str2); // 最终回调完整数据
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error("请求超时或被中断");
    } else if (error.name === "TypeError") {
      console.error("网络错误或服务器不可达:", error);
    } else {
      console.error("请求发生异常:", error);
    }

    callback2("请求失败，请稍后重试。","");
  } finally {
    reader?.cancel().catch(() => {}); // 关闭流
  }
};

export const getChatList = async () => request.get("/chat/history");
export const getChatHistory = async (data: any) =>
  request.post("/chat/detail", data);

export const getReqModels = async () => request.get("/chat/models");

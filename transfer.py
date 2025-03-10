import base64
import jwt
from openai import OpenAI
from flask import Flask, request, jsonify
from volcenginesdkarkruntime import Ark

import json
import uuid

from ai.ali import ali_chat
from ai.util import generate_token, save_chat_data, decode_token, load_chat_data, markdown_to_html

app = Flask(__name__)

MAX_FILE_SIZE = 5 * 1024 * 1024


@app.post("/init_openai")
def initOpenAi():
    data = request.json
    model_name = data.get('model_name', '')
    api_key = data.get('api_key', '')
    supplier = data.get('supplier', '')
    print(model_name, api_key, supplier)
    if not model_name or not api_key or not supplier:
        return jsonify({"error": "model_name, api_key, and supplier are required"}), 400
    if supplier not in ['alv1', 'hsv3']:
        return jsonify({"error": "supplier must be either 'alv1' or 'hsv3'"}), 400
    token = generate_token(model_name, api_key, supplier)

    # 返回 token
    return jsonify({"token": token})

#todo TOKEN 管理
"""
    JSON 数据 存储token 记录token 状态 创建时间 使用次数 token 生成uuid
    token
"""




def hs_chat(token, msg, base64_arr, chat_id, chat_data):
    try:
        client = Ark(
            base_url="https://ark.cn-beijing.volces.com/api/v3",
            api_key=token["api_key"]
        )
        messages = chat_data.get("messages", [])
        if "messages" not in chat_data:
            chat_data["messages"] = []
        messages.append({"role": "user", "content": [{"type": "text", "text": msg}]})
        if base64_arr:
            image_contents = [
                {"type": "image_url", "image_url": {"url": base64_str}}
                for base64_str in base64_arr
            ]
            messages[-1]["content"].extend(image_contents)
            # messages[-1]["content"] += json.dumps(image_contents)
        print(messages)

        completion = client.chat.completions.create(
            model=token["model_name"],  # 此处以 deepseek-r1 为例，可按需更换模型名称。
            messages=messages
        )
        if chat_id:
            chat_data["messages"].append({"role": "assistant", "content": completion.choices[0].message.content})
            save_chat_data(chat_id, chat_data)
        return markdown_to_html(completion.choices[0].message.content)
    except Exception as e:
        return str(e)





@app.post("/chat")
def chat():
    # 获取 token
    token = request.headers.get('cookie', '')

    if not token:
        return jsonify({"error": "No token provided"}), 400

    decoded_token = decode_token(token)
    if 'error' in decoded_token:
        return jsonify(decoded_token), 401

    # 获取文本 message
    message = request.form.get('message', '')

    if not message:
        return jsonify({"error": "Message is required"}), 400
    chat_id = request.form.get('chat_id', None)  # 获取 chat_id 参数

    # 处理文件
    files = request.files.getlist('file')
    files_base64 = []
    for file in files:
        file_size = len(file.read())  # 获取文件大小
        file.seek(0)  # 读取后需要重置文件指针位置，否则后续 .read() 会返回空
        if file_size > MAX_FILE_SIZE:
            return jsonify({"error": f"File {file.filename} exceeds size limit of 5MB"}), 400
        file_content = file.read()
        format = file.filename.rsplit(".", 1)[1]
        file_base64 = base64.b64encode(file_content).decode('utf-8')
        files_base64.append(f"data:image/{format};base64,{file_base64}")
    chat_data = {}
    if chat_id:
        chat_data = load_chat_data(chat_id)
        # 拼接 message 和 Base64 文件内容
    # 供应商判断
    if decoded_token["supplier"] == "hsv3":
        result = hs_chat(decoded_token, message, files_base64, chat_id, chat_data)
        if "error" in result:
            return jsonify({"error": result}), 400
        return jsonify({"response": result}), 200
    elif decoded_token["supplier"] == "alv1":
        result = ali_chat(decoded_token, message, files_base64, chat_id, chat_data)
        if "error" in result:
            return jsonify({"error": result}), 400
        return jsonify({"response": result}), 200
    return jsonify({"response": f"Message received: {message}"})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5900)

import base64
import json
import os

from flask import Flask, request, jsonify, Response
from ai.tokenManage import get_token, edit_token, get_token_by_key
from ai.util import save_chat_data, decode_token, load_chat_data, markdown_to_html, generate_token, generate_user_token, \
    verify_user_token
from ai.user import UserManager
from datetime import datetime, timedelta
from ai.chat import ChatBaseUrls, use_chat

app = Flask(__name__)
MAX_FILE_SIZE = 5 * 1024 * 1024

user_manager = UserManager()


@app.post("/user/create")
def create_user():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    apikey = data.get('apikey')
    account = data.get('account')

    if not username or not password or not apikey:
        return jsonify({"error": "username, password and apikey are required"}), 400

    user = user_manager.create_user(username, password, apikey, account)
    return jsonify({"data": user}), 200


@app.get("/user/list")
def get_users():
    users = user_manager.get_all_users()
    return jsonify({"data": users}), 200


@app.get("/user/<int:user_id>")
def get_user(user_id):
    user = user_manager.get_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"data": user}), 200


@app.put("/user/<int:user_id>")
def update_user(user_id):
    data = request.json
    success = user_manager.update_user(user_id, data)
    if not success:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"message": "User updated successfully"}), 200


@app.delete("/user/<int:user_id>")
def delete_user(user_id):
    success = user_manager.delete_user(user_id)
    if not success:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"message": "User deleted successfully"}), 200


@app.post("/init_openai")
def initOpenAi():
    data = request.json
    model_name = data.get('model_name', '')
    api_key = data.get('api_key', '')
    supplier = data.get('supplier', '')
    text = data.get('text', '')
    if not model_name or not api_key or not supplier:
        return jsonify({"error": "model_name, api_key, and supplier are required"}), 400
    if supplier not in ['alv1', 'hsv3', 'bianxie']:
        return jsonify({"error": "supplier must be either 'alv1' or 'hsv3' or 'bianxie'"}), 400
    token = generate_token(model_name, api_key, supplier, model_name, text)

    return jsonify({"token": token})


def get_password():
    try:
        with open("./chat_utils/password.txt", "r") as f:
            return f.read().strip()
    except FileNotFoundError:
        return None


def authenticate(password):
    correct_password = get_password()
    if correct_password is None:
        return jsonify({"error": "Password file not found."}), 500
    if password != correct_password:
        return jsonify({"error": "the password was reject."}), 401
    return None


@app.get("/getAllTokens")
def getAllTokens():
    return get_token()


@app.post("/login")
def login():
    data = request.json
    username = data.get('username', '')
    password = data.get('password', '')

    if not username or not password:
        return jsonify({"error": "username and password are required"}), 400

    if username == "admin" and password == get_password():
        return jsonify({"data": {
            "userId": "001",
            "username": "admin",
            "userpermission": "superadmin"
        }}), 200
    else:
        return jsonify({"error": "Invalid username or password"}), 401


@app.post("/userLogin")
def user_login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "username and password are required"}), 400

    user = user_manager.get_user_by_username(username)

    if user and user['password'] == password:
        # 生成token，设置有效期为三个月
        if user["status"] != 1:
            return jsonify({"error": 'the user is been disabled', "code": 500}), 500
        token = generate_user_token(user['id'], user['username'], user['password'])
        user['token'] = token
        return jsonify({"code": 200, "data": user}), 200
    return jsonify({"error": "Invalid username or password", "code": 401}), 401


@app.post("/setToken")
def setToken():
    data = request.json
    key = data.get('key', '')
    val = data.get('val', 0)

    if key:
        return edit_token(key, val)
    return jsonify({"error": "key and val are required"}), 500


@app.post("/chat")
def chat():
    token = request.headers.get('cookie', '')

    if not token:
        return jsonify({"error": "No token provided"}), 400

    decoded_token = decode_token(token)
    if 'error' in decoded_token:
        return jsonify(decoded_token), 401

    message = request.form.get('message', '')

    if not message:
        return jsonify({"error": "Message is required"}), 400
    chat_id = request.form.get('chat_id', None)

    files = request.files.getlist('file')
    files_base64 = []
    for file in files:
        file_size = len(file.read())
        file.seek(0)
        if file_size > MAX_FILE_SIZE:
            return jsonify({"error": f"File {file.filename} exceeds size limit of 5MB"}), 400
        file_content = file.read()
        format = file.filename.rsplit(".", 1)[1]
        file_base64 = base64.b64encode(file_content).decode('utf-8')
        files_base64.append(f"data:image/{format};base64,{file_base64}")
    chat_data = {}
    if chat_id:
        chat_data = load_chat_data(chat_id)

    if decoded_token["supplier"] == "hsv3":

        result = use_chat(ChatBaseUrls.HS_BASE_URL, decoded_token, message, files_base64, chat_id, chat_data,
                          stream=False)
        if "error" in result:
            return jsonify({"error": result}), 400
        return jsonify({"response": result}), 200
    elif decoded_token["supplier"] == "alv1":
        result = use_chat(ChatBaseUrls.ALI_BASE_URL, decoded_token, message, files_base64, chat_id, chat_data,
                          stream=False)
        if "error" in result:
            return jsonify({"error": result}), 400
        return jsonify({"response": result}), 200
    elif decoded_token["supplier"] == "bianxie":
        result = use_chat(ChatBaseUrls.BIANXIE_BASE_URL, decoded_token, message, files_base64, chat_id, chat_data,
                          stream=False)
        if "error" in result:
            return jsonify({"error": result}), 400
        return jsonify({"response": result}), 200
    return jsonify({"response": f"Message received: {message}"})


@app.post("/webchat")
def webchat():
    token = request.headers.get('Authorization2', '')

    if not token:
        return jsonify({"error": "No token provided"}), 400

    decoded_token = verify_user_token(token)
    if 'error' in decoded_token:
        return jsonify(decoded_token), 401

    message = request.form.get('message', '')
    key = request.form.get('key', '')
    if not message or not key:
        return jsonify({"error": "Message and key is required "}), 400
    chat_id = request.form.get('chat_id', None)

    files = request.files.getlist('file')
    files_base64 = []
    for file in files:
        file_size = len(file.read())
        file.seek(0)
        if file_size > MAX_FILE_SIZE:
            return jsonify({"error": f"File {file.filename} exceeds size limit of 5MB"}), 400
        file_content = file.read()
        format = file.filename.rsplit(".", 1)[1]
        file_base64 = base64.b64encode(file_content).decode('utf-8')
        files_base64.append(f"data:image/{format};base64,{file_base64}")
    chat_data = {}
    chat_token = get_token_by_key(key)

    token_chat = chat_token.get('data').get('token')
    use_token = decode_token(token_chat)
    print(use_token)
    if chat_id:
        use_chat_id = f"{decoded_token['user_id']}${chat_id}"
        chat_data = load_chat_data(use_chat_id)
    msg = ""
    def generate(msg=None):
        # 定义供应商到基础URL的映射
        supplier_urls = {
            "hsv3": ChatBaseUrls.HS_BASE_URL,
            "alv1": ChatBaseUrls.ALI_BASE_URL, 
            "bianxie": ChatBaseUrls.BIANXIE_BASE_URL
        }
        
        # 获取当前供应商的URL
        base_url = supplier_urls.get(use_token["supplier"])
        if not base_url:
            return
            
        # 统一调用chat接口
        compile_data = use_chat(
            base_url,
            use_token, 
            message,
            files_base64,
            use_chat_id,
            chat_data,
            stream=True
        )
        print(compile_data)

        # 处理流式响应
        msg = msg or ""
        for chunk in compile_data.get("message", []):
            if chunk.choices[0] and chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content
                msg += content
                yield content

        # 保存聊天记录
        if use_chat_id:
            message_data = compile_data.get('chat_data')
            message_data["messages"].append({
                "role": "assistant",
                "content": msg
            })
            save_chat_data(use_chat_id, message_data)


    response = Response(generate(msg), mimetype='text/event-stream')
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['code'] = 200
    return response

@app.get("/chat/history")
def get_chat_history():
    # 获取token并验证
    token = request.headers.get('Authorization2', '')
    if not token:
        return jsonify({"error": "No token provided"}), 400
        
    decoded_token = verify_user_token(token)
    if not decoded_token:
        return jsonify({"error": "Invalid token"}), 401
        
    user_id = decoded_token.get('user_id')
    
    try:
        # 获取chat目录下所有文件
        chat_files = []
        chat_dir = "./chat_history"
        for file in os.listdir(chat_dir):
            if file.startswith(f"chat_{user_id}$") and file.endswith(".json"):
                chat_path = os.path.join(chat_dir, file)
                with open(chat_path, 'r', encoding='utf-8') as f:
                    chat_data = json.load(f)
                    # 获取第一条消息的文本作为名称
                    if chat_data.get("messages") and len(chat_data["messages"]) > 0:
                        first_message = chat_data["messages"][0]
                        name = first_message.get("content")[0].get("text", "")[:5]
                        chat_id = file.split("$")[1].split(".json")[0]
                        chat_files.append({
                            "chat_id": chat_id,
                            "name": name
                        })
                        
        return jsonify({"data": chat_files,"code":200}), 200
        
    except Exception as e:
        print(f"Error reading chat history: {str(e)}")
        return jsonify({"error": "Failed to get chat history"}), 500

@app.post("/chat/detail")
def get_chat_detail():
    # 获取token并验证
    token = request.headers.get('Authorization2', '')
    if not token:
        return jsonify({"error": "No token provided"}), 400
        
    decoded_token = verify_user_token(token)
    if not decoded_token:
        return jsonify({"error": "Invalid token"}), 401
        
    user_id = decoded_token.get('user_id')
    
    # 获取请求参数
    data = request.json
    chat_id = data.get('chat_id')
    
    if not chat_id:
        return jsonify({"error": "chat_id is required"}), 400
        
    try:
        # 拼接完整的chat_id
        full_chat_id = f"chat_{user_id}${chat_id}"
        chat_path = os.path.join("./chat_history", f"{full_chat_id}.json")
        
        # 检查文件是否存在
        if not os.path.exists(chat_path):
            return jsonify({"data": [],"code":200}), 200
            
        # 读取聊天记录
        with open(chat_path, 'r', encoding='utf-8') as f:
            chat_data = json.load(f)
            
        return jsonify({"data": chat_data,"code":200}), 200
        
    except Exception as e:
        print(f"Error reading chat detail: {str(e)}")
        return jsonify({"error": "Failed to get chat detail"}), 500



@app.get("/chat/models")
def get_model_by_id():
    token = request.headers.get('Authorization2', '')
    if not token:
        return jsonify({"error": "No token provided"}), 400

    decoded_token = verify_user_token(token)
    if not decoded_token:
        return jsonify({"error": "Invalid token"}), 401

    user_id = decoded_token.get('user_id')
    user = user_manager.get_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User does not exist"}),500
    return jsonify({"data": user,"code":200}),200
    pass

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5900)

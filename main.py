import base64
from flask import Flask, request, jsonify
from ai.bianxie import bianxie
from ai.hs import hs_chat
from ai.tokenManage import get_token, edit_token
from ai.ali import ali_chat
from ai.util import generate_token, save_chat_data, decode_token, load_chat_data, markdown_to_html
from ai.user import UserManager

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

    user = user_manager.create_user(username, password, apikey,account)
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
    # print(model_name, api_key, supplier)
    if not model_name or not api_key or not supplier:
        return jsonify({"error": "model_name, api_key, and supplier are required"}), 400
    if supplier not in ['alv1', 'hsv3', 'bianxie']:
        return jsonify({"error": "supplier must be either 'alv1' or 'hsv3' or 'bianxie'"}), 400
    token = generate_token(model_name, api_key, supplier,model_name,text)

    # 返回 token
    return jsonify({"token": token})


# todo TOKEN 管理
"""
    JSON 数据 存储token 记录token 状态 创建时间 使用次数 token 生成uuid
    token
"""


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


    if username =="admin" and password == get_password():
        return jsonify({"data": {
            "userId": "001",
            "username": "admin",
            "userpermission":"superadmin"
        }}), 200
    else:
        return jsonify({"error": "Invalid username or password"}), 401

@app.post("/setToken")
def setToken():
    data = request.json
    key = data.get('key', '')
    val = data.get('val', 0)

    if key :
        return edit_token(key, val)
    return jsonify({"error": "key and val are required"}), 500


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
    elif decoded_token["supplier"] == "bianxie":
        result = bianxie(decoded_token, message, files_base64, chat_id, chat_data)
        if "error" in result:
            return jsonify({"error": result}), 400
        return jsonify({"response": result}), 200
    return jsonify({"response": f"Message received: {message}"})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5900)

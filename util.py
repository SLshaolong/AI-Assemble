import json
import time
import uuid
from datetime import datetime

import jwt
import markdown

SECRET_KEY = "sl3037302304"


def load_chat_data(chat_id):
    '''
    根据chat_id 解析chat_history data
    :param chat_id: 传递的chat_id
    :return: json格式 数组
    '''
    try:
        # 尝试加载现有对话数据
        with open(f"./chat_history/chat_{chat_id}.json", "r", encoding="utf-8") as f:
            chat_data = json.load(f)
        return chat_data
    except FileNotFoundError:
        # 如果没有文件，则返回一个空字典
        return {"messages": []}


def decode_token(token):
    '''
        token 解码
    :param token: token
    :return: 返回解码成功的json
    '''
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])

        if get_toekn_status(token) != 1:
            return {"error": "Token has be reject"}
        add_time_for_token(token)
        return decoded
    except jwt.ExpiredSignatureError:
        return {"error": "Token has expired"}
    except jwt.InvalidTokenError:
        return {"error": "Invalid token"}


def generate_token(model_name, api_key, supplier,modelname,text):

    '''
        生成token
    :param model_name: 模型名称
    :param api_key: api_key
    :param supplier: 供应商 目前是 alv1 和 hsv3 如果提供openai 的可以直接选择 alv1
    :return: token
    '''
    key = uuid.uuid4().hex
    payload = {
        "model_name": model_name,
        "api_key": api_key,
        "supplier": supplier,
        "key": key
    }

    # 生成 token
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    save_token_to_file(token, key,modelname,text)
    return token


def save_chat_data(chat_id, chat_data):
    # 保存对话数据到本地
    with open(f"./chat_history/chat_{chat_id}.json", "w", encoding="utf-8") as f:
        json.dump(chat_data, f, ensure_ascii=False, indent=4)


def markdown_to_html(md_text):
    # 将 Markdown 文本转换为 HTML
    html_output = markdown.markdown(md_text)
    return html_output


def save_token_to_file(token, key,modelname,text):
    # 读取当前文件中的数据
    try:
        with open(f"./chat_utils/token_manage.json", "r", encoding="utf-8") as f:
            # 如果文件非空，则加载数据
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                # 如果文件为空或者无法解析成 JSON，初始化为空列表
                data = []
    except FileNotFoundError:
        # 如果文件不存在，初始化为空列表
        data = []

    # 检查 token 是否已经存在
    for entry in data:
        if entry.get("token") == token:
            # 如果 token 已存在，直接返回
            print(f"Token '{token}' already exists, no action taken.")
            return

    # 如果没有找到该 token，则添加新的 token
    new_entry = {
        "key": key,
        "token": token,
        "time": 0,
        "modelname":modelname,
        "generateTime":datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        "status": 1,
        "id": uuid.uuid4().hex,
        "text":text
    }

    # 将新的数据追加到原有数据中
    data.append(new_entry)

    # 重新写回文件
    with open(f"./chat_utils/token_manage.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

    print(f"Token '{token}' added to file.")


def read_file_to_json(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        return data


def add_time_for_token(token):
    data = read_file_to_json("./chat_utils/token_manage.json")
    for entry in data:
        if entry.get("token") == token:
            # 获取当前的次数
            current_time = entry.get("time", 0)  # 默认值为 0
            # 增加次数
            new_time = current_time + 1
            entry["time"] = new_time

            # 更新 JSON 文件
            with open("./chat_utils/token_manage.json", "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=4)


def get_toekn_status(token):
    data = read_file_to_json("./chat_utils/token_manage.json")
    for entry in data:
        if entry.get("token") == token:
            return entry["status"]


def change_token_status(token, status):
    data = read_file_to_json("./chat_utils/token_manage.json")
    for entry in data:
        if entry.get("token") == token:
            entry["status"] = status
            # 保存修改后的数据回文件
            with open("./chat_utils/token_manage.json", "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=4)
            # 返回修改后的 status
            return entry["status"]

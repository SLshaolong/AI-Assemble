'''
Date: 2025-03-10 09:51:24
LastEditors: shaolong sl3037302304@gmail.com
LastEditTime: 2025-03-12 17:06:15
FilePath: /ai/tokenManage.py
Description: from shaolong
'''
import json

import ai.chat_utils
def get_token():
    with open('./chat_utils/token_manage.json', 'r') as f:
        return json.loads(f.read())


def edit_token(key,status):
    file_path = './chat_utils/token_manage.json'

    try:
        # 读取 JSON 文件
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # 查找并更新对应 token 的状态
        token_found = False
        for item in data:  # 假设 JSON 结构是 {"tokens": [{...}, {...}]}
            if item.get("key") == key:
                item["status"] = status
                token_found = True
                break

        if not token_found:
            return {"error": "Token not found."}, 404

        # 将更新后的数据写回文件
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4, ensure_ascii=False)

        return {"success": True, "message": "Token status updated successfully."}

    except FileNotFoundError:
        return {"error": "Token file not found."}, 500
    except json.JSONDecodeError:
        return {"error": "Invalid JSON format."}, 500


def get_token_by_key(key):
    """
    根据key获取token数据
    :param key: token的key
    :return: 返回token完整数据或错误信息
    """
    file_path = './chat_utils/token_manage.json'
    
    try:
        # 读取JSON文件
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        # 查找对应key的token数据
        for item in data:
            if item.get("key") == key:
                return {"success": True, "data": item}
                
        return {"error": "Token not found"}, 404
        
    except FileNotFoundError:
        return {"error": "Token file not found"}, 500
    except json.JSONDecodeError:
        return {"error": "Invalid JSON format"}, 500

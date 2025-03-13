'''
Date: 2025-03-11 10:58:08
LastEditors: shaolong sl3037302304@gmail.com
LastEditTime: 2025-03-11 15:56:05
FilePath: /ai/user.py
Description: from shaolong
'''
import json
import os
import time
from datetime import datetime, timedelta

class UserManager:
    def __init__(self):
        self.user_file = "chat_utils/user.json"
        self.token_file = "chat_utils/token_manage.json"
        self.users = self._load_users()
        
    def _load_users(self):
        if not os.path.exists(self.user_file):
            return []
        try:
            with open(self.user_file, 'r') as f:
                return json.load(f)
        except:
            return []
            
    def _save_users(self):
        with open(self.user_file, 'w') as f:
            json.dump(self.users, f, indent=4)
            
    def _get_tokens_by_apikeys(self, apikeys):
        if not os.path.exists(self.token_file):
            return []
        try:
            with open(self.token_file, 'r') as f:
                tokens = json.load(f)
                apikey_list = apikeys.split(',')
                user_tokens = []
                for token in tokens:
                    if token.get('key') in apikey_list and token.get('status') == 1:
                        user_tokens.append(token)
                return user_tokens
        except:
            return []
        return []
        
    def create_user(self, username, password, apikey, account):
        user = {
            'id': len(self.users) + 1,
            'username': username,
            "account": account,
            'password': password,
            'status': 1,  # 1-active, 0-inactive
            'apikeys': apikey,
            'createTime': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        self.users.append(user)
        self._save_users()
        return user
        
    def get_user_by_id(self, user_id):
        for user in self.users:
            if user['id'] == user_id:
                user_info = user.copy()
                user_info['tokens'] = self._get_tokens_by_apikeys(user['apikeys'])
                return user_info
        return None
        
    def get_user_by_username(self, username):
        for user in self.users:
            if user['username'] == username:
                user_info = user.copy()
                user_info['tokens'] = self._get_tokens_by_apikeys(user['apikeys'])
                return user_info
        return None
        
    def update_user(self, user_id, updates):
        for user in self.users:
            if user['id'] == user_id:
                user.update(updates)
                self._save_users()
                return True
        return False
        
    def delete_user(self, user_id):
        for i, user in enumerate(self.users):
            if user['id'] == user_id:
                self.users.pop(i)
                self._save_users()
                return True
        return False
        
    def get_all_users(self):
        users_with_tokens = []
        for user in self.users:
            user_info = user.copy()
            user_info['tokens'] = self._get_tokens_by_apikeys(user['apikeys'])
            users_with_tokens.append(user_info)
        return users_with_tokens

    def login_user(self, username, password):
        for user in self.users:
            if user['username'] == username and user['password'] == password:
                user_info = user.copy()
                user_info['tokens'] = self._get_tokens_by_apikeys(user['apikeys'])
                # 设置token过期时间为3个月
                expiration_time = datetime.now() + timedelta(days=90)
                user_info['token_expiration'] = expiration_time.strftime('%Y-%m-%d %H:%M:%S')
                return user_info
        return None

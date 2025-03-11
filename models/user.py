"""
用户管理模块

处理用户相关的所有操作，包括CRUD和认证
"""

import json
import os
from datetime import datetime
from typing import List, Dict, Optional, Tuple
from config.settings import USER_FILE, TOKEN_FILE

class UserError(Exception):
    """用户相关错误"""
    pass

class UserManager:
    """用户管理类
    
    处理所有用户相关操作，包括创建、读取、更新、删除用户，
    以及用户认证和token管理。
    
    Attributes:
        user_file: 用户数据文件路径
        token_file: token管理文件路径
        users: 用户数据缓存
    """
    
    def __init__(self):
        """初始化用户管理器"""
        self.user_file = USER_FILE
        self.token_file = TOKEN_FILE
        self.users = self._load_users()
        
    def _load_users(self) -> List[Dict]:
        """加载用户数据
        
        Returns:
            List[Dict]: 用户列表
        
        Raises:
            UserError: 加载用户数据失败
        """
        try:
            if not os.path.exists(self.user_file):
                return []
            with open(self.user_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            raise UserError(f"加载用户数据失败: {str(e)}")
            
    def _save_users(self) -> None:
        """保存用户数据
        
        Raises:
            UserError: 保存用户数据失败
        """
        try:
            with open(self.user_file, 'w', encoding='utf-8') as f:
                json.dump(self.users, f, ensure_ascii=False, indent=4)
        except Exception as e:
            raise UserError(f"保存用户数据失败: {str(e)}")
            
    def _get_tokens_by_apikeys(self, apikeys: str) -> List[Dict]:
        """获取用户的token列表
        
        Args:
            apikeys: 逗号分隔的API密钥字符串
            
        Returns:
            List[Dict]: token列表
        """
        try:
            if not os.path.exists(self.token_file):
                return []
            with open(self.token_file, 'r', encoding='utf-8') as f:
                tokens = json.load(f)
                apikey_list = apikeys.split(',')
                return [
                    token for token in tokens
                    if token.get('key') in apikey_list and token.get('status') == 1
                ]
        except Exception as e:
            print(f"获取token失败: {str(e)}")
            return []
            
    def create_user(self, username: str, password: str, apikey: str, 
                   account: str) -> Dict:
        """创建新用户
        
        Args:
            username: 用户名
            password: 密码
            apikey: API密钥
            account: 账户类型
            
        Returns:
            Dict: 新创建的用户信息
            
        Raises:
            UserError: 用户名已存在
        """
        if self.get_user_by_username(username):
            raise UserError(f"用户名 '{username}' 已存在")
            
        user = {
            'id': len(self.users) + 1,
            'username': username,
            'account': account,
            'password': password,  # 实际应用中应该加密存储
            'status': 1,
            'apikeys': apikey,
            'createTime': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        self.users.append(user)
        self._save_users()
        return user
        
    def get_user_by_id(self, user_id: int) -> Optional[Dict]:
        """根据ID获取用户
        
        Args:
            user_id: 用户ID
            
        Returns:
            Optional[Dict]: 用户信息或None
        """
        for user in self.users:
            if user['id'] == user_id:
                user_info = user.copy()
                user_info['tokens'] = self._get_tokens_by_apikeys(user['apikeys'])
                return user_info
        return None
        
    def get_user_by_username(self, username: str) -> Optional[Dict]:
        """根据用户名获取用户
        
        Args:
            username: 用户名
            
        Returns:
            Optional[Dict]: 用户信息或None
        """
        for user in self.users:
            if user['username'] == username:
                user_info = user.copy()
                user_info['tokens'] = self._get_tokens_by_apikeys(user['apikeys'])
                return user_info
        return None
        
    def update_user(self, user_id: int, updates: Dict) -> bool:
        """更新用户信息
        
        Args:
            user_id: 用户ID
            updates: 要更新的字段
            
        Returns:
            bool: 更新是否成功
        """
        for user in self.users:
            if user['id'] == user_id:
                user.update(updates)
                self._save_users()
                return True
        return False
        
    def delete_user(self, user_id: int) -> bool:
        """删除用户
        
        Args:
            user_id: 用户ID
            
        Returns:
            bool: 删除是否成功
        """
        for i, user in enumerate(self.users):
            if user['id'] == user_id:
                self.users.pop(i)
                self._save_users()
                return True
        return False
        
    def get_all_users(self) -> List[Dict]:
        """获取所有用户
        
        Returns:
            List[Dict]: 用户列表
        """
        users_with_tokens = []
        for user in self.users:
            user_info = user.copy()
            user_info['tokens'] = self._get_tokens_by_apikeys(user['apikeys'])
            users_with_tokens.append(user_info)
        return users_with_tokens
        
    def authenticate(self, username: str, password: str) -> Tuple[bool, Optional[Dict]]:
        """用户认证
        
        Args:
            username: 用户名
            password: 密码
            
        Returns:
            Tuple[bool, Optional[Dict]]: (认证是否成功, 用户信息)
        """
        user = self.get_user_by_username(username)
        if user and user['password'] == password:  # 实际应用中应该比较加密后的密码
            return True, user
        return False, None 
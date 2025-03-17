<!--
 * @Date: 2025-03-10 09:46:57
 * @LastEditors: shaolong sl3037302304@gmail.com
 * @LastEditTime: 2025-03-17 09:00:44
 * @FilePath: /ai/README.md
 * @Description: from shaolong
-->
# AI Chat Service

这是一个集成了多个AI聊天服务的Flask应用程序，支持阿里云、火山引擎和编写AI等多个平台。

## 项目结构

### 主目录

- `main.py`: 主应用程序入口，定义了Flask应用的路由和处理逻辑。
- `run.sh`: 启动脚本，用于初始化环境并运行应用。

### 核心功能

- `tokenManage.py`: 负责管理和操作token，包括获取、编辑和根据key查找token。
- `util.py`: 提供了一些实用功能，如token生成与验证、聊天数据的加载与保存、Markdown转换等。
- `user.py`: 用户管理模块，提供用户的CRUD操作和token管理功能。

### 配置与数据

- `chat_utils/token_manage.json`: 存储token信息的JSON文件。
- `chat_utils/user.json`: 存储用户信息的JSON文件。
- `chat_utils/password.txt`: 存储管理员密码的文本文件。

### 依赖管理

- `requirements.txt`: 列出了项目所需的Python依赖包。

## 功能特点

- 多平台AI聊天服务集成
- 用户管理系统
- Token管理
- 聊天历史记录
- 文件上传支持
- 流式响应

## 安装与运行

1. 克隆项目到本地：
   ```bash
   git clone https://github.com/yourusername/ai-chat-service.git
   cd ai-chat-service
   ```

2. 运行启动脚本：
   ```bash
   ./run.sh
   ```

3. 或者手动安装依赖并运行：
   ```bash
   pip install -r requirements.txt
   python main.py
   ```

## API接口

- 用户管理：
  - `POST /user/create`: 创建新用户
  - `GET /user/list`: 获取用户列表
  - `GET /user/<id>`: 获取用户信息
  - `PUT /user/<id>`: 更新用户信息
  - `DELETE /user/<id>`: 删除用户

- 聊天功能：
  - `POST /chat`: 发送聊天消息
  - `POST /webchat`: Web端聊天（支持流式响应）
  - `GET /chat/history`: 获取聊天历史
  - `POST /chat/detail`: 获取聊天详情

- Token管理：
  - `POST /init_openai`: 初始化AI配置
  - `GET /getAllTokens`: 获取所有token
  - `POST /setToken`: 设置token状态

## 开发

1. 安装开发依赖：
   ```bash
   pip install -r requirements.txt
   ```

2. 运行测试：
   ```bash
   python -m pytest tests/
   ```

## 许可证

MIT License

## 作者

shaolong (sl3037302304@gmail.com)
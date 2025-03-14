#!/bin/bash

# 确保必要的目录存在
mkdir -p chat_utils
mkdir -p chat_history

# 检查并创建必要的文件
if [ ! -f chat_utils/token_manage.json ]; then
    echo "[]" > chat_utils/token_manage.json
fi

if [ ! -f chat_utils/user.json ]; then
    echo "[]" > chat_utils/user.json
fi

if [ ! -f chat_utils/password.txt ]; then
    echo "admin123" > chat_utils/password.txt
fi

# 安装依赖
pip install -r requirements.txt

# 运行应用
python main.py 
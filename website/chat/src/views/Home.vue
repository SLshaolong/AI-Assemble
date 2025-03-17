<template>
  <div class="chat-container">
    <!-- 左侧栏 -->
    <div class="left-sidebar">
      <el-button type="primary" class="new-chat-btn" @click="startNewChat">
        <el-icon><Plus /></el-icon>新建聊天
      </el-button>
      <div class="chat-history">
        <div
          v-for="(chat, index) in chatHistory"
          :key="index"
          class="chat-item"
          :class="{ active: currentChatId === chat.id }"
          @click="switchChat(chat.id)"
        >
          {{ chat.title }}
        </div>
      </div>
    </div>

    <!-- 右侧内容区 -->
    <div class="right-content">
      <!-- 顶部用户信息 -->
      <div class="user-info">
        <span>{{ userInfo.username }}</span>
        <el-button type="danger" size="small" @click="handleLogout"
          >退出登录</el-button
        >
      </div>

      <!-- 聊天内容展示区 -->
      <div class="chat-messages" ref="messagesContainer">
        <div v-if="!messages || messages.length <= 0" class="no-message">
          输入信息开始聊天
        </div>
        <div v-for="(msg, index) in messages" style="display: flex">
          <div :key="index" class="message" :class="msg.role">
            <div class="message-content" v-if="msg.role == 'user'">
              <template v-for="(content, cIndex) in msg.content" :key="cIndex">
                <div v-if="content.type === 'text'" class="text-content">
                  {{ content.text }}
                </div>
                <img
                  v-else-if="content.type === 'image_url'"
                  :src="content.image_url.url"
                  class="image-content"
                  alt="聊天图片"
                />
              </template>
            </div>
            <div v-else>
              <div class="chat-repoart">
                <div v-html="msg.content" style="display: inline-block"></div>
                <span
                  v-if="!sendFlag && index === messages.length - 1"
                  class="cursor"
                ></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部输入区 -->
      <div class="chat-input-area">
        <div class="operation-bar">
          <el-select
            v-model="selectedModel"
            placeholder="选择模型"
            size="small"
            class="model-select"
            @change="changeModel"
          >
            <el-option
              v-for="model in availableModels"
              :key="model.value"
              :label="model.label"
              :value="model.value"
            >
            </el-option>
          </el-select>

          <el-upload
            :disabled="!sendFlag"
            class="upload-component"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            multiple
            accept="image/*"
            @change="handleFileUpload"
          >
            <el-button type="primary" size="small" class="upload-btn">
              <el-icon><Upload /></el-icon>
            </el-button>
          </el-upload>
          <div class="files">
            <div v-for="(file, index) in fileList" :key="index">
              📎 {{ file.name }}
              <span
                style="color: red; cursor: pointer; font-size: 12px"
                @click="handleRemoveFile(file)"
                >❌</span
              >
            </div>
          </div>
        </div>

        <div class="input-actions">
          <el-input
            v-model="inputMessage"
            type="textarea"
            :rows="3"
            placeholder="请输入消息..."
            resize="none"
            :disabled="!sendFlag"
            class="message-input"
            @paste="handlePaste"
            @keydown.enter.prevent="(e:any) => {
              if (!e.shiftKey) {
                sendMessage();
              } else {
                e.preventDefault();
                const start = e.target.selectionStart;
                const end = e.target.selectionEnd;
                inputMessage = inputMessage.substring(0, start) + '\n' + inputMessage.substring(end);
                nextTick(() => {
                  e.target.selectionStart = e.target.selectionEnd = start + 1;
                });
              }
            }"
          />
          <!-- <el-button type="primary" @click="sendMessage" class="send-btn">
            发送 <el-icon class="send-icon"><Position /></el-icon>
          </el-button> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, nextTick } from "vue";
import { marked } from "marked";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Plus, Upload, Position } from "@element-plus/icons-vue";

import {
  getChatHistory,
  getChatList,
  getReqModels,
  sendMsg,
} from "../api/chat";

const router = useRouter();
const fileList = ref([] as File[]);
const sendFlag = ref(true);
const inputMessage = ref("");
const currentChatId = ref(null as any);
const selectedModel = ref("");
const messagesContainer = ref<HTMLElement>();
const messages = ref([] as any);
const chatHistory = ref([] as any);

const userInfo = reactive({
  username:
    JSON.parse(localStorage.getItem("userinfo") || "{}").username || "用户",
});

const handlePaste = (e: ClipboardEvent) => {
  const items = e.clipboardData?.items;
  if (!items) return;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.indexOf("image") !== -1) {
      const file = item.getAsFile();
      if (file) {
        handleFileUpload({ raw: file, name: file.name });
      }
    }
  }
};

const getModels = () => {
  const users = JSON.parse(localStorage.getItem("userinfo") || "{}");
  // console.log(users.tokens);
  const list = users.tokens;
  list.forEach((element: any) => {
    element.label = element.text;
    element.value = element.key;
  });
  return list;
};

const availableModels = ref(getModels());

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userinfo");
  router.push("/login");
};

const startNewChat = () => {
  // get_chat_list()
  const newChat = {
    id: generate_chat_id(),
    title: "新的对话",
  };
  messages.value = localStorage.setItem("chat_id", newChat.id);
  chatHistory.value.unshift(newChat);
  currentChatId.value = newChat.id;
  get_chat_history();
};
const handleRemoveFile = (file: File) => {
  console.log(file);
  const index = fileList.value.indexOf(file);
  if (index !== -1) {
    // ✅ 正确删除：保持原数组结构
    fileList.value.splice(index, 1);
  }
};
const getModelsByUserId = async () => {
  const result = await getReqModels();
  console.log(result);
  localStorage.setItem("userinfo", JSON.stringify(result.data));
};

const switchChat = (chatId: string) => {
  currentChatId.value = chatId;
  localStorage.setItem("chat_id", chatId);
  // 加载对应聊天记录
  get_chat_history();
};

const changeModel = (e: string) => {
  localStorage.setItem("model", e);
};
const handleFileUpload = (file: any) => {
  if (file) {
    if (fileList.value.find((item) => item.name === file.raw.name && item.size === file.raw.size)) return
    fileList.value.push(file);
    return;
  }
};
const get_model = () => {
  const model = localStorage.getItem("model") || null;
  if (model) {
    selectedModel.value = model;
  } else {
    // 设置第一个
    const models = getModels();
    selectedModel.value = models[0].key;
    localStorage.setItem("model", models[0].key);
  }
};

onMounted(() => {
  get_model();
  get_chat_history();
  get_chat_id();
  get_chat_list();
  getModelsByUserId();
  // 选择图片
  // 发送消息
  // sendMsg('鲁迅和周树人的区别',[] as any,(data)=>{
  //   console.log(data);
  // },success=>{
  //   console.log(success);
  // })
});

const get_chat_history = async () => {
  const id = localStorage.getItem("chat_id") || null;
  const res = await getChatHistory({ chat_id: id });
  // console.log(res);
  if (res.data.messages && res.data.messages.length > 0) {
    res.data.messages.forEach((element: any) => {
      if (element.role === "assistant") {
        element.content = marked(element.content);
      }
    });
  }
  messages.value = res.data.messages || [];
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const get_chat_list = async () => {
  const res = await getChatList();
  if (res.data.length > 0) {
    res.data.forEach((element: any) => {
      element.title = element.name || "新的对话";
      element.id = element.chat_id;
    });
    chatHistory.value = res.data;
  }
};

const get_chat_id = () => {
  const chat_id = localStorage.getItem("chat_id") || null;
  if (chat_id) {
    currentChatId.value = chat_id;
  } else {
    currentChatId.value = generate_chat_id();
    localStorage.setItem("chat_id", currentChatId.value);
  }
};

const generate_chat_id = () => {
  // 生成一个基于时间戳和随机数的唯一ID
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000); // 6位随机数
  return `${timestamp}_${random}`;
};

const sendMessage = () => {
  if (!sendFlag.value) {
    return;
  }
  if (!selectedModel.value) {
    ElMessage.warning("请选择模型");
    return;
  }
  if (!inputMessage.value.trim()) {
    ElMessage.warning("请输入消息内容");
    return;
  }
  getModelsByUserId();

  const message_info = {
    role: "user",
    content: [
      {
        type: "text",
        text: inputMessage.value,
      },
    ],
  } as any;
  const file_list = [] as any;
  if (fileList.value.length > 0) {
    for (let i = 0; i < fileList.value.length; i++) {
      const file_box = fileList.value[i] as any;
      const file = file_box.raw;
      file_list.push(file);
      const file_url = URL.createObjectURL(file);
      console.log(file_url);
      message_info.content.push({
        type: "image_url",
        image_url: {
          url: file_url,
        },
      });
    }
  }
  // console.log(messages.value);

  messages.value.push(message_info);
  fileList.value = [];
  sendFlag.value = false;
  const chat_message_id = Date.now();
  const remessage_data = {
    role: "assistant",
    content: "",
    id: chat_message_id,
  };
  messages.value.push(remessage_data);
  // 发送消息到后端
  try {
    sendMsg(
      inputMessage.value,
      selectedModel.value,
      currentChatId.value,
      file_list as any,
      (data) => {
        // 将消息同步到页面上
        const targetMessage = messages.value.find(
          (msg: any) => msg.id === chat_message_id
        );
        if (targetMessage) {
          targetMessage.content += data;
          // console.log(targetMessage.content);
          
        }
        nextTick(() => {
          if (messagesContainer.value) {
            messagesContainer.value.scrollTop =
              messagesContainer.value.scrollHeight;
          }
        });
      },
      (success,text) => {
        // console.log(success);
        const targetMessage = messages.value.find(
          (msg: any) => msg.id === chat_message_id
        );
        // console.log(success);
        
        if (targetMessage) {
          targetMessage.content =text+ marked(success);
        }
        sendFlag.value = true;
      }
    );
  } catch (error) {
    console.log(error);
    sendFlag.value = true;
  }
  inputMessage.value = "";

  // 滚动到底部
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};
</script>

<style scoped>
.chat-container {
  display: flex;
  height: 100vh;
  background-color: #141414;
}

.left-sidebar {
  width: 280px;
  background-color: #1f1f1f;
  padding: 24px;
  display: flex;
  flex-direction: column;
  border-right: 2px solid #2d2d2d;
  box-shadow: 4px 0 12px rgba(0, 0, 0, 0.3);
}

.new-chat-btn {
  width: 100%;
  margin-bottom: 24px;
  background-color: #4caf50;
  border: none;
  font-weight: bold;
}

.chat-history {
  flex: 1;
  overflow-y: auto;
}

.chat-item {
  padding: 12px 16px;
  margin: 8px 0;
  color: #e0e0e0;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.chat-item:hover {
  background-color: #2d2d2d;
  border-color: #3d3d3d;
}

.chat-item.active {
  background-color: #2d2d2d;
  border-color: #4caf50;
  color: #ffffff;
}

.right-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  background-color: #1a1a1a;
}

.user-info {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 12px;
  gap: 12px;
  background-color: #1f1f1f;
  border-radius: 12px;
  margin-bottom: 20px;
}

.user-info span {
  color: #e0e0e0;
  font-size: 15px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background-color: #141414;
  border-radius: 12px;
  margin: 20px 0;
  border: 2px solid #2d2d2d;
}
.no-message {
  color: #fff;
  width: 80%;
  margin: 0 auto;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  margin-top: 100px;
  border: 1px solid #3d3d3d;
  padding: 30px 10px;
  border-radius: 12px;
  background-color: #2d2d2d;
}

.message {
  margin: 16px 0;
  padding: 16px;
  border-radius: 12px;
  max-width: 80%;
  position: relative;
  display: inline-block;
}

.message.user {
  background-color: #4caf50;
  margin-left: auto;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
}

.message.assistant {
  background-color: #2d2d2d;
  margin-right: auto;
  color: #ffffff;

  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border: 1px solid #3d3d3d;
}

.message.assistant .text-info {
  color: red !important;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.text-content {
  white-space: pre-wrap;
}

.image-content {
  max-width: 500px;
  border-radius: 8px;
  margin: 8px 0;
}

.chat-input-area {
  background-color: #1f1f1f;
  padding: 24px;
  border-radius: 16px;
  border: 2px solid #2d2d2d;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.operation-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  align-items: center;
  padding: 0 8px;
}

.model-select {
  width: 140px;
  background: #2d2d2d;
  border-radius: 8px;
}
.files {
  display: flex;
  color: #fff;
  div {
    margin-right: 20px;
    font-size: 13px;
  }
}

.upload-btn {
  background: #4caf50;
  border: none;
}

.input-actions {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  background: #2d2d2d;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #3d3d3d;
}

.message-input {
  flex: 1;
  background: transparent;
}

.send-btn {
  height: 40px;
  padding: 0 24px;
  background: #4caf50;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
}

.send-icon {
  font-size: 16px;
}

:deep(.el-input__inner) {
  border-radius: 8px;
  background: #2d2d2d;
  border: 1px solid #3d3d3d;
  color: #ffffff;
}

:deep(.el-textarea__inner) {
  border-radius: 8px;
  resize: none;
  background: #2d2d2d;
  border: 1px solid #3d3d3d;
  color: #ffffff;
}

.upload-component {
  display: inline-block;
}

.cursor {
  display: inline-block;
  width: 2px;
  height: 16px;
  background: #ffffff;
  margin-left: 4px;
  animation: blink 1s infinite;
  vertical-align: middle;
}

@keyframes blink {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>

from volcenginesdkarkruntime import Ark

client = Ark(
    base_url="https://ark.cn-beijing.volces.com/api/v3",
    api_key="26993dd5-7997-4029-8b75-1ffd33abab62"
)

# Non-streaming:
print("----- standard request -----")
completion = client.chat.completions.create(
    model="ep-20250102142238-88hxn",
    messages = [
        {"role": "user", "content": "https://cdn.pixabay.com/photo/2023/10/30/05/19/sunflowers-8351807_1280.jpg 这个是什么花"},
    ],
    # 免费开启推理会话应用层加密，访问 https://www.volcengine.com/docs/82379/1389905 了解更多
    extra_headers={'x-is-encrypted': 'true'},
)
print(completion.choices[0].message.content)

# # Streaming:
# print("----- streaming request -----")
# stream = client.chat.completions.create(
#     model="ep-20250102142238-88hxn",
#     messages = [
#         {"role": "system", "content": "你是豆包，是由字节跳动开发的 AI 人工智能助手"},
#         {"role": "user", "content": "常见的十字花科植物有哪些？"},
#     ],
#     # 免费开启推理会话应用层加密，访问 https://www.volcengine.com/docs/82379/1389905 了解更多
#     extra_headers={'x-is-encrypted': 'true'},
#     stream=True
# )
# for chunk in stream:
#     if not chunk.choices:
#         continue
#     print(chunk.choices[0].delta.content, end="")
# print()
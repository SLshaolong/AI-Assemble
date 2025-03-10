from openai import OpenAI
from ai.util import save_chat_data, markdown_to_html


def ali_chat(token, msg, base64_arr, stream, chat_id, chat_data):
    try:
        client = OpenAI(
            # 若没有配置环境变量，请用百炼API Key将下行替换为：api_key="sk-xxx",
            api_key=token["api_key"],
            base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
        )
        messages = chat_data.get("messages", [])
        if "messages" not in chat_data:
            chat_data["messages"] = []
        messages.append({"role": "user", "content": [{"type": "text", "text": msg}]})
        if base64_arr:
            image_contents = [
                {"type": "image_url", "image_url": {"url": base64_str}}
                for base64_str in base64_arr
            ]
            messages[-1]["content"].extend(image_contents)
            # messages[-1]["content"] += json.dumps(image_contents)
        print(messages)
        if stream:
            # 启用流式传递
            completion = client.chat.completions.create(
                model=token["model_name"],
                messages=messages,
                stream=True,  # 开启流式传递
            )
            response = ""
            for chunk in completion:
                response += chunk['choices'][0]['delta']['content']
                print(response)
            return response
        completion = client.chat.completions.create(
            model=token["model_name"],  # 此处以 deepseek-r1 为例，可按需更换模型名称。
            messages=messages
        )
        if chat_id:
            chat_data["messages"].append({"role": "assistant", "content": completion.choices[0].message.content})
            save_chat_data(chat_id, chat_data)
        return markdown_to_html(completion.choices[0].message.content)
    except Exception as e:
        print(e)
        return str(e)
from volcenginesdkarkruntime import Ark

from ai.util import save_chat_data, markdown_to_html


def bianxie(token, msg, base64_arr, chat_id, chat_data):
    try:
        client = Ark(
            base_url="https://api.bianxie.ai/v1",
            api_key=token["api_key"]
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
        # print(messages)

        completion = client.chat.completions.create(
            model=token["model_name"],  # 此处以 deepseek-r1 为例，可按需更换模型名称。
            messages=messages
        )
        if chat_id:
            chat_data["messages"].append({"role": "assistant", "content": completion.choices[0].message.content})
            save_chat_data(chat_id, chat_data)
        return markdown_to_html(completion.choices[0].message.content)
    except Exception as e:
        return str(e)

from openai import OpenAI
from ai.util import save_chat_data, markdown_to_html
class ChatBaseUrls:
    ALI_BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1"
    HS_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3"
    BIANXIE_BASE_URL = "https://api.bianxie.ai/v1"


def use_chat(url,token, msg, base64_arr, chat_id, chat_data, stream=False):
    try:
        client = OpenAI(
            api_key=token["api_key"],
            base_url=url,
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

        completion = client.chat.completions.create(
            model=token["model_name"],
            messages=messages,
            stream=stream
        )
        if stream:
            return {
                "status": "success",
                "message": completion,
                "chat_id": chat_id,
                "chat_data": chat_data
            }
        if chat_id:
            chat_data["messages"].append({"role": "assistant", "content": completion.choices[0].message.content})
            save_chat_data(chat_id, chat_data)

        return markdown_to_html(completion.choices[0].message.content)
    except Exception as e:
        print(e)
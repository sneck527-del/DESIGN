from openai import OpenAI
import sys
if sys.platform.startswith('win'):
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# 初始化火山方舟Coding Plan客户端
client = OpenAI(
    api_key="ark-e78e09ef-81c5-4843-b4b5-8a000b76ba57-4f809",
    base_url="https://ark.cn-beijing.volces.com/api/coding/v3"
)

try:
    # 测试纯文本请求，验证API连通性
    response = client.chat.completions.create(
        model="doubao-seed-code-preview-latest",
        messages=[
            {
                "role": "user",
                "content": "你好，请返回一句话测试连通性"
            }
        ],
        max_tokens=100
    )
    
    print("[OK] API测试成功！返回结果：")
    print(response.choices[0].message.content)
    
except Exception as e:
    print("[ERROR] API测试失败！错误信息：")
    import traceback
    traceback.print_exc()

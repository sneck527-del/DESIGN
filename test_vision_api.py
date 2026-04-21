from openai import OpenAI
import base64
import sys
from PIL import Image
import io

if sys.platform.startswith('win'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# 初始化火山方舟Coding Plan客户端
client = OpenAI(
    api_key="ark-e78e09ef-81c5-4843-b4b5-8a000b76ba57-4f809",
    base_url="https://ark.cn-beijing.volces.com/api/coding/v3"
)

# 创建一个简单的测试图片（用蓝色填充的100x100图片）
def create_test_image():
    img = Image.new('RGB', (200, 200), color='blue')
    buf = io.BytesIO()
    img.save(buf, format='JPEG')
    return base64.b64encode(buf.getvalue()).decode('utf-8')

try:
    # 测试图片理解
    test_base64 = create_test_image()
    
    print("[OK] 正在测试多模态调用...")
    
    response = client.chat.completions.create(
        model="doubao-seed-code-preview-latest",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{test_base64}"
                        }
                    },
                    {
                        "type": "text",
                        "text": "请描述这张图片"
                    }
                ]
            }
        ],
        max_tokens=100
    )
    
    print("[OK] 多模态API调用成功！返回结果：")
    print(response.choices[0].message.content)
    
except Exception as e:
    print("[ERROR] 多模态API调用失败！")
    import traceback
    traceback.print_exc()

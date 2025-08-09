#!/usr/bin/env python3
"""
快速测试SSE端点的脚本
"""
import requests
import json
import time

def test_sse_endpoint():
    """测试SSE聊天端点"""
    url = "http://localhost:8000/api/chat/stream"
    
    print("🧪 测试 SSE 聊天端点...")
    print("=" * 50)
    
    # 测试消息
    test_message = "你好，请介绍一下你的功能"
    
    payload = {
        "message": test_message
    }
    
    print(f"📤 发送消息: {test_message}")
    print("-" * 30)
    
    try:
        # 发送POST请求并获取流式响应
        response = requests.post(
            url, 
            json=payload, 
            stream=True,
            headers={"Accept": "text/event-stream"}
        )
        
        if response.status_code == 200:
            print("✅ 连接成功！接收流式响应...")
            print()
            
            # 解析SSE数据
            for line in response.iter_lines(decode_unicode=True):
                if line.startswith('data: '):
                    try:
                        data = json.loads(line[6:])  # 去掉 'data: ' 前缀
                        
                        if data['type'] == 'thinking':
                            print(f"🤔 {data['content']}")
                        elif data['type'] == 'content':
                            print(f"💬 {data['content']}", end="", flush=True)
                        elif data['type'] == 'done':
                            print(f"\n✅ 响应完成！")
                            if 'result' in data:
                                print(f"📊 结果: {json.dumps(data['result'], indent=2, ensure_ascii=False)}")
                            break
                        elif data['type'] == 'error':
                            print(f"❌ 错误: {data['content']}")
                            break
                            
                    except json.JSONDecodeError as e:
                        print(f"⚠️ 解析JSON失败: {line}")
                        
        else:
            print(f"❌ 请求失败: {response.status_code}")
            print(f"响应: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ 连接失败！请确保后端服务正在运行在 http://localhost:8000")
    except Exception as e:
        print(f"❌ 测试失败: {e}")

def test_health_check():
    """测试健康检查端点"""
    print("\n🏥 测试健康检查端点...")
    print("=" * 30)
    
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ 后端服务正常运行")
            print(f"📊 响应: {response.json()}")
        else:
            print(f"⚠️ 健康检查返回: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ 无法连接到后端服务")
        return False
    except Exception as e:
        print(f"❌ 健康检查失败: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 AI Hot Topic Tracker - SSE 测试脚本")
    print("=" * 50)
    
    # 先检查后端是否运行
    if test_health_check():
        print()
        test_sse_endpoint()
    else:
        print("\n💡 请先启动后端服务:")
        print("   cd backend")
        print("   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload")
    
    print("\n" + "=" * 50)
    print("🎯 测试完成！")

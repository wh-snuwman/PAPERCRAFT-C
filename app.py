from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


@app.get("/")
def read_index():
    index_path = os.path.join(BASE_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"error": "index.html 파일을 찾을 수 없습니다. 경로를 확인하세요."}

# 2. 핵심 하위 폴더들을 통째로 마운트 (정적 파일 서빙 배관 연결)
# 브라우저가 /src/... 또는 /wingAPI/... 로 요청하면 파이썬이 그 내부 폴더를 그대로 열어줍니다.
app.mount("/src", StaticFiles(directory=os.path.join(BASE_DIR, "src")), name="src")
app.mount("/wingAPI", StaticFiles(directory=os.path.join(BASE_DIR, "wingAPI")), name="wingAPI")

if __name__ == '__main__':
    import uvicorn
    print("PAPERCRAFT FastAPI 웹 서버를 시작합니다... (Port: 8080)")
    uvicorn.run("app:app", host="127.0.0.1", port=8080, reload=True)
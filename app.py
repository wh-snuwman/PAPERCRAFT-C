from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 1. 메인 페이지 전용 라우트
@app.get("/")
def read_index():
    index_path = os.path.join(BASE_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"error": "index.html 파일을 찾을 수 없습니다."}

# 2. 정적 파일 경로 분리 (충돌 방지)
# 기존 app.mount("/", ...) 를 완전히 지우고 아래 두 줄로 대체합니다.
app.mount("/src", StaticFiles(directory=os.path.join(BASE_DIR, "src")), name="src")
app.mount("/wingAPI", StaticFiles(directory=os.path.join(BASE_DIR, "wingAPI")), name="wingAPI")

if __name__ == '__main__':
    import uvicorn
    # 코드 수정 시 자동 반영되도록 reload=True 권장
    uvicorn.run("app:app", host="127.0.0.1", port=8080, reload=True)
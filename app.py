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
    return {"error": "index.html 파일을 찾을 수 없습니다."}

app.mount("/src", StaticFiles(directory=os.path.join(BASE_DIR, "src")), name="src")
app.mount("/wingAPI", StaticFiles(directory=os.path.join(BASE_DIR, "wingAPI")), name="wingAPI")
app.mount("/phi", StaticFiles(directory=os.path.join(BASE_DIR, "phi")), name="phi")

if __name__ == '__main__':
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8080, reload=True)
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

@app.get("/")
def read_index():
    index_path = os.path.join(BASE_DIR, "index.html")
    return FileResponse(index_path)

app.mount("/", StaticFiles(directory=BASE_DIR, html=True), name="static")

if __name__ == '__main__':
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8080, reload=False)
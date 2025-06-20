from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from scraper import stream_scraper

app = FastAPI()

@app.get("/")
def root():
    return {"message": "OneFootball DFS Summarizer API "}

@app.get("/scrape")
def scrape_articles():
    return StreamingResponse(stream_scraper(), media_type="text/event-stream")


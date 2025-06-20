# OneFootball DFS Summarizer

A web scraper and summarization API for OneFootball articles. This project uses Node.js (Puppeteer) to crawl and extract football news articles from [onefootball.com](https://onefootball.com), and Python (FastAPI + LangChain) to provide a summarization API. The Node.js scraper sends article text to the Python API for summarization.

## Features
- Scrapes top articles and related news from OneFootball using Puppeteer
- Recursively follows related articles up to a configurable depth
- Stores extracted content and metadata in structured JSON files
- **Summarizes articles using a Python FastAPI service with LangChain and Groq**
- Provides a FastAPI server with endpoints to summarize articles

## Project Structure
```
├── main.py                # (Optional) FastAPI server entry
├── langchain_summarizer.py # Python summarization API (FastAPI + LangChain)
├── scraper.py             # Python bridge to Node.js scraper
├── oneFootballScraper.js  # Puppeteer-based scraper (Node.js)
├── requirements.txt       # Python dependencies
├── onefootball/
│   └── articles/          # Scraped articles and related data
```

## Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm (for installing Node.js dependencies)
- A Groq AI API key (for summarization)

### 1. Clone the repository
```bash
git clone <repo-url>
cd oneFootballScraper
```

### 2. Install Python dependencies
```bash
pip install -r requirements.txt
```

### 3. Install Node.js dependencies
```bash
npm install puppeteer dotenv axios
```

### 4. Set up environment variables for Python
Create a `.env` file in the project root with your API key:
```
GROQ_API_KEY=your_groq_api_key_here
```

### 5. Start the Python FastAPI summarization server
Make sure your `.env` is present, then run:
```bash
uvicorn langchain_summarizer:app --host 0.0.0.0 --port 8000 --reload
```

### 6. Start the Node.js scraper
In a new terminal:
```bash
node oneFootballScraper.js
```

The Node.js scraper will send article text to the Python API for summarization and save the results.

## API Endpoints
- `POST /summarize` (Python FastAPI) — Receives `{ "article_text": "..." }` and returns `{ "summary": "..." }`

## Output Format
Each article and its related articles are saved in nested directories, each containing a `metadata.json` file:

```json
{
  "title": "...",
  "link": "...",
  "content": "...full article text...",
  "summary": "...summary or error message..."
}
```

## Environment Variables
- `GROQ_API_KEY` — For summarization (set in `.env` for Python)

## Dependencies
- **Python:** fastapi, uvicorn, python-dotenv, langchain, langchain_groq
- **Node.js:** puppeteer, dotenv, axios

## License
MIT

## Acknowledgements
- [OneFootball](https://onefootball.com) for the source content

## Notes
- The Node.js code no longer uses the Groq SDK directly. All summarization is handled by the Python FastAPI service using LangChain.
- Ensure the Python server is running before starting the Node.js scraper. 
# OneFootball DFS Summarizer

A web scraper and summarization API for OneFootball articles. This project uses Node.js (Puppeteer) to crawl and extract football news articles from [onefootball.com](https://onefootball.com), and Python (FastAPI) to provide a streaming API for triggering scrapes and retrieving results. Optionally, it can summarize articles using Groq AI models.

## Features
- Scrapes top articles and related news from OneFootball using Puppeteer
- Recursively follows related articles up to a configurable depth
- Stores extracted content and metadata in structured JSON files
- (Optional) Summarizes articles using Groq AI models
- Provides a FastAPI server with endpoints to trigger scraping and stream results

## Project Structure
```
├── main.py                # FastAPI server
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
npm install puppeteer dotenv groq-sdk
```

### 4. Set up environment variables
Create a `.env` file in the project root with your API keys:
```
GROK_AI_API=your_groq_api_key_here        # For summarization
```

## Usage

### Start the FastAPI server
```bash
uvicorn main:app --reload
```

### Trigger a scrape
- Open [http://localhost:8000/scrape](http://localhost:8000/scrape) in your browser or use `curl`:
  ```bash
  curl http://localhost:8000/scrape
  ```
- The scraper will run, and output will be streamed as text events.
- Scraped articles are saved under `onefootball/articles/` in nested folders.

### API Endpoints
- `GET /` — Health check, returns a status message.
- `GET /scrape` — Starts the scraper and streams logs/results as Server-Sent Events (SSE).

## Output Format
Each article and its related articles are saved in nested directories, each containing a `metadata.json` file:

```json
{
  "title": "Is Bayern Munich v Boca Juniors on TV? How to watch Club World Cup game for free",
  "link": "https://onefootball.com/en/news/is-bayern-munich-v-boca-juniors-on-tv-how-to-watch-club-world-cup-game-for-free-41268431",
  "content": "...full article text...",
  "summary": "...summary or error message..."
}
```

## Environment Variables
- `GROK_AI_API` — For summarization

## Dependencies
- **Python:** fastapi, uvicorn, python-dotenv
- **Node.js:** puppeteer, dotenv, groq-sdk

## License
MIT

## Acknowledgements
- [OneFootball](https://onefootball.com) for the source content

## Summarization Provider Configuration

The code uses Groq AI for summarization. Make sure to set the corresponding API key in your `.env` file.

**Environment Variables:**
- `GROK_AI_API` — For summarization

**Dependencies:**
- `groq-sdk` (for Groq AI) 
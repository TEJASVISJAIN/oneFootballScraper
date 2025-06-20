import subprocess
import os
import uuid

def stream_scraper():
    run_id = uuid.uuid4().hex[:8]
    yield f"🔄 Starting scraper run: {run_id}\n"

    # Absolute path to the JS file
    scraper_path = os.path.join(os.path.dirname(__file__), "oneFootballScraper.js")

    process = subprocess.Popen(
        ["node", scraper_path],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        universal_newlines=True,
        env={**os.environ, "OPENAI_API_KEY": os.getenv("OPENAI_API_KEY", "")}
    )

    for line in process.stdout:
        yield line

    process.stdout.close()
    process.wait()
    yield f"\n✅ Scraper finished with exit code {process.returncode}"

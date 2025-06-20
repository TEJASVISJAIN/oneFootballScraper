const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const MAX_DEPTH = 2;
const BASE_DIR = path.join(__dirname, "onefootball", "articles");

require("dotenv").config();
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROK_AI_API });

// Delay helper
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const extractContentAndRelated = async (page, url) => {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });

    // Wait for main content
    await page.waitForSelector(
      "div.ArticleParagraph_articleParagraph__MrxYL p",
      { timeout: 10000 }
    );

    // Wait for related links (gracefully fail if not found within 5s)
    await page
      .waitForSelector("ul.RelatedNews_list__4KkTT", { timeout: 5000 })
      .catch(() => {});

    const content = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll(
          "div.ArticleParagraph_articleParagraph__MrxYL p"
        )
      )
        .map((p) => p.innerText.trim())
        .join("\n\n")
    );

    const relatedLinks = await page.evaluate(() => {
      const items = document.querySelectorAll(
        "ul.RelatedNews_list__4KkTT li a"
      );
      return Array.from(items)
        .slice(0, 5)
        .map((a) => ({
          title: a.querySelector("p")?.innerText.trim() || "Untitled",
          link: a.href.startsWith("http")
            ? a.href
            : `https://onefootball.com${a.getAttribute("href")}`,
        }));
    });

    return { content, relatedLinks };
  } catch (err) {
    console.error(`❌ Failed to extract from ${url}: ${err.message}`);
    return { content: "", relatedLinks: [] };
  }
};

const summarizeWithGroq = async (text) => {
  try {
    const trimmed = text.slice(0, 3000); // safe limit
    const prompt = `Summarize the following football article in 3-5 bullet points:\n\n${trimmed}`;

    const response = await groq.chat.completions.create({
      messages: [
        { role: "user", content: prompt }
      ],
      model: "llama3-8b-8192",
    });

    return response.choices?.[0]?.message?.content || "No summary returned.";
  } catch (err) {
    console.error("❌ Groq summarization failed:", err.message);
    return "Summary generation failed.";
  }
};

const saveArticle = (dir, data) => {
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, "metadata.json");
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const dfs = async (browser, node, depth, dir) => {
  if (depth > MAX_DEPTH) return;

  const page = await browser.newPage();
  const { content, relatedLinks } = await extractContentAndRelated(
    page,
    node.link
  );
  await page.close();

  // Use Groq for summarization
  const summary = await summarizeWithGroq(content);

  saveArticle(dir, {
    title: node.title,
    link: node.link,
    content,
    summary,
  });

  // Print article info to stdout
  console.log(`\n=== Article Processed ===`);
  console.log(`Title: ${node.title}`);
  console.log(`Summary: ${summary}`);
  console.log(`Link: ${node.link}`);
  console.log(`Content: ${content}`);
  if (relatedLinks && relatedLinks.length > 0) {
    console.log('Related Articles:');
    relatedLinks.forEach((rel, idx) => {
      console.log(`  ${idx + 1}. ${rel.title} - ${rel.link}`);
    });
  } else {
    console.log('Related Articles: None');
  }

  for (let i = 0; i < (depth === 0 ? 5 : 2) && i < relatedLinks.length; i++) {
    const child = relatedLinks[i];
    const childDir = path.join(
      dir,
      `related_${String(i + 1).padStart(2, "0")}`
    );
    await dfs(browser, child, depth + 1, childDir);
  }
};

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1920, height: 1080 },
  });
  const page = await browser.newPage();

  await page.goto("https://onefootball.com/en/home", {
    waitUntil: "networkidle2",
  });
  await page.waitForSelector("ul.Gallery_galleryItems__o8vSf");

  const topArticles = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll("ul.Gallery_galleryItems__o8vSf li")
    )
      .slice(0, 5)
      .map((item) => {
        const title =
          item
            .querySelector("p.NewsTeaser_teaser__title__OsMxr")
            ?.innerText.trim() || "Untitled";
        const link =
          item.querySelector("a.NewsTeaser_teaser__content__BP26f")?.href || "";
        return { title, link };
      })
      .filter((a) => a.title && a.link);
  });

  for (let i = 0; i < topArticles.length; i++) {
    const rootArticle = topArticles[i];
    const rootDir = path.join(BASE_DIR, String(i + 1).padStart(3, "0"));
    console.log(`📄 DFS from root article ${i + 1}: ${rootArticle.title}`);
    await dfs(browser, rootArticle, 0, rootDir);
  }

  console.log("✅ DFS Scraping Completed.");
  await browser.close();
})();

import os
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama3-8b-8192")

SUMMARY_PROMPT = PromptTemplate(
    input_variables=["article_text"],
    template="""
Summarize the following football article in 3-5 bullet points:

{article_text}
"""
)

def get_groq_llm():
    return ChatGroq(
        model=GROQ_MODEL,
        temperature=0.2,
        api_key=GROQ_API_KEY
    )

def summarize_article(article_text: str) -> str:
    llm = get_groq_llm()
    prompt = SUMMARY_PROMPT.format(article_text=article_text)
    messages = [
        ("system", "You are a helpful assistant that summarizes football articles in bullet points."),
        ("human", prompt)
    ]
    response = llm.invoke(messages)
    return getattr(response, "content", str(response)).strip() 
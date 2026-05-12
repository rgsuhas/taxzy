import logging
import sys
from contextlib import asynccontextmanager

# pyrefly: ignore [missing-import]
from fastapi import FastAPI
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware

from core.database import Base, engine

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s %(name)s | %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
    stream=sys.stdout,
)
logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("google_genai").setLevel(logging.WARNING)
logging.getLogger("google.auth").setLevel(logging.WARNING)
import models.user  # noqa: F401 — ensure all models are registered before create_all
import models.conversation  # noqa: F401
import models.message  # noqa: F401
import models.tax_profile  # noqa: F401
import models.document  # noqa: F401
import models.marketplace  # noqa: F401

from routers import auth, chat, tax_profile, documents, pan, itr, marketplace, refund, tax_usage, glossary

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Taxzy",
    description="AI-powered Indian tax filing assistant",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(tax_profile.router)
app.include_router(documents.router)
app.include_router(pan.router)
app.include_router(itr.router)
app.include_router(marketplace.router)
app.include_router(refund.router)
app.include_router(tax_usage.router)
app.include_router(glossary.router)


@app.get("/")
def root():
    return {"message": "Taxzy backend", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}

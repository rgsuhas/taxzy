from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.database import Base, engine
import models.user  # noqa: F401 — ensure all models are registered before create_all
import models.conversation  # noqa: F401
import models.message  # noqa: F401
import models.tax_profile  # noqa: F401
import models.document  # noqa: F401
import models.marketplace  # noqa: F401

from routers import auth, chat, tax_profile, documents, pan, itr, marketplace, refund, tax_usage, glossary

app = FastAPI(
    title="TaxEase AI",
    description="AI-powered Indian tax filing assistant",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)


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
    return {"message": "TaxEase AI backend", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}

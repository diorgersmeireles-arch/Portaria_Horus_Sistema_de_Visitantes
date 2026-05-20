from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, checkin

app = FastAPI(
    title="Portaria HÓRUS API",
    description="API para sistema de portaria escolar",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especificar os domínios
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(checkin.router)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "horus-api"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
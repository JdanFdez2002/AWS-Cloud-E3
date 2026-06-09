from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv
from app.models import UploadRequest
from app.config.s3_client import s3_client
import os

load_dotenv()

app = FastAPI()


@app.get("/healthz")
def health():
    return {"status": "ok"}


@app.post("/api/upload/presigned-url")
def generate_presigned_url(data: UploadRequest):

    allowed_types = [
        "application/pdf",
        "text/csv"
    ]

    if data.fileType not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Tipo de archivo no permitido"
        )

    MAX_SIZE = 22 * 1024 * 1024

    if data.fileSize > MAX_SIZE:
        raise HTTPException(
            status_code=400,
            detail="El archivo supera el límite de 22 MB"
        )

    key = f"uploads/{data.fileName}"

    try:
        presigned_url = s3_client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": os.getenv("S3_BUCKET_NAME"),
                "Key": key,
                "ContentType": data.fileType
            },
            ExpiresIn=300
        )

        return {
            "presignedUrl": presigned_url,
            "key": key
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv
from app.models import UploadRequest
from app.config.s3_client import s3_client
from fastapi.middleware.cors import CORSMiddleware
import os

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoint: Healthz
@app.get("/healthz")
def health():
    return {"status": "ok"}

# Endpoint: Presigned URL
@app.post("/api/upload/presigned-url")
def generate_presigned_url(data: UploadRequest):

    allowed_types = [
        "application/pdf",
        "text/csv",
        "application/vnd.ms-excel"
        
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
    

# Endpoint Get files: 
@app.get("/api/files")
def list_files():

    try:
        response = s3_client.list_objects_v2(
            Bucket=os.getenv("S3_BUCKET_NAME"),
            Prefix="uploads/"
        )

        files = []

        for obj in response.get("Contents", []):
            
            if obj["Key"] == "uploads/":  #para que no cuente la carpeta uploads xD
                continue

            files.append({
                "key": obj["Key"],
                "size": obj["Size"],
                "lastModified": obj["LastModified"]
            })

        return files

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    

#Endpoint DELETE:
@app.delete("/api/files/{key:path}")
def delete_file(key: str):

    try:

        s3_client.delete_object(
            Bucket=os.getenv("S3_BUCKET_NAME"),
            Key=key
        )

        return {
            "message": "Archivo eliminado"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
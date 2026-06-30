from fastapi import FastAPI, HTTPException # HTTPException para manejar errores HTTP personalizados SEC-07
from dotenv import load_dotenv # carga variables de entorno archivo .env SEC-01
from app.models import UploadRequest # carga el modelo de models.py 
from app.config.s3_client import s3_client # carga las credenciales para el S3
from app.config.dynamodb import table
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware # Conecta el puerto 5173 y FastAPI SEC-02
import os

load_dotenv() # Carga variables del venv
app = FastAPI() # Iniciamos FastAPI


# conf CORS: Comunicación frontend(5173)-backend(FApi)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True, # Permite enviar las credenciales en las solicitudes
    allow_methods=["*"], # Todo HTTP, Get,Post,Delete, etc
    allow_headers=["*"], # cualquier encabezado HTTP
)

# E.P:Se usa para ver que todo esté bien (Requisito)
@app.get("/healthz")
def health():
    return {"status": "ok"}

# E.P:Genera la presigned url (temporal) Sec-03
@app.post("/api/upload/presigned-url")
def generate_presigned_url(data: UploadRequest):
    allowed_types = [
        "application/pdf",
        "text/csv",
        "application/vnd.ms-excel" # Se usa igual porque el navegador windows identifica a veces el csv asi
    ]

    # Verificar formato
    if data.fileType not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Tipo de archivo no permitido"
        )

    MAX_SIZE = 22 * 1024 * 1024 # Variable de tamaño máximo permitido para archivos (22 MB, Requerimiento)

    if data.fileSize > MAX_SIZE:
        raise HTTPException(
            status_code=400,
            detail="El archivo supera el límite de 22 MB"
        )


    # Define la ruta donde se almacenará el archivo dentro del bucket S3
    key = f"uploads/{data.fileName}"


    try:
        # Genera una URL temporal de subida hacia Amazon S3
        # Esta URL permite al frontend subir el archivo sin exponer credenciales AWS
        presigned_url = s3_client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": os.getenv("S3_BUCKET_NAME"), # Bucket donde se almacenará el archivo
                "Key": key, # Ruta/nombre del archivo dentro del bucket
                "ContentType": data.fileType # Tipo MIME del archivo
            },
            ExpiresIn=300 # Tiempo de expiración de la URL (300 segundos = 5 minutos)
        )
        table.put_item(
            Item={
                "key": key,
                "fileName": data.fileName,
                "fileType": data.fileType,
                "fileSize": data.fileSize,
                "createdAt": datetime.utcnow().isoformat()
            }
        )

        # Devuelve la URL generada y la ubicación del archivo en S3
        return {
            "presignedUrl": presigned_url,
            "key": key
        }


    # Captura cualquier error inesperado durante la conexión o generación de URL
    except Exception as e:
        print("ERROR: ",repr(e))
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

#E.P: obtener lista de archivos en mi S3
@app.get("/api/files")
def list_files():
    try:
        response = s3_client.list_objects_v2( # Solicita a S3 todos los objetos existentes dentro de mi carpeta uploads/
            Bucket=os.getenv("S3_BUCKET_NAME"),
            Prefix="uploads/"
        )

        files = [] # Lista donde se guarda la info de PDFs/CSVs encontrados

        # Recorrer y guardar
        for obj in response.get("Contents", []): #Diccio
            if obj["Key"] == "uploads/":# Ignora la carpeta "uploads/" para que no aparezca como archivo
                continue
            files.append({  # Guarda la info para mandarla al Front
                "key": obj["Key"], # Key
                "size": obj["Size"], # Peso en mb
                "lastModified": obj["LastModified"] #TimeStamp
            })
        return files


    # Manejo de errores relacionados con S3 u otros problemas internos
    except Exception as e:
        print("ERROR: ",repr(e))
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

#E.P: Eliminar archivo en mi S3
@app.delete("/api/files/{key:path}")
def delete_file(key: str):
    try:
        # Elimina el objeto indicado dentro del bucket S3
        s3_client.delete_object(
            Bucket=os.getenv("S3_BUCKET_NAME"),
            Key=key
        )
        table.delete_item(
            Key={
                "key": key
            }
        )
        # Respuesta confirmando la eliminación correcta
        return {
            "message": "Archivo eliminado"
        }
    # Manejo de errores durante la eliminación del archivo
    except Exception as e:
        print("ERROR: ",repr(e))
        raise HTTPException(
            status_code=500, # "Internal Server Error"
            detail=str(e)
        )
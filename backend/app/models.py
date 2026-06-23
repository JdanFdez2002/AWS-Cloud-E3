from pydantic import BaseModel

# Modelo para validar la información recibida al solicitar la subida de un archivo Sec-03
class UploadRequest(BaseModel):
    fileName: str
    fileType: str
    fileSize: int
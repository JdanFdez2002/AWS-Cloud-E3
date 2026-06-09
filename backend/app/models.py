from pydantic import BaseModel

class UploadRequest(BaseModel):
    fileName: str
    fileType: str
    fileSize: int
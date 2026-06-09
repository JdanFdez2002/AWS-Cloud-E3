from fastapi import FastAPI
from dotenv import load_dotenv

from app.config.s3_client import s3_client

load_dotenv()

app = FastAPI()

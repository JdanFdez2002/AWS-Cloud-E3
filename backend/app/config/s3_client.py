from dotenv import load_dotenv # Credenciales del .env SEC-01
import boto3 # Conectarse a AWS
import os

load_dotenv() # Carga las credenciales

#.env
s3_client = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    aws_session_token=os.getenv("AWS_SESSION_TOKEN"),
    region_name=os.getenv("AWS_REGION")
)
# ArchivaCloud - Proyecto de Gestión Documental

**Código de Pareja:** P-10 [1]

**Integrante:** Jordán Stevens Fernandez Mora

## Parámetros Únicos Respetados (Anexo B)
| requisito extra | Tipos de archivo permitidos | Tamaño máx (MB) | Nombre del bucket / región | Feature extra obligatoria |
|---|---|---|---|---|
| P-10 | PDF, CSV | 22 | archivacloud-p10-jsfm / us-east-1 | Implementar paginación en la lista cuando haya más de 10 archivos |

## Arquitectura
La aplicación utiliza URLs prefirmadas, permitiendo que el navegador suba los archivos directamente a Amazon S3 sin saturar el backend. 
*(Asegúrate de guardar la foto de tu diagrama.

## Versiones
*   **Backend:** Python 3.10+, FastAPI, Uvicorn, Boto3, Pydantic, python-dotenv
*   **Frontend:** React 18, Vite, Axios/Fetch
*   **Almacenamiento:** Amazon S3

## Variables de Entorno [2]
| Variable | Descripción | Ejemplo |
|---|---|---|
| `AWS_ACCESS_KEY_ID` | Clave de acceso del usuario IAM | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | Clave secreta del usuario IAM | `wJalrXUtnFEMI/K7MDENG/bPx...` |
| `AWS_SESSION_TOKEN` | Token de sesión temporal (si aplica) | `IQoJb3JpZ2luX2...` |
| `AWS_REGION` | Región del bucket S3 | `us-east-1` |

## Política IAM Mínima (SEC-05) [2, 6]
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::archivacloud-p10",
                "arn:aws:s3:::archivacloud-p10/*"
            ]
        }
    ]
}
```

Configuración CORS (SEC-02)
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
        "AllowedOrigins": ["http://localhost:5173"],
        "ExposeHeaders": []
    }
]
```

Pasos para Ejecutar el Proyecto

    Backend: Entra a la carpeta backend, activa tu entorno virtual, instala las dependencias con pip install -r requirements.txt y levanta el servidor con uvicorn main:app --reload.
    Frontend: Entra a la carpeta frontend, instala dependencias con npm install y levanta la interfaz con npm run dev.

Auditoría de Dependencias (SEC-09)

    pip-audit: Comando ejecutado
    Resultado: 
```Shell
Found 4 known vulnerabilities in 3 packages                                                                                                     
Name      Version ID                  Fix Versions
--------- ------- ------------------- ------------
msgpack   1.1.2   GHSA-6v7p-g79w-8964 1.2.1
pip       26.1.1  PYSEC-2026-196      26.1.2
starlette 1.2.1   CVE-2026-54283      1.3.1
starlette 1.2.1   CVE-2026-54282      1.3.0
```

    npm audit: Comando ejecutado
```Shell
PS C:\Users\M_onino\Desktop\AWS-Cloud-E3\frontend> npm audit    
found 0 vulnerabilities
```
Feature Extra: Paginación

Para cumplir con la feature P-10, modificamos el endpoint GET /api/files realizando un slice a la lista en Python para devolver un máximo de 10 archivos. En el frontend se implementaron botones de navegación para alternar entre las páginas consultadas.
Enlaces y Evidencias

    Historial de Commits Clave: https://github.com/JdanFdez2002/AWS-Cloud-E3/commits/main/
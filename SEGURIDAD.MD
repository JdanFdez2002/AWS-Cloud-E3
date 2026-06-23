# Reporte de Seguridad - Proyecto ArchivaCloud (Pareja P-10)
Este documento detalla la implementación de los 10 controles de seguridad obligatorios exigidos en la rúbrica.

## 1. SEC-01: Secretos fuera del repositorio
Se configuró un archivo `.gitignore` en la raíz del proyecto que excluye estrictamente el archivo `.env`. Esto previene la exposición de credenciales de AWS en el historial de Git. Se incluyó un archivo `.env.example` con placeholders para documentar las variables necesarias.

## 2. SEC-02: CORS restrictivo
En el backend (`main.py`), se configuró el `CORSMiddleware` de FastAPI restringiendo el parámetro `allow_origins` de forma explícita al dominio local del frontend (`http://localhost:5173`). Se evitó el uso de comodines (`*`).

## 3. SEC-03: Validación de entrada
El backend utiliza esquemas de `Pydantic` para validar los tipos de datos entrantes. Adicionalmente, se implementó la función `clean_filename` para sanitizar los nombres de los archivos y una lista blanca estricta que rechaza cualquier archivo que no sea `.pdf` o `.csv`, respetando los parámetros del P-10.

## 4. SEC-04: Límite de tamaño
Se configuró una validación tanto en el frontend como en el backend que bloquea estrictamente la subida de archivos que superen los 22 MB (23,068,672 bytes), cumpliendo con nuestro Anexo B.

## 5. SEC-05: IAM mínimo privilegio
Debido a las restricciones del entorno AWS Academy, la seguridad de acceso se gestionsa mediante credenciales temporales rotativas, las (`AWS_SESSION_TOKEN`), lo que impide crear políticas IAM personalizadas. Para cumplir con el control, el principio de mínimo privilegio se aplicó a nivel de código: el cliente `boto3` está restringido para ejecutar únicamente 4 operaciones exactas (`put_object`, `get_object`, `delete_object`, `list_objects_v2`) exclusivamente sobre el bucket `archivacloud-p10-jsfm`. La política JSON ideal que representa esta restricción fue documentada en el README.

## 6. SEC-06: S3 cerrado al público
El bucket S3 se aprovisionó con la característica "Block Public Access" activada en su totalidad [1]. No se aplican políticas de bucket permisivas; el acceso de lectura y escritura se realiza única y temporalmente a través de URLs prefirmadas.

## 7. SEC-07: Errores sin información sensible
Se envolvieron las llamadas críticas a AWS en bloques `try/except`. En caso de falla (por ejemplo, al listar archivos), la API captura el error real en consola local pero devuelve al cliente un error HTTP 502 con un mensaje genérico ("No se pudieron obtener los archivos"), evitando exponer respuestas internas de AWS.

## 8. SEC-08: Encriptación en reposo
Se validó que el bucket `archivacloud-p10-jsfm` cuenta con la encriptación por defecto de Amazon S3 (SSE-S3) activada, asegurando que los archivos se cifren al almacenarse en los discos de AWS.

## 9. SEC-09: Escaneo de dependencias
Se incluyó la herramienta `pip-audit` en el entorno de Python para rastrear vulnerabilidades en el backend, y se utilizó `npm audit` para el ecosistema React/Vite en el frontend. Los resultados evidencian un entorno libre de vulnerabilidades críticas conocidas.

## 10. SEC-10: TLS de extremo a extremo
Todas las interacciones de subida de archivos mediante URLs prefirmadas hacia Amazon S3 se realizan obligatoriamente forzando el protocolo seguro HTTPS, garantizando la encriptación en tránsito de los documentos de nuestros clientes.
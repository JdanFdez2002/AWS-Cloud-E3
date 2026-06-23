import axios from "axios"; // Peticiones HTTP al Backend
import { useState, useEffect } from "react"; // Hooks de estados y efectos React (Refresh)
import "./App.css"; // Css


function App() {
  // Estados principales del frontend
  const [file, setFile] = useState(null); // Archivo seleccionado por el usuario
  const [files, setFiles] = useState([]); // Lista de archivos obtenidos desde S3
  const [currentPage, setCurrentPage] = useState(1); // Página actual de la tabla


  // Función para subir archivos al sistema
  const uploadFile = async () => {
    // Validar que exista un archivo seleccionado
    if (!file) {
      alert("Selecciona un archivo");
      return;
    }

    // Tipos de archivos permitidos (PDF y CSV)
    const allowedTypes = [
      "application/pdf",
      "text/csv",
      "application/vnd.ms-excel"
    ];

    // Validación del formato antes de enviarlo al backend SEC-04
    if (!allowedTypes.includes(file.type)) {
      alert("Solo se permiten archivos PDF y CSV");
      return;
    }


    // Tamaño máximo permitido (22 MB)
    const MAX_SIZE = 22 * 1024 * 1024;


    // Validación de peso del archivo SEC-04
    if (file.size > MAX_SIZE) {
      alert("El archivo supera los 22 MB");
      return;
    }


    try {

      // Solicita al backend una URL temporal para subir a S3 SEC-03
      const response = await axios.post(
        "http://127.0.0.1:8000/api/upload/presigned-url",
        {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size
        }
      );


      // Obtiene la URL temporal generada por FastAPI
      const { presignedUrl } = response.data;


      // Sube directamente el archivo a S3 mediante la URL temporal
      await axios.put(
        presignedUrl,
        file,
        {
          headers: {
            "Content-Type": file.type
          }
        }
      );


      alert("Archivo subido correctamente");

      // Actualiza la lista después de subir
      loadFiles();


    } catch (error) {

      console.error(error);

      alert("Error al generar URL");
    }
  };



  // Obtiene los archivos almacenados en S3
  const loadFiles = async () => {

    try {

      const response = await axios.get(
        "http://127.0.0.1:8000/api/files"
      );


      // Guarda los archivos recibidos desde el backend
      setFiles(response.data);


      // Reinicia paginación al cargar archivos
      setCurrentPage(1);


    } catch (error) {
      console.error(error);
    }
  };



  // Elimina un archivo del bucket S3
  const deleteFile = async (key) => {

    try {

      // Envía la Key del archivo al endpoint DELETE SEC-05
      await axios.delete(
        `http://127.0.0.1:8000/api/files/${key}`
      );


      alert("Archivo eliminado");


      // Actualiza la tabla después de eliminar
      loadFiles();


    } catch (error) {

      console.error(error);

      alert("Error al eliminar archivo");
    }
  };



  // Ejecuta la carga de archivos al iniciar la página
  useEffect(() => {
    loadFiles();
  }, []);



  // Configuración de paginación
  const filesPerPage = 10;
  const indexOfLastFile = currentPage * filesPerPage;
  const indexOfFirstFile = indexOfLastFile - filesPerPage;


  // Archivos mostrados en la página actual
  const currentFiles = files.slice(
    indexOfFirstFile,
    indexOfLastFile
  );


  // Calcula cantidad total de páginas
  const totalPages = Math.ceil(
    files.length / filesPerPage
  );


  return (
    <div className="container">
      <h1 className="title">
        ArchivaCloud P-10
      </h1>
      <p className="subtitle">
        Gestión de archivos compatibilidad para : PDF y CSV
      </p>
      <div className="upload-section">
        <label className="file-label">
          Seleccionar archivo
          <input
            type="file"
            accept=".pdf,.csv" // Limita selección desde navegador
            className="file-input"
            // Guarda archivo seleccionado en el estado
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>
        <span className="file-name">
          {file ? file.name : "Ningún archivo seleccionado"}
        </span>
        <button
          className="button upload-btn"
          // Ejecuta proceso de subida
          onClick={uploadFile}
        >
          Subir archivo
        </button>
      </div>
      {/* Tabla donde se muestran los archivos almacenados */}
      <table className="table">
        <thead>
          <tr>
            <th>Archivo</th>
            <th>Tamaño</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {currentFiles.map((item) => (
            <tr key={item.key}>
              <td>
                {item.key.replace("uploads/", "")}
              </td>
              <td>
                {(item.size / 1024).toFixed(1)} KB
              </td>
              <td>
                <button
                  className="button delete-btn"
                  // Envía archivo seleccionado para eliminar
                  onClick={() => deleteFile(item.key)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Controles para cambiar páginas */}
      <div className="pagination">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ←
        </button>
        <span>
          Página {currentPage} de {totalPages || 1}
        </span>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          →
        </button>
      </div>
    </div>
  );
}


export default App;
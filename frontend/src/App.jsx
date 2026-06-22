import axios from "axios";
import { useState, useEffect } from "react";
import "./App.css";

function App() {

  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const uploadFile = async () => {

    if (!file) {
      alert("Selecciona un archivo");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "text/csv",
      "application/vnd.ms-excel"
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Solo se permiten archivos PDF y CSV");
      return;
    }

    const MAX_SIZE = 22 * 1024 * 1024;

    if (file.size > MAX_SIZE) {
      alert("El archivo supera los 22 MB");
      return;
    }

    aaaa
    try {

      const response = await axios.post(
        "http://127.0.0.1:8000/api/upload/presigned-url",
        {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size
        }
      );


      const { presignedUrl } = response.data;

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
      loadFiles();

    } catch (error) {

      console.error(error);

      alert("Error al generar URL");
    }
  };

  const loadFiles = async () => {

    try {
  
      const response = await axios.get(
        "http://127.0.0.1:8000/api/files"
      );
  
      setFiles(response.data);
  
      setCurrentPage(1);
  
    } catch (error) {
      console.error(error);
    }
  };

  const deleteFile = async (key) => {

    try {
  
      await axios.delete(
        `http://127.0.0.1:8000/api/files/${key}`
      );
  
      alert("Archivo eliminado");
  
      loadFiles();
  
    } catch (error) {
  
      console.error(error);
  
      alert("Error al eliminar archivo");
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);
  const filesPerPage = 10;

  const indexOfLastFile = currentPage * filesPerPage;
  const indexOfFirstFile = indexOfLastFile - filesPerPage;

  const currentFiles = files.slice(
    indexOfFirstFile,
    indexOfLastFile
  );

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
            accept=".pdf,.csv"
            className="file-input"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>

        <span className="file-name">
          {file ? file.name : "Ningún archivo seleccionado"}
        </span>

        <button
          className="button upload-btn"
          onClick={uploadFile}
        >
          Subir archivo
        </button>

      </div>
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
                  onClick={() => deleteFile(item.key)}
                >
                  Eliminar
                </button>

              </td>

            </tr>

          ))}

        </tbody>
      </table>

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
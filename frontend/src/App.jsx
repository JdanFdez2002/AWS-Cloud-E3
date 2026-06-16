import axios from "axios";
import { useState, useEffect } from "react";

function App() {

  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const uploadFile = async () => {

    if (!file) {
      alert("Selecciona un archivo");
      return;
    }

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
    <div style={{ padding: "20px" }}>
      <h1>ArchivaCloud P-10</h1>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={uploadFile}>
        Subir Archivo
      </button>
      <h2>Archivos</h2>
      <ul>
        {currentFiles.map((item) => (
          <li key={item.key}>
            {item.key}

            <button
              onClick={() => deleteFile(item.key)}
              style={{ marginLeft: "10px" }}
            >
              Eliminar
            </button>

          </li>
        ))}
      </ul>
      <div style={{ marginTop: "20px" }}>

        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Anterior
        </button>

        <span style={{ margin: "0 10px" }}>
          Página {currentPage} de {totalPages || 1}
        </span>

        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={
            currentPage === totalPages ||
            totalPages === 0
          }
        >
          Siguiente
        </button>

      </div>
    </div>
  );
}

export default App;
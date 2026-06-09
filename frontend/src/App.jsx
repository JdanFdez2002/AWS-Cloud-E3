import axios from "axios";
import { useState, useEffect } from "react";

function App() {

  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);


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
  
    } catch (error) {
      console.error(error);
    }
  };


  useEffect(() => {
    loadFiles();
  }, []);

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
        {files.map((item) => (
          <li key={item.key}>
            {item.key}
          </li>
        ))}
      </ul>

    </div>
  );
}

export default App;
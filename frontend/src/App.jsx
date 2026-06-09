import { useState } from "react";
import axios from "axios";

function App() {

  const [file, setFile] = useState(null);

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

    } catch (error) {

      console.error(error);

      alert("Error al generar URL");
    }
  };

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
    </div>
  );
}

export default App;
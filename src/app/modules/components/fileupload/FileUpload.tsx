import { useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import "./FileUpload.css"

const fileTypes = ["JPEG", "PNG", "GIF","DOC","DOCX","PDF"];

export const FileUploadComponent =({...props})=>{    
  const [file, setFile] = useState(null);
  const handleChange = (file) => {
    setFile(file);
  };

  
  return (
    <>
      <div className="fileupload">
        <FileUploader showIcon={false}
          multiple={false}
          handleChange={handleChange}
          name="file"
          //types={fileTypes} 
          label="Upload Files Or Drop Files"
        />
      </div>
    </>
  );
} 

export default FileUploadComponent;
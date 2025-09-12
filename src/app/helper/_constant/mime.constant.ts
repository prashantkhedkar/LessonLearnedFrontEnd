
type MIMEConstantType = {
  [key: string]: { extension: string };
};


const MIMEConstantALL: MIMEConstantType = {
  "image/jpeg": { extension: ".jpg" },
  "image/png": { extension: ".png" },
  "video/mp4": { extension: ".mp4" },
  "application/vnd.ms-excel": { extension: ".xls" },
  "application/msword": { extension: ".doc" },
  "application/pdf": { extension: ".pdf" },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { extension: ".xlsx" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { extension: ".docx" },
  "text/plain": { extension: ".txt" },
  "application/vnd.ms-outlook": { extension: ".msg" },
  "application/x-zip-compressed": { extension: ".zip" },
  "application/vnd.ms-powerpoint": { extension: ".ppt" },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": { extension: ".pptx" }
 
};

export default MIMEConstantALL;


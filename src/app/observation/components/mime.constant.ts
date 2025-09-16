const MIMEConstant = [
    "application/vnd.ms-excel",
    "application/msword",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "text/plain",
   
    "application/x-zip-compressed",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];
export const MIMEConstantLDMS: MIMEConstantType = {
    "application/vnd.ms-excel": { extension: ".xls" },
    "application/msword": { extension: ".doc" },
    "application/pdf": { extension: ".pdf" },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { extension: ".xlsx" },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { extension: ".docx" },
    "image/jpeg": { extension: ".jpg" },
    "image/png": { extension: ".png" },
   
   
    "application/vnd.ms-powerpoint": { extension: ".ppt" },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": { extension: ".pptx" }
   
};
export const MIMEConstantPDF: MIMEConstantType = {
    "application/pdf": { extension: ".pdf" }
   
};
export const MIMEConstantALL: MIMEConstantType = {
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

export const MIMEConstantPDFIMG : MIMEConstantType = {
   
    "image/jpeg": { extension: ".jpeg" },
    "image/png": { extension: ".png" },
    "application/pdf": { extension: ".pdf" }

};
export const MIMEConstantIMAGE : MIMEConstantType = {
   
    "image/jpeg": { extension: ".jpeg" },
    "image/png": { extension: ".png" },

}
export default MIMEConstant;

type MIMEConstantType = {
    [key: string]: { extension: string };
};

export const PreviewableMIMETypes = [    
    "application/pdf",    
    "image/jpeg",
    "image/png",    
];

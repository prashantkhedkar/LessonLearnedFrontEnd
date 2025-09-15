import { getAuth } from "../auth";
import jwt_decode from "jwt-decode";
//import { v4 as uuidv4 } from 'uuid';


export function generateUUID() {
  // Public Domain/MIT
  var d = new Date().getTime(); //Timestamp
  var d2 =
    (typeof performance !== "undefined" &&
      performance.now &&
      performance.now() * 1000) ||
    0; //Time in microseconds since page-load or 0 if unsupported
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = Math.random() * 16; //random number between 0 and 16
    if (d > 0) {
      //Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      //Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}


// Used for attachments component
export type MIMEConstantType = {
  [key: string]: { extension: string };
};

// Used for attachments component
export const getAllowedMimeTypes = (showFileTypes: boolean, fileTypes: MIMEConstantType, localMsg: string, perFileMaxAllowedSizeInMb: number) => {
  if (showFileTypes && fileTypes) {
    let _fInfoMessage = localMsg;
    _fInfoMessage = _fInfoMessage.toString().replaceAll("{Z}", perFileMaxAllowedSizeInMb!.toString());

    const extensionsList = Object.keys(fileTypes).map(
      (mimeType) => fileTypes[mimeType].extension
    );
    _fInfoMessage = _fInfoMessage.toString().replaceAll("{X}", extensionsList.join(", "));

    return {
      generalMsg: _fInfoMessage,
      extension: extensionsList.join(", ")
    };
  }

  return {
    generalMsg: "",
    extension: ""
  };
}
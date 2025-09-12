import { getAuth } from "../auth";
import jwt_decode from "jwt-decode";
import { v4 as uuidv4 } from "uuid";
import { PersonModel } from "../../models/global/personModel";

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

export function formatDate(
  date: string | number | Date,
  dayFormat: "numeric" | "2-digit" | undefined,
  monthFormat: "numeric" | "2-digit" | "long" | "short" | "narrow" | undefined,
  yearFormat: "numeric" | "2-digit" | undefined,
  lang?: string
) {
  try {
    const formattedDate = new Date(date).toLocaleDateString(
      lang && lang == "en" ? "en-UK" : "ar-AE",
      {
        day: dayFormat,
        month: monthFormat,
        year: yearFormat,
      }
    );

    // Split the formatted date into day, month, and year parts
    const [month, day, year] = formattedDate.split(" ");

    // Convert the month abbreviation to uppercase
    const capitalizedMonth = month.toLocaleLowerCase();

    // Return the formatted date with uppercase month abbreviation and desired format
    return `${day ? day : ""} ${capitalizedMonth ? capitalizedMonth : ""} ${
      year ? year : ""
    }`;
  } catch (e) {
    writeToBrowserConsole(e);
  }
}

export function capitalizeFirstLetterEveryWord(data: string | undefined) {
  if (data) {
    return data.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
      letter.toUpperCase()
    );
  }
  return "";
}

export function camelize(str: string) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
}

export const checkNumericForInputText = (e, lang) => {
  if (lang === "en") {
    if (!/[0-9 ]/.test(e.key)) {
      // //e.preventDefault();
    }
  }

  if (lang === "ar") {
    if (/[0-9 ]/.test(e.key)) {
    }
  }
};

export const checkSpecialCharForInputText = (e, lang): boolean => {
  // /[`!@#$%^&*+\=\[\]{};"\\|,.<>\/?~]/

  if (lang === "en") {
    if (/[`%_<>\\]/.test(e.key)) {
      return false;
    }
  }

  if (lang === "ar") {
    if (/[`%_<>\\]/.test(e.key)) {
      return false;
    }
  }

  return true;
};

export const allowOnlyEnglishInput = (e) => {
  if (!/^[A-Za-z0-9\s]*$/.test(e.key)) {
    e.preventDefault();
  }
};

export const validateNumber = (e: any) => {
  const value = e.target.value;

  // Custom Logic to come here...

  return true;
};

export const validateEmailAddress = (e: any) => {
  const value = e.target.value;
  const arabicRegex = /[\u0600-\u06FF]/;

  if (arabicRegex.test(value)) {
    return false;
  } else {
    return true;
  }
};

export const checkSpecialCharForTextEditor = (e, lang) => {
  if (lang === "en") {
    if (/[`%_<>\\]/.test(e.key)) {
      e.preventDefault();
    }
  }

  if (lang === "ar") {
    if (/[`%_<>\\]/.test(e.key)) {
      e.preventDefault();
      // if (e.keyCode === 8 || e.keyCode === 46 || e.keyCode === 13 || e.keyCode === 15 || e.keyCode === 17 || e.keyCode === 16) {
      //   // Allow
      // }
      // else {
      //   e.preventDefault();
      // }
    }
  }
};

export const checkSpecialCharForInputNumber = (e) => {
  if (!/[0-9]/.test(e.key)) {
    e.preventDefault();
  }
};

export const checkSpecialCharForDateText = (e) => {
  if (!/[0-9-]/.test(e.key)) {
    e.preventDefault();
  }
};

export const getRecordIdFromHiddenURLParam = (data): number => {
  return data ? JSON.parse(JSON.stringify(data)).recordId : 0;
};

export const getModeFromHiddenURLParam = (data): string => {
  return data ? JSON.parse(JSON.stringify(data)).mode : "readonly";
};

export const getReturnPathFromHiddenURLParam = (data): string => {
  return data ? JSON.parse(JSON.stringify(data)).precedentPath : "";
};

export const getSourceFromHiddenURLParam = (data): string => {
  return data ? JSON.parse(JSON.stringify(data)).source : "";
};

export const getTaskIdFromHiddenURLParam = (data): number => {
  return data ? JSON.parse(JSON.stringify(data)).taskId : 0;
};

export const getLayoutViewFromHiddenURLParam = (data): string => {
  return data ? JSON.parse(JSON.stringify(data)).layoutView : 0;
};

export const checkSpecialCharForDateTimeText = (e) => {
  if (!/^[^a-zA-Z0-9;',.-=!@#$%^&*()\s]*$/.test(e.key)) {
    e.preventDefault();
  }
};

export const customDateFormat = (
  date1: string,
  currentFormat: string,
  expectedFormat: string
): string | Date | undefined => {
  var date1DateParts: string[] | null | undefined;

  switch (currentFormat) {
    case "dd/mm/yyyy":
      date1DateParts = date1.split("/");

      switch (expectedFormat) {
        case "dd-mm-yyyy":
          return (
            date1DateParts[0] +
            "-" +
            (+date1DateParts[1] - 1) +
            "-" +
            date1DateParts[2]
          );

        case "dateObject":
          return new Date(
            +date1DateParts[2],
            +date1DateParts[1] - 1,
            +date1DateParts[0]
          );

        default:
          break;
      }
      break;

    default:
      break;
  }
};

export const calculateDaysBetweenTwoDates = (date1: Date, date2: Date) => {
  // To calculate the time difference of two dates
  var Difference_In_Time = date2.getTime() - date1.getTime();
  var Difference_In_Days = "";

  if (Difference_In_Time <= 0) {
    // When end date is greater than start date then return value without negative sign
    // +1 to include end date when calculating today days difference
    Difference_In_Days = (
      Math.abs(Difference_In_Time / (1000 * 3600 * 24)) + 1
    ).toFixed(0);
  } else {
    // When end date is less than start date, this ind
    Difference_In_Days = "N/a";
  }
  return Difference_In_Days;
};

export const calculateDaysRemaining = (dateParam: string) => {
  const currentDate: any = new Date();
  const myDate: any = new Date(dateParam); // Replace with your desired date
  const timeDifference = Math.abs(myDate - currentDate);
  const daysRemaining = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
  return daysRemaining;
};

export const getDueDays = (data: any) => {
  const date1 = new Date();
  const date2 = new Date(data.endDate);
  const msInDay = 24 * 60 * 60 * 1000;
  const msBetweenDates = Math.round(
    (date2.getTime() - date1.getTime()) / msInDay
  );

  return msBetweenDates;
};

export const stringAvatar = (name) => {
  try {
    return {
      sx: {
        bgcolor: "#dfcfb6",
      },
      children: `${name?.split(" ")[0][0]}${
        name?.split(" ")[1][0] ? name?.split(" ")[1][0] : name?.split(" ")[2][0]
      }`,
    };
  } catch (error) {
    return "";
  }
};

export const daysOfWeek = [
  { name: "Monday", nameAr: "الإثنين", value: "Monday" },
  { name: "Tuesday", nameAr: "الثلاثاء", value: "Tuesday" },
  { name: "Wednesday", nameAr: "الأربعاء", value: "Wednesday" },
  { name: "Thursday", nameAr: "الخميس", value: "Thursday" },
  { name: "Friday", nameAr: "الجمعة", value: "Friday" },
];

export const monthsofYear = [
  { name: "January", nameAr: "يناير", value: "January" },
  { name: "February", nameAr: "فبراير", value: "February" },
  { name: "March", nameAr: "مارس", value: "March" },
  { name: "April", nameAr: "أبريل", value: "April" },
  { name: "May", nameAr: "مايو", value: "May" },
  { name: "June", nameAr: "يونيو", value: "June" },
  { name: "July", nameAr: "يوليو", value: "July" },
  { name: "August", nameAr: "أغسـطس", value: "August" },
  { name: "September", nameAr: "سبتمبر", value: "September" },
  { name: "October", nameAr: "أكتوبر", value: "October" },
  { name: "November", nameAr: "نوفمبر", value: "November" },
  { name: "December", nameAr: "ديسمبر", value: "December" },
];

export function titleCase(str) {
  return str && str.toLowerCase().replace(/\b(\w)/g, (s) => s.toUpperCase());
}

export const quarters = [
  {
    name: "Quarter1 (Jan- Mar)",
    nameAr: "الربع الأول (يناير -  مارس)",
    value: "1",
  },
  {
    name: "Quarter2 (Apr- Jun)",
    nameAr: "الربع الثاني (أبريل -  يونيو)",
    value: "2",
  },
  {
    name: "Quarter3 (Jul- Sep)",
    nameAr: "الربع الثالث (يوليو -  سبتمبر)",
    value: "3",
  },
  {
    name: "Quarter4 (Oct- Dec)",
    nameAr: "الربع الرابع (أكتوبر-  ديسمبر)",
    value: "4",
  },
];

export function getCurrentUserID() {
  const auth = getAuth();
  let decoded: any = jwt_decode(String(auth?.jwtToken));
  return Number(decoded.nameid);
}

const isSeparator = (value: string): boolean =>
  value === "/" || value === "\\" || value === ":";

export const getExtension = (path: string): string => {
  for (let i = path.length - 1; i > -1; --i) {
    const value = path[i];
    if (value === ".") {
      if (i > 1) {
        if (isSeparator(path[i - 1])) {
          return "";
        }
        return path.substring(i + 1);
      }
      return "";
    }
    if (isSeparator(value)) {
      return "";
    }
  }
  return "";
};

export function setLocalStorage(key: string, value: any) {
  localStorage.setItem(key, value.toString());
}

export function getLocalStorage(key: string) {
  return localStorage.getItem(key);
}

export function clearStore() {
  removeLocalStorage("jsonRow");
  removeLocalStorage("precedentPath");
}

export function captureReturnPath() {
  const getCurrentRequestedPath = getLocalStorage("ReturnURL");
  if (getCurrentRequestedPath === "" || getCurrentRequestedPath === null) {
    const url = window.location.href; // Get the current URL

    const urlObj = new URL(url);

    const domain = urlObj.origin; // This includes the protocol and domain
    const path = urlObj.pathname + urlObj.search + urlObj.hash; // This includes the path, query string, and fragment identifier

    const inclusionList = [
      "/defence-workspace/project-management/workspace/project-details?",
    ];
    const containsAnyValue = inclusionList.some((value) =>
      path.toLowerCase().includes(value)
    );

    if (containsAnyValue) {
      setLocalStorage("ReturnURL", path);
    } else {
      removeLocalStorage("ReturnURL");
    }
  }
}

export function removeLocalStorage(key: string) {
  localStorage.removeItem(key);
}

// Convert file into base64 before posting to api
export const getBase64 = (file) => {
  return new Promise((resolve) => {
    let baseURL: string | ArrayBuffer | null;
    // Make new FileReader
    let reader = new FileReader();
    // Convert the file to base64 text
    reader.readAsDataURL(file);
    // on reader load somthing...
    reader.onload = () => {
      // Make a fileInfo Object
      baseURL = reader.result;
      resolve(baseURL);
    };
  });
};

export function formatDateToISOString(date) {
  var year = date.getFullYear();
  var month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is 0-based, so add 1
  var day = date.getDate().toString().padStart(2, "0");
  var hours = "00";
  var minutes = "00";
  var seconds = "00";

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

export function convertDateObjectToCustomString(dateObjectString: string) {
  const inputDate = new Date(dateObjectString);

  const day = String(inputDate.getDate()).padStart(2, "0");
  const month = String(inputDate.getMonth() + 1).padStart(2, "0"); // Note: Month is zero-based
  const year = inputDate.getFullYear();

  const formattedDate = `${day}/${month}/${year}`;

  return formattedDate;
}

// Console Log Writer
export const writeToBrowserConsole = (e: any) => {
  if (process.env.REACT_APP_IS_DEBUGGER_ENABLED === "1") {
    console.log(JSON.stringify(e));
  }
};

// Used for attachments component
export type MIMEConstantType = {
  [key: string]: { extension: string };
};

// Used for attachments component
export const getAllowedMimeTypes = (
  showFileTypes: boolean,
  fileTypes: MIMEConstantType,
  localMsg: string,
  perFileMaxAllowedSizeInMb: number
) => {
  if (showFileTypes && fileTypes) {
    let _fInfoMessage = localMsg;
    _fInfoMessage = _fInfoMessage
      .toString()
      .replaceAll("{Z}", perFileMaxAllowedSizeInMb!.toString());

    const extensionsList = Object.keys(fileTypes).map(
      (mimeType) => fileTypes[mimeType].extension
    );
    _fInfoMessage = _fInfoMessage
      .toString()
      .replaceAll("{X}", extensionsList.join(", "));

    return {
      generalMsg: _fInfoMessage,
      extension: extensionsList.join(", "),
    };
  }

  return {
    generalMsg: "",
    extension: "",
  };
};

export const getDateTimeWithMilliseconds = (): string => {
  // Function to format date and time
  const date = new Date();
  const year = date.getFullYear().toString().padStart(4, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const milliseconds = date.getMilliseconds().toString().padStart(3, "0");

  return `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
};

export const getImagesExtension = (fileName) => {
  if (getExtension(fileName).toUpperCase() === "AI") {
    return "AI";
  } else if (getExtension(fileName).toUpperCase() === "AVI") {
    return "AVI";
  } else if (getExtension(fileName).toUpperCase() === "DOC") {
    return "DOC";
  } else if (getExtension(fileName).toUpperCase() === "DOCX") {
    return "DOC";
  } else if (getExtension(fileName).toUpperCase() === "EPS") {
    return "EPS";
  } else if (getExtension(fileName).toUpperCase() === "GIF") {
    return "GIF";
  } else if (getExtension(fileName).toUpperCase() === "INDD") {
    return "INDD";
  } else if (getExtension(fileName).toUpperCase() === "JPEG") {
    return "JPG";
  } else if (getExtension(fileName).toUpperCase() === "JPG") {
    return "JPG";
  } else if (getExtension(fileName).toUpperCase() === "MP3") {
    return "MP3";
  } else if (getExtension(fileName).toUpperCase() === "MP4") {
    return "MP4";
  } else if (getExtension(fileName).toUpperCase() === "PDF") {
    return "PDF";
  } else if (getExtension(fileName).toUpperCase() === "PNG") {
    return "PNG";
  } else if (getExtension(fileName).toUpperCase() === "PPT") {
    return "PPT";
  } else if (getExtension(fileName).toUpperCase() === "PPTX") {
    return "PPT";
  } else if (getExtension(fileName).toUpperCase() === "PSD") {
    return "PSD";
  } else if (getExtension(fileName).toUpperCase() === "TIFF") {
    return "TIFF";
  } else if (getExtension(fileName).toUpperCase() === "XLSX") {
    return "XLS";
  } else if (getExtension(fileName).toUpperCase() === "XLS") {
    return "XLS";
  } else if (getExtension(fileName).toUpperCase() === "ZIP") {
    return "ZIP";
  } else return "file";
};

export function getMimeType(extension) {
  return (
    mimeTypesKeyValuePair[extension.toLowerCase()] || "application/octet-stream"
  );
}

export const mimeTypesKeyValuePair: { [key: string]: string } = {
  txt: "text/plain",
  html: "text/html",
  htm: "text/html",
  css: "text/css",
  csv: "text/csv",
  js: "application/javascript",
  json: "application/json",
  xml: "application/xml",
  md: "text/markdown",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  bmp: "image/bmp",
  svg: "image/svg+xml",
  webp: "image/webp",
  ico: "image/vnd.microsoft.icon",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  m4a: "audio/mp4",
  flac: "audio/flac",
  mp4: "video/mp4",
  avi: "video/x-msvideo",
  mov: "video/quicktime",
  wmv: "video/x-ms-wmv",
  webm: "video/webm",
  mkv: "video/x-matroska",
  pdf: "application/pdf",
  zip: "application/zip",
  tar: "application/x-tar",
  rar: "application/vnd.rar",
  "7z": "application/x-7z-compressed",
  exe: "application/vnd.microsoft.portable-executable",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

// A set to store previously generated keys (for uniqueness checking)
const generatedKeys = new Set<string>();

// Function to generate a random 128-bit numeric key
export const generateUnique128BitNumericKey = (): string => {
  let key: string;
  do {
    // Generate a random 128-bit number
    const randomBigInt = BigInt(
      `0x${crypto
        .getRandomValues(new Uint32Array(4))
        .reduce((acc, curr) => acc + curr.toString(16).padStart(8, "0"), "")}`
    );
    key = randomBigInt.toString();

    // Ensure the key is unique
  } while (generatedKeys.has(key));

  // Add the key to the set of generated keys
  generatedKeys.add(key);

  return key;
};

export const getSharePointMimeTypes = (extension: string) => {
  if (extension) {
    if (
      extension.toLowerCase() ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      extension.toLowerCase() === "application/msword"
    ) {
      return "ms-word:ofe|u|";
    } else {
      if (
        extension.toLowerCase() ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        extension.toLowerCase() === "application/vnd.ms-excel"
      ) {
        return "ms-excel:ofe|u|";
      } else {
        if (
          extension.toLowerCase() ===
            "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
          extension.toLowerCase() === "application/vnd.ms-powerpoint"
        ) {
          return "ms-powerpoint:ofe|u|";
        } else {
          return "";
        }
      }
    }
  }

  return "";
};

//For GS
export const getSharePointGSMimeTypes = (extension: string) => {
  if (extension) {
    if (
      extension.toLowerCase() === "docx" ||
      extension.toLowerCase() === "doc"
    ) {
      return "ms-word:ofe|u|";
    } else {
      if (
        extension.toLowerCase() === "xls" ||
        extension.toLowerCase() === "xlsx"
      ) {
        return "ms-excel:ofe|u|";
      } else {
        if (
          extension.toLowerCase() === "ppt" ||
          extension.toLowerCase() === "pptx"
        ) {
          return "ms-powerpoint:ofe|u|";
        } else {
          return "";
        }
      }
    }
  }

  return "";
};

export const getPersonNameAndRank = (pModel: PersonModel, lang: string) => {
  if (lang === "en") {
    return pModel.rank && pModel.rank.length > 0
      ? pModel.rank + " " + pModel.fullName.en
      : pModel.fullName.en;
  } else {
    return pModel.rank && pModel.rank.length > 0
      ? pModel.rank + " " + pModel.fullName.ar
      : pModel.fullName.ar;
  }
};

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): T {
  let timeout: NodeJS.Timeout;
  return function (this: any, ...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func.apply(this, args), wait);
  } as T;
}

export const checkInputMobileNumber = (e, lang) => {
  if (lang === "en") {
    if (!/[0-9]/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete") {
      e.preventDefault();
    }
  }

  if (lang === "ar") {
    if (
      !/[0-9 ]\b/.test(e.key) &&
      e.key !== "Backspace" &&
      e.key !== "Delete"
    ) {
      e.preventDefault();
    }
  }
};

export const getProfileIconByGender = () => {
  const auth = getAuth();
  if (auth?.gender && auth.gender === "1") {
    return "media/images/avatar-male.jpg";
  } else if (auth?.gender && auth.gender === "2") {
    return "media/images/avatar-female.jpg";
  } else {
    return "media/images/avatar-male.jpg";
  }
};

export const checkInputEmail = (e) => {
  if (/^[^a-zA-Z0-9.-@\s]*$/.test(e.key)) {
    e.preventDefault();
  }
};

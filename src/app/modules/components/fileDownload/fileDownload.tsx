import React from "react";
import { Tooltip } from "@mui/material";
import { unwrapResult } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { useAppDispatch } from "../../../../store";
import FileDownload from "../../../../_metronic/assets/images/FileDownload.png";
import cssfileDownload from './fileDownload.module.css';
import { downloadAttachmentItemAsync } from "../../services/globalSlice";
import { IAttachment } from "../../../models/global/globalGeneric";

const CustomFileDowload = (props) => {
  const { docGUID, fileName, fileType, moduleId, itemId, docUrl } = props;



  const dispatch = useAppDispatch();
  const base64ToBlob = (base64, type = "application/octet-stream") => {
    const binStr = atob(base64);
    const len = binStr.length;
    const arr = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      arr[i] = binStr.charCodeAt(i);
    }
    return new Blob([arr], { type: type });
  };

  const downloadPDF = (event) => {

    event.preventDefault();
    event.stopPropagation();

    let formDataModel: IAttachment = {
      docGUID: props.docGUID,
      fileName: props.fileName,
      fileType: props.fileType,
      id: 0,
      fileSize: 0,
      moduleId: props.moduleId,
      itemId: props.itemId,
      docUrl: props.docUrl,
    };

    dispatch(
      downloadAttachmentItemAsync({ formDataObject: formDataModel })
    )
      .then(unwrapResult)
      .then((originalPromiseResult) => {
        if (originalPromiseResult.statusCode === 200) {
          const responseData = originalPromiseResult.data;

          // if (fileType === "application/pdf") {
          //     var win = window.open();
          //     if (win == null) {
          //         alert("Block Pop-up window");
          //         return false;
          //     } else {
          //         var blob = base64ToBlob(responseData, "application/pdf");
          //         win.document.write(
          //             '<iframe src="' +
          //             URL.createObjectURL(blob) +
          //             '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>'
          //         );
          //     }
          // } else { 
          let anchorRef = document.getElementById(
            "dwnldLnk_" + props.docGUID
          ) as HTMLAnchorElement;
          anchorRef.href = responseData;
          anchorRef.click();

          // }
        } else {
          if (originalPromiseResult.statusCode === 401) {
            toast.error("Session expired. Kindly login");
          } else {
            toast.error(
              "Expected error while uploading document. Please try again!"
            );
          }
        }
      })
      .catch((rejectedValueOrSerializedError) => {
        console.log(rejectedValueOrSerializedError);
      });
  };

  const ManageTooltipTitle = ({ title }) => {
    return <div className={`${cssfileDownload["fd-title"]} px-3 py-3 fs-7 fw-bold}`} >{title}</div>;
  };
  return (
    <React.Fragment>
      <a id={"dwnldLnk_" + props.docGUID} download={props.fileName} hidden={true} />

      <div onClick={() => downloadPDF}>
        <Tooltip
          title={<ManageTooltipTitle title={"Download File"} />}
          placement="top"
          arrow
        >
          <a href="#" className="pe-auto" id={"download" + props.docGUID}>
            <img src={FileDownload} alt="Download File" />
          </a>
        </Tooltip>
      </div>
    </React.Fragment>
  );
};

export default CustomFileDowload;

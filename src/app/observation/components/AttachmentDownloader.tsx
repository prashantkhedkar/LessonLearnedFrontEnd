import { Tooltip } from "@mui/material";

import { useState } from "react";
import axios from "axios";






type attchmentType = 'Fatwa' | 'Comments' | 'Law';

export const  AttachmentDownloader = (props: {
    item:any, attchmentType: attchmentType
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const handleView = async (requestAttachmentId:number) => {
        try {
            var response;
            setIsLoading(true);

            if (props.attchmentType === "Fatwa") {
              response = await axios.get(
                process.env.REACT_APP_API_URL +
                  `/Attachment/DownloadAttachment/${requestAttachmentId}`,
                {
                  responseType: "blob",
                }
              );
            }

            if (props.attchmentType === "Comments") {
              response = await axios.get(
                process.env.REACT_APP_API_URL +
                  `/Attachment/DownloadAttachment/${requestAttachmentId}`,
                {
                  responseType: "blob",
                }
              );
            }

            if (props.attchmentType === "Law") {
              response = await axios.get(
                process.env.REACT_APP_API_URL +
                  `/Attachment/DownloadAttachment/${requestAttachmentId}`,
                {
                  responseType: "blob",
                }
              );
            }
            if (!response) return;
            const disposition = response.headers['Content-Disposition'];
            let fileName = 'download-file';
            if (disposition && disposition.includes('filename=')) {
                setIsLoading(false);
                const filenameRegex = /filename=?([^"]+)"?/;
                const maches = filenameRegex.exec(disposition);
                if (maches != null && maches[1]) {
                    fileName = maches[1]
                }
            }
            const url = window.URL.createObjectURL(response.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            setIsLoading(false);


        } catch (e) {
            console.log("GetDocumentTypeMaster Api call Failed");
            setIsLoading(false);
        }
        return undefined;

    }

    return (<>

        <div>
            <span>  {isLoading == false ?

                <>
                    <Tooltip
                        placement="bottom"
                        title={''}
                        arrow
                        TransitionProps={{ timeout: 400 }}
                    >
                        {
                            <i className="fa fa-light fa-outline fa-download fs-3 text-gray pointer" onClick={() => handleView(props.item.id)} />
                        }
                    </Tooltip></> : null}

            </span>
            {isLoading === true && (
                <span className='indicator-progress' style={{ display: 'block' }}>

                    <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                </span>)}
            <a id={"dwnldLnk_" + props.item.id} download={props.item.fileName} hidden={true} />
        </div>

    </>);
};
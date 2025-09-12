import { unwrapResult } from '@reduxjs/toolkit';
import { useEffect, useState } from 'react'
import { FileUploader } from 'react-drag-drop-files';
import { toast } from 'react-toastify';
import CommonConstant from '../../../helper/_constant/common.constant';
import { IAttachment, IUserAttachmentFileInfoDuplicateCheckModel, userAttachmentFileInfoDuplicateCheckInitialValue, validateTotalFilesToUploadProp } from '../../../models/global/globalGeneric';
import { duplicateAttachmentInModuleCheckModelAsync, globalActions, uploadAttachmentChunkSharePointItemAsync } from '../../services/globalSlice';
import { MIMEConstantType, generateUUID, getAllowedMimeTypes, getDateTimeWithMilliseconds, writeToBrowserConsole } from '../../utils/common';
import { useIntl } from 'react-intl';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { Modal } from 'react-bootstrap';

interface props {
    recordId: number;
    moduleTypeId: number; // Refer to Global Generics for Enum constant
    fileTypes: MIMEConstantType;
    perFileMaxAllowedSizeInMb: number, // If provided, will override global setting
    perFileMaxAllowedChunkSizeToSplitInMb: number // If provided, will override global setting
    onUploadAttachmentChunksComplete: Function,

    //To Allow multiple files to be selected for upload from dialog box instead of one file selection per upload.
    allowMultipleFileUpload?: boolean,

    //Will Enable Validation Handler For Duplicate file checks, where condition will be handled on Parent Component.
    shouldCheckForDuplicateFileAndConfirmBeforeUpload?: boolean,
    // onConfirmBeforeFileUploadCheckForDuplicate?: (fileName: File) => Promise<[File, boolean, number]>,

    //Will Enable Validation Handler For Duplicate file restriction, where condition will be handled on Parent Component.
    shouldCheckForDuplicateFileAndRestrictUpload?: boolean,

    //Will Enable Validation handle For Total Files Uploaded and Max Allowed Limit, where condition will be handled on Parent Component.
    validateTotalFilesToUpload?: validateTotalFilesToUploadProp,
    returnValidationMessage?: Function,

    //Allow only One Attachment For Current Record
    limitToSingleAttachment?: boolean,

    //For Department Website
    sectionId?: number;
    componentId?: number;

    //Tooltip
    showUploadTooltip?: boolean,
    uploadTooltip?: string,

    //Render Related Toggle
    showFileTypes?: boolean,
    showUpload?: boolean,

    //While uploading in progress, disable submit button will be handled on Parent Component.
    onDisableSubmitAction?: (columnName: boolean) => void,

    moduleNewRecordGuid?: string

    sharepointPath?: string
    sharedFileId?: number
    maxLimitForDragNDropUpload?: number
};
export default function UserAttachmentDragNDrop({ recordId, allowMultipleFileUpload, moduleTypeId, fileTypes,
    showFileTypes, perFileMaxAllowedChunkSizeToSplitInMb, perFileMaxAllowedSizeInMb, shouldCheckForDuplicateFileAndConfirmBeforeUpload,
    shouldCheckForDuplicateFileAndRestrictUpload, onUploadAttachmentChunksComplete, sectionId, componentId, moduleNewRecordGuid, sharepointPath, sharedFileId, maxLimitForDragNDropUpload }: props) {

    const intl = useIntl();
    const dispatch = useAppDispatch();

    const chunkSize = 1048576 * (perFileMaxAllowedChunkSizeToSplitInMb ? perFileMaxAllowedChunkSizeToSplitInMb : CommonConstant.PER_FILE_MAX_ALLOWED_CHUNK_SIZE_TO_SPLIT_IN_MB);
    const [fileGuid, setFileGuid] = useState("");
    const [id, setId] = useState(recordId);



    // Drag and Drop Feature
    const [dnDfiles, setDnDfiles] = useState<any[]>([]);
    const [dnDfilesStatus, setDnDfilesStatus] = useState<any[]>([]);

    const [currentDnDFileIndex, setCurrentDnDFileIndex] = useState<number>(-1);
    const [lastUploadedDnDFileIndex, setLastUploadedDnDFileIndex] = useState<number>(-1);
    const [currentDnDChunkIndex, setCurrentDnDChunkIndex] = useState<number>(-1);

    const [customFileName, setCustomFileName] = useState<string>("");
    const [myFileTypes, setMyFileTypes] = useState<any[]>([]);

    const [showModalTemplateOne, setShowModalTemplateOne] = useState(false);
    const [showModalTemplateTwo, setShowModalTemplateTwo] = useState(false);
    const [showModalTemplateThree, setShowModalTemplateThree] = useState(false);

    const [duplicateFile, setDuplicateFile] = useState<any>();
    const [confirmationMessageDuplicateFile, setConfirmationMessageDuplicateFile] = useState<string>("");

    const [currentDuplicateFileId, setCurrentDuplicateFileId] = useState(0);

    const [totalLength, setTotalLength] = useState(0);

    // Load configuration for fileuploader
    useEffect(() => {
        configureFileExtensions();
    }, []);


    // Step 2 - Drag and Drop Feature
    useEffect(() => {
        if (dnDfiles.length > 0) {
            if ((dnDfiles.length - totalLength) <= maxLimitForDragNDropUpload! || !maxLimitForDragNDropUpload || maxLimitForDragNDropUpload === 0) {
                dispatch(globalActions.updateDragNDropUploadProgressStatus(true));
                if (currentDnDFileIndex === -1) {
                    setCurrentDnDFileIndex(lastUploadedDnDFileIndex === -1 ? 0 : lastUploadedDnDFileIndex + 1);
                }
            } else {
                dispatch(globalActions.updateDragNDropUploadProgressStatus(false));
                setShowModalTemplateThree(true);
            }
        } else {
            dispatch(globalActions.updateDragNDropUploadProgressStatus(false));
        }
    }, [dnDfiles.length]);

    // Step 3 - Drag and Drop Feature
    useEffect(() => {
        if (currentDnDFileIndex !== -1) {
            let file = dnDfilesStatus[currentDnDFileIndex];

            // First Level Validation
            const validFileConditions = validateBeforeUpload(file);

            if (validFileConditions === "") {
                // Second Level Validation
                if (shouldCheckForDuplicateFileAndConfirmBeforeUpload) {
                    onConfirmBeforeFileUploadCheckForDuplicate(file)
                        .then(async ([fileData, isDuplicate, shareFileId]: [File, boolean, number]) => {
                            if (isDuplicate) {
                                // Perform actions for duplicate file
                                let confirmationMessageTemp = intl.formatMessage({ id: "MOD.SHAREDFILES.CONFIRM.FILEUPLOAD.DUPLICATE" });
                                confirmationMessageTemp = confirmationMessageTemp.replaceAll("{X}", fileData.name);
                                setConfirmationMessageDuplicateFile(confirmationMessageTemp);

                                setCurrentDuplicateFileId(shareFileId);
                                setDuplicateFile(fileData);
                                setShowModalTemplateOne(true);
                            } else {
                                // Perform actions for non-duplicate file
                                processCurrentFile(file, false);
                            }
                        })
                        .catch((error: any) => {
                            console.error("Error occurred:", error);
                        });
                } else if (shouldCheckForDuplicateFileAndRestrictUpload) {
                    onRestrictBeforeFileUploadCheckForDuplicate(file)
                        .then(async ([fileData, isDuplicate]: [File, boolean]) => {
                            if (isDuplicate) {
                                // Perform actions for duplicate file
                                setShowModalTemplateTwo(true);
                                setDuplicateFile(fileData);
                            } else {
                                // Perform actions for non-duplicate file
                                processCurrentFile(file, false);
                            }
                        })
                        .catch((error: any) => {
                            console.error("Error occurred:", error);
                        });
                } else {
                    processCurrentFile(file, false);
                }
            } else {
                skipCurrentFile(file, validFileConditions);
            }

            // When the last file is uploaded and it not invalid
            if (currentDnDFileIndex === dnDfiles.length - 1 && validFileConditions != "") {
                dispatch(globalActions.updateDragNDropUploadProgressStatus(false));
            }
        }
    }, [currentDnDFileIndex]);

    // Step 4   
    useEffect(() => {
        //
        if (currentDnDChunkIndex !== -1) {
            const file = dnDfilesStatus[currentDnDFileIndex];
            if (file.error === "") {
                readAndUploadCurrentChunk();
            }
        } else {
            updateStateOnLastFileCompletion();
        }
    }, [currentDnDChunkIndex]);

    // Step 5
    useEffect(() => {
        if (lastUploadedDnDFileIndex === -1) {
            return;
        }

        const isLastFile = lastUploadedDnDFileIndex === dnDfiles.length - 1;
        const nextFileIndex = isLastFile ? -1 : currentDnDFileIndex + 1;

        setCurrentDnDFileIndex(nextFileIndex);
    }, [lastUploadedDnDFileIndex]);

    // Helper Function    
    function processCurrentFile(currentFileModel: any, shouldOverwriteCurrentFile?: boolean) {
        //
        currentFileModel.error = "";
        currentFileModel.overwriteExistingFile = shouldOverwriteCurrentFile ? shouldOverwriteCurrentFile : false;

        const _customFileName = generateUUID() + "-" + getDateTimeWithMilliseconds();
        setCustomFileName(_customFileName);

        const _fileID = _customFileName + "." + currentFileModel.name.split('.').pop(); // File-Chunk Related Code
        setFileGuid(_fileID); // File-Chunk Related Code    

        setCurrentDnDChunkIndex(0); // Goto Step 4

        dispatch(globalActions.atleastOneFileWasUploadedInSharedFile(true));
    };

    // Helper Function
    function skipCurrentFile(currentFileModel: any, validFileConditions: string) {
        currentFileModel.error = validFileConditions
        currentFileModel.overwriteExistingFile = false;

        if (dnDfiles.length === currentDnDFileIndex + 1) {
            currentFileModel.finalFilename = currentFileModel.name;
            setLastUploadedDnDFileIndex(currentDnDFileIndex); // Goto Step 7
            setCurrentDnDChunkIndex(-1); // Goto Step 4
        } else {
            setLastUploadedDnDFileIndex(currentDnDFileIndex); // Goto Step 4 - Handle On Error
        }
    };

    // Step 1 - Drag and Drop Feature - Event handler for drag & drop file upload controller - Entry Point
    const handleDragNDropChange = (event: any) => {
        if (event.length > 10) {
            setShowModalTemplateThree(true);
        } else {
            setDnDfiles([...dnDfiles, ...event]);
            setDnDfilesStatus([...dnDfiles, ...event]);
        }
    };

    // Step 5  
    function readAndUploadCurrentChunk() {
        const file = dnDfilesStatus[currentDnDFileIndex];
        if (!file) {
            return;
        }
        const from = currentDnDChunkIndex * chunkSize;
        const to = from + chunkSize;
        uploadChunkDnD(from, to);
    };

    // Step 6 - File-Chunk Push chunks to API
    const uploadChunkDnD = async (from: number, to: number) => {

        try {
            const file = dnDfilesStatus[currentDnDFileIndex];
            var chunk = file!.slice(from, to);

            let formDataModel: IAttachment;
            formDataModel = {
                formData: chunk,
                fileName: file!.name,
                fileType: file!.type,
                fileSize: file!.size,
                isActive: true,
                id: file.overwriteExistingFile ? currentDuplicateFileId : id,
                moduleId:recordId.toString(),
                draftId: fileGuid.toString() + currentDnDChunkIndex.toString(),
                createdByEmailAddress: "",
                moduleTypeId: moduleTypeId,
                chunkFileReferenceGuid: fileGuid,
                chunkFileSize: chunkSize,
                chunkFileTempPath: process.env.REACT_APP_CHUNK_FILE_PATH,
                currentShareFileIndex: currentDnDFileIndex,
                totalNumberOfUploadedFiles: dnDfiles.length - 1
            };

            handleOnUploadAttachmentChunksDnD(formDataModel);
        } catch (error) {
            writeToBrowserConsole(error)
        }
    };

    // Upload attachment chunks to temp remote server
    const handleOnUploadAttachmentChunksDnD = (formObject: IAttachment) => {
        try {
            // Payload is for sharepoint
            formObject = {
                ...formObject,
                chunkFileSize: 1048576
            }
            dispatch(uploadAttachmentChunkSharePointItemAsync({ formDataObject: formObject }))
                .then(unwrapResult)
                .then((originalPromiseResult) => {

                    if (originalPromiseResult.statusCode === 200) {
                        const responseData = originalPromiseResult.data as boolean;

                        if (!responseData) {
                            writeToBrowserConsole("Error while uploading file chunk");
                            return;
                        }

                        let dnDfile = dnDfiles[currentDnDFileIndex];
                        const filesize = dnDfiles[currentDnDFileIndex].size;
                        const chunks = Math.ceil(filesize / chunkSize) - 1;
                        const isLastChunk = currentDnDChunkIndex === chunks;

                        if (isLastChunk) {
                            dnDfile.finalFilename = dnDfile.name;
                            setLastUploadedDnDFileIndex(currentDnDFileIndex); // Goto Step 7
                            setCurrentDnDChunkIndex(-1); // Goto Step 4

                            let formDataModel: IAttachment = {
                                ...formObject,
                                formFile: null,
                                sectionId: sectionId,
                                componentId: componentId,
                                storageServer: "sharepoint",
                                draftId: moduleNewRecordGuid,
                                overwriteExistingFile: dnDfile.overwriteExistingFile,
                                id: currentDuplicateFileId ? currentDuplicateFileId : id,
                                moduleId: recordId.toString(),
                                currentShareFileIndex: currentDnDFileIndex,
                                totalNumberOfUploadedFiles: dnDfiles.length - 1
                            };

                            setCurrentDuplicateFileId(0);

                            // Send to Parent Component: Upload Complete To Temporary Folder
                            onUploadAttachmentChunksComplete(formDataModel);

                            updateStateOnLastFileCompletion();
                        } else {
                            setCurrentDnDChunkIndex(currentDnDChunkIndex + 1); // Goto Step 4
                        }
                    }
                })
                .catch((rejectedValueOrSerializedError) => {
                    dispatch(globalActions.updateDragNDropUploadProgressStatus(false));
                    writeToBrowserConsole(rejectedValueOrSerializedError);
                    toast.error(intl.formatMessage({ id: "MOD.GLOBAL.NOTIFICATION.DOCUPLFAIL" }) + " : " + formObject.fileName!.toString());
                    toast.dismiss('LoadingToastr' + formObject.fileName!.replaceAll(' ', '_').toString());
                })
        } catch (e) {
            writeToBrowserConsole(e);
        }
    };

    const configureFileExtensions = () => {
        //
        if (showFileTypes && fileTypes && Object.keys(fileTypes).length > 0) {
            const mimeTypes = Object.values(fileTypes);

            setMyFileTypes([]);
            mimeTypes.map((item) => {
                setMyFileTypes(prev => [...prev, item.extension.replaceAll(".", "").toUpperCase()])
            });
        }
    };

    // Event handler for file upload modal popup
    const validateBeforeUpload = (file: File): string => {
        const selectableMaxFileSize = 1024 * 1024 * (perFileMaxAllowedSizeInMb ? perFileMaxAllowedSizeInMb : CommonConstant.PER_FILE_MAX_ALLOWED_SIZE_IN_MB)
        let initialFileSize: number = file.size;

        // Toastr Configuration - File Size Validation
        if (initialFileSize <= 0) {
            return intl.formatMessage({ id: 'MOD.GLOBAL.FILEUPLOAD.FILESIZE.LOW.MESSAGE' }).toString().replaceAll("{X}", "'" + file.name + "'");
        }

        // Toastr Configuration - File Size Validation
        if (initialFileSize > selectableMaxFileSize) {
            return intl.formatMessage({ id: 'MOD.GLOBAL.FILEUPLOAD.FILESIZE.MESSAGE' }).toString().replaceAll("{X}", (perFileMaxAllowedSizeInMb ? perFileMaxAllowedSizeInMb.toString() : CommonConstant.PER_FILE_MAX_ALLOWED_SIZE_IN_MB.toString()) + " MB");
        }

        // Toastr Configuration - Allowed File Type Validation
        if (showFileTypes && fileTypes && Object.keys(fileTypes).length > 0) {
            let _fInfoMessage = intl.formatMessage({ id: 'MOD.GLOBAL.FILEUPLOAD.FILETYPE.INFOMESSAGE' });

            // Assuming you want to join the keys (MIME types) of the object
            const mimeTypes = Object.keys(fileTypes);
            const fileTypesString = mimeTypes.join(', ');

            // Check if fileTypesString is a valid string
            if (typeof fileTypesString === 'string') {
                // Assuming you have a specific MIME type
                const specificMimeType = file.type;

                // Get the file extension based on the specific MIME type
                const fileExtension = fileTypes[specificMimeType];

                if (!fileExtension) {
                    _fInfoMessage = _fInfoMessage.replace("{X}", getAllowedMimeTypes(showFileTypes, fileTypes, intl.formatMessage({ id: 'MOD.GLOBAL.FILEUPLOAD.FILESIZE.INFOMESSAGE' }), perFileMaxAllowedSizeInMb).extension);
                    return _fInfoMessage; // Return the file extension
                }
            }
        }

        // Restriction of file name special character handling
        if (file && file.name && file.name.length > 0) {
            var fileNameWithoutExtension = file.name.substring(0, file.name.lastIndexOf('.')) || "";
            if ((/[#%^&*|"\\:<>~'\/?؟]/.test(fileNameWithoutExtension))) {
                // if ((/[`!@#$%^&*+\=\[\]{};|"\\,':().<>\/?؟!@#$%^&*)(+~]/.test(fileNameWithoutExtension))) {
                return intl.formatMessage({ id: 'MOD.SHAREDFILES.SPECIALCHARS' }).replaceAll("{X}", "\\ * \" | : /  ? < > ^ ~ ' # & %");
            }
        }

        return "";
    };

    {/* Event handler close modal popup Two - Template Two - With Cancel Button Only - For File overwrite restriction */ }
    const handleCloseModalTwo = () => {
        setShowModalTemplateTwo(false);
        skipCurrentFile(duplicateFile, intl.formatMessage({ id: "MOD.SHAREDFILES.RESTRICT.FILEUPLOAD.DUPLICATE.MESSAGE" }));
    };

    {/* Template One - With Yes & No Button - For File overwrite When User Closes Modal*/ }
    const handleCloseModalOne = () => {
        setShowModalTemplateOne(false);
        skipCurrentFile(duplicateFile, intl.formatMessage({ id: "MOD.DO.NOT.OVERRIDE.CURRENT.FILE" }));
    };

    {/* Template One - With Yes & No Button - Skip File When User Chooses No*/ }
    const onModalOneConfirmedNoToOverwriteFile = () => {
        setShowModalTemplateOne(false);
        skipCurrentFile(duplicateFile, intl.formatMessage({ id: "MOD.DO.NOT.OVERRIDE.CURRENT.FILE" }));
        setCurrentDuplicateFileId(0);

        // When the last file is uploaded and it not invalid
        if (currentDnDFileIndex === dnDfiles.length - 1) {
            dispatch(globalActions.updateDragNDropUploadProgressStatus(false));
        }
    };

    {/* Template One - With Yes & No Button - Overwrite File When User Chooses Yes*/ }
    const onModalOneConfirmedYesToOverwriteFile = () => {
        setShowModalTemplateOne(false);
        processCurrentFile(duplicateFile, true);
    };

    //Helper Function - Check for duplicate and and wait for user feedback to overwrite or skip
    const onConfirmBeforeFileUploadCheckForDuplicate = (file: File): Promise<[File, boolean, number]> => {
        return new Promise<[File, boolean, number]>((resolve, reject) => {
            let duplicateFileCheckModel: IUserAttachmentFileInfoDuplicateCheckModel;
            duplicateFileCheckModel = {
                ...userAttachmentFileInfoDuplicateCheckInitialValue,
                fileName: file.name,
                moduleTypeId: moduleTypeId,
                moduleId: (moduleTypeId === 5) ? sharedFileId ? sharedFileId : 0 : recordId,
                draftId: moduleNewRecordGuid!,
                path: sharepointPath ? sharepointPath : ""
            }
            // Validate from Database mode
            dispatch(duplicateAttachmentInModuleCheckModelAsync({ duplicateFileCheckModel }))
                .then((response) => {
                    const output = response.payload.data as number;
                    if (output > 0) {
                        resolve([file, true, output]); // Resolve with true if duplicate found
                    } else {
                        resolve([file, false, 0]); // Resolve with false if no duplicate found
                    }
                })
                .catch((rejectedValueOrSerializedError) => {
                    writeToBrowserConsole(rejectedValueOrSerializedError);
                    reject(rejectedValueOrSerializedError);
                });
        });
    };

    //Helper Function - Check for duplicate and restrict upload if found
    const onRestrictBeforeFileUploadCheckForDuplicate = (file: File): Promise<[File, boolean]> => {
        return new Promise<[File, boolean]>((resolve, reject) => {
            let duplicateFileCheckModel: IUserAttachmentFileInfoDuplicateCheckModel;
            duplicateFileCheckModel = {
                ...userAttachmentFileInfoDuplicateCheckInitialValue,
                fileName: file.name,
                moduleTypeId: moduleTypeId,
                moduleId: (moduleTypeId === 5) ? sharedFileId ? sharedFileId : 0 : recordId,
                draftId: moduleNewRecordGuid!,
                path: sharepointPath ? sharepointPath : ""
            }
            // Validate from Database mode
            dispatch(duplicateAttachmentInModuleCheckModelAsync({ duplicateFileCheckModel }))
                .then((response) => {
                    const output = response.payload.data as boolean;
                    if (output) {
                        resolve([file, true]); // Resolve with true if duplicate found
                    } else {
                        resolve([file, false]); // Resolve with false if no duplicate found
                    }
                })
                .catch((rejectedValueOrSerializedError) => {
                    writeToBrowserConsole(rejectedValueOrSerializedError);
                    reject(rejectedValueOrSerializedError);
                });
        });
    };

    {/* Event handler close modal popup Two - Template Three - With Cancel Button Only - For Total file upload limit restriction */ }
    const handleCloseModalThree = () => {
        setShowModalTemplateThree(false);
    };

    const updateStateOnLastFileCompletion = () => {
        const isLastFile = lastUploadedDnDFileIndex === dnDfiles.length - 1;
        if (isLastFile) {
            // Loading of grid for Share File module
            if (moduleTypeId === 5) {
                // Completion of uploading of list of files
                dispatch(globalActions.updateDragNDropUploadProgressStatus(false));
            }
        }
    };

    return (
        <>
            <FileUploader
                handleChange={handleDragNDropChange}
                multiple={allowMultipleFileUpload}
                name={"file-upload-dropzone"}
                classes="doc-drag-drop-custom-uploader"
                label={intl.formatMessage({ id: "MOD.PROJECTMANAGEMENT.DROPZONE.AREA.LABEL" })}
            />

            <br />

            <div className="doc-drag-drop-all-items">
                {
                    dnDfilesStatus.map(
                        (file, fileIndex) => {
                            file.progress = 0;

                            if (file.finalFilename) {
                                file.progress = 100;
                            } else {

                                if (file.error && file.error !== "") {
                                    // No Progress 
                                } else {
                                    const uploading = fileIndex === currentDnDFileIndex;
                                    const chunks = Math.ceil(file.size / chunkSize);

                                    if (uploading) {
                                        file.progress = Math.abs(Math.round(currentDnDChunkIndex / chunks * 100));
                                    } else {
                                        file.progress = 0;
                                    }
                                }
                            }

                            const showProgress = () => {
                                if (file.progress && file.progress > 0 && file.error === "") {
                                    return true;
                                } else {
                                    return false;
                                }
                            };

                            const showError = () => {
                                if (file.error && file.error !== "") {
                                    return true;
                                } else {
                                    return false;
                                }
                            }

                            return (
                                <>
                                    <div key={generateUUID()}>
                                        <div className="doc-drag-drop-file-list">
                                            <div className="doc-drag-drop-file-item">
                                                <div className="doc-drag-drop-label">{file.name}</div>
                                                {
                                                    showProgress() &&
                                                    <div className={"doc-drag-drop-progress " + (file.progress === 100 ? 'done' : '')}
                                                        style={{ width: file.progress + '%' }}>
                                                        {file.progress}%
                                                    </div>
                                                }

                                                {
                                                    showError() &&
                                                    <div className={"doc-drag-drop-error done"}
                                                        style={{ width: '100%' }}>
                                                        {file.error}
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </>
                            );
                        }
                    )
                }
            </div>

            {/* Template Two - With Cancel Button Only - For File overwrite restriction */}
            <Modal show={showModalTemplateTwo} onHide={handleCloseModalTwo}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {intl.formatMessage({ id: "MOD.SHAREDFILES.RESTRICT.UPLOAD.DUPLICATE.TITLE" })}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {intl.formatMessage({ id: "MOD.SHAREDFILES.RESTRICT.FILEUPLOAD.DUPLICATE.MESSAGE" })}
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type="button"
                        className="btn MOD_btn btn-cancel w-10"
                        onClick={handleCloseModalTwo}>
                        {intl.formatMessage({ id: "MOD.PROJECTMANAGEMENT.CANCEL" })}
                    </button>
                </Modal.Footer>
            </Modal>

            {/* Template One - With Yes & No Button - For File overwrite User can Choose*/}
            <Modal show={showModalTemplateOne} onHide={handleCloseModalOne}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {intl.formatMessage({ id: "MOD.SHAREDFILES.CONFIRM.UPLOAD.DUPLICATE.TITLE" })}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {confirmationMessageDuplicateFile}
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type="button"
                        className="btn MOD_btn btn-create w-10 pl-5 mx-3"
                        onClick={() => onModalOneConfirmedYesToOverwriteFile()}>
                        {intl.formatMessage({ id: "MOD.DEPWEB.BUTTON.CONFIRMYES" })}
                    </button>
                    <button
                        type="button"
                        className="btn MOD_btn btn-cancel w-10"
                        onClick={onModalOneConfirmedNoToOverwriteFile}>
                        {intl.formatMessage({ id: "MOD.DEPWEB.BUTTON.CONFIRMNO" })}
                    </button>
                </Modal.Footer>
            </Modal>

            {/* Template Three - With Cancel Button Only - For file upload limit notification*/}
            <Modal show={showModalTemplateThree} onHide={handleCloseModalThree}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {/* No title required as per review with Ayman, since title to explain the message cannot be composed in Arabic : 6th November 2024 */}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {intl.formatMessage({ id: "MOD.SHAREDFILES.RESTRICT.UPLOAD.MAX.MESSAGE" })}
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type="button"
                        className="btn MOD_btn btn-cancel w-10"
                        onClick={handleCloseModalThree}>
                        {intl.formatMessage({ id: "MOD.PROJECTMANAGEMENT.CLOSE" })}
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

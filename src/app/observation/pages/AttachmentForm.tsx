import React, { useEffect, useState } from "react";
import { useAppDispatch } from "../../../store";
import { AttachmentManager } from "../components/AttachmentManager";
import { DeleteObservationAttachment, GetAttachmentByObservation } from "../../modules/services/attachmentSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import { useForm } from "react-hook-form";
import { RequestAttachmentList } from "../../../app/models/attachment/AttachmentModel";

type AttachmentFormProps = {
  /** Maps to API's `fatwaId` */
  observationID: number;
};

type FormValues = Record<string, any>;

const AttachmentForm: React.FC<AttachmentFormProps> = ({ observationID }) => {
  const dispatch = useAppDispatch();

  // State
  const [isAttachmentLoading, setIsAttachmentloading] = useState(false);
  const [isFileUploading, setisFileUploading] = useState(false);
  const [attachmentList, setAttachmentList] = useState<RequestAttachmentList[]>([]);
  const [isDeleteLoading, setDeleteLoading] = useState(false);
  const [isViewLoading, setisViewLoading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  const { register, getValues, setValue } = useForm<FormValues>();

  const fetchAttachments = (fatwaId: number) => {
    if (!fatwaId) return;
    setIsAttachmentloading(true);
    dispatch(GetAttachmentByObservation({ observationId: fatwaId }))
      .then(unwrapResult)
      .then((res: any) => {
        if (res?.statusCode === 200) setAttachmentList(res.data ?? []);
      })
      .catch(console.error)
      .finally(() => setIsAttachmentloading(false));
  };

  const handleRefresh = () => fetchAttachments(observationID);

  const onDelete = (requestAttachmentId: number) => {
    setDeleteLoading(true);
    setLoadingIndex(requestAttachmentId);
    dispatch(DeleteObservationAttachment({ observationAttachmentId : requestAttachmentId }))
      .then(unwrapResult)
      .then((res: any) => {
        if (res?.statusCode === 200) handleRefresh();
      })
      .catch(console.error)
      .finally(() => {
        setDeleteLoading(false);
        setLoadingIndex(null);
      });
  };

  useEffect(() => {
    handleRefresh();

  }, [observationID]);

  return (
    <AttachmentManager
      observationID={observationID}
      /** loading & spinners */
      isLoading={isAttachmentLoading}
      isFileUploading={isFileUploading}
      setisFileUploading={setisFileUploading}
      /** form utils used by the uploader */
      register={register}
      setValue={setValue}
      getValues={getValues}
      /** data & actions */
      AttachmentList={attachmentList}
      refresh={handleRefresh}
      OnDeleteCallBack={onDelete}
      /** row action spinners */
      isDeleteLoading={isDeleteLoading}
      setDeleteLoading={setDeleteLoading}
      isViewLoading={isViewLoading}
      setisViewLoading={setisViewLoading}
      loadingIndex={loadingIndex}
      setLoadingIndex={setLoadingIndex}
    />
  );
};

export default AttachmentForm;
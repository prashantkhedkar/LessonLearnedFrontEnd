import { createAsyncThunk } from "@reduxjs/toolkit";
import { responseType } from "../../models/global/responseResult";
import { requests } from "../../helper/axiosInterceptor";

export interface FatwaAttachmentModel {
  id: number | 0,
  observationId : number | 0,
  title: string,
  fileName: string,
  fileBase64: string
}


//requestAttachment
export const UploadFatwaAttachment = createAsyncThunk<any, { attachmentObject: FatwaAttachmentModel }>(
  'Attachment/UploadFatwaAttachment',
  async ({ attachmentObject }, thunkApi) => {
    try {
      return await requests.post<responseType>(`Attachment/UploadFatwaAttachment`, { ...attachmentObject });
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue(error);
    }
  }
);


export const DownloadAttachment = createAsyncThunk<any, { observationAttachmentId }>(
  'Attachment/DownloadAttachment',
  async ({ observationAttachmentId }, thunkApi) => {
    try {
      return await requests.get<responseType>(`/Attachment/DownloadAttachment?observationAttachmentId=${observationAttachmentId}`);
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue(error);
    }
  }
);

export const GetAttachmentByObservation = createAsyncThunk<any, { observationId }>(
  'Attachment/GetAttachmentByObservation',
  async ({ observationId }, thunkApi) => {
    try {
      return await requests.get<responseType>(`/Attachment/GetAttachmentByObservation/${observationId}`);
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue(error);
    }
  }
);


export const DeleteObservationAttachment = createAsyncThunk<any, { observationAttachmentId }>(
  'Attachment/DeleteObservationAttachment',
  async ({ observationAttachmentId }, thunkApi) => {
    try {
      return await requests.delete<responseType>(`/Attachment/DeleteObservationAttachment/${observationAttachmentId}`);
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue(error);
    }
  }
);
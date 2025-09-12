import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { requests } from "../../helper/axiosInterceptor";
import { responseType } from "../../models/global/responseResult";
import { initFeedbackState } from "../../models/stateManagement/feedbackState";
import {
  ServiceFeedbackModel,
  ServiceFeedbackFormModel,
  ServiceFeedbackSearchModel,
  FeedbackLinkModel,
} from "../../models/global/feedbackModel";

// Redux Thunk Actions

export const ValidateFeedbackLink = createAsyncThunk<
  any,
  { token: string; requestId: number }
>("Feedback/ValidateFeedbackLink", async ({ token, requestId }, thunkApi) => {
  try {
    return await requests.get<responseType>(
      `/Feedback/ValidateLink?token=${token}&requestId=${requestId}`
    );
  } catch (error: any) {
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});

export const GetFeedbackByRequestId = createAsyncThunk<
  any,
  { requestId: number }
>("Feedback/GetFeedbackByRequestId", async ({ requestId }, thunkApi) => {
  try {
    return await requests.get<responseType>(
      `/Feedback/GetByRequestId?requestId=${requestId}`
    );
  } catch (error: any) {
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});

export const SubmitFeedback = createAsyncThunk<
  any,
  { formData: ServiceFeedbackFormModel }
>("ServiceRequest/SaveRequestFeedBack", async ({ formData }, thunkApi) => {
  try {
    return await requests.post<responseType>(
      "/ServiceRequest/SaveRequestFeedBack",
      formData
    );
  } catch (error: any) {
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});

export const GetFeedbackList = createAsyncThunk<
  any,
  { searchModel: ServiceFeedbackSearchModel }
>("Feedback/GetFeedbackList", async ({ searchModel }, thunkApi) => {
  try {
    return await requests.post<responseType>("/Feedback/GetList", searchModel);
  } catch (error: any) {
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});

export const TriggerFeedbackNotification = createAsyncThunk<
  any,
  { requestId: number }
>("Feedback/TriggerNotification", async ({ requestId }, thunkApi) => {
  try {
    return await requests.post<responseType>(`/Feedback/TriggerNotification`, {
      requestId,
    });
  } catch (error: any) {
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});

export const ExpireFeedbackLink = createAsyncThunk<any, { requestId: number }>(
  "Feedback/ExpireLink",
  async ({ requestId }, thunkApi) => {
    try {
      return await requests.post<responseType>(`/Feedback/ExpireLink`, {
        requestId,
      });
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

// Redux Slice
export const feedbackSlice = createSlice({
  name: "feedback",
  initialState: initFeedbackState,
  reducers: {
    clearFeedbackError: (state) => {
      state.error = null;
    },
    resetFeedbackState: (state) => {
      return initFeedbackState;
    },
    setLinkValidation: (state, action) => {
      state.linkValidation = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Validate Feedback Link
      .addCase(ValidateFeedbackLink.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(ValidateFeedbackLink.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.data?.isSuccess) {
          state.linkValidation = action.payload.data.result;
        } else {
          state.error =
            action.payload?.data?.message || "Link validation failed";
        }
      })
      .addCase(ValidateFeedbackLink.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.error || "Link validation failed";
      })

      // Get Feedback by Request ID
      .addCase(GetFeedbackByRequestId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(GetFeedbackByRequestId.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.data?.isSuccess) {
          state.feedbackData = action.payload.data.result;
        } else {
          state.error =
            action.payload?.data?.message || "Failed to fetch feedback";
        }
      })
      .addCase(GetFeedbackByRequestId.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.error || "Failed to fetch feedback";
      })

      // Submit Feedback
      .addCase(SubmitFeedback.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(SubmitFeedback.fulfilled, (state, action) => {
        state.isSubmitting = false;
        if (action.payload?.data?.isSuccess) {
          state.feedbackData = action.payload.data.result;
        } else {
          state.error =
            action.payload?.data?.message || "Failed to submit feedback";
        }
      })
      .addCase(SubmitFeedback.rejected, (state, action: any) => {
        state.isSubmitting = false;
        state.error = action.payload?.error || "Failed to submit feedback";
      })

      // Get Feedback List
      .addCase(GetFeedbackList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(GetFeedbackList.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.data?.isSuccess) {
          state.feedbackList = action.payload.data.result.data || [];
          state.totalRecords = action.payload.data.result.totalRecords || 0;
        } else {
          state.error =
            action.payload?.data?.message || "Failed to fetch feedback list";
        }
      })
      .addCase(GetFeedbackList.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.error || "Failed to fetch feedback list";
      })

      // Trigger Feedback Notification
      .addCase(TriggerFeedbackNotification.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(TriggerFeedbackNotification.fulfilled, (state, action) => {
        state.isLoading = false;
        if (!action.payload?.data?.isSuccess) {
          state.error =
            action.payload?.data?.message || "Failed to trigger notification";
        }
      })
      .addCase(TriggerFeedbackNotification.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.error || "Failed to trigger notification";
      })

      // Expire Feedback Link
      .addCase(ExpireFeedbackLink.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(ExpireFeedbackLink.fulfilled, (state, action) => {
        state.isLoading = false;
        if (!action.payload?.data?.isSuccess) {
          state.error =
            action.payload?.data?.message || "Failed to expire link";
        }
      })
      .addCase(ExpireFeedbackLink.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.error || "Failed to expire link";
      });
  },
});

export const { clearFeedbackError, resetFeedbackState, setLinkValidation } =
  feedbackSlice.actions;

export default feedbackSlice.reducer;

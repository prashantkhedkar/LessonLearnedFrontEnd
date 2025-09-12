import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { requests } from "../../helper/axiosInterceptor";
import { responseType } from "../../models/global/responseResult";

// Initial state for recommendation slice
interface RecommendationState {
  recommendations: any[];
  loading: boolean;
  error: string | null;
}

const initialRecommendationState: RecommendationState = {
  recommendations: [],
  loading: false,
  error: null,
};

// API calls for recommendations
export const fetchRecommendationsByObservationId = createAsyncThunk<
  any,
  { observationId: number | string }
>(
  'recommendation/fetchByObservationId',
  async ({ observationId }, thunkApi) => {
    try {
      return await requests.get<responseType>(
        `/Generic/GetRecommendationsByObservationId?observationId=${observationId}`
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const saveRecommendationForObservation = createAsyncThunk<
  any,
  { 
    observationId: number | string,
    recommendationData: {
      id?: number,
      title: string,
      conclusion: string,
      recommendation: string,
      discussion: string,
      combotFunction: string,
      level: string
    }
  }
>(
  'recommendation/saveForObservation',
  async ({ observationId, recommendationData }, thunkApi) => {
    try {
      return await requests.post<responseType>(
        `/Generic/SaveRecommendationForObservation`,
        {
          observationId,
          ...recommendationData
        }
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const updateRecommendationForObservation = createAsyncThunk<
  any,
  { 
    recommendationId: number,
    recommendationData: {
      title: string,
      conclusion: string,
      recommendation: string,
      discussion: string,
      combotFunction: string,
      level: string
    }
  }
>(
  'recommendation/updateForObservation',
  async ({ recommendationId, recommendationData }, thunkApi) => {
    try {
      return await requests.put<responseType>(
        `/Generic/UpdateRecommendationForObservation/${recommendationId}`,
        recommendationData
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const deleteRecommendationForObservation = createAsyncThunk<
  any,
  { recommendationId: number }
>(
  'recommendation/deleteForObservation',
  async ({ recommendationId }, thunkApi) => {
    try {
      return await requests.delete<responseType>(
        `/Generic/DeleteRecommendationForObservation/${recommendationId}`
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

// Create Redux Slice for recommendations
export const recommendationSlice = createSlice({
  name: "recommendation",
  initialState: initialRecommendationState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setRecommendations: (state, action) => {
      state.recommendations = action.payload;
    },
    addRecommendation: (state, action) => {
      state.recommendations.push(action.payload);
    },
    updateRecommendation: (state, action) => {
      const index = state.recommendations.findIndex(rec => rec.id === action.payload.id);
      if (index !== -1) {
        state.recommendations[index] = { ...state.recommendations[index], ...action.payload };
      }
    },
    removeRecommendation: (state, action) => {
      state.recommendations = state.recommendations.filter(rec => rec.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // Fetch recommendations
    builder
      .addCase(fetchRecommendationsByObservationId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecommendationsByObservationId.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.statusCode === 200) {
          state.recommendations = action.payload.data || [];
        } else {
          state.error = 'Failed to fetch recommendations';
        }
      })
      .addCase(fetchRecommendationsByObservationId.rejected, (state, action) => {
        state.loading = false;
        state.error = 'Error fetching recommendations';
      });

    // Save recommendation
    builder
      .addCase(saveRecommendationForObservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveRecommendationForObservation.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.statusCode === 200) {
          const savedRecommendation = action.payload.data;
          if (savedRecommendation) {
            state.recommendations.push(savedRecommendation);
          }
        } else {
          state.error = 'Failed to save recommendation';
        }
      })
      .addCase(saveRecommendationForObservation.rejected, (state, action) => {
        state.loading = false;
        state.error = 'Error saving recommendation';
      });

    // Update recommendation
    builder
      .addCase(updateRecommendationForObservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRecommendationForObservation.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.statusCode === 200) {
          const updatedRecommendation = action.payload.data;
          if (updatedRecommendation) {
            const index = state.recommendations.findIndex(rec => rec.id === updatedRecommendation.id);
            if (index !== -1) {
              state.recommendations[index] = { ...state.recommendations[index], ...updatedRecommendation };
            }
          }
        } else {
          state.error = 'Failed to update recommendation';
        }
      })
      .addCase(updateRecommendationForObservation.rejected, (state, action) => {
        state.loading = false;
        state.error = 'Error updating recommendation';
      });

    // Delete recommendation
    builder
      .addCase(deleteRecommendationForObservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRecommendationForObservation.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.statusCode === 200) {
          // Extract recommendationId from the original action
          const recommendationId = action.meta.arg.recommendationId;
          state.recommendations = state.recommendations.filter(rec => rec.id !== recommendationId);
        } else {
          state.error = 'Failed to delete recommendation';
        }
      })
      .addCase(deleteRecommendationForObservation.rejected, (state, action) => {
        state.loading = false;
        state.error = 'Error deleting recommendation';
      });
  },
});

// Export actions
export const { 
  clearError, 
  setRecommendations, 
  addRecommendation, 
  updateRecommendation, 
  removeRecommendation 
} = recommendationSlice.actions;

// Export reducer
export default recommendationSlice.reducer;

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { requests } from "../../helper/axiosInterceptor";
import { responseType } from "../../models/global/responseResult";
import { 
  ObservationModel, 
  ArticleCreateUpdateModel, 
  ArticleSearchModel,
  ArticleApiResponse 
} from "../../observation/models/observationModel";

// Initial state for observation slice
interface ObservationState {
  observations: ObservationModel[];
  currentObservation: ObservationModel | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

const initialObservationState: ObservationState = {
  observations: [],
  currentObservation: null,
  loading: false,
  error: null,
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  totalPages: 0,
};

// API calls for observations
export const fetchObservations = createAsyncThunk<
  any,
  ArticleSearchModel
>(
  'observation/fetchObservations',
  async (searchParams, thunkApi) => {
    try {
      return await requests.post<responseType>(
        `/Observation/search`,
        searchParams
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const fetchAllObservations = createAsyncThunk<any, void>(
  'observation/fetchAllObservations',
  async (_, thunkApi) => {
    try {
      return await requests.get<responseType>(
        `/Observation/GetAllArticles`
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const fetchObservationById = createAsyncThunk<
  any,
  { articleId: number }
>(
  'observation/fetchById',
  async ({ articleId }, thunkApi) => {
    try {
      return await requests.get<responseType>(
        `/Observation/GetArticleById/${articleId}`
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const createObservation = createAsyncThunk<
  any,
  { 
    observationData: ArticleCreateUpdateModel,
    submissionStatus?: string
  }
>(
  'observation/create',
  async ({ observationData, submissionStatus = 'Draft' }, thunkApi) => {
    try {
      return await requests.post<responseType>(
        `/Observation/Create?submissionStatus=${submissionStatus}`,
        observationData
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const updateObservation = createAsyncThunk<
  any,
  { 
    articleId: number,
    observationData: ArticleCreateUpdateModel
  }
>(
  'observation/update',
  async ({ articleId, observationData }, thunkApi) => {
    try {
      return await requests.put<responseType>(
        `/Observation/${articleId}/UpdateArticle`,
        observationData
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const deleteObservation = createAsyncThunk<
  any,
  { articleId: number }
>(
  'observation/delete',
  async ({ articleId }, thunkApi) => {
    try {
      return await requests.delete<responseType>(
        `/Observation/DeleteArticle/${articleId}`
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const submitObservation = createAsyncThunk<
  any,
  { 
    articleId: number,
    notes?: string
  }
>(
  'observation/submit',
  async ({ articleId, notes }, thunkApi) => {
    try {
      return await requests.post<responseType>(
        `/Observation/${articleId}/Submit`,
        { notes }
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const approveObservation = createAsyncThunk<
  any,
  { 
    articleId: number,
    notes?: string
  }
>(
  'observation/approve',
  async ({ articleId, notes }, thunkApi) => {
    try {
      return await requests.post<responseType>(
        `/Observation/${articleId}/Approve`,
        { notes }
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const rejectObservation = createAsyncThunk<
  any,
  { 
    articleId: number,
    reason: string,
    notes?: string
  }
>(
  'observation/reject',
  async ({ articleId, reason, notes }, thunkApi) => {
    try {
      return await requests.post<responseType>(
        `/Observation/${articleId}/Reject`,
        { reason, notes }
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const archiveObservation = createAsyncThunk<
  any,
  { 
    articleId: number,
    reason: string
  }
>(
  'observation/archive',
  async ({ articleId, reason }, thunkApi) => {
    try {
      return await requests.post<responseType>(
        `/Observation/${articleId}/Archive`,
        { reason }
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const fetchObservationStats = createAsyncThunk<any, void>(
  'observation/fetchStats',
  async (_, thunkApi) => {
    try {
      return await requests.get<responseType>(
        `/Observation/GetStats`
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const fetchObservationLookupData = createAsyncThunk<any, void>(
  'observation/fetchLookupData',
  async (_, thunkApi) => {
    try {
      return await requests.get<responseType>(
        `/Observation/GetLookupData`
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const checkObservationTitleAvailability = createAsyncThunk<
  any,
  { title: string, excludeId?: number }
>(
  'observation/checkTitleAvailability',
  async ({ title, excludeId }, thunkApi) => {
    try {
      const url = excludeId 
        ? `/Observation/CheckTitleAvailability?title=${encodeURIComponent(title)}&excludeId=${excludeId}`
        : `/Observation/CheckTitleAvailability?title=${encodeURIComponent(title)}`;
      return await requests.get<responseType>(url);
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

// Create Redux Slice for observations
export const observationSlice = createSlice({
  name: "observation",
  initialState: initialObservationState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setObservations: (state, action) => {
      state.observations = action.payload;
    },
    setCurrentObservation: (state, action) => {
      state.currentObservation = action.payload;
    },
    clearObservations: (state) => {
      state.observations = [];
      state.currentObservation = null;
    },
  },
  extraReducers: (builder) => {
    // Only handle loading states for all async actions
    builder
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state) => {
          state.loading = false;
          state.error = 'Operation failed';
        }
      );
  },
});

// Export actions
export const { 
  clearError, 
  setLoading,
  setError,
  setObservations, 
  setCurrentObservation,
  clearObservations,
} = observationSlice.actions;

// Export reducer
export default observationSlice.reducer;

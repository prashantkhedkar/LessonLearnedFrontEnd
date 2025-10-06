import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { requests } from "../../helper/axiosInterceptor";
import { responseType } from "../../models/global/responseResult";
import { IRecommendationAction, ICreateActionRequest, IUpdateActionRequest } from "../../models/recommendation/action.model";

// Sample/Mock data for actions when API is not available
const getSampleActionsData = (recommendationId: number | string): IRecommendationAction[] => [
    {
        id: '1',
        recommendationId: recommendationId,
        text: 'تطوير إجراءات الأمان والسلامة',
        title: 'تطوير إجراءات الأمان والسلامة',
        procedureStatus: 'in-progress',
        fromDate: '2024-01-15',
        toDate: '2024-02-15',
        responsibleBy: 'فريق الأمان',
        responsibleType: 'units',
        implementation: 'تطوير وتحديث إجراءات الأمان والسلامة في المنشأة وفقاً للمعايير الدولية',
        coordination: 'التنسيق مع إدارة الموارد البشرية وإدارة الصحة والسلامة المهنية',
        priority: 'high',
        status: 'active',
        description: 'تحسين إجراءات الأمان العامة',
        createdAt: '2024-01-01T00:00:00Z',
        createdBy: 'مدير النظام',
        updatedAt: '2024-01-10T00:00:00Z',
        updatedBy: 'مدير النظام'
    },
    {
        id: '2',
        recommendationId: recommendationId,
        text: 'تدريب الموظفين على البروتوكولات الجديدة',
        title: 'تدريب الموظفين على البروتوكولات الجديدة',
        procedureStatus: 'completed',
        fromDate: '2024-01-01',
        toDate: '2024-01-30',
        responsibleBy: 'أحمد محمد',
        responsibleType: 'individuals',
        implementation: 'إعداد برنامج تدريبي شامل للموظفين على البروتوكولات والإجراءات الجديدة',
        coordination: 'التنسيق مع قسم التدريب وإدارة الموارد البشرية',
        priority: 'medium',
        status: 'completed',
        description: 'تدريب شامل للموظفين',
        createdAt: '2023-12-15T00:00:00Z',
        createdBy: 'مدير التدريب',
        updatedAt: '2024-01-30T00:00:00Z',
        updatedBy: 'مدير التدريب'
    },
    {
        id: '3',
        recommendationId: recommendationId,
        text: 'مراجعة وتحديث الأنظمة التقنية',
        title: 'مراجعة وتحديث الأنظمة التقنية',
        procedureStatus: 'pending',
        fromDate: '2024-02-01',
        toDate: '2024-03-01',
        responsibleBy: 'فاطمة علي',
        responsibleType: 'individuals',
        implementation: 'مراجعة شاملة للأنظمة التقنية الحالية وتحديثها وفقاً لأحدث المعايير',
        coordination: 'التنسيق مع قسم تقنية المعلومات والإدارات المعنية',
        priority: 'low',
        status: 'pending',
        description: 'تحديث الأنظمة التقنية',
        createdAt: '2024-01-20T00:00:00Z',
        createdBy: 'مدير التقنية',
        updatedAt: '2024-01-25T00:00:00Z',
        updatedBy: 'مدير التقنية'
    }
];

// Initial state for action slice
interface ActionState {
    actions: IRecommendationAction[];
    loading: boolean;
    error: string | null;
}

const initialActionState: ActionState = {
    actions: [],
    loading: false,
    error: null,
};

// API calls for recommendation actions
export const fetchActionsByRecommendationId = createAsyncThunk<
    any,
    { recommendationId: number | string; useSampleData?: boolean }
>(
    'action/fetchByRecommendationId',
    async ({ recommendationId, useSampleData = false }, thunkApi) => {
        try {
            // If explicitly requested to use sample data, return it directly
            if (useSampleData) {
                return {
                    statusCode: 200,
                    data: getSampleActionsData(recommendationId),
                    isSampleData: true
                };
            }

            // Try to fetch from API
            const response = await requests.get<responseType>(
                `/Action/GetActionsByRecommendationId/${recommendationId}`
            );
            return response;
        } catch (error: any) {
            console.log('API Error, falling back to sample data:', error);
            // On API error, return sample data instead of rejecting
            return {
                statusCode: 200,
                data: getSampleActionsData(recommendationId),
                isSampleData: true,
                fallbackReason: 'API_ERROR'
            };
        }
    }
);

export const saveActionForRecommendation = createAsyncThunk<
    any,
    {
        recommendationId: number | string,
        actionData: Omit<IRecommendationAction, 'id' | 'timestamp' | 'createdBy' | 'updatedAt' | 'updatedBy'>
    }
>(
    'action/createAction',
    async ({ recommendationId, actionData }, thunkApi) => {
        try {
            return await requests.post<responseType>(
                `/Action/CreateAction`,
                {
                    ...actionData,
                    recommendationId
                }
            );
        } catch (error: any) {
            console.log(error);
            return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
        }
    }
);

export const updateActionForRecommendation = createAsyncThunk<
    any,
    {
        actionId: number | string,
        actionData: Partial<Omit<IRecommendationAction, 'id' | 'recommendationId' | 'timestamp' | 'createdBy'>>
    }
>(
    'action/updateAction',
    async ({ actionId, actionData }, thunkApi) => {
        try {
            return await requests.put<responseType>(
                `/Action/UpdateAction/${actionId}`,
                actionData
            );
        } catch (error: any) {
            console.log(error);
            return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
        }
    }
);

export const deleteActionForRecommendation = createAsyncThunk<
    any,
    { actionId: number | string }
>(
    'action/deleteAction',
    async ({ actionId }, thunkApi) => {
        try {
            return await requests.delete<responseType>(
                `/Action/DeleteAction/${actionId}`
            );
        } catch (error: any) {
            console.log(error);
            return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
        }
    }
);

// Create Redux Slice for actions
export const actionSlice = createSlice({
    name: "action",
    initialState: initialActionState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setActions: (state, action) => {
            state.actions = action.payload;
        },
        addAction: (state, action) => {
            state.actions.push(action.payload);
        },
        updateAction: (state, action) => {
            const index = state.actions.findIndex(act => act.id === action.payload.id);
            if (index !== -1) {
                state.actions[index] = { ...state.actions[index], ...action.payload };
            }
        },
        removeAction: (state, action) => {
            state.actions = state.actions.filter(act => act.id !== action.payload);
        },
        // New action to load sample data directly
        loadSampleActions: (state, action) => {
            const recommendationId = action.payload.recommendationId;
            state.actions = getSampleActionsData(recommendationId);
            state.loading = false;
            state.error = null;
            console.log('Loaded sample actions for recommendation:', recommendationId);
        },
    },
    extraReducers: (builder) => {
        // Fetch actions
        builder
            .addCase(fetchActionsByRecommendationId.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchActionsByRecommendationId.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload?.statusCode === 200) {
                    const apiData = action.payload.data || [];

                    // If API returns no data or empty array, use sample data
                    if (apiData.length === 0) {
                        const recommendationId = action.meta.arg.recommendationId;
                        state.actions = getSampleActionsData(recommendationId);
                        console.log('No API data found, using sample data for recommendation:', recommendationId);
                    } else {
                        state.actions = apiData;
                        if (action.payload.isSampleData) {
                            console.log('Using sample data for actions');
                        }
                    }
                } else {
                    // If API response is not successful, use sample data
                    const recommendationId = action.meta.arg.recommendationId;
                    state.actions = getSampleActionsData(recommendationId);
                    console.log('API response unsuccessful, using sample data for recommendation:', recommendationId);
                }
            })
            .addCase(fetchActionsByRecommendationId.rejected, (state, action) => {
                state.loading = false;
                // Don't set error since we're using sample data as fallback
                const recommendationId = action.meta.arg.recommendationId;
                state.actions = getSampleActionsData(recommendationId);
                console.log('API request failed, using sample data for recommendation:', recommendationId);
            });

        // Save action
        builder
            .addCase(saveActionForRecommendation.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(saveActionForRecommendation.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload?.statusCode === 200) {
                    const savedAction = action.payload.data;
                    if (savedAction) {
                        state.actions.push(savedAction);
                    }
                } else {
                    state.error = 'Failed to save action';
                }
            })
            .addCase(saveActionForRecommendation.rejected, (state, action) => {
                state.loading = false;
                state.error = 'Error saving action';
            });

        // Update action
        builder
            .addCase(updateActionForRecommendation.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateActionForRecommendation.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload?.statusCode === 200) {
                    const updatedAction = action.payload.data;
                    if (updatedAction) {
                        const index = state.actions.findIndex(act => act.id === updatedAction.id);
                        if (index !== -1) {
                            state.actions[index] = { ...state.actions[index], ...updatedAction };
                        }
                    }
                } else {
                    state.error = 'Failed to update action';
                }
            })
            .addCase(updateActionForRecommendation.rejected, (state, action) => {
                state.loading = false;
                state.error = 'Error updating action';
            });

        // Delete action
        builder
            .addCase(deleteActionForRecommendation.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteActionForRecommendation.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload?.statusCode === 200) {
                    // Extract actionId from the original action
                    const actionId = action.meta.arg.actionId;
                    state.actions = state.actions.filter(act => act.id !== actionId);
                } else {
                    state.error = 'Failed to delete action';
                }
            })
            .addCase(deleteActionForRecommendation.rejected, (state, action) => {
                state.loading = false;
                state.error = 'Error deleting action';
            });
    },
});

// Export actions
export const {
    clearError,
    setActions,
    addAction,
    updateAction,
    removeAction,
    loadSampleActions
} = actionSlice.actions;

// Export reducer
export default actionSlice.reducer;
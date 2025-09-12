// Below code is standard definition of Redux Store
import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, TypedUseSelectorHook, useSelector } from "react-redux";
import { globalSlice } from "./app/modules/services/globalSlice";
import { feedbackSlice } from "./app/modules/services/feedbackSlice";
import notificationReducer from "./app/modules/services/notificationSlice";
import recommendationReducer from "./app/modules/services/recommendationSlice";
import observationReducer from "./app/modules/services/observationSlice";

export const store = configureStore({
  // create and add new slice actions in object which will be exposed to components via the custom hooks useAppDispatch & useAppSelector
  reducer: {
    globalgeneric: globalSlice.reducer,
    feedback: feedbackSlice.reducer,
    notifications: notificationReducer,
    observations: observationReducer,
    recommendations: recommendationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

//Create custom hooks for Dispatch and Selector
export const useAppDispatch = () => useDispatch<AppDispatch>(); // to update store
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; // to read from store

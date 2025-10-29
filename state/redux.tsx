"use client";

import { useRef } from "react";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { setupListeners } from "@reduxjs/toolkit/query";
import globalReducer from "@/state";
import { authSlice } from "@/src/domains/auth";
import { apiSlice } from "@/redux/features/api/apiSlice";
import { api } from "@/state/api";
// New domain-based APIs
import { teacherPracticeApiSlice } from "@/src/domains/teacher/practice-courses/api";
import { teacherVideoCourseApiSlice } from "@/src/domains/teacher/video-courses/api";
import { studentPracticeApiSlice } from "@/src/domains/student/practice-courses/api";
import { studentVideoCourseApiSlice } from "@/src/domains/student/video-courses/api";
import { studentLeaderboardApiSlice } from "@/src/domains/student/leaderboard/api";
import { studentAchievementsApiSlice } from "@/src/domains/student/achievements/api";
// import { adminApi } from "@modules/admin"; // Temporarily disabled
import courseEditorSlice from "@/redux/features/courseEditor/courseEditorSlice";

/* REDUX STORE */
const rootReducer = combineReducers({
  global: globalReducer,
  auth: authSlice,
  courseEditor: courseEditorSlice,
  // Legacy Django API (for auth and shared features)
  [apiSlice.reducerPath]: apiSlice.reducer,
  // Legacy API for billing and transactions
  [api.reducerPath]: api.reducer,
  // New separated APIs
  [teacherPracticeApiSlice.reducerPath]: teacherPracticeApiSlice.reducer,
  [teacherVideoCourseApiSlice.reducerPath]: teacherVideoCourseApiSlice.reducer,
  [studentPracticeApiSlice.reducerPath]: studentPracticeApiSlice.reducer,
  [studentVideoCourseApiSlice.reducerPath]: studentVideoCourseApiSlice.reducer,
  [studentLeaderboardApiSlice.reducerPath]: studentLeaderboardApiSlice.reducer,
  [studentAchievementsApiSlice.reducerPath]: studentAchievementsApiSlice.reducer,
  // Admin specific API - temporarily disabled
  // [adminApi.reducerPath]: adminApi.reducer,
});

export const makeStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [
            "api/executeMutation/pending",
            "api/executeMutation/fulfilled", 
            "api/executeMutation/rejected",
            "apiSlice/executeMutation/pending",
            "apiSlice/executeMutation/fulfilled",
            "apiSlice/executeMutation/rejected",
          ],
          ignoredActionPaths: [
            "meta.arg.originalArgs.file",
            "meta.arg.originalArgs.formData",
            "payload.chapter.video",
            "meta.baseQueryMeta.request",
            "meta.baseQueryMeta.response",
          ],
          ignoredPaths: [
            "global.courseEditor.sections",
            "entities.videos.data",
            "meta.baseQueryMeta.request",
            "meta.baseQueryMeta.response",
          ],
        },
      })
      .concat(apiSlice.middleware)
      .concat(api.middleware)
      .concat(teacherPracticeApiSlice.middleware)
      .concat(teacherVideoCourseApiSlice.middleware)
      .concat(studentPracticeApiSlice.middleware)
      .concat(studentVideoCourseApiSlice.middleware)
      .concat(studentLeaderboardApiSlice.middleware)
      .concat(studentAchievementsApiSlice.middleware),
  });
};

/* REDUX TYPES */
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/* PROVIDER */
export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore | undefined>(undefined);
  if (!storeRef.current) {
    storeRef.current = makeStore();
    setupListeners(storeRef.current.dispatch);
  }
  return <Provider store={storeRef.current}>{children}</Provider>;
}

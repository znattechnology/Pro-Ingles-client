import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Types for course editor
export interface CourseSection {
  sectionId: string;
  sectionTitle: string;
  sectionDescription?: string;
  order?: number;
  chapters?: CourseChapter[];
}

export interface CourseChapter {
  chapterId: string;
  title: string;
  description?: string;
  content?: string;
  type: 'Text' | 'Video' | 'Quiz' | 'Exercise';
  video?: string;
  videoUrl?: string | null;
  order?: number;
  hasVideo?: boolean;
  transcript?: string;
  quiz_enabled?: boolean;
  quiz_data?: any; // QuizData from QuizBuilder
  resources_data?: any[];
  practice_lesson?: string;
  practice_selection?: any; // PracticeSelection from PracticeCourseSelector
}

interface CourseEditorState {
  sections: CourseSection[];
  currentCourse: {
    courseId?: string;
    title?: string;
    description?: string;
    category?: string;
    status?: string;
    image?: string;
  };
  loading: {
    isCreatingSection: boolean;
    isCreatingChapter: string | null; // sectionId when creating chapter for that section
    isSavingCourse: boolean;
    isUploadingImage: boolean;
    isUploadingVideo: string | null; // chapterId when uploading video for that chapter
    isUploadingResource: string | null; // chapterId when uploading resource for that chapter
  };
  ui: {
    isCreatingSection: boolean;
    isCreatingChapter: string | null; // sectionId when in creation mode
    selectedSectionId: string | null;
    selectedChapterId: string | null;
  };
}

const initialState: CourseEditorState = {
  sections: [],
  currentCourse: {},
  loading: {
    isCreatingSection: false,
    isCreatingChapter: null,
    isSavingCourse: false,
    isUploadingImage: false,
    isUploadingVideo: null,
    isUploadingResource: null,
  },
  ui: {
    isCreatingSection: false,
    isCreatingChapter: null,
    selectedSectionId: null,
    selectedChapterId: null,
  },
};

export const courseEditorSlice = createSlice({
  name: "courseEditor",
  initialState,
  reducers: {
    // Course actions
    setCourseData: (state, action: PayloadAction<Partial<CourseEditorState['currentCourse']>>) => {
      state.currentCourse = { ...state.currentCourse, ...action.payload };
    },
    
    // Section actions
    setSections: (state, action: PayloadAction<CourseSection[]>) => {
      state.sections = action.payload;
    },
    
    addSection: (state, action: PayloadAction<CourseSection>) => {
      state.sections.push(action.payload);
    },
    
    updateSection: (state, action: PayloadAction<{ sectionId: string; data: Partial<CourseSection> }>) => {
      const index = state.sections.findIndex(s => s.sectionId === action.payload.sectionId);
      if (index !== -1) {
        state.sections[index] = { ...state.sections[index], ...action.payload.data };
      }
    },
    
    removeSectionFromEditor: (state, action: PayloadAction<string>) => {
      state.sections = state.sections.filter(s => s.sectionId !== action.payload);
    },
    
    // Chapter actions
    addChapterToSection: (state, action: PayloadAction<{ sectionId: string; chapter: CourseChapter }>) => {
      const sectionIndex = state.sections.findIndex(s => s.sectionId === action.payload.sectionId);
      if (sectionIndex !== -1) {
        if (!state.sections[sectionIndex].chapters) {
          state.sections[sectionIndex].chapters = [];
        }
        state.sections[sectionIndex].chapters!.push(action.payload.chapter);
      }
    },
    
    updateChapterInSection: (state, action: PayloadAction<{ sectionId: string; chapterId: string; data: Partial<CourseChapter> }>) => {
      const sectionIndex = state.sections.findIndex(s => s.sectionId === action.payload.sectionId);
      if (sectionIndex !== -1 && state.sections[sectionIndex].chapters) {
        const chapterIndex = state.sections[sectionIndex].chapters!.findIndex(c => c.chapterId === action.payload.chapterId);
        if (chapterIndex !== -1) {
          state.sections[sectionIndex].chapters![chapterIndex] = {
            ...state.sections[sectionIndex].chapters![chapterIndex],
            ...action.payload.data
          };
        }
      }
    },
    
    removeChapterFromSection: (state, action: PayloadAction<{ sectionId: string; chapterId: string }>) => {
      const sectionIndex = state.sections.findIndex(s => s.sectionId === action.payload.sectionId);
      if (sectionIndex !== -1 && state.sections[sectionIndex].chapters) {
        state.sections[sectionIndex].chapters = state.sections[sectionIndex].chapters!.filter(
          c => c.chapterId !== action.payload.chapterId
        );
      }
    },
    
    // Loading actions
    setCreatingSectionLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.isCreatingSection = action.payload;
    },
    
    setCreatingChapterLoading: (state, action: PayloadAction<string | null>) => {
      state.loading.isCreatingChapter = action.payload;
    },
    
    setSavingCourseLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.isSavingCourse = action.payload;
    },
    
    setUploadingImageLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.isUploadingImage = action.payload;
    },
    
    setUploadingVideoLoading: (state, action: PayloadAction<string | null>) => {
      state.loading.isUploadingVideo = action.payload;
    },
    
    setUploadingResourceLoading: (state, action: PayloadAction<string | null>) => {
      state.loading.isUploadingResource = action.payload;
    },
    
    // UI actions
    setCreatingSectionUI: (state, action: PayloadAction<boolean>) => {
      state.ui.isCreatingSection = action.payload;
    },
    
    setCreatingChapterUI: (state, action: PayloadAction<string | null>) => {
      state.ui.isCreatingChapter = action.payload;
    },
    
    setSelectedSection: (state, action: PayloadAction<string | null>) => {
      state.ui.selectedSectionId = action.payload;
    },
    
    setSelectedChapter: (state, action: PayloadAction<string | null>) => {
      state.ui.selectedChapterId = action.payload;
    },
    
    // Reset actions
    resetCourseEditor: (state) => {
      return initialState;
    },
    
    resetLoading: (state) => {
      state.loading = initialState.loading;
    },
  },
});

// Export actions
export const {
  setCourseData,
  setSections,
  addSection,
  updateSection,
  removeSectionFromEditor,
  addChapterToSection,
  updateChapterInSection,
  removeChapterFromSection,
  setCreatingSectionLoading,
  setCreatingChapterLoading,
  setSavingCourseLoading,
  setUploadingImageLoading,
  setUploadingVideoLoading,
  setUploadingResourceLoading,
  setCreatingSectionUI,
  setCreatingChapterUI,
  setSelectedSection,
  setSelectedChapter,
  resetCourseEditor,
  resetLoading,
} = courseEditorSlice.actions;

export default courseEditorSlice.reducer;
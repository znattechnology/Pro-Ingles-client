/**
 * Laboratory State Slice - Gerenciamento de estado do laboratório
 * 
 * Este slice gerencia o estado local da interface do laboratório,
 * incluindo filtros, seleções, modos de visualização, etc.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface Course {
  id: string;
  title: string;
  description?: string;
  image?: string;
  category?: string;
  level?: string;
  status?: string;
  course_type?: string;
  template?: string;
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  order: number;
  challenges?: Challenge[];
  completed?: boolean;
}

export interface Challenge {
  id: string;
  type: 'SELECT' | 'ASSIST' | 'FILL_BLANK' | 'TRANSLATION' | 'LISTENING' | 'SPEAKING';
  question: string;
  order: number;
  options?: ChallengeOption[];
  completed?: boolean;
}

export interface ChallengeOption {
  id: string;
  text: string;
  is_correct?: boolean;
  image_url?: string;
  audio_url?: string;
  order: number;
}

export interface UserProgress {
  hearts: number;
  points: number;
  user_image_src: string;
  active_course: Course | null;
  streak?: number;
}

// State interface
interface LaboratoryState {
  // UI State
  viewMode: 'grid' | 'list';
  selectedCourse: Course | null;
  selectedUnit: Unit | null;
  selectedLesson: Lesson | null;
  
  // Filters and Search
  searchQuery: string;
  categoryFilter: string | null;
  levelFilter: string | null;
  statusFilter: 'all' | 'published' | 'draft';
  
  // Practice Session State
  isInPracticeSession: boolean;
  currentChallengeIndex: number;
  sessionProgress: {
    correctAnswers: number;
    totalAnswers: number;
    heartsUsed: number;
    pointsEarned: number;
  };
  
  // Temporary state during creation/editing
  isCreating: boolean;
  isEditing: boolean;
  editingItem: 'course' | 'unit' | 'lesson' | 'challenge' | null;
  
  // Loading states for complex operations
  loadingStates: {
    courses: boolean;
    units: boolean;
    lessons: boolean;
    userProgress: boolean;
    challengeSubmission: boolean;
  };
  
  // Error states
  errors: {
    courses: string | null;
    units: string | null;
    lessons: string | null;
    userProgress: string | null;
    challengeSubmission: string | null;
  };
}

// Initial state
const initialState: LaboratoryState = {
  // UI State
  viewMode: 'grid',
  selectedCourse: null,
  selectedUnit: null,
  selectedLesson: null,
  
  // Filters and Search
  searchQuery: '',
  categoryFilter: null,
  levelFilter: null,
  statusFilter: 'all',
  
  // Practice Session State
  isInPracticeSession: false,
  currentChallengeIndex: 0,
  sessionProgress: {
    correctAnswers: 0,
    totalAnswers: 0,
    heartsUsed: 0,
    pointsEarned: 0,
  },
  
  // Temporary state during creation/editing
  isCreating: false,
  isEditing: false,
  editingItem: null,
  
  // Loading states
  loadingStates: {
    courses: false,
    units: false,
    lessons: false,
    userProgress: false,
    challengeSubmission: false,
  },
  
  // Error states
  errors: {
    courses: null,
    units: null,
    lessons: null,
    userProgress: null,
    challengeSubmission: null,
  },
};

// Laboratory slice
export const laboratorySlice = createSlice({
  name: 'laboratory',
  initialState,
  reducers: {
    // UI Actions
    setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.viewMode = action.payload;
    },
    
    setSelectedCourse: (state, action: PayloadAction<Course | null>) => {
      state.selectedCourse = action.payload;
      // Reset dependent selections
      state.selectedUnit = null;
      state.selectedLesson = null;
    },
    
    setSelectedUnit: (state, action: PayloadAction<Unit | null>) => {
      state.selectedUnit = action.payload;
      // Reset dependent selections
      state.selectedLesson = null;
    },
    
    setSelectedLesson: (state, action: PayloadAction<Lesson | null>) => {
      state.selectedLesson = action.payload;
    },
    
    // Filter Actions
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    
    setCategoryFilter: (state, action: PayloadAction<string | null>) => {
      state.categoryFilter = action.payload;
    },
    
    setLevelFilter: (state, action: PayloadAction<string | null>) => {
      state.levelFilter = action.payload;
    },
    
    setStatusFilter: (state, action: PayloadAction<'all' | 'published' | 'draft'>) => {
      state.statusFilter = action.payload;
    },
    
    clearFilters: (state) => {
      state.searchQuery = '';
      state.categoryFilter = null;
      state.levelFilter = null;
      state.statusFilter = 'all';
    },
    
    // Practice Session Actions
    startPracticeSession: (state) => {
      state.isInPracticeSession = true;
      state.currentChallengeIndex = 0;
      state.sessionProgress = {
        correctAnswers: 0,
        totalAnswers: 0,
        heartsUsed: 0,
        pointsEarned: 0,
      };
    },
    
    nextChallenge: (state) => {
      state.currentChallengeIndex += 1;
    },
    
    submitChallengeAnswer: (state, action: PayloadAction<{ correct: boolean; pointsEarned: number; heartsUsed: number }>) => {
      const { correct, pointsEarned, heartsUsed } = action.payload;
      state.sessionProgress.totalAnswers += 1;
      if (correct) {
        state.sessionProgress.correctAnswers += 1;
      }
      state.sessionProgress.pointsEarned += pointsEarned;
      state.sessionProgress.heartsUsed += heartsUsed;
    },
    
    endPracticeSession: (state) => {
      state.isInPracticeSession = false;
      state.currentChallengeIndex = 0;
    },
    
    // Creation/Editing Actions
    startCreating: (state, action: PayloadAction<'course' | 'unit' | 'lesson' | 'challenge'>) => {
      state.isCreating = true;
      state.editingItem = action.payload;
    },
    
    startEditing: (state, action: PayloadAction<'course' | 'unit' | 'lesson' | 'challenge'>) => {
      state.isEditing = true;
      state.editingItem = action.payload;
    },
    
    stopCreating: (state) => {
      state.isCreating = false;
      state.editingItem = null;
    },
    
    stopEditing: (state) => {
      state.isEditing = false;
      state.editingItem = null;
    },
    
    // Loading State Actions
    setLoading: (state, action: PayloadAction<{ key: keyof LaboratoryState['loadingStates']; loading: boolean }>) => {
      const { key, loading } = action.payload;
      state.loadingStates[key] = loading;
    },
    
    // Error State Actions
    setError: (state, action: PayloadAction<{ key: keyof LaboratoryState['errors']; error: string | null }>) => {
      const { key, error } = action.payload;
      state.errors[key] = error;
    },
    
    clearError: (state, action: PayloadAction<keyof LaboratoryState['errors']>) => {
      state.errors[action.payload] = null;
    },
    
    clearAllErrors: (state) => {
      Object.keys(state.errors).forEach(key => {
        state.errors[key as keyof LaboratoryState['errors']] = null;
      });
    },
    
    // Reset Actions
    resetLaboratoryState: () => initialState,
    
    resetSelections: (state) => {
      state.selectedCourse = null;
      state.selectedUnit = null;
      state.selectedLesson = null;
    },
  },
});

// Export actions
export const {
  // UI Actions
  setViewMode,
  setSelectedCourse,
  setSelectedUnit,
  setSelectedLesson,
  
  // Filter Actions
  setSearchQuery,
  setCategoryFilter,
  setLevelFilter,
  setStatusFilter,
  clearFilters,
  
  // Practice Session Actions
  startPracticeSession,
  nextChallenge,
  submitChallengeAnswer,
  endPracticeSession,
  
  // Creation/Editing Actions
  startCreating,
  startEditing,
  stopCreating,
  stopEditing,
  
  // Loading State Actions
  setLoading,
  
  // Error State Actions
  setError,
  clearError,
  clearAllErrors,
  
  // Reset Actions
  resetLaboratoryState,
  resetSelections,
} = laboratorySlice.actions;

// Export reducer
export default laboratorySlice.reducer;

// Selectors with safe fallbacks
export const selectLaboratoryState = (state: { laboratory?: LaboratoryState }) => state.laboratory || initialState;
export const selectViewMode = (state: { laboratory?: LaboratoryState }) => state.laboratory?.viewMode || initialState.viewMode;
export const selectSelectedCourse = (state: { laboratory?: LaboratoryState }) => state.laboratory?.selectedCourse || initialState.selectedCourse;
export const selectSelectedUnit = (state: { laboratory?: LaboratoryState }) => state.laboratory?.selectedUnit || initialState.selectedUnit;
export const selectSelectedLesson = (state: { laboratory?: LaboratoryState }) => state.laboratory?.selectedLesson || initialState.selectedLesson;
export const selectSearchQuery = (state: { laboratory?: LaboratoryState }) => state.laboratory?.searchQuery || initialState.searchQuery;
export const selectFilters = (state: { laboratory?: LaboratoryState }) => ({
  category: state.laboratory?.categoryFilter || initialState.categoryFilter,
  level: state.laboratory?.levelFilter || initialState.levelFilter,
  status: state.laboratory?.statusFilter || initialState.statusFilter,
});
export const selectPracticeSession = (state: { laboratory?: LaboratoryState }) => ({
  isActive: state.laboratory?.isInPracticeSession || initialState.isInPracticeSession,
  currentIndex: state.laboratory?.currentChallengeIndex || initialState.currentChallengeIndex,
  progress: state.laboratory?.sessionProgress || initialState.sessionProgress,
});
export const selectCreationState = (state: { laboratory?: LaboratoryState }) => ({
  isCreating: state.laboratory?.isCreating || initialState.isCreating,
  isEditing: state.laboratory?.isEditing || initialState.isEditing,
  editingItem: state.laboratory?.editingItem || initialState.editingItem,
});
export const selectLoadingStates = (state: { laboratory?: LaboratoryState }) => state.laboratory?.loadingStates || initialState.loadingStates;
export const selectErrors = (state: { laboratory?: LaboratoryState }) => state.laboratory?.errors || initialState.errors;
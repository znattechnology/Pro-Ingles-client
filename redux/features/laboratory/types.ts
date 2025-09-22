/**
 * Laboratory Types - Centralized Type Definitions
 * 
 * Tipos centralizados para todo o sistema de laboratório,
 * garantindo consistência entre Redux e implementações legacy.
 */

// =============================================
// BASE ENTITY TYPES
// =============================================

export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

export interface Teacher {
  id: string;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
}

// =============================================
// COURSE RELATED TYPES
// =============================================

export interface Course extends BaseEntity {
  title: string;
  description?: string;
  image?: string;
  category?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  status?: 'Published' | 'Draft' | 'Archived';
  course_type?: 'practice' | 'video';
  template?: string;
  teacher?: Teacher;
  teacherName?: string;
  
  // Statistics (computed)
  units?: number;
  lessons?: number;
  challenges?: number;
  students?: number;
  completionRate?: number;
  
  // Progress related
  practice_units?: Unit[];
  total_lessons?: number;
  total_challenges?: number;
  completed_units?: number;
  progress?: number;
}

export interface CourseCreationData {
  title: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  template: string;
  image?: string;
}

export interface CourseUpdateData extends Partial<CourseCreationData> {
  status?: 'Published' | 'Draft';
}

// =============================================
// UNIT RELATED TYPES
// =============================================

export interface Unit extends BaseEntity {
  course?: string; // Course ID
  title: string;
  description: string;
  order: number;
  lessons?: Lesson[];
  
  // Progress related
  completed?: boolean;
  progress?: number;
}

export interface UnitCreationData {
  title: string;
  description: string;
  order: number;
}

// =============================================
// LESSON RELATED TYPES
// =============================================

export interface Lesson extends BaseEntity {
  unit?: string; // Unit ID
  title: string;
  order: number;
  challenges?: Challenge[];
  
  // Progress related
  completed?: boolean;
  progress?: number;
}

export interface LessonCreationData {
  title: string;
  order: number;
}

// =============================================
// CHALLENGE RELATED TYPES
// =============================================

export type ChallengeType = 
  | 'SELECT' 
  | 'ASSIST' 
  | 'FILL_BLANK' 
  | 'TRANSLATION' 
  | 'LISTENING' 
  | 'SPEAKING'
  | 'MATCH_PAIRS'
  | 'SENTENCE_ORDER'
  | 'TRUE_FALSE'
  | 'PRONUNCIATION'
  | 'CONVERSATION'
  | 'READING_ALOUD';

export interface Challenge extends BaseEntity {
  lesson?: string; // Lesson ID
  type: ChallengeType;
  question: string;
  order: number;
  options?: ChallengeOption[];
  
  // Progress related
  challenge_progress?: any[];
  completed?: boolean;
  
  // AI-related fields
  target_pronunciation?: string;
  conversation_context?: Record<string, any>;
  minimum_speaking_score?: number;
  audio_content_url?: string;
  audio_transcript?: string;
  listening_questions?: any[];
  minimum_listening_score?: number;
}

export interface ChallengeOption extends BaseEntity {
  challenge?: string; // Challenge ID
  text: string;
  is_correct?: boolean;
  image_url?: string;
  audio_url?: string;
  order: number;
  
  // Display properties
  imageSrc?: string | null;
  audioSrc?: string | null;
}

export interface ChallengeCreationData {
  type: ChallengeType;
  question: string;
  order: number;
  options?: Omit<ChallengeOption, 'id' | 'challenge'>[];
}

// =============================================
// USER PROGRESS TYPES
// =============================================

export interface UserProgress {
  hearts: number;
  points: number;
  user_image_src: string;
  active_course: Course | null;
  streak?: number;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
  
  // Speaking practice fields
  total_speaking_sessions?: number;
  total_speaking_minutes?: number;
  average_pronunciation_score?: number;
  average_fluency_score?: number;
  speaking_streak_days?: number;
  last_speaking_session?: string;
  
  // Listening practice fields
  total_listening_sessions?: number;
  total_listening_minutes?: number;
  average_comprehension_score?: number;
  average_dictation_score?: number;
  listening_streak_days?: number;
  last_listening_session?: string;
}

export interface UserProgressUpdate {
  courseId?: string;
  hearts?: number;
  points?: number;
}

// =============================================
// CHALLENGE PROGRESS TYPES
// =============================================

export interface ChallengeProgressRequest {
  challengeId: string;
  selectedOptions: string[];
  timeSpent?: number;
  attempts?: number;
}

export interface ChallengeProgressResponse {
  success: boolean;
  correct: boolean;
  pointsEarned: number;
  heartsUsed: number;
  explanation?: string;
  nextChallenge?: Challenge;
}

// =============================================
// API RESPONSE TYPES
// =============================================

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  status: number;
  error?: string;
}

export interface UnitsWithProgressResponse {
  course: Course;
  units: Unit[];
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

// =============================================
// UI STATE TYPES
// =============================================

export type ViewMode = 'grid' | 'list';
export type StatusFilter = 'all' | 'published' | 'draft';
export type EditingItem = 'course' | 'unit' | 'lesson' | 'challenge';

export interface FilterState {
  searchQuery: string;
  categoryFilter: string | null;
  levelFilter: string | null;
  statusFilter: StatusFilter;
}

export interface SessionProgress {
  correctAnswers: number;
  totalAnswers: number;
  heartsUsed: number;
  pointsEarned: number;
}

export interface LoadingStates {
  courses: boolean;
  units: boolean;
  lessons: boolean;
  userProgress: boolean;
  challengeSubmission: boolean;
}

export interface ErrorStates {
  courses: string | null;
  units: string | null;
  lessons: string | null;
  userProgress: string | null;
  challengeSubmission: string | null;
}

// =============================================
// ANALYTICS TYPES
// =============================================

export interface CourseAnalytics {
  courseId: string;
  totalStudents: number;
  activeStudents: number;
  completionRate: number;
  averageProgress: number;
  totalSessions: number;
  averageSessionTime: number;
  
  // Time-based metrics
  dailyActive: number;
  weeklyActive: number;
  monthlyActive: number;
  
  // Challenge metrics
  totalChallenges: number;
  completedChallenges: number;
  averageAttempts: number;
  accuracyRate: number;
}

export interface StudentProgress {
  studentId: string;
  studentName: string;
  courseProgress: number;
  lessonsCompleted: number;
  challengesCompleted: number;
  totalPoints: number;
  currentStreak: number;
  lastActive: string;
}

// =============================================
// ADVANCED FEATURE TYPES
// =============================================

export interface OfflineSession {
  sessionId: string;
  courseId: string;
  lessonId: string;
  challenges: Challenge[];
  startTime: number;
  syncStatus: 'pending' | 'synced' | 'failed';
}

export interface RealTimeUpdate {
  type: 'user_progress' | 'course_update' | 'new_challenge';
  data: any;
  timestamp: number;
}

// =============================================
// UTILITY TYPES
// =============================================

export type EntityType = 'course' | 'unit' | 'lesson' | 'challenge';

export interface MigrationStatus {
  entity: EntityType;
  usingRedux: boolean;
  hasData: boolean;
  isLoading: boolean;
  error: string | null;
}

// Feature flag types
export type FeatureFlagKey = 
  | 'REDUX_COURSE_SELECTION'
  | 'REDUX_PRACTICE_SESSION'
  | 'REDUX_TEACHER_MANAGEMENT'
  | 'REDUX_USER_PROGRESS'
  | 'REAL_TIME_UPDATES'
  | 'OFFLINE_PRACTICE'
  | 'OPTIMISTIC_UPDATES';

// =============================================
// REDUX SPECIFIC TYPES
// =============================================

export interface LaboratoryState {
  // UI State
  viewMode: ViewMode;
  selectedCourse: Course | null;
  selectedUnit: Unit | null;
  selectedLesson: Lesson | null;
  
  // Filters and Search
  filters: FilterState;
  
  // Practice Session State
  isInPracticeSession: boolean;
  currentChallengeIndex: number;
  sessionProgress: SessionProgress;
  
  // Temporary state during creation/editing
  isCreating: boolean;
  isEditing: boolean;
  editingItem: EditingItem | null;
  
  // Loading states
  loadingStates: LoadingStates;
  
  // Error states
  errors: ErrorStates;
}

// Root state type (para useSelector)
export interface RootState {
  laboratory: LaboratoryState;
  // outros slices...
}

// =============================================
// HOOK RETURN TYPES
// =============================================

export interface CourseManagementResult {
  courses: Course[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface CourseActionsResult {
  createCourse: (data: CourseCreationData) => Promise<Course>;
  updateCourse: (id: string, data: CourseUpdateData) => Promise<Course>;
  deleteCourse: (id: string) => Promise<void>;
  publishCourse: (id: string, publish: boolean) => Promise<Course>;
  selectCourse?: (id: string) => Promise<void>;
}

export interface PracticeSessionResult {
  lesson: Lesson | null;
  challenges: Challenge[];
  isLoading: boolean;
  error: string | null;
  actions: {
    submitAnswer: (challengeId: string, selectedOptions: string[]) => Promise<ChallengeProgressResponse>;
    skipChallenge: () => void;
    nextChallenge: () => void;
    endSession: () => void;
  };
}

export interface UserProgressResult {
  userProgress: UserProgress | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}
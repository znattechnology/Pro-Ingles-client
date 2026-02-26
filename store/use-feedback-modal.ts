import { create } from "zustand";

type FeedbackTrigger =
  | 'first_lesson'
  | 'milestone_lessons'
  | 'course_complete'
  | 'ai_sessions'
  | 'days_active'
  | 'manual'
  | 'prompt';

type FeedbackModalStore = {
  isOpen: boolean;
  trigger: FeedbackTrigger | null;
  contextData: Record<string, any>;
  open: (trigger?: FeedbackTrigger, contextData?: Record<string, any>) => void;
  close: () => void;
  reset: () => void;
};

export const useFeedbackModal = create<FeedbackModalStore>((set) => ({
  isOpen: false,
  trigger: null,
  contextData: {},
  open: (trigger = 'manual', contextData = {}) =>
    set({ isOpen: true, trigger, contextData }),
  close: () => set({ isOpen: false }),
  reset: () => set({ isOpen: false, trigger: null, contextData: {} }),
}));

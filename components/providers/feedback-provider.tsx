"use client";

import { useEffect, useCallback, useRef } from "react";
import { useFeedbackModal } from "@/store/use-feedback-modal";
import { useGetFeedbackStatusQuery } from "@/src/domains/shared/feedback/api/feedbackApiSlice";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import FeedbackModal from "@/components/modals/feedback-modal";

interface FeedbackProviderProps {
  children: React.ReactNode;
}

/**
 * FeedbackProvider component that manages smart feedback prompts.
 *
 * Features:
 * - Checks if user should see a feedback prompt based on engagement
 * - Shows prompt at appropriate times (not during active learning)
 * - Respects user's dismissal preferences
 * - Integrates with the feedback modal
 */
export function FeedbackProvider({ children }: FeedbackProviderProps) {
  const { isAuthenticated, user } = useDjangoAuth();
  const { open, isOpen } = useFeedbackModal();
  const hasCheckedRef = useRef(false);
  const lastCheckRef = useRef<number>(0);

  // Only fetch feedback status for authenticated users
  const { data: feedbackStatus, refetch } = useGetFeedbackStatusQuery(undefined, {
    skip: !isAuthenticated,
    // Poll every 5 minutes while user is active
    pollingInterval: 5 * 60 * 1000,
  });

  // Check and show feedback prompt
  const checkAndShowPrompt = useCallback(() => {
    // Don't show if not authenticated or already showing
    if (!isAuthenticated || isOpen) return;

    // Don't check more than once per minute
    const now = Date.now();
    if (now - lastCheckRef.current < 60000) return;
    lastCheckRef.current = now;

    // Check if we should show a prompt
    if (feedbackStatus?.should_show_prompt && feedbackStatus.trigger) {
      // Add a small delay to not interrupt the user immediately
      setTimeout(() => {
        open(feedbackStatus.trigger as any, {
          ...feedbackStatus.engagement_summary,
        });
      }, 3000); // 3 second delay
    }
  }, [isAuthenticated, isOpen, feedbackStatus, open]);

  // Initial check when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated && feedbackStatus && !hasCheckedRef.current) {
      hasCheckedRef.current = true;

      // Check after a delay to let the page settle
      const timer = setTimeout(() => {
        checkAndShowPrompt();
      }, 10000); // 10 seconds after page load

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, feedbackStatus, checkAndShowPrompt]);

  // Re-check when user completes significant actions
  // This is called from other components via custom events
  useEffect(() => {
    const handleLessonComplete = () => {
      // Refetch status and check if we should show prompt
      refetch().then(() => {
        setTimeout(checkAndShowPrompt, 2000);
      });
    };

    const handleCourseComplete = () => {
      refetch().then(() => {
        setTimeout(checkAndShowPrompt, 3000);
      });
    };

    const handleAISessionEnd = () => {
      refetch().then(() => {
        setTimeout(checkAndShowPrompt, 2000);
      });
    };

    // Listen for custom events
    window.addEventListener("feedback:lesson-complete", handleLessonComplete);
    window.addEventListener("feedback:course-complete", handleCourseComplete);
    window.addEventListener("feedback:ai-session-end", handleAISessionEnd);

    return () => {
      window.removeEventListener("feedback:lesson-complete", handleLessonComplete);
      window.removeEventListener("feedback:course-complete", handleCourseComplete);
      window.removeEventListener("feedback:ai-session-end", handleAISessionEnd);
    };
  }, [refetch, checkAndShowPrompt]);

  return (
    <>
      {children}
      <FeedbackModal />
    </>
  );
}

// Helper function to trigger feedback check from other components
export function triggerFeedbackCheck(event: "lesson-complete" | "course-complete" | "ai-session-end") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(`feedback:${event}`));
  }
}

export default FeedbackProvider;

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, MessageSquare, ThumbsUp, Send, Sparkles } from "lucide-react";
import { useFeedbackModal } from "@/store/use-feedback-modal";
import {
  useSubmitFeedbackMutation,
  useDismissFeedbackPromptMutation,
  FeedbackType,
} from "@/src/domains/shared/feedback/api/feedbackApiSlice";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const triggerMessages: Record<string, { title: string; subtitle: string }> = {
  first_lesson: {
    title: "Parabéns pela primeira lição!",
    subtitle: "Como está a ser a sua experiência?",
  },
  milestone_lessons: {
    title: "Excelente progresso!",
    subtitle: "O que acha da plataforma até agora?",
  },
  course_complete: {
    title: "Curso concluído!",
    subtitle: "Adorávamos saber a sua opinião.",
  },
  ai_sessions: {
    title: "Obrigado por usar o AI Tutor!",
    subtitle: "Como está a ser a experiência de conversação?",
  },
  days_active: {
    title: "Está a ir muito bem!",
    subtitle: "Partilhe connosco o que pensa.",
  },
  manual: {
    title: "O seu feedback é importante!",
    subtitle: "Ajude-nos a melhorar a plataforma.",
  },
  prompt: {
    title: "Queremos ouvir você!",
    subtitle: "A sua opinião faz a diferença.",
  },
};

export function FeedbackModal() {
  const { isOpen, trigger, contextData, close, reset } = useFeedbackModal();
  const [submitFeedback, { isLoading: isSubmitting }] = useSubmitFeedbackMutation();
  const [dismissPrompt] = useDismissFeedbackPromptMutation();

  const [step, setStep] = useState<"rating" | "details" | "thanks">("rating");
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("general");
  const [allowPublic, setAllowPublic] = useState(false);

  const messages = triggerMessages[trigger || "manual"];

  const handleClose = async () => {
    if (step === "rating" && trigger !== "manual") {
      // Log dismissal
      await dismissPrompt({
        trigger: trigger || "prompt",
        action: "dismissed",
        context_data: contextData,
      });
    }
    reset();
    setStep("rating");
    setRating(0);
    setComment("");
    setAllowPublic(false);
  };

  const handleRatingSelect = (selectedRating: number) => {
    setRating(selectedRating);
    setStep("details");
  };

  const handleSubmit = async () => {
    try {
      await submitFeedback({
        rating,
        comment,
        feedback_type: feedbackType,
        trigger: trigger || "manual",
        context_data: contextData,
        allow_public: allowPublic,
        allow_contact: false,
      }).unwrap();

      setStep("thanks");

      // Auto close after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2500);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }
  };

  const handleSkip = async () => {
    if (trigger !== "manual") {
      await dismissPrompt({
        trigger: trigger || "prompt",
        action: "skipped",
        context_data: contextData,
      });
    }
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-800 border border-violet-500/30 rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Decorative gradient */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600" />

          <div className="p-6">
            {/* Rating Step */}
            {step === "rating" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                  {messages.title}
                </h3>
                <p className="text-gray-400 mb-6">{messages.subtitle}</p>

                {/* Star Rating */}
                <div className="flex justify-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => handleRatingSelect(star)}
                      className="p-1 transition-colors"
                    >
                      <Star
                        className={cn(
                          "w-10 h-10 transition-colors",
                          (hoverRating || rating) >= star
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-600"
                        )}
                      />
                    </motion.button>
                  ))}
                </div>

                <p className="text-sm text-gray-500 mb-4">
                  Clique numa estrela para avaliar
                </p>

                <button
                  onClick={handleSkip}
                  className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Agora não
                </button>
              </motion.div>
            )}

            {/* Details Step */}
            {step === "details" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "w-5 h-5",
                          rating >= star
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-600"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-400">
                    {rating === 5
                      ? "Excelente!"
                      : rating === 4
                      ? "Muito bom!"
                      : rating === 3
                      ? "Bom"
                      : rating === 2
                      ? "Pode melhorar"
                      : "Precisa melhorar"}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-white mb-4">
                  Quer partilhar mais detalhes? (opcional)
                </h3>

                <Textarea
                  placeholder="O que mais gostou? O que podemos melhorar?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full h-24 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-violet-500 resize-none mb-4"
                />

                {/* Allow public toggle */}
                <label className="flex items-start gap-3 mb-6 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowPublic}
                    onChange={(e) => setAllowPublic(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-sm text-gray-400">
                    Autorizo que o meu feedback seja usado como testemunho
                    (o seu nome será parcialmente anonimizado)
                  </span>
                </label>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep("rating")}
                    className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                  >
                    {isSubmitting ? (
                      "A enviar..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Feedback
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Thanks Step */}
            {step === "thanks" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center"
                >
                  <ThumbsUp className="w-10 h-10 text-white" />
                </motion.div>

                <h3 className="text-xl font-bold text-white mb-2">
                  Obrigado pelo seu feedback!
                </h3>
                <p className="text-gray-400">
                  A sua opinião ajuda-nos a melhorar constantemente.
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default FeedbackModal;

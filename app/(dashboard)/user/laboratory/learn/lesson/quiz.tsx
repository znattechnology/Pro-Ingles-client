"use client";

// Types from Django API
import Confetti from "react-confetti";
import { useState, useTransition, useRef, useEffect } from "react";
import { Header } from "./header";
import { QuestionBubble } from "./question.bubble";
import { Challenge } from "./challenge";
import { Footer } from "./footer";
import { useSubmitChallengeMutation } from '@/src/domains/student/practice-courses/api/studentPracticeApiSlice';
import { toast } from "sonner";
import { useWindowSize, useMount } from "react-use";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import { ResultCard } from "./result-card";
import { useRouter } from "next/navigation";
import { useHeartsModal } from "@/store/use-hearts-modal";
import { usePracticeModal } from "@/store/use-practice-modal";
import { ExitModal } from "@/components/modals/exit-modal";
import { usePracticeSession } from '@/redux/features/laboratory/hooks/usePracticeSession';

// Django API types
interface ChallengeOption {
  id: string;
  text: string;
  is_correct?: boolean;
  image_url?: string;
  audio_url?: string;
  order: number;
}

interface ChallengeType {
  id: string;
  type: 'SELECT' | 'ASSIST' | 'FILL_BLANK' | 'TRANSLATION' | 'LISTENING' | 'SPEAKING' | 'MATCH_PAIRS' | 'SENTENCE_ORDER';
  question: string;
  order: number;
  options: ChallengeOption[];
  challengeOptions: ChallengeOption[]; // For backward compatibility
  completed: boolean;
}

type Props = {
  initialPercentage: number;
  initialHearts: number;
  initialLessonId: string;
  initialLessonChallenges: ChallengeType[];
  userSubscription: any;
  useReduxPractice?: boolean;
};

export const Quiz = ({
  initialPercentage,
  initialHearts,
  initialLessonId,
  initialLessonChallenges,
  userSubscription,
  useReduxPractice = true, // Default to Redux now
}: Props) => {
 const {width, height} = useWindowSize();
  
  // Audio elements using refs instead of useAudio hook
  const correctAudioRef = useRef<HTMLAudioElement>(null);
  const incorrectAudioRef = useRef<HTMLAudioElement>(null);
  const completedAudioRef = useRef<HTMLAudioElement>(null);

  const {open: openHeartsModal} = useHeartsModal();
  const {open: openPracticeModal} = usePracticeModal();
  const [lessonId] = useState(initialLessonId);
  const [hearts, setHearts] = useState(initialHearts);
  
  // Redux mutations
  const [submitChallengeProgress] = useSubmitChallengeMutation();
  
  // Redux practice session hooks
  const { actions } = usePracticeSession(useReduxPractice ? initialLessonId : null);
  
  const [percentage, setPercentage] = useState( () => {
    return initialPercentage === 100 ? 0 : initialPercentage
  });
  const [challenges] = useState(initialLessonChallenges);
  const [activeIndex, setActiveIndex] = useState(() => {
    const uncompletedIndex = challenges.findIndex(
      (challenge) => !challenge.completed
    );
    return uncompletedIndex === -1 ? 0 : uncompletedIndex;
  });

  const [pending, startTransition] = useTransition();

  const [selectedOptions, setSelectedOptions] = useState<string>();
  const [status, setStatus] = useState<"correct" | "wrong" | "none">("none");

  const router = useRouter();

  useMount(() => {
    if (initialPercentage === 100) {
        openPracticeModal();
    }
    
    // Debug migration
    if (process.env.NODE_ENV === 'development') {
      console.log('🧪 Quiz Component Migration Status:', {
        useReduxPractice,
        lessonId: initialLessonId,
        challengesCount: initialLessonChallenges.length,
        hasReduxActions: !!actions,
        timestamp: new Date().toISOString()
      });
    }
  })

  const onNext = () => {
    setActiveIndex((current) => current + 1);
  };

  const onSelect = (id: string) => {
    if (status !== "none") return;
    setSelectedOptions(id);
  };

  const onContinue = () => {
    if (!selectedOptions) return;
    if (status === "wrong") {
      setStatus("none");
      setSelectedOptions(undefined);
      return;
    }
    if (status === "correct") {
      onNext();
      setStatus("none");
      setSelectedOptions(undefined);
      return;
    }

    // Submit challenge via Redux
    startTransition(async () => {
      try {
        let response;
        
        if (useReduxPractice && actions.submitAnswer) {
          // Use Redux for challenge submission
          console.log('🧪 Using Redux for challenge submission');
          const reduxResponse = await actions.submitAnswer(challenge.id, selectedOptions);
          
          // Transform Redux response to legacy format for compatibility
          response = {
            correct: reduxResponse.correct,
            error: reduxResponse.success === false ? "challenge" : null,
            data: {
              userProgress: {
                hearts: undefined // Let Redux optimistic updates handle this
              }
            },
            heartsUsed: reduxResponse.heartsUsed || 0
          };
          
          console.log('🧪 Redux response transformed:', response);
        } else {
          // Direct Redux API call
          console.log('🧪 Using direct Redux API for challenge submission');
          const directResponse = await submitChallengeProgress({
            challenge_id: challenge.id,
            selected_option: selectedOptions,
            time_spent: Date.now(),
            attempts: 1
          }).unwrap();
          
          response = {
            correct: directResponse.correct,
            error: directResponse.success === false ? "challenge" : null,
            data: {
              userProgress: {
                hearts: directResponse.heartsRemaining
              }
            },
            heartsUsed: directResponse.heartsUsed || 0
          };
        }
        
        if (response?.error === "hearts") {
          openHeartsModal();
          return;
        }
        
        if (response?.correct) {
          // Correct answer
          if (correctAudioRef.current) {
            correctAudioRef.current.currentTime = 0;
            correctAudioRef.current.play().catch(console.error);
          }
          setStatus("correct");
          setPercentage((prev) => prev + 100 / challenges.length);

          // Update hearts for practice mode
          if (initialPercentage === 100) {
            setHearts((prev) => Math.min(prev + 1, 5));
          }
        } else {
          // Wrong answer
          if (incorrectAudioRef.current) {
            incorrectAudioRef.current.currentTime = 0;
            incorrectAudioRef.current.play().catch(console.error);
          }
          setStatus("wrong");
          
          // Update hearts count from response
          if (response?.data?.userProgress?.hearts !== undefined) {
            setHearts(response.data.userProgress.hearts);
          } else if ('heartsUsed' in response && response.heartsUsed) {
            // Redux response format
            setHearts((prev) => Math.max(prev - response.heartsUsed, 0));
          }
        }
      } catch (error) {
        console.error('Challenge submission error:', error);
        toast.error("Alguma coisa não correu bem por favor tentar novamente");
      }
    });
  };

  const challenge = challenges[activeIndex];
  const options = challenge?.options ?? challenge?.challengeOptions ?? [];

  // Play completion audio when challenge is finished
  useEffect(() => {
    if (!challenge && completedAudioRef.current) {
      const timer = setTimeout(() => {
        if (completedAudioRef.current) {
          completedAudioRef.current.currentTime = 0;
          completedAudioRef.current.play().catch(console.error);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [challenge]);

  if (!challenge) {
    return (
      <>
      <ExitModal />
      
      {/* Audio elements - always render */}
      <div style={{ position: 'absolute', left: '-9999px' }}>
        <audio ref={correctAudioRef} src="/laboratory/success.ogg" preload="auto" />
        <audio ref={incorrectAudioRef} src="/laboratory/error.ogg" preload="auto" />
        <audio ref={completedAudioRef} src="/laboratory/completed.wav" preload="auto" />
      </div>
      
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={800}
        tweenDuration={8000}
        colors={['#8B5CF6', '#A855F7', '#EC4899', '#F59E0B', '#10B981', '#3B82F6']}
      />
      
      <div className="flex flex-col h-screen bg-gradient-to-br from-customgreys-secondarybg via-violet-950/20 to-purple-950/30">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.08),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(236,72,153,0.06),transparent_70%)]" />
        
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
          <div className="text-center space-y-6 sm:space-y-8 max-w-2xl mx-auto w-full">
            {/* Success Icon */}
            <div className="relative mb-6 sm:mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 p-4 sm:p-6 rounded-full inline-flex items-center justify-center shadow-2xl shadow-green-500/20 animate-bounce">
                <Check className="w-16 h-16 sm:w-20 sm:h-20 text-white" />
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-yellow-400 rounded-full animate-ping" />
                <div className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 w-3 h-3 sm:w-4 sm:h-4 bg-blue-400 rounded-full animate-bounce delay-100" />
              </div>
            </div>
            
            {/* Success Message */}
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent animate-pulse">
                CONCLUÍDO!
              </h1>
              <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl border border-violet-500/20 p-4 sm:p-6 shadow-lg">
                <p className="text-lg sm:text-xl text-white/90 font-medium mb-2">
                  🎉 Parabéns! Lição finalizada com sucesso! 🎉
                </p>
                <p className="text-sm sm:text-base text-customgreys-dirtyGrey">
                  Você está progredindo muito bem no seu aprendizado de inglês!
                </p>
              </div>
            </div>

            {/* Achievement Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
              <ResultCard variant="points" value={challenges.length * 10}/>
              <ResultCard variant="hearts" value={hearts}/>
            </div>

            {/* Progress Celebration */}
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-sm rounded-2xl border border-yellow-500/20 p-4 sm:p-6 shadow-lg">
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full animate-pulse" />
                <span className="text-yellow-300 font-semibold text-sm sm:text-base">Estatísticas da Lição</span>
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full animate-pulse delay-75" />
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-white">{challenges.length}</p>
                  <p className="text-xs text-customgreys-dirtyGrey">Questões</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-green-400">100%</p>
                  <p className="text-xs text-customgreys-dirtyGrey">Completo</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-purple-400">{challenges.length * 10}</p>
                  <p className="text-xs text-customgreys-dirtyGrey">XP Ganho</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Footer
          lessonId={lessonId}
          status="completed"
          onCheck={() => router.push("/user/laboratory/learn")}
          pending={false}
        />
      </div>
      </>
    );
  }

  const title =
    challenge.type === "ASSIST"
      ? "Select the correct meaning"
      : challenge.question;
  return (
    <>
      <ExitModal />
      <Header
        hearts={hearts}
        percentage={percentage}
        hasActiveSubscription={!!userSubscription?.isActive}
        isProcessing={pending}
      />
      <div className="flex-1 transition-all duration-500 ease-in-out">
        <div className="h-full flex items-center justify-center">
          <div className="lg:min-h-[350px] lg:w-[600px] w-full px-4 sm:px-6 lg:px-0 flex flex-col gap-y-8 sm:gap-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-base sm:text-lg lg:text-3xl text-center lg:text-start font-bold text-white pt-16 sm:pt-20 animate-in fade-in slide-in-from-top-2 duration-700 delay-100 leading-tight">
              {title}
            </h1>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
              {challenge.type === "ASSIST" && (
                <div className="animate-in fade-in zoom-in-95 duration-300 delay-300 mb-4 sm:mb-6">
                  <QuestionBubble question={challenge.question} />
                </div>
              )}
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-400">
                <Challenge
                  options={options}
                  onSelect={onSelect}
                  status={status}
                  selectedOption={selectedOptions}
                  disabled={pending}
                  type={challenge.type}
                  isProcessing={pending}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer
        disabled={pending || !selectedOptions}
        status={status}
        onCheck={onContinue}
        pending={pending}
      />
      
      {/* Audio elements - always render */}
      <div style={{ position: 'absolute', left: '-9999px' }}>
        <audio ref={correctAudioRef} src="/laboratory/success.ogg" preload="auto" />
        <audio ref={incorrectAudioRef} src="/laboratory/error.ogg" preload="auto" />
        <audio ref={completedAudioRef} src="/laboratory/completed.wav" preload="auto" />
      </div>
    </>
  );
};

"use client";

// Types from Django API
import Confetti from "react-confetti";
import { useState, useTransition, useRef, useEffect } from "react";
import { Header } from "./header";
import { QuestionBubble } from "./question.bubble";
import { Challenge } from "./challenge";
import { Footer } from "./footer";
import { upsertChallengeProgress } from "@/actions/challenge-progress";
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
};

export const Quiz = ({
  initialPercentage,
  initialHearts,
  initialLessonId,
  initialLessonChallenges,
  userSubscription,
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

    // Check answer with the Django API
    startTransition(() => {
      upsertChallengeProgress(challenge.id, selectedOptions)
        .then((response) => {
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
            }
          }
        })
        .catch(() =>
          toast.error(
            "Alguma coisa não correu bem por favor tentar novamente"
          )
        );
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
        <audio ref={correctAudioRef} src="/success.ogg" preload="auto" />
        <audio ref={incorrectAudioRef} src="/error.ogg" preload="auto" />
        <audio ref={completedAudioRef} src="/completed.wav" preload="auto" />
      </div>
      
      <Confetti
      width={width}
      height={height}
      recycle={false}
      numberOfPieces={500}
      tweenDuration={10000}
      
      
      />
        <div className="flex flex-col h-full items-center justify-center bg-background text-foreground bg-customgreys-secondarybg mt-36">
          <div className="text-center">
            <div className="mb-4 rounded-full bg-green-500 p-3 inline-flex items-center justify-center">
              <Check className="w-16 h-16" />
            </div>
            <h1 className="text-4xl font-bold mb-3 text-white">CONCLUÍDO</h1>
            <p className="mb-1 text-white/70">
              🎉 Você finalizou a sua lição com sucesso! 🎉
            </p>
            <div className="flex items-center gap-x-4 w-full">
                <ResultCard variant="points" value={challenges.length * 10}/>
                <ResultCard variant="hearts" value={hearts}/>
            </div>
          </div>
        
         
        </div>
        <Footer
          lessonId={lessonId}
          status="completed"
          onCheck={() => router.push("/user/learn")}
          
          />
        
     
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
      />
      <div className="flex-1 ">
        <div className="h-full flex items-center justify-center">
          <div className="lg:min-h-[350px] lg:w-[600px] w-full px-6 lg:px-0 flex flex-col gap-y-12">
            <h1 className="text-lg lg:text-3xl text-center lg:text-start font-bold text-white pt-20">
              {title}
            </h1>
            <div>
              {challenge.type === "ASSIST" && (
                <QuestionBubble question={challenge.question} />
              )}
              <Challenge
                options={options}
                onSelect={onSelect}
                status={status}
                selectedOption={selectedOptions}
                disabled={pending}
                type={challenge.type}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer
        disabled={pending || !selectedOptions}
        status={status}
        onCheck={onContinue}
      />
      
      {/* Audio elements - always render */}
      <div style={{ position: 'absolute', left: '-9999px' }}>
        <audio ref={correctAudioRef} src="/success.ogg" preload="auto" />
        <audio ref={incorrectAudioRef} src="/error.ogg" preload="auto" />
        <audio ref={completedAudioRef} src="/completed.wav" preload="auto" />
      </div>
    </>
  );
};

"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ListeningExerciseInterface from "@/components/listening/ListeningExerciseInterface";
import Loading from "@/components/course/Loading";

// Mock exercise data - replace with API call
const mockExercise = {
  id: "1",
  title: "Business Meeting Discussion",
  description: "Listen to a business meeting and answer comprehension questions",
  exerciseType: "AUDIO_COMPREHENSION" as const,
  difficulty: "INTERMEDIATE" as const,
  accentType: "AMERICAN" as const,
  audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", // Demo audio
  audioDuration: 180,
  transcript: "Welcome everyone to today's quarterly business review. Let's start by discussing our sales performance this quarter...",
  allowReplay: true,
  maxReplays: 3,
  playbackSpeeds: [0.5, 0.75, 1.0, 1.25, 1.5],
  questions: [
    {
      id: "q1",
      text: "What is the main topic of the meeting?",
      type: "multiple_choice" as const,
      options: [
        "Sales performance review",
        "Quarterly business review", 
        "Product launch meeting",
        "Team building session"
      ],
      correctAnswer: "Quarterly business review",
      points: 10
    },
    {
      id: "q2", 
      text: "What does the speaker want to discuss first?",
      type: "text_input" as const,
      correctAnswer: "Sales performance",
      points: 10
    },
    {
      id: "q3",
      text: "Write exactly what you heard in the first sentence:",
      type: "dictation" as const,
      correctAnswer: "Welcome everyone to today's quarterly business review",
      points: 15
    }
  ],
  keyVocabulary: ["quarterly", "performance", "review", "sales", "business"],
  vocabularyDefinitions: {
    "quarterly": "Every three months",
    "performance": "How well something is done",
    "review": "A careful examination or assessment"
  },
  pointsReward: 35,
  heartsCost: 1,
  minimumScore: 70
};

export default function ListeningExercisePage() {
  const params = useParams();
  const router = useRouter();
  const [exercise, setExercise] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const exerciseId = params?.exerciseId as string;

  useEffect(() => {
    // Simulate API call
    const loadExercise = async () => {
      setIsLoading(true);
      
      // In a real app, you would fetch from API:
      // const response = await fetch(`/api/v1/practice/listening/exercises/${exerciseId}/`);
      // const data = await response.json();
      
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, return mock data for any ID
      setExercise(mockExercise);
      setIsLoading(false);
    };

    if (exerciseId) {
      loadExercise();
    }
  }, [exerciseId]);

  const handleComplete = (results: any) => {
    console.log("Exercise completed with results:", results);
    
    // In a real app, you would send results to API:
    // await fetch('/api/v1/practice/listening/sessions/complete/', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     exerciseId,
    //     ...results
    //   })
    // });
    
    // For now, just log and redirect
    setTimeout(() => {
      router.push("/user/listening");
    }, 3000);
  };

  const handleExit = () => {
    router.push("/user/listening");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-customgreys-primarybg flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-customgreys-primarybg flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Exercício não encontrado</h1>
          <button 
            onClick={handleExit}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg"
          >
            Voltar ao Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <ListeningExerciseInterface
      exercise={exercise}
      onComplete={handleComplete}
      onExit={handleExit}
    />
  );
}
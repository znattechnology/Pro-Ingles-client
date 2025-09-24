"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  useGetAvailableExercisesQuery,
  useGetExerciseByIdQuery,
  useSubmitExerciseProgressMutation 
} from '@/redux/features/laboratory/laboratoryApiSlice';
import { useProgressSync, useProgressSyncDebug } from '@/redux/features/laboratory/hooks/useProgressSync';
import { 
  Target, 
  Play, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  RefreshCw
} from 'lucide-react';

const IntegrationTest: React.FC = () => {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [testResults, setTestResults] = useState<any[]>([]);

  // Redux queries
  const { 
    data: exercises, 
    isLoading: exercisesLoading, 
    error: exercisesError,
    refetch: refetchExercises
  } = useGetAvailableExercisesQuery();

  const { 
    data: selectedExercise, 
    isLoading: exerciseLoading, 
    error: exerciseError 
  } = useGetExerciseByIdQuery(selectedExerciseId, { 
    skip: !selectedExerciseId 
  });

  // Hooks
  const { submitExerciseWithSync, syncChapterCompletion } = useProgressSync();
  const { flags, syncStatus } = useProgressSyncDebug();

  const addTestResult = (test: string, success: boolean, data?: any, error?: any) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      test,
      success,
      data,
      error,
      timestamp: new Date().toISOString()
    }]);
  };

  const testAvailableExercises = async () => {
    try {
      await refetchExercises();
      addTestResult('Available Exercises API', !!exercises, exercises);
    } catch (error) {
      addTestResult('Available Exercises API', false, null, error);
    }
  };

  const testExerciseDetails = async () => {
    if (!selectedExerciseId) {
      addTestResult('Exercise Details', false, null, 'No exercise selected');
      return;
    }

    try {
      addTestResult('Exercise Details API', !!selectedExercise, selectedExercise);
    } catch (error) {
      addTestResult('Exercise Details API', false, null, error);
    }
  };

  const testExerciseSubmission = async () => {
    if (!selectedExercise?.challenges?.[0]) {
      addTestResult('Exercise Submission', false, null, 'No challenges available');
      return;
    }

    try {
      const firstChallenge = selectedExercise.challenges[0];
      const firstOption = firstChallenge.options?.[0];

      if (!firstOption) {
        addTestResult('Exercise Submission', false, null, 'No options available');
        return;
      }

      const result = await submitExerciseWithSync({
        exerciseId: selectedExerciseId,
        challengeId: firstChallenge.id,
        selectedOptionId: firstOption.id,
        courseId: 'test-course-id',
        chapterId: 'test-chapter-id'
      });

      addTestResult('Exercise Submission', true, result);
    } catch (error) {
      addTestResult('Exercise Submission', false, null, error);
    }
  };

  const testChapterSync = async () => {
    try {
      await syncChapterCompletion('test-chapter-id', selectedExerciseId, true);
      addTestResult('Chapter Sync', true, { chapterId: 'test-chapter-id', completed: true });
    } catch (error) {
      addTestResult('Chapter Sync', false, null, error);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="space-y-6 p-6 bg-customgreys-primarybg min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🧪 Teste de Integração Course ↔ Laboratory
          </h1>
          <p className="text-gray-400">
            Testa a integração Redux entre cursos em vídeo e Practice Lab
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-customgreys-secondarybg border-violet-900/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  syncStatus.enabled ? 'bg-green-600' : 'bg-red-600'
                }`}>
                  {syncStatus.enabled ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-white font-medium">Redux Sync</h3>
                  <p className="text-gray-400 text-sm">
                    {syncStatus.activeFlags}/{syncStatus.totalFlags} flags ativas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg border-violet-900/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  exercises ? 'bg-green-600' : exercisesLoading ? 'bg-yellow-600' : 'bg-red-600'
                }`}>
                  {exercisesLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : exercises ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-white font-medium">Exercises API</h3>
                  <p className="text-gray-400 text-sm">
                    {exercises?.length || 0} exercícios disponíveis
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-customgreys-secondarybg border-violet-900/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Testes</h3>
                  <p className="text-gray-400 text-sm">
                    {testResults.length} execuções
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Flags Debug */}
        <Card className="bg-customgreys-secondarybg border-violet-900/30 mb-6">
          <CardContent className="p-4">
            <h3 className="text-white font-medium mb-3">🚩 Feature Flags Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(flags).map(([flag, enabled]) => (
                <Badge 
                  key={flag} 
                  variant={enabled ? "default" : "outline"}
                  className={enabled ? "bg-green-600 text-white" : "border-red-500 text-red-400"}
                >
                  {flag}: {enabled ? "✅" : "❌"}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Exercise Selection */}
        <Card className="bg-customgreys-secondarybg border-violet-900/30 mb-6">
          <CardContent className="p-6">
            <h3 className="text-white font-medium mb-4">🎯 Seleção de Exercício</h3>
            
            {exercisesLoading ? (
              <div className="text-center py-4">
                <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-400">Carregando exercícios...</p>
              </div>
            ) : exercisesError ? (
              <div className="text-center py-4">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-red-400">Erro ao carregar exercícios</p>
              </div>
            ) : (
              <div className="space-y-3">
                <select
                  className="w-full bg-customgreys-darkGrey border border-gray-600 text-white rounded px-3 py-2"
                  value={selectedExerciseId}
                  onChange={(e) => setSelectedExerciseId(e.target.value)}
                >
                  <option value="">Selecione um exercício para testar...</option>
                  {exercises?.map((course: any) => (
                    <optgroup key={course.id} label={course.title}>
                      {course.units?.map((unit: any) => 
                        unit.lessons?.map((lesson: any) => 
                          lesson.challenges?.map((challenge: any) => (
                            <option key={challenge.id} value={challenge.id}>
                              {lesson.title} → {challenge.title}
                            </option>
                          ))
                        )
                      )}
                    </optgroup>
                  ))}
                </select>
                
                {selectedExerciseId && (
                  <div className="text-sm text-gray-400">
                    Exercício selecionado: <code className="bg-gray-800 px-1 rounded">{selectedExerciseId}</code>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Buttons */}
        <Card className="bg-customgreys-secondarybg border-violet-900/30 mb-6">
          <CardContent className="p-6">
            <h3 className="text-white font-medium mb-4">🔬 Testes Disponíveis</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                onClick={testAvailableExercises}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={exercisesLoading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Exercises API
              </Button>
              
              <Button
                onClick={testExerciseDetails}
                className="bg-green-600 hover:bg-green-700"
                disabled={!selectedExerciseId || exerciseLoading}
              >
                <Target className="w-4 h-4 mr-2" />
                Exercise Details
              </Button>
              
              <Button
                onClick={testExerciseSubmission}
                className="bg-violet-600 hover:bg-violet-700"
                disabled={!selectedExerciseId}
              >
                <Play className="w-4 h-4 mr-2" />
                Submit Exercise
              </Button>
              
              <Button
                onClick={testChapterSync}
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={!selectedExerciseId}
              >
                <Zap className="w-4 h-4 mr-2" />
                Chapter Sync
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card className="bg-customgreys-secondarybg border-violet-900/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">📊 Resultados dos Testes</h3>
              <Button
                onClick={clearResults}
                variant="outline"
                size="sm"
                className="text-gray-400 border-gray-600"
              >
                Limpar
              </Button>
            </div>
            
            {testResults.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                Nenhum teste executado ainda. Execute os testes acima para ver os resultados.
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {testResults.reverse().map((result) => (
                  <div
                    key={result.id}
                    className={`p-3 rounded-lg border ${
                      result.success 
                        ? 'border-green-600/30 bg-green-900/10' 
                        : 'border-red-600/30 bg-red-900/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className="text-white font-medium">{result.test}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    {result.error && (
                      <div className="text-red-400 text-sm mb-2">
                        ❌ {result.error.message || JSON.stringify(result.error)}
                      </div>
                    )}
                    
                    {result.data && (
                      <details className="text-xs">
                        <summary className="text-gray-400 cursor-pointer">Ver dados</summary>
                        <pre className="bg-gray-800 p-2 rounded mt-2 overflow-x-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IntegrationTest;
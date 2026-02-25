"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useGetProfileQuery } from '@/src/domains/auth/services/authApi';
import {
  ArrowLeft,
  Download,
  Play,
  Copy,
  Star,
  Award,
  Target,
  TrendingUp,
  Clock,
  MessageCircle,
  Volume2,
  CheckCircle,
  AlertTriangle,
  Book,
  Repeat,
  Calendar,
  BarChart3,
  FileText,
  Share,
  BookOpen,
  Lightbulb,
  Users,
  Zap,
  Bot,
  User
} from 'lucide-react';

// ✅ Environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000/api/v1';

// Types
interface SessionSummary {
  session_id: string;
  student_name: string;
  level: string;
  domain: string;
  duration_seconds: number;
  date_time: string;
  scores: {
    fluency: number;
    pronunciation: number;
    grammar: number;
    vocabulary: number;
    overall: number;
  };
  corrections: Array<{
    original_phrase: string;
    corrected_phrase: string;
    error_type: string;
    short_explanation_pt: string;
    example_correct_use: string;
    timestamp: string;
    audio_ref?: string;
  }>;
  key_phrases: Array<{
    text: string;
    context: string;
    difficulty: string;
    audio_ref?: string;
  }>;
  suggested_drills: Array<{
    title: string;
    description: string;
    repetitions: number;
    example_text: string;
    audio_ref?: string;
  }>;
  timeline: Array<{
    timestamp: string;
    type: 'correction' | 'important_turn' | 'milestone';
    description: string;
    audio_thumbnail?: string;
    content?: string;
  }>;
  conversation_analysis: {
    response_appropriateness: number;
    topic_maintenance: number;
    initiative_taking: number;
    cultural_awareness: number;
  };
  speaking_metrics: {
    total_words: number;
    words_per_minute: number;
    speaking_time_percentage: number;
    pause_analysis: string;
  };
  recommendations: string[];
  next_level_ready: boolean;
  audio_refs: string[];
  conversation_transcript?: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
}

interface SessionSummaryPageProps {
  sessionId: string;
  summaryData?: SessionSummary;
}

export default function SessionSummaryPage({ sessionId, summaryData }: SessionSummaryPageProps) {
  const router = useRouter();
  const { data: userProfile } = useGetProfileQuery();
  const [summary, setSummary] = useState<SessionSummary | null>(summaryData || null);
  const [isLoading, setIsLoading] = useState(!summaryData);
  const [activeTab, setActiveTab] = useState<'overview' | 'transcript' | 'corrections' | 'phrases' | 'timeline'>('overview');
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  // Debug: Log user profile when loaded
  useEffect(() => {
    if (userProfile) {
      console.log('👤 [DEBUG] Logged-in user profile loaded:', {
        name: userProfile.name,
        email: userProfile.email,
        role: userProfile.role
      });
    } else {
      console.log('⚠️ [DEBUG] No user profile loaded yet');
    }
  }, [userProfile]);

  useEffect(() => {
    if (!summaryData) {
      fetchSessionSummary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, summaryData, userProfile]);

  const fetchSessionSummary = async () => {
    try {
      setIsLoading(true);
      console.log('📊 [DEBUG] Fetching summary for session:', sessionId);

      const response = await fetch(`${API_BASE_URL}/practice/vapi/session/${sessionId}/summary`, {
        credentials: 'include', // ✅ Envia cookies HttpOnly
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ [DEBUG] Summary data received:', data);

        // ⚠️ WORKAROUND: Enhance data from localStorage if needed
        const storedSessionData = localStorage.getItem('vapi-session-data');
        const storedMessages = localStorage.getItem('vapi-messages');

        if (data.session) {
          // ✅ ALWAYS prioritize logged-in user - Priority order:
          // 1. Logged-in user from Redux (ALWAYS FIRST)
          // 2. localStorage session data
          // 3. Backend response (last resort)
          console.log('🔍 [DEBUG] Original backend student_name:', data.session.student_name);

          // Priority 1: ALWAYS use logged-in user if available
          if (userProfile?.name) {
            console.log('✅ [DEBUG] Using logged-in user name from Redux:', userProfile.name);
            data.session.student_name = userProfile.name;
          }
          // Priority 2: Fallback to localStorage
          else if (storedSessionData) {
            try {
              const sessionData = JSON.parse(storedSessionData);
              if (sessionData.userProfile?.name) {
                console.log('✅ [DEBUG] Using name from localStorage:', sessionData.userProfile.name);
                data.session.student_name = sessionData.userProfile.name;
              } else {
                console.log('⚠️ [DEBUG] No name in localStorage, keeping backend name:', data.session.student_name);
              }
            } catch (e) {
              console.error('Failed to parse localStorage session data:', e);
              console.log('⚠️ [DEBUG] Keeping backend name:', data.session.student_name);
            }
          }
          // Priority 3: Use backend name as last resort
          else {
            console.log('⚠️ [DEBUG] No logged-in user or localStorage, using backend name:', data.session.student_name);
          }

          // Add conversation_transcript if missing from backend
          if (!data.session.conversation_transcript && storedMessages) {
            console.log('⚠️ [DEBUG] Transcript not in backend response, checking localStorage...');
            try {
              const messages = JSON.parse(storedMessages);
              if (messages && messages.length > 0) {
                console.log('✅ [DEBUG] Found', messages.length, 'messages in localStorage');
                data.session.conversation_transcript = messages.map((msg: any) => ({
                  role: msg.role,
                  content: msg.content,
                  timestamp: msg.timestamp
                }));
              }
            } catch (e) {
              console.error('Failed to parse localStorage messages:', e);
            }
          }
        }

        setSummary(data.session);
      } else {
        console.error('❌ [DEBUG] Failed to fetch summary, status:', response.status);
        const errorText = await response.text();
        console.error('❌ [DEBUG] Error response:', errorText);
      }
    } catch (error) {
      console.error('❌ Failed to fetch session summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = async (audioRef: string) => {
    if (playingAudio === audioRef) {
      setPlayingAudio(null);
      return;
    }
    
    setPlayingAudio(audioRef);
    
    try {
      // Simulate audio playback
      setTimeout(() => {
        setPlayingAudio(null);
      }, 3000);
    } catch (error) {
      console.error('Failed to play audio:', error);
      setPlayingAudio(null);
    }
  };

  const handleCopyPhrase = (text: string) => {
    navigator.clipboard.writeText(text);
    // Show toast notification
  };

  const handleExportSummary = (format: 'json' | 'pdf' | 'txt') => {
    if (!summary) return;

    switch (format) {
      case 'json':
        exportAsJSON();
        break;
      case 'pdf':
        exportAsPDF();
        break;
      case 'txt':
        exportAsText();
        break;
    }
  };

  const exportAsJSON = () => {
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    downloadFile(blob, `session-${sessionId}-complete.json`);
  };

  const exportAsPDF = () => {
    // Implement PDF generation
    console.log('Exporting as PDF...');
  };

  const exportAsText = () => {
    if (!summary) return;

    const textContent = `
English Conversation Practice Session Report
==========================================

Student: ${summary.student_name}
Level: ${summary.level}
Domain: ${summary.domain}
Duration: ${Math.floor(summary.duration_seconds / 60)} minutes
Date: ${new Date(summary.date_time).toLocaleString()}

SCORES
------
Overall: ${summary.scores.overall}%
Fluency: ${summary.scores.fluency}%
Pronunciation: ${summary.scores.pronunciation}%
Grammar: ${summary.scores.grammar}%
Vocabulary: ${summary.scores.vocabulary}%

CORRECTIONS (${summary.corrections.length})
-----------
${summary.corrections.map(c => 
  `"${c.original_phrase}" → "${c.corrected_phrase}"\n  ${c.short_explanation_pt}`
).join('\n\n')}

KEY PHRASES
-----------
${summary.key_phrases.map(p => `"${p.text}" - ${p.context}`).join('\n')}

RECOMMENDATIONS
--------------
${summary.recommendations.map(r => `• ${r}`).join('\n')}
    `.trim();

    const blob = new Blob([textContent], { type: 'text/plain' });
    downloadFile(blob, `session-${sessionId}-summary.txt`);
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-white">Generating session summary...</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-white">Failed to load session summary</p>
          <Button onClick={() => router.push('/user/laboratory')} className="mt-4">
            Back to Laboratory
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      {/* Header */}
      <header className="bg-slate-900/95 backdrop-blur-sm border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/user/laboratory')}
              className="text-gray-300 hover:text-white hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Lab
            </Button>
            <div className="h-6 w-px bg-gray-600" />
            <div>
              <h1 className="text-xl font-semibold text-white">Session Summary</h1>
              <p className="text-sm text-gray-400">Session ID: {sessionId}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => handleExportSummary('json')}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <Download className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExportSummary('pdf')}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Session Info Card */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-lg">
                    {summary.student_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold text-white">{summary.student_name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{summary.level}</Badge>
                    <Badge variant="outline">{summary.domain}</Badge>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-400">{Math.floor(summary.duration_seconds / 60)} minutes</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-4xl font-bold ${getScoreColor(summary.scores.overall)}`}>
                  {summary.scores.overall}%
                </div>
                <p className="text-gray-400">Overall Score</p>
                {summary.next_level_ready && (
                  <Badge className="bg-green-600 text-white mt-2">
                    <Award className="w-3 h-3 mr-1" />
                    Ready for {getNextLevel(summary.level)}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(summary.scores.fluency)}`}>
                  {summary.scores.fluency}%
                </div>
                <p className="text-gray-400 text-sm">Fluency</p>
                <Progress value={summary.scores.fluency} className="mt-2 h-2" />
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(summary.scores.pronunciation)}`}>
                  {summary.scores.pronunciation}%
                </div>
                <p className="text-gray-400 text-sm">Pronunciation</p>
                <Progress value={summary.scores.pronunciation} className="mt-2 h-2" />
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(summary.scores.grammar)}`}>
                  {summary.scores.grammar}%
                </div>
                <p className="text-gray-400 text-sm">Grammar</p>
                <Progress value={summary.scores.grammar} className="mt-2 h-2" />
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(summary.scores.vocabulary)}`}>
                  {summary.scores.vocabulary}%
                </div>
                <p className="text-gray-400 text-sm">Vocabulary</p>
                <Progress value={summary.scores.vocabulary} className="mt-2 h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-800 rounded-lg p-1 mb-6">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'transcript', label: 'Transcript', icon: MessageCircle },
            { id: 'corrections', label: 'Corrections', icon: AlertTriangle },
            { id: 'phrases', label: 'Key Phrases', icon: BookOpen },
            { id: 'timeline', label: 'Timeline', icon: Clock }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors
                ${activeTab === tab.id 
                  ? 'bg-violet-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Speaking Metrics */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Speaking Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Words:</span>
                  <span className="text-white font-medium">{summary.speaking_metrics.total_words}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Words per Minute:</span>
                  <span className="text-white font-medium">{summary.speaking_metrics.words_per_minute}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Speaking Time:</span>
                  <span className="text-white font-medium">{summary.speaking_metrics.speaking_time_percentage}%</span>
                </div>
                <div>
                  <span className="text-gray-400">Pause Analysis:</span>
                  <p className="text-white text-sm mt-1">{summary.speaking_metrics.pause_analysis}</p>
                </div>
              </CardContent>
            </Card>

            {/* Conversation Analysis */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Conversation Quality
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(summary.conversation_analysis).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400 text-sm capitalize">
                        {key.replace('_', ' ')}:
                      </span>
                      <span className="text-white font-medium">{value}%</span>
                    </div>
                    <Progress value={value} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="bg-gray-800 border-gray-700 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {summary.recommendations.map((recommendation, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-gray-700/50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
                        {idx + 1}
                      </div>
                      <p className="text-gray-300 text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'transcript' && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Full Conversation Transcript
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!summary.conversation_transcript || summary.conversation_transcript.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No transcript available for this session.</p>
                  <p className="text-gray-500 text-sm mt-2">The conversation may have been too short or not recorded properly.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-700">
                    <span className="text-gray-400 text-sm">
                      {summary.conversation_transcript.length} messages exchanged
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyPhrase(
                        summary.conversation_transcript!
                          .map(m => `[${m.role === 'user' ? 'You' : 'AI'}]: ${m.content}`)
                          .join('\n\n')
                      )}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Transcript
                    </Button>
                  </div>

                  {summary.conversation_transcript.map((message, idx) => (
                    <div key={idx} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarFallback className={
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                            : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                        }>
                          {message.role === 'user' ? (
                            <User className="w-5 h-5" />
                          ) : (
                            <Bot className="w-5 h-5" />
                          )}
                        </AvatarFallback>
                      </Avatar>

                      <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                        <div className={`inline-block px-4 py-3 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-green-600/30 to-emerald-600/30 rounded-tr-md'
                            : 'bg-gradient-to-r from-blue-600/30 to-indigo-600/30 rounded-tl-md'
                        }`}>
                          <p className="text-white leading-relaxed">{message.content}</p>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                            <span className="text-xs text-gray-400">
                              {message.role === 'user' ? 'You' : 'AI Assistant'}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'corrections' && (
          <div className="space-y-4">
            {summary.corrections.length === 0 ? (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-white text-lg font-medium mb-2">Great job!</h3>
                  <p className="text-gray-400">No corrections needed in this session.</p>
                </CardContent>
              </Card>
            ) : (
              summary.corrections.map((correction, idx) => (
                <Card key={idx} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge variant="outline" className="text-xs">
                        {correction.error_type}
                      </Badge>
                      <span className="text-xs text-gray-400">{correction.timestamp}</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-red-400 line-through">"{correction.original_phrase}"</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-green-400 font-medium">"{correction.corrected_phrase}"</span>
                        {correction.audio_ref && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handlePlayAudio(correction.audio_ref!)}
                            className="ml-2"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <p className="text-gray-300 text-sm">{correction.short_explanation_pt}</p>
                      
                      <div className="bg-gray-700/50 p-3 rounded">
                        <p className="text-gray-400 text-xs mb-1">Example:</p>
                        <p className="text-green-300 text-sm">{correction.example_correct_use}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'phrases' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.key_phrases.map((phrase, idx) => (
              <Card key={idx} className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={`text-xs ${
                      phrase.difficulty === 'easy' ? 'bg-green-600' :
                      phrase.difficulty === 'medium' ? 'bg-yellow-600' : 'bg-red-600'
                    }`}>
                      {phrase.difficulty}
                    </Badge>
                    <div className="flex gap-1">
                      {phrase.audio_ref && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handlePlayAudio(phrase.audio_ref!)}
                          className="h-8 w-8 p-0"
                        >
                          <Play className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyPhrase(phrase.text)}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <h4 className="text-white font-medium mb-2">"{phrase.text}"</h4>
                  <p className="text-gray-400 text-sm">{phrase.context}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-4">
            {summary.timeline.map((event, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${event.type === 'correction' ? 'bg-yellow-600' :
                      event.type === 'milestone' ? 'bg-green-600' : 'bg-blue-600'
                    }
                  `}>
                    {event.type === 'correction' && <AlertTriangle className="w-4 h-4" />}
                    {event.type === 'milestone' && <Star className="w-4 h-4" />}
                    {event.type === 'important_turn' && <MessageCircle className="w-4 h-4" />}
                  </div>
                  {idx < summary.timeline.length - 1 && (
                    <div className="w-0.5 h-12 bg-gray-600 mt-2" />
                  )}
                </div>
                
                <Card className="bg-gray-800 border-gray-700 flex-1">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{event.description}</span>
                      <span className="text-xs text-gray-400">{event.timestamp}</span>
                    </div>
                    
                    {event.content && (
                      <p className="text-gray-300 text-sm mt-2">"{event.content}"</p>
                    )}
                    
                    {event.audio_thumbnail && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePlayAudio(event.audio_thumbnail!)}
                        className="mt-2"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Play Turn
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <Button
            onClick={() => router.push('/user/laboratory/speaking/real-time')}
            className="bg-green-600 hover:bg-green-700"
          >
            <Repeat className="w-4 h-4 mr-2" />
            Practice Again
          </Button>
          
          <Button
            variant="outline"
            onClick={() => router.push('/user/booking')}
            className="border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white"
          >
            <Users className="w-4 h-4 mr-2" />
            Book Tutor Session
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleExportSummary('txt')}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Summary
          </Button>
        </div>
      </div>
    </div>
  );
}

// Utility function to get next level
function getNextLevel(currentLevel: string): string {
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const currentIndex = levels.indexOf(currentLevel);
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : 'C2+';
}
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Phone,
  PhoneOff,
  Clock,
  User,
  Bot,
  Settings,
  CheckCircle,
  AlertTriangle,
  Star,
  Award,
  Target,
  Zap,
  WifiOff,
  MessageCircle,
  Activity,
  Wrench,
  Briefcase,
  Monitor,
  Home,
  Fuel,
  Play,
  Edit,
  Download,
  RotateCcw,
  Repeat,
  Pause,
  FileText,
  Archive,
  MoreHorizontal,
  ChevronDown,
  Headphones,
  Radio,
  BarChart3,
  Eye,
  EyeOff
} from 'lucide-react';
import { FixedSizeList } from 'react-window';

// CSS Variables for theming
const CSS_VARIABLES = `
:root {
  --ai-bg: #E6F0FF;
  --ai-text: #0F172A;
  --user-bg: #E6FFF0;
  --user-text: #042E1F;
  --ai-accent: #3B82F6;
  --user-accent: #10B981;
  --speaking-glow: #F59E0B;
  --connection-good: #10B981;
  --connection-poor: #EF4444;
}

[data-theme="dark"] {
  --ai-bg: #1E293B;
  --ai-text: #F1F5F9;
  --user-bg: #064E3B;
  --user-text: #ECFDF5;
}
`;

// Enhanced Types
interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  is_final: boolean;
  audio_ref?: string;
  corrections?: Array<{
    original_phrase: string;
    corrected_phrase: string;
    error_type: string;
    explanation_pt: string;
    example: string;
  }>;
  scores?: {
    fluency: number;
    pronunciation: number;
    grammar: number;
  };
  duration?: number;
  speaking_rate?: number;
  confidence?: number;
}

interface VoiceActivityState {
  user_speaking: boolean;
  ai_speaking: boolean;
  volume_level: number;
  connection_quality: 'excellent' | 'good' | 'poor' | 'disconnected';
}

interface SessionConfig {
  session_id: string;
  student_name: string;
  student_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  domain: 'general' | 'petroleum' | 'IT' | 'business';
  objective: string;
  correction_mode: 'gentle' | 'direct';
  max_duration_minutes: number;
  voice_speed: number;
  auto_scroll: boolean;
  high_contrast: boolean;
}

interface ConversationPageProps {
  initialConfig?: Partial<SessionConfig>;
  onSessionEnd?: (summary: any) => void;
}

export default function ImprovedVapiConversation({ 
  initialConfig, 
  onSessionEnd 
}: ConversationPageProps) {
  // State Management
  const [sessionConfig, setSessionConfig] = useState<SessionConfig>({
    session_id: '',
    student_name: 'Student',
    student_level: 'B1',
    domain: 'general',
    objective: 'Practice English conversation',
    correction_mode: 'gentle',
    max_duration_minutes: 15,
    voice_speed: 1.0,
    auto_scroll: true,
    high_contrast: false,
    ...initialConfig
  });

  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [voiceActivity, setVoiceActivity] = useState<VoiceActivityState>({
    user_speaking: false,
    ai_speaking: false,
    volume_level: 0,
    connection_quality: 'disconnected'
  });
  
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showContextPanel, setShowContextPanel] = useState(true);
  const [currentEditingMessage, setCurrentEditingMessage] = useState<string | null>(null);
  const [partialTranscript, setPartialTranscript] = useState('');

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationContainerRef = useRef<HTMLDivElement>(null);
  const vapiClient = useRef<any>(null);
  const autoScrollPaused = useRef(false);

  // Router
  const router = useRouter();

  // Header Component
  const ConversationHeader = () => (
    <header className="bg-slate-900/95 backdrop-blur-sm border-b border-gray-700 px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        {/* Left: Logo & Navigation */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/user/laboratory')}
            className="text-gray-300 hover:text-white hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lab
          </Button>
          <div className="h-6 w-px bg-gray-600" />
          <h1 className="text-xl font-semibold text-white">ProEnglish</h1>
        </div>

        {/* Center: Session Info */}
        <div className="hidden md:flex items-center gap-4 text-center">
          <div>
            <h2 className="text-lg font-medium text-white">
              {sessionConfig.domain.charAt(0).toUpperCase() + sessionConfig.domain.slice(1)} Practice
            </h2>
            <p className="text-sm text-gray-400">
              Level {sessionConfig.student_level} • {sessionConfig.correction_mode} corrections
            </p>
          </div>
        </div>

        {/* Right: Session Controls */}
        <div className="flex items-center gap-3">
          {isSessionActive && (
            <>
              <Badge 
                variant="secondary" 
                className="bg-blue-600/20 text-blue-400 border-blue-500/30"
              >
                <Clock className="w-3 h-3 mr-1" />
                {formatTime(timeElapsed)}
              </Badge>
              <Badge 
                className={`${
                  voiceActivity.connection_quality === 'excellent' ? 'bg-green-600' :
                  voiceActivity.connection_quality === 'good' ? 'bg-yellow-600' :
                  voiceActivity.connection_quality === 'poor' ? 'bg-orange-600' :
                  'bg-red-600'
                }`}
              >
                {voiceActivity.connection_quality === 'excellent' && '🟢 Excellent'}
                {voiceActivity.connection_quality === 'good' && '🟡 Good'}
                {voiceActivity.connection_quality === 'poor' && '🟠 Poor'}
                {voiceActivity.connection_quality === 'disconnected' && '🔴 Disconnected'}
              </Badge>
            </>
          )}
          <Button
            onClick={handleEndSession}
            variant="outline"
            size="sm"
            className="border-red-500/50 text-red-400 hover:bg-red-600 hover:text-white hover:border-red-600"
            disabled={!isSessionActive}
          >
            <PhoneOff className="w-4 h-4 mr-2" />
            End Session
          </Button>
        </div>
      </div>
    </header>
  );

  // Avatar Component with Voice Activity
  const VoiceAvatar = ({ 
    type, 
    name, 
    isActive, 
    volumeLevel = 0, 
    onProfileClick 
  }: {
    type: 'user' | 'ai';
    name: string;
    isActive: boolean;
    volumeLevel?: number;
    onProfileClick?: () => void;
  }) => {
    const isUserAvatar = type === 'user';
    
    return (
      <div className="relative flex flex-col items-center group">
        {/* Avatar with glow effect when speaking */}
        <div 
          className={`
            relative w-16 h-16 rounded-full transition-all duration-200 cursor-pointer
            ${isActive ? 'ring-4 ring-yellow-400/50 shadow-lg shadow-yellow-400/20' : ''}
            ${isActive ? 'animate-pulse' : ''}
          `}
          onClick={onProfileClick}
        >
          <Avatar className="w-16 h-16">
            {isUserAvatar ? (
              <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-lg font-semibold">
                {name.charAt(0).toUpperCase()}
              </AvatarFallback>
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <Bot className="w-8 h-8" />
              </AvatarFallback>
            )}
          </Avatar>

          {/* Voice activity indicator */}
          {isActive && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`
                      w-1 bg-yellow-400 rounded-full transition-all duration-100
                      ${volumeLevel > (i * 20) ? 'h-4 opacity-100' : 'h-2 opacity-30'}
                    `}
                    style={{
                      animation: isActive ? `bounce ${0.5 + i * 0.1}s infinite alternate` : 'none'
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Name and status */}
        <div className="mt-3 text-center">
          <p className="text-sm font-medium text-white">
            {name}
          </p>
          <p className="text-xs text-gray-400">
            {isActive ? (
              <span className="text-yellow-400">🗣️ Speaking</span>
            ) : (
              <span>Listening</span>
            )}
          </p>
        </div>

        {/* Tooltip on hover */}
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          Click to view {isUserAvatar ? 'profile' : 'AI settings'}
        </div>
      </div>
    );
  };

  // Enhanced Message Bubble Component
  const MessageBubble = ({ message, onEdit, onReplay }: {
    message: ConversationMessage;
    onEdit?: (messageId: string) => void;
    onReplay?: (audioRef: string) => void;
  }) => {
    const isUser = message.role === 'user';
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(message.content);

    const handleSaveEdit = () => {
      if (onEdit && editedContent.trim() !== message.content) {
        // Here you would call the edit handler
        onEdit(message.id);
      }
      setIsEditing(false);
    };

    return (
      <div className={`flex gap-3 mb-4 group ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Message content */}
        <div className={`
          max-w-[70%] min-w-[200px] rounded-2xl px-4 py-3 shadow-sm transition-all duration-200
          ${isUser 
            ? 'bg-green-50 text-emerald-900 dark:bg-green-900/30 dark:text-green-100' 
            : 'bg-blue-50 text-slate-900 dark:bg-blue-900/30 dark:text-blue-100'
          }
        `}>
          {/* Message text or edit input */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full p-2 text-sm bg-white/50 dark:bg-gray-800/50 border rounded resize-none"
                rows={2}
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleSaveEdit}>
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="leading-relaxed">{message.content}</p>
          )}

          {/* Timestamp and actions */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200/30">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {message.audio_ref && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onReplay?.(message.audio_ref!)}
                  className="h-6 w-6 p-0"
                >
                  <Play className="w-3 h-3" />
                </Button>
              )}
              
              {isUser && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  className="h-6 w-6 p-0"
                >
                  <Edit className="w-3 h-3" />
                </Button>
              )}
              
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Scores and corrections for user messages */}
          {message.scores && isUser && (
            <div className="mt-3 p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-medium">Fluency</div>
                  <div className={`font-bold ${message.scores.fluency >= 80 ? 'text-green-600' : message.scores.fluency >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {message.scores.fluency}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-medium">Pronunciation</div>
                  <div className={`font-bold ${message.scores.pronunciation >= 80 ? 'text-green-600' : message.scores.pronunciation >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {message.scores.pronunciation}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-medium">Grammar</div>
                  <div className={`font-bold ${message.scores.grammar >= 80 ? 'text-green-600' : message.scores.grammar >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {message.scores.grammar}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Corrections display */}
          {message.corrections && message.corrections.length > 0 && (
            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Suggestions ({message.corrections.length})
                </span>
              </div>
              <div className="space-y-2">
                {message.corrections.map((correction, idx) => (
                  <div key={idx} className="text-xs">
                    <div className="flex items-center gap-2">
                      <span className="line-through text-red-600">"{correction.original_phrase}"</span>
                      <span>→</span>
                      <span className="text-green-600 font-medium">"{correction.corrected_phrase}"</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mt-1 italic">
                      {correction.explanation_pt}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Virtualized Conversation Feed
  const ConversationFeed = () => {
    const [userScrolledUp, setUserScrolledUp] = useState(false);

    const handleScroll = useCallback((event: any) => {
      const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 100;
      
      if (!isAtBottom && sessionConfig.auto_scroll) {
        setUserScrolledUp(true);
        autoScrollPaused.current = true;
      } else if (isAtBottom) {
        setUserScrolledUp(false);
        autoScrollPaused.current = false;
      }
    }, [sessionConfig.auto_scroll]);

    const scrollToBottom = useCallback(() => {
      if (conversationContainerRef.current && sessionConfig.auto_scroll && !autoScrollPaused.current) {
        conversationContainerRef.current.scrollTop = conversationContainerRef.current.scrollHeight;
      }
    }, [sessionConfig.auto_scroll]);

    useEffect(() => {
      scrollToBottom();
    }, [messages, scrollToBottom]);

    return (
      <div className="flex-1 flex flex-col">
        {/* Avatars Section */}
        <div className="bg-gray-800/50 border-b border-gray-700 p-6">
          <div className="flex items-center justify-center gap-12">
            <VoiceAvatar
              type="ai"
              name="Alex (AI)"
              isActive={voiceActivity.ai_speaking}
              volumeLevel={voiceActivity.ai_speaking ? 80 : 0}
              onProfileClick={() => {/* Show AI profile modal */}}
            />
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-px bg-gradient-to-r from-blue-500 to-green-500 mb-2" />
              <MessageCircle className="w-6 h-6 text-gray-400" />
              <div className="w-16 h-px bg-gradient-to-r from-green-500 to-blue-500 mt-2" />
            </div>
            
            <VoiceAvatar
              type="user"
              name={sessionConfig.student_name}
              isActive={voiceActivity.user_speaking}
              volumeLevel={voiceActivity.volume_level}
              onProfileClick={() => {/* Show user profile modal */}}
            />
          </div>
        </div>

        {/* Messages Container */}
        <div 
          ref={conversationContainerRef}
          className="flex-1 p-6 overflow-y-auto scroll-smooth"
          onScroll={handleScroll}
          style={{ 
            backgroundColor: sessionConfig.high_contrast ? '#000000' : 'transparent',
          }}
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/20 to-green-500/20 flex items-center justify-center mb-6">
                <MessageCircle className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Ready to start</h3>
              <p className="text-gray-400 max-w-md">
                Begin speaking to start your conversation. Your messages will appear here in real-time.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {/* Group messages by temporal proximity */}
              {groupMessagesByTime(messages).map((group, groupIdx) => (
                <div key={groupIdx} className="space-y-1">
                  {group.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      onEdit={handleEditMessage}
                      onReplay={handleReplayAudio}
                    />
                  ))}
                  {/* Small gap between message groups */}
                  {groupIdx < groupMessagesByTime(messages).length - 1 && (
                    <div className="h-4" />
                  )}
                </div>
              ))}
              
              {/* Partial transcript while speaking */}
              {partialTranscript && (
                <div className="flex justify-end">
                  <div className="max-w-[70%] bg-green-100/50 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-4 py-2 rounded-2xl">
                    <p className="opacity-75 italic">{partialTranscript}...</p>
                    <span className="text-xs text-green-600">typing...</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Scroll to bottom button */}
          {userScrolledUp && (
            <div className="fixed bottom-6 right-6 z-10">
              <Button
                onClick={() => {
                  setUserScrolledUp(false);
                  autoScrollPaused.current = false;
                  scrollToBottom();
                }}
                className="rounded-full w-12 h-12 bg-blue-600 hover:bg-blue-700 shadow-lg"
              >
                <ChevronDown className="w-6 h-6" />
              </Button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>
    );
  };

  // Context Panel (right sidebar)
  const SessionContextPanel = () => {
    if (!showContextPanel) return null;

    return (
      <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
        {/* Panel Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-white">Session Context</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowContextPanel(false)}
              className="text-gray-400 hover:text-white"
            >
              <EyeOff className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Session Meta */}
          <div className="p-4 border-b border-gray-700">
            <h4 className="font-medium text-white mb-3">Session Goals</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Objective:</span>
                <span className="text-white text-right max-w-32">{sessionConfig.objective}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Level:</span>
                <Badge variant="secondary">{sessionConfig.student_level}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Domain:</span>
                <Badge variant="outline">{sessionConfig.domain}</Badge>
              </div>
            </div>
          </div>

          {/* Target Vocabulary */}
          <div className="p-4 border-b border-gray-700">
            <h4 className="font-medium text-white mb-3">Target Vocabulary</h4>
            <div className="flex flex-wrap gap-2">
              {getTargetVocabulary(sessionConfig.domain, sessionConfig.student_level).map((word, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {word}
                </Badge>
              ))}
            </div>
          </div>

          {/* Quick Controls */}
          <div className="p-4 border-b border-gray-700">
            <h4 className="font-medium text-white mb-3">Quick Actions</h4>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={handleRequestCorrection}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Request Correction
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={handleRepeatLast}
              >
                <Repeat className="w-4 h-4 mr-2" />
                Repeat Last
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={handleSlowDown}
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Slow Down AI
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={handleExportTranscript}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Transcript
              </Button>
            </div>
          </div>

          {/* Session History */}
          <div className="p-4">
            <h4 className="font-medium text-white mb-3">Session Summary</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Messages:</span>
                <span className="text-white">{messages.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Speaking time:</span>
                <span className="text-white">{calculateSpeakingTime()} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Corrections:</span>
                <span className="text-yellow-400">{getTotalCorrections()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Avg. Score:</span>
                <span className="text-green-400">{getAverageScore()}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Footer Controls
  const ConversationFooter = () => (
    <footer className="bg-gray-800 border-t border-gray-700 p-4">
      <div className="flex items-center justify-between">
        {/* Left: Voice controls */}
        <div className="flex items-center gap-3">
          <Button
            variant={voiceActivity.user_speaking ? "default" : "outline"}
            size="sm"
            className={voiceActivity.user_speaking ? "bg-red-600 hover:bg-red-700" : ""}
          >
            {voiceActivity.user_speaking ? (
              <MicOff className="w-4 h-4 mr-2" />
            ) : (
              <Mic className="w-4 h-4 mr-2" />
            )}
            {voiceActivity.user_speaking ? "Release to Stop" : "Push to Talk"}
          </Button>
          
          <div className="flex items-center gap-2">
            <VolumeX className="w-4 h-4 text-gray-400" />
            <Slider
              value={[sessionConfig.voice_speed * 100]}
              onValueChange={(value) => setSessionConfig(prev => ({
                ...prev,
                voice_speed: value[0] / 100
              }))}
              max={150}
              min={50}
              step={25}
              className="w-20"
            />
            <span className="text-xs text-gray-400 w-8">{sessionConfig.voice_speed}x</span>
          </div>
        </div>

        {/* Center: Session stats */}
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeElapsed)} / {formatTime(sessionConfig.max_duration_minutes * 60)}</span>
          </div>
          <div className="w-32">
            <Progress 
              value={(timeElapsed / (sessionConfig.max_duration_minutes * 60)) * 100} 
              className="h-2"
            />
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            <span>{messages.length} messages</span>
          </div>
        </div>

        {/* Right: Session actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowContextPanel(!showContextPanel)}
            className="text-gray-400 hover:text-white"
          >
            {showContextPanel ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleHighContrast}
            className="text-gray-400 hover:text-white"
          >
            <Settings className="w-4 h-4" />
          </Button>

          <Button
            onClick={() => router.push(`/session/${sessionConfig.session_id}/summary`)}
            className="bg-green-600 hover:bg-green-700"
            disabled={!isSessionActive}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            End & Review
          </Button>
        </div>
      </div>
    </footer>
  );

  // Utility Functions
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const groupMessagesByTime = (messages: ConversationMessage[]) => {
    const groups: ConversationMessage[][] = [];
    let currentGroup: ConversationMessage[] = [];
    let lastTimestamp = 0;
    
    messages.forEach((message) => {
      const messageTime = message.timestamp.getTime();
      
      // Group messages that are within 10 seconds of each other and from the same speaker
      if (
        currentGroup.length === 0 ||
        (messageTime - lastTimestamp > 10000) ||
        (currentGroup[currentGroup.length - 1]?.role !== message.role)
      ) {
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
        }
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
      
      lastTimestamp = messageTime;
    });
    
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }
    
    return groups;
  };

  const getTargetVocabulary = (domain: string, level: string): string[] => {
    const vocabularies = {
      general: {
        A1: ['hello', 'goodbye', 'please', 'thank you', 'yes', 'no'],
        B1: ['conversation', 'discuss', 'opinion', 'experience', 'prefer'],
        C1: ['sophisticated', 'comprehensive', 'elaborate', 'articulate']
      },
      petroleum: {
        B1: ['drilling', 'offshore', 'pipeline', 'safety', 'rig'],
        C1: ['reservoir', 'hydrocarbon', 'seismic', 'completion']
      }
    };
    
    return vocabularies[domain as keyof typeof vocabularies]?.[level as keyof typeof vocabularies['general']] || [];
  };

  const calculateSpeakingTime = () => {
    return Math.round(timeElapsed * 0.4); // Estimate 40% speaking time
  };

  const getTotalCorrections = () => {
    return messages.reduce((total, msg) => total + (msg.corrections?.length || 0), 0);
  };

  const getAverageScore = () => {
    const userMessages = messages.filter(msg => msg.role === 'user' && msg.scores);
    if (userMessages.length === 0) return 0;
    
    const totalScore = userMessages.reduce((sum, msg) => {
      const scores = msg.scores!;
      return sum + (scores.fluency + scores.pronunciation + scores.grammar) / 3;
    }, 0);
    
    return Math.round(totalScore / userMessages.length);
  };

  // Event Handlers
  const handleEndSession = async () => {
    setIsSessionActive(false);
    if (vapiClient.current) {
      await vapiClient.current.stop();
    }
    
    // Generate session summary and redirect
    if (onSessionEnd) {
      const summary = generateSessionSummary();
      onSessionEnd(summary);
    } else {
      router.push(`/session/${sessionConfig.session_id}/summary`);
    }
  };

  const handleEditMessage = (messageId: string) => {
    setCurrentEditingMessage(messageId);
  };

  const handleReplayAudio = async (audioRef: string) => {
    // Implement audio replay functionality
    console.log('Replaying audio:', audioRef);
  };

  const handleRequestCorrection = () => {
    // Send message to AI requesting correction
    console.log('Requesting correction from AI');
  };

  const handleRepeatLast = () => {
    // Request AI to repeat last message
    console.log('Requesting AI to repeat last message');
  };

  const handleSlowDown = () => {
    setSessionConfig(prev => ({
      ...prev,
      voice_speed: Math.max(0.5, prev.voice_speed - 0.25)
    }));
  };

  const handleExportTranscript = () => {
    const transcript = messages.map(msg => 
      `[${msg.timestamp.toLocaleTimeString()}] ${msg.role === 'user' ? sessionConfig.student_name : 'AI'}: ${msg.content}`
    ).join('\n');
    
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${sessionConfig.session_id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleToggleHighContrast = () => {
    setSessionConfig(prev => ({
      ...prev,
      high_contrast: !prev.high_contrast
    }));
  };

  const generateSessionSummary = () => {
    return {
      session_id: sessionConfig.session_id,
      student: sessionConfig.student_name,
      level: sessionConfig.student_level,
      domain: sessionConfig.domain,
      duration_seconds: timeElapsed,
      total_messages: messages.length,
      user_messages: messages.filter(m => m.role === 'user').length,
      ai_messages: messages.filter(m => m.role === 'assistant').length,
      total_corrections: getTotalCorrections(),
      average_score: getAverageScore(),
      messages: messages,
      ended_at: new Date().toISOString()
    };
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isSessionActive && !isPaused) {
      interval = setInterval(() => {
        setTimeElapsed(prev => {
          const newTime = prev + 1;
          
          // Auto-end session when time limit reached
          if (newTime >= sessionConfig.max_duration_minutes * 60) {
            handleEndSession();
            return prev;
          }
          
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isSessionActive, isPaused, sessionConfig.max_duration_minutes]);

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      {/* Inject CSS variables */}
      <style dangerouslySetInnerHTML={{ __html: CSS_VARIABLES }} />
      
      <div className="flex flex-col h-screen">
        <ConversationHeader />
        
        <div className="flex-1 flex">
          {/* Main conversation area */}
          <div className="flex-1 flex flex-col bg-gray-900/50">
            <ConversationFeed />
            <ConversationFooter />
          </div>
          
          {/* Context panel */}
          <SessionContextPanel />
        </div>
      </div>
    </div>
  );
}
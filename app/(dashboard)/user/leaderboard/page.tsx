"use client";

/**
 * Student Leaderboard Page - Competition System
 * 
 * This page displays rankings, competitions, and social features for students.
 * Includes leagues, weekly competitions, and friend comparisons.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Crown, 
  Star, 
  Flame, 
  Users, 
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Minus,
  Medal,
  Target,
  Calendar,
  User
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Loading from '@/components/course/Loading';

interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  avatar?: string;
  points: number;
  streak: number;
  league: 'bronze' | 'silver' | 'gold' | 'diamond';
  change: 'up' | 'down' | 'same' | 'new';
  changeAmount?: number;
  isCurrentUser?: boolean;
}

interface League {
  id: string;
  name: string;
  icon: string;
  color: string;
  minPoints: number;
  maxPoints?: number;
  participants: number;
}

interface Competition {
  id: string;
  title: string;
  description: string;
  type: 'weekly' | 'monthly' | 'special';
  startDate: string;
  endDate: string;
  participants: number;
  currentPosition: number;
  prize: string;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<LeaderboardEntry | null>(null);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [activeTab, setActiveTab] = useState('global');

  useEffect(() => {
    loadLeaderboardData();
  }, []);

  const loadLeaderboardData = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with real API calls
      const mockLeaderboard: LeaderboardEntry[] = [
        {
          id: '1',
          rank: 1,
          username: 'Alexandre_Pro',
          points: 2850,
          streak: 45,
          league: 'diamond',
          change: 'same'
        },
        {
          id: '2', 
          rank: 2,
          username: 'Maria_Study',
          points: 2720,
          streak: 32,
          league: 'diamond',
          change: 'up',
          changeAmount: 1
        },
        {
          id: '3',
          rank: 3,
          username: 'João_English',
          points: 2680,
          streak: 28,
          league: 'diamond',
          change: 'down',
          changeAmount: 1
        },
        {
          id: '4',
          rank: 4,
          username: 'Ana_Learning',
          points: 2450,
          streak: 21,
          league: 'gold',
          change: 'up',
          changeAmount: 2
        },
        {
          id: '5',
          rank: 5,
          username: 'Pedro_Fast',
          points: 2380,
          streak: 19,
          league: 'gold',
          change: 'same'
        },
        // Current user
        {
          id: 'current',
          rank: 15,
          username: 'Você',
          points: 1890,
          streak: 7,
          league: 'gold',
          change: 'up',
          changeAmount: 3,
          isCurrentUser: true
        }
      ];

      const mockLeagues: League[] = [
        {
          id: 'bronze',
          name: 'Liga Bronze',
          icon: '🥉',
          color: 'text-amber-600',
          minPoints: 0,
          maxPoints: 999,
          participants: 1240
        },
        {
          id: 'silver',
          name: 'Liga Prata',
          icon: '🥈',
          color: 'text-gray-400',
          minPoints: 1000,
          maxPoints: 1999,
          participants: 890
        },
        {
          id: 'gold',
          name: 'Liga Ouro',
          icon: '🥇',
          color: 'text-yellow-400',
          minPoints: 2000,
          maxPoints: 2999,
          participants: 320
        },
        {
          id: 'diamond',
          name: 'Liga Diamante',
          icon: '💎',
          color: 'text-blue-400',
          minPoints: 3000,
          participants: 85
        }
      ];

      const mockCompetitions: Competition[] = [
        {
          id: '1',
          title: 'Desafio Semanal',
          description: 'Complete o máximo de lições esta semana',
          type: 'weekly',
          startDate: '2 dias atrás',
          endDate: 'em 5 dias',
          participants: 342,
          currentPosition: 23,
          prize: 'Badge especial + 100 pontos'
        },
        {
          id: '2',
          title: 'Maratona de Streak',
          description: 'Maior sequência consecutiva vence',
          type: 'monthly',
          startDate: '1 semana atrás',
          endDate: 'em 3 semanas',
          participants: 156,
          currentPosition: 8,
          prize: 'Título exclusivo + 300 pontos'
        }
      ];

      setLeaderboard(mockLeaderboard);
      setCurrentUser(mockLeaderboard.find(entry => entry.isCurrentUser) || null);
      setLeagues(mockLeagues);
      setCompetitions(mockCompetitions);
      
    } catch (error) {
      console.error('Error loading leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChangeIcon = (change: string, amount?: number) => {
    switch (change) {
      case 'up':
        return <ArrowUp className="w-4 h-4 text-green-400" />;
      case 'down':
        return <ArrowDown className="w-4 h-4 text-red-400" />;
      case 'new':
        return <Star className="w-4 h-4 text-blue-400" />;
      default:
        return <Minus className="w-4 h-4 text-customgreys-dirtyGrey" />;
    }
  };

  const getLeagueInfo = (league: string) => {
    return leagues.find(l => l.id === league) || leagues[0];
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-customgreys-primarybg p-6">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/user/dashboard')}
            className="bg-customgreys-secondarybg border-customgreys-darkerGrey text-white hover:bg-customgreys-darkerGrey"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Rankings
            </h1>
            <p className="text-customgreys-dirtyGrey">
              Compete com outros estudantes e suba nas ligas
            </p>
          </div>
        </div>

        {/* Current User Position Card */}
        {currentUser && (
          <Card className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 border-violet-500/30 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-violet-500/20 rounded-full p-3">
                    <User className="w-6 h-6 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">
                      Sua Posição: #{currentUser.rank}
                    </h3>
                    <p className="text-violet-200 text-sm">
                      Liga {getLeagueInfo(currentUser.league).name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-xl">
                    {currentUser.points.toLocaleString()} pts
                  </p>
                  <div className="flex items-center gap-1 justify-end">
                    {getChangeIcon(currentUser.change, currentUser.changeAmount)}
                    <span className={`text-sm ${
                      currentUser.change === 'up' ? 'text-green-400' :
                      currentUser.change === 'down' ? 'text-red-400' : 'text-customgreys-dirtyGrey'
                    }`}>
                      {currentUser.changeAmount ? `${currentUser.changeAmount} posição` : 'mesma posição'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8 bg-customgreys-secondarybg">
          <TabsTrigger 
            value="global" 
            className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-customgreys-dirtyGrey"
          >
            Ranking Global
          </TabsTrigger>
          <TabsTrigger 
            value="leagues" 
            className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-customgreys-dirtyGrey"
          >
            Ligas
          </TabsTrigger>
          <TabsTrigger 
            value="competitions" 
            className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-customgreys-dirtyGrey"
          >
            Competições
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global">
          <Card className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                Top Estudantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.slice(0, 10).map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                      entry.isCurrentUser 
                        ? 'bg-violet-500/20 border-violet-500/50' 
                        : 'bg-customgreys-primarybg border-customgreys-darkerGrey hover:border-customgreys-dirtyGrey'
                    }`}
                  >
                    {/* Rank */}
                    <div className="flex-shrink-0 w-12 text-center">
                      {entry.rank <= 3 ? (
                        <div className="text-2xl">
                          {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                        </div>
                      ) : (
                        <div className="text-xl font-bold text-customgreys-dirtyGrey">
                          #{entry.rank}
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-medium ${entry.isCurrentUser ? 'text-violet-300' : 'text-white'}`}>
                          {entry.username}
                        </h3>
                        <span className={`text-lg ${getLeagueInfo(entry.league).color}`}>
                          {getLeagueInfo(entry.league).icon}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-customgreys-dirtyGrey">
                          {entry.points.toLocaleString()} pts
                        </span>
                        <div className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-400" />
                          <span className="text-customgreys-dirtyGrey">{entry.streak} dias</span>
                        </div>
                      </div>
                    </div>

                    {/* Change Indicator */}
                    <div className="flex items-center gap-1">
                      {getChangeIcon(entry.change, entry.changeAmount)}
                      {entry.changeAmount && (
                        <span className={`text-xs ${
                          entry.change === 'up' ? 'text-green-400' :
                          entry.change === 'down' ? 'text-red-400' : 'text-customgreys-dirtyGrey'
                        }`}>
                          {entry.changeAmount}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leagues">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {leagues.map((league) => (
              <Card
                key={league.id}
                className={`bg-customgreys-secondarybg border-customgreys-darkerGrey hover:shadow-xl transition-all duration-200 ${
                  currentUser?.league === league.id ? 'ring-2 ring-violet-500/50' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{league.icon}</div>
                    <div>
                      <CardTitle className={`${league.color} flex items-center gap-2`}>
                        {league.name}
                        {currentUser?.league === league.id && (
                          <Badge variant="outline" className="text-xs border-violet-500 text-violet-400">
                            Sua Liga
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-customgreys-dirtyGrey text-sm">
                        {league.minPoints.toLocaleString()}{league.maxPoints ? ` - ${league.maxPoints.toLocaleString()}` : '+'} pontos
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-customgreys-dirtyGrey">Participantes</span>
                      <span className="text-white">{league.participants.toLocaleString()}</span>
                    </div>
                    
                    {currentUser?.league === league.id && (
                      <div className="bg-customgreys-primarybg rounded-lg p-3 border border-violet-500/30">
                        <div className="text-center">
                          <p className="text-violet-300 text-sm mb-1">Sua posição na liga</p>
                          <p className="text-white font-bold text-lg">#{currentUser.rank}</p>
                        </div>
                      </div>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-customgreys-primarybg border-customgreys-darkerGrey text-white hover:bg-customgreys-darkerGrey"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Ver Ranking da Liga
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="competitions">
          <div className="space-y-6">
            {competitions.map((competition) => (
              <Card key={competition.id} className="bg-customgreys-secondarybg border-customgreys-darkerGrey">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Medal className="w-6 h-6 text-yellow-400" />
                        {competition.title}
                      </CardTitle>
                      <p className="text-customgreys-dirtyGrey mt-1">
                        {competition.description}
                      </p>
                    </div>
                    <Badge 
                      variant="outline"
                      className={`${
                        competition.type === 'weekly' ? 'border-green-500 text-green-400' :
                        competition.type === 'monthly' ? 'border-blue-500 text-blue-400' :
                        'border-purple-500 text-purple-400'
                      }`}
                    >
                      {competition.type === 'weekly' ? 'Semanal' : 
                       competition.type === 'monthly' ? 'Mensal' : 'Especial'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-customgreys-primarybg rounded-lg p-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Target className="w-5 h-5 text-blue-400" />
                          <p className="text-customgreys-dirtyGrey text-sm">Sua Posição</p>
                        </div>
                        <p className="text-white font-bold text-2xl">#{competition.currentPosition}</p>
                      </div>
                    </div>
                    
                    <div className="bg-customgreys-primarybg rounded-lg p-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Users className="w-5 h-5 text-green-400" />
                          <p className="text-customgreys-dirtyGrey text-sm">Participantes</p>
                        </div>
                        <p className="text-white font-bold text-2xl">{competition.participants}</p>
                      </div>
                    </div>
                    
                    <div className="bg-customgreys-primarybg rounded-lg p-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Calendar className="w-5 h-5 text-purple-400" />
                          <p className="text-customgreys-dirtyGrey text-sm">Termina</p>
                        </div>
                        <p className="text-white font-bold text-lg">{competition.endDate}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      <h4 className="text-white font-medium">Prêmio</h4>
                    </div>
                    <p className="text-yellow-200 text-sm">{competition.prize}</p>
                  </div>
                  
                  <Button 
                    className="w-full mt-4 bg-violet-600 hover:bg-violet-700"
                  >
                    Ver Detalhes da Competição
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

    </div>
  );
}
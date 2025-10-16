"use client";

/**
 * Student Leaderboard Page - Competition System
 * 
 * This page displays rankings, competitions, and social features for students.
 * Includes leagues, weekly competitions, and friend comparisons.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// import { Progress } from '@/components/ui/progress'; // TODO: Use Progress component
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
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
import { 
  useGetGlobalLeaderboardQuery,
  useGetLeaguesInfoQuery,
  useGetActiveCompetitionsQuery,
} from '@/src/domains/student/leaderboard/api/studentLeaderboardApiSlice';
import type {
  LeaderboardEntry,
  League,
  Competition
} from '@/src/domains/student/leaderboard/types';


export default function LeaderboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('global');

  // RTK Query hooks for real data
  const { 
    data: leaderboardData, 
    isLoading: leaderboardLoading 
  } = useGetGlobalLeaderboardQuery();
  
  const { 
    data: leagues = [], 
    isLoading: leaguesLoading 
  } = useGetLeaguesInfoQuery();
  
  const { 
    data: competitions = [], 
    isLoading: competitionsLoading 
  } = useGetActiveCompetitionsQuery();

  const isLoading = leaderboardLoading || leaguesLoading || competitionsLoading;
  const leaderboard = leaderboardData?.leaderboard || [];
  const currentUser = leaderboardData?.currentUser || null;


  const getChangeIcon = (change: string, _amount?: number) => {
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

  if (isLoading) {
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
                    <p className="text-gray-200 text-sm">
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
                {leaderboard.slice(0, 10).map((entry, _index) => (
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
"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Eye,
  EyeOff,
  Quote,
  TrendingUp,
  Users,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import Loading from "@/components/course/Loading";
import {
  useGetAdminFeedbackListQuery,
  useGetAdminFeedbackStatsQuery,
  useUpdateAdminFeedbackMutation,
  AdminFeedback,
} from "@/src/domains/shared/feedback/api/feedbackApiSlice";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export default function AdminTestimonialsPage() {
  const { user: currentUser, isAuthenticated, isLoading } = useDjangoAuth();

  // Fetch feedbacks that could be testimonials (rating >= 4, has comment)
  const { data: feedbackList, isLoading: feedbackLoading, refetch } = useGetAdminFeedbackListQuery({
    limit: 100,
    offset: 0,
  });
  const { data: stats } = useGetAdminFeedbackStatsQuery();
  const [updateFeedback, { isLoading: updating }] = useUpdateAdminFeedbackMutation();

  // Filter for potential testimonials
  const allFeedbacks = feedbackList?.feedbacks || [];
  const publicTestimonials = allFeedbacks.filter((f) => f.allow_public && f.rating && f.rating >= 4 && f.comment);
  const potentialTestimonials = allFeedbacks.filter(
    (f) => !f.allow_public && f.rating && f.rating >= 4 && f.comment
  );

  // Handle toggle public
  const handleTogglePublic = async (feedback: AdminFeedback, makePublic: boolean) => {
    try {
      await updateFeedback({
        id: feedback.id,
        data: { allow_public: makePublic, is_reviewed: true },
      }).unwrap();
      toast.success(makePublic ? "Testemunho tornado público!" : "Testemunho removido da área pública.");
      refetch();
    } catch (error) {
      toast.error("Erro ao atualizar testemunho.");
    }
  };

  // Anonymize name
  const anonymizeName = (name: string) => {
    const parts = name.split(" ");
    if (parts.length > 1) {
      return `${parts[0]} ${parts[parts.length - 1][0]}.`;
    }
    return `${parts[0][0]}.`;
  };

  if (isLoading) {
    return (
      <Loading
        title="Testemunhos"
        subtitle="Sistema de Administração"
        description="Carregando testemunhos..."
        icon={Star}
        progress={70}
        theme={{
          primary: "yellow",
          secondary: "amber",
          accent: "orange",
        }}
        size="lg"
      />
    );
  }

  if (!isAuthenticated || !currentUser) {
    return <div className="p-8 text-white">Faça login para acessar esta página.</div>;
  }

  if (currentUser.role !== "admin") {
    return <div className="p-8 text-white">Acesso negado. Apenas administradores podem acessar esta página.</div>;
  }

  return (
    <div className="min-h-screen bg-customgreys-primarybg text-white">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative px-4 sm:px-6 py-6 sm:py-8"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 sm:w-80 h-40 sm:h-80 bg-yellow-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 sm:-bottom-20 -left-20 sm:-left-40 w-40 sm:w-80 h-40 sm:h-80 bg-amber-600/10 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-orange-500/10 border border-yellow-500/30 rounded-full px-4 sm:px-8 py-2 sm:py-3 mb-6 sm:mb-8 backdrop-blur-sm"
            >
              <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
              <span className="text-yellow-300 font-semibold text-sm sm:text-base lg:text-lg">Gestão de Testemunhos</span>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 sm:mb-6"
            >
              Testemunhos dos{" "}
              <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                Utilizadores
              </span>
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-gray-400 max-w-2xl mx-auto"
            >
              Gerencie os testemunhos que aparecem na landing page. Apenas feedbacks com 4+ estrelas e comentários
              podem ser testemunhos.
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-8">
        {/* Stats */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="grid gap-4 sm:grid-cols-3"
        >
          <Card className="border border-green-500/30 bg-gradient-to-br from-green-950/50 to-black backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Testemunhos Públicos</CardTitle>
              <Eye className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{publicTestimonials.length}</div>
              <p className="text-xs text-white/70 mt-1">Visíveis na landing page</p>
            </CardContent>
          </Card>

          <Card className="border border-amber-500/30 bg-gradient-to-br from-amber-950/50 to-black backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Potenciais Testemunhos</CardTitle>
              <Clock className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{potentialTestimonials.length}</div>
              <p className="text-xs text-white/70 mt-1">Aguardando aprovação</p>
            </CardContent>
          </Card>

          <Card className="border border-yellow-500/30 bg-gradient-to-br from-yellow-950/50 to-black backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Avaliação Média</CardTitle>
              <Star className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white flex items-center gap-2">
                {stats?.average_rating || 0}
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Public Testimonials */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <Card className="border border-green-500/30 bg-gradient-to-br from-green-950/20 to-black backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-600/20 rounded-lg">
                  <Eye className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white">Testemunhos Públicos</CardTitle>
                  <p className="text-sm text-gray-400">Estes testemunhos são exibidos na landing page</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {feedbackLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : publicTestimonials.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <ThumbsUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum testemunho público ainda.</p>
                  <p className="text-sm mt-2">Aprove testemunhos da secção abaixo.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {publicTestimonials.map((feedback, index) => (
                    <motion.div
                      key={feedback.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative p-6 bg-gradient-to-br from-green-900/20 to-transparent border border-green-500/20 rounded-xl"
                    >
                      <Quote className="absolute top-4 right-4 w-8 h-8 text-green-500/20" />

                      <div className="flex mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "w-4 h-4",
                              star <= (feedback.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
                            )}
                          />
                        ))}
                      </div>

                      <p className="text-white/90 mb-4 line-clamp-3">&ldquo;{feedback.comment}&rdquo;</p>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{anonymizeName(feedback.user_name)}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(feedback.created_at).toLocaleDateString("pt-PT")}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          onClick={() => handleTogglePublic(feedback, false)}
                          disabled={updating}
                        >
                          <EyeOff className="w-4 h-4 mr-1" />
                          Remover
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Potential Testimonials */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <Card className="border border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-black backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-600/20 rounded-lg">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white">Potenciais Testemunhos</CardTitle>
                  <p className="text-sm text-gray-400">
                    Feedbacks com 4+ estrelas que podem ser tornados públicos
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {feedbackLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : potentialTestimonials.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum testemunho pendente.</p>
                  <p className="text-sm mt-2">Novos feedbacks positivos aparecerão aqui.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {potentialTestimonials.map((feedback, index) => (
                    <motion.div
                      key={feedback.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative p-6 bg-gradient-to-br from-amber-900/20 to-transparent border border-amber-500/20 rounded-xl"
                    >
                      <Quote className="absolute top-4 right-4 w-8 h-8 text-amber-500/20" />

                      <div className="flex mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "w-4 h-4",
                              star <= (feedback.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
                            )}
                          />
                        ))}
                      </div>

                      <p className="text-white/90 mb-4 line-clamp-3">&ldquo;{feedback.comment}&rdquo;</p>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{feedback.user_name}</p>
                          <p className="text-xs text-gray-500">
                            Será anonimizado para: {anonymizeName(feedback.user_name)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-400 hover:text-green-300 hover:bg-green-900/20"
                          onClick={() => handleTogglePublic(feedback, true)}
                          disabled={updating}
                        >
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          Aprovar
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Preview Section */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <Card className="border border-violet-500/30 bg-gradient-to-br from-violet-950/20 to-black backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-600/20 rounded-lg">
                  <Eye className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white">Preview na Landing Page</CardTitle>
                  <p className="text-sm text-gray-400">Como os testemunhos aparecerão aos visitantes</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {publicTestimonials.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>Aprove testemunhos para ver o preview.</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-3">
                  {publicTestimonials.slice(0, 3).map((feedback) => (
                    <div
                      key={feedback.id}
                      className="p-6 bg-gradient-to-br from-violet-900/30 to-purple-900/20 border border-violet-500/20 rounded-2xl"
                    >
                      <div className="flex mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "w-5 h-5",
                              star <= (feedback.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
                            )}
                          />
                        ))}
                      </div>

                      <p className="text-white/90 mb-4 text-sm line-clamp-4">&ldquo;{feedback.comment}&rdquo;</p>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {feedback.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{anonymizeName(feedback.user_name)}</p>
                          <p className="text-xs text-violet-400">Utilizador Verificado</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

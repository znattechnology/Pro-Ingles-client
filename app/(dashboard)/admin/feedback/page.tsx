"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Star,
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  Eye,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  ThumbsUp,
  Search,
  MoreHorizontal,
  Check,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import Loading from "@/components/course/Loading";
import {
  useGetAdminFeedbackListQuery,
  useGetAdminFeedbackStatsQuery,
  useUpdateAdminFeedbackMutation,
  AdminFeedback,
  FeedbackType,
} from "@/src/domains/shared/feedback/api/feedbackApiSlice";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const feedbackTypeLabels: Record<FeedbackType, string> = {
  general: "Geral",
  feature: "Funcionalidade",
  bug: "Bug",
  lesson: "Lição",
  ai_tutor: "AI Tutor",
  content: "Conteúdo",
  testimonial: "Testemunho",
};

const triggerLabels: Record<string, string> = {
  first_lesson: "Primeira Lição",
  milestone_lessons: "Marco de Lições",
  course_complete: "Curso Completo",
  ai_sessions: "Sessões AI",
  days_active: "Dias Ativos",
  manual: "Manual",
  prompt: "Sistema",
};

export default function AdminFeedbackPage() {
  const { user: currentUser, isAuthenticated, isLoading } = useDjangoAuth();

  // State for filters
  const [filters, setFilters] = React.useState<{
    type?: FeedbackType;
    rating?: number;
    allow_public?: boolean;
    is_reviewed?: boolean;
    limit: number;
    offset: number;
  }>({
    limit: 20,
    offset: 0,
  });

  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedFeedback, setSelectedFeedback] = React.useState<AdminFeedback | null>(null);
  const [adminNotes, setAdminNotes] = React.useState("");

  // API queries
  const { data: feedbackList, isLoading: feedbackLoading, refetch } = useGetAdminFeedbackListQuery(filters);
  const { data: stats, isLoading: statsLoading } = useGetAdminFeedbackStatsQuery();
  const [updateFeedback, { isLoading: updating }] = useUpdateAdminFeedbackMutation();

  // Handle marking as reviewed
  const handleMarkReviewed = async (feedback: AdminFeedback) => {
    try {
      await updateFeedback({
        id: feedback.id,
        data: { is_reviewed: true },
      }).unwrap();
      toast.success("Feedback marcado como revisado!");
      refetch();
    } catch (error) {
      toast.error("Erro ao atualizar feedback.");
    }
  };

  // Handle toggle public
  const handleTogglePublic = async (feedback: AdminFeedback) => {
    try {
      await updateFeedback({
        id: feedback.id,
        data: { allow_public: !feedback.allow_public },
      }).unwrap();
      toast.success(feedback.allow_public ? "Removido de testemunhos públicos." : "Adicionado a testemunhos públicos!");
      refetch();
    } catch (error) {
      toast.error("Erro ao atualizar feedback.");
    }
  };

  // Handle save admin notes
  const handleSaveNotes = async () => {
    if (!selectedFeedback) return;

    try {
      await updateFeedback({
        id: selectedFeedback.id,
        data: {
          admin_notes: adminNotes,
          is_reviewed: true,
        },
      }).unwrap();
      toast.success("Notas guardadas com sucesso!");
      setSelectedFeedback(null);
      refetch();
    } catch (error) {
      toast.error("Erro ao guardar notas.");
    }
  };

  // Pagination
  const handlePageChange = (direction: "prev" | "next") => {
    setFilters((prev) => ({
      ...prev,
      offset: direction === "next" ? prev.offset + prev.limit : Math.max(0, prev.offset - prev.limit),
    }));
  };

  if (isLoading) {
    return (
      <Loading
        title="Gestão de Feedbacks"
        subtitle="Sistema de Administração"
        description="Carregando dados..."
        icon={MessageSquare}
        progress={70}
        theme={{
          primary: "violet",
          secondary: "purple",
          accent: "blue",
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

  const feedbacks = feedbackList?.feedbacks || [];
  const totalPages = Math.ceil((feedbackList?.total || 0) / filters.limit);
  const currentPage = Math.floor(filters.offset / filters.limit) + 1;

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
          <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 sm:w-80 h-40 sm:h-80 bg-violet-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 sm:-bottom-20 -left-20 sm:-left-40 w-40 sm:w-80 h-40 sm:h-80 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-indigo-500/10 border border-violet-500/30 rounded-full px-4 sm:px-8 py-2 sm:py-3 mb-6 sm:mb-8 backdrop-blur-sm"
            >
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400" />
              <span className="text-violet-300 font-semibold text-sm sm:text-base lg:text-lg">Gestão de Feedbacks</span>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 sm:mb-6"
            >
              Feedbacks dos{" "}
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Utilizadores
              </span>
            </motion.h1>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6 pb-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <Card className="border border-violet-500/30 bg-gradient-to-br from-violet-950/50 to-black backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Total de Feedbacks</CardTitle>
              <MessageSquare className="h-4 w-4 text-violet-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats?.total || 0}</div>
              <p className="text-xs text-white/70 mt-1">{stats?.recent_count || 0} nos últimos 7 dias</p>
            </CardContent>
          </Card>

          <Card className="border border-green-500/30 bg-gradient-to-br from-green-950/50 to-black backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Avaliação Média</CardTitle>
              <Star className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white flex items-center gap-2">
                {stats?.average_rating || 0}
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "w-4 h-4",
                        star <= Math.round(stats?.average_rating || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-600"
                      )}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-blue-500/30 bg-gradient-to-br from-blue-950/50 to-black backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Pendentes Revisão</CardTitle>
              <Clock className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats?.pending_review || 0}</div>
              <p className="text-xs text-white/70 mt-1">{stats?.reviewed || 0} já revisados</p>
            </CardContent>
          </Card>

          <Card className="border border-emerald-500/30 bg-gradient-to-br from-emerald-950/50 to-black backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Testemunhos Públicos</CardTitle>
              <ThumbsUp className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats?.public_testimonials || 0}</div>
              <p className="text-xs text-white/70 mt-1">Visíveis na landing page</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters and Table */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <Card className="border border-violet-500/30 bg-gradient-to-br from-violet-950/30 to-black backdrop-blur-sm">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="text-xl text-white">Todos os Feedbacks</CardTitle>
                <Button
                  variant="outline"
                  className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filtros
                  {showFilters ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                </Button>
              </div>

              {/* Filters */}
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4"
                >
                  <Select
                    value={filters.type || "all"}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        type: value === "all" ? undefined : (value as FeedbackType),
                        offset: 0,
                      }))
                    }
                  >
                    <SelectTrigger className="bg-violet-900/20 border-violet-900/30 text-white">
                      <SelectValue placeholder="Tipo de Feedback" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-violet-900/30">
                      <SelectItem value="all" className="text-white">
                        Todos os tipos
                      </SelectItem>
                      {Object.entries(feedbackTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key} className="text-white">
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.rating?.toString() || "all"}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        rating: value === "all" ? undefined : parseInt(value),
                        offset: 0,
                      }))
                    }
                  >
                    <SelectTrigger className="bg-violet-900/20 border-violet-900/30 text-white">
                      <SelectValue placeholder="Avaliação" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-violet-900/30">
                      <SelectItem value="all" className="text-white">
                        Todas as avaliações
                      </SelectItem>
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <SelectItem key={rating} value={rating.toString()} className="text-white">
                          {rating} estrela{rating !== 1 ? "s" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.is_reviewed === undefined ? "all" : filters.is_reviewed.toString()}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        is_reviewed: value === "all" ? undefined : value === "true",
                        offset: 0,
                      }))
                    }
                  >
                    <SelectTrigger className="bg-violet-900/20 border-violet-900/30 text-white">
                      <SelectValue placeholder="Estado de Revisão" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-violet-900/30">
                      <SelectItem value="all" className="text-white">
                        Todos
                      </SelectItem>
                      <SelectItem value="false" className="text-white">
                        Pendente
                      </SelectItem>
                      <SelectItem value="true" className="text-white">
                        Revisado
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="ghost"
                    className="text-violet-400 hover:text-white hover:bg-violet-900/20"
                    onClick={() =>
                      setFilters({
                        limit: 20,
                        offset: 0,
                      })
                    }
                  >
                    <X className="h-4 w-4 mr-2" />
                    Limpar Filtros
                  </Button>
                </motion.div>
              )}
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-violet-900/30 bg-violet-950/20">
                      <TableHead className="text-white/90">Utilizador</TableHead>
                      <TableHead className="text-white/90">Tipo</TableHead>
                      <TableHead className="text-white/90">Avaliação</TableHead>
                      <TableHead className="text-white/90">Comentário</TableHead>
                      <TableHead className="text-white/90">Trigger</TableHead>
                      <TableHead className="text-white/90">Estado</TableHead>
                      <TableHead className="text-white/90">Data</TableHead>
                      <TableHead className="text-white/90 text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feedbackLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="flex items-center justify-center gap-2">
                            <div className="h-5 w-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                            <span className="text-white/70">A carregar...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : feedbacks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-white/70">
                          Nenhum feedback encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      feedbacks.map((feedback, index) => (
                        <motion.tr
                          key={feedback.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="border-violet-900/30 hover:bg-violet-900/10 transition-colors"
                        >
                          <TableCell className="text-white font-medium">{feedback.user_name}</TableCell>
                          <TableCell>
                            <Badge className="bg-violet-600 text-white">
                              {feedbackTypeLabels[feedback.feedback_type] || feedback.feedback_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {feedback.rating ? (
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={cn(
                                      "w-4 h-4",
                                      star <= feedback.rating! ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
                                    )}
                                  />
                                ))}
                              </div>
                            ) : (
                              <span className="text-white/50">-</span>
                            )}
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <p className="text-white/80 truncate">{feedback.comment || "-"}</p>
                          </TableCell>
                          <TableCell>
                            <span className="text-white/70 text-sm">
                              {triggerLabels[feedback.trigger] || feedback.trigger}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {feedback.is_reviewed ? (
                                <Badge className="bg-green-600 text-white text-xs">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Revisado
                                </Badge>
                              ) : (
                                <Badge className="bg-amber-600 text-white text-xs">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Pendente
                                </Badge>
                              )}
                              {feedback.allow_public && (
                                <Badge className="bg-blue-600 text-white text-xs">
                                  <ThumbsUp className="w-3 h-3 mr-1" />
                                  Público
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-white/70 text-sm">
                            {new Date(feedback.created_at).toLocaleDateString("pt-PT", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-violet-900/20">
                                    <MoreHorizontal className="h-4 w-4 text-white" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-black/90 border-violet-900/30">
                                  <DropdownMenuLabel className="text-white">Ações</DropdownMenuLabel>
                                  <DropdownMenuSeparator className="bg-violet-900/30" />
                                  <DropdownMenuItem
                                    className="text-white hover:bg-violet-900/20 cursor-pointer"
                                    onClick={() => {
                                      setSelectedFeedback(feedback);
                                      setAdminNotes(feedback.admin_notes || "");
                                    }}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    Ver Detalhes
                                  </DropdownMenuItem>
                                  {!feedback.is_reviewed && (
                                    <DropdownMenuItem
                                      className="text-white hover:bg-violet-900/20 cursor-pointer"
                                      onClick={() => handleMarkReviewed(feedback)}
                                    >
                                      <Check className="mr-2 h-4 w-4 text-green-400" />
                                      Marcar Revisado
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    className="text-white hover:bg-violet-900/20 cursor-pointer"
                                    onClick={() => handleTogglePublic(feedback)}
                                  >
                                    {feedback.allow_public ? (
                                      <>
                                        <XCircle className="mr-2 h-4 w-4 text-red-400" />
                                        Remover Público
                                      </>
                                    ) : (
                                      <>
                                        <ThumbsUp className="mr-2 h-4 w-4 text-blue-400" />
                                        Tornar Público
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {feedbackList && feedbackList.total > filters.limit && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-violet-900/30">
                  <p className="text-sm text-white/70">
                    Mostrando {filters.offset + 1} - {Math.min(filters.offset + filters.limit, feedbackList.total)} de{" "}
                    {feedbackList.total}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10"
                      onClick={() => handlePageChange("prev")}
                      disabled={filters.offset === 0}
                    >
                      Anterior
                    </Button>
                    <span className="flex items-center px-3 text-white/70 text-sm">
                      Página {currentPage} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10"
                      onClick={() => handlePageChange("next")}
                      disabled={filters.offset + filters.limit >= feedbackList.total}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Feedback Details Modal */}
      <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
        <DialogContent className="bg-gradient-to-br from-gray-900 to-gray-800 border-violet-500/30 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Detalhes do Feedback</DialogTitle>
            <DialogDescription className="text-gray-400">
              Feedback de {selectedFeedback?.user_name}
            </DialogDescription>
          </DialogHeader>

          {selectedFeedback && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Tipo</label>
                  <p className="text-white">
                    {feedbackTypeLabels[selectedFeedback.feedback_type] || selectedFeedback.feedback_type}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Trigger</label>
                  <p className="text-white">
                    {triggerLabels[selectedFeedback.trigger] || selectedFeedback.trigger}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Avaliação</label>
                  <div className="flex mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "w-5 h-5",
                          star <= (selectedFeedback.rating || 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-600"
                        )}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Data</label>
                  <p className="text-white">
                    {new Date(selectedFeedback.created_at).toLocaleDateString("pt-PT", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400">Comentário</label>
                <p className="text-white mt-1 p-3 bg-gray-800/50 rounded-lg">
                  {selectedFeedback.comment || "Sem comentário"}
                </p>
              </div>

              <div className="flex gap-4">
                <Badge className={selectedFeedback.is_reviewed ? "bg-green-600" : "bg-amber-600"}>
                  {selectedFeedback.is_reviewed ? "Revisado" : "Pendente Revisão"}
                </Badge>
                {selectedFeedback.allow_public && (
                  <Badge className="bg-blue-600">Testemunho Público</Badge>
                )}
                {selectedFeedback.allow_contact && (
                  <Badge className="bg-purple-600">Permite Contacto</Badge>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-400">Notas do Admin</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Adicione notas sobre este feedback..."
                  className="mt-1 bg-gray-800/50 border-gray-700 text-white"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedFeedback(null)}
              className="border-gray-700 text-gray-300"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveNotes}
              disabled={updating}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              {updating ? "A guardar..." : "Guardar Notas"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

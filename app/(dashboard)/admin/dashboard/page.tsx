"use client";

import * as React from "react";
import {
  Users,
  BookOpen,
  DollarSign,
  GraduationCap,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import Loading from "@/components/course/Loading";

// Mock data for ProEnglish admin dashboard
const enrollmentData = [
  { name: "Jan", value: 45 },
  { name: "Fev", value: 52 },
  { name: "Mar", value: 48 },
  { name: "Abr", value: 61 },
  { name: "Mai", value: 55 },
  { name: "Jun", value: 67 },
];

const revenueData = [
  { name: "Jan", value: 15000 },
  { name: "Fev", value: 18000 },
  { name: "Mar", value: 16500 },
  { name: "Abr", value: 22000 },
  { name: "Mai", value: 19500 },
  { name: "Jun", value: 25000 },
];

const recentStudents = [
  {
    name: "Maria Silva",
    email: "maria@email.com",
    course: "English Basics",
    status: "Ativo",
    enrolled: "2024-01-15",
  },
  {
    name: "João Santos",
    email: "joao@email.com",
    course: "Advanced English",
    status: "Ativo",
    enrolled: "2024-01-14",
  },
  {
    name: "Ana Costa",
    email: "ana@email.com",
    course: "Business English",
    status: "Pendente",
    enrolled: "2024-01-13",
  },
];

const topCourses = [
  { name: "English Basics", students: 234, revenue: "R$ 45.600" },
  { name: "Advanced English", students: 189, revenue: "R$ 67.890" },
  { name: "Business English", students: 156, revenue: "R$ 54.320" },
];

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useDjangoAuth();

  if (isLoading) return <Loading />;
  if (!isAuthenticated || !user) {
    return <div>Faça login para acessar o dashboard.</div>;
  }

  if (user.role !== 'admin') {
    return <div>Acesso negado. Apenas administradores podem acessar esta página.</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Dashboard Administrativo
          </h1>
          <p className="text-white/70">
            Bem-vindo de volta, {user.name}! Aqui está o que está acontecendo na ProEnglish.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-violet-900/30 bg-black">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Total de Estudantes
            </CardTitle>
            <Users className="h-4 w-4 text-violet-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">1,234</div>
            <p className="text-xs text-green-400">
              +12% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card className="border border-violet-900/30 bg-black">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Total de Professores
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-violet-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">48</div>
            <p className="text-xs text-green-400">
              +3 novos este mês
            </p>
          </CardContent>
        </Card>

        <Card className="border border-violet-900/30 bg-black">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Cursos Ativos
            </CardTitle>
            <BookOpen className="h-4 w-4 text-violet-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">89</div>
            <p className="text-xs text-blue-400">
              15 criados este mês
            </p>
          </CardContent>
        </Card>

        <Card className="border border-violet-900/30 bg-black">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Receita Mensal
            </CardTitle>
            <DollarSign className="h-4 w-4 text-violet-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">R$ 125.430</div>
            <p className="text-xs text-green-400">
              +18% em relação ao mês passado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border border-violet-900/30 bg-black">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base text-white">Novas Matrículas</CardTitle>
              <p className="text-xs text-white/70">
                Últimos 6 meses
              </p>
            </div>
            <TrendingUp className="h-4 w-4 text-violet-400" />
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={enrollmentData}>
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-sm text-white/70">
              Crescimento constante de matrículas nos últimos meses
            </div>
          </CardContent>
        </Card>

        <Card className="border border-violet-900/30 bg-black">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base text-white">
                Receita Mensal
              </CardTitle>
              <p className="text-xs text-white/70">
                Últimos 6 meses
              </p>
            </div>
            <DollarSign className="h-4 w-4 text-violet-400" />
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Bar
                    dataKey="value"
                    fill="#8b5cf6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-sm text-white/70">
              Crescimento de 18% na receita este mês
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <Card className="border border-violet-900/30 bg-black">
        <CardHeader>
          <Tabs defaultValue="recent-students" className="w-full">
            <div className="flex items-center justify-between">
              <TabsList className="bg-violet-900/20">
                <TabsTrigger value="recent-students" className="data-[state=active]:bg-violet-800">
                  Novos Estudantes
                </TabsTrigger>
                <TabsTrigger value="top-courses" className="data-[state=active]:bg-violet-800">
                  Cursos Populares
                </TabsTrigger>
              </TabsList>
              <Button variant="ghost" className="h-8 text-xs text-white hover:bg-violet-900">
                Ver Todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <TabsContent value="recent-students" className="border-none p-0 pt-3">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-violet-900/20 border-violet-900/30">
                    <TableHead className="text-white/70">Estudante</TableHead>
                    <TableHead className="text-white/70">Curso</TableHead>
                    <TableHead className="text-white/70">Status</TableHead>
                    <TableHead className="text-white/70">Data Matrícula</TableHead>
                    <TableHead className="text-white/70">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentStudents.map((student, index) => (
                    <TableRow className="hover:bg-violet-900/20 border-violet-900/30" key={index}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-white">
                            {student.name}
                          </div>
                          <div className="text-sm text-white/70">
                            {student.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-white">{student.course}</TableCell>
                      <TableCell>
                        <Badge
                          variant={student.status === "Ativo" ? "default" : "secondary"}
                          className={student.status === "Ativo" ? "bg-green-600" : "bg-yellow-600"}
                        >
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">{student.enrolled}</TableCell>
                      <TableCell>
                        <Button size="sm" className="bg-violet-800 hover:bg-violet-900">
                          Ver Perfil
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="top-courses" className="border-none p-0 pt-3">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-violet-900/20 border-violet-900/30">
                    <TableHead className="text-white/70">Curso</TableHead>
                    <TableHead className="text-white/70">Estudantes</TableHead>
                    <TableHead className="text-white/70">Receita</TableHead>
                    <TableHead className="text-white/70">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCourses.map((course, index) => (
                    <TableRow className="hover:bg-violet-900/20 border-violet-900/30" key={index}>
                      <TableCell className="font-medium text-white">{course.name}</TableCell>
                      <TableCell className="text-white">{course.students}</TableCell>
                      <TableCell className="text-white">{course.revenue}</TableCell>
                      <TableCell>
                        <Button size="sm" className="bg-violet-800 hover:bg-violet-900">
                          Ver Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  );
}
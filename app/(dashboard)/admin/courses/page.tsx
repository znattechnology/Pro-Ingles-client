"use client";

import * as React from "react";
import { BookOpen, Plus, Search, Filter, MoreHorizontal, Users, DollarSign } from "lucide-react";
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
} from "@/components/ui/dropdown-menu";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import Loading from "@/components/course/Loading";

// Mock data for courses
const mockCourses = [
  {
    id: "1",
    title: "English Basics",
    instructor: "Prof. Maria Silva",
    students: 234,
    price: "R$ 199,90",
    status: "published",
    category: "Beginner",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "Advanced English",
    instructor: "Prof. João Santos",
    students: 189,
    price: "R$ 359,90",
    status: "published",
    category: "Advanced",
    createdAt: "2024-01-10",
  },
  {
    id: "3",
    title: "Business English",
    instructor: "Prof. Ana Costa",
    students: 156,
    price: "R$ 299,90",
    status: "draft",
    category: "Intermediate",
    createdAt: "2024-01-05",
  },
];

export default function CoursesManagement() {
  const { user, isAuthenticated, isLoading } = useDjangoAuth();
  const [searchTerm, setSearchTerm] = React.useState("");

  if (isLoading) return <Loading />;
  if (!isAuthenticated || !user) {
    return <div>Faça login para acessar esta página.</div>;
  }

  if (user.role !== 'admin') {
    return <div>Acesso negado. Apenas administradores podem acessar esta página.</div>;
  }

  const filteredCourses = mockCourses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-600';
      case 'draft': return 'bg-yellow-600';
      case 'archived': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'Beginner': return 'bg-blue-600';
      case 'Intermediate': return 'bg-purple-600';
      case 'Advanced': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Gerenciar Cursos
          </h1>
          <p className="text-white/70">
            Gerencie todos os cursos da plataforma ProEnglish
          </p>
        </div>
        <Button className="bg-violet-800 hover:bg-violet-900">
          <Plus className="mr-2 h-4 w-4" />
          Novo Curso
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border border-violet-900/30 bg-black">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Total Cursos
            </CardTitle>
            <BookOpen className="h-4 w-4 text-violet-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">89</div>
            <p className="text-xs text-green-400">+15 este mês</p>
          </CardContent>
        </Card>

        <Card className="border border-violet-900/30 bg-black">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Cursos Publicados
            </CardTitle>
            <BookOpen className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">67</div>
            <p className="text-xs text-white/70">75.3% do total</p>
          </CardContent>
        </Card>

        <Card className="border border-violet-900/30 bg-black">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Total Estudantes
            </CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">2,456</div>
            <p className="text-xs text-green-400">+18% este mês</p>
          </CardContent>
        </Card>

        <Card className="border border-violet-900/30 bg-black">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Receita Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">R$ 587.320</div>
            <p className="text-xs text-green-400">+22% este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border border-violet-900/30 bg-black">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-white/50" />
              <Input
                placeholder="Buscar cursos por título ou professor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 bg-violet-900/20 border-violet-900/30 text-white"
              />
            </div>
            <Button variant="outline" className="border-violet-900/30 text-white hover:bg-violet-900/20">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-violet-900/20 border-violet-900/30">
                <TableHead className="text-white/70">Curso</TableHead>
                <TableHead className="text-white/70">Professor</TableHead>
                <TableHead className="text-white/70">Categoria</TableHead>
                <TableHead className="text-white/70">Estudantes</TableHead>
                <TableHead className="text-white/70">Preço</TableHead>
                <TableHead className="text-white/70">Status</TableHead>
                <TableHead className="text-white/70">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course.id} className="hover:bg-violet-900/20 border-violet-900/30">
                  <TableCell>
                    <div>
                      <div className="font-medium text-white">{course.title}</div>
                      <div className="text-sm text-white/70">Criado em {course.createdAt}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-white">{course.instructor}</TableCell>
                  <TableCell>
                    <Badge className={`${getCategoryBadgeColor(course.category)} text-white`}>
                      {course.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white">{course.students}</TableCell>
                  <TableCell className="text-white font-medium">{course.price}</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusBadgeColor(course.status)} text-white`}>
                      {course.status === 'published' ? 'Publicado' : 
                       course.status === 'draft' ? 'Rascunho' : 
                       course.status === 'archived' ? 'Arquivado' : course.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4 text-white" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-black border-violet-900/30">
                        <DropdownMenuLabel className="text-white">Ações</DropdownMenuLabel>
                        <DropdownMenuItem className="text-white hover:bg-violet-900/20">
                          Ver curso
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-white hover:bg-violet-900/20">
                          Editar curso
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-white hover:bg-violet-900/20">
                          Ver estudantes
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-white hover:bg-violet-900/20">
                          Alterar status
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-400 hover:bg-red-900/20">
                          Arquivar curso
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredCourses.length === 0 && (
            <div className="text-center py-8">
              <p className="text-white/70">Nenhum curso encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
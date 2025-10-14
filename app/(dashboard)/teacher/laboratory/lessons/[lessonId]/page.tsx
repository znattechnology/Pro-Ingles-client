"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  Target,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  Volume2
} from "lucide-react";
import Loading from "@/components/course/Loading";
import CourseBanner from "@/components/course/CourseBanner";

const LessonManagement = () => {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [lesson, setLesson] = useState<any>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<any>(null);
  const [challengeFormData, setChallengeFormData] = useState({
    type: 'SELECT',
    question: '',
    order: 1,
    options: [
      { text: '', is_correct: false, image_url: '', audio_url: '', order: 1 },
      { text: '', is_correct: false, image_url: '', audio_url: '', order: 2 },
      { text: '', is_correct: false, image_url: '', audio_url: '', order: 3 },
      { text: '', is_correct: false, image_url: '', audio_url: '', order: 4 }
    ]
  });

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
      setLesson({
        id: lessonId,
        title: 'Hardware e Software',
        unit: {
          id: '1',
          title: 'Introdução à Tecnologia',
          course: {
            id: '1',
            title: 'Inglês para Tecnologia'
          }
        },
        order: 1
      });
      
      setChallenges([
        {
          id: '1',
          type: 'SELECT',
          question: 'What is the English word for "computador"?',
          order: 1,
          options: [
            { id: '1', text: 'Computer', is_correct: true, order: 1 },
            { id: '2', text: 'Calculator', is_correct: false, order: 2 },
            { id: '3', text: 'Machine', is_correct: false, order: 3 },
            { id: '4', text: 'Device', is_correct: false, order: 4 }
          ]
        },
        {
          id: '2',
          type: 'ASSIST',
          question: 'Select the correct translation',
          order: 2,
          options: [
            { id: '5', text: 'Software', is_correct: true, order: 1 },
            { id: '6', text: 'Hardware', is_correct: false, order: 2 },
            { id: '7', text: 'Firmware', is_correct: false, order: 3 }
          ]
        }
      ]);
    }, 1000);
  }, [lessonId]);

  const handleCreateChallenge = () => {
    const newChallenge = {
      id: Date.now().toString(),
      ...challengeFormData,
      options: challengeFormData.options.filter(opt => opt.text.trim() !== '')
    };
    
    setChallenges([...challenges, newChallenge]);
    resetChallengeForm();
    setShowChallengeModal(false);
  };

  const handleEditChallenge = (challenge: any) => {
    setEditingChallenge(challenge);
    setChallengeFormData({
      type: challenge.type,
      question: challenge.question,
      order: challenge.order,
      options: [
        ...challenge.options,
        // Adicionar opções vazias se necessário para sempre ter 4 opções no formulário
        ...Array(Math.max(0, 4 - challenge.options.length)).fill(null).map((_, index) => ({
          text: '',
          is_correct: false,
          image_url: '',
          audio_url: '',
          order: challenge.options.length + index + 1
        }))
      ]
    });
    setShowChallengeModal(true);
  };

  const handleUpdateChallenge = () => {
    const updatedChallenge = {
      ...editingChallenge,
      ...challengeFormData,
      options: challengeFormData.options.filter(opt => opt.text.trim() !== '')
    };
    
    setChallenges(challenges.map(c => c.id === editingChallenge.id ? updatedChallenge : c));
    resetChallengeForm();
    setEditingChallenge(null);
    setShowChallengeModal(false);
  };

  const handleDeleteChallenge = (challengeId: string) => {
    if (confirm('Tem certeza que deseja excluir este desafio?')) {
      setChallenges(challenges.filter(c => c.id !== challengeId));
    }
  };

  const resetChallengeForm = () => {
    setChallengeFormData({
      type: 'SELECT',
      question: '',
      order: challenges.length + 1,
      options: [
        { text: '', is_correct: false, image_url: '', audio_url: '', order: 1 },
        { text: '', is_correct: false, image_url: '', audio_url: '', order: 2 },
        { text: '', is_correct: false, image_url: '', audio_url: '', order: 3 },
        { text: '', is_correct: false, image_url: '', audio_url: '', order: 4 }
      ]
    });
  };

  const updateOption = (optionIndex: number, field: string, value: any) => {
    setChallengeFormData(prev => ({
      ...prev,
      options: prev.options.map((option, index) => 
        index === optionIndex ? { ...option, [field]: value } : option
      )
    }));
  };

  const setCorrectOption = (optionIndex: number) => {
    setChallengeFormData(prev => ({
      ...prev,
      options: prev.options.map((option, index) => ({
        ...option,
        is_correct: index === optionIndex
      }))
    }));
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="w-full h-full space-y-6">
      <CourseBanner 
        title={lesson?.title || 'Gestão de Lição'}
        subtitle={`${lesson?.unit?.course?.title} > ${lesson?.unit?.title}`}
        rightElement={
          <Button 
            variant="outline"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        }
      />

      {/* Lesson Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Lição</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Título da Lição</Label>
              <Input defaultValue={lesson?.title} />
            </div>
            <div>
              <Label>Ordem</Label>
              <Input type="number" defaultValue={lesson?.order} />
            </div>
          </div>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
        </CardContent>
      </Card>

      {/* Challenges */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Desafios da Lição ({challenges.length})</h3>
        <Button onClick={() => { resetChallengeForm(); setShowChallengeModal(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Desafio
        </Button>
      </div>

      <div className="space-y-4">
        {challenges.map((challenge, index) => (
          <Card key={challenge.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge>{challenge.order}º</Badge>
                  <CardTitle className="text-lg">{challenge.type === 'SELECT' ? 'Múltipla Escolha' : 'Assistência'}</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditChallenge(challenge)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteChallenge(challenge.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription className="text-base font-medium">
                {challenge.question}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h5 className="font-medium">Opções de Resposta:</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {challenge.options.map((option: any) => (
                    <div 
                      key={option.id} 
                      className={`p-3 border rounded-md flex items-center justify-between ${
                        option.is_correct ? 'border-green-500 bg-green-50' : 'border-gray-200'
                      }`}
                    >
                      <span>{option.text}</span>
                      {option.is_correct ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {challenges.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Nenhum desafio criado</h3>
          <p className="text-muted-foreground mb-4">
            Comece criando o primeiro desafio para esta lição
          </p>
          <Button onClick={() => setShowChallengeModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeiro Desafio
          </Button>
        </div>
      )}

      {/* Challenge Creation/Edit Modal */}
      <Dialog open={showChallengeModal} onOpenChange={setShowChallengeModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingChallenge ? 'Editar Desafio' : 'Criar Novo Desafio'}
            </DialogTitle>
            <DialogDescription>
              Configure a pergunta e as opções de resposta
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Desafio</Label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={challengeFormData.type}
                  onChange={(e) => setChallengeFormData(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="SELECT">Múltipla Escolha</option>
                  <option value="ASSIST">Assistência/Tradução</option>
                </select>
              </div>
              <div>
                <Label>Ordem</Label>
                <Input 
                  type="number"
                  value={challengeFormData.order}
                  onChange={(e) => setChallengeFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            
            <div>
              <Label>Pergunta</Label>
              <Textarea 
                value={challengeFormData.question}
                onChange={(e) => setChallengeFormData(prev => ({ ...prev, question: e.target.value }))}
                placeholder="Digite a pergunta do desafio"
                rows={3}
              />
            </div>

            <div>
              <Label className="text-lg">Opções de Resposta</Label>
              <div className="space-y-4 mt-2">
                {challengeFormData.options.map((option, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Opção {index + 1}</Label>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Resposta Correta</Label>
                        <input 
                          type="radio" 
                          name="correct_option"
                          checked={option.is_correct}
                          onChange={() => setCorrectOption(index)}
                        />
                      </div>
                    </div>
                    
                    <Input 
                      value={option.text}
                      onChange={(e) => updateOption(index, 'text', e.target.value)}
                      placeholder="Texto da opção"
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm flex items-center gap-2">
                          <ImageIcon className="h-4 w-4" />
                          URL da Imagem (opcional)
                        </Label>
                        <Input 
                          value={option.image_url || ''}
                          onChange={(e) => updateOption(index, 'image_url', e.target.value)}
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <Label className="text-sm flex items-center gap-2">
                          <Volume2 className="h-4 w-4" />
                          URL do Áudio (opcional)
                        </Label>
                        <Input 
                          value={option.audio_url || ''}
                          onChange={(e) => updateOption(index, 'audio_url', e.target.value)}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowChallengeModal(false);
              setEditingChallenge(null);
              resetChallengeForm();
            }}>
              Cancelar
            </Button>
            <Button onClick={editingChallenge ? handleUpdateChallenge : handleCreateChallenge}>
              {editingChallenge ? 'Atualizar' : 'Criar'} Desafio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LessonManagement;
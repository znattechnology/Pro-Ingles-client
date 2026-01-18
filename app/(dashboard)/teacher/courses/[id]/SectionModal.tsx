import { CustomFormField } from "@/components/course/CustomFormField";
import CustomModal from "@/components/course/CustomModal";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { SectionFormData, sectionSchema } from "@/lib/schemas";
import { addSection, closeSectionModal, editSection } from "@/state";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, BookOpen, Plus, Edit, Save } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

const SectionModal = () => {
  const dispatch = useAppDispatch();
  const { isSectionModalOpen, selectedSectionIndex, sections } = useAppSelector(
    (state) => state.global.courseEditor
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const section =
    selectedSectionIndex !== null ? sections[selectedSectionIndex] : null;

  const methods = useForm<SectionFormData>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  useEffect(() => {
    if (section) {
      methods.reset({
        title: section.sectionTitle,
        description: section.sectionDescription,
      });
    } else {
      methods.reset({
        title: "",
        description: "",
      });
    }
  }, [section, methods]);

  const onClose = () => {
    dispatch(closeSectionModal());
  };

  const onSubmit = async (data: SectionFormData) => {
    setIsSubmitting(true);
    
    try {
      const newSection: Section = {
        sectionId: section?.sectionId || uuidv4(),
        sectionTitle: data.title,
        sectionDescription: data.description,
        chapters: section?.chapters || [],
      };

      if (selectedSectionIndex === null) {
        dispatch(addSection(newSection));
        toast.success('Secção criada com sucesso! Não esqueça de guardar o curso.');
      } else {
        dispatch(
          editSection({
            index: selectedSectionIndex,
            section: newSection,
          })
        );
        toast.success('Secção atualizada com sucesso! Não esqueça de guardar o curso.');
      }

      // Small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      onClose();
    } catch (error) {
      console.error('Error saving section:', error);
      toast.error('Erro ao salvar secção. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomModal isOpen={isSectionModalOpen} onClose={onClose}>
      <div className="relative bg-customgreys-secondarybg border-customgreys-darkerGrey rounded-lg overflow-hidden max-w-2xl mx-auto">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5" />
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <div className="h-full w-full bg-[linear-gradient(rgba(139,92,246,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>
        
        {/* Modern Header */}
        <div className="relative bg-customgreys-primarybg/40 backdrop-blur-sm border-b border-violet-900/30 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                {selectedSectionIndex === null ? (
                  <Plus className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                ) : (
                  <Edit className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                  {selectedSectionIndex === null ? '🎆 Criar Nova Secção' : '✏️ Editar Secção'}
                </h2>
                <p className="text-white/70 text-sm lg:text-base font-medium">Configure os detalhes da secção</p>
              </div>
            </div>
            
            <button 
              onClick={onClose} 
              disabled={isSubmitting}
              className="group w-10 h-10 bg-white/10 hover:bg-red-500/20 border border-white/20 hover:border-red-400/50 rounded-lg flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5 text-white/70 group-hover:text-red-400 transition-colors duration-300" />
            </button>
          </div>
        </div>

        {/* Modern Form Content */}
        <div className="p-4 lg:p-6 bg-customgreys-primarybg/40 backdrop-blur-sm">
          <Form {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {/* Form Header */}
              <div className="flex items-center gap-3 p-3 lg:p-4 bg-customgreys-darkGrey/50 border border-violet-900/30 rounded-lg">
                <BookOpen className="w-5 h-5 lg:w-6 lg:h-6 text-blue-400" />
                <span className="text-lg lg:text-xl font-semibold text-white">📝 Informações da Secção</span>
              </div>
              
              {/* Form Fields */}
              <div className="space-y-5">
                <div className="space-y-3">
                  <label className="text-white text-base lg:text-lg font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 lg:w-3 lg:h-3 bg-blue-400 rounded-full"></span>
                    Título da secção
                  </label>
                  <CustomFormField
                    name="title"
                    label=""
                    placeholder="Ex: 🚀 Introdução ao React"
                    className="bg-customgreys-darkGrey/50 border-violet-900/30 text-white placeholder:text-gray-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200 rounded-md px-4 lg:px-6 py-3 lg:py-4 text-base lg:text-lg"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-white text-base lg:text-lg font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 lg:w-3 lg:h-3 bg-purple-400 rounded-full"></span>
                    Descrição da secção
                  </label>
                  <CustomFormField
                    name="description"
                    label=""
                    type="rich-text"
                    placeholder="Descreva o que os alunos vão aprender nesta secção..."
                    className="bg-customgreys-darkGrey/50 border-violet-900/30 text-white placeholder:text-gray-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200 rounded-md px-4 lg:px-6 py-3 lg:py-4 text-base lg:text-lg min-h-[100px] lg:min-h-[120px] resize-none"
                  />
                </div>
              </div>

              {/* Modern Action Buttons */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-5 border-t border-violet-900/30 gap-4">
                <div className="px-3 py-2 bg-customgreys-darkGrey/50 border border-violet-900/30 rounded-lg">
                  <p className="text-white/60 text-xs lg:text-sm font-medium">
                    {selectedSectionIndex === null ? '🎆 Nova secção no curso' : '✏️ Alterando secção'}
                  </p>
                </div>
                
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <Button 
                    type="button" 
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="w-12 h-12 bg-customgreys-darkGrey/50 hover:bg-customgreys-darkGrey border border-violet-900/30 hover:border-violet-500 text-gray-300 hover:text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    title="Cancelar"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                  
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-12 h-12 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    title={selectedSectionIndex === null ? 'Criar Secção' : 'Atualizar Secção'}
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : selectedSectionIndex === null ? (
                      <Plus className="w-5 h-5" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </CustomModal>
  );
};

export default SectionModal;

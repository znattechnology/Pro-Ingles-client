"use client";

import { CustomFormField } from "@/components/course/CustomFormField";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { courseSchema } from "@/lib/schemas";
import {
  uploadCourseImage,
} from "@/lib/utils";
import {
  useGetCourseDetailsQuery,
  useUpdateCourseMutation,
  useGetVideoUploadUrlMutation,
  useGetResourceUploadUrlMutation,
} from "@modules/learning/video-courses";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { 
  setSections, 
  removeSectionFromEditor, 
  removeChapterFromSection,
  updateChapterInSection,
  setCreatingSectionLoading,
  setCreatingChapterLoading,
  setSavingCourseLoading,
  setCreatingSectionUI,
  setCreatingChapterUI
} from "@/redux/features/courseEditor/courseEditorSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Plus, Check, BookOpen, Image, Layers, Play, Eye, Sparkles, ChevronRight, Settings, Upload, X, Video } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { notifications } from "@/lib/toast";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import ChapterModal from "./ChapterModal";
import SectionModal from "./SectionModal";

// UUID generation function
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

interface CourseFormData {
  courseTitle: string;
  courseDescription: string;
  courseCategory: string;
  coursePrice?: number;
  courseStatus: boolean;
  courseImage?: string;
}

const CourseEditor = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: courseResponse, refetch } = useGetCourseDetailsQuery(id);
  const course = courseResponse?.data;
  const [getVideoUploadUrl] = useGetVideoUploadUrlMutation();
  const [getResourceUploadUrl] = useGetResourceUploadUrlMutation();
  const [updateCourse] = useUpdateCourseMutation();

  const dispatch = useAppDispatch();
  const { sections, loading, ui } = useAppSelector((state) => state.courseEditor);
  
  // State for image preview
  const [currentImage, setCurrentImage] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [imageReady, setImageReady] = useState<boolean>(false);
  
  // State for steps navigation
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  // State for inline section creation
  // Note: isCreatingSection now comes from Redux ui.isCreatingSection
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionDescription, setNewSectionDescription] = useState("");
  
  // Cache for recently uploaded video URLs (to handle timing issues with API)
  const [recentVideoUploads, setRecentVideoUploads] = useState<Record<string, {url: string, timestamp: number}>>({});

  // State for inline chapter creation
  // Note: isCreatingChapter now comes from Redux ui.isCreatingChapter
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newChapterDescription, setNewChapterDescription] = useState("");
  const [newChapterType, setNewChapterType] = useState<"Text" | "Video" | "Quiz" | "Exercise">("Text");
  
  // State to store uploaded video URL for new chapter creation
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string>("");
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [pendingVideoUploads, setPendingVideoUploads] = useState<{[chapterId: string]: File}>({});
  
  // Resource states
  const [selectedResourceFiles, setSelectedResourceFiles] = useState<File[]>([]);
  const [pendingResourceUploads, setPendingResourceUploads] = useState<{[resourceId: string]: {file: File, type: string}}>({});
  
  // Chapter editing states
  const [editingChapter, setEditingChapter] = useState<{sectionId: string, chapterId: string} | null>(null);
  const [editChapterTitle, setEditChapterTitle] = useState("");
  const [editChapterDescription, setEditChapterDescription] = useState("");
  const [editChapterType, setEditChapterType] = useState<"Text" | "Video" | "Quiz" | "Exercise">("Text");
  
  // Note: Loading states now come from Redux store

  const steps = [
    { 
      id: 1, 
      title: "Informações Básicas", 
      icon: BookOpen, 
      description: "Título, descrição e categoria" 
    },
    { 
      id: 2, 
      title: "Imagem do Curso", 
      icon: Image, 
      description: "Upload da imagem principal" 
    },
    { 
      id: 3, 
      title: "Estrutura do Curso", 
      icon: Layers, 
      description: "Seções e organização" 
    },
    { 
      id: 4, 
      title: "Capítulos e Vídeos", 
      icon: Play, 
      description: "Conteúdo dos capítulos" 
    },
    { 
      id: 5, 
      title: "Preview e Publicação", 
      icon: Eye, 
      description: "Revisar e publicar" 
    }
  ];

  const methods = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      courseTitle: "",
      courseDescription: "",
      courseCategory: "",
      courseStatus: false,
      courseImage: "",
    },
  });

  useEffect(() => {
    if (course) {
      console.log('Course loaded:', course);
      console.log('Course image:', course.image);
      console.log('Course ID:', course.id);
      console.log('Course courseId:', course.courseId);
      
      methods.reset({
        courseTitle: course.title,
        courseDescription: course.description,
        courseCategory: course.category,
        courseStatus: course.status === "Published",
        courseImage: course.image || "",
      });
      console.log('Raw course.sections:', course.sections);
      
      // Debug: log chapter video information
      if (course.sections) {
        course.sections.forEach((section: any, sectionIndex: number) => {
          console.log(`Section ${sectionIndex}:`, section.sectionTitle);
          if (section.chapters) {
            section.chapters.forEach((chapter: any, chapterIndex: number) => {
              console.log(`  Chapter ${chapterIndex}:`, {
                title: chapter.title,
                video: chapter.video,
                videoUrl: chapter.videoUrl,
                hasVideo: chapter.hasVideo,
                type: chapter.type
              });
            });
          }
        });
      }
      
      // Use API data directly since auto-save ensures it's up-to-date
      // Auto-save happens immediately after video upload, so API data is the source of truth
      const apiSections = course.sections || [];
      
      console.log('✅ Using API sections as source of truth (auto-save ensures accuracy):', apiSections);
      dispatch(setSections(apiSections));
      
      // Set current image from course data
      const courseImage = course.image || "";
      console.log('Setting currentImage to:', courseImage);
      setCurrentImage(courseImage);
      setImageReady(!!courseImage);
      console.log('Setting imageReady to:', !!courseImage);
      
      // Auto-complete steps based on existing data
      const completed = [];
      if (course.title && course.description && course.category) completed.push(1);
      if (courseImage) completed.push(2); // Use courseImage variable
      if (course.sections && course.sections.length > 0) completed.push(3);
      // Check if any section has chapters
      if (course.sections?.some((section: any) => section.chapters?.length > 0)) completed.push(4);
      if (course.status === "Published") completed.push(5);
      
      console.log('Completed steps:', completed);
      setCompletedSteps(completed);
    }
  }, [course, methods, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
  };

  const markStepComplete = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  // Function to handle immediate video upload when user selects file
  const handleVideoSelection = async (file: File) => {
    console.log('📹 Video selected, starting immediate upload...');
    
    try {
      // Generate temporary valid UUIDs for upload (Django requires valid UUIDs)
      const tempCourseId = id;
      const tempSectionId = generateUUID(); // Generate valid UUID
      const tempChapterId = generateUUID(); // Generate valid UUID
      
      console.log('🔧 Using temp IDs:', { tempCourseId, tempSectionId, tempChapterId });
      
      // Get upload URL from Django
      const response = await getVideoUploadUrl({
        courseId: tempCourseId,
        sectionId: tempSectionId, 
        chapterId: tempChapterId,
        fileName: file.name,
        fileType: file.type,
      }).unwrap();
      
      console.log('📹 Upload URL obtained:', response);
      
      // Upload file to S3
      const uploadResponse = await fetch(response.data.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });
      
      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }
      
      // Extract clean URL (remove query params)
      const videoUrl = response.data.uploadUrl.split('?')[0];
      
      console.log('✅ Video uploaded successfully! URL:', videoUrl);
      
      // Store URL in state for chapter creation
      setUploadedVideoUrl(videoUrl);
      
      // Show success message
      notifications.success(`✅ Vídeo enviado com sucesso! Agora você pode criar o capítulo.`);
      
    } catch (error) {
      console.error('❌ Error uploading video:', error);
      notifications.error(`Erro ao enviar vídeo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleCreateSection = async () => {
    if (newSectionTitle.trim()) {
      dispatch(setCreatingSectionLoading(true));
      
      try {
        const newSection = {
          sectionId: generateUUID(), // Generate valid UUID
          sectionTitle: newSectionTitle.trim(),
          sectionDescription: newSectionDescription.trim(),
          chapters: [] as any[] // Explicitly type as any[] for compatibility
        };
        
        dispatch(setSections([...sections, newSection] as any));
        
        // Show success toast
        notifications.success(`Seção "${newSectionTitle}" criada com sucesso! 📚`);
        
        // Reset form
        setNewSectionTitle("");
        setNewSectionDescription("");
        dispatch(setCreatingSectionUI(false));
        
        // Mark step as complete if this is the first section
        if (sections.length === 0) {
          markStepComplete(3);
        }
      } catch (error) {
        console.error("Error creating section:", error);
        notifications.error("Erro ao criar seção. Tente novamente.");
      } finally {
        dispatch(setCreatingSectionLoading(false));
      }
    }
  };

  const cancelSectionCreation = () => {
    setNewSectionTitle("");
    setNewSectionDescription("");
    dispatch(setCreatingSectionUI(false));
  };

  const handleCreateChapter = async (sectionId: string) => {
    if (newChapterTitle.trim()) {
      dispatch(setCreatingChapterLoading(sectionId));
      
      try {
      const chapterId = generateUUID(); // Generate valid UUID
      const newChapter = {
        chapterId,
        title: newChapterTitle.trim(),
        description: newChapterDescription.trim(),
        content: newChapterDescription.trim(),
        videoUrl: uploadedVideoUrl || null, // Use uploaded video URL
        video: uploadedVideoUrl || "", // Django field - use uploaded video URL
        type: newChapterType,
        hasVideo: !!uploadedVideoUrl, // Track if there's a video URL
        // Additional fields for different types
        transcript: "",
        quiz_enabled: newChapterType === "Quiz",
        resources_data: [],
        practice_lesson: newChapterType === "Exercise" ? "" : undefined,
      };
      
      console.log('📹 Creating chapter with video URL:', uploadedVideoUrl);
      
      // Video upload is already done when user selected the file
      // uploadedVideoUrl contains the S3 URL ready to be used
      
      // Store resource files for upload later
      if (selectedResourceFiles.length > 0) {
        selectedResourceFiles.forEach((file, index) => {
          const resourceId = `${chapterId}_resource_${index}`;
          const resourceType = file.type.includes('pdf') ? 'PDF' :
                             file.type.includes('audio') ? 'AUDIO' :
                             file.type.includes('image') ? 'IMAGE' :
                             file.type.includes('document') || file.type.includes('word') ? 'CODE' :
                             file.type.includes('sheet') || file.type.includes('excel') ? 'WORKSHEET' :
                             'PDF';
          
          setPendingResourceUploads(prev => ({
            ...prev,
            [resourceId]: { file, type: resourceType }
          }));
        });
      }
      
      const updatedSections = sections.map((section: any) => {
        if (section.sectionId === sectionId) {
          return {
            ...section,
            chapters: [...(section.chapters || []), newChapter]
          };
        }
        return section;
      });
      
      dispatch(setSections(updatedSections));
      
      // Show success toast
      const chapterTypeLabel = newChapterType === "Text" ? "Texto" :
                              newChapterType === "Video" ? "Vídeo" :
                              newChapterType === "Quiz" ? "Quiz" : "Exercício";
      notifications.success(`Capítulo "${newChapterTitle}" (${chapterTypeLabel}) criado com sucesso! 📖`);
      
      // Reset form
      setNewChapterTitle("");
      setNewChapterDescription("");
      setNewChapterType("Text");
      setSelectedVideoFile(null);
      setSelectedResourceFiles([]);
      setUploadedVideoUrl(""); // Clear uploaded video URL
      dispatch(setCreatingChapterUI(null));
      
      // Mark step as complete if this is the first chapter across all sections
      const totalChapters = updatedSections.reduce((total: number, section: any) => 
        total + (section.chapters?.length || 0), 0
      );
      if (totalChapters === 1) {
        markStepComplete(4);
      }
      
      } catch (error) {
        console.error("Error creating chapter:", error);
        notifications.error("Erro ao criar capítulo. Tente novamente.");
      } finally {
        dispatch(setCreatingChapterLoading(null));
      }
    }
  };

  const cancelChapterCreation = () => {
    setNewChapterTitle("");
    setNewChapterDescription("");
    setNewChapterType("Text");
    setSelectedVideoFile(null);
    setSelectedResourceFiles([]);
    dispatch(setCreatingChapterUI(null));
  };

  const isStepCompleted = (stepId: number) => completedSteps.includes(stepId);

  const canProceedToStep = (stepId: number) => {
    if (stepId === 1) return true;
    
    // Check specific requirements for each step
    switch (stepId) {
      case 2:
        // Can go to step 2 if step 1 is complete (basic info filled)
        const values = methods.getValues();
        return values.courseTitle && values.courseDescription && values.courseCategory;
      case 3:
        // Can go to step 3 if step 2 is complete (image uploaded)
        return isStepCompleted(2) || currentImage || course?.image;
      case 4:
        // Can go to step 4 if step 3 is complete (sections created)
        return isStepCompleted(3) || sections.length > 0;
      case 5:
        // Can go to step 5 if step 4 is complete (chapters created)
        return isStepCompleted(4) || sections.some((section: any) => section.chapters?.length > 0);
      default:
        return isStepCompleted(stepId - 1);
    }
  };

  // Function to upload pending videos
  const uploadPendingVideos = async () => {
    const failedUploads: string[] = [];
    
    for (const [chapterId, videoFile] of Object.entries(pendingVideoUploads)) {
      try {
        // Find the section and chapter
        let targetSection = null;
        let targetChapter = null;
        
        for (const section of sections) {
          const chapter = section.chapters?.find((ch: any) => ch.chapterId === chapterId);
          if (chapter) {
            targetSection = section;
            targetChapter = chapter;
            break;
          }
        }
        
        if (targetSection && targetChapter) {
          // Get upload URL from Django
          const response = await getVideoUploadUrl({
            courseId: id,
            sectionId: targetSection.sectionId,
            chapterId: chapterId,
            fileName: videoFile.name,
            fileType: videoFile.type,
          }).unwrap();
          
          // Upload to S3
          const uploadResponse = await fetch(response.data.uploadUrl, {
            method: "PUT",
            headers: {
              "Content-Type": videoFile.type,
            },
            body: videoFile,
          });
          
          if (!uploadResponse.ok) {
            throw new Error(`Upload failed with status ${uploadResponse.status}`);
          }
          
          console.log(`Video uploaded successfully for chapter ${chapterId}`);
          
          // Update chapter with video URL in Redux state
          const videoUrl = response.data.uploadUrl.split('?')[0]; // Remove query params to get clean S3 URL
          dispatch(updateChapterInSection({
            sectionId: targetSection.sectionId,
            chapterId: chapterId,
            data: { 
              videoUrl: videoUrl, // Keep for frontend display compatibility
              video: videoUrl,    // Django backend expects 'video' field
              hasVideo: true 
            }
          }));
          
          // Cache the video URL for this chapter to handle timing issues
          setRecentVideoUploads(prev => ({
            ...prev,
            [chapterId]: {
              url: videoUrl,
              timestamp: Date.now()
            }
          }));

          // Immediately save the video URL to Django backend to prevent data loss on refresh
          try {
            console.log(`💾 Auto-saving video URL for chapter ${chapterId} to prevent data loss on page refresh`);
            
            // Use the current sections state and ensure the video URL is correctly mapped
            const sectionsForAutoSave = sections.map((section: any) => ({
              ...section,
              chapters: section.chapters?.map((chapter: any) => {
                if (chapter.chapterId === chapterId) {
                  // This is the chapter we just updated - ensure it has the video URL
                  console.log(`📹 Setting video URL for chapter ${chapterId}:`, videoUrl);
                  return {
                    ...chapter,
                    video: videoUrl, // Django expects 'video' field
                    videoUrl: videoUrl, // Keep both for compatibility
                    hasVideo: true
                  };
                }
                // For other chapters, ensure their video URLs are preserved
                return {
                  ...chapter,
                  video: chapter.videoUrl || chapter.video || "",
                  videoUrl: chapter.videoUrl || chapter.video || ""
                };
              }) || []
            }));
            
            const autoSaveData = {
              title: course?.title || "Curso em Edição",
              description: course?.description || "",
              category: course?.category || "Inglês Geral",
              status: course?.status || "Draft",
              course_type: "video",
              sections: sectionsForAutoSave
            };

            console.log(`📹 Auto-save data for chapter ${chapterId}:`, JSON.stringify(sectionsForAutoSave.find((s: any) => s.chapters?.some((c: any) => c.chapterId === chapterId))?.chapters?.find((c: any) => c.chapterId === chapterId), null, 2));

            await updateCourse({
              courseId: id,
              courseData: autoSaveData,
            }).unwrap();
            
            console.log(`✅ Video URL auto-saved successfully for chapter ${chapterId}`);
          } catch (autoSaveError) {
            console.error(`⚠️ Failed to auto-save video URL for chapter ${chapterId}:`, autoSaveError);
            // Don't show error toast for auto-save failures, just log it
          }
          
          // Show success toast for video upload
          notifications.success(`Vídeo enviado com sucesso para o capítulo "${targetChapter.title}"! 🎥`);
        } else {
          throw new Error("Capítulo não encontrado");
        }
      } catch (error) {
        console.error(`Error uploading video for chapter ${chapterId}:`, error);
        const chapterName = sections.find(s => s.chapters?.find(c => c.chapterId === chapterId))?.chapters?.find(c => c.chapterId === chapterId)?.title || "Capítulo";
        failedUploads.push(chapterName);
        notifications.error(`Erro ao enviar vídeo para "${chapterName}". ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }
    
    // Show summary if there were failures
    if (failedUploads.length > 0 && Object.keys(pendingVideoUploads).length > failedUploads.length) {
      notifications.warning(`${Object.keys(pendingVideoUploads).length - failedUploads.length} vídeos enviados com sucesso, ${failedUploads.length} falharam.`);
    }
    
    // Upload resources if any
    try {
      const resourceEntries = Object.entries(pendingResourceUploads);
      for (const [resourceId, resourceData] of resourceEntries) {
        const { file, type } = resourceData;
        
        // Extract chapterId from resourceId (format: chapterId_resourceIndex)
        const resourceChapterId = resourceId.split('_')[0];
        
        // Find the section and chapter for this resource
        let resourceTargetSection = null;
        let resourceTargetChapter = null;
        
        for (const section of sections) {
          const chapter = section.chapters?.find((ch: any) => ch.chapterId === resourceChapterId);
          if (chapter) {
            resourceTargetSection = section;
            resourceTargetChapter = chapter;
            break;
          }
        }
        
        if (resourceTargetSection && resourceTargetChapter) {
          // Get upload URL from Django
          const response = await getResourceUploadUrl({
            courseId: id,
            sectionId: resourceTargetSection.sectionId,
            chapterId: resourceChapterId,
            fileName: file.name,
            fileType: file.type,
            resourceType: type,
          }).unwrap();
          
          // Upload to S3
          await fetch(response.data.uploadUrl, {
            method: "PUT",
            headers: {
              "Content-Type": file.type,
            },
            body: file,
          });
          
          console.log(`Resource uploaded successfully for chapter ${resourceChapterId}: ${file.name}`);
          
          // Show success toast for resource upload
          const resourceTypeLabel = type === 'PDF' ? 'PDF' :
                                   type === 'AUDIO' ? 'Áudio' :
                                   type === 'IMAGE' ? 'Imagem' :
                                   type === 'CODE' ? 'Documento' :
                                   type === 'WORKSHEET' ? 'Planilha' : 'Recurso';
          notifications.success(`${resourceTypeLabel} "${file.name}" enviado com sucesso! 📎`);
          
          // Remove from pending uploads
          setPendingResourceUploads(prev => {
            const updated = { ...prev };
            delete updated[resourceId];
            return updated;
          });
        }
      }
    } catch (error) {
      console.error("Error uploading resources:", error);
      notifications.error("Erro ao enviar recursos. Verifique sua conexão e tente novamente.");
    }
    
    // Clear pending uploads after all processing
    setPendingVideoUploads({});
  };

  // Function to delete section
  const handleDeleteSection = (sectionId: string) => {
    // Find section name for toast
    const section = sections.find(s => s.sectionId === sectionId);
    const sectionName = section?.sectionTitle || "Seção";
    
    dispatch(removeSectionFromEditor(sectionId));
    notifications.success(`Seção "${sectionName}" removida com sucesso! 🗑️`);
  };

  // Function to delete chapter  
  const handleDeleteChapter = (sectionId: string, chapterId: string) => {
    // Find chapter name for toast
    const section = sections.find(s => s.sectionId === sectionId);
    const chapter = section?.chapters?.find(c => c.chapterId === chapterId);
    const chapterName = chapter?.title || "Capítulo";
    
    dispatch(removeChapterFromSection({ sectionId, chapterId }));
    
    // Also remove pending video upload if exists
    setPendingVideoUploads(prev => {
      const updated = { ...prev };
      delete updated[chapterId];
      return updated;
    });
    
    // Remove pending resource uploads for this chapter
    setPendingResourceUploads(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(resourceId => {
        if (resourceId.startsWith(chapterId)) {
          delete updated[resourceId];
        }
      });
      return updated;
    });
    
    notifications.success(`Capítulo "${chapterName}" removido com sucesso! 🗑️`);
  };

  // Function to start editing a chapter
  const handleEditChapter = (sectionId: string, chapterId: string) => {
    // Find the chapter to edit
    const section = sections.find(s => s.sectionId === sectionId);
    const chapter = section?.chapters?.find(c => c.chapterId === chapterId);
    
    if (chapter) {
      setEditingChapter({ sectionId, chapterId });
      setEditChapterTitle(chapter.title);
      setEditChapterDescription(chapter.description || "");
      setEditChapterType(chapter.type);
    }
  };

  // Function to save chapter edits
  const handleSaveChapterEdit = () => {
    if (editingChapter) {
      dispatch(updateChapterInSection({
        sectionId: editingChapter.sectionId,
        chapterId: editingChapter.chapterId,
        data: {
          title: editChapterTitle,
          description: editChapterDescription,
          type: editChapterType,
        }
      }));
      
      // Show success toast
      notifications.success(`Capítulo "${editChapterTitle}" atualizado com sucesso! ✏️`);
      
      // Reset editing state
      setEditingChapter(null);
      setEditChapterTitle("");
      setEditChapterDescription("");
      setEditChapterType("Text");
    }
  };

  // Function to cancel chapter edit
  const handleCancelChapterEdit = () => {
    setEditingChapter(null);
    setEditChapterTitle("");
    setEditChapterDescription("");
    setEditChapterType("Text");
  };

  const onSubmit = async (data: CourseFormData) => {
    console.log('💾 Saving course - onSubmit called');
    
    try {
      dispatch(setSavingCourseLoading(true));
      
      // First upload any pending videos
      await uploadPendingVideos();
      
      // Use sections directly from Redux state (which comes from API after auto-save)
      const sectionsWithVideoUrls = sections.map(section => ({
        ...section,
        chapters: section.chapters?.map(chapter => {
          // Ensure video field is string not null for Django
          const videoUrl = chapter.video || chapter.videoUrl || "";
          
          console.log(`📹 Chapter ${chapter.chapterId} final data:`, {
            video: chapter.video,
            videoUrl: chapter.videoUrl,
            finalVideoUrl: videoUrl,
            hasVideo: chapter.hasVideo
          });

          return {
            ...chapter,
            video: videoUrl, // Django expects 'video' field - ensure string not null
            videoUrl: videoUrl, // Keep both for compatibility
          };
        }) || []
      }));

      const courseData = {
        title: data.courseTitle,
        description: data.courseDescription,
        category: data.courseCategory,
        status: data.courseStatus ? "Published" as const : "Draft" as const,
        course_type: "video", // Important: specify course type
        sections: sectionsWithVideoUrls
      };
      
      console.log('Sending courseData to Django:', JSON.stringify(courseData, null, 2));

      await updateCourse({
        courseId: id,
        courseData: courseData,
      }).unwrap();

      // Show success toast
      notifications.success(`Curso "${data.courseTitle}" atualizado com sucesso! ✅`);

      refetch();
    } catch (error) {
      console.error("Failed to update course:", error);
      
      // Show error toast
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      notifications.error(`Erro ao atualizar o curso. ${errorMessage}. Tente novamente.`);
    } finally {
      dispatch(setSavingCourseLoading(false));
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-3">
              <label className="text-white text-base font-semibold flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                Título do curso
              </label>
              <CustomFormField
                name="courseTitle"
                label=""
                type="text"
                placeholder="Ex: Curso Completo de JavaScript Moderno"
                className="bg-customgreys-darkGrey/50 border-violet-900/30 text-white placeholder:text-gray-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200 rounded-md"
                initialValue={course?.title}
              />
            </div>

            <div className="space-y-3">
              <label className="text-white text-base font-semibold flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                Descrição do curso
              </label>
              <CustomFormField
                name="courseDescription"
                label=""
                type="textarea"
                placeholder="Descreva o que os alunos vão aprender neste curso incrível..."
                className="bg-customgreys-darkGrey/50 border-violet-900/30 text-white placeholder:text-gray-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200 rounded-md min-h-[120px] resize-none"
                initialValue={course?.description}
              />
            </div>

            <div className="space-y-3">
              <label className="text-white text-base font-semibold flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                Categoria do curso
              </label>
              <CustomFormField
                name="courseCategory"
                label=""
                type="select"
                className="bg-customgreys-darkGrey/50 border-violet-900/30 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200 rounded-md"
                placeholder="🎯 Selecione a categoria"
                options={[
                  { value: "petroleo-gas", label: "🛢️ Inglês para Petróleo & Gás" },
                  { value: "bancario", label: "🏦 Inglês Bancário" },
                  { value: "ti-telecomunicacoes", label: "💻 Inglês para TI & Telecomunicações" },
                  { value: "executivo", label: "👔 Inglês Executivo" },
                  { value: "ai-personal-tutor", label: "🤖 Inglês com IA Personal Tutor" },
                ]}
                initialValue={course?.category}
              />
            </div>

            <div className="flex justify-end pt-6">
              <Button
                type="button"
                onClick={() => {
                  const values = methods.getValues();
                  console.log('Step 1 values:', values);
                  if (values.courseTitle && values.courseDescription && values.courseCategory) {
                    markStepComplete(1);
                    setCurrentStep(2);
                  } else {
                    alert('Por favor, preencha todos os campos obrigatórios: título, descrição e categoria');
                  }
                }}
                disabled={!methods.watch('courseTitle') || !methods.watch('courseDescription') || !methods.watch('courseCategory')}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo: Upload de Imagem
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <label className="text-white text-base font-semibold flex items-center gap-2">
                <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                Imagem do curso
              </label>
              
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    console.log('File selected:', file?.name);
                    console.log('URL param id:', id);
                    console.log('Course object:', course);
                    console.log('Course ID from object:', course?.courseId);
                    console.log('Course id from object:', course?.id);
                    
                    if (!file) {
                      alert('Por favor, selecione um arquivo de imagem');
                      return;
                    }

                    // Use the URL parameter id directly since course data might not be loaded yet
                    const courseIdentifier = course?.courseId || course?.id || id;
                    
                    if (!courseIdentifier) {
                      alert('Erro: ID do curso não encontrado');
                      return;
                    }
                    
                    setUploadingImage(true);
                    try {
                      console.log('Using course identifier:', courseIdentifier);
                      
                      const imageUrl = await uploadCourseImage(courseIdentifier, file);
                      console.log('Image uploaded successfully:', imageUrl);
                      
                      // Update local states immediately
                      setCurrentImage(imageUrl);
                      setImageReady(true);
                      markStepComplete(2);
                      
                      // Update the form data as well
                      methods.setValue('courseImage', imageUrl);
                      
                      // Refresh course data from API
                      await refetch();
                      
                      console.log('Upload completed, states updated');
                    } catch (error) {
                      console.error("Upload failed:", error);
                      alert('Erro no upload: ' + (error as any).message);
                    } finally {
                      setUploadingImage(false);
                    }
                  }}
                  className="block w-full text-sm text-gray-300
                    file:mr-4 file:py-3 file:px-6
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-violet-600 file:text-white hover:file:bg-violet-700
                    file:cursor-pointer cursor-pointer file:transition-all file:duration-200
                    border border-violet-900/30 rounded-md bg-customgreys-darkGrey/50
                    hover:border-violet-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200"
                />
                
                {uploadingImage && (
                  <div className="mt-4 p-4 bg-violet-900/20 border border-violet-600/30 rounded-lg">
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-6 h-6 border-3 border-violet-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-violet-300 font-semibold">✨ Fazendo upload da imagem...</span>
                    </div>
                    <div className="mt-3 w-full bg-violet-900/30 rounded-full h-2">
                      <div className="bg-violet-400 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
                    </div>
                  </div>
                )}

                {currentImage && !uploadingImage && (
                  <div className="mt-4 p-4 bg-customgreys-darkGrey/50 border border-violet-900/30 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <img
                        src={currentImage}
                        alt="Course preview"
                        className="w-20 h-20 object-cover rounded-lg border-2 border-violet-400/50 shadow-lg"
                      />
                      <div className="flex-1">
                        <p className="text-white font-semibold mb-1">🖼️ Imagem do curso</p>
                        <p className="text-gray-400 text-sm">Imagem carregada com sucesso!</p>
                      </div>
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                )}
                
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <Button
                type="button"
                onClick={() => setCurrentStep(1)}
                variant="outline"
                className="px-6 py-3 border-violet-500/30 text-violet-300 hover:bg-violet-800/20"
              >
                Voltar
              </Button>
              <Button
                type="button"
                onClick={() => {
                  console.log('Button clicked - proceeding to step 3');
                  markStepComplete(2);
                  setCurrentStep(3);
                }}
                disabled={uploadingImage || (!imageReady && !currentImage && !course?.image)}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingImage ? 'Fazendo upload...' : 'Próximo: Estrutura do Curso'}
                {!uploadingImage && <ChevronRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">Estrutura do Curso</h3>
                <p className="text-white/60">Organize o conteúdo em seções para uma melhor experiência de aprendizado</p>
              </div>

              {/* Sections List */}
              {sections.length > 0 && (
                <div className="space-y-4">
                  {sections.map((section: any, index: number) => (
                    <motion.div
                      key={section.sectionId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-customgreys-darkGrey/50 border border-violet-500/20 rounded-xl p-6 hover:border-violet-400/40 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <h4 className="text-lg font-semibold text-white">{section.sectionTitle}</h4>
                          </div>
                          {section.sectionDescription && (
                            <p className="text-gray-400 text-sm ml-11">{section.sectionDescription}</p>
                          )}
                          <div className="flex items-center gap-4 mt-3 ml-11">
                            <div className="flex items-center gap-1 text-xs text-violet-400">
                              <Play className="w-3 h-3" />
                              <span>{section.chapters?.length || 0} capítulos</span>
                            </div>
                            <div className="w-1 h-1 bg-violet-400/50 rounded-full"></div>
                            <span className="text-xs text-emerald-400">✨ Pronta</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="border-violet-400/30 text-violet-400 bg-violet-500/10">
                          Seção {index + 1}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Inline Section Creation */}
              {ui.isCreatingSection ? (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-indigo-500/10 border-2 border-violet-400/30 rounded-xl p-6 shadow-lg shadow-violet-500/10"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">Nova Seção</h4>
                      <p className="text-violet-300 text-sm">Configure os detalhes da sua seção</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">
                        Título da seção *
                      </label>
                      <input
                        type="text"
                        value={newSectionTitle}
                        onChange={(e) => setNewSectionTitle(e.target.value)}
                        placeholder="Ex: Introdução ao JavaScript"
                        className="w-full px-4 py-3 bg-customgreys-darkGrey/50 border border-violet-500/30 rounded-lg text-white placeholder:text-gray-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
                        autoFocus
                      />
                    </div>
                    
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">
                        Descrição (opcional)
                      </label>
                      <textarea
                        value={newSectionDescription}
                        onChange={(e) => setNewSectionDescription(e.target.value)}
                        placeholder="Descreva brevemente o que será abordado nesta seção..."
                        rows={3}
                        className="w-full px-4 py-3 bg-customgreys-darkGrey/50 border border-violet-500/30 rounded-lg text-white placeholder:text-gray-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-6">
                    <Button
                      type="button"
                      onClick={handleCreateSection}
                      disabled={!newSectionTitle.trim() || loading.isCreatingSection}
                      className="px-6 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-lg disabled:opacity-50 transition-all duration-200"
                    >
                      {loading.isCreatingSection ? (
                        <>
                          <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Criando...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Criar Seção
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      onClick={cancelSectionCreation}
                      variant="outline"
                      className="px-6 py-2 border-violet-500/30 text-violet-300 hover:bg-violet-800/20 rounded-lg"
                    >
                      Cancelar
                    </Button>
                  </div>
                </motion.div>
              ) : (
                /* Add Section Button */
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="cursor-pointer"
                >
                  <div
                    onClick={() => dispatch(setCreatingSectionUI(true))}
                    className="border-2 border-dashed border-violet-400/40 hover:border-violet-400/60 rounded-xl p-8 text-center transition-all duration-200 hover:bg-violet-500/5 group"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                      <Plus className="w-8 h-8 text-violet-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      {sections.length === 0 ? "🚀 Criar primeira seção" : "➕ Adicionar nova seção"}
                    </h4>
                    <p className="text-violet-300 text-sm">
                      {sections.length === 0 
                        ? "Comece organizando seu curso em seções" 
                        : "Adicione mais uma seção ao seu curso"
                      }
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="flex justify-between pt-6">
              <Button
                type="button"
                onClick={() => setCurrentStep(2)}
                variant="outline"
                className="px-6 py-3 border-violet-500/30 text-violet-300 hover:bg-violet-800/20"
              >
                Voltar
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (sections.length > 0) {
                    markStepComplete(3);
                    setCurrentStep(4);
                  }
                }}
                disabled={sections.length === 0}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl disabled:opacity-50"
              >
                Próximo: Capítulos e Vídeos
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">Capítulos e Vídeos</h3>
              <p className="text-white/60">Adicione conteúdo aos seus capítulos</p>
            </div>

            {sections.length > 0 ? (
              <div className="space-y-6">
                {sections.map((section: any, sectionIndex: number) => (
                  <motion.div
                    key={section.sectionId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: sectionIndex * 0.1 }}
                    className="bg-customgreys-darkGrey/50 border border-violet-500/20 rounded-xl p-6 hover:border-violet-400/40 transition-all duration-200"
                  >
                    {/* Section Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                          {sectionIndex + 1}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white">{section.sectionTitle}</h4>
                          <p className="text-sm text-violet-300">{section.chapters?.length || 0} capítulos</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          onClick={() => handleDeleteSection(section.sectionId)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        {ui.isCreatingChapter !== section.sectionId && (
                          <Button
                            type="button"
                            onClick={() => dispatch(setCreatingChapterUI(section.sectionId))}
                            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-lg text-sm"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Novo Capítulo
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Existing Chapters */}
                    {section.chapters?.length > 0 && (
                      <div className="space-y-3 mb-6">
                        {section.chapters.map((chapter: any, chapterIndex: number) => (
                          <motion.div
                            key={chapter.chapterId}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: chapterIndex * 0.05 }}
                            className={`bg-violet-500/10 border border-violet-500/20 rounded-lg p-4 transition-colors ${
                              editingChapter?.chapterId === chapter.chapterId 
                                ? "bg-violet-500/20 border-violet-400/40" 
                                : "hover:bg-violet-500/15 cursor-pointer"
                            }`}
                            onClick={() => !editingChapter && handleEditChapter(section.sectionId, chapter.chapterId)}
                          >
                            {editingChapter?.chapterId === chapter.chapterId ? (
                              // Edit Mode
                              <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                  <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                                    <Settings className="w-4 h-4 text-white" />
                                  </div>
                                  <span className="text-white font-medium">Editando Capítulo {chapterIndex + 1}</span>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-2">
                                      Título do Capítulo
                                    </label>
                                    <input
                                      type="text"
                                      value={editChapterTitle}
                                      onChange={(e) => setEditChapterTitle(e.target.value)}
                                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                      placeholder="Ex: Introdução aos Verbos"
                                    />
                                  </div>
                                  
                                  <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-2">
                                      Descrição (Opcional)
                                    </label>
                                    <textarea
                                      value={editChapterDescription}
                                      onChange={(e) => setEditChapterDescription(e.target.value)}
                                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                      placeholder="Descrição do capítulo..."
                                      rows={2}
                                    />
                                  </div>
                                  
                                  <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-2">
                                      Tipo de Capítulo
                                    </label>
                                    <select
                                      value={editChapterType}
                                      onChange={(e) => setEditChapterType(e.target.value as "Text" | "Video" | "Quiz" | "Exercise")}
                                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                    >
                                      <option value="Text">📝 Texto</option>
                                      <option value="Video">🎥 Vídeo</option>
                                      <option value="Quiz">❓ Quiz</option>
                                      <option value="Exercise">🧪 Exercício</option>
                                    </select>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-3 pt-4 border-t border-slate-600">
                                  <Button
                                    type="button"
                                    onClick={handleSaveChapterEdit}
                                    className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2"
                                  >
                                    <Check className="w-4 h-4 mr-2" />
                                    Salvar
                                  </Button>
                                  <Button
                                    type="button"
                                    onClick={handleCancelChapterEdit}
                                    variant="ghost"
                                    className="text-gray-400 hover:text-white hover:bg-slate-700 px-4 py-2"
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteChapter(section.sectionId, chapter.chapterId);
                                    }}
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 ml-auto"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              // View Mode
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                                    <Play className="w-4 h-4 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="text-white font-medium">{chapter.title}</h5>
                                    {chapter.description && (
                                      <p className="text-gray-400 text-sm mt-1">{chapter.description}</p>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  {chapter.hasVideo || chapter.videoUrl || chapter.video || pendingVideoUploads[chapter.chapterId] ? (
                                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                                      <Video className="w-3 h-3 mr-1" />
                                      Vídeo ✓
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                                      <Upload className="w-3 h-3 mr-1" />
                                      Sem vídeo
                                    </Badge>
                                  )}
                                  <span className="text-xs text-violet-400 font-medium">
                                    Cap. {chapterIndex + 1}
                                  </span>
                                  <Button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteChapter(section.sectionId, chapter.chapterId);
                                    }}
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-6 w-6 p-0 ml-2"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Inline Chapter Creation */}
                    {ui.isCreatingChapter === section.sectionId && (
                      <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-violet-500/10 border-2 border-indigo-400/30 rounded-xl p-6 shadow-lg shadow-indigo-500/10"
                      >
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <Play className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h5 className="text-lg font-semibold text-white">Novo Capítulo</h5>
                            <p className="text-indigo-300 text-sm">Configure os detalhes do capítulo e adicione o vídeo</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="text-white text-sm font-medium mb-2 block">
                              Título do capítulo *
                            </label>
                            <input
                              type="text"
                              value={newChapterTitle}
                              onChange={(e) => setNewChapterTitle(e.target.value)}
                              placeholder="Ex: Conceitos Básicos de JavaScript"
                              className="w-full px-4 py-3 bg-customgreys-darkGrey/50 border border-indigo-500/30 rounded-lg text-white placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                              autoFocus
                            />
                          </div>
                          
                          <div>
                            <label className="text-white text-sm font-medium mb-2 block">
                              Tipo de capítulo *
                            </label>
                            <select
                              value={newChapterType}
                              onChange={(e) => setNewChapterType(e.target.value as "Text" | "Video" | "Quiz" | "Exercise")}
                              className="w-full px-4 py-3 bg-customgreys-darkGrey/50 border border-indigo-500/30 rounded-lg text-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                            >
                              <option value="Text">📝 Texto</option>
                              <option value="Video">🎥 Vídeo</option>
                              <option value="Quiz">🧠 Quiz Interativo</option>
                              <option value="Exercise">⚡ Exercício do Lab</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="text-white text-sm font-medium mb-2 block">
                              Descrição (opcional)
                            </label>
                            <textarea
                              value={newChapterDescription}
                              onChange={(e) => setNewChapterDescription(e.target.value)}
                              placeholder="Descreva brevemente o conteúdo deste capítulo..."
                              rows={2}
                              className="w-full px-4 py-3 bg-customgreys-darkGrey/50 border border-indigo-500/30 rounded-lg text-white placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 resize-none"
                            />
                          </div>

                          {/* Video Upload - Only show for Video type */}
                          {newChapterType === "Video" && (
                            <div>
                              <label className="text-white text-sm font-medium mb-2 block">
                                Vídeo do capítulo *
                              </label>
                              <div className="relative">
                                <input
                                  type="file"
                                  accept="video/*"
                                  onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setSelectedVideoFile(file);
                                    await handleVideoSelection(file);
                                  }
                                }}
                                  className="block w-full text-sm text-gray-300
                                    file:mr-4 file:py-3 file:px-6
                                    file:rounded-lg file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-indigo-600 file:text-white hover:file:bg-indigo-700
                                    file:cursor-pointer cursor-pointer file:transition-all file:duration-200
                                    border border-indigo-500/30 rounded-lg bg-customgreys-darkGrey/50
                                    hover:border-indigo-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                                />
                                {selectedVideoFile && (
                                  <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                                    <div className="flex items-center gap-2">
                                      <Video className="w-4 h-4 text-emerald-400" />
                                      <span className="text-emerald-300 text-sm font-medium">{selectedVideoFile.name}</span>
                                      <Button
                                        type="button"
                                        onClick={() => setSelectedVideoFile(null)}
                                        variant="ghost"
                                        size="sm"
                                        className="ml-auto p-1 h-6 w-6 text-emerald-400 hover:text-emerald-300"
                                      >
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                                
                                {uploadedVideoUrl && (
                                  <div className="mt-2 p-2 bg-green-600/20 border border-green-500/30 rounded-lg">
                                    <div className="flex items-center gap-2">
                                      <Check className="w-4 h-4 text-green-400" />
                                      <span className="text-green-300 text-sm">
                                        Vídeo enviado com sucesso! URL: {uploadedVideoUrl.substring(0, 50)}...
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Text Content - Show for Text type */}
                          {newChapterType === "Text" && (
                            <div>
                              <label className="text-white text-sm font-medium mb-2 block">
                                Conteúdo do capítulo *
                              </label>
                              <textarea
                                value={newChapterDescription}
                                onChange={(e) => setNewChapterDescription(e.target.value)}
                                placeholder="Digite o conteúdo textual do capítulo..."
                                rows={6}
                                className="w-full px-4 py-3 bg-customgreys-darkGrey/50 border border-indigo-500/30 rounded-lg text-white placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 resize-none"
                              />
                            </div>
                          )}
                          
                          {/* Quiz Configuration - Show for Quiz type */}
                          {newChapterType === "Quiz" && (
                            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-6">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                                  <span className="text-white text-sm">🧠</span>
                                </div>
                                <div>
                                  <h4 className="text-white font-semibold">Quiz Interativo</h4>
                                  <p className="text-purple-300 text-sm">Quiz gamificado conectado ao Practice Lab</p>
                                </div>
                              </div>
                              <p className="text-gray-300 text-sm">
                                O quiz será configurado automaticamente com base no conteúdo do capítulo.
                              </p>
                            </div>
                          )}
                          
                          {/* Exercise Configuration - Show for Exercise type */}
                          {newChapterType === "Exercise" && (
                            <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-lg p-6">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                                  <span className="text-white text-sm">⚡</span>
                                </div>
                                <div>
                                  <h4 className="text-white font-semibold">Exercício do Practice Lab</h4>
                                  <p className="text-emerald-300 text-sm">Exercício prático com IA e gamificação</p>
                                </div>
                              </div>
                              <p className="text-gray-300 text-sm">
                                Os exercícios serão selecionados automaticamente do Practice Lab.
                              </p>
                            </div>
                          )}
                          
                          {/* Resources Section - Available for all chapter types */}
                          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                  <Upload className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <h4 className="text-white font-semibold">Recursos do Capítulo</h4>
                                  <p className="text-blue-300 text-sm">PDFs, áudios, imagens, planilhas e outros materiais</p>
                                </div>
                              </div>
                              <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">
                                {selectedResourceFiles.length} arquivos
                              </span>
                            </div>
                            
                            <div className="space-y-3">
                              {/* Resource upload area */}
                              <div className="border-2 border-dashed border-blue-500/30 rounded-lg p-4 text-center hover:border-blue-400/50 transition-colors">
                                <input
                                  type="file"
                                  multiple
                                  accept=".pdf,.mp3,.wav"
                                  onChange={(e) => {
                                    const files = Array.from(e.target.files || []);
                                    setSelectedResourceFiles(prev => [...prev, ...files]);
                                  }}
                                  className="hidden"
                                  id="resourceUpload"
                                />
                                <label htmlFor="resourceUpload" className="cursor-pointer">
                                  <Upload className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                                  <p className="text-blue-300 text-sm font-medium">Clique para adicionar recursos</p>
                                  <p className="text-gray-400 text-xs mt-1">
                                    PDF e arquivos de áudio (MP3, WAV) - máx. 50MB cada
                                  </p>
                                </label>
                              </div>
                              
                              {/* Selected files preview */}
                              {selectedResourceFiles.length > 0 && (
                                <div className="space-y-2">
                                  {selectedResourceFiles.map((file, index) => {
                                    const fileType = file.type.includes('pdf') ? 'PDF' :
                                                   file.type.includes('audio') ? 'AUDIO' :
                                                   file.type.includes('image') ? 'IMAGE' :
                                                   file.type.includes('document') || file.type.includes('word') ? 'DOC' :
                                                   file.type.includes('sheet') || file.type.includes('excel') ? 'XLS' :
                                                   'FILE';
                                    
                                    const typeColors = {
                                      PDF: 'bg-red-500/20 text-red-400 border-red-500/30',
                                      AUDIO: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
                                      IMAGE: 'bg-green-500/20 text-green-400 border-green-500/30',
                                      DOC: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                                      XLS: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                                      FILE: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                    };
                                    
                                    return (
                                      <div key={index} className="flex items-center gap-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                                        <div className={`px-2 py-1 rounded text-xs font-medium border ${typeColors[fileType as keyof typeof typeColors]}`}>
                                          {fileType}
                                        </div>
                                        <div className="flex-1">
                                          <p className="text-white text-sm font-medium truncate">{file.name}</p>
                                          <p className="text-gray-400 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                        <Button
                                          type="button"
                                          onClick={() => setSelectedResourceFiles(prev => prev.filter((_, i) => i !== index))}
                                          variant="ghost"
                                          size="sm"
                                          className="p-1 h-6 w-6 text-red-400 hover:text-red-300"
                                        >
                                          <X className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mt-6">
                          <Button
                            type="button"
                            onClick={() => handleCreateChapter(section.sectionId)}
                            disabled={!newChapterTitle.trim() || loading.isCreatingChapter === section.sectionId}
                            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-lg disabled:opacity-50 transition-all duration-200"
                          >
                            {loading.isCreatingChapter === section.sectionId ? (
                              <>
                                <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Criando...
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4 mr-2" />
                                Criar Capítulo
                              </>
                            )}
                          </Button>
                          <Button
                            type="button"
                            onClick={cancelChapterCreation}
                            variant="outline"
                            className="px-6 py-2 border-indigo-500/30 text-indigo-300 hover:bg-indigo-800/20 rounded-lg"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {/* Empty State for Section */}
                    {section.chapters?.length === 0 && ui.isCreatingChapter !== section.sectionId && (
                      <div className="text-center py-8 border-2 border-dashed border-violet-400/30 rounded-xl">
                        <div className="w-12 h-12 bg-violet-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <Play className="w-6 h-6 text-violet-400" />
                        </div>
                        <p className="text-gray-400 text-sm mb-4">Nenhum capítulo adicionado ainda</p>
                        <Button
                          type="button"
                          onClick={() => dispatch(setCreatingChapterUI(section.sectionId))}
                          variant="outline"
                          className="border-violet-400/30 text-violet-300 hover:bg-violet-800/20"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar primeiro capítulo
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-violet-400/30">
                  <Layers className="w-10 h-10 text-violet-400" />
                </div>
                <h4 className="text-white font-bold text-xl mb-2">Primeiro crie algumas seções</h4>
                <p className="text-white/60 mb-8 max-w-md mx-auto">Volte à etapa anterior para criar seções antes de adicionar capítulos</p>
                <Button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar às Seções
                </Button>
              </div>
            )}

            <div className="flex justify-between pt-6">
              <Button
                type="button"
                onClick={() => setCurrentStep(3)}
                variant="outline"
                className="px-6 py-3 border-violet-500/30 text-violet-300 hover:bg-violet-800/20"
              >
                Voltar
              </Button>
              <Button
                type="button"
                onClick={() => {
                  const hasChapters = sections.some((section: any) => section.chapters?.length > 0);
                  if (hasChapters) {
                    markStepComplete(4);
                    setCurrentStep(5);
                  }
                }}
                disabled={!sections.some((section: any) => section.chapters?.length > 0)}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl disabled:opacity-50"
              >
                Próximo: Preview e Publicação
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Preview e Publicação</h3>
              <p className="text-white/60">Revise seu curso antes de publicar</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-customgreys-secondarybg/50 border-violet-500/20">
                <CardHeader>
                  <h4 className="text-white font-semibold">Resumo do Curso</h4>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Título:</span>
                    <span className="text-white">{methods.watch('courseTitle') || 'Não definido'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Categoria:</span>
                    <span className="text-white">{methods.watch('courseCategory') || 'Não definida'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Seções:</span>
                    <span className="text-white">{sections.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Capítulos:</span>
                    <span className="text-white">
                      {sections.reduce((total: number, section: any) => total + (section.chapters?.length || 0), 0)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-customgreys-secondarybg/50 border-violet-500/20">
                <CardHeader>
                  <h4 className="text-white font-semibold">Status de Publicação</h4>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <CustomFormField
                      name="courseStatus"
                      label={methods.watch("courseStatus") ? "🟢 Publicado" : "🟡 Rascunho"}
                      type="switch"
                      className="flex items-center space-x-3"
                      labelClassName={`text-base font-semibold transition-colors duration-300 ${
                        methods.watch("courseStatus")
                          ? "text-emerald-300"
                          : "text-amber-300"
                      }`}
                      inputClassName="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-customgreys-darkGrey border-2 data-[state=checked]:border-emerald-400 data-[state=unchecked]:border-violet-900"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between pt-6">
              <Button
                type="button"
                onClick={() => setCurrentStep(4)}
                variant="outline"
                className="px-6 py-3 border-violet-500/30 text-violet-300 hover:bg-violet-800/20"
              >
                Voltar
              </Button>
              <Button
                type="button"
                onClick={() => {
                  console.log('🎯 Save button clicked explicitly by user');
                  methods.handleSubmit(onSubmit)();
                }}
                disabled={loading.isSavingCourse}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 hover:from-purple-500 hover:via-violet-500 hover:to-purple-600 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 transition-all duration-200"
              >
                {loading.isSavingCourse ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Settings className="w-4 h-4 mr-2" />
                    {methods.watch("courseStatus") ? "✨ Atualizar Curso Publicado" : "💾 Guardar Rascunho"}
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-customgreys-primarybg text-white">
      {/* Enhanced Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative px-6 py-8"
      >
        {/* Enhanced Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 -left-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button 
                variant="ghost"
                onClick={() => router.push("/teacher/courses", { scroll: false })}
                className="text-gray-400 hover:text-white hover:bg-violet-600/20 transition-all"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar aos Cursos
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3"
            >
              <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full backdrop-blur-sm">
                <span className="text-emerald-300 text-sm font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  Sistema Online
                </span>
              </div>
            </motion.div>
          </div>

          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-indigo-500/10 border border-violet-500/30 rounded-full px-8 py-3 mb-8 backdrop-blur-sm shadow-lg shadow-violet-500/10"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Settings className="w-6 h-6 text-violet-400" />
              </motion.div>
              <span className="text-violet-300 font-semibold text-lg">Editor de Curso</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
              </motion.div>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight"
            >
              Configure seu{' '}
              <motion.span 
                className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ backgroundSize: '200% 200%' }}
              >
                Curso
              </motion.span>
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="inline-block ml-2"
              >
                ✨
              </motion.span>
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12 font-light"
            >
              Configure todos os detalhes e publique seu curso com <motion.span className="text-violet-400 font-medium" whileHover={{ scale: 1.05 }}>excelência</motion.span>
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Steps Navigation */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="px-6 mb-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center">
            <div className="flex items-center gap-4 bg-customgreys-secondarybg/30 backdrop-blur-md border border-violet-500/20 rounded-2xl p-4">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = isStepCompleted(step.id);
                const isCurrent = currentStep === step.id;
                const canAccess = canProceedToStep(step.id);
                
                return (
                  <React.Fragment key={step.id}>
                    <motion.div
                      whileHover={canAccess ? { scale: 1.05 } : {}}
                      whileTap={canAccess ? { scale: 0.95 } : {}}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                        isCurrent 
                          ? 'bg-violet-600/20 border-2 border-violet-400/50' 
                          : isCompleted 
                            ? 'bg-emerald-600/20 border-2 border-emerald-400/50 hover:bg-emerald-600/30'
                            : canAccess 
                              ? 'hover:bg-violet-600/10 border-2 border-transparent hover:border-violet-400/30'
                              : 'opacity-50 cursor-not-allowed border-2 border-transparent'
                      }`}
                      onClick={() => canAccess && handleStepClick(step.id)}
                    >
                      <div className={`p-3 rounded-full ${
                        isCompleted ? 'bg-emerald-500' : isCurrent ? 'bg-violet-500' : 'bg-customgreys-darkGrey'
                      }`}>
                        {isCompleted ? (
                          <Check className="w-5 h-5 text-white" />
                        ) : (
                          <StepIcon className={`w-5 h-5 ${isCurrent ? 'text-white' : 'text-gray-400'}`} />
                        )}
                      </div>
                      <div className="text-center">
                        <p className={`text-sm font-medium ${
                          isCurrent ? 'text-white' : isCompleted ? 'text-emerald-300' : 'text-gray-400'
                        }`}>
                          {step.title}
                        </p>
                        <p className="text-xs text-gray-500 max-w-20 leading-tight">
                          {step.description}
                        </p>
                      </div>
                      
                      {isCurrent && (
                        <motion.div
                          layoutId="currentStep"
                          className="absolute inset-0 bg-violet-500/10 rounded-xl border-2 border-violet-400/30"
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </motion.div>
                    
                    {index < steps.length - 1 && (
                      <div className={`w-8 h-0.5 ${
                        isCompleted ? 'bg-emerald-400' : 'bg-gray-600'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="px-6 pb-12"
      >
        <div className="max-w-4xl mx-auto">
          <Form {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <Card className="bg-customgreys-secondarybg/40 backdrop-blur-md border-violet-500/20 shadow-2xl shadow-violet-500/5">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      isStepCompleted(currentStep) ? 'bg-emerald-500' : 'bg-violet-500'
                    }`}>
                      {isStepCompleted(currentStep) ? (
                        <Check className="w-6 h-6 text-white" />
                      ) : (
                        React.createElement(steps[currentStep - 1]?.icon, { 
                          className: "w-6 h-6 text-white" 
                        })
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {steps[currentStep - 1]?.title}
                      </h2>
                      <p className="text-gray-400">
                        {steps[currentStep - 1]?.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  {renderStepContent()}
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>
      </motion.div>

      <ChapterModal />
      <SectionModal />
    </div>
  );
};

export default CourseEditor;

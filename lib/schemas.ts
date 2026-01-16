import * as z from "zod";

// Course Editor Schemas
export const courseSchema = z.object({
  courseTitle: z.string().min(1, "O título é obrigatório"),
  courseDescription: z.string().min(1, "A descrição é obrigatória"),
  courseCategory: z.string().min(1, "A categoria é obrigatória"),
  courseStatus: z.boolean(),
  courseImage: z.union([z.string(), z.instanceof(File)]).optional(),
});

export type CourseFormData = z.infer<typeof courseSchema>;

// Chapter Schemas
export const chapterResourceSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  resource_type: z.enum(["PDF", "LINK", "VIDEO", "CODE", "WORKSHEET", "AUDIO", "IMAGE"]),
  file: z.union([z.string(), z.instanceof(File)]).optional(),
  external_url: z.string().optional().or(z.literal("")),
  order: z.number().optional(),
  is_featured: z.boolean().default(false),
}).refine(
  (data) => {
    // Only validate if title is provided (indicating resource is being used)
    if (!data.title.trim()) return true;
    return data.file || (data.external_url && data.external_url.trim() !== "");
  },
  {
    message: "Deve fornecer um arquivo ou URL externa",
    path: ["external_url"]
  }
);

export const chapterQuizSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  practice_lesson: z.string().optional(),
  points_reward: z.number().min(1, "Mínimo 1 ponto").default(15),
  hearts_cost: z.number().min(0, "Mínimo 0 corações").default(1),
  passing_score: z.number().min(0).max(100, "Máximo 100%").default(80),
  time_limit: z.number().min(10, "Mínimo 10 segundos").optional(),
  max_attempts: z.number().min(1, "Mínimo 1 tentativa").default(3),
  is_active: z.boolean().default(true),
});

export const chapterSchema = z.object({
  title: z.string().min(2, "O título deve ter pelo menos 2 caracteres"),
  content: z.string().min(10, "O conteúdo deve ter pelo menos 10 caracteres"),
  video: z.union([z.string(), z.instanceof(File)]).optional(),
  
  // 🆕 PHASE 1 BRIDGE - Novos campos opcionais
  transcript: z.string().optional(),
  quiz_enabled: z.boolean().default(false),
  resources_data: z.array(chapterResourceSchema).default([]),
  practice_lesson: z.string().optional(),
  
  // Campos específicos para quiz (quando quiz_enabled = true)
  quiz_data: chapterQuizSchema.optional(),
}).refine(
  (data) => {
    // Only validate quiz fields if quiz is enabled
    if (!data.quiz_enabled) return true;
    
    return data.quiz_data && 
           data.quiz_data.title && 
           data.quiz_data.title.trim() !== "" &&
           data.practice_lesson && 
           data.practice_lesson.trim() !== "";
  },
  {
    message: "Para quiz interativo, o título do quiz e lição do English Practice Lab são obrigatórios",
    path: ["quiz_data"]
  }
);

export type ChapterFormData = z.infer<typeof chapterSchema>;
export type ChapterResourceFormData = z.infer<typeof chapterResourceSchema>;
export type ChapterQuizFormData = z.infer<typeof chapterQuizSchema>;

// Section Schemas
export const sectionSchema = z.object({
  title: z.string().min(2, "O título deve ter pelo menos 2 caracteres"),
  description: z.string().min(10, "O título deve ter pelo menos 2 caracteres"),
});

export type SectionFormData = z.infer<typeof sectionSchema>;

// Guest Checkout Schema
export const guestSchema = z.object({
  email: z.string().email("Endereço de e-mail inválido"),
});

export type GuestFormData = z.infer<typeof guestSchema>;

// Notification Settings Schema
export const notificationSettingsSchema = z.object({
  courseNotifications: z.boolean(),
  emailAlerts: z.boolean(),
  smsAlerts: z.boolean(),
  notificationFrequency: z.enum(["immediate", "daily", "weekly"]),
});

export type NotificationSettingsFormData = z.infer<
  typeof notificationSettingsSchema
>;

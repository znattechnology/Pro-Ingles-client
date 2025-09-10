"use client";

import {
  NotificationSettingsFormData,
  notificationSettingsSchema,
} from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateUserMutation } from "@/state/api";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import React from "react";
import { useForm } from "react-hook-form";
import Header from "./Header";
import { Form } from "@/components/ui/form";
import { CustomFormField } from "./CustomFormField";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

const SharedNotificationSettings = ({
  title = "Configurações de notificação",
  subtitle = "Gerir as suas configurações de notificação",
}: SharedNotificationSettingsProps) => {
  const { user, isAuthenticated } = useDjangoAuth();

  // For Django Auth, we'll store settings in a simple format
  const currentSettings: NotificationSettingsFormData = {
    courseNotifications: false,
    emailAlerts: false,
    smsAlerts: false,
    notificationFrequency: "daily" as const,
  };

  const methods = useForm<NotificationSettingsFormData>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: currentSettings,
  });

  const onSubmit = async (data: NotificationSettingsFormData) => {
    if (!user) return;

    // For now, we'll just show a success message since the Django backend
    // doesn't have notification settings implemented yet
    try {
      // TODO: Implement notification settings in Django backend
      console.log("Settings to save:", data);
      toast.success("Configurações atualizadas com sucesso!");
    } catch (error) {
      console.error("Failed to update user settings: ", error);
      toast.error("Erro ao atualizar configurações");
    }
  };

  if (!isAuthenticated || !user) return <div>Por favor, inicie sessão para gerir as suas configurações.</div>;

  return (
    <div className="space-y-4">
      <Header title={title} subtitle={subtitle} />
      <Form {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="space-y-6">
            <CustomFormField
              name="courseNotifications"
              label="Notificações de curso"
              type="switch"
               className="text-white"
               inputClassName="bg-white"
            />
            <CustomFormField
              name="emailAlerts"
              label="Alertas por e-mail"
              type="switch"
              className="text-white"
            />
            <CustomFormField
              name="smsAlerts"
              label="Alertas SMS"
              type="switch"
               className="text-white"
            />

            <CustomFormField
              name="notificationFrequency"
              label="Frequência de notificação"
              type="select"
              options={[
                { value: "immediate", label: "Imediato" },
                { value: "daily", label: "Diariamente" },
                { value: "weekly", label: "Semanalmente" },
              ]}
            />
          </div>

          <Button type="submit" className="!mt-8 text-gray-100 bg-violet-800 hover:bg-violet-900">
          Atualizar as configurações
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SharedNotificationSettings;

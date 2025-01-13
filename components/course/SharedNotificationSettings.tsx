"use client";

import {
  NotificationSettingsFormData,
  notificationSettingsSchema,
} from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateUserMutation } from "@/state/api";
import { useUser } from "@clerk/nextjs";
import React from "react";
import { useForm } from "react-hook-form";
import Header from "./Header";
import { Form } from "@/components/ui/form";
import { CustomFormField } from "./CustomFormField";
import { Button } from "@/components/ui/button";

const SharedNotificationSettings = ({
  title = "Configurações de notificação",
  subtitle = "Gerir as suas configurações de notificação",
}: SharedNotificationSettingsProps) => {
  const { user } = useUser();
  const [updateUser] = useUpdateUserMutation();

  const currentSettings =
    (user?.publicMetadata as { settings?: UserSettings })?.settings || {};

  const methods = useForm<NotificationSettingsFormData>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      courseNotifications: currentSettings.courseNotifications || false,
      emailAlerts: currentSettings.emailAlerts || false,
      smsAlerts: currentSettings.smsAlerts || false,
      notificationFrequency: currentSettings.notificationFrequency || "daily",
    },
  });

  const onSubmit = async (data: NotificationSettingsFormData) => {
    if (!user) return;

    const updatedUser = {
      userId: user.id,
      publicMetadata: {
        ...user.publicMetadata,
        settings: {
          ...currentSettings,
          ...data,
        },
      },
    };

    try {
      await updateUser(updatedUser);
    } catch (error) {
      console.error("Failed to update user settings: ", error);
    }
  };

  if (!user) return <div>Por favor, inicie sessão para gerir as suas configurações.</div>;

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

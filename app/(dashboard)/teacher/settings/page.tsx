import SharedNotificationSettings from "@/components/course/SharedNotificationSettings";
import React from "react";

const TeacherSettings = () => {
  return (
    <div className="w-3/5">
      <SharedNotificationSettings
        title="Configurações do professor"
        subtitle="Gerir as suas configurações de notificação para professores"
      />
    </div>
  );
};

export default TeacherSettings;

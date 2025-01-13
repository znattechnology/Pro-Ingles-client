import SharedNotificationSettings from "@/components/course/SharedNotificationSettings";
import React from "react";

const UserSettings = () => {
  return (
    <div className="w-3/5">
      <SharedNotificationSettings
        title="Configurações do utilizador"
        subtitle="Gerir as suas configurações de notificação de utilizador"
      />
    </div>
  );
};

export default UserSettings;

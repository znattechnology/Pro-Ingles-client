'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Notification {
  id: number;
  message: string;
}

function NotificationButton() {
  const [notifications, ] = useState<Notification[]>([
    { id: 1, message: "Nova mensagem recebida" },
    { id: 2, message: "A sua postagem foi curtida" },
  ])

  const notificationCount = notifications.length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="w-8 h-8 border border-violet-800 bg-customgreys-primarybg relative rounded-full" size="icon">
          <Bell className="h-2 w-2 text-white" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {notificationCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-customgreys-primarybg border border-violet-900/30">
      <div className="gradient-01  z-0" />
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none text-white">Notificações</h4>
            <p className="text-sm text-muted-foreground text-white">Você tem {notificationCount} mensagens não lidas.</p>
          </div>
          <div className="grid gap-2">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-violet-500 rounded-full" />
                <p className="text-sm text-white">{notification.message}</p>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default NotificationButton;


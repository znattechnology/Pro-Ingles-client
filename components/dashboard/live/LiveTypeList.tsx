"use client";
import React, { useState } from "react";
import HomeCard from "./HomeCard";
import { useRouter } from "next/navigation";
import MeetingModal from "./MeetingModal";
import { useSelector } from "react-redux";
import { useStreamVideoClient, Call } from "@stream-io/video-react-sdk";



type Props = {};

const LiveTypeList = (props: Props) => {
  const router = useRouter();
  const { user, } = useSelector((state: any) => state.auth);
  const client = useStreamVideoClient();
  const [meetingState, setMeetingState] = useState<
    "isScheduleMeeting" | "isJoiningMeeting" | "isInstantMeeting" | undefined
  >();

  const [values , setValues] = useState({
    dateTime: new Date(),
    description: '',
    link:'',
  });

  const [callDetais , setCallDetais] = useState<Call>()

  const createMeeting  = async () => {
    if(!client || !user) return;

    console.log(client);
    console.log(Call);
    console.log(user);
    try {
      const id = crypto.randomUUID();
      const call = client.call('default', id);
      if(!call) throw new Error('Failed to create call');

      const startsAt = values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.description || 'Instant meeting';

      await call.getOrCreate({
        data:{
          starts_at: startsAt,
          custom: {
            description
          }
        }
      })

      setCallDetais(call);
      if(!values.description) {
        router.push(`/admin/live/${call.id}`)
      }
    } catch (error) {
      console.log(error,"errado");
    }

  }
  return (
    <section className="grid  grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
      <HomeCard
        icon="lucide:plus"
        title="Nova Live"
        description="Iniciar uma live instantânia"
        handleClick={() => setMeetingState("isInstantMeeting")}
        className="bg-orange-1"
      />
      <HomeCard
        icon="lucide:calendar-check"
        title="Agendar Live"
        description="Planifica uma Live"
        handleClick={() => setMeetingState("isScheduleMeeting")}
        className="bg-blue-1"
      />

      <HomeCard
        icon="lucide:video"
        title="Ver Gravações"
        description="Verificar Lives gravadas"
        handleClick={() => router.push("/admin/live/recordings")}
        className="bg-purple-1"
      />

      <HomeCard
        icon="lucide:users"
        title="Juntar-se"
        description="Junta-se atraves de um Link de convidado"
        handleClick={() => setMeetingState("isJoiningMeeting")}
        className="bg-yellow-1"
      />
      <MeetingModal
      isOpen= {meetingState === 'isInstantMeeting'}
      onClose={() => setMeetingState(undefined)}
      title="Iniciar uma Live Instantânia"
      className="text-center"
      buttonText="Iniciar Live"
      handleClick={createMeeting}
      
      
      
      
      
      />
    </section>
  );
};

export default LiveTypeList;

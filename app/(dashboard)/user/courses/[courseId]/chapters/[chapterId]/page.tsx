"use client";

import { useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ReactPlayer from "react-player";
import Loading from "@/components/course/Loading";
import { useCourseProgressData } from "@/hooks/useCourseProgressData";

const Course = () => {
  const {
    user,
    course,
    userProgress,
    currentSection,
    currentChapter,
    isLoading,
    isChapterCompleted,
    updateChapterProgress,
    hasMarkedComplete,
    setHasMarkedComplete,
  } = useCourseProgressData();
  console.log("currentChapter.video:", currentChapter);

  const playerRef = useRef<ReactPlayer>(null);

  const handleProgress = ({ played }: { played: number }) => {
    if (
      played >= 0.8 &&
      !hasMarkedComplete &&
      currentChapter &&
      currentSection &&
      userProgress?.sections &&
      !isChapterCompleted()
    ) {
      setHasMarkedComplete(true);
      updateChapterProgress(
        currentSection.sectionId,
        currentChapter.chapterId,
        true
      );
    }
  };

  if (isLoading) return <Loading />;
  if (!user) return <div>Please sign in to view this course.</div>;
  if (!course || !userProgress) return <div>Error loading course</div>;

  return (
    <div className="flex h-[100vh]">
      <div className="flex-grow mx-auto">
        <div className="mb-6">
          <div className="text-customgreys-dirtyGrey text-sm mb-2">
            {course.title} / {currentSection?.sectionTitle} /{" "}
            <span className="text-gray-400">
              {currentChapter?.title}
            </span>
          </div>
          <h2 className="text-white-50 font-semibold text-3xl text-white">{currentChapter?.title}</h2>
          <div className="flex items-center justify-between">
            <div className="relative mr-2 flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarImage alt={course.teacherName} />
                <AvatarFallback className="bg-secondary-700 text-black">
                  {course.teacherName[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-customgreys-dirtyGrey text-sm font-[500]">
                {course.teacherName}
              </span>
            </div>
          </div>
        </div>

        <Card className="mb-6 !border-none">
          <CardContent className="h-[50vh] flex justify-center items-center p-0 m-0">
            {currentChapter?.video ? (
              <ReactPlayer
                ref={playerRef}
                url={currentChapter.video as string}
                controls
                width="100%"
                height="100%"
                onProgress={handleProgress}
                config={{
                  file: {
                    attributes: {
                      controlsList: "nodownload",
                    },
                  },
                }}
              />
            ) : (
              <div className="text-center text-gray-500">
                Não há vídeo disponível para este capítulo.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-5 ">
          <Tabs defaultValue="Notes" className="w-full md:w-2/3 ">
            <TabsList className="flex justify-start gap-10 bg-violet-900/40 text-white">
              <TabsTrigger className="text-md w-30 " value="Notes">
              Notas
              </TabsTrigger>
              <TabsTrigger className="text-md w-30" value="Resources">
              Recursos
              </TabsTrigger>
              <TabsTrigger className="text-md w-30" value="Quiz">
              Questionário
              </TabsTrigger>
            </TabsList>

            <TabsContent className="mt-5" value="Notes">
              <Card className="!border-none shadow-none bg-customgreys-secondarybg/40">
                <CardHeader className="p-2">
                  <CardTitle className="text-white">Conteúdo das Notas</CardTitle>
                </CardHeader>
                <CardContent className="p-2 text-white/70">
                  {currentChapter?.content}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent className="mt-5" value="Resources">
              <Card className="!border-none shadow-none bg-customgreys-secondarybg/40">
                <CardHeader className="p-2">
                  <CardTitle className="text-white">Conteúdo dos recursos</CardTitle>
                </CardHeader>
                <CardContent className="p-2 text-white/70">
                  {/* Add resources content here */}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent className="mt-5" value="Quiz">
              <Card className="!border-none shadow-none bg-customgreys-secondarybg/40">
                <CardHeader className="p-2">
                  <CardTitle className="text-white">Conteúdo do questionário</CardTitle>
                </CardHeader>
                <CardContent className="p-2 text-white/70">
                  {/* Add quiz content here */}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* <Card className="w-1/3 h-min border-none bg-white-50/5 p-10 bg-customgreys-secondarybg mt-4">
            <CardContent className="flex flex-col items-start p-0 px-4">
              <div className="flex items-center gap-3 flex-shrink-0 mb-7">
                <Avatar className="w-10 h-10">
                  <AvatarImage alt={course.teacherName} />
                  <AvatarFallback className="bg-secondary-700 text-black">
                    {course.teacherName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <h4 className="text-customgreys-dirtyGrey text-sm font-[500]">
                    {course.teacherName}
                  </h4>
                  <p className="text-sm">Senior UX Designer</p>
                </div>
              </div>
              <div className="text-sm">
                <p>
                  A seasoned Senior UX Designer with over 15 years of experience
                  in creating intuitive and engaging digital experiences.
                  Expertise in leading UX design projects.
                </p>
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  );
};

export default Course;

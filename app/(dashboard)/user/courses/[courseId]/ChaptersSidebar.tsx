import { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  CheckCircle,
  Trophy,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import Loading from "@/components/course/Loading";
import { useCourseProgressData } from "@/hooks/useCourseProgressData";

const ChaptersSidebar = () => {
  const router = useRouter();
  const { setOpen } = useSidebar();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const {
    user,
    course,
    userProgress,
    chapterId,
    courseId,
    isLoading,
    updateChapterProgress,
  } = useCourseProgressData();

  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) return <Loading />;
  if (!user) return <div>Faça login para ver o progresso do curso.</div>;
  if (!course || !userProgress) return <div>Erro ao carregar o conteúdo do curso</div>;

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections((prevSections) =>
      prevSections.includes(sectionTitle)
        ? prevSections.filter((title) => title !== sectionTitle)
        : [...prevSections, sectionTitle]
    );
  };

  const handleChapterClick = (sectionId: string, chapterId: string) => {
    router.push(`/user/courses/${courseId}/chapters/${chapterId}`, {
      scroll: false,
    });
  };

  return (
    <div ref={sidebarRef} className="bg-customgreys-secondarybg  text-white/70 border-x border-gray-700 overflow-y-auto transition-all duration-500 ease-in-out animate-in fade-in slide-in-from-left flex-shrink-0">
      <div className="text-white">
        <h2 className="text-lg font-bold pt-9 pb-6 px-8">{course.title}</h2>
        <hr className=" border-gray-700" />
      </div>
      {course.sections.map((section, index) => (
        <Section
          key={section.sectionId}
          section={section}
          index={index}
          sectionProgress={userProgress.sections.find(
            (s) => s.sectionId === section.sectionId
          )}
          chapterId={chapterId as string}
          courseId={courseId as string}
          expandedSections={expandedSections}
          toggleSection={toggleSection}
          handleChapterClick={handleChapterClick}
          updateChapterProgress={updateChapterProgress}
        />
      ))}
    </div>
  );
};

const Section = ({
  section,
  index,
  sectionProgress,
  chapterId,
  courseId,
  expandedSections,
  toggleSection,
  handleChapterClick,
  updateChapterProgress,
}: {
  section: any;
  index: number;
  sectionProgress: any;
  chapterId: string;
  courseId: string;
  expandedSections: string[];
  toggleSection: (sectionTitle: string) => void;
  handleChapterClick: (sectionId: string, chapterId: string) => void;
  updateChapterProgress: (
    sectionId: string,
    chapterId: string,
    completed: boolean
  ) => void;
}) => {
  const completedChapters =
    sectionProgress?.chapters.filter((c: any) => c.completed).length || 0;
  const totalChapters = section.chapters.length;
  const isExpanded = expandedSections.includes(section.sectionTitle);

  return (
    <div className="min-w-[300px]">
      <div
        onClick={() => toggleSection(section.sectionTitle)}
        className="cursor-pointer px-8 py-6 hover:bg-gray-700/50"
      >
        <div className="flex justify-between items-center">
          <p className="text-white/70 text-sm">
          Secção 0{index + 1}
          </p>
          {isExpanded ? (
            <ChevronUp className="text-white-50/70 w-4 h-4" />
          ) : (
            <ChevronDown className="text-white-50/70 w-4 h-4" />
          )}
        </div>
        <h3 className="text-white-50/90 font-semibold">
          {section.sectionTitle}
        </h3>
      </div>
      <hr className="border-gray-700" />

      {isExpanded && (
        <div className="pt-8 pb-8 bg-customgreys-primarybg">
          <ProgressVisuals
            section={section}
            sectionProgress={sectionProgress}
            completedChapters={completedChapters}
            totalChapters={totalChapters}
          />
          <ChaptersList
            section={section}
            sectionProgress={sectionProgress}
            chapterId={chapterId}
            courseId={courseId}
            handleChapterClick={handleChapterClick}
            updateChapterProgress={updateChapterProgress}
          />
        </div>
      )}
      <hr className="border-gray-700" />
    </div>
  );
};

const ProgressVisuals = ({
  section,
  sectionProgress,
  completedChapters,
  totalChapters,
}: {
  section: any;
  sectionProgress: any;
  completedChapters: number;
  totalChapters: number;
}) => {
  return (
    <>
      <div className="flex justify-between items-center gap-5 mb-2 px-7">
        <div className="flex-grow flex gap-1">
          {section.chapters.map((chapter: any) => {
            const isCompleted = sectionProgress?.chapters.find(
              (c: any) => c.chapterId === chapter.chapterId
            )?.completed;
            return (
              <div
                key={chapter.chapterId}
                className={cn(
                  "h-1 flex-grow rounded-full bg-gray-700",
                  isCompleted && "bg-secondary-700"
                )}
              ></div>
            );
          })}
        </div>
        <div className="bg-secondary-700 rounded-full p-3 flex items-center justify-center">
          <Trophy className="text-customgreys-secondarybg w-3 h-3" />
        </div>
      </div>
      <p className="text-gray-500 text-xs mt-3 mb-5 px-7">
        {completedChapters}/{totalChapters} CONCLUÍDO
      </p>
    </>
  );
};

const ChaptersList = ({
  section,
  sectionProgress,
  chapterId,
  courseId,
  handleChapterClick,
  updateChapterProgress,
}: {
  section: any;
  sectionProgress: any;
  chapterId: string;
  courseId: string;
  handleChapterClick: (sectionId: string, chapterId: string) => void;
  updateChapterProgress: (
    sectionId: string,
    chapterId: string,
    completed: boolean
  ) => void;
}) => {
  return (
    <ul className="text-white">
      {section.chapters.map((chapter: any, index: number) => (
        <Chapter
          key={chapter.chapterId}
          chapter={chapter}
          index={index}
          sectionId={section.sectionId}
          sectionProgress={sectionProgress}
          chapterId={chapterId}
          courseId={courseId}
          handleChapterClick={handleChapterClick}
          updateChapterProgress={updateChapterProgress}
        />
      ))}
    </ul>
  );
};

const Chapter = ({
  chapter,
  index,
  sectionId,
  sectionProgress,
  chapterId,
  courseId,
  handleChapterClick,
  updateChapterProgress,
}: {
  chapter: any;
  index: number;
  sectionId: string;
  sectionProgress: any;
  chapterId: string;
  courseId: string;
  handleChapterClick: (sectionId: string, chapterId: string) => void;
  updateChapterProgress: (
    sectionId: string,
    chapterId: string,
    completed: boolean
  ) => void;
}) => {
  const chapterProgress = sectionProgress?.chapters.find(
    (c: any) => c.chapterId === chapter.chapterId
  );
  const isCompleted = chapterProgress?.completed;
  const isCurrentChapter = chapterId === chapter.chapterId;

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();

    updateChapterProgress(sectionId, chapter.chapterId, !isCompleted);
  };

  return (
    <li
      className={cn("flex gap-3 items-center px-7 py-4 text-gray-300 cursor-pointer hover:bg-gray-700/20", {
        "bg-gray-700/50": isCurrentChapter,
      })}
      onClick={() => handleChapterClick(sectionId, chapter.chapterId)}
    >
      {isCompleted ? (
        <div
          className="bg-secondary-700 rounded-full p-1"
          onClick={handleToggleComplete}
          title="Toggle completion status"
        >
          <CheckCircle className="text-white-100 w-4 h-4" />
        </div>
      ) : (
        <div
          className={cn(" border border-gray-600 rounded-full w-6 h-6 flex items-center justify-center text-xs text-gray-400", {
            "bg-secondary-700 text-gray-800": isCurrentChapter,
          })}
        >
          {index + 1}
        </div>
      )}
      <span
        className={cn("flex-1 text-sm text-gray-500", {
          "text-gray-500 line-through": isCompleted,
          "text-secondary-700": isCurrentChapter,
        })}
      >
        {chapter.title}
      </span>
      {chapter.type === "Text" && (
        <FileText className="text-gray-500 ml-2 w-4 h-4" />
      )}
    </li>
  );
};

export default ChaptersSidebar;
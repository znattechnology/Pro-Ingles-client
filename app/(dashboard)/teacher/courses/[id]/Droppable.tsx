"use client";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Plus, GripVertical } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import {
  setSections,
  deleteSection,
  deleteChapter,
  openSectionModal,
  openChapterModal,
} from "@/state";

export default function DroppableComponent() {
  const dispatch = useAppDispatch();
  const { sections } = useAppSelector((state) => state.global.courseEditor);

  const handleSectionDragEnd = (result: any) => {
    if (!result.destination) return;

    const startIndex = result.source.index;
    const endIndex = result.destination.index;

    const updatedSections = [...sections];
    const [reorderedSection] = updatedSections.splice(startIndex, 1);
    updatedSections.splice(endIndex, 0, reorderedSection);
    dispatch(setSections(updatedSections));
  };

  const handleChapterDragEnd = (result: any, sectionIndex: number) => {
    if (!result.destination) return;

    const startIndex = result.source.index;
    const endIndex = result.destination.index;

    const updatedSections = [...sections];
    const updatedChapters = [...updatedSections[sectionIndex].chapters];
    const [reorderedChapter] = updatedChapters.splice(startIndex, 1);
    updatedChapters.splice(endIndex, 0, reorderedChapter);
    updatedSections[sectionIndex].chapters = updatedChapters;
    dispatch(setSections(updatedSections));
  };

  return (
    <DragDropContext onDragEnd={handleSectionDragEnd}>
      <Droppable droppableId="sections">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {sections.map((section: Section, sectionIndex: number) => (
              <Draggable
                key={section.sectionId}
                draggableId={section.sectionId}
                index={sectionIndex}
              >
                {(draggableProvider) => (
                  <div
                    ref={draggableProvider.innerRef}
                    {...draggableProvider.draggableProps}
                    className={`mb-4 p-2 rounded ${
                      sectionIndex % 2 === 0
                        ? "bg-customgreys-dirtyGrey/30"
                        : "bg-customgreys-secondarybg"
                    }`}
                  >
                    <SectionHeader
                      section={section}
                      sectionIndex={sectionIndex}
                      dragHandleProps={draggableProvider.dragHandleProps}
                    />

                    <DragDropContext
                      onDragEnd={(result) =>
                        handleChapterDragEnd(result, sectionIndex)
                      }
                    >
                      <Droppable droppableId={`capítulos-${section.sectionId}`}>
                        {(droppableProvider) => (
                          <div
                            ref={droppableProvider.innerRef}
                            {...droppableProvider.droppableProps}
                          >
                            {section.chapters.map(
                              (chapter: Chapter, chapterIndex: number) => (
                                <Draggable
                                  key={chapter.chapterId}
                                  draggableId={chapter.chapterId}
                                  index={chapterIndex}
                                >
                                  {(draggableProvider) => (
                                    <ChapterItem
                                      chapter={chapter}
                                      chapterIndex={chapterIndex}
                                      sectionIndex={sectionIndex}
                                      draggableProvider={draggableProvider}
                                    />
                                  )}
                                </Draggable>
                              )
                            )}
                            {droppableProvider.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        dispatch(
                          openChapterModal({
                            sectionIndex,
                            chapterIndex: null,
                          })
                        )
                      }
                      className="group bg-customgreys-darkGrey/50 hover:bg-violet-600 border border-violet-900/30 hover:border-violet-500 text-gray-300 hover:text-white font-medium rounded-lg transition-all duration-200 px-4 py-2 flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-200" />
                      <span className="text-sm">
                        Adicionar capítulo
                      </span>
                    </Button>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

const SectionHeader = ({
  section,
  sectionIndex,
  dragHandleProps,
}: {
  section: Section;
  sectionIndex: number;
  dragHandleProps: any;
}) => {
  const dispatch = useAppDispatch();

  return (
    <div className="flex justify-between items-center mb-2 bg-black/30 p-1 rounded" {...dragHandleProps}>
      <div className="w-full flex flex-col gap-1">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center">
            <GripVertical className="h-6 w-6 mb-1 text-violet-800" />
            <h3 className="text-lg font-medium text-white">{section.sectionTitle}</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-8 h-8 bg-customgreys-darkGrey/50 hover:bg-violet-600 border border-violet-900/30 hover:border-violet-500 text-gray-300 hover:text-white rounded-lg transition-all duration-200 flex items-center justify-center"
              onClick={() => dispatch(openSectionModal({ sectionIndex }))}
              title="Editar seção"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-8 h-8 bg-customgreys-darkGrey/50 hover:bg-red-600 border border-violet-900/30 hover:border-red-500 text-gray-300 hover:text-white rounded-lg transition-all duration-200 flex items-center justify-center"
              onClick={() => dispatch(deleteSection(sectionIndex))}
              title="Deletar seção"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {section.sectionDescription && (
          <p className="text-sm text-white/70 ml-6">
            {section.sectionDescription}
          </p>
        )}
      </div>
    </div>
  );
};

const ChapterItem = ({
  chapter,
  chapterIndex,
  sectionIndex,
  draggableProvider,
}: {
  chapter: Chapter;
  chapterIndex: number;
  sectionIndex: number;
  draggableProvider: any;
}) => {
  const dispatch = useAppDispatch();

  return (
    <div
      ref={draggableProvider.innerRef}
      {...draggableProvider.draggableProps}
      {...draggableProvider.dragHandleProps}
      className={`flex justify-between items-center ml-4 mb-1 rounded px-1 ${
        chapterIndex % 2 === 1
          ? "bg-black/20"
          : "bg-black/40"
      }`}
    >
      <div className="flex items-center">
        <GripVertical className="h-4 w-4 mb-[2px] text-white" />
        <p className="text-sm text-white">{`${chapterIndex + 1}. ${chapter.title}`}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-7 h-7 bg-customgreys-darkGrey/50 hover:bg-violet-600 border border-violet-900/30 hover:border-violet-500 text-gray-300 hover:text-white rounded-lg transition-all duration-200 flex items-center justify-center"
          onClick={() =>
            dispatch(
              openChapterModal({
                sectionIndex,
                chapterIndex,
              })
            )
          }
          title="Editar capítulo"
        >
          <Edit className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-7 h-7 bg-customgreys-darkGrey/50 hover:bg-red-600 border border-violet-900/30 hover:border-red-500 text-gray-300 hover:text-white rounded-lg transition-all duration-200 flex items-center justify-center"
          onClick={() =>
            dispatch(
              deleteChapter({
                sectionIndex,
                chapterIndex,
              })
            )
          }
          title="Deletar capítulo"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

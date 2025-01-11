
import React, { useState } from "react";


// import CourseContentMedia from "./CourseContentMedia";
// import Header from "../Header";

import Heading from "../../../utils/Heading";

import Loader from "@/components/Loader";
import { useGetCourseContentQuery } from "../../../redux/features/courses/coursesApi";
import CourseContentList from "@/components/CourseContentList";
import CourseContentMedia from "./CourseContentMedia";


type Props = {
  id: string;
  user:any;
};

const CourseContent = ({ id,user }: Props) => {
  const { data: contentData, isLoading,refetch } = useGetCourseContentQuery(id,{refetchOnMountOrArgChange:true});
  const [open, setOpen] = useState(false);
  const [route, setRoute] = useState('Login')
  const data = contentData?.content;

  const [activeVideo, setActiveVideo] = useState(0);

  console.log(data);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {/* <Header activeItem={1} open={open} setOpen={setOpen} route={route} setRoute={setRoute} /> */}

          <div className="">
      <div className="w-[80%]">
      <CourseContentMedia
                data={data}
                id={id}
                activeVideo={activeVideo}
                setActiveVideo={setActiveVideo}
                user={user}
                refetch={refetch}
              />
      </div>
      <div className="w-[20%]   fixed z-[1] top-20 right-0">
      <CourseContentList
              setActiveVideo={setActiveVideo}
              data={data}
              activeVideo={activeVideo}
            />
      </div>
    </div>



















       
        </>
      )}
    </>
  );
};

export default CourseContent;
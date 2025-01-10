import Ratings from "@/utils/Ratings";
import Image from "next/image";
import Link from "next/link";
import React, { FC } from "react";
import { Icon } from "@iconify/react";

type Props = {
  item: any;
  isProfile?: boolean;
};

const CourseCard: FC<Props> = ({ item, isProfile }) => {
  return (
    <Link
      href={!isProfile ? `/admin/content/courses/${item._id}` : `/admin/content/course-access/${item._id}`}
    >
      <div className="w-full min-h-[35vh] bg-gray-800 opacity-4 backdrop-blur dark:border-[#ffffff1d] border-[#00000015] shadow-[bg-slate-700] rounded-lg p-3 shadow-sm ">
        <Image
          src={item.thumbnail?.url}
          width={300}
          objectFit="contain"
          height={300}
          className="rounded w-full"
          alt=""
        />
        <br />
        <h1 className="font-Poppins text-[16px] text-slate-200">{item.name}</h1>
        <div className="w-full flex items-center justify-between pt-2">
          <Ratings rating={item.ratings} />
          {/* <h5 className={`text-slate-200 ${isProfile && "hidden 800px:inline"}`}>
                    {item.purchased} Alunos Inscritos
                </h5> */}
        </div>
        <div className="w-full flex items-center justify-between pt-3">
          <div className="flex">
            <h3 className="text-slate-200">
              {/* {item.price === 0 ? "Grátis" : item.price + "Kz"} */}
              Premium
            </h3>
            <h5 className="pl-3 text-[14px] mt-[5px] line-through opacity-80 text-slate-300">
              {/* {item.estimatedPrice}Kz */}
            </h5>
          </div>
          <div className="flex items-center pb-3">
            <Icon
              icon="lucide:list"
              className="text-sky-600"
              width="24"
              height="24"
            />
            <h5 className="pl-2 text-slate-200">
              {item.courseData?.length} Aulas
            </h5>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;

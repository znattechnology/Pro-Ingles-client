import { useGetCourseDetailsQuery } from "@/redux/features/courses/coursesApi";
import React, { FC, useState, useEffect } from "react";
import Loader from "./Loader";
import HeaderAdmin from "./HeaderAdmin";
import Heading from "@/utils/Heading";
import { useSelector } from "react-redux";
import Ratings from "@/utils/Ratings";
import { Icon } from "@iconify/react";
import { format } from "timeago.js";
import CoursePlayer from "@/utils/CoursePlayer";
import Link from "next/link";
import { styles } from "@/styles/style";
import Image from "next/image";
import CourseContentList from "./CourseContentList";
import { useLoadUserQuery } from "@/redux/features/api/apiSlice";
import { IoCheckmarkDoneOutline, IoCloseOutline } from "react-icons/io5";
import { useCreatePaymentIntentMutation, useGetStripePublishablekeyQuery } from "@/redux/features/orders/ordersApi";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckOutForm from "./payment/CheckOutForm";
import { userApi } from "@/redux/features/user/userApi";

type Props = {
  id: string;
  //   data: any;
   stripePromise: any;
    clientSecret: string;
  //   setRoute: any;
  //   setOpen: any;
};

const CourseDetails: FC<Props> = ({ id }) => {
  const [route, setRoute] = useState("Login");
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useGetCourseDetailsQuery(id);
 const {data : config} = useGetStripePublishablekeyQuery({});

 const [createPaymentIntent, { data: paymentIntentData }] =
 useCreatePaymentIntentMutation();

const [stripePromise, setStripePromise] = useState<any>(null);
const [clientSecret, setClientSecret] = useState("");

const { data: userData, refetch } = useLoadUserQuery(undefined, {});

  // const [user, setUser] = useState<any>();
  //   const discountPercentage =
  //     ((data?.estimatedPrice - data?.course?.price) / data?.estimatedPrice) * 100;
  //   const discountPercentagePrice = discountPercentage.toFixed(0);

const user = userData?.user;
  useEffect(() => {
    if (config) {
      const publishablekey = config?.publishablekey;
      setStripePromise(loadStripe(publishablekey));
    }
    if (data && userData?.user) {
      const amount = Math.round(data.course.price * 100);
      createPaymentIntent(amount);
    }
  }, [config, data, userData]);

  useEffect(() => {
    if (paymentIntentData) {
      setClientSecret(paymentIntentData?.client_secret);
    }
  }, [paymentIntentData]);

  const dicountPercentenge =
    ((data?.course.estimatedPrice - data?.course.price) /
      data?.course.estimatedPrice) *
    100;

  const discountPercentengePrice = dicountPercentenge.toFixed(0);

  const isPurchased =
    user && userData?.user?.courses?.find((item: any) => item._id === data?.course._id);



  const handleOrder = (e: any) => {
  
      setOpen(true);
 
  };
  return (
    <>
      <div className="">
        <Heading
          title={data?.course?.name}
          description={"Descição completa do curso"}
          keywords={data?.course?.name}
        />
      </div>
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          <div className="w-[90%] 800px:w-[90%] m-auto py-5">
            <div className="w-full flex  800px:flex-row">
              <div className="w-full 800px:w-[65%] 800px:pr-5">
                <h1 className="text-[25px] font-Poppins font-[600] text-slate-300 dark:text-white">
                  {data.course.name}
                </h1>
                <div className="flex items-center justify-between pt-3">
                  <div className="flex items-center">
                    <Ratings rating={data?.course?.ratings} />
                    <h5 className="text-slate-200 dark:text-white">
                      {data?.course.reviews?.length} Reviews
                    </h5>
                  </div>
                  <h5 className="text-slate-200 dark:text-white">
                    {data?.course.purchased} Students
                  </h5>
                </div>

                <br />
                <h1 className="text-[25px] font-Poppins font-[600] text-slate-300 dark:text-white">
                  What you will learn from this course?
                </h1>
                <div>
                  {data?.course.benefits?.map((item: any, index: number) => (
                    <div
                      className="w-full flex 800px:items-center py-2"
                      key={index}
                    >
                      <div className="w-[15px] mr-1">
                        <Icon
                          icon="lucide:check"
                          className="text-sky-600"
                          width="24"
                          height="24"
                        />
                      </div>
                      <p className="pl-2 text-slate-200 dark:text-white">
                        {item.title}
                      </p>
                    </div>
                  ))}
                  <br />
                  <br />
                </div>
                <h1 className="text-[25px] font-Poppins font-[600] text-slate-300 dark:text-white">
                  What are the prerequisites for starting this course?
                </h1>
                {data?.course.prerequisites?.map((item: any, index: number) => (
                  <div
                    className="w-full flex 800px:items-center py-2"
                    key={index}
                  >
                    <div className="w-[15px] mr-1">
                      <Icon
                        icon="lucide:check"
                        className="text-sky-600"
                        width="24"
                        height="24"
                      />
                    </div>
                    <p className="pl-2 text-slate-200 dark:text-white">
                      {item.title}
                    </p>
                  </div>
                ))}
                <br />
                <br />
                <div>
                  <h1 className="text-[25px] font-Poppins font-[600] text-slate-300 dark:text-white">
                    Course Overview
                  </h1>
                  <CourseContentList
                    data={data?.course.courseData}
                    isDemo={true}
                  />
                </div>
                <br />
                <br />
                {/* course description */}
                <div className="w-full">
                  <h1 className="text-[25px] font-Poppins font-[600] text-slate-300 dark:text-white">
                    Course Details
                  </h1>
                  <p className="text-[18px] mt-[20px] whitespace-pre-line w-full overflow-hidden text-slate-200 dark:text-white">
                    {data?.course?.description}
                  </p>
                </div>
                <br />
                <br />
                <div className="w-full">
                  <div className="800px:flex items-center">
                    <Ratings rating={data?.course?.ratings} />
                    <div className="mb-2 800px:mb-[unset]" />
                    <h5 className="text-[25px] font-Poppins text-slate-200 dark:text-white">
                      {Number.isInteger(data?.course?.ratings)
                        ? data?.ratings?.toFixed(1)
                        : data?.ratings?.toFixed(2)}{" "}
                      Course Rating • {data?.course?.reviews?.length} Reviews
                    </h5>
                  </div>
                  <br />
                  {(
                    data?.course.reviews && [...data.course.reviews].reverse()
                  ).map((item: any, index: number) => (
                    <div className="w-full pb-4" key={index}>
                      <div className="flex">
                        <div className="w-[50px] h-[50px]">
                          <Image
                            src={
                              item.user.avatar
                                ? item.user.avatar.url
                                : "https://res.cloudinary.com/dshp9jnuy/image/upload/v1665822253/avatars/nrxsg8sd9iy10bbsoenn.png"
                            }
                            width={50}
                            height={50}
                            alt=""
                            className="w-[50px] h-[50px] rounded-full object-cover"
                          />
                        </div>
                        <div className="hidden 800px:block pl-2">
                          <div className="flex items-center">
                            <h5 className="text-[18px] pr-2 text-slate-200 dark:text-white">
                              {item.user.name}
                            </h5>
                            <Ratings rating={item.ratings} />
                          </div>
                          <p className="text-slate-200 dark:text-white">
                            {item.comment}
                          </p>
                          <small className="text-[#000000d1] dark:text-[#ffffff83]">
                            {format(item.createdAt)} •
                          </small>
                        </div>
                        <div className="pl-2 flex 800px:hidden items-center">
                          <h5 className="text-[18px] pr-2 text-slate-200 dark:text-white">
                            {item.user.name}
                          </h5>
                          <Ratings rating={item.ratings} />
                        </div>
                      </div>
                      {item.commentReplies.map((i: any, index: number) => (
                        <div
                          className="w-full flex 800px:ml-16 my-5"
                          key={index}
                        >
                          <div className="w-[50px] h-[50px]">
                            <Image
                              src={
                                i.user.avatar
                                  ? i.user.avatar.url
                                  : "https://res.cloudinary.com/dshp9jnuy/image/upload/v1665822253/avatars/nrxsg8sd9iy10bbsoenn.png"
                              }
                              width={50}
                              height={50}
                              alt=""
                              className="w-[50px] h-[50px] rounded-full object-cover"
                            />
                          </div>
                          <div className="pl-2">
                            <div className="flex items-center">
                              <h5 className="text-[20px]">{i.user.name}</h5>{" "}
                              <Icon
                                icon="lucide:check"
                                className="text-sky-600"
                                width="24"
                                height="24"
                              />
                            </div>
                            <p>{i.comment}</p>
                            <small className="text-[#ffffff83]">
                              {format(i.createdAt)} •
                            </small>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full 800px:w-[35%] relative">
                <div className="sticky top-[10px] ml-12 left-0 z-50 w-full">
                  <CoursePlayer
                    videoUrl={data?.course.demoUrl}
                    title={data?.course.title}
                  />
                  <div className="flex items-center">
                    <h1 className="pt-5 text-[25px] text-slate-300 dark:text-white">
                      {data?.course.price === 0
                        ? "Free"
                        : data?.course.price + "$"}
                    </h1>
                    <h5 className="pl-3 text-[20px] mt-2 line-through opacity-80 text-slate-200 dark:text-white">
                      {data?.course.estimatedPrice}$
                    </h5>

                    <h4 className="pl-5 pt-4 text-[22px] text-slate-200 dark:text-white">
                      {discountPercentengePrice}% Off
                    </h4>
                  </div>
                  <div className="flex items-center">
                    {isPurchased ? (
                      <Link
                        className={`${styles.button} !w-[180px] my-3 font-Poppins cursor-pointer !bg-[crimson]`}
                        href={`/admin/content/course-access/${data.course._id}`}
                      >
                        Enter to Course
                      </Link>
                    ) : (
                      <div
                        className={`${styles.button} h-10 !w-[180px] my-3 font-Poppins cursor-pointer ]`}
                        onClick={handleOrder}
                      >
                        Buy Now {data?.course.price}$
                      </div>
                    )}
                  </div>
                  <br />
                  <p className="pb-1 text-slate-200 dark:text-white">
                    • Source code included
                  </p>
                  <p className="pb-1 text-slate-200 dark:text-white">
                    • Full lifetime access
                  </p>
                  <p className="pb-1 text-slate-200 dark:text-white">
                    • Certificate of completion
                  </p>
                  <p className="pb-3 800px:pb-1 text-slate-200 dark:text-white">
                    • Premium Support
                  </p>
                </div>
              </div>
            </div>
          </div>
          <>
          {open && (
            <div className="w-full h-screen bg-[#00000036] fixed top-0 left-0 z-50 flex items-center justify-center">
              <div className="w-[500px] min-h-[500px] bg-white rounded-xl shadow p-3">
                <div className="w-full flex justify-end">
                  <IoCloseOutline
                    size={40}
                    className="text-black cursor-pointer"
                    onClick={() => setOpen(false)}
                  />
                </div>
                <div className="w-ful" >
                  {stripePromise && clientSecret && (
                    
                    <Elements  stripe={stripePromise} options={{ clientSecret }}>
                      <CheckOutForm setOpen={setOpen} data={data} user={user} refetch={refetch} />
                    </Elements>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
        </div>
      )}
    </>
  );
};

export default CourseDetails;

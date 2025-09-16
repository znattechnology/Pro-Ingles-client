"use client";

import { FeedWrapper } from "@/components/learn/FeedWrapper";
import { StickWrapper } from "@/components/learn/StickyWrapper";
import { UserProgress } from "@/components/learn/UserProgress";
import { getUserProgress } from "@/db/django-queries";
import { useRouter } from "next/navigation";
import { ShoppingBasketIcon } from "lucide-react";
import { Items } from "./items";
import { useState, useEffect } from "react";
import Loading from "@/components/course/Loading";

const ShopPage = () => {
    const router = useRouter();
    const [userProgress, setUserProgress] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userProgressData = await getUserProgress();
                
                if (!userProgressData || !userProgressData.active_course) {
                    router.push("/user/laboratory/learn/courses");
                    return;
                }
                
                setUserProgress(userProgressData);
            } catch (error) {
                console.error("Error fetching user progress:", error);
                router.push("/user/laboratory/learn/courses");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [router]);

    if (isLoading) {
        return <Loading />;
    }

    if (!userProgress || !userProgress.active_course) {
        return null; // Will redirect via useEffect
    }
  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
        <StickWrapper>
            <UserProgress
            activeCourse={(userProgress as any).active_course}
            points={(userProgress as any).points}
            hearts={(userProgress as any).hearts}
            hasActiveSubscription={false}
            
            
            
            />
        </StickWrapper>
        <FeedWrapper>
            <div className="w-full flex flex-col items-center">
            <ShoppingBasketIcon className="mr-2 w-28 h-28 text-white" />
            <h1 className="text-center font-bold text-white text-2xl">Shop</h1>
            <p className="text-slate-400 text-center text-2xl">
                Spend your points on cool stuff
            </p>
            <Items
             points={(userProgress as any).points}
             hearts={(userProgress as any).hearts}
             hasActiveSubscription={false}
            
            
            />
            </div>
        </FeedWrapper>
    </div>
  )
}
export default ShopPage;
"use client";

/**
 * Shop Page - Simplified Redux Implementation
 */

import { FeedWrapper } from "@/components/learn/FeedWrapper";
import { StickWrapper } from "@/components/learn/StickyWrapper";
import { UserProgressRedux } from "@/components/learn/UserProgressRedux";
import { useRouter } from "next/navigation";
import { ShoppingBasketIcon } from "lucide-react";
import { Items } from "./items";
import {
  useFullUserProgressManagement
} from '@/redux/features/laboratory/hooks/useUserProgress';
import Loading from "@/components/course/Loading";

const ShopPage = () => {
    const router = useRouter();
    
    // Redux hooks - simplified implementation
    const {
        userProgress,
        isLoading,
        error,
        hearts,
        points,
        course,
    } = useFullUserProgressManagement();

    if (isLoading) {
        return <Loading />;
    }

    // Show error state or redirect if no user progress
    if (error || !userProgress) {
        router.push("/user/laboratory/learn/courses");
        return null;
    }

    // Get current values for display
    const currentHearts = hearts?.heartsCount || 5;
    const currentPoints = points?.currentPoints || 0;

    return (
        <div className="flex flex-row-reverse gap-[48px] px-6">
            <StickWrapper>
                <UserProgressRedux
                    useRedux={true}
                    hasActiveSubscription={false}
                />
            </StickWrapper>
            <FeedWrapper>
                <div className="w-full flex flex-col items-center">
                    <ShoppingBasketIcon className="mr-2 w-28 h-28 text-white" />
                    <h1 className="text-center font-bold text-white text-2xl">
                        Shop
                    </h1>
                    <p className="text-slate-400 text-center text-2xl">
                        Spend your points on cool stuff
                    </p>
                    <Items
                        points={currentPoints}
                        hearts={currentHearts}
                        hasActiveSubscription={false}
                    />
                </div>
            </FeedWrapper>
        </div>
    )
}
export default ShopPage;
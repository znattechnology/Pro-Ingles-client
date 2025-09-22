"use client";

/**
 * Shop Page - Enhanced with Redux Migration
 * 
 * 🔄 REDUX MIGRATION: This component now supports Redux with feature flags
 */

import { FeedWrapper } from "@/components/learn/FeedWrapper";
import { StickWrapper } from "@/components/learn/StickyWrapper";
import { UserProgress } from "@/components/learn/UserProgress";
import { UserProgressRedux } from "@/components/learn/UserProgressRedux";
import { getUserProgress } from "@/db/django-queries";
import { useRouter } from "next/navigation";
import { ShoppingBasketIcon } from "lucide-react";
import { Items } from "./items";
import { useState, useEffect } from "react";
import Loading from "@/components/course/Loading";
import { useFeatureFlag } from '@/lib/featureFlags';
import { 
  useLearnPageNavigation 
} from '@/redux/features/laboratory/hooks/useMainLearnPage';
import {
  useFullUserProgressManagement
} from '@/redux/features/laboratory/hooks/useUserProgress';

const ShopPage = () => {
    const router = useRouter();
    
    // Feature flags
    const useReduxShop = useFeatureFlag('REDUX_USER_PROGRESS');
    
    // Redux hooks
    const {
        userProgress: reduxUserProgress,
        isLoading: reduxLoading,
        error: reduxError,
        hearts: reduxHearts,
        points: reduxPoints,
        course: reduxCourse,
    } = useFullUserProgressManagement();
    
    // Legacy state
    const [legacyUserProgress, setLegacyUserProgress] = useState(null);
    const [legacyIsLoading, setLegacyIsLoading] = useState(true);
    
    // Determine data source
    const userProgress = useReduxShop ? reduxUserProgress : legacyUserProgress;
    const isLoading = useReduxShop ? reduxLoading : legacyIsLoading;
    const error = useReduxShop ? reduxError : null;
    
    // Navigation helpers
    const navigation = useLearnPageNavigation();

    // Debug migration
    if (process.env.NODE_ENV === 'development') {
        console.log('🛒 Shop Page Migration Status:', {
            useReduxShop,
            hasReduxUserProgress: !!reduxUserProgress,
            reduxLoading,
            reduxError,
            activeCourse: reduxCourse?.activeCourse?.title || legacyUserProgress?.active_course?.title,
            timestamp: new Date().toISOString()
        });
    }

    // Legacy data loading (fallback when Redux is disabled)
    useEffect(() => {
        if (!useReduxShop) {
            const fetchData = async () => {
                try {
                    setLegacyIsLoading(true);
                    console.log('🔄 Legacy: Loading shop page data...');
                    
                    const userProgressData = await getUserProgress();
                    
                    if (!userProgressData || !userProgressData.active_course) {
                        console.warn('🔄 Legacy: No user progress or active course, redirecting...');
                        router.push("/user/laboratory/learn/courses");
                        return;
                    }
                    
                    setLegacyUserProgress(userProgressData);
                } catch (error) {
                    console.error("🔄 Legacy: Error fetching user progress:", error);
                    router.push("/user/laboratory/learn/courses");
                } finally {
                    setLegacyIsLoading(false);
                }
            };

            fetchData();
        }
    }, [router, useReduxShop]);
    
    // Handle Redux navigation and redirects
    useEffect(() => {
        if (useReduxShop && reduxUserProgress && !reduxLoading) {
            const shouldContinue = navigation.navigateToActiveCourse(router, reduxUserProgress);
            if (!shouldContinue) {
                return;
            }
        }
    }, [useReduxShop, reduxUserProgress, reduxLoading, router, navigation]);

    if (isLoading) {
        return <Loading />;
    }

    // Show error state
    if (error) {
        console.error('Shop page error:', error);
        router.push("/user/laboratory/learn/courses");
        return null;
    }

    if (!userProgress || (!userProgress.active_course && !reduxCourse?.activeCourse)) {
        return null; // Will redirect via useEffect
    }
    // Get data values based on source
    const activeCourse = useReduxShop ? reduxCourse?.activeCourse : (userProgress as any)?.active_course;
    const hearts = useReduxShop ? reduxHearts?.heartsCount : (userProgress as any)?.hearts;
    const points = useReduxShop ? reduxPoints?.currentPoints : (userProgress as any)?.points;

    return (
        <div className="flex flex-row-reverse gap-[48px] px-6">
            <StickWrapper>
                {useReduxShop ? (
                    <UserProgressRedux
                        useRedux={true}
                        hasActiveSubscription={false}
                    />
                ) : (
                    <UserProgress
                        activeCourse={activeCourse}
                        points={points}
                        hearts={hearts}
                        hasActiveSubscription={false}
                    />
                )}
            </StickWrapper>
            <FeedWrapper>
                <div className="w-full flex flex-col items-center">
                    <ShoppingBasketIcon className="mr-2 w-28 h-28 text-white" />
                    <h1 className="text-center font-bold text-white text-2xl">
                        Shop {useReduxShop && '🔄'}
                    </h1>
                    <p className="text-slate-400 text-center text-2xl">
                        Spend your points on cool stuff
                    </p>
                    <Items
                        points={points || 0}
                        hearts={hearts || 5}
                        hasActiveSubscription={false}
                    />
                </div>
            </FeedWrapper>
        </div>
    )
}
export default ShopPage;
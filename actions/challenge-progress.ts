"use client";

/**
 * Challenge Progress Actions - Django API Integration
 * 
 * These functions replace the original Server Actions that used Clerk/Drizzle
 * and now call our Django REST API endpoints instead.
 */

// Base API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

/**
 * Get auth token from localStorage
 */
const getAuthToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
};

/**
 * Check challenge answer - replaces original upsertChallengeProgress
 * Now calls Django API: POST /api/v1/practice/challenge-progress/
 */
export const upsertChallengeProgress = async (challengeId: string, selectedOptionId: string) => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(`${API_BASE_URL}/practice/challenge-progress/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                challenge: challengeId,
                selected_option: selectedOptionId
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            
            // Handle specific error types from Django
            if (response.status === 400) {
                if (errorData.error === 'hearts') {
                    return { error: "hearts" };
                }
                if (errorData.error === 'practice') {
                    return { error: "practice" };
                }
            }
            
            throw new Error(errorData.message || "Failed to check challenge");
        }

        const result = await response.json();
        
        // Return format compatible with original client
        if (result.correct) {
            return { 
                success: true, 
                correct: true,
                data: {
                    challengeProgress: result.challenge_progress,
                    userProgress: result.user_progress
                }
            };
        } else {
            return {
                success: true,
                correct: false,
                data: {
                    userProgress: result.user_progress
                }
            };
        }

    } catch (error) {
        console.error("Error checking challenge:", error);
        throw error;
    }
};
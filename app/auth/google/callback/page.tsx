"use client";

/**
 * Google OAuth Callback Page
 *
 * This page handles the redirect from Google OAuth.
 * It extracts the authorization code from the URL and sends it to the backend.
 */

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGoogleOAuthLoginMutation } from "@/src/domains/auth/services/authApi";
import { useAppDispatch } from "@/redux/hooks";
import { userLoggedIn } from "@/src/domains/auth/services/authSlice";
import Loading from "@/components/course/Loading";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [googleLogin] = useGoogleOAuthLoginMutation();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const isProcessingRef = useRef(false);

  useEffect(() => {
    // Prevent double execution (React Strict Mode)
    if (isProcessingRef.current) return;

    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError(`Google OAuth error: ${errorParam}`);
      setStatus("error");
      return;
    }

    if (!code) {
      setError("No authorization code received from Google");
      setStatus("error");
      return;
    }

    // Mark as processing to prevent duplicate calls
    isProcessingRef.current = true;

    // Process the OAuth callback
    const processOAuth = async () => {
      try {
        const result = await googleLogin({ code }).unwrap();

        if (result.user) {
          // Store user info
          localStorage.setItem("user_info", JSON.stringify(result.user));

          // Set auth state cookie
          document.cookie = `auth_state=authenticated; path=/; max-age=${60 * 60 * 24 * 7}`;

          // Set user role cookie for middleware redirects
          document.cookie = `user_role=${result.user.role}; path=/; max-age=${60 * 60 * 24 * 7}`;

          // Update Redux
          dispatch(
            userLoggedIn({
              accessToken: "",
              refreshToken: "",
              user: result.user,
            })
          );

          setStatus("success");

          // Redirect based on role
          const role = result.user.role;
          let redirectUrl = "/user/courses/explore";
          if (role === "admin") {
            redirectUrl = "/admin/dashboard";
          } else if (role === "teacher") {
            redirectUrl = "/teacher/courses";
          }

          // Small delay to ensure state is saved
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 100);
        } else {
          setError("No user data in response");
          setStatus("error");
        }
      } catch (err: any) {
        // Check if we already authenticated (in case of duplicate call with used code)
        const hasAuthState = document.cookie.includes('auth_state=authenticated');
        if (hasAuthState) {
          // Already authenticated, just redirect
          const userRole = document.cookie.match(/user_role=(\w+)/)?.[1] || 'student';
          let redirectUrl = "/user/courses/explore";
          if (userRole === "admin") {
            redirectUrl = "/admin/dashboard";
          } else if (userRole === "teacher") {
            redirectUrl = "/teacher/courses";
          }
          window.location.href = redirectUrl;
          return;
        }

        console.error("Google OAuth error:", err);
        const errorMsg =
          err?.data?.error ||
          err?.data?.detail ||
          "Failed to authenticate with Google";
        setError(errorMsg);
        setStatus("error");
      }
    };

    processOAuth();
  }, [searchParams, googleLogin, dispatch]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-customgreys-primarybg">
        <Loading />
        <p className="text-white mt-4">A processar autenticação Google...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-customgreys-primarybg">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 max-w-md text-center">
          <h2 className="text-red-400 text-xl font-bold mb-2">
            Erro de Autenticação
          </h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => router.push("/signin")}
            className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  // Success state - show loading while redirect happens
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-customgreys-primarybg">
      <Loading />
      <p className="text-white mt-4">Login bem-sucedido! A redirecionar...</p>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-customgreys-primarybg">
          <Loading />
          <p className="text-white mt-4">A carregar...</p>
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}

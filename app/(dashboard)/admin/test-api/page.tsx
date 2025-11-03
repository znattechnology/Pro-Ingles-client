"use client";

import * as React from "react";
import { useGetAdminUserByIdQuery, useGetAdminUsersQuery } from "@/src/domains/admin";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";

export default function TestApiPage() {
  const { user: currentUser, isAuthenticated } = useDjangoAuth();
  
  // Test the users list API first
  const { data: usersData, isLoading: usersLoading, error: usersError } = useGetAdminUsersQuery({});
  
  // Get the first user ID for testing detail API
  const firstUserId = usersData?.users?.[0]?.id;
  
  // Test user detail API with the first user
  const { data: userDetailData, isLoading: userDetailLoading, error: userDetailError } = useGetAdminUserByIdQuery(
    firstUserId || "test", 
    { skip: !firstUserId }
  );

  React.useEffect(() => {
    console.log("=== API TEST DEBUG ===");
    console.log("isAuthenticated:", isAuthenticated);
    console.log("currentUser:", currentUser);
    console.log("usersData:", usersData);
    console.log("usersLoading:", usersLoading);
    console.log("usersError:", usersError);
    console.log("firstUserId:", firstUserId);
    console.log("userDetailData:", userDetailData);
    console.log("userDetailLoading:", userDetailLoading);
    console.log("userDetailError:", userDetailError);
  }, [isAuthenticated, currentUser, usersData, usersLoading, usersError, firstUserId, userDetailData, userDetailLoading, userDetailError]);

  return (
    <div className="p-8 text-white space-y-4">
      <h1 className="text-2xl font-bold">API Test Page</h1>
      
      <div className="space-y-2">
        <h2 className="text-xl">Authentication</h2>
        <p>Authenticated: {isAuthenticated ? "Yes" : "No"}</p>
        <p>Current User: {currentUser?.name || "None"}</p>
        <p>User Role: {currentUser?.role || "None"}</p>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl">Users List API</h2>
        <p>Loading: {usersLoading ? "Yes" : "No"}</p>
        <p>Error: {usersError ? JSON.stringify(usersError) : "None"}</p>
        <p>Users Count: {usersData?.users?.length || 0}</p>
        <p>First User ID: {firstUserId || "None"}</p>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl">User Detail API</h2>
        <p>Loading: {userDetailLoading ? "Yes" : "No"}</p>
        <p>Error: {userDetailError ? JSON.stringify(userDetailError) : "None"}</p>
        <p>User Detail: {userDetailData?.user ? userDetailData.user.name : "None"}</p>
      </div>

      {usersData?.users && (
        <div className="space-y-2">
          <h2 className="text-xl">Available Users</h2>
          {usersData.users.slice(0, 5).map(user => (
            <div key={user.id} className="p-2 border border-gray-600 rounded">
              <p>ID: {user.id}</p>
              <p>Name: {user.name}</p>
              <p>Email: {user.email}</p>
              <p>Role: {user.role}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
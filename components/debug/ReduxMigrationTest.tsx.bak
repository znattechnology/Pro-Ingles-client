/**
 * Redux Migration Test Component
 * 
 * Componente temporário para testar se a migração Redux está funcionando corretamente
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFeatureFlag } from '@/lib/featureFlags';
import { 
  useGetUserProgressQuery,
  useGetLaboratoryCoursesQuery,
  useGetTeacherCoursesQuery 
} from '@/redux/features/laboratory/laboratoryApiSlice';
import { useFullUserProgressManagement } from '@/redux/features/laboratory/hooks/useUserProgress';
import { useFullMainLearnPage } from '@/redux/features/laboratory/hooks/useMainLearnPage';
import { CheckCircle, XCircle, Loader, AlertTriangle } from 'lucide-react';

export const ReduxMigrationTest = () => {
  const [testResults, setTestResults] = useState<any>({});
  
  // Feature flags
  const flags = {
    REDUX_USER_PROGRESS: useFeatureFlag('REDUX_USER_PROGRESS'),
    REDUX_MAIN_LEARN_PAGE: useFeatureFlag('REDUX_MAIN_LEARN_PAGE'),
    REDUX_TEACHER_DASHBOARD: useFeatureFlag('REDUX_TEACHER_DASHBOARD'),
    REDUX_COURSE_SELECTION: useFeatureFlag('REDUX_COURSE_SELECTION'),
    DEBUG_REDUX: useFeatureFlag('DEBUG_REDUX'),
  };

  // Redux hooks for testing
  const { 
    data: userProgress, 
    isLoading: userProgressLoading, 
    error: userProgressError 
  } = useGetUserProgressQuery();
  
  const { 
    data: courses, 
    isLoading: coursesLoading, 
    error: coursesError 
  } = useGetLaboratoryCoursesQuery();
  
  const { 
    data: teacherCourses, 
    isLoading: teacherCoursesLoading, 
    error: teacherCoursesError 
  } = useGetTeacherCoursesQuery({ includeDrafts: true });

  // Complex hooks
  const userProgressManagement = useFullUserProgressManagement();
  const mainLearnPage = useFullMainLearnPage();

  useEffect(() => {
    // Throttle updates to prevent constant re-renders
    const timeoutId = setTimeout(() => {
      const results = {
        featureFlags: flags,
        apiTests: {
          userProgress: {
            loading: userProgressLoading,
            error: userProgressError,
            hasData: !!userProgress,
            data: userProgress
          },
          courses: {
            loading: coursesLoading,
            error: coursesError,
            hasData: !!courses,
            count: courses?.length || 0
          },
          teacherCourses: {
            loading: teacherCoursesLoading,
            error: teacherCoursesError,
            hasData: !!teacherCourses,
            count: teacherCourses?.length || 0
          }
        },
        complexHooks: {
          userProgressManagement: {
            hasData: !!userProgressManagement.userProgress,
            hearts: userProgressManagement.hearts,
            points: userProgressManagement.points,
            course: userProgressManagement.course
          },
          mainLearnPage: {
            hasData: !!mainLearnPage.data,
            isLoading: mainLearnPage.isLoading,
            error: mainLearnPage.error,
            stats: mainLearnPage.stats
          }
        }
      };
      
      setTestResults(results);
    }, 2000); // Update only every 2 seconds
    
    return () => clearTimeout(timeoutId);
  }, [
    // Only trigger on important changes
    userProgressLoading, coursesLoading, teacherCoursesLoading,
    !!userProgress, !!courses, !!teacherCourses
  ]);

  const getStatusIcon = (condition: boolean, loading?: boolean) => {
    if (loading) return <Loader className="w-4 h-4 animate-spin text-blue-500" />;
    return condition ? 
      <CheckCircle className="w-4 h-4 text-green-500" /> : 
      <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getBadgeVariant = (condition: boolean, loading?: boolean) => {
    if (loading) return "secondary";
    return condition ? "default" : "destructive";
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className="bg-customgreys-secondarybg border-violet-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-violet-400" />
            Redux Migration Test 🔄
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Feature Flags Status */}
          <div>
            <h4 className="text-white text-xs font-semibold mb-2">Feature Flags</h4>
            <div className="grid grid-cols-1 gap-1">
              {Object.entries(flags).map(([flag, enabled]) => (
                <div key={flag} className="flex items-center justify-between">
                  <span className="text-customgreys-dirtyGrey text-xs">{flag}</span>
                  <Badge variant={enabled ? "default" : "secondary"} className="text-xs">
                    {enabled ? "ON" : "OFF"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* API Tests */}
          <div>
            <h4 className="text-white text-xs font-semibold mb-2">API Endpoints</h4>
            <div className="space-y-2">
              {Object.entries(testResults.apiTests || {}).map(([key, test]: [string, any]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-customgreys-dirtyGrey text-xs capitalize">{key}</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(!test.error && test.hasData, test.loading)}
                    <Badge variant={getBadgeVariant(!test.error && test.hasData, test.loading)} className="text-xs">
                      {test.loading ? "Loading" : test.error ? "Error" : test.hasData ? "OK" : "No Data"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Complex Hooks */}
          <div>
            <h4 className="text-white text-xs font-semibold mb-2">Advanced Hooks</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-customgreys-dirtyGrey text-xs">User Progress Mgmt</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(!!testResults.complexHooks?.userProgressManagement?.hasData)}
                  <Badge variant={testResults.complexHooks?.userProgressManagement?.hasData ? "default" : "secondary"} className="text-xs">
                    {testResults.complexHooks?.userProgressManagement?.hasData ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-customgreys-dirtyGrey text-xs">Main Learn Page</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(!!testResults.complexHooks?.mainLearnPage?.hasData && !testResults.complexHooks?.mainLearnPage?.error, testResults.complexHooks?.mainLearnPage?.isLoading)}
                  <Badge variant={getBadgeVariant(!!testResults.complexHooks?.mainLearnPage?.hasData && !testResults.complexHooks?.mainLearnPage?.error, testResults.complexHooks?.mainLearnPage?.isLoading)} className="text-xs">
                    {testResults.complexHooks?.mainLearnPage?.isLoading ? "Loading" : testResults.complexHooks?.mainLearnPage?.error ? "Error" : testResults.complexHooks?.mainLearnPage?.hasData ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          {userProgress && (
            <div>
              <h4 className="text-white text-xs font-semibold mb-2">Quick Stats 🔄</h4>
              <div className="text-customgreys-dirtyGrey text-xs space-y-1">
                <div>Hearts: {userProgress.hearts}/5</div>
                <div>Points: {userProgress.points?.toLocaleString()}</div>
                <div>Active Course: {userProgress.active_course?.title || 'None'}</div>
              </div>
            </div>
          )}

          {/* Clear Test Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.location.reload()}
            className="w-full text-xs bg-customgreys-primarybg border-customgreys-darkerGrey text-white hover:bg-customgreys-darkerGrey"
          >
            Refresh Test
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
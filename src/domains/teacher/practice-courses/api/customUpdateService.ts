/**
 * Custom Course Update Service
 * 
 * Baseado na implementação que funcionava antes da reestruturação.
 * Usa fetch direto para contornar problemas do RTK Query.
 */

// Base API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000/api/v1';

/**
 * Get auth token from localStorage
 */
const getAuthToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
};

/**
 * Update Practice Course - Implementação customizada
 */
export const updatePracticeCourseCustom = async (courseId: string, courseData: {
    title?: string;
    description?: string;
    category?: string;
    level?: string;
    status?: string;
}) => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        console.log('🔧 CUSTOM UPDATE API - Usando endpoint correto descoberto:', {
            courseId,
            courseData,
            endpoint: `${API_BASE_URL}/courses/${courseId}/`,
            method: 'PATCH'
        });

        const response = await fetch(`${API_BASE_URL}/courses/${courseId}/`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(courseData),
        });

        console.log('🔧 CUSTOM UPDATE API - Response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            console.error('❌ CUSTOM UPDATE API - Error:', errorData);
            throw new Error(errorData.message || `HTTP ${response.status}: Failed to update course`);
        }

        const result = await response.json();
        console.log('✅ CUSTOM UPDATE API - Success:', result);
        return result;

    } catch (error) {
        console.error("❌ CUSTOM UPDATE API - Exception:", error);
        throw error;
    }
};

/**
 * Alternative: Try different methods if PATCH fails
 */
export const updatePracticeCourseAlternative = async (courseId: string, courseData: any) => {
    const token = getAuthToken();
    if (!token) {
        throw new Error("Authentication required");
    }

    // Usar endpoint correto descoberto na investigação profunda
    const approaches = [
        // Endpoint correto descoberto que permite PATCH, PUT, DELETE
        { method: 'PATCH', url: `/courses/${courseId}/` },
        { method: 'PUT', url: `/courses/${courseId}/` },
        // Fallbacks antigos (caso o endpoint mude)
        { method: 'PUT', url: `/practice/courses/${courseId}/`, body: { action: courseData.status === 'published' ? 'publish' : 'unpublish' } },
        { method: 'PATCH', url: `/practice/courses/${courseId}/` },
        { method: 'POST', url: `/practice/courses/${courseId}/update/` },
    ];

    for (const approach of approaches) {
        try {
            console.log(`🔍 Tentando: ${approach.method} ${approach.url}`);
            
            const response = await fetch(`${API_BASE_URL}${approach.url}`, {
                method: approach.method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(approach.body || courseData),
            });

            console.log(`📊 ${approach.method} ${approach.url} - Status: ${response.status}`);

            if (response.ok) {
                const result = await response.json();
                console.log(`✅ SUCESSO com ${approach.method} ${approach.url}:`, result);
                return result;
            }

        } catch (error) {
            console.log(`❌ Falhou: ${approach.method} ${approach.url}`, error);
            continue;
        }
    }

    throw new Error('Nenhum método de update funcionou');
};
/**
 * Script de teste para a API customizada de update de curso
 */

// Simulando token (substitua pelo seu token real)
const token = 'your-real-token-here';
const courseId = 'e858f499-eaec-478f-a14f-b2aa07e9a3b7';
const API_BASE_URL = 'http://localhost:8000/api/v1';

const testCustomUpdate = async () => {
    try {
        console.log('🧪 Testando API customizada de update...');
        
        const testData = {
            title: 'Curso Teste - Updated via Custom API',
            description: 'Descrição atualizada via API customizada',
            category: 'General',
            level: 'Intermediate',
            status: 'draft'
        };

        console.log('📤 Enviando dados:', testData);
        console.log('🎯 Endpoint:', `${API_BASE_URL}/practice/courses/${courseId}/`);

        const response = await fetch(`${API_BASE_URL}/practice/courses/${courseId}/`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData),
        });

        console.log('📊 Response status:', response.status);
        console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));

        if (response.ok) {
            const result = await response.json();
            console.log('✅ SUCESSO! Curso atualizado:', result);
            return result;
        } else {
            const errorData = await response.text();
            console.error('❌ ERRO na resposta:', errorData);
            throw new Error(`HTTP ${response.status}: ${errorData}`);
        }

    } catch (error) {
        console.error('❌ ERRO na requisição:', error);
        throw error;
    }
};

// Função para testar múltiplos métodos
const testAlternativeMethods = async () => {
    const approaches = [
        { method: 'PATCH', url: `/practice/courses/${courseId}/` },
        { method: 'POST', url: `/practice/courses/${courseId}/` },
        { method: 'PUT', url: `/practice/courses/${courseId}/` },
        { method: 'POST', url: `/practice/courses/${courseId}/edit/` },
        { method: 'POST', url: `/practice/courses/${courseId}/update/` },
    ];

    for (const approach of approaches) {
        try {
            console.log(`🔍 Testando: ${approach.method} ${approach.url}`);
            
            const response = await fetch(`${API_BASE_URL}${approach.url}`, {
                method: approach.method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: `Teste ${approach.method}`,
                    description: 'Teste de método alternativo'
                }),
            });

            console.log(`📊 ${approach.method} ${approach.url} - Status: ${response.status}`);

            if (response.ok) {
                const result = await response.json();
                console.log(`✅ SUCESSO com ${approach.method}:`, result);
                return result;
            }

        } catch (error) {
            console.log(`❌ ${approach.method} ${approach.url} falhou:`, error.message);
        }
    }
    
    console.log('❌ Nenhum método funcionou');
};

console.log('📋 Para testar a API:');
console.log('1. Substitua o token na linha 7 pelo seu token real');
console.log('2. Execute: node test-custom-api.js');
console.log('');
console.log('🔑 Token atual:', token);
console.log('🎯 Course ID:', courseId);
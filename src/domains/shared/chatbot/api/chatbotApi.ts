/**
 * Chatbot API Service
 * Handles communication with the intelligent chatbot backend
 */

const API_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000';

// Timeout para requests (30 segundos)
const REQUEST_TIMEOUT = 30000;

// Limite de histórico no cliente
const MAX_HISTORY_LENGTH = 20;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  response: string;
  session_id: string;
  cached: boolean;
  error?: boolean;
}

export interface QuickAction {
  id: string;
  label: string;
  message: string;
  icon: string;
}

/**
 * Helper para fazer fetch com timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Sanitiza o histórico antes de enviar
 */
function sanitizeHistory(history: ChatMessage[]): ChatMessage[] {
  return history
    .filter(msg => msg.role && msg.content)
    .slice(-MAX_HISTORY_LENGTH)
    .map(msg => ({
      role: msg.role,
      content: msg.content.slice(0, 1000), // Limitar tamanho
    }));
}

/**
 * Send a message to the chatbot
 */
export async function sendChatMessage(
  message: string,
  history: ChatMessage[] = [],
  sessionId?: string
): Promise<ChatResponse> {
  try {
    // Validar mensagem
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      return {
        response: 'Por favor, escreva uma mensagem.',
        session_id: sessionId || '',
        cached: false,
        error: true,
      };
    }

    if (trimmedMessage.length > 1000) {
      return {
        response: 'A mensagem é muito longa. Por favor, reduza para menos de 1000 caracteres.',
        session_id: sessionId || '',
        cached: false,
        error: true,
      };
    }

    const response = await fetchWithTimeout(
      `${API_URL}/chatbot/chat/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmedMessage,
          history: sanitizeHistory(history),
          session_id: sessionId,
        }),
      },
      REQUEST_TIMEOUT
    );

    if (!response.ok) {
      if (response.status === 429) {
        return {
          response: 'Muitas mensagens enviadas. Por favor, aguarde um momento.',
          session_id: sessionId || '',
          cached: false,
          error: true,
        };
      }
      throw new Error('Failed to get response from chatbot');
    }

    return await response.json();
  } catch (error) {
    console.error('Chatbot API error:', error);

    // Tratamento específico para timeout
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        response: 'O serviço demorou a responder. Por favor, tente novamente.',
        session_id: sessionId || '',
        cached: false,
        error: true,
      };
    }

    return {
      response: 'Desculpe, ocorreu um erro ao processar a sua mensagem. Por favor, tente novamente.',
      session_id: sessionId || '',
      cached: false,
      error: true,
    };
  }
}

/**
 * Get quick actions from the backend
 */
export async function getQuickActions(): Promise<QuickAction[]> {
  try {
    const response = await fetch(`${API_URL}/chatbot/quick-actions/`);

    if (!response.ok) {
      throw new Error('Failed to get quick actions');
    }

    const data = await response.json();
    return data.actions;
  } catch (error) {
    console.error('Failed to fetch quick actions:', error);
    // Return default actions as fallback
    return [
      { id: 'pricing', label: 'Preços', message: 'Quais são os preços dos planos?', icon: 'zap' },
      { id: 'courses', label: 'Cursos', message: 'Que cursos vocês oferecem?', icon: 'book' },
      { id: 'demo', label: 'Demo', message: 'Como posso ver uma demonstração?', icon: 'play' },
      { id: 'support', label: 'Suporte', message: 'Como posso contactar o suporte?', icon: 'headphones' },
    ];
  }
}

/**
 * Check chatbot health
 */
export async function checkChatbotHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/chatbot/health/`);
    return response.ok;
  } catch {
    return false;
  }
}

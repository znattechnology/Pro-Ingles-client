/**
 * Chatbot API Service
 * Handles communication with the intelligent chatbot backend
 */

const API_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000';

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
 * Send a message to the chatbot
 */
export async function sendChatMessage(
  message: string,
  history: ChatMessage[] = [],
  sessionId?: string
): Promise<ChatResponse> {
  try {
    const response = await fetch(`${API_URL}/chatbot/chat/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history,
        session_id: sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from chatbot');
    }

    return await response.json();
  } catch (error) {
    console.error('Chatbot API error:', error);
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

/**
 * Vapi Conversation Practice - Hooks
 *
 * Custom hooks for managing the Vapi conversation practice feature.
 */

export { useVapiSDK } from './useVapiSDK';
export { useMicrophonePermission, getMicInstructions } from './useMicrophonePermission';
export { useBackendAPI } from './useBackendAPI';
export { useSessionTimer } from './useSessionTimer';
export { useSessionRecovery } from './useSessionRecovery';
export type { RecoverableSession } from './useSessionRecovery';
export { useVapiCall } from './useVapiCall';

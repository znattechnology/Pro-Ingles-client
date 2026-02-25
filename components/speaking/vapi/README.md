# Vapi Conversation Practice - Refactoring Notes

## Current State (After Refactoring)

The original `VapiConversationPractice.tsx` component was a monolithic file with 2372 lines.
It has been refactored into a modular architecture with custom hooks and reusable components.

## Completed Refactoring

### Phase 1: Custom Hooks (COMPLETED)

All hooks are located in `/components/speaking/vapi/hooks/`:

| Hook | Description | Exports |
|------|-------------|---------|
| `useVapiSDK` | SDK loading with npm/CDN/mock fallback | `{ isLoaded, error, VapiClass }` |
| `useMicrophonePermission` | Permission management + browser instructions | `{ permission, check, request, browserType, ... }` |
| `useBackendAPI` | Backend API calls with retry logic | `{ status, checkStatus, createAssistant, startSession, sendBatchAnalysis }` |
| `useSessionTimer` | Timer management with auto-end | `{ elapsed, isActive, progress, formattedTime, start, stop, reset }` |
| `useSessionRecovery` | localStorage session recovery | `{ showDialog, savedData, recover, discard, saveSession, ... }` |
| `useVapiCall` | Main orchestrator hook | `{ vapi, status, messages, isUserSpeaking, isAISpeaking, start, end }` |

### Phase 2: Sub-Components (COMPLETED)

Components are organized in `/components/speaking/vapi/components/`:

**Shared Components (`/shared/`):**
- `LoadingOverlay` - Processing state with spinner
- `ErrorState` - Error display with retry/back options
- `MicPermissionDialog` - Permission request + browser-specific instructions

**SetupStep Components (`/SetupStep/`):**
- `UserProfileCard` - Name and background input
- `LevelSelector` - CEFR level selection (A1-C2)
- `DomainSelector` - Practice domain + objective selection
- `ConfigCard` - Duration and correction mode settings
- `RecoveryDialog` - Session recovery prompt
- `ConnectionStatus` - Vapi/Backend/Mic status badges

**ConversationStep Components (`/ConversationStep/`):**
- `ConversationHeader` - Timer, status badges, end call button
- `SpeakingIndicator` - Animated avatars showing who is speaking
- `MessageBubble` - Individual message display
- `MessagePanel` - Message list with auto-scroll
- `SessionSidebar` - Objective and stats display

### Phase 3: Debug Logging (PENDING)

The original component still has 145 console.log statements that should be:
1. Converted to conditional logging based on `NODE_ENV`
2. Removed for production builds
3. Replaced with structured logging utility

## File Structure

```
/components/speaking/vapi/
├── index.ts              # Main exports
├── types.ts              # TypeScript interfaces
├── constants.ts          # LEVELS, DOMAINS, CONFIG
├── README.md             # This file
├── hooks/
│   ├── index.ts
│   ├── useVapiSDK.ts
│   ├── useMicrophonePermission.ts
│   ├── useBackendAPI.ts
│   ├── useSessionTimer.ts
│   ├── useSessionRecovery.ts
│   └── useVapiCall.ts
└── components/
    ├── index.ts
    ├── shared/
    │   ├── index.ts
    │   ├── LoadingOverlay.tsx
    │   ├── ErrorState.tsx
    │   └── MicPermissionDialog.tsx
    ├── SetupStep/
    │   ├── index.ts
    │   ├── UserProfileCard.tsx
    │   ├── LevelSelector.tsx
    │   ├── DomainSelector.tsx
    │   ├── ConfigCard.tsx
    │   ├── RecoveryDialog.tsx
    │   └── ConnectionStatus.tsx
    └── ConversationStep/
        ├── index.ts
        ├── ConversationHeader.tsx
        ├── SpeakingIndicator.tsx
        ├── MessageBubble.tsx
        ├── MessagePanel.tsx
        └── SessionSidebar.tsx
```

## Usage Example

```typescript
import {
  // Types
  VapiConfig, UserProfile, ConversationMessage,

  // Constants
  LEVELS, DOMAINS, DEFAULT_CONFIG,

  // Hooks
  useVapiSDK,
  useMicrophonePermission,
  useBackendAPI,
  useSessionTimer,
  useSessionRecovery,
  useVapiCall,

  // Components
  UserProfileCard,
  LevelSelector,
  DomainSelector,
  ConversationHeader,
  MessagePanel,
} from '@/components/speaking/vapi';
```

## Next Steps

1. **Integration**: Update `VapiConversationPractice.tsx` to use the new hooks and components
2. **Testing**: Test each hook and component in isolation
3. **Cleanup**: Remove debug logs and implement structured logging
4. **Documentation**: Add JSDoc comments to public APIs

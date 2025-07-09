# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Local Development
```bash
# Start development server (frontend only)
npm run dev

# Start mock backend server
npm run dev:mock

# Start both frontend and mock backend together
npm run dev:full

# Start with Netlify dev (recommended for voice features)
npm run dev:netlify
```

### Build & Deploy
```bash
# Build for production
npm run build

# Type check
npm run type-check

# Build for production (build-only)
npm run build-only

# Preview production build
npm run preview
```

### Code Quality
```bash
# Run ESLint with auto-fix
npm run lint

# Format code with Prettier
npm run format
```

## Architecture Overview

### Core Technologies
- **Frontend**: Vue 3 with Composition API, TypeScript, TailwindCSS
- **State Management**: Pinia stores for reactive state
- **Build Tool**: Vite for fast development and building
- **Backend**: Netlify Functions for serverless API endpoints
- **Database**: MongoDB for persistent storage (optional in dev)
- **Voice**: OpenAI Whisper API for voice transcription

### Key Architecture Patterns

**Device-Based Authentication**: Uses device fingerprinting instead of traditional auth
- Device fingerprint generated from browser/device characteristics (`src/utils/deviceFingerprint.ts`)
- SHA-256 hash of fingerprint stored as device ID
- No user registration/login required

**Mobile-First Design**: Entire app optimized for mobile devices
- `src/components/MobileLayout.vue` provides main mobile container
- Touch-optimized UI with 44px+ touch targets
- PWA capabilities for app-like experience

**Offline-First Architecture**: Works without internet connection
- Local storage as primary data source
- Optional cloud sync when available
- Graceful degradation when APIs unavailable

**Multi-Modal Todo Creation**: Three input methods
- **Text**: Traditional text input
- **Voice**: Audio recording with OpenAI Whisper transcription
- **Image**: Photo upload with automatic text generation

### Store Architecture (Pinia)

**todoStore**: Main todo management
- CRUD operations for todos
- Auto-sync with cloud when enabled
- Haptic feedback integration
- Statistics and filtering

**deviceStore**: Device identity management
- Device fingerprinting and ID generation
- Data usage tracking
- Device reset functionality

**settingsStore**: User preferences
- Theme management (light/dark/system)
- Feature toggles (voice, image, haptic)
- Data retention settings

### API Integration

**Netlify Functions** (`netlify/functions/`):
- `transcribe-audio.ts`: OpenAI Whisper voice transcription
- `get-device-data.ts`: Retrieve device data from MongoDB
- `update-device-data.ts`: Save device data to MongoDB
- `delete-device-data.ts`: Delete all device data
- `get-data-usage.ts`: Get storage usage statistics

**API Client** (`src/utils/api.ts`):
- Handles all API communication
- Automatic dev/prod endpoint switching
- Type-safe request/response handling
- Error handling and retries

### Data Flow

1. **App Initialization**: Device fingerprint generated → Device ID created → Data loaded from API
2. **Todo Creation**: User input → Local store update → Haptic feedback → Optional cloud sync
3. **Voice Recording**: Microphone → MediaRecorder → Audio blob → OpenAI API → Text transcription
4. **Data Persistence**: Local storage (immediate) + MongoDB (when available)

## Development Environment Setup

### Required Environment Variables
```bash
# For voice transcription (optional)
OPENAI_API_KEY=sk-your-openai-key

# For cloud storage (optional)
MONGODB_URI=mongodb://connection-string
MONGODB_DB_NAME=voice_todo_app
```

### Development Modes

**Mock Mode** (`npm run dev:full`):
- Frontend: http://localhost:5173
- Mock backend: http://localhost:8888
- Voice transcription: Mock responses only
- No external services required

**Netlify Dev Mode** (`npm run dev:netlify`):
- Full-stack development with real functions
- Voice transcription works with OpenAI API
- All features enabled

## Testing Voice Features

Voice recording requires:
1. HTTPS connection (use `npm run dev:netlify` for local SSL)
2. Microphone permissions
3. OpenAI API key for real transcription
4. Modern browser with MediaRecorder API support

## Component Architecture

### UI Components (`src/components/ui/`)
- Reusable components following shadcn/ui patterns
- Consistent styling with TailwindCSS
- Mobile-optimized touch interactions

### Layout Components
- `MobileLayout.vue`: Main app container with header/footer
- `AudioPlayer.vue`: Custom audio playback controls
- Icon components in `src/components/icons/`

## Type Definitions

All types defined in `src/types/`:
- `todo.ts`: Todo item structure and operations
- `device.ts`: Device fingerprinting and data usage
- `settings.ts`: User preferences and configuration

## Database Schema

MongoDB collection `devices`:
```javascript
{
  deviceId: "sha256_hash",
  todos: [Todo[]],
  settings: UserSettings,
  createdAt: Date,
  lastAccessed: Date
}
```

## Performance Optimizations

- **Lazy Loading**: Components loaded on demand
- **Virtual Scrolling**: For large todo lists
- **Image Optimization**: Automatic compression and resizing
- **Bundle Splitting**: Separate chunks for better caching
- **PWA Caching**: Service worker for offline functionality

## Security Considerations

- Device fingerprinting for privacy-preserving auth
- No personal data collection
- Audio/image data stored as data URLs (no external storage)
- CORS properly configured for API endpoints
- API keys securely stored in environment variables
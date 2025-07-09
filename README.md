# Voice Todo App

A mobile-first Vue.js todo application with voice input, image upload, and device-based multi-user support. Built for one-click deployment to Netlify.

## Features

- 📱 **Mobile-Only Design** - 100% optimized for mobile usage
- 🎤 **Voice Input** - Add todos using OpenAI Whisper API
- 📸 **Image Upload** - Attach images to your todos
- 🔒 **Device-Based Auth** - No login required, uses device fingerprinting
- 🌙 **Dark/Light Mode** - System-aware theme switching
- 💾 **Auto-Sync** - Automatic cloud synchronization
- 🔄 **Offline-Ready** - PWA capabilities
- 📊 **Data Management** - Export and reset functionality

## Tech Stack

- **Frontend**: Vue 3, TypeScript, TailwindCSS, Pinia
- **Backend**: Netlify Functions, MongoDB
- **Voice**: OpenAI Whisper API
- **Deployment**: Netlify (one-click deploy)

## Quick Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/ayalpani/dump-app)

## Manual Setup

### Prerequisites

- Node.js 18+
- MongoDB database (or Netlify MongoDB)
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd voice-todo-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
OPENAI_API_KEY=your_openai_api_key_here
MONGODB_URI=your_mongodb_connection_string_here
MONGODB_DB_NAME=dump_app
```

4. Run development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Netlify Deployment

### Environment Variables

Set these in your Netlify dashboard under Site Settings > Environment Variables:

- `OPENAI_API_KEY` - Your OpenAI API key for Whisper
- `MONGODB_URI` - MongoDB connection string
- `MONGODB_DB_NAME` - Database name (default: dump_app)

### Build Settings

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions`

## Database Schema

The app uses a simple MongoDB collection called `devices`:

```javascript
{
  deviceId: "sha256_hash_of_device_fingerprint",
  todos: [
    {
      id: "todo_timestamp_random",
      text: "Todo text",
      completed: false,
      createdAt: Date,
      createdVia: "text" | "voice" | "image",
      imageUrl?: "url_to_image",
      audioUrl?: "url_to_audio",
      deviceId: "device_hash"
    }
  ],
  settings: {
    theme: "light" | "dark" | "system",
    voiceEnabled: boolean,
    imageEnabled: boolean,
    hapticFeedback: boolean,
    autoSync: boolean,
    dataRetention: "30days" | "90days" | "forever"
  },
  createdAt: Date,
  lastAccessed: Date
}
```

## API Endpoints

### Netlify Functions

- `POST /.netlify/functions/get-device-data` - Get device data
- `POST /.netlify/functions/update-device-data` - Update device data
- `POST /.netlify/functions/delete-device-data` - Delete all device data
- `POST /.netlify/functions/get-data-usage` - Get storage usage stats
- `POST /.netlify/functions/transcribe-audio` - Transcribe audio to text
- `POST /.netlify/functions/upload-media` - Upload images/audio

## Device-Based Authentication

The app uses device fingerprinting instead of traditional authentication:

1. **Device Fingerprint**: Generated from browser/device characteristics
2. **SHA-256 Hash**: Fingerprint is hashed for privacy
3. **Local Storage**: Hash stored locally as backup
4. **Database Key**: Hash used as primary key in MongoDB

This provides:
- ✅ No registration/login required
- ✅ Automatic multi-device sync per device
- ✅ Privacy-focused (no personal data)
- ✅ Works offline-first

## Mobile Optimizations

- **Touch Targets**: Minimum 44px for accessibility
- **Viewport**: Optimized for mobile screens only
- **Gestures**: Swipe actions for todo management
- **Haptic Feedback**: Native vibration support
- **PWA**: Installable as native app
- **Safe Areas**: iOS notch/home indicator support

## Development

### Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── icons/           # SVG icon components
│   └── MobileLayout.vue # Main mobile layout
├── stores/              # Pinia stores
├── types/               # TypeScript definitions
├── utils/               # Utility functions
└── lib/                 # Shared libraries

netlify/
└── functions/           # Serverless functions
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review the code comments

---

Built with ❤️ for mobile-first productivity

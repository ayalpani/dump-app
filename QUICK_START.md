# Quick Start Guide - No External Services Required

This guide will get your todo-voice-app running locally without needing OpenAI API keys, MongoDB, or Netlify services.

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
cd todo-voice-app
npm install
```

### 2. Start the App with Mock Backend
```bash
# Option A: Start both frontend and mock backend together
npm run dev:full

# Option B: Start them separately (in different terminals)
npm run dev:mock    # Terminal 1: Mock backend server
npm run dev         # Terminal 2: Frontend development server
```

### 3. Open Your Browser
- Frontend: http://localhost:5173
- Mock API: http://localhost:8888

## ✅ What Works Without External Services

- ✅ **Basic Todo Management** - Add, edit, delete, complete todos
- ✅ **Device-Based Storage** - Each device gets its own todo list
- ✅ **Settings Management** - Theme, preferences, etc.
- ✅ **Mobile-First UI** - Fully responsive design
- ✅ **Data Export/Import** - Backup and restore functionality
- ✅ **Offline-First** - Works without internet connection

## ❌ What's Disabled (Requires External Services)

- ❌ **Voice Input** - Requires OpenAI API key
- ❌ **Image Upload** - Requires Netlify Blobs storage
- ❌ **Cloud Sync** - Requires MongoDB database

## 🔧 Adding External Services Later

### For Voice Features (OpenAI)
1. Get an OpenAI API key from https://platform.openai.com/
2. Add to `.env`: `OPENAI_API_KEY=your_key_here`
3. Deploy to Netlify or add transcription function

### For Cloud Storage (MongoDB)
1. Create a free MongoDB Atlas account
2. Get connection string
3. Add to `.env`: `MONGODB_URI=your_connection_string`

### For Image Upload (Netlify)
1. Deploy to Netlify
2. Enable Netlify Blobs
3. Add token to environment variables

## 📱 Mobile Testing

The app is designed for mobile devices. To test:

1. **Chrome DevTools**: Open DevTools → Toggle device toolbar → Select mobile device
2. **Local Network**: Access via your phone using your computer's IP
   ```bash
   # Find your IP address
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Then access: http://YOUR_IP:5173
   ```

## 🛠 Development Commands

```bash
npm run dev          # Start frontend only
npm run dev:mock     # Start mock backend only  
npm run dev:full     # Start both frontend and backend
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run linter
npm run format       # Format code
```

## 📂 Project Structure

```
todo-voice-app/
├── src/
│   ├── components/     # Vue components
│   ├── stores/         # Pinia state management
│   ├── utils/          # Utility functions
│   └── types/          # TypeScript definitions
├── netlify/functions/  # Serverless functions (for production)
├── mock-server.js      # Local development server
└── .env               # Environment variables
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8888
lsof -ti:8888 | xargs kill -9

# Or change port in mock-server.js
const PORT = 8889; // Change this line
```

### CORS Issues
The mock server includes CORS headers. If you still have issues, try:
- Clear browser cache
- Use incognito/private mode
- Check browser console for errors

### Module Not Found
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## 🎯 Next Steps

1. **Test Basic Functionality** - Add/edit/delete todos
2. **Explore Settings** - Try different themes and options
3. **Test Mobile View** - Use browser dev tools
4. **Add External Services** - When ready for voice/cloud features

---

**Need Help?** Check the main README.md for full documentation or create an issue on GitHub.

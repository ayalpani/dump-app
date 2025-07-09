# Voice Transcription Setup

This guide explains how to enable real voice transcription using OpenAI Whisper API.

## Current Status

✅ **Voice Recording** - Working (records audio from microphone)  
✅ **Audio Playback** - Working (audio player with controls)  
⚠️ **Voice Transcription** - Mock mode (shows placeholder text)

## Enable Real Transcription

To enable actual voice-to-text transcription:

### 1. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-...`)

### 2. Add API Key to Environment

Add your OpenAI API key to the `.env` file:

```bash
# Add this line to your .env file
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### 3. Deploy or Test Locally

**For Local Testing:**
- The Netlify functions will work in development mode
- Voice recordings will be transcribed using OpenAI Whisper

**For Production:**
- Deploy to Netlify
- Add the `OPENAI_API_KEY` environment variable in Netlify dashboard
- Voice transcription will work in production

## How It Works

1. **Record Audio** - Click Voice button to start/stop recording
2. **Process Audio** - Audio is converted to data URL for storage
3. **Transcribe** - Audio is sent to OpenAI Whisper API for transcription
4. **Create Todo** - Both transcribed text AND audio are saved
5. **Playback** - Audio player allows you to replay the original recording

## Features

- ✅ Real-time voice recording with visual feedback
- ✅ Audio storage as data URLs (no external storage needed)
- ✅ OpenAI Whisper transcription (when API key provided)
- ✅ Fallback to timestamp if transcription fails
- ✅ Audio player with play/pause, seek, and duration
- ✅ Mobile-optimized recording interface

## Fallback Behavior

Without OpenAI API key:
- Voice recording still works
- Audio is still saved and playable
- Text shows "Voice note recorded at [time]" instead of transcription
- All other functionality remains the same

## Cost Considerations

OpenAI Whisper API pricing (as of 2024):
- $0.006 per minute of audio
- Very affordable for personal use
- Example: 100 minutes of voice notes = ~$0.60

## Troubleshooting

**Recording not working?**
- Check microphone permissions in browser
- Ensure HTTPS (required for microphone access)

**Transcription not working?**
- Verify OpenAI API key is correct
- Check browser console for errors
- Ensure API key has sufficient credits

**Audio not playing?**
- Check browser audio permissions
- Verify audio format support (WebM)

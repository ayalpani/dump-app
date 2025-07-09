import {Handler} from '@netlify/functions'
import OpenAI from 'openai'

const handler: Handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({error: 'Method not allowed'}),
    }
  }

  try {
    const openaiApiKey = process.env.OPENAI_API_KEY

    if (!openaiApiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'OpenAI API key not configured',
          fallbackText: `Voice note recorded at ${ new Date().toLocaleTimeString() }`
        }),
      }
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: openaiApiKey,
    })

    // Parse multipart form data to get the audio file
    const contentType = event.headers['content-type'] || ''

    if (!contentType.includes('multipart/form-data')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({error: 'Expected multipart/form-data'}),
      }
    }

    // Parse the multipart form data to extract audio file
    const boundary = contentType.split('boundary=')[1]
    if (!boundary) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({error: 'Missing boundary in multipart data'}),
      }
    }

    // Get the raw body as buffer
    const body = event.body || ''
    const isBase64 = event.isBase64Encoded
    const buffer = isBase64 ? Buffer.from(body, 'base64') : Buffer.from(body, 'utf8')

    // Parse multipart data to extract audio file
    const boundaryBuffer = Buffer.from(`--${ boundary }`)
    const parts: Buffer[] = []
    let start = 0

    while (true) {
      const boundaryIndex = buffer.indexOf(boundaryBuffer, start)
      if (boundaryIndex === -1) break

      if (start > 0) {
        parts.push(buffer.slice(start, boundaryIndex))
      }
      start = boundaryIndex + boundaryBuffer.length
    }

    let audioBuffer: Buffer | null = null

    for (const part of parts) {
      const partStr = part.toString('utf8')
      if (partStr.includes('Content-Disposition: form-data; name="audio"')) {
        // Find the end of headers (double CRLF)
        const headerEnd = part.indexOf('\r\n\r\n')
        if (headerEnd !== -1) {
          // Extract binary data after headers
          audioBuffer = part.slice(headerEnd + 4)
          // Remove any trailing CRLF
          if (audioBuffer && audioBuffer.length >= 2 && audioBuffer[audioBuffer.length - 2] === 0x0D && audioBuffer[audioBuffer.length - 1] === 0x0A) {
            audioBuffer = audioBuffer.slice(0, -2)
          }
          break
        }
      }
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({error: 'No audio data found or empty audio file'}),
      }
    }

    // Validate audio buffer has reasonable size (at least 1KB, max 25MB)
    if (audioBuffer.length < 1024) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({error: 'Audio file too small'}),
      }
    }

    if (audioBuffer.length > 25 * 1024 * 1024) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({error: 'Audio file too large (max 25MB)'}),
      }
    }

    // Create a File-like object from the buffer
    const audioFile = new File([audioBuffer], 'recording.webm', {
      type: 'audio/webm',
    })

    // Use OpenAI SDK for transcription
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
    })

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({text: transcription.text}),
    }

  } catch (error) {
    console.error('Error transcribing audio:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        fallbackText: `Voice note recorded at ${ new Date().toLocaleTimeString() }`
      }),
    }
  }
}

export {handler}

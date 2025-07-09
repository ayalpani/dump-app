import {Handler} from '@netlify/functions'
import {MongoClient} from 'mongodb'

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
    const {deviceId} = JSON.parse(event.body || '{}')

    if (!deviceId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({error: 'Device ID is required'}),
      }
    }

    const mongoUri = process.env.MONGODB_URI
    const dbName = process.env.MONGODB_DB_NAME || 'voice_todo_app'

    if (!mongoUri) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({error: 'Database configuration missing'}),
      }
    }

    const client = new MongoClient(mongoUri)
    await client.connect()

    const db = client.db(dbName)
    const collection = db.collection('devices')

    const deviceData = await collection.findOne({deviceId})

    await client.close()

    if (!deviceData) {
      // Return default usage for new devices
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          totalTodos: 0,
          totalImages: 0,
          totalAudioFiles: 0,
          storageUsed: '0 KB',
          lastSync: new Date().toISOString(),
        }),
      }
    }

    const todos = deviceData.todos || []
    const totalTodos = todos.length
    const totalImages = todos.filter((todo: any) => todo.imageUrl).length
    const totalAudioFiles = todos.filter((todo: any) => todo.audioUrl).length

    // Rough storage calculation (this would be more accurate with actual file sizes)
    const estimatedStorage = totalTodos * 100 + totalImages * 50000 + totalAudioFiles * 100000 // bytes
    const storageUsed = formatBytes(estimatedStorage)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        totalTodos,
        totalImages,
        totalAudioFiles,
        storageUsed,
        lastSync: deviceData.lastAccessed || new Date().toISOString(),
      }),
    }
  } catch (error) {
    console.error('Error fetching data usage:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({error: 'Internal server error'}),
    }
  }
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export {handler}

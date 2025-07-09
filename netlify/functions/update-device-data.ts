import {Handler} from '@netlify/functions'
import {MongoClient} from 'mongodb'

const handler: Handler = async (event) => {
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

  let client: MongoClient | null = null

  try {
    const {deviceId, todos, settings} = JSON.parse(event.body || '{}')

    if (!deviceId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({error: 'Device ID is required'}),
      }
    }

    if (!todos || !settings) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({error: 'Todos and settings are required'}),
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

    // Create client with timeout options
    client = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 5000, // 5 seconds
      connectTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 10000, // 10 seconds
    })

    // Connect with timeout
    await Promise.race([
      client.connect(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout')), 8000)
      )
    ])

    const db = client.db(dbName)
    const collection = db.collection('devices')

    const now = new Date()

    const deviceData = {
      deviceId,
      todos,
      settings,
      lastAccessed: now,
    }

    // Upsert the device data with timeout
    const result = await Promise.race([
      collection.updateOne(
        {deviceId},
        {
          $set: deviceData,
          $setOnInsert: {createdAt: now},
        },
        {upsert: true}
      ),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Update timeout')), 5000)
      )
    ])

    // Type guard to ensure result is from MongoDB operation
    const isUpdateResult = (res: unknown): res is {upsertedCount: number; modifiedCount: number} => {
      return res !== null && typeof res === 'object' && 'upsertedCount' in res && 'modifiedCount' in res
    }

    if (!isUpdateResult(result)) {
      throw new Error('Invalid result from database operation')
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        upserted: result.upsertedCount > 0,
        modified: result.modifiedCount > 0,
      }),
    }
  } catch (error) {
    console.error('Error updating device data:', error)

    // Return specific error messages for timeouts
    const errorMessage = error instanceof Error && error.message.includes('timeout')
      ? 'Database operation timed out'
      : 'Internal server error'

    return {
      statusCode: error instanceof Error && error.message.includes('timeout') ? 408 : 500,
      headers,
      body: JSON.stringify({error: errorMessage}),
    }
  } finally {
    // Always close the connection
    if (client) {
      try {
        await client.close()
      } catch (closeError) {
        console.error('Error closing MongoDB connection:', closeError)
      }
    }
  }
}

export {handler}

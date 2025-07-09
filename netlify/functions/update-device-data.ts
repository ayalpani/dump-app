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

    const client = new MongoClient(mongoUri)
    await client.connect()

    const db = client.db(dbName)
    const collection = db.collection('devices')

    const now = new Date()

    const deviceData = {
      deviceId,
      todos,
      settings,
      lastAccessed: now,
    }

    // Upsert the device data
    const result = await collection.updateOne(
      {deviceId},
      {
        $set: deviceData,
        $setOnInsert: {createdAt: now},
      },
      {upsert: true}
    )

    await client.close()

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
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({error: 'Internal server error'}),
    }
  }
}

export {handler}

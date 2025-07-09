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
    const {deviceId} = JSON.parse(event.body || '{}')

    if (!deviceId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({error: 'Device ID is required'}),
      }
    }

    const mongoUri = process.env.MONGODB_URI
    const dbName = process.env.MONGODB_DB_NAME || 'dump_app'

    if (!mongoUri) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({error: 'Database configuration missing'}),
      }
    }

    // Create client with enhanced connection options
    client = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      maxPoolSize: 10,
      retryWrites: true,
      retryReads: true,
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

    // Add timeout to the find operation
    const deviceData = await Promise.race([
      collection.findOne({deviceId}),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout')), 5000)
      )
    ])

    if (!deviceData) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({error: 'Device not found'}),
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(deviceData),
    }
  } catch (error) {
    console.error('Error fetching device data:', error)

    // Enhanced error handling for authorization issues
    if (error instanceof Error) {
      if (error.message.includes('not authorized') || error.message.includes('Unauthorized')) {
        console.error('MongoDB Authorization Error - Check database permissions')
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({
            error: 'Database authorization failed',
            details: 'MongoDB user lacks permissions for the dump_app database'
          }),
        }
      }

      if (error.message.includes('timeout')) {
        return {
          statusCode: 408,
          headers,
          body: JSON.stringify({error: 'Database operation timed out'}),
        }
      }
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({error: 'Internal server error'}),
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

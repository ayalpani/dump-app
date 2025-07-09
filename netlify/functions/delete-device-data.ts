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

    const client = new MongoClient(mongoUri)
    await client.connect()

    const db = client.db(dbName)
    const collection = db.collection('devices')

    const result = await collection.deleteOne({deviceId})

    await client.close()

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        deleted: result.deletedCount > 0,
      }),
    }
  } catch (error) {
    console.error('Error deleting device data:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({error: 'Internal server error'}),
    }
  }
}

export {handler}

import {Handler} from '@netlify/functions'

const handler: Handler = async (event) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    }
  }

  try {
    const timestamp = new Date().toISOString()
    const method = event.httpMethod
    const path = event.path
    const userAgent = event.headers['user-agent'] || 'Unknown'

    // Get environment info (without sensitive data)
    const nodeVersion = process.version
    const platform = process.platform
    const arch = process.arch

    // Check if MongoDB environment variables are present (without exposing values)
    const hasMongoUri = !!process.env.MONGODB_URI
    const hasMongoDbName = !!process.env.MONGODB_DB_NAME

    const response = {
      status: 'success',
      message: 'Netlify function is working!',
      timestamp,
      request: {
        method,
        path,
        userAgent: userAgent.substring(0, 50) + '...' // Truncate for security
      },
      environment: {
        nodeVersion,
        platform,
        arch,
        hasMongoUri,
        hasMongoDbName
      },
      uptime: process.uptime(),
      memoryUsage: {
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response, null, 2),
    }
  } catch (error) {
    console.error('Ping function error:', error)

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        status: 'error',
        message: 'Ping function failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, null, 2),
    }
  }
}

export {handler}

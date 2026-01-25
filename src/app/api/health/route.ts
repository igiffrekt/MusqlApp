import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Basic health check
    const uptime = process.uptime()
    const memoryUsage = process.memoryUsage()
    const timestamp = new Date().toISOString()

    // Database connectivity check
    let dbStatus = 'healthy'
    let dbResponseTime = 0

    try {
      const startTime = Date.now()
      await prisma.$queryRaw`SELECT 1`
      dbResponseTime = Date.now() - startTime
    } catch (error) {
      dbStatus = 'unhealthy'
      console.error('Database health check failed:', error)
    }

    // Environment info (safe to expose)
    const environment = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      environment: process.env.NODE_ENV || 'development',
    }

    // Service status
    const services = {
      database: {
        status: dbStatus,
        responseTime: dbResponseTime,
      },
      application: {
        status: 'healthy',
        uptime: Math.floor(uptime),
        memoryUsage: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        },
      },
    }

    // Check if any critical services are down
    const overallStatus = Object.values(services).every(service =>
      service.status === 'healthy'
    ) ? 'healthy' : 'degraded'

    const response = {
      status: overallStatus,
      timestamp,
      version: process.env.npm_package_version || '1.0.0',
      environment,
      services,
    }

    // Return appropriate HTTP status
    const httpStatus = overallStatus === 'healthy' ? 200 : 503

    return NextResponse.json(response, { status: httpStatus })
  } catch (error) {
    console.error('Health check failed:', error)

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    }, { status: 503 })
  }
}

// Also support HEAD requests for load balancer health checks
export async function HEAD(request: NextRequest) {
  try {
    // Quick database check
    await prisma.$queryRaw`SELECT 1`
    return new NextResponse(null, { status: 200 })
  } catch (error) {
    return new NextResponse(null, { status: 503 })
  }
}
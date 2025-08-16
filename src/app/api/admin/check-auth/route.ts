import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No admin token' }, { status: 401 });
    }
    
    // Verify JWT token
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    
    // Check if user is admin
    if (decoded.role !== 'ADMIN' || decoded.type !== 'admin') {
      return NextResponse.json({ error: 'Not an admin user' }, { status: 403 });
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        displayName: decoded.displayName,
        role: decoded.role,
      },
    });
    
  } catch (error: any) {
    logger.error('Admin auth check failed', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    
    return NextResponse.json({ error: 'Auth check failed' }, { status: 500 });
  }
}
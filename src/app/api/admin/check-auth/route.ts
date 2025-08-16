import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value;
    
    logger.info('Admin auth check', { hasToken: !!token });
    
    if (!token) {
      logger.warn('No admin token found in cookies');
      return NextResponse.json({ error: 'No admin token' }, { status: 401 });
    }
    
    // Verify JWT token
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    
    logger.info('Admin token decoded', { 
      userId: decoded.userId, 
      role: decoded.role, 
      type: decoded.type,
      email: decoded.email 
    });
    
    // Check if user is admin
    if (decoded.role !== 'ADMIN' || decoded.type !== 'admin') {
      logger.warn('Token validation failed', { 
        role: decoded.role, 
        type: decoded.type,
        isAdminRole: decoded.role === 'ADMIN',
        isAdminType: decoded.type === 'admin'
      });
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
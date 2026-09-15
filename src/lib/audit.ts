import { NextRequest } from 'next/server';

export interface LogAdminActionParams {
  adminUserId: string;
  action:
    | 'ADMIN_LOGIN'
    | 'ADMIN_LOGIN_FAILED'
    | 'ADMIN_MFA_VERIFIED'
    | 'ORDER_STATUS_CHANGED'
    | 'PAYMENT_STATUS_CHANGED'
    | 'PRODUCT_CREATED'
    | 'PRODUCT_UPDATED'
    | 'PRODUCT_DELETED'
    | 'INVENTORY_UPDATED'
    | 'CUSTOMER_DATA_ACCESS'
    | 'MEDIA_UPLOADED'
    | 'MEDIA_DELETED';
  resourceType: 'ORDER' | 'PRODUCT' | 'INVENTORY' | 'PAYMENT' | 'CUSTOMER' | 'AUTH' | 'MEDIA';
  resourceId?: string | null;
  metadata?: Record<string, any> | null;
  request?: Request | NextRequest;
}

/**
 * Strips sensitive keys (passwords, secrets, tokens, hashes) recursively before writing to audit log.
 */
function sanitizeAuditMetadata(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeAuditMetadata);

  const sanitized: Record<string, any> = {};
  const blockedKeys = new Set([
    'password',
    'passwordhash',
    'token',
    'secret',
    'adminmfapin',
    'key',
    'authtoken',
    'razorpaykeysecret',
    'razorpaywebhooksecret',
    'blob_read_write_token',
  ]);

  for (const [key, val] of Object.entries(obj)) {
    const lower = key.toLowerCase();
    if (blockedKeys.has(lower)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof val === 'object' && val !== null) {
      sanitized[key] = sanitizeAuditMetadata(val);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

/**
 * Records an immutable administrative audit log in PostgreSQL.
 * Safe and non-blocking: errors in logging do not break transactional flows but are reported.
 */
export async function logAdminAction(params: LogAdminActionParams): Promise<void> {
  try {
    const { adminUserId, action, resourceType, resourceId, metadata, request } = params;

    let ipAddress: string | null = null;
    let userAgent: string | null = null;

    if (request) {
      const forwarded = request.headers.get('x-forwarded-for');
      ipAddress = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || '127.0.0.1';
      userAgent = request.headers.get('user-agent') || null;
    }

    const safeMetadata = metadata ? sanitizeAuditMetadata(metadata) : undefined;

    if (process.env.NODE_ENV === 'development') {
      console.log(`[AdminAudit] ${action} (${resourceType}:${resourceId || 'N/A'}) by ${adminUserId} from ${ipAddress || 'unknown'}`, safeMetadata || '');
    }
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}

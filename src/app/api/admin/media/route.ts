import { NextResponse } from 'next/server';
import { listBlobMedia, deleteFromBlob } from '@/lib/blob';
import { requireAdminUser } from '@/lib/auth';
import { jsonError, jsonSuccess } from '@/lib/validation';
import { logAdminAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await requireAdminUser(request);
    if (auth.status !== 200) {
      return jsonError(auth.error || 'Unauthorized', auth.status);
    }

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || undefined;
    const productId = searchParams.get('productId') || undefined;

    const result = await listBlobMedia(folder === 'ALL' ? undefined : folder, productId);

    return jsonSuccess({
      isBlobConfigured: result.isBlobConfigured,
      storeName: result.storeName,
      images: result.images,
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/media:', error);
    return jsonError('Failed to fetch media assets.', 500);
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdminUser(request);
    if (auth.status !== 200 || !auth.user) {
      return jsonError(auth.error || 'Unauthorized', auth.status);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const url = searchParams.get('url');

    const target = id || url;
    if (!target) {
      return jsonError('Image ID or URL is required for deletion.', 400);
    }

    const result = await deleteFromBlob(target);

    await logAdminAction({
      adminUserId: auth.user.id,
      action: 'MEDIA_DELETED',
      resourceType: 'MEDIA',
      resourceId: target,
      metadata: { target },
      request,
    });

    return jsonSuccess(result);
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/media:', error);
    return jsonError(error.message || 'Failed to delete image.', 500);
  }
}

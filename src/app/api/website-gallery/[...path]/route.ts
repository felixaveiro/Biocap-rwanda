import { NextResponse } from 'next/server';

const API_ORIGIN = 'https://gallery.afs-rwanda.org';
const WEBSITE_ID = '5094888c-fce8-43b5-9560-0c8779416616';

type RouteContext = { params: Promise<{ path: string[] }> };

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: RouteContext) {
  const token = process.env.GALLERY_API_TOKEN;
  if (!token) {
    return NextResponse.json({ message: 'Gallery service is not configured.' }, { status: 503 });
  }

  const { path } = await params;
  const [resource, slug, child] = path;
  let upstreamPath: string;

  if (resource === 'collections' && !slug && path.length === 1) {
    upstreamPath = `/api/admin/websites/${WEBSITE_ID}/collections`;
  } else if (
    resource === 'collections' &&
    slug &&
    /^[a-z0-9-]+$/i.test(slug) &&
    path.length === 2
  ) {
    upstreamPath = `/api/v1/collections/${encodeURIComponent(slug)}`;
  } else if (
    resource === 'collections' &&
    slug &&
    /^[a-z0-9-]+$/i.test(slug) &&
    child === 'media' &&
    path.length === 3
  ) {
    upstreamPath = `/api/v1/collections/${encodeURIComponent(slug)}/media`;
  } else {
    return NextResponse.json({ message: 'Unknown gallery resource.' }, { status: 404 });
  }

  try {
    const upstream = await fetch(`${API_ORIGIN}${upstreamPath}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      cache: 'no-store',
    });
    const payload = await upstream.json().catch(() => null);
    if (!upstream.ok) {
      return NextResponse.json(
        { message: 'Gallery service request failed.' },
        { status: upstream.status }
      );
    }
    return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ message: 'Could not reach the gallery service.' }, { status: 502 });
  }
}

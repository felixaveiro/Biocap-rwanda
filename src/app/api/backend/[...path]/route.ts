import { NextResponse } from "next/server";

const LOCAL_API_ORIGIN =
  process.env.LOCAL_API_ORIGIN || "http://localhost:5000";
const DEPLOYED_API_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL || "https://biocapapi.afs-rwanda.org";
const PROXY_PREFIX = "/api/backend";

export const dynamic = "force-dynamic";

async function proxyApiRequest(request: Request): Promise<Response> {
  const incomingUrl = new URL(request.url);
  const endpoint = incomingUrl.pathname.slice(PROXY_PREFIX.length) + incomingUrl.search;
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  try {
    return await fetch(`${LOCAL_API_ORIGIN}${endpoint}`, init);
  } catch (error) {
    console.warn(
      `Local API at ${LOCAL_API_ORIGIN} is unavailable; falling back to the deployed API.`,
      error
    );
  }

  try {
    return await fetch(`${DEPLOYED_API_ORIGIN.replace(/\/+$/, "")}${endpoint}`, init);
  } catch (error) {
    console.error("Both local and deployed API requests failed.", error);
    return NextResponse.json(
      { message: "Could not reach the local or deployed API." },
      { status: 502 }
    );
  }
}

export const GET = proxyApiRequest;
export const POST = proxyApiRequest;
export const PUT = proxyApiRequest;
export const PATCH = proxyApiRequest;
export const DELETE = proxyApiRequest;

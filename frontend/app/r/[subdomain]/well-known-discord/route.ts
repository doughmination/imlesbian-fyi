import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4071";

type Params = Promise<{ subdomain: string }>;

export async function GET(_request: Request, { params }: { params: Params }) {
  const { subdomain } = await params;

  const res = await fetch(
    `${API_URL}/subdomains/verify/${encodeURIComponent(subdomain)}`,
    // Discord (and anyone re-verifying) should always see the current
    // value — never cache this at the edge or in the browser.
    { cache: "no-store" }
  );

  if (!res.ok) {
    return new NextResponse("Not found", { status: 404 });
  }

  const body = await res.text();

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

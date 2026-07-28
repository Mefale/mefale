import { revalidatePath, revalidateTag as _revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const revalidateTag = _revalidateTag as (tag: string) => void;

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidateTag("products");
  revalidatePath("/", "layout");

  return NextResponse.json({ revalidated: true, timestamp: new Date().toISOString() });
}

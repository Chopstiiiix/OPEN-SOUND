import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import { supabaseAdmin } from "@/lib/storage/supabaseAdmin";

export async function POST(req: Request) {
  await requireRole(["CREATOR", "ADMIN"]);
  const body = await req.json();

  const bucket = "audio";
  const path = String(body.path || "");
  if (!path) return NextResponse.json({ error: "MISSING_PATH" }, { status: 400 });

  const sb = supabaseAdmin();
  const { data, error } = await sb.storage.from(bucket).createSignedUploadUrl(path);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ url: data.signedUrl, path: data.path, bucket });
}

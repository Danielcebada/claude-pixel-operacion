import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=no_code`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(`${origin}/auth/login?error=exchange_failed`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/auth/login?error=unauthorized`);
  }

  const allowedDomains = ["@digitalpixel.studio", "@pixelplay.mx"];
  const emailDomain = user.email.substring(user.email.indexOf("@"));

  if (!allowedDomains.includes(emailDomain)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/auth/login?error=unauthorized`);
  }

  const admin = createAdminClient();

  const { data: existingUser } = await admin
    .from("users")
    .select("id, auth_id")
    .eq("email", user.email)
    .single();

  if (!existingUser) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/auth/login?error=unauthorized`);
  }

  if (!existingUser.auth_id) {
    await admin
      .from("users")
      .update({ auth_id: user.id })
      .eq("id", existingUser.id);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}

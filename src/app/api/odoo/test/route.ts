/**
 * GET /api/odoo/test
 *
 * Tests the Odoo connection. Always returns 200 so the frontend can
 * read the response cleanly.
 *
 * Required env vars:
 *   - ODOO_URL       (default: https://odoo.pixelplay.mx/odoo)
 *   - ODOO_DB        (default: pixelplay)
 *   - ODOO_USERNAME
 *   - ODOO_API_KEY
 */

import { NextResponse } from "next/server";
import { testConnection } from "@/lib/odoo/client";

export const dynamic = "force-dynamic";

interface EnvCheck {
  key: string;
  required: boolean;
  hasDefault: boolean;
}

const ENV_CHECKS: EnvCheck[] = [
  { key: "ODOO_URL", required: true, hasDefault: true },
  { key: "ODOO_DB", required: true, hasDefault: true },
  { key: "ODOO_USERNAME", required: true, hasDefault: false },
  { key: "ODOO_API_KEY", required: true, hasDefault: false },
];

export async function GET() {
  // Detect missing env vars (only those without defaults are truly required)
  const missing = ENV_CHECKS.filter(
    (c) => c.required && !c.hasDefault && !process.env[c.key]
  ).map((c) => c.key);

  if (missing.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        error: "Faltan variables de entorno para conectar con Odoo",
        missing,
      },
      { status: 200 }
    );
  }

  try {
    const result = await testConnection();
    if (result.ok && result.uid) {
      return NextResponse.json(
        { ok: true, uid: result.uid, message: "Conectado a Odoo" },
        { status: 200 }
      );
    }
    return NextResponse.json(
      {
        ok: false,
        error: result.error || "Error desconocido al autenticar con Odoo",
        missing: [],
      },
      { status: 200 }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, error: message, missing: [] },
      { status: 200 }
    );
  }
}

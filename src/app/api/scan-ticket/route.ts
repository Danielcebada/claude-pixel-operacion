import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

function getAnthropicKey(): string | undefined {
  // First try process.env
  if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== "your-anthropic-api-key-here") {
    return process.env.ANTHROPIC_API_KEY;
  }
  // Fallback: read .env.local directly
  try {
    const envPath = join(process.cwd(), ".env.local");
    const content = readFileSync(envPath, "utf-8");
    const match = content.match(/ANTHROPIC_API_KEY=(.+)/);
    if (match) return match[1].trim();
  } catch {
    // ignore
  }
  return undefined;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = getAnthropicKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY no esta configurada en .env.local" },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({ apiKey });

    const { image, mimeType } = await req.json();

    if (!image || !mimeType) {
      return NextResponse.json(
        { error: "Se requiere imagen y tipo MIME" },
        { status: 400 }
      );
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType as
                  | "image/jpeg"
                  | "image/png"
                  | "image/webp"
                  | "image/gif",
                data: image,
              },
            },
            {
              type: "text",
              text: `Analiza esta foto de un ticket o recibo de compra y extrae los datos en formato JSON estricto.

Responde UNICAMENTE con el JSON, sin texto adicional ni markdown. El formato debe ser:

{
  "fecha": "YYYY-MM-DD o null si no se lee",
  "monto_total": 0.00,
  "proveedor": "nombre del comercio/proveedor",
  "metodo_pago": "efectivo | tarjeta | transferencia | desconocido",
  "descripcion": "resumen breve de la compra en 1 linea",
  "moneda": "MXN | USD | otro",
  "items_detectados": ["item 1", "item 2"]
}

Si algun campo no es legible, usa null. El monto_total debe ser numerico sin simbolo de moneda.`,
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "No se obtuvo respuesta de texto" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(textBlock.text);

    return NextResponse.json({ data: parsed });
  } catch (error: unknown) {
    console.error("Error escaneando ticket:", error);
    const message =
      error instanceof Error ? error.message : "Error procesando el ticket";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

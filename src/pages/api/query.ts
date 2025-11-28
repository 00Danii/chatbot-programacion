export const prerender = false;

async function handleRequest({ request }: { request: any }) {
  try {
    const raw = await request.text();
    console.log("RAW BODY:", raw);

    if (!raw || !raw.trim()) {
      return new Response(JSON.stringify({ error: "Empty request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // validar que venga messages (como exige Hugging Face)
    if (!Array.isArray(data.messages) || data.messages.length === 0) {
      return new Response(
        JSON.stringify({
          detail: [
            {
              type: "missing",
              loc: ["body", "messages"],
              msg: "Field required",
              input: data,
            },
          ],
        }),
        { status: 422, headers: { "Content-Type": "application/json" } }
      );
    }

    const token = "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";
    if (!token) {
      return new Response(
        JSON.stringify({
          error: "HF_TOKEN no está configurada en el servidor",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Reenviar exactamente el payload al endpoint de HF (igual que tu ejemplo)
    const hfResponse = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    const text = await hfResponse.text();
    let payload: any;
    if (!text || text.trim().length === 0) {
      payload = { nonJsonResponse: true, status: hfResponse.status, body: "" };
    } else {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = {
          nonJsonResponse: true,
          status: hfResponse.status,
          body: text,
        };
      }
    }

    return new Response(JSON.stringify(payload), {
      status: hfResponse.ok ? 200 : hfResponse.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Export under both lowercase and uppercase names to support different runtime expectations
export { handleRequest as post, handleRequest as POST };

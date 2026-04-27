const { XBOT_KNOWLEDGE } = require("../lib/xbot-knowledge");

const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const MAX_HISTORY_MESSAGES = 10;

const parseJsonBody = (body) => {
  if (!body) {
    return {};
  }

  if (typeof body === "object") {
    return body;
  }

  try {
    return JSON.parse(body);
  } catch (error) {
    return {};
  }
};

const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
};

const normalizeHistory = (history) => {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter((item) => item && (item.role === "user" || item.role === "assistant") && typeof item.content === "string")
    .slice(-MAX_HISTORY_MESSAGES)
    .map((item) => ({
      role: item.role,
      content: item.content.trim().slice(0, 2400)
    }))
    .filter((item) => item.content.length > 0);
};

const buildInput = (history, message) => {
  const items = [
    {
      role: "system",
      content: [
        {
          type: "input_text",
          text:
            "You are Xbot, the elite support assistant for INNER VIRTUE X. Answer with calm clarity, precise support, and premium tone. Use the provided knowledge as your source of truth. If the answer is not supported by the knowledge, say that clearly and direct the user to Instagram DM at @innervirtuex."
        }
      ]
    },
    {
      role: "system",
      content: [
        {
          type: "input_text",
          text: XBOT_KNOWLEDGE
        }
      ]
    }
  ];

  history.forEach((item) => {
    items.push({
      role: item.role,
      content: [
        {
          type: "input_text",
          text: item.content
        }
      ]
    });
  });

  items.push({
    role: "user",
    content: [
      {
        type: "input_text",
        text: message
      }
    ]
  });

  return items;
};

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, {
      ok: false,
      error: "Method not allowed"
    });
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    sendJson(res, 500, {
      ok: false,
      error: "Missing OPENAI_API_KEY"
    });
    return;
  }

  const body = parseJsonBody(req.body);
  const message = String(body.message || "").trim();
  const history = normalizeHistory(body.history);

  if (!message) {
    sendJson(res, 400, {
      ok: false,
      error: "Message is required"
    });
    return;
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1",
        input: buildInput(history, message),
        temperature: 0.6,
        max_output_tokens: 300
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage =
        data?.error?.message ||
        data?.message ||
        "OpenAI request failed";

      sendJson(res, 502, {
        ok: false,
        error: errorMessage
      });
      return;
    }

    const text =
      typeof data.output_text === "string" && data.output_text.trim()
        ? data.output_text.trim()
        : "";

    if (!text) {
      sendJson(res, 502, {
        ok: false,
        error: "Xbot returned an empty response"
      });
      return;
    }

    sendJson(res, 200, {
      ok: true,
      reply: text
    });
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      error: "Unable to reach Xbot AI backend"
    });
  }
};

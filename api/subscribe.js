const BREVO_BASE_URL = "https://api.brevo.com/v3";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  res.end(JSON.stringify(payload));
};

const readListIds = () =>
  (process.env.BREVO_LIST_ID || "")
    .split(",")
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter((value) => Number.isInteger(value) && value > 0);

const createBrevoRequest = (email) => {
  const apiKey = process.env.BREVO_API_KEY;
  const listIds = readListIds();
  const doiTemplateId = Number.parseInt(process.env.BREVO_DOI_TEMPLATE_ID || "", 10);
  const redirectUrl = process.env.BREVO_REDIRECT_URL;

  if (!apiKey) {
    return {
      error: "Missing BREVO_API_KEY"
    };
  }

  if (listIds.length === 0) {
    return {
      error: "Missing BREVO_LIST_ID"
    };
  }

  if (Number.isInteger(doiTemplateId) && redirectUrl) {
    return {
      url: `${BREVO_BASE_URL}/contacts/doubleOptinConfirmation`,
      body: {
        email,
        includeListIds: listIds,
        templateId: doiTemplateId,
        redirectionUrl: redirectUrl
      }
    };
  }

  return {
    url: `${BREVO_BASE_URL}/contacts`,
    body: {
      email,
      listIds,
      updateEnabled: true
    }
  };
};

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

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

  const body = parseJsonBody(req.body);
  const email = String(body.email || "").trim().toLowerCase();

  if (!email || !EMAIL_REGEX.test(email)) {
    sendJson(res, 400, {
      ok: false,
      error: "Enter a valid email address"
    });
    return;
  }

  const requestConfig = createBrevoRequest(email);

  if (requestConfig.error) {
    sendJson(res, 500, {
      ok: false,
      error: requestConfig.error
    });
    return;
  }

  try {
    const response = await fetch(requestConfig.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY
      },
      body: JSON.stringify(requestConfig.body)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data.message || data.code || "Brevo request failed";
      sendJson(res, 502, {
        ok: false,
        error: message
      });
      return;
    }

    sendJson(res, 200, {
      ok: true,
      provider: "brevo",
      doubleOptIn: Boolean(process.env.BREVO_DOI_TEMPLATE_ID && process.env.BREVO_REDIRECT_URL)
    });
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      error: "Unable to reach Brevo"
    });
  }
};

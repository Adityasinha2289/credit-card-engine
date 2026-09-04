var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// api/health-ai.ts
var health_ai_exports = {};
__export(health_ai_exports, {
  default: () => handler
});
module.exports = __toCommonJS(health_ai_exports);
async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const aiApiUrl = process.env.VITE_AI_API_URL;
  if (!aiApiUrl) {
    return res.status(503).json({
      status: "error",
      message: "AI API URL not configured",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5e3);
    const response = await fetch(aiApiUrl, {
      method: "GET",
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (response.ok || response.status === 404 || response.status === 401 || response.status === 405) {
      return res.status(200).json({
        status: "ok",
        service: "ai-backend",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } else {
      return res.status(503).json({
        status: "error",
        service: "ai-backend",
        statusCode: response.status,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  } catch (error) {
    return res.status(503).json({
      status: "error",
      service: "ai-backend",
      message: error.name === "AbortError" ? "Connection timed out" : "Failed to connect to AI backend",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
}

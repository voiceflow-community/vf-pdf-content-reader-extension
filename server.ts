import { serve } from "bun";
import { readFile } from "fs/promises";

const PORT = Bun.env.PORT ? parseInt(Bun.env.PORT) : 3000;
const SERVER_URL = Bun.env.SERVER_URL || 'http://localhost:3000';
const VOICEFLOW_PROJECT_VERSION = Bun.env.VOICEFLOW_PROJECT_VERSION || 'development';
const VOICEFLOW_PROJECT_ID = Bun.env.VOICEFLOW_PROJECT_ID;
const VOICEFLOW_GENERAL_RUNTIME_URL = Bun.env.VOICEFLOW_GENERAL_RUNTIME_URL || 'https://general-runtime.voiceflow.com';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-portkey-api-key",
};

const server = serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === "/" || url.pathname === "/index.html") {
      let content = await readFile("./index.html", "utf8");
      content = content.replaceAll('VOICEFLOW_PROJECT_ID', VOICEFLOW_PROJECT_ID || '');
      content = content.replaceAll('VOICEFLOW_PROJECT_VERSION', VOICEFLOW_PROJECT_VERSION || '');
      content = content.replaceAll('VOICEFLOW_GENERAL_RUNTIME_URL', VOICEFLOW_GENERAL_RUNTIME_URL);
      content = content.replaceAll('SERVER_URL', SERVER_URL || 'http://localhost:3000');

      return new Response(content, {
        headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders }
      });
    }

    if (url.pathname === "/scripts/extension.js") {
      return new Response(Bun.file("./scripts/extension.js"), {
        headers: {
          "Content-Type": "application/javascript; charset=utf-8",
          ...corsHeaders
        }
      });
    }

    return new Response("Not Found", {
      status: 404,
      headers: corsHeaders
    });
  },
});

console.log(`Server running at http://localhost:${PORT}`);

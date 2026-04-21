// ═══════════════════════════════════════════════════════════
// TOPO-ARB BACKEND SERVER
// Proxies broker API calls to bypass CORS
// Deploy FREE on Render.com
// ═══════════════════════════════════════════════════════════

const express = require(“express”);
const cors    = require(“cors”);
const fetch   = (…args) => import(“node-fetch”).then(({default: f}) => f(…args));

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ── Health check ──────────────────────────────────────────
app.get(”/”, (req, res) => {
res.json({ status: “ok”, service: “TopoArb Broker Proxy”, version: “1.0.0” });
});

// ── Exness ────────────────────────────────────────────────
app.post(”/broker/exness/order”, async (req, res) => {
const { apiKey, accountId, server, symbol, side, volume, sl, tp } = req.body;
try {
const r = await fetch(“https://api.exness.com/trading/v1/orders”, {
method: “POST”,
headers: {
“Authorization”: `Bearer ${apiKey}`,
“Content-Type”:  “application/json”,
“X-Account-ID”:  accountId,
},
body: JSON.stringify({ symbol, side, volume, order_type: “market”, server, stop_loss: sl, take_profit: tp }),
});
const data = await r.text();
res.status(r.status).send(data);
} catch (e) {
res.status(500).json({ error: e.message });
}
});

app.get(”/broker/exness/account”, async (req, res) => {
const { apiKey, accountId } = req.query;
try {
const r = await fetch(`https://api.exness.com/trading/v1/accounts/${accountId}`, {
headers: { “Authorization”: `Bearer ${apiKey}`, “X-Account-ID”: accountId },
});
const data = await r.text();
res.status(r.status).send(data);
} catch (e) {
res.status(500).json({ error: e.message });
}
});

// ── Investzo ──────────────────────────────────────────────
app.post(”/broker/investzo/order”, async (req, res) => {
const { apiKey, accountId, symbol, side, lots, sl, tp } = req.body;
try {
const r = await fetch(“https://api.investzo.com/v1/trade”, {
method: “POST”,
headers: { “X-API-KEY”: apiKey, “Content-Type”: “application/json” },
body: JSON.stringify({ account: accountId, instrument: symbol, action: side, lots, type: “market”, stop_loss: sl, take_profit: tp }),
});
const data = await r.text();
res.status(r.status).send(data);
} catch (e) {
res.status(500).json({ error: e.message });
}
});

app.get(”/broker/investzo/account”, async (req, res) => {
const { apiKey, accountId } = req.query;
try {
const r = await fetch(`https://api.investzo.com/v1/account/${accountId}`, {
headers: { “X-API-KEY”: apiKey },
});
const data = await r.text();
res.status(r.status).send(data);
} catch (e) {
res.status(500).json({ error: e.message });
}
});

// ── HFM ───────────────────────────────────────────────────
app.post(”/broker/hfm/order”, async (req, res) => {
const { apiKey, accountId, server, symbol, side, volume, sl, tp } = req.body;
try {
const r = await fetch(“https://api.hfm.com/v2/orders”, {
method: “POST”,
headers: { “Authorization”: `Token ${apiKey}`, “Content-Type”: “application/json” },
body: JSON.stringify({ account_id: accountId, server, symbol, type: “MARKET”, side: side.toUpperCase(), volume, stop_loss: sl, take_profit: tp }),
});
const data = await r.text();
res.status(r.status).send(data);
} catch (e) {
res.status(500).json({ error: e.message });
}
});

app.get(”/broker/hfm/account”, async (req, res) => {
const { apiKey, accountId } = req.query;
try {
const r = await fetch(`https://api.hfm.com/v2/accounts/${accountId}`, {
headers: { “Authorization”: `Token ${apiKey}` },
});
const data = await r.text();
res.status(r.status).send(data);
} catch (e) {
res.status(500).json({ error: e.message });
}
});

// ── Generic proxy (future brokers) ───────────────────────
app.post(”/proxy”, async (req, res) => {
const { url, method = “POST”, headers = {}, body } = req.body;
try {
const r = await fetch(url, { method, headers, body: JSON.stringify(body) });
const data = await r.text();
res.status(r.status).send(data);
} catch (e) {
res.status(500).json({ error: e.message });
}
});

app.listen(PORT, () => console.log(`✅ TopoArb server running on port ${PORT}`));

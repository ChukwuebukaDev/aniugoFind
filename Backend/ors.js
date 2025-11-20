export default async function handler(req, res) {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ error: "Missing start or end parameters" });
    }

    // Secure API key stored in Vercel environment variable
    const apiKey = process.env.ORS_API_KEY;

    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "ORS API key not configured on server" });
    }

    const orsUrl = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start}&end=${end}`;

    const response = await fetch(orsUrl);
    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({
        error: "ORS request failed",
        details: text,
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      error: "Unexpected server error",
      details: err.message,
    });
  }
}

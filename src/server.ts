import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";

const app = express();

// Habilitar CORS para que el frontend (puerto 8080) pueda acceder
app.use(cors({
  origin: "http://localhost:8080",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;

async function getUnsplashImage(query: string): Promise<string> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.warn("Falta UNSPLASH_ACCESS_KEY en .env");
    return "https://via.placeholder.com/300x200";
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&client_id=${accessKey}&per_page=1`
    );
    const data: any = await response.json();
    return data?.urls?.small ?? "https://via.placeholder.com/300x200";
  } catch (err) {
    console.error("Error obteniendo imagen:", err);
    return "https://via.placeholder.com/300x200";
  }
}

async function geocodeLocation(name: string, country: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const query = `${name} ${country}`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const response = await fetch(url, {
      headers: { "User-Agent": "TripRecommendator/1.0 (contact@example.com)" }
    });
    
	const data: any = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }

    return null;
  } catch (err) {
    console.error("Error en geocodificación:", err);
    return null;
  }
}

app.post("/api/trip", async (req, res) =>
{
	try
	{
		const { query } = req.body;
		if (!query)
			return res.status(400).json({ error: "Texto vacío" });

		const prompt = `
			Genera una lista JSON de 4 destinos turísticos basados en la siguiente query: ${query}.
			Si el valor del campo city es igual valor del campo name, deja vacío el campo city.
			Cada objeto debe tener estos campos:
			{
				"name": "Nombre del lugar",
				"city": "Ciudad o pueblo",
				"country": "País",
				"score": 4.5,
				"description": "Breve descripción del destino en base a la query"
			}
			No incluyas ningún texto adicional, solo la lista JSON.
			Si en mi prompt te pregunto exclusivamente por países, en vez por lugares concretos:
			- Pon el nombre del país en name
			- No pongas nada en city
			- Pon el continente en country
			Ejemplo:
			{
				"name": "España,",
				"city": "",
				"country": "Europa",
				"score": 5.0,
				"description": "Breve descripción del destino en base a la query"
			}
		`;

		const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${process.env.GROQ_API_KEY}`
			},
			body: JSON.stringify({
				model: "openai/gpt-oss-120b",
				messages: [{ role: "user", content: prompt }],
				temperature: 0.7
			})
		});

		const data: any = await response.json();
		const text = data.choices?.[0]?.message?.content ?? "[]";

		let parsed;
		try {
			parsed = JSON.parse(text);
		} catch {
			parsed = [{ name: "Error", country: "", description: text }];
		}

		for (const dest of parsed) {
			const queryText = `${dest.name} ${dest.country}`;
			dest.img_url = await getUnsplashImage(queryText);
			let coords = await geocodeLocation(dest.name, dest.country);
			if (!coords && dest.country)
				coords = await geocodeLocation(dest.country, "");
			dest.lat = coords?.lat ?? null;
			dest.lon = coords?.lon ?? null;
		}

		res.status(200).json({ destinations: parsed });
	} catch (err) {
		console.error("Error procesando solicitud:", err);
		res.status(500).json({ error: "Error procesando solicitud" });
	}
});

app.listen(PORT, () => {
    console.log(`Servidor backend activo en http://localhost:${PORT}`);
});
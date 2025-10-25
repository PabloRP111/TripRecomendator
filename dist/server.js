import { createServer } from "http";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;
async function getUnsplashImage(query) {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) {
        console.warn("Falta UNSPLASH_ACCESS_KEY en .env");
        return "https://via.placeholder.com/300x200";
    }
    try {
        const response = await fetch(`https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&client_id=${accessKey}&per_page=1`);
        const data = await response.json();
        return data?.urls?.small ?? "https://via.placeholder.com/300x200";
    }
    catch (err) {
        console.error("Error obteniendo imagen:", err);
        return "https://via.placeholder.com/300x200";
    }
}
async function geocodeLocation(city, country) {
    try {
        const query = `${city}, ${country}`;
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
        const response = await fetch(url, {
            headers: { "User-Agent": "TripRecommendator/1.0 (contact@example.com)" }
        });
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
            return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
        }
        return null;
    }
    catch (err) {
        console.error("Error en geocodificación:", err);
        return null;
    }
}
const server = createServer(async (req, res) => {
    if (req.method === "POST" && req.url === "/api/trip") {
        let body = "";
        req.on("data", chunk => (body += chunk));
        req.on("end", async () => {
            try {
                const { query } = JSON.parse(body);
                if (!query) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "Texto vacío" }));
                    return;
                }
                // Generar destinos con el modelo LLM
                const prompt = `
          Genera una lista JSON de 5 destinos turísticos basados en la siguiente descripción: ${query}.
          Cada objeto debe tener estos campos:
          {
            "name": "Nombre del lugar,"
            "city": "Ciudad o pueblo"
            "country": "País"
            "score": 4.5
            "description": "Breve descripción del destino"
          }
          No incluyas ningún texto adicional, solo la lista JSON.
          Si en mi prompt te pregunto exclusivamente por países, en vez por lugares concretos:
          -Pon el nombre del país en name seguido de la coma.
          -No pongas nada en city
          -Pon el continente en country
          Ejemplo:
          {
            "name": "España,"
            "city": ""
            "country": "Europa"
            "score": 5.0
            "description": "Breve descripción del destino"
          }
        `;
                const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: "llama-3.1-8b-instant",
                        messages: [{ role: "user", content: prompt }],
                        temperature: 0.7
                    })
                });
                const data = await response.json();
                const text = data.choices?.[0]?.message?.content ?? "[]";
                let parsed;
                try {
                    parsed = JSON.parse(text);
                }
                catch {
                    parsed = [{ name: "Error", country: "", description: text }];
                }
                // Añadir imagen + coordenadas a cada destino
                for (const dest of parsed) {
                    const queryText = `${dest.name} ${dest.country}`;
                    dest.img_url = await getUnsplashImage(queryText);
                    const coords = await geocodeLocation(dest.city, dest.country);
                    dest.lat = coords?.lat ?? null;
                    dest.lon = coords?.lon ?? null;
                }
                // Enviar respuesta al cliente
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ destinations: parsed }));
            }
            catch (e) {
                console.error("Error procesando solicitud:", e);
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Error procesando solicitud" }));
            }
        });
    }
    else {
        let requestedPath = req.url ?? "/";
        if (requestedPath === "/")
            requestedPath = "index.html";
        const filePath = path.join(__dirname, "..", requestedPath);
        try {
            const data = await readFile(filePath);
            const ext = path.extname(filePath);
            const contentType = ext === ".html"
                ? "text/html"
                : ext === ".js"
                    ? "application/javascript"
                    : ext === ".css"
                        ? "text/css"
                        : "text/plain";
            res.writeHead(200, { "Content-Type": contentType });
            res.end(data);
        }
        catch {
            res.writeHead(404);
            res.end("Not Found");
        }
    }
});
server.listen(PORT, () => console.log(`Servidor activo en http://localhost:${PORT}`));

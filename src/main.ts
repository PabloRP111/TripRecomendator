declare var L: any;

let map: any = null;
const markers: any[] = [];

const textarea = document.getElementById("trip-input") as HTMLTextAreaElement;
const button = document.getElementById("search-button") as HTMLButtonElement;
const resultsList = document.getElementById("results-list") as HTMLUListElement;

function initMap()
{
	if (map)
		map.remove(); // Reiniciar mapa si ya existe

	map = L.map("map").setView([20, 0], 2); // Crea un nuevo mapa centrado en el mundo (lat=20, lon=0) y zoom 2

	L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		attribution: '&copy; OpenStreetMap contributors',
		maxZoom: 15,
	}).addTo(map); // Añade el tile layer de OpenStreetMap como base visual.
}

function showDestinationsOnMap(destinations: any[]) {
	markers.length = 0;
	
	if (!map)
		return;

	destinations.forEach(dest => {
		if (dest.lat && dest.lon)
		{
			const popupHtml = `
			<h3 class="font-semibold text-gray-800">${dest.name}</h3>
			<p class="text-gray-500 text-sm">${dest.description}</p>
			<img src="${dest.img_url}" alt="${dest.name}" width="200" class="rounded-lg mt-2">
			`;

			const marker = L.marker([dest.lat, dest.lon]).addTo(map);
			marker.bindPopup(popupHtml);

			markers.push({dest, marker})
		}
	});

	if (destinations.length > 0)
	{
		const group = L.featureGroup(markers.map(m => m.marker));
		map.fitBounds(group.getBounds().pad(0.2));
	}
}

function renderDestinations(destinations: {
	name: string;
	city: string;
	country :string;
	score?: number;
	description: string;
	img_url: string;
	}[]) {

	const resultsList = document.getElementById("results-list")!;
	resultsList.innerHTML = ""; // limpiar resultados previos

	destinations.forEach(dest => {
		const li = document.createElement("li");
		li.className = "bg-white/90 rounded-xl shadow p-4 flex flex-col md:flex-row gap-4 transition hover:bg-white/70 hover:shadow-lg hover:-translate-y-1 cursor-pointer";

		li.innerHTML = `
			<img src="${dest.img_url ?? 'https://via.placeholder.com/150'}" alt="${dest.name}" class="w-full md:w-20 rounded-lg object-cover">
			<div class="flex-1">
				<h3 class="font-semibold text-gray-800">${dest.name} ${dest.city}, ${dest.country}</h3>
				<p class="text-gray-500 text-sm">${dest.description}</p>
			</div>
			${dest.score ? `<span class="text-blue-600 font-bold self-start md:self-center">⭐ ${dest.score}</span>` : ""}
		`;

		li.addEventListener("click", () => {
			const found = markers.find(m => m.dest.name === dest.name);
			if (found)
			{
				map.setView(found.marker.getLatLng(), 10, { animate: true });
				found.marker.openPopup();

				// Desplazar hacia el mapa suavemente
				const mapElement = document.getElementById("map");
				if (mapElement)
					mapElement.scrollIntoView({ behavior: "smooth", block: "center" });
			}
		});

		resultsList.appendChild(li);
	});
}


button.addEventListener("click", async () => {
	const query = textarea.value.trim();
	if (!query)
		return alert("Por favor, escribe algo.");

	button.disabled = true;
	button.textContent = "Buscando...";

	try
	{
		const response = await fetch("/api/trip", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ query })
		});

		const data = await response.json();
		const destinations = data.destinations ?? [];

		if (Array.isArray(destinations))
		{
			renderDestinations(destinations);
			initMap();
			showDestinationsOnMap(destinations);
		}
		else 
			console.error("Respuesta inválida del servidor:", data);
	}
	catch
	{
		alert("Error al conectar con el servidor");
	}
	finally
	{
		button.disabled = false;
		button.textContent = "Buscar destinos";
	}
});

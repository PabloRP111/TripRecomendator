# 🌍 TripRecommendator
Aplicación web que recomienda destinos turísticos a partir de una descripción textual.
Utiliza un modelo de lenguaje (Groq / LLaMA 3.1) para generar sugerencias de lugares y las muestra en un mapa interactivo con Leaflet.

## 🚀 Tecnologías principales

- Frontend: HTML, TypeScript, TailwindCSS, Leaflet, Nginx

- Backend: Node.js, Express, TypeScript

- API externas:
  - Groq API: para generar los destinos.
  - Unsplash API: para obtener imágenes.
  - OpenStreetMap Nominatim: para geocodificación (lat/lon).

- Contenedores: Docker + Docker Compose

- Build: Makefile para compilar y levantar servicios

## 🧩 Estructura del proyecto
TripRecommendator/

├── dist/

│   ├── main.ts

│   ├── server.ts

├── src/

│   ├── main.ts

│   ├── server.ts

├── tsconfig.json

├── Dockerfile.backend

├── index.html

├── Dockerfile.frontend

├── default.conf      # Configuración de Nginx

├── docker-compose.yml

├── Makefile

├── .env

└── README.md

## ⚙️ Configuración del entorno
1. Variables de entorno

  - Crea un archivo .env en la raíz del proyecto: GROQ_API_KEY=tu_clave_de_groq UNSPLASH_ACCESS_KEY=tu_clave_de_unsplash

2. Compilar y levantar con Make
  - El Makefile incluye un comando para compilar los .ts y levantar los contenedores: make compile


##### Created with ❤️ by Asraum.

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

1. **Variables de entorno**

    Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

    ```env
    GROQ_API_KEY=tu_clave_de_groq
    UNSPLASH_ACCESS_KEY=tu_clave_de_unsplash
    ```

2. **Compilar**

    El `Makefile` incluye un comando para compilar los `.ts` y levantar los contenedores:

    ```bash
    make compile
    ```

3. **Levantar Docker**

    - Con Make:
      ```bash
      make build up
      ```
    - Manualmente:
      ```bash
      docker-compose up --build
      ```

4. **Acceder en el navegador**

    Abre [http://localhost:8080](http://localhost:8080)


## 🧹 Limpiar todo el entorno Docker

  Cuando termines, puedes eliminar **contenedores, imágenes, volúmenes y redes** con:
  - Con Make:
    ```bash
    make fclean
    ```
  - Manualmente:
    ```bash
    docker-compose down --rmi all --volumes --remove-orphans
    docker network prune -f
    ```

##### Created with ❤️ by Asraum.

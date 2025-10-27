# Variables
COMPOSE=docker-compose
TS_SRC=src
DIST=dist

.PHONY: compile up build clean

# Compila TypeScript
compile:
	@echo "Compilando TypeScript..."
	npx tsc
	@echo "Compilación completada."

# Levanta los contenedores (recomendado después de compile)
up:
	@echo "Levantando contenedores..."
	$(COMPOSE) up -d --build
	@echo "Contenedores levantados."

# Build sin levantar
build:
	@echo "Construyendo imágenes Docker..."
	$(COMPOSE) build
	@echo "Imágenes construidas."

# Limpieza de dist y contenedores
clean:
	@echo "Parando contenedores y borrando dist..."
	$(COMPOSE) down
	rm -rf $(DIST)/*
	@echo "Limpieza completada."

fclean:
	@echo "Eliminando contenedores, imágenes, volúmenes y redes..."
	docker-compose down --rmi all --volumes --remove-orphans
	docker network prune -f
	@echo "Entorno completamente limpio ✅"
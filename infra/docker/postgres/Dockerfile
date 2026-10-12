FROM postgres:16-bookworm
RUN apt-get update && apt-get install -y --no-install-recommends postgresql-16-postgis-3 postgresql-16-postgis-3-scripts && rm -rf /var/lib/apt/lists/*
COPY init-scripts/ /docker-entrypoint-initdb.d/
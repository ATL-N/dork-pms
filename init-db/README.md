# Database Initialization Scripts

This directory is mounted into the PostgreSQL container at `/docker-entrypoint-initdb.d`.

Any `.sh`, `.sql`, or `.sql.gz` files in this directory will be executed by the `postgres` image on its first run, in alphabetical order. This is useful for performing initial setup tasks, such as:

- Creating database roles (users).
- Creating extensions (e.g., `CREATE EXTENSION "uuid-ossp";`).
- Seeding initial data that is required for the application to start.

For more information, see the "Initialization scripts" section of the official Docker Hub documentation for the `postgres` image.

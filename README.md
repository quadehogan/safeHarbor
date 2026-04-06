# SafeHarbor

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (LTS) with npm
- [PostgreSQL](https://www.postgresql.org/download/) running locally (the API expects a database the connection string can reach)

## Start the website locally

You need two terminals: one for the API and one for the Vite dev server.

### 1. Backend (ASP.NET Core API)

```bash
cd backend/SafeHarbor.API
dotnet restore
dotnet run --launch-profile http
```

The API listens at **http://localhost:5046**. Swagger UI is available in Development at **http://localhost:5046/swagger**.

Update `appsettings.Development.json` (or set the `ConnectionStrings__SafeHarborConnection` environment variable) so the PostgreSQL host, database name, user, and password match your machine. After the database is reachable, apply migrations:

```bash
cd backend/SafeHarbor.API
dotnet ef database update
```

If you do not have the EF Core CLI tool:

```bash
dotnet tool install -g dotnet-ef
```

### 2. Frontend (Vite + React)

```bash
cd frontend
npm install
npm run dev
```

The site is served at **http://localhost:3002** (see `frontend/vite.config.ts`).

### Optional: point the frontend at a different API URL

Create `frontend/.env.local` (or set in your shell):

```bash
VITE_API_BASE_URL=http://localhost:5046
```

The default in code matches this URL when the variable is unset.

## Production build (frontend only)

```bash
cd frontend
npm run build
npm run preview
```

`preview` serves the built files; configure the host and port as needed for your environment.

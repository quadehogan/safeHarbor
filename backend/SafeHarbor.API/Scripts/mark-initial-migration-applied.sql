-- Run once in Supabase SQL Editor when the database already contains the schema from InitialCreate
-- but __EFMigrationsHistory is empty or missing. ProductVersion must match EF Core that generated the migration (see Migrations/*.Designer.cs).

CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260406184651_InitialCreate', '10.0.0')
ON CONFLICT ("MigrationId") DO NOTHING;

-- Verify:
-- SELECT * FROM "__EFMigrationsHistory";

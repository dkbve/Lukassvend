# ElDok – Elektrisk Dokumentationsplatform

En moderne, mobil-første webapplikation til dokumentation af elektrisk arbejde i boliger og erhvervslokaler.

## Funktioner

- **To roller:** INSTALLATEUR (fuld CRUD) og KUNDE (skrivebeskyttet via QR-kode)
- **QR-koder:** Automatisk generering, download og udskrivning
- **Filhåndtering:** Upload og visning af billeder + dokumenter (PDF, DOC, XLS)
- **Revisionslog:** Append-only historik over alle ændringer
- **Blødt sletning:** Slettede registreringer bevares i historikken
- **Dansk brugerflade:** Al tekst, dato- og tidsformatering er på dansk

## Tech Stack

| Komponent | Teknologi |
|-----------|-----------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Database | SQLite via Prisma ORM |
| Auth | NextAuth.js v4 (JWT sessions) |
| Styling | Tailwind CSS (Schneider Electric-inspireret grøn palette) |
| QR-koder | `qrcode` npm-pakke |
| Validering | Zod |

---

## Kom i gang

### 1. Installér afhængigheder

```bash
npm install
```

### 2. Konfigurér miljøvariabler

Filen `.env.local` er allerede inkluderet til lokal udvikling. I produktion skal disse sættes:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="din-hemmelige-nøgle-min-32-tegn"
NEXTAUTH_URL="https://dit-domæne.dk"
NEXT_PUBLIC_APP_URL="https://dit-domæne.dk"
```

### 3. Opret database og kør migrationer

```bash
npm run db:push
```

### 4. Seed med demodata

```bash
npm run db:seed
```

### 5. Start udviklingsserveren

```bash
npm run dev
```

Applikationen kører nu på [http://localhost:3000](http://localhost:3000)

---

## Demo-adgangsoplysninger

| Rolle | Email | Adgangskode |
|-------|-------|-------------|
| Installateur 1 | lars@elinstal.dk | installer123 |
| Installateur 2 | mette@nordel.dk | installer456 |

---

## URL-struktur

### Offentlige URL'er (kundevisning)

| URL | Beskrivelse |
|-----|-------------|
| `/u/:publicToken` | Kundevisning – liste over registreringer |
| `/u/:publicToken/r/:recordId` | Kundevisning – detaljevisning |

### Installateur-URL'er (kræver login)

| URL | Beskrivelse |
|-----|-------------|
| `/login` | Login-side |
| `/app/units` | Oversigt over alle enheder |
| `/app/units/:unitId` | Enhedsdetaljer + registreringer + QR-kode |
| `/app/units/:unitId/new` | Opret ny registrering |
| `/app/units/:unitId/r/:recordId/edit` | Rediger registrering |
| `/app/units/:unitId/audit` | Revisionslog for enhed |

### API-endpoints

**Offentlige (ingen auth):**
- `GET /api/public/:publicToken` – enhedsinfo
- `GET /api/public/:publicToken/records` – registreringsliste
- `GET /api/public/:publicToken/records/:recordId` – registreringsdetaljer
- `GET /api/files/:filename` – filservering

**Installateur (kræver JWT-session):**
- `GET/POST /api/units` – liste/opret enheder
- `GET/PATCH/DELETE /api/units/:unitId` – hent/opdater/slet enhed
- `POST /api/units/:unitId/regenerate-token` – forny QR-token
- `GET/POST /api/units/:unitId/records` – liste/opret registreringer
- `GET/PATCH/DELETE /api/units/:unitId/records/:recordId` – CRUD på registrering

---

## Datamodel

```
User
├── id, name, email, passwordHash, role, company
Unit
├── id, name, address, publicToken (QR-token), createdAt
Record (med blødt sletning)
├── id, unitId, title, description, workAt
├── createdAt/By, updatedAt/By, deletedAt/By
Attachment
├── id, recordId, type (IMAGE|FILE), filename, mimeType, storedAs, sizeBytes
AuditLog (append-only)
├── id, action (CREATE|UPDATE|DELETE), recordId, unitId, installerId, timestamp, diffJson
```

---

## Sikkerhed

- Adgangskoder hashes med bcrypt (faktor 12)
- JWT-sessioner med NEXTAUTH_SECRET
- Middleware beskytter alle `/app/*` og `/api/units/*` routes
- Offentlige endpoints eksponerer ikke interne IDs eller installer-data
- Filservering tjekker at stien ikke forlader uploads-mappen (path traversal-beskyttelse)
- Filtyper og -størrelser valideres server-side (maks. 10 MB pr. fil)
- Soft delete på registreringer – permanent sletning sker ikke via UI

---

## Filupload

Uploadede filer gemmes i mappen `/uploads/` med UUID-baserede filnavne.
Metadata gemmes i databasen. Filer serveres via `/api/files/:storedAs`.

**Tilladte filtyper:** JPG, PNG, GIF, WebP, HEIC, PDF, DOC, DOCX, XLS, XLSX
**Maks. filstørrelse:** 10 MB pr. fil

---

## Nyttige kommandoer

```bash
npm run dev          # Start udviklingsserver
npm run build        # Byg til produktion
npm run start        # Start produktionsserver
npm run db:push      # Synkronisér schema til database (ingen migrationsfil)
npm run db:migrate   # Opret migrationsfil og kør migration
npm run db:seed      # Seed med demodata
npm run db:reset     # Nulstil database og seed igen
npm run db:studio    # Åbn Prisma Studio (databaseeditor)
npm run lint         # Kør ESLint
```

---

## Produktion

1. Sæt stærk `NEXTAUTH_SECRET` (min. 32 tegn, tilfældig)
2. Sæt korrekt `NEXTAUTH_URL` og `NEXT_PUBLIC_APP_URL`
3. Overvej at skifte til PostgreSQL i produktion (skift `provider` i `prisma/schema.prisma`)
4. For skalering: abstraher filupload til S3/Azure Blob Storage
5. Konfigurér en reverse proxy (nginx/Caddy) foran Next.js

---

## Farvepalette (Schneider Electric-inspireret)

| Token | Hex | Brug |
|-------|-----|------|
| `primary-500` | `#3DCD58` | Primær grøn accent |
| `primary-700` | `#00853D` | Mørkegrøn (hover) |
| `neutral-50` | `#f8fafc` | Sidbaggrund |
| `neutral-900` | `#0f172a` | Primær tekst |

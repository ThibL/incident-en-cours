# IDFM Dashboard

Tableau de bord temps réel pour les transports en commun d'Île-de-France (RATP/IDFM).

## Configuration

### Variables d'environnement

Créer un fichier `.env.local` :

```bash
# Clé API PRIM (obligatoire)
# Obtenir une clé : https://prim.iledefrance-mobilites.fr
PRIM_API_KEY=your_api_key_here

# URL de l'application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## API PRIM - Endpoints utilisés

| Endpoint | Description | Quota journalier | Cache |
|----------|-------------|------------------|-------|
| `/stop-monitoring?MonitoringRef={stopId}` | Prochains passages à un arrêt | 1 000 000 | 30s |
| `/stop-monitoring?LineRef={lineId}` | Passages pour une ligne | 1 000 000 | 30s |
| `/v2/navitia/line_reports` | Info trafic globale | 20 000 | 60s |
| `/v2/navitia/line_reports/physical_modes/{mode}/line_reports` | Info trafic par mode | 20 000 | 60s |
| `/general-message` | Messages écrans | 20 000 | 60s |
| `/disruptions_bulk` | Toutes les perturbations | 18 000 | 120s |

### Routes API Next.js

| Route | Méthode | Description | Params |
|-------|---------|-------------|--------|
| `/api/passages/{stopId}` | GET | Passages à un arrêt | - |
| `/api/passages/line/{lineId}` | GET | Passages d'une ligne | - |
| `/api/passages/bulk` | GET | Passages multi-arrêts | `stops` (comma-separated, max 10) |
| `/api/trafic` | GET | Info trafic | `mode`, `lineId` |
| `/api/messages/affichage` | GET | Messages écrans | `lineId`, `channel` |
| `/api/messages/trafic` | GET | Messages trafic | `bulk` (boolean) |

### Modes de transport

- `Metro` - Métro RATP
- `RER` - RER (RapidTransit)
- `Tramway` - Tramway
- `Bus` - Bus
- `Transilien` - Trains de banlieue (LocalTrain)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Tests

```bash
# Lancer les tests en mode watch
npm test

# Lancer les tests une seule fois
npm run test:run
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

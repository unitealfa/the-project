# Fullstack Project

This repository contains a **NestJS** backend and a **React + Vite** frontend. The project uses **MongoDB** via Mongoose. Each part lives in its own folder:

```
├── back/   # NestJS server
└── front/  # React client
```

## Technologies

* Node.js (>=18 recommended)
* NestJS 10
* Express 4
* MongoDB with Mongoose
* React 19 + Vite
* Mongoose 7

## Prerequisites

Install **Node.js >=18** and npm, then clone the repo. MongoDB must be running locally or a URI provided through environment variables.

### Environment variables

The backend uses a `.env` file. Copy `back/.env` and adjust:

```
MONGO_URI=your-mongodb-uri
JWT_SECRET=change_this_secret
PORT=5000
VRP_API_URL=http://example.com/vrp
VRP_API_KEY=your_vrp_key
```

The frontend expects `VITE_API_URL` pointing to the NestJS API. For local development it defaults to `http://localhost:5000`.

## Installation

### Backend

```bash
cd back
npm install
```

The backend expects additional packages which are already listed in `back/package.json`. If needed you can install them individually:

```bash
npm install express@^4.18.1
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install --save-dev @types/passport-jwt
npm install @nestjs/platform-express@10
npm install @nestjs/config
npm install bcrypt class-validator class-transformer @nestjs/jwt passport passport-jwt
npm install -D @types/bcrypt @types/passport-jwt
npm install --save @nestjs/platform-express multer
npm install @nestjs/mapped-types
npm install --save-dev @types/react @types/react-dom
npm install --save @nestjs/serve-static
npm install
```

Start the API in watch mode:

```bash
npm run start:dev
```

### Frontend

```bash
cd front
npm install
```

The frontend uses Vite and several libraries. If you want to install them manually:

```bash
npm install react-scripts --save
npm audit fix --force
npm install typescript --save-dev
npm install @vitejs/plugin-react --save-dev
npm install @vitejs/plugin-react
npm install lucide-react
npm install --save-dev @types/node
npm install react-router-dom
npm install -D @types/react-router-dom
npm install jspdf html2canvas
npm install xlsx
npm install leaflet react-leaflet
npm install --save-dev @types/Leaflet
npm install jszip
npm install --save-dev @types/jszip
npm install react-easy-crop
npm install three postprocessing
npm uninstall three
npm install three@0.176.0
npm install --save-dev @types/three
npm install react-swipeable
npm i framer-motion
```

Launch the development server:

```bash
npm run dev
```

## Roles and Permissions

Roles are defined in `back/src/user/schemas/user.schema.ts` and correspond to the dashboards located in `front/src/pages`.

| Role                        | Example dashboard file                           |
| --------------------------- | ------------------------------------------------ |
| `Super Admin`               | `front/src/pages/DashboardSuperAdmin.tsx`        |
| `Admin`                     | `front/src/pages/DashboardAdmin.tsx`             |
| `responsable depot`         | `front/src/pages/DashboardResponsableDepot.tsx`  |
| `Administrateur des ventes` | `front/src/pages/DashboardAdminVentes.tsx`       |
| `Livreur`                   | `front/src/pages/DashboardLivreur.tsx`           |
| `Chauffeur`                 | `front/src/pages/DashboardChauffeur.tsx`         |
| `Superviseur des ventes`    | `front/src/pages/DashboardSuperviseurVentes.tsx` |
| `Pré-vendeur`               | `front/src/pages/DashboardPreVendeur.tsx`        |
| `Gestionnaire de stock`     | `front/src/pages/DashboardGestionStock.tsx`      |
| `Contrôleur`                | `front/src/pages/DashboardControleur.tsx`        |
| `Manutentionnaire`          | `front/src/pages/DashboardManutentionnaire.tsx`  |
| `Client`                    | `front/src/pages/DashboardClient.tsx`            |

### Role highlights

| Role                          | Main features                                                                   |
| ----------------------------- | ------------------------------------------------------------------------------- |
| **Super Admin**               | Gère toutes les sociétés (`back/src/company/`). Voir `DashboardSuperAdmin.tsx`. |
| **Admin**                     | Accède aux dépôts et aux clients de sa société. Voir `DashboardAdmin.tsx`.      |
| **responsable depot**         | Gère l'équipe et les stats de son dépôt. Voir `DashboardResponsableDepot.tsx`.  |
| **Administrateur des ventes** | Planifie les tournées et gère les véhicules (`DashboardAdminVentes.tsx`).       |
| **Livreur**                   | Consulte ses commandes du jour (`DashboardLivreur.tsx`).                        |
| **Chauffeur**                 | Accède à son planning de trajets (`DashboardChauffeur.tsx`).                    |
| **Superviseur des ventes**    | Suivi des KPI et gestion commandes (`DashboardSuperviseurVentes.tsx`).          |
| **Pré-vendeur**               | Prise de commandes en tournée (`DashboardPreVendeur.tsx`).                      |
| **Gestionnaire de stock**     | Gestion des entrées/sorties (`DashboardGestionStock.tsx`).                      |
| **Contrôleur**                | Inventaires et contrôle qualité (`DashboardControleur.tsx`).                    |
| **Manutentionnaire**          | Prépare les commandes (`DashboardManutentionnaire.tsx`).                        |
| **Client**                    | Consulter les produits et commandes (`DashboardClient.tsx`).                    |

Permissions for each role are enforced on the backend using the `@Roles()` decorator in the various controllers under `back/src/**`. For example, the creation of companies can only be done by a **Super Admin** in [`back/src/company/company.controller.ts`](back/src/company/company.controller.ts).

## File Structure

* `back/` – NestJS application with modules for authentication, companies, depots, products, carts, orders, vehicles, etc.
* `front/` – React application (Vite) with pages for each role and components for authentication.

The source code is commented and each role-specific dashboard resides in `front/src/pages`. Backend controllers specify role permissions via `@Roles()`.

---

## 🎮 Directed By

🎥 Mourad Adjout & Nazim Boukhari

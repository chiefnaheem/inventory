# Tiny Inventory

Tiny Inventory is a premium, robust, and highly-optimized full-stack inventory management system. It tracks Stores and the Products they carry, supporting scalable operations, complete validation, and dynamic filtering.

## 🚀 Run Instructions

The entire system is containerized for a zero-configuration launch.

```bash
# Option A: Zero-config Docker
docker compose up --build

# Option B: Run locally across both folders concurrently (requires Node.js)
npm run install:all
npm run dev

# (To build for production locally)
npm run build
```

- **Frontend (Web)**: Available at [http://localhost:3000](http://localhost:3000)
- **Backend (API)**: Available at [http://localhost:8080](http://localhost:8080)

*Note: The backend automatically seeds itself with initial store and product data on startup.*

---

## 📡 API Sketch

The HTTP server exposes a standard REST interface over `/api/`. Validation is strictly enforced via Zod.

```http
GET /api/stores
# Returns a list of stores sorted by creation date.

GET /api/stores/:id
# Returns store details along with its products.
# Includes non-trivial aggregation: `totalProducts` and `inventoryValue` (computed sum of price * quantity).

GET /api/products?page=1&limit=10&search=MacBook
# Returns paginated products. Supports text filtering by `search` and `storeId`.

POST /api/products
# Creates a new product. Requires strict body payload.

PUT /api/products/:id
# Updates an existing product. 

DELETE /api/products/:id
# Deletes a product.
```

---

## ⚖️ Decisions & Trade-offs

1. **Stack Selection**: 
   - **Backend**: `Express` + `TypeScript` + `Prisma`. Picked for rapid, highly-typed setup without the boilerplate overhead of heavier frameoworks (like NestJS) for a project of this scope.
   - **Frontend**: `React` + `Vite` + `TanStack Query`. Vite provides blistering fast HMR, and TanStack Query elegantly handles caching, background updates, and loading/error states out of the box.
2. **Database Choice**: 
   - **PostgreSQL** was chosen to guarantee a robust, production-ready persistent store. It integrates purely with Prisma and its relations. The orchestration runs a lightweight `postgres:15-alpine` container within `docker-compose.yml` to automatically handle DB lifecycles without local dependencies.
3. **Styling Approach**: 
   - **Vanilla CSS** with a custom Design System built on CSS variables. This avoids generic framework looks and allows creating a highly tailored "premium" aesthetic that fits the exact prompt requirements (avoiding Tailwind defaults).
4. **Data Aggregation**:
   - The non-trivial operation (`inventoryValue`) is computed on the fly. In this deployment, it's aggregated dynamically on the Express layer to reduce multi-level payload queries, but could easily be pushed natively down to PostgreSQL using Prisma's aggregations (`_sum`).

---

## 🧪 Testing Approach

While time limits precluded an exhaustive E2E test suite, the safety of the application relies on strict boundaries:
1. **Validation Boundaries**: Every ingress API route is protected by `Zod` schemas preventing malformed database interactions.
2. **Type Safety**: End-to-end `TypeScript` ensures that the data contracts provided by the Prisma generated client matched the API routes and frontend interfaces.
3. **Frontend States**: The UI implements exhaustive Handling for `loading`, `error`, and `empty` states ensuring the user is never left with a blank or unresponsive screen.

---

## ⏳ If I Had More Time...

- **e2e Tests**: Implement a Playwright suite targeting the Docker containers to verify the critical path (add product -> view store dashboard -> assert inventory value change).
- **Advanced Filtering**: Add complex pricing threshold filters and category multi-select drop-downs to the UI and API.
- **Optimistic UI Updates**: Hook the React Query mutations into the query cache to instantiate immediate visual feedback when Editing/Deleting products without waiting for the network roundtrip.

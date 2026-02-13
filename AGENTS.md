# Agent Context: Road Construction Video Conversion System

You are an expert full-stack developer specializing in Vue 3, FastAPI, and PostgreSQL. You follow the project's specific architecture, emphasizing code reusability and automated CRUD patterns.

## 🏗 Technology Stack
- **Frontend:** Vue 3 (Composition API), TypeScript, Pinia, Tailwind CSS, Vite.
- **Backend:** FastAPI, PostgreSQL, Psycopg (Connection Pool).
- **Core Libraries:** TanStack Table/Virtual (for heavy data), Chart.js/ECharts, Axios.
- **Security:** SHA-256 (Client-side) + bcrypt (Server-side), Nonce-based auth.

## 📂 Architecture & Patterns

### 1. Automated CRUD (ApiStoreHelper)
Most Pinia stores must extend `ApiStoreHelper` (found in `src/utils/apiStore.ts`). 
- **Standard Workflow:** Component -> Store (Helper) -> API Service -> FastAPI (Universal CRUD).
- **Caching:** Data is cached for 5 minutes by default. Respect this before forcing a refresh.

### 2. Backend Schema-Driven Development
The backend uses a dynamic CRUD system based on `backend/tables.py`. 
- When adding a new table, define the `TableSchema` in `tables.py` first.
- The system automatically handles field mapping (DB UPPER_CASE <-> App lowerCase).

### 3. Frontend Component Standards
Use the following specialized components for consistency:
- **Tables:** Always use `src/components/common/Table.vue` for data lists.
- **Inputs:**
  - IP Address: `IpInput.vue` (4 segments, auto-focus).
  - Port: `PortInput.vue` (0-65535 validation).
  - ID: `IdInput.vue` (Max 4 digits).
- **Notifications:** Use `alert.ts` store to trigger `AlertModal.vue` toasts.

## 📜 Coding Rules
1. **Script Setup:** Always use `<script setup lang="ts">`.
2. **Type Safety:** Maintain strict TypeScript definitions in `src/types/`.
3. **Date Formatting:** Use `YYYY-MM-DD` for all UI-visible date columns.
4. **Auth Flow:** Follow the Nonce + SHA-256 handshake documented in `docs/AUTH.md`.
5. **New Features:** Refer to `docs/NEW_TAB_GUIDE.md` when adding new data management tabs.

## 💡 Instructions for AI Agent
- Before creating a new store, check if it can inherit from `ApiStoreHelper`.
- When modifying UI, prioritize Tailwind CSS utility classes.
- Ensure all API calls use the `api` wrapper in `src/services/api.ts`.
# Northstar Supply

A full-stack commerce portfolio project for useful everyday goods. The application includes a React storefront, a Node/Express API, MongoDB persistence, Stripe test payments, Cloudinary image uploads, customer accounts, reviews, order tracking, and an admin workspace.

## Project Structure

```text
ecommerce-app/
|-- client/
|   |-- src/
|   |   |-- api/                 Axios client and JWT interceptor
|   |   |-- app/                 Redux store
|   |   |-- components/          Shared UI and route guards
|   |   |-- features/            Auth, cart, and product slices
|   |   `-- pages/               Store, account, checkout, and admin pages
|   |-- index.html
|   |-- tailwind.config.js
|   |-- vercel.json
|   `-- vite.config.js
|-- server/
|   `-- src/
|       |-- config/              Environment, MongoDB, Cloudinary
|       |-- controllers/         Request handlers
|       |-- middleware/          Auth, upload, validation, errors
|       |-- models/              User, Product, Order, Review, Category
|       |-- routes/              Versionless /api endpoints
|       |-- scripts/seed.js      Sample catalog and admin account
|       `-- server.js
|-- .env.example
|-- .gitignore
|-- package.json                npm workspace scripts
`-- render.yaml
```

## Requirements

- Node.js 20 or newer and npm 10 or newer
- MongoDB running locally, or a MongoDB Atlas connection string
- Stripe test-mode keys
- Cloudinary account credentials for admin image uploads

## Local Setup

1. From this folder, install the workspace dependencies:

   ```bash
   npm install
   ```

2. Review the local `.env` in the project root. It contains loopback MongoDB settings and development-only placeholders. Replace the Stripe test key and JWT secret; set the Cloudinary values to enable image uploads. Keep real credentials out of source control. Use `.env.example` as the template on another machine.

3. Seed categories, sample products, and the initial admin account:

   ```bash
   npm run seed
   ```

   Set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` before running the seed command. The example password is for local development only. The seeder creates the account if absent and promotes an existing matching account to admin; it does not reset an existing password.

4. Start the API and Vite client together:

   ```bash
   npm run dev
   ```

   The storefront runs at `http://localhost:5173`, and the API runs at `http://localhost:5000`. The client proxies `/api` requests to the local API. API health is available at `/api/health`.

5. For Stripe test checkout, use a Stripe test card such as `4242 4242 4242 4242`, any future expiry, any three-digit CVC, and any valid postal code. No real payment is collected.

## Environment Variables

| Variable | Used by | Description |
| --- | --- | --- |
| `NODE_ENV` | API | `development` or `production` |
| `PORT` | API | Render supplies this automatically; defaults to `5000` locally |
| `CLIENT_URL` | API | Allowed frontend origin(s), comma-separated |
| `MONGODB_URI` | API | Local MongoDB URI or Atlas connection string |
| `JWT_SECRET` | API | Long, random signing secret; never commit it |
| `JWT_EXPIRES_IN` | API | JWT lifetime, for example `7d` |
| `STRIPE_SECRET_KEY` | API | Stripe test secret key (`sk_test_...`) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Client | Stripe test publishable key (`pk_test_...`) |
| `CLOUDINARY_CLOUD_NAME` | API | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | API | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | API | Cloudinary API secret |
| `SEED_ADMIN_NAME` | Seed | Initial administrator display name |
| `SEED_ADMIN_EMAIL` | Seed | Initial administrator email |
| `SEED_ADMIN_PASSWORD` | Seed | Initial administrator password (minimum 8 characters) |
| `VITE_API_URL` | Client | API base URL including `/api`; omit locally to use Vite proxy |

The root `.env` is read by both workspaces. Vite only exposes variables prefixed with `VITE_` to browser code.

## Features

- Responsive product discovery, search, category filtering, sorting, and pagination
- JWT registration, login, protected account pages, and saved shipping address
- Redux Toolkit auth/product state and local-storage cart persistence
- Stripe Payment Element in test mode; the API derives prices from MongoDB and verifies the succeeded PaymentIntent before creating an order
- Stock checks during payment-intent creation and order finalization
- Verified-purchase product reviews with calculated average ratings
- Admin dashboard for store metrics, catalog CRUD, Cloudinary image uploads, order status, and customer account controls
- Helmet security headers, CORS allow-list, API/auth rate limiting, Mongo operator sanitization, request validation, upload type/size restrictions, and centralized errors

## API Endpoints

All endpoints are prefixed with `/api`. Protected endpoints require `Authorization: Bearer <token>`; admin endpoints also require the admin role.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/health` | Public | Health check |
| `POST` | `/auth/register` | Public | Create an account |
| `POST` | `/auth/login` | Public | Sign in |
| `GET`, `PATCH` | `/auth/profile` | User | Read/update profile |
| `GET` | `/products` | Public | Search/filter/sort/paginate products |
| `GET` | `/products/categories` | Public | List categories |
| `GET` | `/products/:slug` | Public | Product details and recent reviews |
| `POST`, `PATCH`, `DELETE` | `/products`, `/products/:id` | Admin | Product CRUD |
| `POST` | `/payments/intent` | User | Create a server-priced Stripe PaymentIntent |
| `POST` | `/orders` | User | Verify payment and create an order |
| `GET` | `/orders/mine` | User | List current user's orders |
| `GET` | `/orders/:id` | Owner/admin | Read one order |
| `PATCH` | `/orders/:id/status` | Admin | Update fulfillment status |
| `GET`, `POST` | `/products/:productId/reviews` | Public/user | List or submit verified-purchase reviews |
| `POST` | `/uploads/image` | Admin | Upload one product image to Cloudinary |
| `GET` | `/admin/dashboard` | Admin | Store metrics |
| `GET` | `/admin/orders` | Admin | List all orders |
| `GET`, `PATCH` | `/admin/users`, `/admin/users/:id` | Admin | List/update customer access and role |

## Deployment

### MongoDB Atlas

Create a database user with a strong password, create a database, and configure Atlas Network Access for the Render service. Prefer a narrow IP allow-list where your hosting setup supports it; avoid leaving unrestricted database access enabled longer than needed.

### Render API

The included `render.yaml` defines the web service. Connect the repository to Render and deploy the blueprint. Set `MONGODB_URI`, `CLIENT_URL` (the exact Vercel origin), Stripe test secret, Cloudinary credentials, and seed admin values in Render's environment settings. Render uses the root npm workspace and the `/api/health` health check. Run the seed script once from the Render shell after the database environment is configured:

```bash
npm run seed
```

### Vercel client

Import the repository in Vercel and set the project root directory to `client`. Use the Vite defaults (`npm run build`, output directory `dist`). The included `client/vercel.json` rewrites client-side routes to the React entry point. Set:

- `VITE_API_URL` to `https://<your-render-service>.onrender.com/api`
- `VITE_STRIPE_PUBLISHABLE_KEY` to the Stripe test publishable key

Update Render's `CLIENT_URL` to the deployed Vercel origin and redeploy the API. Never expose `STRIPE_SECRET_KEY`, `JWT_SECRET`, or `CLOUDINARY_API_SECRET` as Vercel variables.

### Production checklist

- Replace all example secrets and rotate the seed admin password after first sign-in.
- Restrict Atlas network access and use least-privilege database credentials.
- Configure the exact production origin in `CLIENT_URL`; do not use `*` for credentialed CORS.
- Configure Stripe live keys and production payment/webhook handling before accepting real payments. This project intentionally uses test-mode PaymentIntents; it does not include a Stripe webhook, refunds dashboard, tax calculation, or transactional inventory reservation.
- Add monitoring, structured logging, backups, and automated tests before handling real customer data.

## Screenshots

The source includes the finished responsive storefront and admin UI, but no screenshots are committed because this workspace does not have Node.js/dependencies configured to run the app here. After starting the app, capture the home, product detail, checkout, and admin views and add them under `docs/screenshots/`; link them here for a polished portfolio README.

## Build

```bash
npm run build
npm test --workspace server
```

## License

This project is provided as a portfolio starter. Add a license before redistributing it.

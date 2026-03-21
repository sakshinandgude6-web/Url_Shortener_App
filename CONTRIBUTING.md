# Contributing to URL Shortener App

Thank you for your interest in contributing! This is a full-stack monorepo with a Node.js/Express backend and a React frontend. Please read this guide before opening a pull request.

---

## Table of contents

1. [Getting started](#getting-started)
2. [Development setup](#development-setup)
3. [Project structure](#project-structure)
4. [Making changes](#making-changes)
5. [Code style](#code-style)
6. [Testing](#testing)
7. [Pull request process](#pull-request-process)
8. [Reporting issues](#reporting-issues)

---

## Getting started

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB Atlas account (or local MongoDB)
- Git
- Postman (recommended for API testing)

### Fork and clone

```bash
# Fork this repo on GitHub, then:
git clone https://github.com/YOUR_USERNAME/Url_Shortener_App.git
cd Url_Shortener_App
git remote add upstream https://github.com/sakshi-nandgude/Url_Shortener_App.git
```

---

## Development setup

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in your values
npm run dev            # starts on http://localhost:5000
```

Required `.env` variables (see `.env.example`):

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
BASE_URL=http://localhost:5000
```

### Frontend

```bash
cd frontend-app
npm install
cp .env.example .env   # set REACT_APP_API_BASE_URL
npm start              # starts on http://localhost:3000
```

### Running both together

Open two terminal windows — one for `backend`, one for `frontend-app`. The frontend proxies API calls to `localhost:5000`.

---

## Project structure

```
Url_Shortener_App/
├── backend/
│   ├── routes/          ← Express route definitions
│   ├── controllers/     ← Request handlers
│   ├── middleware/       ← JWT auth, error handling
│   ├── models/          ← Mongoose schemas (User, Url)
│   └── utils/           ← Short code generator, validators
└── frontend-app/
    ├── src/
    │   ├── pages/       ← Login, Register, Dashboard
    │   └── components/  ← Reusable UI components
    └── public/
```

---

## Making changes

### Branch naming

```
feature/add-custom-short-codes
feature/add-qr-code-generation
fix/click-count-race-condition
docs/add-postman-collection-guide
test/add-redirect-endpoint-test
```

### Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add custom short code support
fix: correct click count not incrementing on redirect
feat: add link expiry (TTL) option
test: add Postman test for unauthorized delete
docs: document redirect engine behaviour
```

---

## Code style

**Backend (Node.js)**
- Use `async/await` — no `.then()` chains
- All protected routes must go through the `authMiddleware`
- Ownership checks are required for any route that modifies a URL (`req.user.id === url.owner`)
- Short code generation logic lives in `utils/` — keep it separate from controllers
- Input validation (URL format, empty fields) must happen before any DB call

**Frontend (React)**
- Functional components with hooks only
- All API calls must use `REACT_APP_API_BASE_URL` from env — never hardcode the backend URL
- Token handling is centralised — don't add localStorage logic outside the auth utility file
- Keep page components in `pages/`, reusable pieces in `components/`

---

## Testing

A Postman collection is included at the repo root (`url-shortener.postman_test_run.json`).

**To run the Postman tests:**
1. Import the collection into Postman
2. Set up an environment with `base_url = http://localhost:5000`
3. Run the collection — it handles token management automatically

**Test coverage expected for new features:**
- Happy path (successful request with valid auth)
- Auth failure (no token, expired token)
- Ownership failure (user B trying to delete user A's URL)
- Invalid inputs (empty URL, malformed URL, missing fields)

Please add any new scenarios to the Postman collection and export the updated file as part of your PR.

---

## Pull request process

1. Keep your branch up to date:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```
2. Test manually using Postman and verify in the browser
3. Open a PR against `main`
4. Describe what changed, why, and include Postman test results if relevant

**PR checklist:**
- [ ] `.env.example` updated if new environment variables were added
- [ ] All protected routes use `authMiddleware`
- [ ] Ownership checks in place for user-owned resources
- [ ] Postman collection updated for any new endpoints
- [ ] No secrets or tokens committed
- [ ] Both backend and frontend start cleanly with the setup instructions above

---

## Reporting issues

Open a [GitHub Issue](https://github.com/sakshi-nandgude/Url_Shortener_App/issues) with:

- A clear description of the bug or feature
- Steps to reproduce (for bugs)
- Expected vs actual behaviour
- Node.js version and OS

---

**Maintained by [Sakshi Vijay Nandgude](https://github.com/sakshi-nandgude)**

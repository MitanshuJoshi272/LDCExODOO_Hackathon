# 🌍 GlobeTrotter Backend (FastAPI & Python)

A high-performance, asynchronous REST API for the **GlobeTrotter** Itinerary Planning & Budget Optimization Platform.

Built with **FastAPI**, **SQLAlchemy ORM**, **Pydantic v2**, and **Python 3.14**.

---

## 🚀 Features

- **JWT Authentication & User Management**: Secure register, login, profile editing, and destination bookmarks.
- **Destinations & Catalog**: Complete searchable repository of international destinations with lodging, living costs, cost indices, and tags.
- **Curated Activities**: Category-tagged activities with durations, costs, and city associations.
- **Itinerary & Stop Management**: Multi-stop trip planning with chronological ordering, stop reordering, note-taking, and activity toggling.
- **Precision Budget Calculation & Optimization Engine**: Real-time lodging, daily living, activities, and transport calculations with budget cap variance and AI cost-saving recommendations.
- **AI Smart Itinerary Generator**: Algorithmic itinerary recommendation engine that generates optimal multi-city routes and activity schedules based on travel style and budget.
- **Smart Packing Checklist Generator**: Context-aware packing lists based on trip season, weather, and activity categories.
- **Multi-Format Export**: Export itineraries directly to **CSV** and **iCalendar (.ics)** format for syncing with Google Calendar, Apple Calendar, and Microsoft Outlook.
- **Admin Analytics Dashboard**: Metrics API for trip stats, popular destination counts, and activity audit logs.
- **Automated Test Suite**: Pytest suite testing authentication, CRUD, calculations, and AI recommendations.

---

## 🛠️ Tech Stack

- **Framework**: FastAPI
- **Server**: Uvicorn
- **ORM & Database**: SQLAlchemy (SQLite out-of-the-box, easily configurable for PostgreSQL)
- **Validation**: Pydantic v2
- **Auth**: PyJWT + PBKDF2-HMAC-SHA256 password hashing
- **Testing**: Pytest + HTTPX / TestClient

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Run the Development Server
```bash
python run.py
```
*Or with uvicorn directly:*
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The server will automatically create the SQLite database (`globetrotter.db`) and seed it with initial cities, activities, demo user (`maya@globetrotter.io`), admin account, and sample trips on first startup.

---

## 📖 API Documentation

Once the server is running, visit:
- **Interactive Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc UI**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 📡 Key API Endpoints

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user and receive JWT token |
| `POST` | `/api/auth/login` | Login with email and password |
| `GET` | `/api/auth/me` | Get current authenticated user profile |
| `POST` | `/api/auth/reset-password` | Request password reset instructions |

### 👤 Users (`/api/users`)
| Method | Endpoint | Description |
|---|---|---|
| `PUT` | `/api/users/profile` | Update user profile (name, avatar, language) |
| `POST` | `/api/users/saved-destinations/{city_id}` | Bookmark a city |
| `DELETE` | `/api/users/saved-destinations/{city_id}` | Remove city bookmark |
| `DELETE` | `/api/users/me` | Delete current user account & data |

### 🏙️ Cities & Activities (`/api/cities`, `/api/activities`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/cities` | List cities with filters (`region`, `maxBudget`, `query`) |
| `GET` | `/api/cities/{city_id}` | Get single city details |
| `GET` | `/api/activities` | List activities (`cityId`, `category`, `maxCost`, `query`) |
| `GET` | `/api/activities/{activity_id}` | Get single activity |

### ✈️ Trips & Itineraries (`/api/trips`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/trips` | List all trips |
| `GET` | `/api/trips/{trip_id}` | Get full trip details |
| `GET` | `/api/trips/public/{trip_id}` | Get shared public trip (read-only) |
| `POST` | `/api/trips` | Create new trip |
| `PUT` | `/api/trips/{trip_id}` | Update trip attributes |
| `DELETE` | `/api/trips/{trip_id}` | Delete trip |
| `POST` | `/api/trips/{trip_id}/duplicate` | Duplicate an itinerary |
| `GET` | `/api/trips/{trip_id}/export/csv` | Download itinerary as CSV |
| `GET` | `/api/trips/{trip_id}/export/ics` | Download itinerary as iCalendar (.ics) |

### 📍 Stops Management (`/api/trips/{trip_id}/stops`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/trips/{trip_id}/stops` | Add a stop to itinerary |
| `PUT` | `/api/trips/{trip_id}/stops/{stop_id}` | Update a stop |
| `DELETE` | `/api/trips/{trip_id}/stops/{stop_id}` | Delete a stop |
| `POST` | `/api/trips/{trip_id}/stops/reorder` | Reorder stops (move up / down) |
| `POST` | `/api/trips/{trip_id}/stops/{stop_id}/activities/{activity_id}/toggle` | Toggle activity inclusion in stop |

### 💰 Budget & Cost Engine (`/api/trips/{trip_id}`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/trips/{trip_id}/cost` | Complete calculated breakdown |
| `GET` | `/api/trips/{trip_id}/budget-optimization` | AI tips, category distribution & savings |

### 🤖 AI & Smart Tools (`/api/ai`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ai/suggest-itinerary` | Generate AI travel plan based on style, region, budget |
| `GET` | `/api/ai/packing-list/{trip_id}` | Generate weather & activity-based packing list |

### 📊 Admin (`/api/admin`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/metrics` | Platform KPIs and destination popularity stats |
| `GET` | `/api/admin/logs` | Audit trail of recent user actions |

---

## 🧪 Running Tests

Run the complete test suite:
```bash
pytest app/tests -v
```

---

## 🔑 Default Credentials

- **Demo User**:
  - Email: `maya@globetrotter.io`
  - Password: `password`
- **Administrator**:
  - Email: `admin@globetrotter.io`
  - Password: `adminpassword`

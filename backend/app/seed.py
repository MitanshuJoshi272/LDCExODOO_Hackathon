from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.city import City
from app.models.activity import Activity
from app.models.trip import Trip
from app.models.stop import Stop
from app.models.log import ActivityLog
from app.services.auth import hash_password

SEED_CITIES = [
    {
        "id": "kyoto",
        "name": "Kyoto",
        "country": "Japan",
        "region": "Asia",
        "image": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop",
        "blurb": "Temple gardens, tea houses and lantern-lit lanes. Slow mornings, early sunsets.",
        "lodging_per_night": 8000.0,
        "daily_living_cost": 4800.0,
        "cost_index": 3,
        "popularity": 94,
        "tags": ["Temples", "Food", "Walkable", "Culture"]
    },
    {
        "id": "lisbon",
        "name": "Lisbon",
        "country": "Portugal",
        "region": "Europe",
        "image": "https://images.unsplash.com/photo-1509840144299-db508400a780?w=800&auto=format&fit=crop",
        "blurb": "Tiled hills, tram lines and long dinners. Good value for a European capital.",
        "lodging_per_night": 6500.0,
        "daily_living_cost": 3750.0,
        "cost_index": 2,
        "popularity": 91,
        "tags": ["Coastal", "Nightlife", "Budget", "History"]
    },
    {
        "id": "marrakech",
        "name": "Marrakech",
        "country": "Morocco",
        "region": "Africa",
        "image": "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800&auto=format&fit=crop",
        "blurb": "Riads, souks and desert day trips. Dense, loud and cheap once you are inside the walls.",
        "lodging_per_night": 4500.0,
        "daily_living_cost": 2650.0,
        "cost_index": 1,
        "popularity": 82,
        "tags": ["Markets", "Desert", "Budget", "Culture"]
    },
    {
        "id": "reykjavik",
        "name": "Reykjavík",
        "country": "Iceland",
        "region": "Europe",
        "image": "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&auto=format&fit=crop",
        "blurb": "A small city used as a launchpad for waterfalls, lava fields and northern lights.",
        "lodging_per_night": 14000.0,
        "daily_living_cost": 8000.0,
        "cost_index": 5,
        "popularity": 77,
        "tags": ["Nature", "Road trip", "Cold", "Adventure"]
    },
    {
        "id": "cape-town",
        "name": "Cape Town",
        "country": "South Africa",
        "region": "Africa",
        "image": "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&auto=format&fit=crop",
        "blurb": "Mountain on one side, two oceans on the other. Wine country an hour inland.",
        "lodging_per_night": 6000.0,
        "daily_living_cost": 3300.0,
        "cost_index": 2,
        "popularity": 85,
        "tags": ["Mountains", "Wine", "Coastal", "Nature"]
    },
    {
        "id": "mexico-city",
        "name": "Mexico City",
        "country": "Mexico",
        "region": "Americas",
        "image": "https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&auto=format&fit=crop",
        "blurb": "Jacaranda streets, museum days and the best street food per dollar anywhere.",
        "lodging_per_night": 5300.0,
        "daily_living_cost": 3000.0,
        "cost_index": 2,
        "popularity": 89,
        "tags": ["Food", "Museums", "Budget", "Culture"]
    },
    {
        "id": "queenstown",
        "name": "Queenstown",
        "country": "New Zealand",
        "region": "Oceania",
        "image": "https://images.unsplash.com/photo-1589802829985-817e51171b92?w=800&auto=format&fit=crop",
        "blurb": "Alpine lake town built around being outside. Everything costs a little more here.",
        "lodging_per_night": 11800.0,
        "daily_living_cost": 6500.0,
        "cost_index": 4,
        "popularity": 74,
        "tags": ["Adventure", "Lakes", "Hiking", "Nature"]
    },
    {
        "id": "barcelona",
        "name": "Barcelona",
        "country": "Spain",
        "region": "Europe",
        "image": "https://images.unsplash.com/photo-1583779457094-0cfcf3600897?w=800&auto=format&fit=crop",
        "blurb": "Modernist rooftops, beach afternoons and a city that eats late by default.",
        "lodging_per_night": 8600.0,
        "daily_living_cost": 4650.0,
        "cost_index": 3,
        "popularity": 93,
        "tags": ["Beach", "Architecture", "Nightlife", "Food"]
    },
    {
        "id": "hanoi",
        "name": "Hanoi",
        "country": "Vietnam",
        "region": "Asia",
        "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop",
        "blurb": "Old Quarter chaos, lake mornings and the cheapest great meals on this list.",
        "lodging_per_night": 3150.0,
        "daily_living_cost": 2000.0,
        "cost_index": 1,
        "popularity": 80,
        "tags": ["Street food", "Budget", "Old town", "Culture"]
    },
    {
        "id": "rome",
        "name": "Rome",
        "country": "Italy",
        "region": "Europe",
        "image": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop",
        "blurb": "Ancient amphitheaters, cobblestone piazzas, and endless espresso bars.",
        "lodging_per_night": 9500.0,
        "daily_living_cost": 5150.0,
        "cost_index": 3,
        "popularity": 95,
        "tags": ["History", "Architecture", "Food", "Culture"]
    },
    {
        "id": "bali",
        "name": "Bali",
        "country": "Indonesia",
        "region": "Asia",
        "image": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop",
        "blurb": "Emerald rice terraces, surf breaks, wellness retreats, and coastal sunsets.",
        "lodging_per_night": 3750.0,
        "daily_living_cost": 2300.0,
        "cost_index": 1,
        "popularity": 92,
        "tags": ["Beach", "Nature", "Budget", "Wellness"]
    },
    {
        "id": "tokyo",
        "name": "Tokyo",
        "country": "Japan",
        "region": "Asia",
        "image": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop",
        "blurb": "Futuristic skyline meets timeless shrine alleys, ramen havens, and neon-lit nights.",
        "lodging_per_night": 10000.0,
        "daily_living_cost": 5400.0,
        "cost_index": 3,
        "popularity": 97,
        "tags": ["Food", "Nightlife", "Shopping", "Culture"]
    }
]

SEED_ACTIVITIES = [
    # Kyoto
    {"id": "kyo-1", "city_id": "kyoto", "name": "Fushimi Inari at sunrise", "category": "Culture", "duration_hours": 3.0, "cost": 0.0, "description": "Walk the torii gates before the crowds arrive."},
    {"id": "kyo-2", "city_id": "kyoto", "name": "Nishiki Market food crawl", "category": "Food", "duration_hours": 2.0, "cost": 2300.0, "description": "Six stalls, one long lunch."},
    {"id": "kyo-3", "city_id": "kyoto", "name": "Arashiyama bamboo & monkey park", "category": "Nature", "duration_hours": 4.0, "cost": 1000.0, "description": "Half day west of the city by train."},
    {"id": "kyo-4", "city_id": "kyoto", "name": "Tea ceremony in Gion", "category": "Culture", "duration_hours": 2.0, "cost": 4500.0, "description": "Small-group matcha ceremony with a host."},
    {"id": "kyo-5", "city_id": "kyoto", "name": "Pontocho izakaya night", "category": "Nightlife", "duration_hours": 3.0, "cost": 3700.0, "description": "Riverside alley, standing bars, late."},

    # Lisbon
    {"id": "lis-1", "city_id": "lisbon", "name": "Alfama walking tour", "category": "Culture", "duration_hours": 3.0, "cost": 1800.0, "description": "The oldest quarter, on foot and mostly uphill."},
    {"id": "lis-2", "city_id": "lisbon", "name": "Time Out Market dinner", "category": "Food", "duration_hours": 2.0, "cost": 2500.0, "description": "Chef stalls under one roof."},
    {"id": "lis-3", "city_id": "lisbon", "name": "Sintra day trip", "category": "Nature", "duration_hours": 8.0, "cost": 3500.0, "description": "Palaces in the hills, 40 minutes by train."},
    {"id": "lis-4", "city_id": "lisbon", "name": "Fado night in Bairro Alto", "category": "Nightlife", "duration_hours": 3.0, "cost": 2900.0, "description": "Dinner and live fado in a small room."},
    {"id": "lis-5", "city_id": "lisbon", "name": "Surf lesson at Costa da Caparica", "category": "Adventure", "duration_hours": 4.0, "cost": 4000.0, "description": "Board, wetsuit and instructor included."},

    # Marrakech
    {"id": "mar-1", "city_id": "marrakech", "name": "Souk navigation walk", "category": "Culture", "duration_hours": 3.0, "cost": 1500.0, "description": "A guide is worth it the first time."},
    {"id": "mar-2", "city_id": "marrakech", "name": "Agafay desert sunset", "category": "Adventure", "duration_hours": 6.0, "cost": 5400.0, "description": "Camp dinner in the stone desert."},
    {"id": "mar-3", "city_id": "marrakech", "name": "Tagine cooking class", "category": "Food", "duration_hours": 4.0, "cost": 3300.0, "description": "Market shop, then cook what you bought."},
    {"id": "mar-4", "city_id": "marrakech", "name": "Jardin Majorelle", "category": "Nature", "duration_hours": 2.0, "cost": 1250.0, "description": "Cobalt walls and cactus beds. Book ahead."},

    # Reykjavík
    {"id": "rey-1", "city_id": "reykjavik", "name": "Golden Circle self-drive", "category": "Nature", "duration_hours": 8.0, "cost": 7900.0, "description": "Geysir, Gullfoss and Þingvellir in one loop."},
    {"id": "rey-2", "city_id": "reykjavik", "name": "Sky Lagoon soak", "category": "Nature", "duration_hours": 3.0, "cost": 6500.0, "description": "Geothermal water, ocean horizon."},
    {"id": "rey-3", "city_id": "reykjavik", "name": "Northern lights chase", "category": "Adventure", "duration_hours": 5.0, "cost": 9100.0, "description": "Guided, weather-dependent, free re-run."},
    {"id": "rey-4", "city_id": "reykjavik", "name": "Glacier hike on Sólheimajökull", "category": "Adventure", "duration_hours": 7.0, "cost": 11200.0, "description": "Crampons and guide provided."},

    # Cape Town
    {"id": "cpt-1", "city_id": "cape-town", "name": "Table Mountain hike", "category": "Nature", "duration_hours": 5.0, "cost": 0.0, "description": "Platteklip Gorge up, cable car down."},
    {"id": "cpt-2", "city_id": "cape-town", "name": "Cape Peninsula drive", "category": "Nature", "duration_hours": 8.0, "cost": 5800.0, "description": "Chapman’s Peak, penguins, Cape Point."},
    {"id": "cpt-3", "city_id": "cape-town", "name": "Stellenbosch wine tasting", "category": "Food", "duration_hours": 6.0, "cost": 7000.0, "description": "Three estates with a driver."},
    {"id": "cpt-4", "city_id": "cape-town", "name": "Bo-Kaap food walk", "category": "Food", "duration_hours": 3.0, "cost": 2650.0, "description": "Cape Malay cooking and coloured houses."},

    # Mexico City
    {"id": "mex-1", "city_id": "mexico-city", "name": "Teotihuacán pyramids", "category": "Culture", "duration_hours": 7.0, "cost": 4500.0, "description": "Early bus out to beat the heat."},
    {"id": "mex-2", "city_id": "mexico-city", "name": "Taco crawl in Roma", "category": "Food", "duration_hours": 3.0, "cost": 2100.0, "description": "Five stands, one guide, no cutlery."},
    {"id": "mex-3", "city_id": "mexico-city", "name": "Museo Frida Kahlo", "category": "Culture", "duration_hours": 2.0, "cost": 1500.0, "description": "Casa Azul in Coyoacán. Timed entry."},
    {"id": "mex-4", "city_id": "mexico-city", "name": "Xochimilco boat afternoon", "category": "Nightlife", "duration_hours": 4.0, "cost": 2500.0, "description": "Trajinera, mariachi, michelada."},

    # Queenstown
    {"id": "qtn-1", "city_id": "queenstown", "name": "Routeburn day walk", "category": "Nature", "duration_hours": 8.0, "cost": 3300.0, "description": "Shuttle to the trailhead, alpine views."},
    {"id": "qtn-2", "city_id": "queenstown", "name": "Kawarau bungy", "category": "Adventure", "duration_hours": 2.0, "cost": 13700.0, "description": "The original 43m jump."},
    {"id": "qtn-3", "city_id": "queenstown", "name": "Milford Sound cruise", "category": "Nature", "duration_hours": 12.0, "cost": 15800.0, "description": "Long day, hard to skip."},
    {"id": "qtn-4", "city_id": "queenstown", "name": "Gibbston winery ride", "category": "Food", "duration_hours": 5.0, "cost": 7300.0, "description": "Cycle between four cellar doors."},

    # Barcelona
    {"id": "bcn-1", "city_id": "barcelona", "name": "Sagrada Família", "category": "Culture", "duration_hours": 2.0, "cost": 2800.0, "description": "Book the tower slot weeks ahead."},
    {"id": "bcn-2", "city_id": "barcelona", "name": "Gothic Quarter tapas route", "category": "Food", "duration_hours": 3.0, "cost": 3700.0, "description": "Vermouth, anchovies, standing room."},
    {"id": "bcn-3", "city_id": "barcelona", "name": "Park Güell morning", "category": "Nature", "duration_hours": 3.0, "cost": 1500.0, "description": "Mosaic terraces above the city."},
    {"id": "bcn-4", "city_id": "barcelona", "name": "Barceloneta beach day", "category": "Nature", "duration_hours": 5.0, "cost": 1000.0, "description": "Chiringuito lunch, sun lounger."},

    # Hanoi
    {"id": "han-1", "city_id": "hanoi", "name": "Old Quarter street food tour", "category": "Food", "duration_hours": 3.0, "cost": 1650.0, "description": "Bún chả, bánh mì, egg coffee."},
    {"id": "han-2", "city_id": "hanoi", "name": "Ha Long Bay overnight", "category": "Nature", "duration_hours": 30.0, "cost": 10800.0, "description": "Sleeps on the boat, kayaks included."},
    {"id": "han-3", "city_id": "hanoi", "name": "Train Street coffee", "category": "Culture", "duration_hours": 1.0, "cost": 400.0, "description": "Time it with the 19:00 service."},
    {"id": "han-4", "city_id": "hanoi", "name": "Motorbike food ride", "category": "Adventure", "duration_hours": 4.0, "cost": 2900.0, "description": "On the back, helmet on, six stops."},

    # Rome
    {"id": "rom-1", "city_id": "rome", "name": "Colosseum & Roman Forum VIP Tour", "category": "Culture", "duration_hours": 3.5, "cost": 4150.0, "description": "Gladiator floor access and ancient ruins."},
    {"id": "rom-2", "city_id": "rome", "name": "Trastevere evening food & wine trail", "category": "Food", "duration_hours": 3.0, "cost": 3700.0, "description": "Pasta carbonara, supplì, and Chianti tastings."},
    {"id": "rom-3", "city_id": "rome", "name": "Vatican Museums & Sistine Chapel", "category": "Culture", "duration_hours": 3.0, "cost": 3150.0, "description": "Michelangelo masterpieces and St. Peter's Basilica."},

    # Bali
    {"id": "bal-1", "city_id": "bali", "name": "Ubud Rice Terrace & Sacred Monkey Forest", "category": "Nature", "duration_hours": 5.0, "cost": 2100.0, "description": "Lush emerald terraces and traditional temple monkeys."},
    {"id": "bal-2", "city_id": "bali", "name": "Mount Batur Sunrise Volcano Trek", "category": "Adventure", "duration_hours": 6.0, "cost": 4500.0, "description": "Hike above the clouds for sunrise breakfast."},
    {"id": "bal-3", "city_id": "bali", "name": "Canggu Surf Lesson & Sunset Beach Club", "category": "Adventure", "duration_hours": 4.0, "cost": 2900.0, "description": "Wave riding followed by live DJ sets on the sand."},

    # Tokyo
    {"id": "tok-1", "city_id": "tokyo", "name": "Shinjuku Omoide Yokocho Food Tour", "category": "Food", "duration_hours": 2.5, "cost": 3300.0, "description": "Yakitori skewers and highballs in Memory Lane."},
    {"id": "tok-2", "city_id": "tokyo", "name": "teamLab Planets Immersive Digital Art", "category": "Culture", "duration_hours": 2.0, "cost": 2650.0, "description": "Walk through water and infinite crystal universes."},
    {"id": "tok-3", "city_id": "tokyo", "name": "Shibuya Sky Observation & Scramble Walk", "category": "Culture", "duration_hours": 2.0, "cost": 1800.0, "description": "360-degree open-air panorama overlooking Tokyo."}
]

def seed_database(db: Session):
    """Seed initial cities, activities, users, trips, and logs if not present."""
    # 1. Seed Cities
    for city_data in SEED_CITIES:
        existing = db.query(City).filter(City.id == city_data["id"]).first()
        if not existing:
            city = City(**city_data)
            db.add(city)
    db.commit()

    # 2. Seed Activities
    for act_data in SEED_ACTIVITIES:
        existing = db.query(Activity).filter(Activity.id == act_data["id"]).first()
        if not existing:
            act = Activity(**act_data)
            db.add(act)
    db.commit()

    # 3. Seed Users
    maya = db.query(User).filter(User.email == "maya@globetrotter.io").first()
    if not maya:
        maya = User(
            id="user-maya",
            name="Maya Rao",
            email="maya@globetrotter.io",
            hashed_password=hash_password("password"),
            avatar="MR",
            language="English",
            role="admin",
            saved_destinations=["lisbon", "kyoto"]
        )
        db.add(maya)

    admin = db.query(User).filter(User.email == "admin@globetrotter.io").first()
    if not admin:
        admin = User(
            id="user-admin",
            name="Administrator",
            email="admin@globetrotter.io",
            hashed_password=hash_password("adminpassword"),
            avatar="AD",
            language="English",
            role="admin",
            saved_destinations=[]
        )
        db.add(admin)

    john = db.query(User).filter(User.email == "john@example.com").first()
    if not john:
        john = User(
            id="user-john",
            name="John Doe",
            email="john@example.com",
            hashed_password=hash_password("password"),
            avatar="JD",
            language="English",
            role="user",
            saved_destinations=["barcelona"]
        )
        db.add(john)
    db.commit()

    # 4. Seed Sample Trips
    trip_iberia = db.query(Trip).filter(Trip.id == "trip-iberia").first()
    if not trip_iberia:
        trip_iberia = Trip(
            id="trip-iberia",
            user_id="user-maya",
            name="Iberian Slow Loop",
            description="Three weeks moving south along the coast, mostly by train, with two long stops instead of five short ones.",
            cover_image="https://images.unsplash.com/photo-1509840144299-db508400a780?w=800&auto=format&fit=crop",
            start_date="2026-09-12",
            budget_cap=350000.0,
            travelers=2,
            is_public=True
        )
        db.add(trip_iberia)
        db.flush()

        stops_iberia = [
            Stop(
                id="stop-lis",
                trip_id="trip-iberia",
                city_id="lisbon",
                start_date="2026-09-12",
                end_date="2026-09-17",
                notes="Flat in Graça. Sintra on the first clear day.",
                transport_cost=40000.0,
                order_index=0,
                activity_ids=["lis-1", "lis-3", "lis-4"]
            ),
            Stop(
                id="stop-bcn",
                trip_id="trip-iberia",
                city_id="barcelona",
                start_date="2026-09-17",
                end_date="2026-09-22",
                notes="Sagrada Família tickets already booked for the 18th.",
                transport_cost=9100.0,
                order_index=1,
                activity_ids=["bcn-1", "bcn-2", "bcn-4"]
            ),
            Stop(
                id="stop-mar",
                trip_id="trip-iberia",
                city_id="marrakech",
                start_date="2026-09-22",
                end_date="2026-09-27",
                notes="Riad in the medina, desert night mid-stay.",
                transport_cost=12000.0,
                order_index=2,
                activity_ids=["mar-1", "mar-2", "mar-3"]
            )
        ]
        db.add_all(stops_iberia)

        trip_japan = db.query(Trip).filter(Trip.id == "trip-japan").first()
        if not trip_japan:
            trip_japan = Trip(
                id="trip-japan",
                user_id="user-maya",
                name="Kyoto in Autumn",
                description="A short, single-city trip built around temple season.",
                cover_image="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop",
                start_date="2026-11-08",
                budget_cap=215000.0,
                travelers=1,
                is_public=False
            )
            db.add(trip_japan)
            db.flush()

            stop_japan = Stop(
                id="stop-kyo",
                trip_id="trip-japan",
                city_id="kyoto",
                start_date="2026-11-08",
                end_date="2026-11-15",
                notes="Rail pass covers the day trips.",
                transport_cost=74000.0,
                order_index=0,
                activity_ids=["kyo-1", "kyo-2", "kyo-4"]
            )
            db.add(stop_japan)
    db.commit()

    # 5. Seed Activity Logs
    if db.query(ActivityLog).count() == 0:
        logs = [
            ActivityLog(user_name="Maya Rao", user_email="maya@globetrotter.io", action="Created trip", details="Iberian Slow Loop", timestamp=datetime.utcnow() - timedelta(minutes=5)),
            ActivityLog(user_name="John Doe", user_email="john@example.com", action="Added stop", details="Kyoto (4 nights)", timestamp=datetime.utcnow() - timedelta(minutes=14)),
            ActivityLog(user_name="Administrator", user_email="admin@globetrotter.io", action="Modified cost index", details="Rome lodging: ₹9,500", timestamp=datetime.utcnow() - timedelta(hours=1)),
            ActivityLog(user_name="Sarah Jenkins", user_email="sarah@example.com", action="Duplicated shared plan", details="Copy of Iberian Slow Loop", timestamp=datetime.utcnow() - timedelta(hours=3)),
            ActivityLog(user_name="Maya Rao", user_email="maya@globetrotter.io", action="Added activity", details="Fado & Tapas in Lisbon", timestamp=datetime.utcnow() - timedelta(hours=4))
        ]
        db.add_all(logs)
        db.commit()

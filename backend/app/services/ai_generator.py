from datetime import datetime, timedelta
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from app.models.city import City
from app.models.activity import Activity
from app.models.trip import Trip
from app.schemas.ai import (
    AISuggestRequest,
    AISuggestResponse,
    AISuggestedStop,
    PackingListResponse,
    PackingCategory,
    PackingCategoryItem,
)

def add_days_to_iso(iso_str: str, days: int) -> str:
    try:
        dt = datetime.strptime(iso_str.strip()[:10], "%Y-%m-%d")
        dt += timedelta(days=days)
        return dt.strftime("%Y-%m-%d")
    except Exception:
        return iso_str

def generate_ai_itinerary(req: AISuggestRequest, db: Session) -> AISuggestResponse:
    # 1. Determine target cities
    selected_cities: List[City] = []
    
    if req.destination_city_id:
        primary_city = db.query(City).filter(City.id == req.destination_city_id).first()
        if primary_city:
            selected_cities.append(primary_city)
            # Find sibling city in same region if trip is long (>= 6 days)
            if req.duration_days >= 6:
                siblings = db.query(City).filter(
                    City.region == primary_city.region,
                    City.id != primary_city.id
                ).order_by(City.popularity.desc()).all()
                if siblings:
                    selected_cities.append(siblings[0])

    if not selected_cities:
        # Search by region
        region_query = db.query(City)
        if req.region and req.region != "All regions":
            region_query = region_query.filter(City.region.ilike(f"%{req.region}%"))
        
        available = region_query.order_by(City.popularity.desc()).all()
        if not available:
            available = db.query(City).order_by(City.popularity.desc()).all()
            
        if req.duration_days <= 4:
            selected_cities = available[:1]
        elif req.duration_days <= 8:
            selected_cities = available[:2]
        else:
            selected_cities = available[:3]

    if not selected_cities:
        # Fallback default
        selected_cities = db.query(City).limit(2).all()

    # 2. Divide nights across stops
    total_nights = max(req.duration_days - 1, 1)
    num_stops = len(selected_cities)
    base_nights = total_nights // num_stops
    remainder = total_nights % num_stops

    stops: List[AISuggestedStop] = []
    curr_date = req.start_date
    total_est_cost = 0.0

    for i, city in enumerate(selected_cities):
        stop_nights = base_nights + (1 if i < remainder else 0)
        stop_nights = max(stop_nights, 1)
        end_date = add_days_to_iso(curr_date, stop_nights)

        # Pick activities matching user interests
        city_activities = db.query(Activity).filter(Activity.city_id == city.id).all()
        
        matched_acts = [
            a for a in city_activities 
            if a.category in req.interests
        ]
        
        # If no strict category matches, take top activities
        if not matched_acts:
            matched_acts = city_activities[:3]
        else:
            matched_acts = matched_acts[:3]

        act_ids = [a.id for a in matched_acts]
        act_cost = sum(a.cost * req.travelers for a in matched_acts)

        lodging_cost = city.lodging_per_night * stop_nights
        living_cost = city.daily_living_cost * stop_nights * req.travelers
        transport_cost = 5000.0 * req.travelers if i > 0 else 0.0

        stop_total = lodging_cost + living_cost + act_cost + transport_cost
        total_est_cost += stop_total

        style_note = f"Focusing on {', '.join(req.interests) if req.interests else 'highlights'}."
        stops.append(AISuggestedStop(
            city_id=city.id,
            city_name=city.name,
            country=city.country,
            start_date=curr_date,
            end_date=end_date,
            nights=stop_nights,
            notes=f"{stop_nights} nights in {city.name}. {style_note}",
            recommended_activity_ids=act_ids,
            estimated_stop_cost=round(stop_total, 2)
        ))

        curr_date = end_date

    # Trip title & rationale
    city_names = " & ".join([c.name for c in selected_cities])
    primary_city = selected_cities[0]
    trip_name = f"{city_names} {req.travel_style or 'Discovery'} Loop"
    
    rationale = (
        f"Generated a {req.duration_days}-day itinerary covering {city_names} with a {req.travel_style.lower() if req.travel_style else 'balanced'} pace. "
        f"Selected {len(stops)} stops with curated experiences emphasizing {', '.join(req.interests)} within your budget cap."
    )

    return AISuggestResponse(
        name=trip_name,
        description=f"A curated {req.duration_days}-day journey through {city_names}, tailored for {req.travelers} traveler(s).",
        cover_image=primary_city.image,
        start_date=req.start_date,
        travelers=req.travelers,
        budget_cap=req.budget_cap,
        estimated_total_cost=round(total_est_cost, 2),
        stops=stops,
        ai_rationale=rationale
    )

def generate_smart_packing_list(trip: Trip, db: Session) -> PackingListResponse:
    cities_in_trip = []
    for stop in trip.stops:
        c = db.query(City).filter(City.id == stop.city_id).first()
        if c and c.name not in cities_in_trip:
            cities_in_trip.append(c.name)

    # Determine season from start date
    try:
        month = int(trip.start_date.split("-")[1])
        if month in [12, 1, 2]:
            season = "Winter"
            weather_desc = "Expect crisp to cold conditions, cooler evenings, and possible light precipitation."
        elif month in [3, 4, 5]:
            season = "Spring"
            weather_desc = "Mild and comfortable temperatures with occasional spring showers. Layering recommended."
        elif month in [6, 7, 8]:
            season = "Summer"
            weather_desc = "Warm to hot sunny days with long daylight hours. Sun protection is essential."
        else:
            season = "Autumn"
            weather_desc = "Pleasant daytime weather with cool, lantern-lit evenings."
    except Exception:
        season = "Temperate"
        weather_desc = "Moderate variable conditions across your journey."

    categories = [
        PackingCategory(
            category_name="Essential Documents & Currency",
            items=[
                PackingCategoryItem(item="Valid Passport & Visa documents", essential=True, tip="Ensure 6+ months validity remaining"),
                PackingCategoryItem(item="Travel Insurance Policy copy", essential=True),
                PackingCategoryItem(item="Multi-currency travel cards / Cash in local denomination", essential=True),
                PackingCategoryItem(item="Physical and offline digital trip reservations", essential=False)
            ]
        ),
        PackingCategory(
            category_name="Clothing & Apparel",
            items=[
                PackingCategoryItem(item="Breathable base layers & comfortable walking footwear", essential=True, tip="Expect 10k-15k steps/day in historical centers"),
                PackingCategoryItem(item="Lightweight packable rain jacket / Windbreaker", essential=True),
                PackingCategoryItem(item="Modest temple/cathedral attire (covered shoulders and knees)", essential=True, tip="Required for cultural sites in Asia and Southern Europe"),
                PackingCategoryItem(item="Smart casual evening outfits for dining and night events", essential=False)
            ]
        ),
        PackingCategory(
            category_name="Tech & Electronics",
            items=[
                PackingCategoryItem(item="Universal plug adapter (Type C/G/A)", essential=True),
                PackingCategoryItem(item="Portable high-capacity power bank (10,000mAh+)", essential=True),
                PackingCategoryItem(item="Noise-cancelling headphones for flights & trains", essential=False),
                PackingCategoryItem(item="Offline Maps downloaded on phone", essential=True)
            ]
        ),
        PackingCategory(
            category_name="Health & Toiletries",
            items=[
                PackingCategoryItem(item="Personal prescription medications & basic travel first-aid", essential=True),
                PackingCategoryItem(item="High-SPF Sunscreen & lip balm", essential=True),
                PackingCategoryItem(item="Reusable insulated water bottle", essential=False),
                PackingCategoryItem(item="Travel-size hand sanitizer and sanitizing wipes", essential=False)
            ]
        )
    ]

    return PackingListResponse(
        trip_id=trip.id,
        trip_name=trip.name,
        season=season,
        destinations=cities_in_trip,
        weather_summary=weather_desc,
        categories=categories
    )

import io
import csv
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.trip import Trip
from app.models.city import City
from app.models.activity import Activity
from app.services.budget_calculator import calculate_trip_cost

def export_trip_to_csv(trip: Trip, db: Session) -> str:
    cost = calculate_trip_cost(trip, db)
    output = io.StringIO()
    writer = csv.writer(output)

    # Trip Header
    writer.writerow(["Trip Name", trip.name])
    writer.writerow(["Description", trip.description])
    writer.writerow(["Start Date", trip.start_date])
    writer.writerow(["Travelers", trip.travelers])
    writer.writerow(["Budget Cap (INR)", trip.budget_cap])
    writer.writerow(["Calculated Total Cost (INR)", cost.total])
    writer.writerow(["Total Nights", cost.nights])
    writer.writerow([])

    # Stops Table Header
    writer.writerow([
        "Stop #",
        "City",
        "Country",
        "Start Date",
        "End Date",
        "Nights",
        "Lodging Cost (₹)",
        "Daily Living (₹)",
        "Activities (₹)",
        "Transport (₹)",
        "Total Stop Cost (₹)",
        "Notes",
        "Activities Included"
    ])

    for i, (stop, stop_cost) in enumerate(zip(trip.stops, cost.per_stop), 1):
        city = db.query(City).filter(City.id == stop.city_id).first()
        activities = []
        if stop.activity_ids:
            acts = db.query(Activity).filter(Activity.id.in_(stop.activity_ids)).all()
            activities = [a.name for a in acts]

        writer.writerow([
            i,
            city.name if city else stop.city_id,
            city.country if city else "",
            stop.start_date,
            stop.end_date,
            stop_cost.nights,
            stop_cost.lodging,
            stop_cost.living,
            stop_cost.activities,
            stop_cost.transport,
            stop_cost.total,
            stop.notes,
            "; ".join(activities)
        ])

    return output.getvalue()

def export_trip_to_ics(trip: Trip, db: Session) -> str:
    """Generate RFC 5545 iCalendar data for calendar apps."""
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//GlobeTrotter//Trip Planner//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        f"X-WR-CALNAME:{trip.name}",
    ]

    for i, stop in enumerate(trip.stops, 1):
        city = db.query(City).filter(City.id == stop.city_id).first()
        city_name = city.name if city else stop.city_id
        country = city.country if city else ""
        
        # Format DTSTART and DTEND (YYYYMMDD)
        dtstart = stop.start_date.replace("-", "")
        dtend = stop.end_date.replace("-", "")
        uid = f"{trip.id}-{stop.id}@globetrotter.io"

        summary = f"Stay in {city_name}, {country}"
        description = f"GlobeTrotter Stop {i}: {stop.notes or 'Enjoy your stay!'}"

        lines.extend([
            "BEGIN:VEVENT",
            f"UID:{uid}",
            f"DTSTAMP:{datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')}",
            f"DTSTART;VALUE=DATE:{dtstart}",
            f"DTEND;VALUE=DATE:{dtend}",
            f"SUMMARY:{summary}",
            f"LOCATION:{city_name}, {country}",
            f"DESCRIPTION:{description}",
            "STATUS:CONFIRMED",
            "END:VEVENT"
        ])

    lines.append("END:VCALENDAR")
    return "\r\n".join(lines)

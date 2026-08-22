import type { Trip } from '../types/trip';

export const seedTrips: Trip[] = [
{
  id: 'trip-iberia',
  name: 'Iberian Slow Loop',
  description:
  'Three weeks moving south along the coast, mostly by train, with two long stops instead of five short ones.',
  coverImage: "/a6579c30-2bd2-439f-938c-d223541de800.jpg",

  startDate: '2026-09-12',
  budgetCap: 350000,
  travelers: 2,
  isPublic: true,
  stops: [
  {
    id: 'stop-lis',
    cityId: 'lisbon',
    startDate: '2026-09-12',
    endDate: '2026-09-17',
    notes: 'Flat in Graça. Sintra on the first clear day.',
    activityIds: ['lis-1', 'lis-3', 'lis-4'],
    transportCost: 40000
  },
  {
    id: 'stop-bcn',
    cityId: 'barcelona',
    startDate: '2026-09-17',
    endDate: '2026-09-22',
    notes: 'Sagrada Família tickets already booked for the 18th.',
    activityIds: ['bcn-1', 'bcn-2', 'bcn-4'],
    transportCost: 9100
  },
  {
    id: 'stop-mar',
    cityId: 'marrakech',
    startDate: '2026-09-22',
    endDate: '2026-09-27',
    notes: 'Riad in the medina, desert night mid-stay.',
    activityIds: ['mar-1', 'mar-2', 'mar-3'],
    transportCost: 12000
  }]

},
{
  id: 'trip-japan',
  name: 'Kyoto in Autumn',
  description: 'A short, single-city trip built around temple season.',
  coverImage: "/f65db612-6fde-4265-b4d1-d7a28ba92b44.jpg",

  startDate: '2026-11-08',
  budgetCap: 215000,
  travelers: 1,
  isPublic: false,
  stops: [
  {
    id: 'stop-kyo',
    cityId: 'kyoto',
    startDate: '2026-11-08',
    endDate: '2026-11-15',
    notes: 'Rail pass covers the day trips.',
    activityIds: ['kyo-1', 'kyo-2', 'kyo-4'],
    transportCost: 74000
  }]

}];
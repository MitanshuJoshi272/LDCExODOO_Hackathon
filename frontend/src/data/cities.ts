import type { City } from '../types/trip';

export const cities: City[] = [
{
  id: 'kyoto',
  name: 'Kyoto',
  country: 'Japan',
  region: 'Asia',
  image: "/f65db612-6fde-4265-b4d1-d7a28ba92b44.jpg",

  blurb:
  'Temple gardens, tea houses and lantern-lit lanes. Slow mornings, early sunsets.',
  lodgingPerNight: 8000,
  dailyLivingCost: 4800,
  costIndex: 3,
  popularity: 94,
  tags: ['Temples', 'Food', 'Walkable']
},
{
  id: 'lisbon',
  name: 'Lisbon',
  country: 'Portugal',
  region: 'Europe',
  image: "/a6579c30-2bd2-439f-938c-d223541de800.jpg",

  blurb:
  'Tiled hills, tram lines and long dinners. Good value for a European capital.',
  lodgingPerNight: 6500,
  dailyLivingCost: 3750,
  costIndex: 2,
  popularity: 91,
  tags: ['Coastal', 'Nightlife', 'Budget']
},
{
  id: 'marrakech',
  name: 'Marrakech',
  country: 'Morocco',
  region: 'Africa',
  image: "/75cc6009-fe1d-484f-9576-c06181ab2aba.jpg",

  blurb:
  'Riads, souks and desert day trips. Dense, loud and cheap once you are inside the walls.',
  lodgingPerNight: 4500,
  dailyLivingCost: 2650,
  costIndex: 1,
  popularity: 82,
  tags: ['Markets', 'Desert', 'Budget']
},
{
  id: 'reykjavik',
  name: 'Reykjavík',
  country: 'Iceland',
  region: 'Europe',
  image: "/d90a98ba-90ae-4e41-ab87-4202e72491f2.jpg",

  blurb:
  'A small city used as a launchpad for waterfalls, lava fields and northern lights.',
  lodgingPerNight: 14000,
  dailyLivingCost: 8000,
  costIndex: 5,
  popularity: 77,
  tags: ['Nature', 'Road trip', 'Cold']
},
{
  id: 'cape-town',
  name: 'Cape Town',
  country: 'South Africa',
  region: 'Africa',
  image: "/8d071740-3c57-479d-bf62-5be3672f681e.jpg",

  blurb:
  'Mountain on one side, two oceans on the other. Wine country an hour inland.',
  lodgingPerNight: 6000,
  dailyLivingCost: 3300,
  costIndex: 2,
  popularity: 85,
  tags: ['Mountains', 'Wine', 'Coastal']
},
{
  id: 'mexico-city',
  name: 'Mexico City',
  country: 'Mexico',
  region: 'Americas',
  image: "/6c7542b8-729f-4c0c-a793-32751c6c4a34.jpg",

  blurb:
  'Jacaranda streets, museum days and the best street food per dollar anywhere.',
  lodgingPerNight: 5300,
  dailyLivingCost: 3000,
  costIndex: 2,
  popularity: 89,
  tags: ['Food', 'Museums', 'Budget']
},
{
  id: 'queenstown',
  name: 'Queenstown',
  country: 'New Zealand',
  region: 'Oceania',
  image: "/5c008762-231b-4a7c-acb0-bd09e0904a50.jpg",

  blurb:
  'Alpine lake town built around being outside. Everything costs a little more here.',
  lodgingPerNight: 11800,
  dailyLivingCost: 6500,
  costIndex: 4,
  popularity: 74,
  tags: ['Adventure', 'Lakes', 'Hiking']
},
{
  id: 'barcelona',
  name: 'Barcelona',
  country: 'Spain',
  region: 'Europe',
  image: "/93478633-d595-45b4-9503-6922b91d1030.jpg",

  blurb:
  'Modernist rooftops, beach afternoons and a city that eats late by default.',
  lodgingPerNight: 8600,
  dailyLivingCost: 4650,
  costIndex: 3,
  popularity: 93,
  tags: ['Beach', 'Architecture', 'Nightlife']
},
{
  id: 'hanoi',
  name: 'Hanoi',
  country: 'Vietnam',
  region: 'Asia',
  image: "/171f219a-c408-433e-82e4-80ddb70a118c.jpg",

  blurb:
  'Old Quarter chaos, lake mornings and the cheapest great meals on this list.',
  lodgingPerNight: 3150,
  dailyLivingCost: 2000,
  costIndex: 1,
  popularity: 80,
  tags: ['Street food', 'Budget', 'Old town']
}];


export function getCity(cityId: string): City | undefined {
  return cities.find((c) => c.id === cityId);
}
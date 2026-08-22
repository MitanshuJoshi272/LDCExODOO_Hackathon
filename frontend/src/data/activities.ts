import type { Activity } from '../types/trip';

export const activities: Activity[] = [
// Kyoto
{ id: 'kyo-1', cityId: 'kyoto', name: 'Fushimi Inari at sunrise', category: 'Culture', durationHours: 3, cost: 0, description: 'Walk the torii gates before the crowds arrive.' },
{ id: 'kyo-2', cityId: 'kyoto', name: 'Nishiki Market food crawl', category: 'Food', durationHours: 2, cost: 2300, description: 'Six stalls, one long lunch.' },
{ id: 'kyo-3', cityId: 'kyoto', name: 'Arashiyama bamboo & monkey park', category: 'Nature', durationHours: 4, cost: 1000, description: 'Half day west of the city by train.' },
{ id: 'kyo-4', cityId: 'kyoto', name: 'Tea ceremony in Gion', category: 'Culture', durationHours: 2, cost: 4500, description: 'Small-group matcha ceremony with a host.' },
{ id: 'kyo-5', cityId: 'kyoto', name: 'Pontocho izakaya night', category: 'Nightlife', durationHours: 3, cost: 3700, description: 'Riverside alley, standing bars, late.' },

// Lisbon
{ id: 'lis-1', cityId: 'lisbon', name: 'Alfama walking tour', category: 'Culture', durationHours: 3, cost: 1800, description: 'The oldest quarter, on foot and mostly uphill.' },
{ id: 'lis-2', cityId: 'lisbon', name: 'Time Out Market dinner', category: 'Food', durationHours: 2, cost: 2500, description: 'Chef stalls under one roof.' },
{ id: 'lis-3', cityId: 'lisbon', name: 'Sintra day trip', category: 'Nature', durationHours: 8, cost: 3500, description: 'Palaces in the hills, 40 minutes by train.' },
{ id: 'lis-4', cityId: 'lisbon', name: 'Fado night in Bairro Alto', category: 'Nightlife', durationHours: 3, cost: 2900, description: 'Dinner and live fado in a small room.' },
{ id: 'lis-5', cityId: 'lisbon', name: 'Surf lesson at Costa da Caparica', category: 'Adventure', durationHours: 4, cost: 4000, description: 'Board, wetsuit and instructor included.' },

// Marrakech
{ id: 'mar-1', cityId: 'marrakech', name: 'Souk navigation walk', category: 'Culture', durationHours: 3, cost: 1500, description: 'A guide is worth it the first time.' },
{ id: 'mar-2', cityId: 'marrakech', name: 'Agafay desert sunset', category: 'Adventure', durationHours: 6, cost: 5400, description: 'Camp dinner in the stone desert.' },
{ id: 'mar-3', cityId: 'marrakech', name: 'Tagine cooking class', category: 'Food', durationHours: 4, cost: 3300, description: 'Market shop, then cook what you bought.' },
{ id: 'mar-4', cityId: 'marrakech', name: 'Jardin Majorelle', category: 'Nature', durationHours: 2, cost: 1250, description: 'Cobalt walls and cactus beds. Book ahead.' },

// Reykjavík
{ id: 'rey-1', cityId: 'reykjavik', name: 'Golden Circle self-drive', category: 'Nature', durationHours: 8, cost: 7900, description: 'Geysir, Gullfoss and Þingvellir in one loop.' },
{ id: 'rey-2', cityId: 'reykjavik', name: 'Sky Lagoon soak', category: 'Nature', durationHours: 3, cost: 6500, description: 'Geothermal water, ocean horizon.' },
{ id: 'rey-3', cityId: 'reykjavik', name: 'Northern lights chase', category: 'Adventure', durationHours: 5, cost: 9100, description: 'Guided, weather-dependent, free re-run.' },
{ id: 'rey-4', cityId: 'reykjavik', name: 'Glacier hike on Sólheimajökull', category: 'Adventure', durationHours: 7, cost: 11200, description: 'Crampons and guide provided.' },

// Cape Town
{ id: 'cpt-1', cityId: 'cape-town', name: 'Table Mountain hike', category: 'Nature', durationHours: 5, cost: 0, description: 'Platteklip Gorge up, cable car down.' },
{ id: 'cpt-2', cityId: 'cape-town', name: 'Cape Peninsula drive', category: 'Nature', durationHours: 8, cost: 5800, description: 'Chapman’s Peak, penguins, Cape Point.' },
{ id: 'cpt-3', cityId: 'cape-town', name: 'Stellenbosch wine tasting', category: 'Food', durationHours: 6, cost: 7000, description: 'Three estates with a driver.' },
{ id: 'cpt-4', cityId: 'cape-town', name: 'Bo-Kaap food walk', category: 'Food', durationHours: 3, cost: 2650, description: 'Cape Malay cooking and coloured houses.' },

// Mexico City
{ id: 'mex-1', cityId: 'mexico-city', name: 'Teotihuacán pyramids', category: 'Culture', durationHours: 7, cost: 4500, description: 'Early bus out to beat the heat.' },
{ id: 'mex-2', cityId: 'mexico-city', name: 'Taco crawl in Roma', category: 'Food', durationHours: 3, cost: 2100, description: 'Five stands, one guide, no cutlery.' },
{ id: 'mex-3', cityId: 'mexico-city', name: 'Museo Frida Kahlo', category: 'Culture', durationHours: 2, cost: 1500, description: 'Casa Azul in Coyoacán. Timed entry.' },
{ id: 'mex-4', cityId: 'mexico-city', name: 'Xochimilco boat afternoon', category: 'Nightlife', durationHours: 4, cost: 2500, description: 'Trajinera, mariachi, michelada.' },

// Queenstown
{ id: 'qtn-1', cityId: 'queenstown', name: 'Routeburn day walk', category: 'Nature', durationHours: 8, cost: 3300, description: 'Shuttle to the trailhead, alpine views.' },
{ id: 'qtn-2', cityId: 'queenstown', name: 'Kawarau bungy', category: 'Adventure', durationHours: 2, cost: 13700, description: 'The original 43m jump.' },
{ id: 'qtn-3', cityId: 'queenstown', name: 'Milford Sound cruise', category: 'Nature', durationHours: 12, cost: 15800, description: 'Long day, hard to skip.' },
{ id: 'qtn-4', cityId: 'queenstown', name: 'Gibbston winery ride', category: 'Food', durationHours: 5, cost: 7300, description: 'Cycle between four cellar doors.' },

// Barcelona
{ id: 'bcn-1', cityId: 'barcelona', name: 'Sagrada Família', category: 'Culture', durationHours: 2, cost: 2800, description: 'Book the tower slot weeks ahead.' },
{ id: 'bcn-2', cityId: 'barcelona', name: 'Gothic Quarter tapas route', category: 'Food', durationHours: 3, cost: 3700, description: 'Vermouth, anchovies, standing room.' },
{ id: 'bcn-3', cityId: 'barcelona', name: 'Park Güell morning', category: 'Nature', durationHours: 3, cost: 1500, description: 'Mosaic terraces above the city.' },
{ id: 'bcn-4', cityId: 'barcelona', name: 'Barceloneta beach day', category: 'Nature', durationHours: 5, cost: 1000, description: 'Chiringuito lunch, sun lounger.' },

// Hanoi
{ id: 'han-1', cityId: 'hanoi', name: 'Old Quarter street food tour', category: 'Food', durationHours: 3, cost: 1650, description: 'Bún chả, bánh mì, egg coffee.' },
{ id: 'han-2', cityId: 'hanoi', name: 'Ha Long Bay overnight', category: 'Nature', durationHours: 30, cost: 10800, description: 'Sleeps on the boat, kayaks included.' },
{ id: 'han-3', cityId: 'hanoi', name: 'Train Street coffee', category: 'Culture', durationHours: 1, cost: 400, description: 'Time it with the 19:00 service.' },
{ id: 'han-4', cityId: 'hanoi', name: 'Motorbike food ride', category: 'Adventure', durationHours: 4, cost: 2900, description: 'On the back, helmet on, six stops.' }];


export function activitiesForCity(cityId: string): Activity[] {
  return activities.filter((a) => a.cityId === cityId);
}

export function getActivity(id: string): Activity | undefined {
  return activities.find((a) => a.id === id);
}
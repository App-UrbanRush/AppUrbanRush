interface OSRMRoute {
  distance: number;
  duration: number;
  geometry: [number, number][];
}

export const osrmService = {
  async getRoute(
    origin: [number, number],
    destination: [number, number]
  ): Promise<OSRMRoute | null> {
    try {
      const [lat1, lng1] = origin;
      const [lat2, lng2] = destination;
      
      const url = `http://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=geojson`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('OSRM API error');
      
      const data = await response.json();
      
      if (data.code !== 'Ok' || !data.routes?.[0]) {
        return null;
      }
      
      const route = data.routes[0];
      const coordinates = route.geometry.coordinates.map((coord: [number, number]) => [
        coord[1],
        coord[0],
      ] as [number, number]);
      
      return {
        distance: route.distance,
        duration: route.duration,
        geometry: coordinates,
      };
    } catch (error) {
      console.error('Error fetching OSRM route:', error);
      return null;
    }
  },

  async geocodeAddress(address: string): Promise<[number, number] | null> {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'AppUrbanRush/1.0',
        },
      });
      
      if (!response.ok) throw new Error('Nominatim API error');
      
      const data = await response.json();
      
      if (!data || data.length === 0) {
        return null;
      }
      
      const result = data[0];
      return [parseFloat(result.lat), parseFloat(result.lon)];
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  },
};
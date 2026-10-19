# US location suggestions

`us-locations.json` is a local search index used by the Routewise trip form. It contains:

- US cities with population of at least 5,000 from [GeoNames cities5000](https://download.geonames.org/export/dump/), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The city name, state code, and population were retained. © GeoNames.
- US airports with an IATA code from [OurAirports](https://ourairports.com/data/), whose data is public domain. Closed airports were excluded.
- US national parks from the [National Park Service's National Park System list](https://www.nps.gov/aboutus/national-park-system.htm). Parks in American Samoa and the US Virgin Islands were excluded because the planner focuses on mainland and Alaska/Hawaii road trips.

The data was retrieved on October 19, 2026. Suggestions are a convenience, not a restriction: people can enter a location that is not in the index.

The search endpoint also looks up US street addresses through the [US Census Geocoder](https://geocoding.geo.census.gov/) and businesses and other places through [Photon](https://github.com/komoot/photon), which uses [OpenStreetMap data](https://www.openstreetmap.org/copyright). Those services are queried only after someone types a search, and results depend on their coverage and availability. Photon's public server is intended for reasonable traffic and has no uptime guarantee; a dedicated geocoding provider would be needed at larger scale.

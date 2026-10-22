# Resident app design

## Navigation

Explore is the default destination. Tab order: Home, Explore, Community. Profile and reports are nested under Home; no fourth or fifth tab. Search is a dedicated page. Route preview retains the three destinations; starting a journey moves to a full-screen route outside the tab navigator.

## Visual language

Warm white surfaces, charcoal text, pale cream quick actions, Sime Darby red `#D93A34`, restrained rounded cards, and compact headers. The map owns the Explore screen. Contextual information appears after selecting an item, not as a permanent panel covering the map. Traffic status also has text labels; colour is not its only signal.

## Review flow

1. Launch into Explore. Switch filters and tap a marker. Dismiss its details.
2. Tap search and find the mall or park. Save the place or get directions.
3. Start the clearly labelled demo journey, advance an instruction, then End.
4. Visit Home, report an issue with a photo, and find it in My reports.
5. Visit Community, react and comment on an official update, then reload to verify local persistence.
6. Select CCTV to inspect the offline state, or supply an authorised stream to review playback.

## Production integrations still required

Supabase Auth + township memberships + row-level policies; reports/images in private buckets; official announcements with staff-only publishing; authenticated comments/reactions; signed CCTV URLs; geocoding and routing service; validated congestion analytics; push delivery. The local demo store must be replaced by an authenticated repository layer, not synchronised indiscriminately into public tables.

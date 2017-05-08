# Immowelt Filter Service

This node service filters results scraped from Immowelt and associates them with a subscriber ID.

To make the filtered data available, the service exposes an API with 3 endpoints:
* `GET /api/subscriber/:subscriberId/results` - All filtered entries for this subscriber
* `POST /api/subscriber/subscribe` - Start subscribing to filtered data (body {"subscriberId": "id"})
* `PUT /api/subscriber/:subscriberId/unsubscribe` - Unsubscribe from this filtered data stream

By default this service starts its API on `localhost:1235`.

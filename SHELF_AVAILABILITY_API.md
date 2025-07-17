# Shelf Availability API

This document outlines the data model and response contract for the Shelf Availability API.

## `ShelfAvailabilityItem` Data Model

The `ShelfAvailabilityItem` is the unified JSON shape that the UI will use to display information about product availability on shelves.

```json
{
  "id": 123,
  "product_name": "Fuzzy Widget",
  "total_stock": 100,
  "available_stock": 75,
  "reserved_stock": 25,
  "out_of_stock_hours": null,
  "shelf_location": "Aisle 5, Shelf 2",
  "status": "available"
}
```

### Fields

*   `id`: `number` - The unique identifier for the product (`product_id`).
*   `product_name`: `string` - The name of the product.
*   `total_stock`: `number` - The total number of items of this product in stock. This is a calculated field.
*   `available_stock`: `number` - The number of items available for purchase.
*   `reserved_stock`: `number` - The number of items reserved for orders.
*   `out_of_stock_hours`: `number | null` - The number of hours the product has been out of stock. If the product is in stock, this will be `null`.
*   `shelf_location`: `string | null` - The location of the product on the shelves.
*   `status`: `'available' | 'low_stock' | 'critical' | 'out_of_stock'` - The availability status of the product.

## Algorithm

The following algorithm is used to generate the `ShelfAvailabilityItem` data:

1.  **Aggregate Operations:**
    *   The system aggregates the latest **operations** for each product to determine the current `total_stock`, `available_stock`, and `reserved_stock`.

2.  **Join with Out of Stock Items:**
    *   The system joins the aggregated data with the **out_of_stock_items** table.
    *   If a product is marked as out of stock, the `out_of_stock_hours` is calculated by taking the difference between the current time and the timestamp of the earliest pending record in **out_of_stock_items**.
    *   The `status` is flagged accordingly.

3.  **Join with Products:**
    *   The result is then joined with the **products** table to retrieve the `product_name` and any shelf metadata, such as `shelf_location`.

## Pagination and Filtering

The API will support pagination and filtering to allow the UI to efficiently manage and display the data.

### Pagination

The API will use a standard pagination model, likely with `page` and `page_size` parameters.

### Filtering

The following filters will be available:

*   `status`: Filter by one or more availability statuses (e.g., `available`, `low_stock`, `critical`, `out_of_stock`).
*   `search`: A string search to filter by `product_name`.
*   `sort`: A parameter to sort the results by a specific field (e.g., `product_name`, `total_stock`).


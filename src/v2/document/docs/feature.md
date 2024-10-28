# Flexible Product Management

## Overview

The API is designed to handle a wide range of product configurations, allowing for multiple product variations through a dynamic attribute-based system. For example, products can have attributes like color, size, or material, enabling businesses to manage products with different SKUs under the same umbrella. The system supports:

## Key Features

-   **Product Variants**: Each product can have several variants, where different combinations of attributes form unique SKUs.
-   **Inventory Tracking**: The API ensures real-time inventory management, allowing for detailed tracking of stock levels per variant.
-   **Attribute Customization**: Users can define new attributes dynamically, making the system adaptable to future product categories without code changes.
-   **Bulk Management**: The API supports batch creation, facilitating easy maintenance of product catalogs.

## Example Use Case

### T-Shirt Management

Consider a clothing store that specializes in T-shirts. Each T-shirt can have multiple attributes, such as:

-   **Size**: S, M, L
-   **Color**: Red, Blue, Green
-   **Material**: Cotton, Polyester

By defining these attributes, the store can create a single product entry for the T-shirt and generate multiple variants based on attribute combinations. For instance, the T-shirt variants might include:

-   `Red, Size M, Cotton`

-   `Blue, Size L, Polyester`

Each variant has its own SKU and inventory count, allowing the store to track stock levels accurately.

### Adding New Product Categories

When the store decides to introduce a new product category, such as jewelry, new attributes can be added without modifying the existing codebase. For instance:

-   **Material**: Gold, Silver
-   **Gemstone**: Diamond, Ruby

This ability to customize attributes dynamically empowers businesses to adapt their product catalog with minimal development effort, ensuring they can respond to market trends quickly.

### Bulk Creation Feature

The bulk creation feature is particularly useful when managing numerous variants. For example, if the store receives a shipment of 50 different T-shirt variants, it can use the API to efficiently create and update all variants in one operation. This reduces the time and effort required to manage large inventories and enhances overall operational efficiency.

# Order Fulfillment

## Overview

The order fulfillment system ensures the seamless processing of customer orders from creation to delivery. It handles order status updates, inventory adjustments, and integrates with payment methods to ensure that orders are processed efficiently and accurately.

## Key Features

-   **Cart Management**: Customers can add products to their cart, view the cart contents, and proceed to checkout. This cart works as a wishlist, and customers can add or remove items before placing an order.
-   **Order Creation**: Orders are generated from the customer’s cart, including details about the products, quantities, and pricing.
-   **Real-Time Stock Adjustment**: Inventory levels are automatically adjusted based on the ordered quantities, preventing over-selling or stock discrepancies.
-   **Order Status Tracking**: Every order is assigned a status (e.g., `pending`, `processing`, `delivered`), with seamless transitions between statuses managed by admin.
-   **Transactional Integrity**: The API employs database transactions to ensure that orders are processed atomically, meaning that stock levels, order records, and payment statuses are updated consistently and reliably, even in the face of concurrent requests.

## Example Use Case

### Cart Management

The cart management feature enables customers to add products to their cart and proceed to checkout when ready. Customers can view the cart contents, update quantities, or remove items before finalizing the order. When a customer finalize an order, the chosen products are moved from the cart to the order list. This order will then be `pending` which means it is waiting to be processed (e.g., add coupon, update payment method, change shipping information, ...).

### Transactional Integrity and Real-Time Stock Adjustment

API is able to handle multiple concurrent requests to update stock levels and order records. For example, if two customers simultaneously purchase the last available item in stock, the system ensures that only one order is processed at a time. This prevents overselling and maintains accurate inventory levels.

### Order Status Tracking

The order status tracking feature allows customers to monitor the progress of their orders. For instance, a customer can see when an order is `delivered` and track the delivery status. This transparency enhances customer trust and satisfaction.

# Coupon and Promotion Management

## Overview

This feature allows businesses to create and manage flexible discount coupons and promotions. Whether offering percentage discounts, free shipping, or time-sensitive offers, the system handles a wide variety of promotion strategies to boost sales and enhance customer loyalty.

## Key Features

-   **Coupon Creation and Management**: Admins can create coupons with specific rules such as percentage discounts, or fixed amounts. Coupons can be configured to apply to certain products, categories, or entire orders.
-   **Dynamic Pricing**: The system supports automatic price adjustments based on predefined rules. For instance, bulk purchases or time-based promotions (e.g., flash sales) can trigger specific price changes.
-   **Usage Limits**: Coupons can be restricted by usage limits, expiration dates, or the applied order's amount. This ensures that promotions are controlled and do not exceed predefined thresholds.

## Example Use Case

### T-Shirt Promotion

A store plans to launch a promotion that offers a 20% discount on all T-shirts for a duration of 30 days, with a cap of 100 customers eligible for the discount. To qualify, orders must exceed $50, and the maximum discount that can be applied to a single order is $20. The store administrator sets up the coupon with the following specifications:

-   **Coupon Code**: `TSHIRT20`
-   **Discount Type**: Percentage (20%)
-   **Applicable Products**: T-shirts
-   **Minimum Order Amount**: $50
-   **Maximum Discount**: $20
-   **Usage Limit**: 100
-   **Start Date**: Current date
-   **Expiration Date**: 30 days from the start date

When customers apply the coupon code `TSHIRT20` during checkout, the system automatically calculates the discount based on the defined rules. The coupon is valid for 30 days from today or until the usage limit is reached, providing an incentive for customers to make purchases within the specified timeframe.

Certain fields can be left blank to allow the coupon to apply to all products or orders.

This feature enables businesses to implement targeted promotions, monitor the effectiveness of various campaigns, and adjust their strategies based on real-time analytics. By providing personalized discounts and incentives, businesses can enhance customer engagement and stimulate sales growth.

### Alternative Pricing Strategy

The store can utilize the `DiscountPrice` field for each variant to set a reduced price. However, this approach is less flexible and dynamic compared to using coupons. It is more suitable for permanent discounts or for situations where displaying the discounted price directly on the product page is desired.

# Admin Interface

## Overview

The admin interface is designed to give administrators full control over the e-commerce platform. It allows for product and order management, advanced filtering and sorting, and provides insights through analytics and reporting tools.

## Key Features

-   **Advanced Search and Filtering**: Admins can perform searches across any resource (e.g., products, orders, users) using multiple criteria tailored to each resource type. For instance:
    -   **Products**: Search by attributes, SKU, price range, availability, and other product-specific details.
    -   **Orders**: Filter by order status, customer information, date range, and order total.
    -   **Users**: Filter by registration date, account status, email, or other identifying details.
-   **Sorting and Pagination**: The interface supports sorting by relevant fields for each resource and includes pagination to efficiently handle large datasets across the application.

## Example Use Case

The API features a robust filtering, sorting, and pagination system that empowers administrators to efficiently search and manage resources such as products, orders, and customers.

The interface also includes support for comparison operators like `>`, `<`, `>=`, `<=`, `=`, and `!=`, allowing admins to conduct more detailed searches. Additionally, admins can utilize the `LIKE` operator for string fields, facilitating partial matches in product names, customer names, or order ID.

For example, admin can do the following:

-   **Search for Products**: Locate all products containing the word `Prime` in their name, displayed on the 5th page with 10 products per page, specifically within the `T-shirt` category. Each product must have at least one available variant in `Red` color, and the price should be less than $50. The results will be sorted by price in descending order.

-   **Search for Orders**: Retrieve all orders that have been shipped to `Ho Chi Minh City`, paid using `Momo`. These orders should have a total amount exceeding $100 and be marked as `delivered`. The results will be sorted by order date in ascending order.

-   **Search for Coupons**: Identify 5 coupons applicable to the `T-shirt` category that offer a discount percentage greater than 10%. The results will be sorted by expiration date in descending order.

### Client Space For Improvement

With the advanced search and filtering capabilities provided by the API, the client can enhance the admin interface by incorporating data visualization tools, such as charts and graphs, to provide a visual representation of sales trends, inventory levels, and customer demographics.

By leveraging analytics, administrators can gain deeper insights into business performance and make data-driven decisions to optimize operations and drive growth.

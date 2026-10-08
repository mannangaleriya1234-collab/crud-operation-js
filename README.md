# Cartly - E-Commerce Project (HTML, CSS, JS)

A simple shopping website I made using plain HTML, CSS and JavaScript. No frameworks, no libraries, just the basics. The design is inspired by Flipkart (blue header, grey background, orange buttons).

## About

So this is my e-commerce CRUD project. I wanted to practice DOM manipulation and `localStorage` so I made a mini online store where you can add products, edit them, put them in a cart and see the total. Everything is saved in the browser, so if you refresh the page your products and cart are still there. There is no backend or database.

## Features

- Add a new product (name, category, price, emoji icon, description)
- Edit an existing product
- View a single product in a popup with its details
- Add to cart
- Increase / decrease quantity in the cart (going below 1 removes the item)
- Remove a product from the cart
- Total price updates automatically
- Show cart in a side panel
- Search by name or category
- Filter by category
- Sort by price (low to high, high to low) or name (A-Z, Z-A)
- Hover effect on product cards

## Folder structure

```
cartly-ecommerce/
├── index.html   -> page structure
├── style.css    -> all the styling
├── script.js    -> all the logic (CRUD, cart, search, filter, sort)
└── README.md    -> this file
```

## How to run it

There is nothing to compile or install since it's just HTML, CSS and JS.

1. Unzip the folder.
2. Open the `cartly-ecommerce` folder.
3. Double-click `index.html` (it opens in your browser).

If you use VS Code, you can also right-click `index.html` and choose **Open with Live Server** (needs the Live Server extension).

## How it works (short version)

- Products are stored in an array and saved with `localStorage` as JSON.
- The cart is another array of `{ id, qty }`.
- Every time something changes, the page is re-drawn using `renderProducts()` and `renderCart()`.
- Search, filter and sort all work together on the same product list.

## Things I want to add later

- Delete product option
- Real product images instead of emojis
- Checkout page
- Backend with a database

## Made with

HTML5, CSS3, vanilla JavaScript

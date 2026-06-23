# Aura — Store Documentation

> **Reusing this store?** Change the values in this file (and in `store.config.js`)
> to your own brand name, tagline and details, then run the store. That's all
> you need to make it your own project.

## Brand

| Field | Value |
|-------|-------|
| **Store name** | Aura |
| **Category** | Premium lifestyle goods |
| **Tagline** | _Considered objects for everyday life_ |
| **Default port** | 4002 |

## How to rebrand this store

1. Edit the **Brand** table above with your own name, tagline and category.
2. Update the matching fields in `store.config.js` (name, tagline, shipping, tax…).
3. Replace the product catalogue in `seed.js` with your own products.
4. Swap the frontend assets in `public/` (HTML/CSS/JS, images) for your branding.

## Running

```bash
npm install        # install dependencies
npm run seed       # create & populate the SQLite database
npm start          # start the server
```

Then open the printed `http://localhost:4002` in your browser.

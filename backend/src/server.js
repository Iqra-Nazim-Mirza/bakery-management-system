require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./config/db");
//const db = require("../../../db");

const productRoutes = require("./config/backend/backend/routes/productRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make uploaded images accessible
app.use(
    "/uploads",
    express.static(__dirname + "/config/uploads")
);


// ---------------- HEALTH ----------------

app.get("/api/health", (q, s) => {
    s.json({ ok: true });
});


// ---------------- PRODUCTS ----------------

// Product routes
app.use("/api/products", productRoutes);


// ---------------- ORDERS ----------------

app.get("/api/orders", async (q, s) => {
    try {
        s.json(
            (await db.query(
                "SELECT * FROM orders ORDER BY created_at DESC"
            ))[0]
        );
    } catch (e) {
        s.status(500).json({ error: e.message });
    }
});


app.post("/api/orders", async (q, s) => {

    const {
        customerName,
        fulfillment = "pickup",
        notes = "",
        total = 0,
        type = "standard",
        items = []
    } = q.body;

    try {

        const [r] = await db.query(
            "INSERT INTO orders(customer_name,fulfillment,notes,total,status,type) VALUES(?,?,?,?,?,?)",
            [
                customerName,
                fulfillment,
                notes,
                total,
                "placed",
                type
            ]
        );

        for (const x of items) {

            await db.query(
                "INSERT INTO order_items(order_id,product_id,product_name,price,qty) VALUES(?,?,?,?,?)",
                [
                    r.insertId,
                    x.productId || null,
                    x.name,
                    x.price,
                    x.qty
                ]
            );
        }

        s.status(201).json({
            id: r.insertId,
            customerName,
            fulfillment,
            notes,
            total,
            status: "placed",
            type
        });

    } catch (e) {

        s.status(500).json({
            error: e.message
        });

    }
});


app.patch("/api/orders/:id/status", async (q, s) => {

    try {

        await db.query(
            "UPDATE orders SET status=? WHERE id=?",
            [
                q.body.status,
                q.params.id
            ]
        );

        s.json({ ok: true });

    } catch (e) {

        s.status(500).json({
            error: e.message
        });

    }
});


// ---------------- INVENTORY ----------------

app.get("/api/inventory", async (q, s) => {

    try {

        s.json(
            (await db.query(
                "SELECT * FROM inventory ORDER BY id"
            ))[0]
        );

    } catch (e) {

        s.status(500).json({
            error: e.message
        });

    }
});


app.patch("/api/inventory/:id", async (q, s) => {

    try {

        await db.query(
            "UPDATE inventory SET quantity=? WHERE id=?",
            [
                q.body.quantity,
                q.params.id
            ]
        );

        s.json({ ok: true });

    } catch (e) {

        s.status(500).json({
            error: e.message
        });

    }
});


// ---------------- SERVER ----------------

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Bakery Bloom API running on http://localhost:${PORT}`);
});
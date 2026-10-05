const express = require("express");
const multer = require("multer");
const path = require("path");

const db = require("../../../db");

const router = express.Router();


// ===============================
// IMAGE UPLOAD SETTINGS
// ===============================

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../../../uploads"));
    },

    filename: function (req, file, cb) {
        const uniqueName =
            Date.now() + "-" + file.originalname.replace(/\s+/g, "-");

        cb(null, uniqueName);
    }
});


const upload = multer({
    storage: storage,

    fileFilter: function (req, file, cb) {

        const allowedMimeTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/jfif"
        ];

        const allowedExtensions =
            /\.(jpg|jpeg|jfif|png|webp)$/i;

        const extensionAllowed =
            allowedExtensions.test(file.originalname);

        const mimeAllowed =
            allowedMimeTypes.includes(file.mimetype);

        if (mimeAllowed || extensionAllowed) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Only JPG, JPEG, JFIF, PNG and WebP images are allowed"
                )
            );
        }
    }
});


// ===============================
// ADD PRODUCT
// ===============================

router.post("/", upload.single("image"), async (req, res) => {

    const {
        name,
        description,
        price,
        category
    } = req.body;

    if (!name || !price) {
        return res.status(400).json({
            message: "Product name and price are required"
        });
    }

    const image = req.file
        ? req.file.filename
        : null;

    const sql = `
        INSERT INTO products
        (name, description, price, category, image)
        VALUES (?, ?, ?, ?, ?)
    `;

    try {

        const [result] = await db.query(
            sql,
            [
                name,
                description || "",
                price,
                category || "Cake",
                image
            ]
        );

        res.status(201).json({
            message: "Product added successfully",
            productId: result.insertId,

            image: image
                ? `http://127.0.0.1:5000/uploads/${image}`
                : null
        });

    } catch (error) {

        console.error("Add product error:", error);

        res.status(500).json({
            message: "Failed to add product",
            error: error.message
        });
    }
});


// ===============================
// GET ALL PRODUCTS
// ===============================

router.get("/", async (req, res) => {

    try {

        const [results] = await db.query(
            "SELECT * FROM products ORDER BY id DESC"
        );

        res.json(results);

    } catch (error) {

        console.error("Fetch products error:", error);

        res.status(500).json({
            message: "Failed to fetch products",
            error: error.message
        });
    }
});


module.exports = router;
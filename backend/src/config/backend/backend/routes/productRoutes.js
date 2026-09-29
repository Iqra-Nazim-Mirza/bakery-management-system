const express = require("express");
const multer = require("multer");
const path = require("path");

const db = require("../../../db");

const router = express.Router();


// ===============================
// IMAGE STORAGE
// ===============================

const storage = multer.diskStorage({

     destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../../../uploads"));
    },

    filename: function (req, file, cb) {
        const uniqueName =
            Date.now() + "-" + file.originalname.replace(/\s+/g, "-");

        cb(null, uniqueName);
    
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
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extension = path.extname(file.originalname).toLowerCase();

        if (allowedTypes.test(extension)) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"));
        }
    }
});


// ===============================
// ADD PRODUCT
// ===============================

router.post("/", upload.single("image"), (req, res) => {

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

    const image = req.file ? req.file.filename : null;

    const sql = `
        INSERT INTO products
        (name, description, price, category, image)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [name, description, price, category, image],
        (err, result) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    message: "Failed to add product"
                });
            }

            res.status(201).json({
                message: "Product added successfully",
                productId: result.insertId,
                image: image
                    ? `http://localhost:5000/uploads/${image}`
                    : null
            });
        }
    );
});


// ===============================
// GET ALL PRODUCTS
// ===============================

router.get("/", (req, res) => {

    const sql = "SELECT * FROM products ORDER BY id DESC";

    db.query(sql, (err, results) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                message: "Failed to fetch products"
            });
        }

        res.json(results);
    });
});


module.exports = router;
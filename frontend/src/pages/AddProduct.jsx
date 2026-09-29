import React, { useState } from "react";

function AddProduct() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("Cake");
    const [image, setImage] = useState(null);

    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || !price || !image) {
            setMessage("Please enter product name, price and image.");
            return;
        }

        const formData = new FormData();

        formData.append("name", name);
        formData.append("description", description);
        formData.append("price", price);
        formData.append("category", category);
        formData.append("image", image);

        try {
            const response = await fetch(
                "http://localhost:5000/api/products",
                {
                    method: "POST",
                    body: formData
                }
            );

            const data = await response.json();

            if (response.ok) {
                setMessage("Product added successfully!");

                setName("");
                setDescription("");
                setPrice("");
                setCategory("Cake");
                setImage(null);

                document.getElementById("imageInput").value = "";
            } else {
                setMessage(data.message || data.error || "Failed to add product.");
            }

        } catch (error) {
            console.error(error);
            setMessage("Could not connect to the backend.");
        }
    };

    return (
        <div>

            <h1>Add Product</h1>

            <form onSubmit={handleSubmit}>

                <div>
                    <label>Product Name</label>

                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Chocolate Truffle Cake"
                    />
                </div>


                <div>
                    <label>Description</label>

                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Rich chocolate cake with chocolate frosting"
                    />
                </div>


                <div>
                    <label>Price</label>

                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="550"
                    />
                </div>


                <div>
                    <label>Category</label>

                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="Cake">Cake</option>
                        <option value="Pastry">Pastry</option>
                        <option value="Cupcake">Cupcake</option>
                        <option value="Bread">Bread</option>
                        <option value="Cookie">Cookie</option>
                    </select>
                </div>


                <div>
                    <label>Cake Image</label>

                    <input
                        id="imageInput"
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={(e) => setImage(e.target.files[0])}
                    />
                </div>


                <button type="submit">
                    Save Product
                </button>

            </form>


            {message && (
                <p>{message}</p>
            )}

        </div>
    );
}

export default AddProduct;
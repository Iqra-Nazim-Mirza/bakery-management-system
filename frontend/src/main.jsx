import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import { api } from './services/api';

const productsFallback = [
  {
    id: 1,
    name: 'Chocolate Fudge Cake',
    price: 22,
    emoji: '🍫',
    tag: 'Best seller',
    image:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85'
  },
  {
    id: 2,
    name: 'Classic Vanilla Cake',
    price: 20,
    emoji: '🍰',
    image:
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=85'
  },
  {
    id: 3,
    name: 'Red Velvet Cake',
    price: 24,
    emoji: '❤️',
    image:
      'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=900&q=85'
  },
  {
    id: 4,
    name: 'Butter Croissant',
    price: 3.25,
    emoji: '🥐',
    image:
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=85'
  },
  {
    id: 5,
    name: 'Cinnamon Roll',
    price: 3.5,
    emoji: '🍥',
    tag: 'Best seller',
    image:
      'https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=900&q=85'
  },
  {
    id: 6,
    name: 'Sourdough Loaf',
    price: 6.5,
    emoji: '🍞',
    image:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=85'
  },
  {
    id: 7,
    name: 'Baguette',
    price: 3,
    emoji: '🥖',
    image:
      'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=900&q=85'
  }
];

const stages = ['placed', 'confirmed', 'preparing', 'ready', 'completed'];

const labels = {
  placed: 'Order Placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed'
};

const fallbackImages = [
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=900&q=85'
];

function productImage(product) {
  const images = {
    'Chocolate Fudge Cake':
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85',

    'Classic Vanilla Cake':
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=85',

    'Red Velvet Cake':
      'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=900&q=85',

    'Butter Croissant':
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=85',

    'Cinnamon Roll':
      'https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=900&q=85',

    'Sourdough Loaf':
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=85',

    'Baguette':
      'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=900&q=85'
  };

  return (
    images[product.name] ||
    product.image ||
    product.image_url ||
    product.imageUrl ||
    fallbackImages[Number(product.id || 0) % fallbackImages.length]
  );
}
function App() {
  const [mode, setMode] = useState('customer');
  const [tab, setTab] = useState('home');
  const [products, setProducts] = useState(productsFallback);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    api.get('/products')
      .then(r => setProducts(r.data))
      .catch(() => {});

    api.get('/orders')
      .then(r => setOrders(r.data))
      .catch(() => {});

    api.get('/inventory')
      .then(r => setInventory(r.data))
      .catch(() => {});
  }, []);

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.qty,
    0
  );

  const count = cart.reduce((sum, item) => sum + item.qty, 0);

  const add = product =>
    setCart(current => {
      const existing = current.find(item => item.id === product.id);

      if (existing) {
        return current.map(item =>
          item.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }

      return [...current, { ...product, qty: 1 }];
    });

  async function place(event) {
    event.preventDefault();

    const name = event.target.name.value;
    const fulfillment = event.target.fulfillment.value;
    const notes = event.target.notes.value;

    const response = await api.post('/orders', {
      customerName: name,
      fulfillment,
      notes,
      total,
      items: cart.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty
      }))
    });

    setOrders(current => [response.data, ...current]);
    setCart([]);
    setTab('tracking');
  }

  async function custom(event) {
    event.preventDefault();

    const response = await api.post('/orders', {
      customerName: event.target.name.value,
      fulfillment: 'pickup',
      type: 'custom',
      total: 0,
      notes: `₹{event.target.type.value} / ₹{event.target.flavour.value} / ₹{event.target.design.value} / ₹{event.target.message.value}`
    });

    setOrders(current => [response.data, ...current]);
    setTab('tracking');
  }

  async function status(id, newStatus) {
    await api.patch(`/orders/₹{id}/status`, {
      status: newStatus
    });

    setOrders(current =>
      current.map(order =>
        order.id === id
          ? { ...order, status: newStatus }
          : order
      )
    );
  }

  function ProductCard({ product }) {
    return (
      <article className="product-card">
        <div className="product-image">
          <img
            src={productImage(product)}
            alt={product.name}
          />

          {product.tag && (
            <span className="product-tag">
              {product.tag}
            </span>
          )}
        </div>

        <div className="product-info">
          <span className="product-category">
            Freshly baked
          </span>

          <h3>{product.name}</h3>

          <div className="product-bottom">
            <strong className="price">
              ₹{Number(product.price).toFixed(2)}
            </strong>

            <button
              className="add-button"
              onClick={() => add(product)}
            >
              Add
            </button>
          </div>
        </div>
      </article>
    );
  }

  const customer = () => {
    if (tab === 'home') {
      return (
        <>
          <section className="hero">
            <div className="hero-content">
              <div className="eyebrow">
                <span></span>
                BAKED FRESH EVERY DAY
              </div>

              <h1>
                Sweet moments,
                <em> freshly baked.</em>
              </h1>

              <p>
                Cakes, pastries and little treats made with
                care for every celebration, craving and
                ordinary Tuesday.
                From our oven to your heart..
              </p>

              <div className="hero-actions">
                <button
                  className="primary-button"
                  onClick={() => setTab('products')}
                >
                  Explore our menu
                  <span>→</span>
                </button>

                <button
                  className="secondary-button"
                  onClick={() => setTab('custom')}
                >
                  Create a custom cake
                </button>
              </div>

              <div className="hero-stats">
                <div>
                  <strong>25+</strong>
                  <span>Fresh treats</span>
                </div>

                <div>
                  <strong>40+</strong>
                  <span>Happy orders</span>
                </div>

                <div>
                  <strong>4.9</strong>
                  <span>Customer rating</span>
                </div>

                <div>
                  <strong>Daily</strong>
                  <span>Freshly baked</span>
                </div>
              </div>
            </div>

            <div className="hero-image-wrap">
              <div className="hero-image">
                <img
                  src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=90"
                  alt="Beautiful chocolate cake"
                />
              </div>

              <div className="floating-note">
                <span>♡</span>
                <div>
                  <strong>Made with care</strong>
                  <small>Every single day</small>
                </div>
              </div>

              <div className="hero-circle">BAKERY BLOOM</div>
            </div>
          </section>

          <section className="section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">FROM OUR OVEN</span>
                <h2>Our favourites</h2>
              </div>

              <button
                className="text-button"
                onClick={() => setTab('products')}
              >
                View all products →
              </button>
            </div>

            <div className="product-grid">
              {products
                .filter(product => product.tag)
                .slice(0, 4)
                .map(product => (
                  <ProductCard
                    product={product}
                    key={product.id}
                  />
                ))}
            </div>
          </section>

          <section className="custom-banner">
            <div>
              <span className="eyebrow">FOR YOUR SPECIAL MOMENTS</span>

              <h2>
                Dream it.
                <em> We'll bake it.</em>
              </h2>

              <p>
                Tell us what you have in mind and create a
                cake that's completely yours.
              </p>

              <button
                className="light-button"
                onClick={() => setTab('custom')}
              >
                Start a custom order →
              </button>
            </div>
          </section>
        </>
      );
    }

    if (tab === 'products') {
      return (
        <>
          <div className="page-heading">
            <span className="eyebrow">OUR MENU</span>
            <h1>Everything we bake</h1>
            <p>
              Fresh favourites, sweet treats and bakery
              classics.
            </p>
          </div>

          <div className="product-grid">
            {products.map(product => (
              <ProductCard
                product={product}
                key={product.id}
              />
            ))}
          </div>
        </>
      );
    }

    if (tab === 'cart') {
      return (
        <>
          <div className="page-heading">
            <span className="eyebrow">YOUR SELECTION</span>
            <h1>Your cart</h1>
          </div>

          {!cart.length ? (
            <Empty text="Your cart is waiting for something sweet." />
          ) : (
            <>
              <div className="cart-box">
                {cart.map(item => (
                  <div className="cartline" key={item.id}>
                    <div className="cart-product">
                      <img
                        src={productImage(item)}
                        alt={item.name}
                      />

                      <div>
                        <strong>{item.name}</strong>
                        <small>
                          ₹{Number(item.price).toFixed(2)}
                        </small>
                      </div>
                    </div>

                    <div className="quantity">
                      <button
                        onClick={() =>
                          setCart(current =>
                            current.flatMap(item =>
                              item.id === item.id &&
                              item.qty === 1
                                ? []
                                : item.id === item.id
                                ? [
                                    {
                                      ...item,
                                      qty: item.qty - 1
                                    }
                                  ]
                                : [item]
                            )
                          )
                        }
                      >
                        −
                      </button>

                      <span>{item.qty}</span>

                      <button
                        onClick={() =>
                          setCart(current =>
                            current.map(cartItem =>
                              cartItem.id === item.id
                                ? {
                                    ...cartItem,
                                    qty: cartItem.qty + 1
                                  }
                                : cartItem
                            )
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary">
                <span>Total</span>
                <b>₹{total.toFixed(2)}</b>
              </div>

              <button
                className="primary-button full-button"
                onClick={() => setTab('checkout')}
              >
                Continue to checkout →
              </button>
            </>
          )}
        </>
      );
    }

    if (tab === 'checkout') {
      return (
        <>
          <div className="page-heading">
            <span className="eyebrow">ALMOST THERE</span>
            <h1>Checkout</h1>
          </div>

          <form className="form-card" onSubmit={place}>
            <label>
              Name
              <input name="name" required />
            </label>

            <label>
              Fulfillment
              <select name="fulfillment">
                <option value="pickup">Pickup</option>
                <option value="delivery">Delivery</option>
              </select>
            </label>

            <label>
              Notes
              <textarea name="notes" />
            </label>

            <div className="summary">
              <span>Total</span>
              <b>₹{total.toFixed(2)}</b>
            </div>

            <button className="primary-button full-button">
              Place order →
            </button>
          </form>
        </>
      );
    }

    if (tab === 'custom') {
      return (
        <>
          <div className="page-heading">
            <span className="eyebrow">MADE JUST FOR YOU</span>
            <h1>Custom cake</h1>
            <p>
              Tell us what you're imagining and we'll take it
              from there.
            </p>
          </div>

          <form className="form-card" onSubmit={custom}>
            <label>
              Name
              <input name="name" required />
            </label>

            <label>
              Cake type
              <select name="type">
                <option>Round</option>
                <option>Sheet</option>
                <option>Tiered</option>
              </select>
            </label>

            <label>
              Flavour
              <select name="flavour">
                <option>Chocolate</option>
                <option>Vanilla</option>
                <option>Red Velvet</option>
              </select>
            </label>

            <label>
              Design / theme
              <textarea name="design" />
            </label>

            <label>
              Message on cake
              <input name="message" />
            </label>

            <button className="primary-button full-button">
              Submit custom request →
            </button>
          </form>
        </>
      );
    }

    if (tab === 'tracking') {
      return (
        <>
          <div className="page-heading">
            <span className="eyebrow">YOUR ORDER</span>
            <h1>Order tracking</h1>
          </div>

          {orders[0] ? (
            <Track order={orders[0]} />
          ) : (
            <Empty text="No orders yet." />
          )}
        </>
      );
    }

    return (
      <>
        <div className="page-heading">
          <span className="eyebrow">YOUR ORDERS</span>
          <h1>Order history</h1>
        </div>

        {orders.length ? (
          <div className="order-list">
            {orders.map(order => (
              <div className="order" key={order.id}>
                <div>
                  <b>{order.customerName}</b>
                  <small>
                    {order.type === 'custom'
                      ? 'Custom order'
                      : order.fulfillment}
                  </small>
                </div>

                <span className="badge">
                  {labels[order.status]}
                </span>

                <strong>
                  ₹{Number(order.total).toFixed(2)}
                </strong>
              </div>
            ))}
          </div>
        ) : (
          <Empty text="No previous orders." />
        )}
      </>
    );
  };

  const admin = () => {
    if (tab === 'orders') {
      return (
        <>
          <div className="admin-heading">
            <span className="eyebrow">MANAGEMENT</span>
            <h1>Orders</h1>
          </div>

          <div className="order-list">
            {orders.map(order => (
              <div className="order admin-order" key={order.id}>
                <div>
                  <b>{order.customerName}</b>
                  <small>
                    {order.type === 'custom'
                      ? 'Custom · '
                      : ''}
                    {order.fulfillment} · ₹
                    {Number(order.total).toFixed(2)}
                  </small>
                </div>

                <select
                  value={order.status}
                  onChange={event =>
                    status(order.id, event.target.value)
                  }
                >
                  {stages.map(stage => (
                    <option value={stage} key={stage}>
                      {labels[stage]}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </>
      );
    }
        if (tab === 'add-product') {
      return (
        <>
          <div className="admin-heading">
            <span className="eyebrow">PRODUCT MANAGEMENT</span>
            <h1>Add Product</h1>
            <p>Add a new bakery item to the customer menu.</p>
          </div>

          <AddProduct
            onProductAdded={(product) => {
              setProducts(current => [product, ...current]);
              setTab('products');
            }}
          />
        </>
      );
    }

    if (tab === 'inventory') {
      return (
        <>
          <div className="admin-heading">
            <span className="eyebrow">STOCK CONTROL</span>
            <h1>Inventory</h1>
          </div>

          <div className="inventory-card">
            {inventory.map(item => (
              <div className="stock" key={item.id || item.name}>
                <div className="stock-name">
                  <strong>{item.name}</strong>
                  <small>
                    {item.qty} units available
                  </small>
                </div>

                <div className="bar">
                  <i
                    style={{
                      width:
                        Math.min(Number(item.qty), 100) + '%'
                    }}
                  />
                </div>

                <b
                  className={
                    item.qty <= item.threshold
                      ? 'low-stock'
                      : 'ok-stock'
                  }
                >
                  {item.qty <= item.threshold ? 'Low' : 'OK'}
                </b>
              </div>
            ))}
          </div>
        </>
      );
    }

    return (
      <>
        <div className="admin-heading">
          <span className="eyebrow">BAKERY BLOOM</span>
          <h1>Dashboard</h1>
          <p>Here's what's happening today.</p>
        </div>

        <div className="stats">
          <div>
            <span>ORDERS</span>
            <b>{orders.length}</b>
            <small>Total orders</small>
          </div>

          <div>
            <span>SALES</span>
            <b>
              ₹
              {orders
                .reduce(
                  (sum, order) =>
                    sum + Number(order.total),
                  0
                )
                .toFixed(2)}
            </b>
            <small>Total sales</small>
          </div>

          <div>
            <span>STOCK</span>
            <b>
              {
                inventory.filter(
                  item => item.qty <= item.threshold
                ).length
              }
            </b>
            <small>Low stock items</small>
          </div>
        </div>

        <section className="panel">
          <div className="panel-heading">
            <h3>Recent orders</h3>
            <span>Latest activity</span>
          </div>

          {orders.slice(0, 5).map(order => (
            <div className="order" key={order.id}>
              <span>{order.customerName}</span>

              <span className="badge">
                {labels[order.status]}
              </span>
            </div>
          ))}
        </section>
      </>
    );
  };

  return (
    <>
      <div className="modebar">
        <div>
          <button
            className={mode === 'customer' ? 'active' : ''}
            onClick={() => {
              setMode('customer');
              setTab('home');
            }}
          >
            Customer Portal
          </button>

          <button
            className={mode === 'admin' ? 'active' : ''}
            onClick={() => {
              setMode('admin');
              setTab('dash');
            }}
          >
            Staff & Admin
          </button>
        </div>
      </div>

      {mode === 'customer' ? (
        <>
          <header className="site-header">
            <button
              className="brand"
              onClick={() => setTab('home')}
            >
              <span className="brand-mark">B</span>

              <span>
                <strong>Bakery Bloom</strong>
                <small>BAKED WITH CARE</small>
              </span>
            </button>

            <button
              className="cart-button"
              onClick={() => setTab('cart')}
            >
              <span>Cart</span>
              <b>{count}</b>
            </button>
          </header>

          <nav className="customer-nav">
            {[
              ['home', 'Home'],
              ['products', 'Menu'],
              ['custom', 'Custom Cakes'],
              ['cart', 'Cart'],
              ['tracking', 'Tracking'],
              ['history', 'History']
            ].map(item => (
              <button
                className={tab === item[0] ? 'active' : ''}
                onClick={() => setTab(item[0])}
                key={item[0]}
              >
                {item[1]}
              </button>
            ))}
          </nav>

          <main className="customer-main">
            {customer()}
          </main>

          <footer>
            <div>
              <strong>Bakery Bloom</strong>
              <span>Freshly baked, thoughtfully made.</span>
            </div>

            <span>© 2026 Bakery Bloom</span>
          </footer>
        </>
      ) : (
        <div className="admin">
          <aside className="admin-sidebar">
            <div className="admin-brand">
              <span className="brand-mark">B</span>
              <strong>Bakery<br />Bloom</strong>
            </div>

            <span className="sidebar-label">
              WORKSPACE
            </span>
            
            

              {[
                 ['dash', 'Dashboard'],
                 ['orders', 'Orders'],
                 ['products', 'Products'],
                 ['add-product', 'Add Product'],
                  ['inventory', 'Inventory']
                 ].map(([key, label]) => (

  <button
    className={tab === key ? 'active' : ''}
    onClick={() => setTab(key)}
    key={key}
  >
    {label}
  </button>


))}

            <div className="sidebar-bottom">
              <span>STAFF MODE</span>

              <button
                onClick={() => {
                  setMode('customer');
                  setTab('home');
                }}
              >
                ← Customer Portal
              </button>
            </div>
          </aside>

          <main className="admin-main">
            {admin()}
          </main>
        </div>
      )}
    </>
  );
}

function AddProduct({ onProductAdded }) {

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Cake');
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {

    event.preventDefault();

    if (!name || !price || !image) {
      setMessage('Please enter the product name, price and image.');
      return;
    }

    const formData = new FormData();

    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('category', category);
    formData.append('image', image);

    setSaving(true);
    setMessage('');

    try {

      const response = await fetch(
        'http://localhost:5000/api/products',
        {
          method: 'POST',
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          'Failed to add product'
        );
      }

      setMessage('Product added successfully!');

      const newProduct = {
        id: data.productId,
        name,
        description,
        price,
        category,
        image: data.image
      };

      if (onProductAdded) {
        onProductAdded(newProduct);
      }

      setName('');
      setDescription('');
      setPrice('');
      setCategory('Cake');
      setImage(null);

      document.getElementById('product-image').value = '';

    } catch (error) {

      console.error(error);
      setMessage(error.message);

    } finally {

      setSaving(false);

    }
  }


  return (
    <div className="form-card">

      <form onSubmit={handleSubmit}>

        <label>
          Product Name

          <input
            type="text"
            value={name}
            onChange={event =>
              setName(event.target.value)
            }
            placeholder="Chocolate Truffle Cake"
            required
          />
        </label>


        <label>
          Description

          <textarea
            value={description}
            onChange={event =>
              setDescription(event.target.value)
            }
            placeholder="Rich chocolate cake with chocolate frosting"
          />
        </label>


        <label>
          Price

          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={event =>
              setPrice(event.target.value)
            }
            placeholder="550"
            required
          />
        </label>


        <label>
          Category

          <select
            value={category}
            onChange={event =>
              setCategory(event.target.value)
            }
          >
            <option value="Cake">Cake</option>
            <option value="Pastry">Pastry</option>
            <option value="Cupcake">Cupcake</option>
            <option value="Bread">Bread</option>
            <option value="Cookie">Cookie</option>
          </select>
        </label>


        <label>
          Product Image

          <input
            id="product-image"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={event =>
              setImage(event.target.files[0])
            }
            required
          />
        </label>


        {image && (
          <p>
            Selected image: <strong>{image.name}</strong>
          </p>
        )}


        <button
          className="primary-button"
          type="submit"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Product →'}
        </button>


        {message && (
          <p>{message}</p>
        )}

      </form>

    </div>
  );
}

function Empty({ text = 'Empty.' }) {
  return (
    <div className="empty">
      <div className="empty-icon">♡</div>
      <p>{text}</p>
    </div>
  );
}

function Track({ order }) {
  const currentIndex = stages.indexOf(order.status);

  return (
    <div className="tracking-card">
      {stages.map((stage, index) => (
        <div className="step" key={stage}>
          <span
            className={
              index < currentIndex
                ? 'done'
                : index === currentIndex
                ? 'current'
                : ''
            }
          >
            {index < currentIndex ? '✓' : index + 1}
          </span>

          <div>
            <b>{labels[stage]}</b>

            {index === currentIndex && (
              <small>In progress</small>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
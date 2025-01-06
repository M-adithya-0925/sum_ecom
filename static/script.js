// Simulated product data
const products = [
    { id: 1, name: "Vitamin C Serum", price: 29.99, image: "vitamin-c-serum.jpg", description: "High potency Vitamin C serum" },
    { id: 2, name: "Neem Facewash Powder", price: 14.99, image: "neem-facewash.jpg", description: "Natural neem face wash" },
    { id: 3, name: "Aloe Vera Sunscreen", price: 19.99, image: "aloe-vera-sunscreen.jpg", description: "Soothing aloe vera sunscreen" },
    { id: 4, name: "Ragi", price: 9.99, image: "ragi.jpg", description: "Nutritious ragi flour" },
    { id: 5, name: "Kambu", price: 7.99, image: "kambu.jpg", description: "Organic kambu grains" },
    { id: 6, name: "ABC Juice Powder", price: 24.99, image: "abc-juice-powder.jpg", description: "Healthy ABC juice mix" },
    { id: 7, name: "Fenugreek Powder", price: 12.99, image: "fenugreek-powder.jpg", description: "Pure fenugreek powder" },
    { id: 8, name: "Nilevembu Powder", price: 16.99, image: "nilevembu-powder.jpg", description: "Traditional nilevembu powder" },
    { id: 9, name: "Papaya Leaf Powder", price: 11.99, image: "papaya-leaf-powder.jpg", description: "Organic papaya leaf powder" }
];

// Cart data
let cart = [];

// Current page
let currentPage = 'home';

// DOM Elements
const mainContent = document.getElementById('main-content');
const cartCount = document.getElementById('cart-count');
const modal = document.getElementById('predictionModal');
const modalTitle = document.getElementById('modalTitle');
const predictionImage = document.getElementById('predictionImage');

// Navigation
document.querySelectorAll('a[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        currentPage = e.target.dataset.page;
        renderPage();
    });
});

// Render current page
function renderPage() {
    switch (currentPage) {
        case 'home':
            renderHome();
            break;
        case 'products':
            renderProducts();
            break;
        case 'cart':
            renderCart();
            break;
        case 'account':
            renderAccount();
            break;
        default:
            renderHome();
    }
}

// Render home page
function renderHome() {
    mainContent.innerHTML = `
        <h1>Welcome to SuperCommerce</h1>
        <p>Discover amazing products at unbeatable prices!</p>
        <button class="btn btn-primary" onclick="currentPage='products'; renderPage();">Shop Now</button>
    `;
}

// Render products page
function renderProducts() {
    let productsHTML = '<h1>Our Products</h1><div class="row">';
    products.forEach(product => {
        productsHTML += `
            <div class="col-md-4 mb-4">
                <div class="card product-card">
                    <img src="${product.image}" class="card-img-top" alt="${product.name}">
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text">${product.description}</p>
                        <p class="card-text">$${product.price.toFixed(2)}</p>
                        <button class="btn btn-primary" onclick="addToCart(${product.id})">Add to Cart</button>
                        <button class="btn btn-secondary mt-2" onclick="showPrediction('${product.name}')">Show Prediction</button>
                    </div>
                </div>
            </div>
        `;
    });
    productsHTML += '</div>';
    mainContent.innerHTML = productsHTML;
}

// Render cart page
function renderCart() {
    let cartHTML = '<h1>Your Cart</h1>';
    if (cart.length === 0) {
        cartHTML += '<p>Your cart is empty.</p>';
    } else {
        cartHTML += '<div class="cart-items">';
        cart.forEach(item => {
            cartHTML += `
                <div class="cart-item">
                    <span>${item.name}</span>
                    <span>$${item.price.toFixed(2)}</span>
                    <span>
                        <button onclick="updateQuantity(${item.id}, -1)">-</button>
                        ${item.quantity}
                        <button onclick="updateQuantity(${item.id}, 1)">+</button>
                    </span>
                    <button onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            `;
        });
        cartHTML += '</div>';
        cartHTML += `
            <div class="cart-total">
                <strong>Total: $${calculateTotal().toFixed(2)}</strong>
            </div>
            <button class="btn btn-success mt-3" onclick="checkout()">Checkout</button>
        `;
    }
    mainContent.innerHTML = cartHTML;
}

// Render account page
function renderAccount() {
    mainContent.innerHTML = `
        <h1>Your Account</h1>
        <div class="account-form">
            <h2>Login</h2>
            <form onsubmit="login(event)">
                <div class="mb-3">
                    <label for="email" class="form-label">Email address</label>
                    <input type="email" class="form-control" id="email" required>
                </div>
                <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" class="form-control" id="password" required>
                </div>
                <button type="submit" class="btn btn-primary">Login</button>
            </form>
        </div>
    `;
}

// Add to cart function
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const cartItem = cart.find(item => item.id === productId);
    if (cartItem) {
        cartItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCartCount();
}

// Update cart count
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = count;
}

// Update quantity in cart
function updateQuantity(productId, change) {
    const cartItem = cart.find(item => item.id === productId);
    if (cartItem) {
        cartItem.quantity += change;
        if (cartItem.quantity <= 0) {
            removeFromCart(productId);
        }
    }
    renderCart();
    updateCartCount();
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    renderCart();
    updateCartCount();
}

// Calculate total
function calculateTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Checkout function (placeholder)
function checkout() {
    alert('Checkout functionality would be implemented here.');
    cart = [];
    updateCartCount();
    renderCart();
}

// Login function (placeholder)
function login(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    alert(`Login attempt with email: ${email}`);
    // Implement actual login logic here
}

// Show prediction function
function showPrediction(productName) {
    modalTitle.textContent = `Price Prediction for ${productName}`;
    predictionImage.src = ""; // Clear previous image

    // Send request to Flask backend
    fetch('/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `product_name=${encodeURIComponent(productName)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            predictionImage.src = `data:image/png;base64,${data.image}`;
            modal.style.display = "block";
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while fetching the prediction.');
    });
}

// Close the modal when clicking on <span> (x)
document.querySelector('.close').onclick = function() {
    modal.style.display = "none";
}

// Close the modal when clicking outside of it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Initial render
document.addEventListener('DOMContentLoaded', () => {
    renderPage();
    updateCartCount();
});
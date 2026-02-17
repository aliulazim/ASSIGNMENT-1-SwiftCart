// Global State
let allProducts = [];
let cart = JSON.parse(localStorage.getItem('swiftCart')) || [];

// API Endpoints
const API_URL = "https://fakestoreapi.com/products";
const CATEGORIES_URL = "https://fakestoreapi.com/products/categories";

// DOM Elements (Checks if they exist on the current page)
const trendingContainer = document.getElementById('trending-container');
const allProductsContainer = document.getElementById('all-products-container');
const categoryContainer = document.getElementById('category-container');

// Cart Elements (Present on both pages)
const cartCount = document.getElementById('cart-count');
const cartItemInfo = document.getElementById('cart-item-info');
const cartTotalPrice = document.getElementById('cart-total-price');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartTotalModal = document.getElementById('cart-total-modal');
const modalContent = document.getElementById('modal-content');
const detailsModal = document.getElementById('details_modal');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Initial fetch
    fetchProducts();

    // Only fetch categories if we are on the products page
    if (categoryContainer) {
        fetchCategories();
    }

    updateCartUI();
});

// --- Fetch Functions ---

async function fetchProducts() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        allProducts = data;

        // Logic for Home Page
        if (trendingContainer) {
            displayTrending(data);
        }

        // Logic for Products Page
        if (allProductsContainer) {
            displayProducts(data);
        }
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

async function fetchCategories() {
    try {
        const res = await fetch(CATEGORIES_URL);
        const data = await res.json();
        displayCategories(data);
    } catch (error) {
        console.error("Error fetching categories:", error);
    }
}

async function loadCategoryProducts(category, btn) {
    // UI: Active Button State
    const buttons = categoryContainer.querySelectorAll('button');
    buttons.forEach(b => {
        b.classList.remove('btn-primary', 'btn-active', 'bg-indigo-600', 'text-white', 'border-none');
        b.classList.add('btn-outline');
    });
    btn.classList.remove('btn-outline');
    btn.classList.add('btn-primary', 'btn-active', 'bg-indigo-600', 'text-white', 'border-none');

    // Loading State
    allProductsContainer.innerHTML = '<span class="loading loading-spinner loading-lg text-indigo-600 mx-auto col-span-full"></span>';

    if (category === 'all') {
        displayProducts(allProducts);
        return;
    }

    try {
        const res = await fetch(`https://fakestoreapi.com/products/category/${category}`);
        const data = await res.json();
        displayProducts(data);
    } catch (error) {
        console.error("Error fetching category:", error);
    }
}

// --- Display Functions ---

function displayCategories(categories) {
    let html = `<button onclick="loadCategoryProducts('all', this)" class="btn btn-sm btn-active btn-primary bg-indigo-600 border-none capitalize text-white">All</button>`;

    categories.forEach(cat => {
        html += `<button onclick="loadCategoryProducts('${cat}', this)" class="btn btn-sm btn-outline capitalize">${cat}</button>`;
    });
    categoryContainer.innerHTML = html;
}

function displayTrending(products) {
    // Get top rated products or just slice
    const trending = products.slice(0, 3);
    trendingContainer.innerHTML = "";
    trending.forEach(product => {
        const card = createProductCard(product);
        trendingContainer.innerHTML += card;
    });
}

function displayProducts(products) {
    allProductsContainer.innerHTML = "";
    if (products.length === 0) {
        allProductsContainer.innerHTML = "<p class='text-center w-full col-span-full'>No products found.</p>";
        return;
    }
    products.forEach(product => {
        const card = createProductCard(product);
        allProductsContainer.innerHTML += card;
    });
}

function createProductCard(product) {
    const fullStars = Math.floor(product.rating.rate);
    let starHtml = '';
    for (let i = 0; i < 5; i++) {
        starHtml += i < fullStars
            ? '<i class="fa-solid fa-star text-yellow-400 text-xs"></i>'
            : '<i class="fa-regular fa-star text-gray-300 text-xs"></i>';
    }

    return `
    <div class="card bg-white shadow-md border border-gray-100 p-4 flex flex-col justify-between h-full hover:shadow-xl transition duration-300 rounded-xl">
        <figure class="px-4 pt-4 h-48 flex justify-center items-center bg-white rounded-lg overflow-hidden">
            <img src="${product.image}" alt="${product.title}" class="h-full object-contain hover:scale-110 transition duration-300" />
        </figure>
        <div class="card-body p-4 flex-grow-0">
            <div class="badge badge-ghost text-xs mb-2 capitalize text-gray-500">${product.category}</div>
            <h2 class="card-title text-base line-clamp-1 text-gray-800" title="${product.title}">${product.title}</h2>
            <div class="flex items-center gap-2 mb-2">
                <div class="flex">${starHtml}</div>
                <span class="text-xs text-gray-500">(${product.rating.count})</span>
            </div>
            <div class="flex justify-between items-center mt-auto">
                <p class="text-lg font-bold text-indigo-600">$${product.price}</p>
            </div>
            <div class="card-actions justify-between mt-4">
                <button onclick="showDetails(${product.id})" class="btn btn-sm btn-outline flex-1 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600"><i class="fa-regular fa-eye"></i> Details</button>
                <button onclick="addToCart(${product.id})" class="btn btn-sm btn-primary flex-1 bg-indigo-600 border-none hover:bg-indigo-700 text-white"><i class="fa-solid fa-cart-plus"></i> Add</button>
            </div>
        </div>
    </div>
    `;
}

// --- Cart Functionality ---

function addToCart(id) {
    const product = allProducts.find(p => p.id === id);
    if (product) {
        cart.push(product);
        updateCartUI();
        saveCart();
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
    saveCart();
}

function updateCartUI() {
    // Safety check for elements
    if (!cartCount) return;

    cartCount.innerText = cart.length;
    cartItemInfo.innerText = `${cart.length} Items`;

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const formattedTotal = total.toFixed(2);

    cartTotalPrice.innerText = `Subtotal: $${formattedTotal}`;
    cartTotalModal.innerText = formattedTotal;

    cartItemsContainer.innerHTML = "";
    cart.forEach((item, index) => {
        cartItemsContainer.innerHTML += `
        <tr class="hover:bg-gray-50">
            <td>
                <div class="flex items-center gap-3">
                    <div class="avatar">
                        <div class="mask mask-squircle w-10 h-10 bg-white p-1 border">
                            <img src="${item.image}" alt="Product" class="object-contain" />
                        </div>
                    </div>
                    <div>
                        <div class="font-bold text-xs line-clamp-1 w-32">${item.title}</div>
                    </div>
                </div>
            </td>
            <td class="text-sm font-semibold">$${item.price}</td>
            <th>
                <button onclick="removeFromCart(${index})" class="btn btn-ghost btn-xs text-red-500 hover:bg-red-50"><i class="fa-solid fa-trash"></i></button>
            </th>
        </tr>
        `;
    });
}

function saveCart() {
    localStorage.setItem('swiftCart', JSON.stringify(cart));
}

// --- Modal Functionality ---

async function showDetails(id) {
    try {
        const res = await fetch(`https://fakestoreapi.com/products/${id}`);
        const product = await res.json();

        const fullStars = Math.floor(product.rating.rate);
        let starHtml = '';
        for (let i = 0; i < 5; i++) {
            starHtml += i < fullStars
                ? '<i class="fa-solid fa-star text-yellow-400"></i>'
                : '<i class="fa-regular fa-star text-gray-300"></i>';
        }

        modalContent.innerHTML = `
            <div class="flex justify-center items-center bg-white p-8 rounded-xl border border-gray-100">
                <img src="${product.image}" class="max-h-[300px] object-contain" alt="${product.title}"/>
            </div>
            <div class="flex flex-col gap-4 py-4">
                <h3 class="font-bold text-2xl text-gray-900">${product.title}</h3>
                <div class="badge badge-secondary capitalize bg-indigo-100 text-indigo-700 border-none">${product.category}</div>
                <p class="text-gray-600 leading-relaxed">${product.description}</p>
                <div class="flex items-center gap-2 mt-2">
                    <div class="flex">${starHtml}</div>
                    <span class="text-sm text-gray-500">(${product.rating.count} reviews)</span>
                </div>
                <div class="flex items-center gap-4 mt-auto pt-4 border-t">
                    <span class="text-3xl font-bold text-indigo-600">$${product.price}</span>
                    <button onclick="addToCart(${product.id}); details_modal.close()" class="btn btn-primary px-8 bg-indigo-600 border-none text-white hover:bg-indigo-700">Buy Now</button>
                </div>
            </div>
        `;
        detailsModal.showModal();

    } catch (error) {
        console.error("Error showing details:", error);
    }
}
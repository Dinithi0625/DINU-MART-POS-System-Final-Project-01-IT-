import {customer_array, item_array, order_array, cart_array} from "../db/database.js";
import cartModel from "../model/cartModel.js";
import orderModel from "../model/orderModel.js";
import {isPositiveInt, showError, escapeHtml} from "../util/validation.js";
import {updateDashboard} from "./dashboardController.js";

// ---------- helpers ----------
const getSubtotal = () => cart_array.reduce((sum, c) => sum + c.total, 0);

const getDiscount = () => {
    const raw = $('#discountInput').val().trim();
    if (raw === '') return 0;
    const d = Number(raw);
    return (isNaN(d) || d < 0 || d > 100) ? null : d;   // null = invalid
};

const refreshTotals = () => {
    const subtotal = getSubtotal();
    const discount = getDiscount();
    $('#subtotal').text(subtotal.toFixed(2));
    if (discount === null) {
        $('#totalAmount').text(subtotal.toFixed(2));
        return;
    }
    $('#totalAmount').text((subtotal - subtotal * discount / 100).toFixed(2));
};

const loadCart = () => {
    $('#orderItemsList').empty();
    cart_array.forEach((c) => {
        $('#orderItemsList').append(`<tr>
            <td>${escapeHtml(c.cartItem)}</td>
            <td>${c.price.toFixed(2)}</td>
            <td>${c.quantity}</td>
            <td>${c.total.toFixed(2)}</td>
            <td><button type="button" class="btn btn-sm btn-danger remove-cart-item" data-code="${escapeHtml(c.id)}">
                <i class="fas fa-trash"></i></button></td>
        </tr>`);
    });
    refreshTotals();
};

export const loadCustomers = () => {
    const previous = $('#customerSelect').val();
    $('#customerSelect').empty().append('<option value="">Select customer...</option>');
    customer_array.forEach((c) => {
        $('#customerSelect').append(
            `<option value="${c.id}">${escapeHtml(c.first_name + ' ' + c.last_name)}</option>`);
    });
    $('#customerSelect').val(previous);
};

export const loadItems = () => {
    const previous = $('#itemSelect').val();
    $('#itemSelect').empty().append('<option value="">Select item...</option>');
    item_array.forEach((i) => {
        $('#itemSelect').append(
            `<option value="${escapeHtml(i.code)}">${escapeHtml(i.description)} (Stock: ${i.qty})</option>`);
    });
    $('#itemSelect').val(previous);
};

const resetOrderForm = () => {
    cart_array.length = 0;
    $('#customerSelect').val('');
    $('#itemSelect').val('');
    $('#quantitySelect').val('');
    $('#discountInput').val(0);
    $('#cashPayment').prop('checked', true);
    loadCart();
};

// ---------- events ----------
$('#order-nav').on('click', () => {
    loadCustomers();
    loadItems();
    loadCart();
});

$('#addItemBtn').on('click', function () {
    const code = $('#itemSelect').val();
    const qtyRaw = $('#quantitySelect').val().trim();

    if (!code) return showError("Please select an item!");
    if (!isPositiveInt(qtyRaw)) return showError("Invalid Quantity! (whole number greater than 0)");

    const item = item_array.find(i => i.code === code);
    if (!item) return showError("Selected item no longer exists!");

    const qty = parseInt(qtyRaw, 10);
    const existing = cart_array.find(c => c.id === code);
    const alreadyInCart = existing ? existing.quantity : 0;

    if (qty + alreadyInCart > item.qty) {
        return showError(`Not enough stock! Available: ${item.qty}, already in cart: ${alreadyInCart}`);
    }

    const price = Number(item.unitPrice);
    if (existing) {
        existing.quantity += qty;
        existing.total = existing.quantity * price;
    } else {
        cart_array.push(new cartModel(code, item.description, price, qty, qty * price));
    }

    $('#itemSelect').val('');
    $('#quantitySelect').val('');
    loadCart();
});

$('#orderItemsList').on('click', '.remove-cart-item', function () {
    const code = String($(this).data('code'));
    const index = cart_array.findIndex(c => c.id === code);
    if (index !== -1) cart_array.splice(index, 1);
    loadCart();
});

$('#confirm-discount').on('click', function () {
    if (getDiscount() === null) return showError("Invalid Discount! (0 - 100)");
    refreshTotals();
});

$('#discountInput').on('input', refreshTotals);

$('#placeOrderBtn').on('click', function () {
    const customerId = $('#customerSelect').val();
    const customer = customer_array.find(c => String(c.id) === customerId);
    const payment = $('input[name="paymentMethod"]:checked').val();
    const discount = getDiscount();

    if (!customer) return showError("Please select a customer!");
    if (cart_array.length === 0) return showError("Cart is empty! Please add items first.");
    if (discount === null) return showError("Invalid Discount! (0 - 100)");
    if (!payment) return showError("Please select a payment method!");

    // final stock check
    for (const c of cart_array) {
        const item = item_array.find(i => i.code === c.id);
        if (!item) return showError(`Item "${c.cartItem}" no longer exists!`);
        if (c.quantity > item.qty) return showError(`Not enough stock for "${c.cartItem}"! Available: ${item.qty}`);
    }

    const subtotal = getSubtotal();
    const total = subtotal - subtotal * discount / 100;
    const itemsText = cart_array.map(c => `${c.cartItem} x${c.quantity}`).join(', ');
    const totalQty = cart_array.reduce((sum, c) => sum + c.quantity, 0);
    const orderNo = order_array.length + 1;
    const id = 'ORD' + String(orderNo).padStart(3, '0');

    // reduce stock
    cart_array.forEach(c => {
        const item = item_array.find(i => i.code === c.id);
        item.qty = item.qty - c.quantity;
    });

    order_array.push(new orderModel(id, new Date().toLocaleDateString(),
        customer.first_name + ' ' + customer.last_name, itemsText, totalQty, payment, discount, total.toFixed(2)));

    Swal.fire({icon: "success", title: "Success", text: `Order ${id} placed successfully!`});

    resetOrderForm();
    loadItems();
    updateDashboard();
});

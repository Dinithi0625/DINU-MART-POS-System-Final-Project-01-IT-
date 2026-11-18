import {order_array} from "../db/database.js";
import {escapeHtml} from "../util/validation.js";

const loadOrderTable = () => {
    $('#orderHistory').empty();

    if (order_array.length === 0) {
        $('#orderHistory').append('<tr><td colspan="8" class="text-center text-muted">No orders yet</td></tr>');
        return;
    }

    order_array.forEach((order) => {
        $('#orderHistory').append(`<tr>
            <td>${escapeHtml(order.id)}</td>
            <td>${escapeHtml(order.date)}</td>
            <td>${escapeHtml(order.customer)}</td>
            <td>${escapeHtml(order.item)}</td>
            <td>${escapeHtml(order.quantity)}</td>
            <td>${escapeHtml(order.paymentMethod)}</td>
            <td>${escapeHtml(order.discount)}</td>
            <td>${escapeHtml(order.total)}</td>
        </tr>`);
    });
};

$('#refresh').on('click', loadOrderTable);
$('#order-history-nav').on('click', loadOrderTable);
loadOrderTable();

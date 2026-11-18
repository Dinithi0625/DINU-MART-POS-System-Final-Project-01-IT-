import {customer_array, item_array, order_array} from "../db/database.js";

export const updateDashboard = () => {
    const revenue = order_array.reduce((sum, o) => sum + Number(o.total), 0);
    $('#customerCount').text(customer_array.length);
    $('#itemCount').text(item_array.length);
    $('#orderCount').text(order_array.length);
    $('#totalRevenue').text('$' + revenue.toFixed(2));
};

$('#dashboard-nav').on('click', updateDashboard);
updateDashboard();

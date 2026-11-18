import customerModel from "../model/customerModel.js";
import {customer_array} from "../db/database.js";
import {
    validateName, validateEmail, validateMobile,
    showError, showSuccess, escapeHtml
} from "../util/validation.js";
import {updateDashboard} from "./dashboardController.js";

let selected_customer_index = null;

const loadCustomerTable = () => {
    $('#customerTableBody').empty();
    customer_array.forEach((item) => {
        $('#customerTableBody').append(`<tr>
            <td>${escapeHtml(item.first_name)}</td>
            <td>${escapeHtml(item.last_name)}</td>
            <td>${escapeHtml(item.mobile)}</td>
            <td>${escapeHtml(item.email)}</td>
            <td>${escapeHtml(item.address)}</td>
        </tr>`);
    });
};

const clearForm = () => {
    $('#firstName, #lastName, #mobile, #email, #address').val('');
    selected_customer_index = null;
    $('#customerTableBody tr').removeClass('table-active');
};

const readForm = () => ({
    first_name: $('#firstName').val().trim(),
    last_name: $('#lastName').val().trim(),
    mobile: $('#mobile').val().trim(),
    email: $('#email').val().trim(),
    address: $('#address').val().trim()
});

// returns an error message, or null if everything is valid
const validateCustomer = (c, ignoreIndex = null) => {
    if (!validateName(c.first_name)) return "Invalid First Name! (letters only, 2-30 characters)";
    if (!validateName(c.last_name)) return "Invalid Last Name! (letters only, 2-30 characters)";
    if (!validateMobile(c.mobile)) return "Invalid Mobile! (e.g. 0771234567)";
    if (!validateEmail(c.email)) return "Invalid Email!";
    if (c.address.length < 3) return "Invalid Address!";

    const dupMobile = customer_array.some((x, i) => i !== ignoreIndex && x.mobile === c.mobile);
    if (dupMobile) return "A customer with this mobile number already exists!";
    const dupEmail = customer_array.some((x, i) => i !== ignoreIndex &&
        x.email.toLowerCase() === c.email.toLowerCase());
    if (dupEmail) return "A customer with this email already exists!";
    return null;
};

$("#add-customer").on("click", function () {
    const c = readForm();
    const error = validateCustomer(c);
    if (error) return showError(error);

    const id = customer_array.length > 0 ? Math.max(...customer_array.map(x => x.id)) + 1 : 1;
    customer_array.push(new customerModel(id, c.first_name, c.last_name, c.address, c.mobile, c.email));

    clearForm();
    loadCustomerTable();
    updateDashboard();
    showSuccess("Customer added successfully!");
});

$('#customerTableBody').on('click', 'tr', function () {
    const index = $(this).index();
    const customer = customer_array[index];
    if (!customer) return;

    selected_customer_index = index;
    $('#customerTableBody tr').removeClass('table-active');
    $(this).addClass('table-active');

    $('#firstName').val(customer.first_name);
    $('#lastName').val(customer.last_name);
    $('#email').val(customer.email);
    $('#mobile').val(customer.mobile);
    $('#address').val(customer.address);
});

$('#update-customer').on('click', function () {
    if (selected_customer_index === null) return showError("Please select a customer from the table first!");

    const c = readForm();
    const error = validateCustomer(c, selected_customer_index);
    if (error) return showError(error);

    const index = selected_customer_index;
    Swal.fire({
        title: "Do you want to save the changes?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Save",
        denyButtonText: `Don't save`
    }).then((result) => {
        if (result.isConfirmed) {
            customer_array[index] = new customerModel(
                customer_array[index].id, c.first_name, c.last_name, c.address, c.mobile, c.email);
            clearForm();
            loadCustomerTable();
            Swal.fire("Saved!", "", "success");
        } else if (result.isDenied) {
            Swal.fire("Changes are not saved", "", "info");
        }
    });
});

$('#delete-customer').on('click', function () {
    if (selected_customer_index === null) return showError("Please select a customer from the table first!");

    const index = selected_customer_index;
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {
            customer_array.splice(index, 1);
            clearForm();
            loadCustomerTable();
            updateDashboard();
            Swal.fire({title: "Deleted!", text: "Customer has been deleted.", icon: "success"});
        }
    });
});

$('#customer-nav').on('click', loadCustomerTable);

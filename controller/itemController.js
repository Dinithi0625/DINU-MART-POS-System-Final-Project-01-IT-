import itemModel from '../model/itemModel.js';
import {item_array} from '../db/database.js';
import {
    validateCode, isNonNegativeInt, isPositiveNumber,
    showError, showSuccess, escapeHtml
} from "../util/validation.js";
import {updateDashboard} from "./dashboardController.js";

let selected_item_index = null;

const loadItemTable = () => {
    $('#itemTableBody').empty();
    item_array.forEach((item) => {
        $('#itemTableBody').append(`<tr>
            <td>${escapeHtml(item.code)}</td>
            <td>${escapeHtml(item.description)}</td>
            <td>${escapeHtml(item.qty)}</td>
            <td>${escapeHtml(Number(item.unitPrice).toFixed(2))}</td>
        </tr>`);
    });
};

const clearForm = () => {
    $('#itemCode, #description, #quantity, #unitPrice').val('');
    selected_item_index = null;
    $('#itemTableBody tr').removeClass('table-active');
};

const readForm = () => ({
    code: $('#itemCode').val().trim(),
    description: $('#description').val().trim(),
    quantity: $('#quantity').val().trim(),
    unitPrice: $('#unitPrice').val().trim()
});

const validateItem = (i, ignoreIndex = null) => {
    if (!validateCode(i.code)) return "Invalid Item Code! (letters, numbers and - only, max 15)";
    if (item_array.some((x, idx) => idx !== ignoreIndex && x.code.toLowerCase() === i.code.toLowerCase()))
        return "Item code already exists!";
    if (i.description.length < 2) return "Invalid Description!";
    if (!isNonNegativeInt(i.quantity)) return "Invalid Quantity! (whole number, 0 or more)";
    if (!isPositiveNumber(i.unitPrice)) return "Invalid Unit Price! (must be greater than 0)";
    return null;
};

$("#add-item").on("click", function () {
    const i = readForm();
    const error = validateItem(i);
    if (error) return showError(error);

    const id = item_array.length > 0 ? Math.max(...item_array.map(x => x.id)) + 1 : 1;
    item_array.push(new itemModel(id, i.code, i.description, parseInt(i.quantity, 10), parseFloat(i.unitPrice)));

    clearForm();
    loadItemTable();
    updateDashboard();
    showSuccess("Item added successfully!");
});

$("#itemTableBody").on("click", "tr", function () {
    const index = $(this).index();
    const item = item_array[index];
    if (!item) return;

    selected_item_index = index;
    $('#itemTableBody tr').removeClass('table-active');
    $(this).addClass('table-active');

    $('#itemCode').val(item.code);
    $('#description').val(item.description);
    $('#quantity').val(item.qty);
    $('#unitPrice').val(item.unitPrice);
});

$('#update-item').on('click', function () {
    if (selected_item_index === null) return showError("Please select an item from the table first!");

    const i = readForm();
    const error = validateItem(i, selected_item_index);
    if (error) return showError(error);

    const index = selected_item_index;
    Swal.fire({
        title: "Do you want to save the changes?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Save",
        denyButtonText: `Don't save`
    }).then((result) => {
        if (result.isConfirmed) {
            item_array[index] = new itemModel(item_array[index].id, i.code, i.description,
                parseInt(i.quantity, 10), parseFloat(i.unitPrice));
            clearForm();
            loadItemTable();
            Swal.fire("Saved!", "", "success");
        } else if (result.isDenied) {
            Swal.fire("Changes are not saved", "", "info");
        }
    });
});

$('#delete-item').on('click', function () {
    if (selected_item_index === null) return showError("Please select an item from the table first!");

    const index = selected_item_index;
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
            item_array.splice(index, 1);
            clearForm();
            loadItemTable();
            updateDashboard();
            Swal.fire({title: "Deleted!", text: "Item has been deleted.", icon: "success"});
        }
    });
});

$('#item-nav').on('click', loadItemTable);

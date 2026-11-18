// ---------- Validation helpers ----------
export const validateName = (name) => /^[A-Za-z][A-Za-z\s.'-]{1,29}$/.test(name.trim());

export const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

// Sri Lankan numbers: 0771234567 or +94771234567
export const validateMobile = (mobile) => /^(?:\+94|0)\d{9}$/.test(mobile.trim());

export const validateCode = (code) => /^[A-Za-z0-9-]{1,15}$/.test(code.trim());

export const isPositiveInt = (value) => /^\d+$/.test(String(value).trim()) && parseInt(value, 10) > 0;

export const isNonNegativeInt = (value) => /^\d+$/.test(String(value).trim());

export const isPositiveNumber = (value) =>
    value !== '' && !isNaN(value) && isFinite(value) && parseFloat(value) > 0;

// ---------- UI helpers ----------
export const showError = (text) =>
    Swal.fire({icon: "error", title: "Oops...", text: text});

export const showSuccess = (text) =>
    Swal.fire({icon: "success", title: "Success", text: text, timer: 1500, showConfirmButton: false});

export const escapeHtml = (value) =>
    String(value).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));

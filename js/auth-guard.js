// ==========================================
// AUTH GUARD
// ==========================================

const isLoggedIn =
    localStorage.getItem("isLoggedIn") === "true";

const adminData =
    localStorage.getItem("admin");


if (!isLoggedIn || !adminData) {

    window.location.replace("login.html");

}

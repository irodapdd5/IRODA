// ==========================================
// AUTH GUARD
// ==========================================

(function () {

    const isLoggedIn =
        localStorage.getItem("isLoggedIn") === "true";

    const adminData =
        localStorage.getItem("admin");


    // ==========================================
    // CEK LOGIN
    // ==========================================

    if (!isLoggedIn || !adminData) {

        window.location.replace("login.html");

        return;

    }


    // ==========================================
    // LOGOUT
    // ==========================================

    const logoutButton =
        document.getElementById("logoutButton");


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            function () {

                // Hapus semua data login
                localStorage.removeItem("admin");
                localStorage.removeItem("login");
                localStorage.removeItem("isLoggedIn");


                // Kembali ke halaman login
                window.location.replace("login.html");

            }
        );

    }

})();

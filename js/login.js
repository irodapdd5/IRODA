const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");


// URL API CLOUDFLARE WORKER
const API_URL = "https://iroda-backend.irodapdd5.workers.dev/login";


loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const password = document.getElementById("password").value;


    message.textContent = "Memproses login...";
    message.style.color = "#ffc400";


    try {

        const response = await fetch(`${API_URL}/login`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name: name,
                password: password
            })

        });


        const data = await response.json();


        if (data.success) {

            message.textContent = "Login berhasil!";
            message.style.color = "#7CFF7C";


            // Simpan status login
            localStorage.setItem("isLoggedIn", "true");

            localStorage.setItem(
                "admin",
                JSON.stringify(data.user)
            );


            // Masuk dashboard
            setTimeout(() => {

                window.location.href = "dashboard.html";

            }, 500);


        } else {

            message.textContent =
                data.message || "Nama atau password salah.";

            message.style.color = "#ffaaaa";

        }


    } catch (error) {

        console.error(error);

        message.textContent =
            "Tidak dapat terhubung ke server.";

        message.style.color = "#ffaaaa";

    }

});

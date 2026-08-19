console.log("IRODA EVENT JS AKTIF");
const API_URL =
    "https://iroda-backend.irodapdd5.workers.dev";


// =====================================================
// CEK LOGIN
// =====================================================

if (
    localStorage.getItem("isLoggedIn") !== "true"
) {
    window.location.href = "login.html";
}


// =====================================================
// DATA ADMIN
// =====================================================

const adminData =
    localStorage.getItem("admin");

if (adminData) {

    try {

        const admin =
            JSON.parse(adminData);

        const adminName =
            document.getElementById("adminName");

        const avatar =
            document.getElementById("avatar");

        if (adminName) {
            adminName.textContent =
                admin.name || "Admin";
        }

        if (avatar) {
            avatar.textContent =
                (admin.name || "A")
                    .charAt(0)
                    .toUpperCase();
        }

    } catch (error) {

        console.error(
            "Data admin tidak valid:",
            error
        );

    }
}


// =====================================================
// ELEMENT
// =====================================================

const eventModal =
    document.getElementById("eventModal");

const eventForm =
    document.getElementById("eventForm");

const eventList =
    document.getElementById("eventList");

const dateList =
    document.getElementById("dateList");

const formMessage =
    document.getElementById("formMessage");

const eventImage =
    document.getElementById("eventImage");

const imagePreview =
    document.getElementById("imagePreview");

const currentImage =
    document.getElementById("currentImage");

const currentImagePreview =
    document.getElementById("currentImagePreview");

const removeImage =
    document.getElementById("removeImage");

const modalTitle =
    document.getElementById("modalTitle");

const modalSubtitle =
    document.getElementById("modalSubtitle");

const saveButtonText =
    document.getElementById("saveButtonText");

const eventIdInput =
    document.getElementById("eventId");

const addEventButton =
    document.getElementById("addEventButton");

const closeModalButton =
    document.getElementById("closeModal");

const cancelButton =
    document.getElementById("cancelButton");

const addDateButton =
    document.getElementById("addDateButton");


// =====================================================
// MODE
// =====================================================

let editMode = false;

let oldImage = "";


// =====================================================
// HELPER ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =====================================================
// FORMAT TANGGAL
// =====================================================

function formatDate(dateString) {

    if (!dateString) {
        return "Belum ada tanggal";
    }

    const date =
        new Date(dateString + "T00:00:00");

    if (isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleDateString(
        "id-ID",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );
}


// =====================================================
// PREVIEW FOTO BARU
// =====================================================

if (eventImage) {

    eventImage.addEventListener(
        "change",
        function () {

            const file =
                this.files[0];

            imagePreview.innerHTML = "";

            if (!file) {
                return;
            }

            if (!file.type.startsWith("image/")) {

                formMessage.textContent =
                    "File yang dipilih bukan gambar.";

                formMessage.style.color =
                    "#b33a3a";

                this.value = "";

                return;
            }

            const reader =
                new FileReader();

            reader.onload =
                function (e) {

                    imagePreview.innerHTML = `

                        <img
                            src="${e.target.result}"
                            alt="Preview foto baru"
                            style="
                                width:100%;
                                max-width:500px;
                                height:260px;
                                object-fit:cover;
                                border-radius:12px;
                                margin-top:12px;
                            "
                        >

                        <small
                            style="
                                display:block;
                                margin-top:6px;
                            "
                        >
                            Foto baru akan digunakan sebagai foto event.
                        </small>

                    `;

                };

            reader.readAsDataURL(file);

        }
    );

}


// =====================================================
// KOMPRES FOTO
// =====================================================

function compressImage(file) {

    return new Promise(
        (resolve, reject) => {

            if (!file) {

                resolve("");

                return;
            }

            if (!file.type.startsWith("image/")) {

                reject(
                    new Error(
                        "File bukan gambar"
                    )
                );

                return;
            }

            const reader =
                new FileReader();

            reader.onload =
                function (event) {

                    const img =
                        new Image();

                    img.onload =
                        function () {

                            const canvas =
                                document.createElement(
                                    "canvas"
                                );

                            const maxWidth =
                                1200;

                            let width =
                                img.width;

                            let height =
                                img.height;

                            if (
                                width > maxWidth
                            ) {

                                height =
                                    height *
                                    maxWidth /
                                    width;

                                width =
                                    maxWidth;

                            }

                            canvas.width =
                                width;

                            canvas.height =
                                height;

                            const ctx =
                                canvas.getContext(
                                    "2d"
                                );

                            if (!ctx) {

                                reject(
                                    new Error(
                                        "Canvas gagal dibuat"
                                    )
                                );

                                return;
                            }

                            ctx.drawImage(
                                img,
                                0,
                                0,
                                width,
                                height
                            );

                            canvas.toBlob(
                                function (blob) {

                                    if (!blob) {

                                        reject(
                                            new Error(
                                                "Foto gagal dikompres"
                                            )
                                        );

                                        return;
                                    }

                                    const readerBlob =
                                        new FileReader();

                                    readerBlob.onload =
                                        function () {

                                            resolve(
                                                readerBlob.result
                                            );

                                        };

                                    readerBlob.onerror =
                                        function () {

                                            reject(
                                                new Error(
                                                    "Foto gagal dibaca"
                                                )
                                            );

                                        };

                                    readerBlob.readAsDataURL(
                                        blob
                                    );

                                },
                                "image/jpeg",
                                0.70
                            );

                        };

                    img.onerror =
                        function () {

                            reject(
                                new Error(
                                    "Gambar tidak dapat dibaca"
                                )
                            );

                        };

                    img.src =
                        event.target.result;

                };

            reader.onerror =
                function () {

                    reject(
                        new Error(
                            "File tidak dapat dibaca"
                        )
                    );

                };

            reader.readAsDataURL(file);

        }
    );

}


// =====================================================
// LOAD EVENTS
// =====================================================

async function loadEvents() {

    if (!eventList) {
        return;
    }

    eventList.innerHTML =
        '<div class="loading">Memuat event...</div>';

    try {

        const response =
            await fetch(
                `${API_URL}/events`,
                {
                    method: "GET"
                }
            );

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }

        const data =
            await response.json();

        console.log(
            "GET /events:",
            data
        );

        if (!data.success) {

            throw new Error(
                data.message ||
                "Gagal mengambil event"
            );

        }

        if (
            !data.data ||
            data.data.length === 0
        ) {

            eventList.innerHTML =
                '<div class="empty">Belum ada event.</div>';

            return;
        }

        eventList.innerHTML = "";

        data.data.forEach(
            event => {

                const card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    "event-card";

                const dateText =
                    event.first_date
                        ? formatDate(
                            event.first_date
                        )
                        : "Belum ada tanggal";

                card.innerHTML = `

                    <div class="event-info">

                        <span class="event-year">
                            ${escapeHTML(event.year)}
                        </span>

                        <h3>
                            ${escapeHTML(event.name)}
                        </h3>

                        <p>
                            ${escapeHTML(dateText)}
                        </p>

                    </div>


                    <div class="event-actions">

                        <button
                            type="button"
                            class="view-button"
                            onclick="viewEvent(${Number(event.id)})"
                        >
                            Lihat
                        </button>


                        <button
                            type="button"
                            class="edit-button"
                            onclick="editEvent(${Number(event.id)})"
                        >
                            Edit
                        </button>


                        <button
                            type="button"
                            class="delete-button"
                            onclick="deleteEvent(${Number(event.id)})"
                        >
                            Hapus
                        </button>

                    </div>

                `;

                eventList.appendChild(card);

            }
        );

    } catch (error) {

        console.error(
            "LOAD EVENTS ERROR:",
            error
        );

        eventList.innerHTML = `

            <div class="empty">

                Gagal memuat event.

                <br>

                <small>
                    ${escapeHTML(error.message)}
                </small>

            </div>

        `;

    }

}


// =====================================================
// BUKA MODAL TAMBAH EVENT
// =====================================================

function openAddEventModal() {

    editMode = false;

    oldImage = "";

    eventForm.reset();

    eventIdInput.value = "";

    document.getElementById("year").value =
        new Date().getFullYear();

    modalTitle.textContent =
        "Tambah Event";

    modalSubtitle.textContent =
        "Buat dokumentasi kegiatan baru.";

    saveButtonText.textContent =
        "Simpan Event";

    currentImage.style.display =
        "none";

    currentImagePreview.src =
        "";

    removeImage.checked =
        false;

    imagePreview.innerHTML =
        "";

    dateList.innerHTML =
        "";

    addDateRow();

    formMessage.textContent =
        "";

    formMessage.style.color =
        "";

    eventModal.classList.add(
        "show"
    );

}


// =====================================================
// EVENT BUTTON TAMBAH
// =====================================================

if (addEventButton) {

    addEventButton.addEventListener(
        "click",
        openAddEventModal
    );

}


// =====================================================
// TUTUP MODAL
// =====================================================

function closeModal() {

    eventModal.classList.remove(
        "show"
    );

}


if (closeModalButton) {

    closeModalButton.addEventListener(
        "click",
        closeModal
    );

}


if (cancelButton) {

    cancelButton.addEventListener(
        "click",
        closeModal
    );

}


// =====================================================
// KLIK DI LUAR MODAL
// =====================================================

if (eventModal) {

    eventModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                eventModal
            ) {

                closeModal();

            }

        }
    );

}


// =====================================================
// TAMBAH BARIS TANGGAL
// =====================================================

function addDateRow(
    dateValue = "",
    linkValue = ""
) {

    const row =
        document.createElement(
            "div"
        );

    row.className =
        "date-row";

    row.innerHTML = `

        <input
            type="date"
            class="event-date"
            value="${escapeHTML(dateValue)}"
            required
        >

        <input
            type="url"
            class="drive-link"
            value="${escapeHTML(linkValue)}"
            placeholder="https://drive.google.com/..."
            required
        >

        <button
            type="button"
            class="remove-date"
            title="Hapus tanggal dan link"
        >
            ×
        </button>

    `;

    const removeButton =
        row.querySelector(
            ".remove-date"
        );

    removeButton.addEventListener(
        "click",
        function () {

            const rows =
                dateList.querySelectorAll(
                    ".date-row"
                );

            /*
             * BOLEH HAPUS BARIS.
             * Tetapi minimal harus tersisa
             * satu tanggal + link.
             */

            if (rows.length <= 1) {

                alert(
                    "Minimal satu tanggal dan link harus ada."
                );

                return;
            }

            row.remove();

        }
    );

    dateList.appendChild(
        row
    );

}


// =====================================================
// TOMBOL TAMBAH TANGGAL
// =====================================================

if (addDateButton) {

    addDateButton.addEventListener(
        "click",
        function () {

            addDateRow();

        }
    );

}


// =====================================================
// EDIT EVENT
// =====================================================

async function editEvent(id) {

    formMessage.textContent =
        "Memuat data event...";

    formMessage.style.color =
        "#28594b";

    try {

        const response =
            await fetch(
                `${API_URL}/events/${id}`,
                {
                    method: "GET"
                }
            );

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }

        const data =
            await response.json();

        console.log(
            "GET EVENT:",
            data
        );

        if (!data.success) {

            throw new Error(
                data.message ||
                "Event tidak ditemukan"
            );

        }

        const event =
            data.event;

        const dates =
            data.dates || [];

        editMode = true;

        eventIdInput.value =
            event.id;

        oldImage =
            event.image || "";

        document.getElementById("year").value =
            event.year || "";

        document.getElementById("name").value =
            event.name || "";

        document.getElementById("description").value =
            event.description || "";

        eventImage.value =
            "";

        imagePreview.innerHTML =
            "";

        removeImage.checked =
            false;


        // ==========================
        // FOTO LAMA
        // ==========================

        if (oldImage) {

            currentImage.style.display =
                "block";

            currentImagePreview.src =
                oldImage;

        } else {

            currentImage.style.display =
                "none";

            currentImagePreview.src =
                "";

        }


        // ==========================
        // TANGGAL
        // ==========================

        dateList.innerHTML =
            "";

        if (dates.length > 0) {

            dates.forEach(
                date => {

                    addDateRow(
                        date.event_date || "",
                        date.drive_link || ""

                        if (
                !eventDate ||
                !driveLink
            ) {

                formMessage.textContent =
                    "Setiap baris harus memiliki tanggal dan link Google Drive.";

                formMessage.style.color =
                    "#b33a3a";

                return;

            }


            dates.push({

                event_date:
                    eventDate,

                drive_link:
                    driveLink

            });

        }


        if (
            dates.length === 0
        ) {

            formMessage.textContent =
                "Minimal satu tanggal dan link harus ada.";

            formMessage.style.color =
                "#b33a3a";

            return;

        }


        // ==========================
        // FOTO
        // ==========================

        let image =
            editMode
                ? oldImage
                : "";

        const file =
            eventImage.files[0];


        // FOTO BARU DIPILIH

        if (file) {

            try {

                formMessage.textContent =
                    "Memproses foto...";

                image =
                    await compressImage(
                        file
                    );

            } catch (error) {

                console.error(
                    "IMAGE ERROR:",
                    error
                );

                formMessage.textContent =
                    "Foto tidak dapat diproses.";

                formMessage.style.color =
                    "#b33a3a";

                return;

            }

        }


        // ==========================
        // HAPUS FOTO
        // ==========================

        if (
            editMode &&
            removeImage.checked &&
            !file
        ) {

            image = "";

        }


        // ==========================
        // BODY
        // ==========================

        const body = {

            year:
                Number(year),

            name:
                name,

            description:
                description,

            image:
                image,

            dates:
                dates

        };


        console.log(
            "REQUEST BODY:",
            body
        );


        // ==========================
        // REQUEST
        // ==========================

        try {

            const url =
                editMode
                    ? `${API_URL}/events/${eventIdInput.value}`
                    : `${API_URL}/events`;

            const method =
                editMode
                    ? "PUT"
                    : "POST";


            formMessage.textContent =
                editMode
                    ? "Menyimpan perubahan..."
                    : "Menyimpan event...";


            const response =
                await fetch(
                    url,
                    {
                        method: method,

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(body)
                    }
                );


            const data =
                await response.json();


            console.log(
                "SAVE RESPONSE:",
                data
            );


            if (!response.ok || !data.success) {

                throw new Error(
                    data.message ||
                    `HTTP ${response.status}`
                );

            }


            // ==========================
            // SUKSES
            // ==========================

            formMessage.textContent =
                editMode
                    ? "Event berhasil diperbarui."
                    : "Event berhasil dibuat.";

            formMessage.style.color =
                "#28594b";


            setTimeout(
                function () {

                    closeModal();

                    loadEvents();

                },
                700
            );


        } catch (error) {

            console.error(
                "SAVE EVENT ERROR:",
                error
            );

            formMessage.textContent =
                "Gagal menyimpan event: " +
                error.message;

            formMessage.style.color =
                "#b33a3a";

        }

    }
);


// =====================================================
// LIHAT EVENT
// =====================================================

async function viewEvent(id) {

    try {

        const response =
            await fetch(
                `${API_URL}/events/${id}`
            );

        const data =
            await response.json();

        if (!data.success) {

            throw new Error(
                data.message ||
                "Event tidak ditemukan"
            );

        }

        const event =
            data.event;

        const dates =
            data.dates || [];


        let message =
            `${event.name}\n\n`;

        message +=
            `Tahun: ${event.year}\n`;

        if (event.description) {

            message +=
                `\n${event.description}\n`;

        }

        message +=
            "\nTanggal & Link:\n";


        dates.forEach(
            date => {

                message +=
                    `\n${formatDate(date.event_date)}\n`;

                message +=
                    `${date.drive_link}\n`;

            }
        );


        alert(message);


    } catch (error) {

        console.error(
            "VIEW EVENT ERROR:",
            error
        );

        alert(
            "Gagal mengambil event: " +
            error.message
        );

    }

}


// =====================================================
// DELETE EVENT
// =====================================================

async function deleteEvent(id) {

    const yakin =
        confirm(
            "Yakin ingin menghapus event ini?\n\nSemua tanggal dan link di dalam event juga akan dihapus."
        );

    if (!yakin) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/events/${id}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        console.log(
            "DELETE RESPONSE:",
            data
        );


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                `HTTP ${response.status}`
            );

        }


        alert(
            "Event berhasil dihapus."
        );


        loadEvents();


    } catch (error) {

        console.error(
            "DELETE EVENT ERROR:",
            error
        );

        alert(
            "Gagal menghapus event: " +
            error.message
        );

    }

}


// =====================================================
// LOGOUT
// =====================================================

const logoutButton =
    document.getElementById(
        "logoutButton"
    );

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "isLoggedIn"
            );

            localStorage.removeItem(
                "admin"
            );

            window.location.href =
                "login.html";

        }
    );

}


// =====================================================
// LOAD AWAL
// =====================================================

loadEvents();

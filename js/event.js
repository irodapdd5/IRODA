const API_URL =
    "https://iroda-backend.irodapdd5.workers.dev";


// ======================================================
// CEK LOGIN
// ======================================================

if (
    localStorage.getItem("isLoggedIn") !== "true"
) {
    window.location.href = "login.html";
}


// ======================================================
// DATA ADMIN
// ======================================================

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


// ======================================================
// ELEMENT
// ======================================================

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


// ======================================================
// VALIDASI ELEMENT
// ======================================================

if (!eventForm) {
    console.error("eventForm tidak ditemukan.");
}

if (!eventList) {
    console.error("eventList tidak ditemukan.");
}

if (!eventModal) {
    console.error("eventModal tidak ditemukan.");
}


// ======================================================
// MODE
// ======================================================

let editMode = false;

let oldImage = "";


// ======================================================
// HELPER ESCAPE HTML
// ======================================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ======================================================
// FORMAT TANGGAL
// ======================================================

function formatDate(dateString) {

    if (!dateString) {
        return "Belum ada tanggal";
    }

    const date =
        new Date(
            dateString + "T00:00:00"
        );

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


// ======================================================
// PREVIEW FOTO BARU
// ======================================================

if (eventImage) {

    eventImage.addEventListener(
        "change",
        function () {

            imagePreview.innerHTML = "";

            const file =
                this.files &&
                this.files[0];

            if (!file) {
                return;
            }

            const reader =
                new FileReader();

            reader.onload =
                function (e) {

                    imagePreview.innerHTML = `

                        <img
                            src="${e.target.result}"
                            alt="Preview Foto Baru"
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
                            Foto baru akan menggantikan foto lama.
                        </small>

                    `;

                };

            reader.readAsDataURL(file);

        }
    );

}


// ======================================================
// KOMPRES FOTO
// ======================================================

function compressImage(file) {

    return new Promise(
        (resolve, reject) => {

            if (!file) {

                reject(
                    new Error(
                        "File foto tidak ditemukan."
                    )
                );

                return;
            }

            if (
                !file.type.startsWith("image/")
            ) {

                reject(
                    new Error(
                        "File bukan gambar."
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

                            const canvas =
                                document.createElement(
                                    "canvas"
                                );

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
                                        "Canvas tidak dapat dibuat."
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
                                                "Foto gagal dikompres."
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
                                                    "Foto gagal dibaca."
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
                                    "File gambar tidak dapat dibaca."
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
                            "File tidak dapat dibaca."
                        )
                    );

                };

            reader.readAsDataURL(file);

        }
    );

}


// ======================================================
// LOAD EVENTS
// ======================================================

async function loadEvents() {

    if (!eventList) {
        return;
    }

    eventList.innerHTML =
        '<div class="loading">Memuat event...</div>';

    try {

        const response =
            await fetch(
                `${API_URL}/events`
            );

        const data =
            await response.json();

        console.log(
            "GET /events:",
            data
        );

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Gagal mengambil event."
            );

        }

        const events =
            data.data || [];

        if (events.length === 0) {

            eventList.innerHTML =
                '<div class="empty">Belum ada event.</div>';

            return;
        }

        eventList.innerHTML = "";

        events.forEach(
            function (event) {

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
                        >
                            Lihat
                        </button>

                        <button
                            type="button"
                            class="edit-button"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            class="delete-button"
                        >
                            Hapus
                        </button>

                    </div>

                `;

                const buttons =
                    card.querySelectorAll(
                        "button"
                    );

                buttons[0].addEventListener(
                    "click",
                    function () {
                        viewEvent(event.id);
                    }
                );

                buttons[1].addEventListener(
                    "click",
                    function () {
                        editEvent(event.id);
                    }
                );

                buttons[2].addEventListener(
                    "click",
                    function () {
                        deleteEvent(event.id);
                    }
                );

                eventList.appendChild(card);

            }
        );

    } catch (error) {

        console.error(
            "loadEvents error:",
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


// ======================================================
// RESET FORM
// ======================================================

function resetEventForm() {

    if (eventForm) {
        eventForm.reset();
    }

    if (eventIdInput) {
        eventIdInput.value = "";
    }

    if (eventImage) {
        eventImage.value = "";
    }

    if (imagePreview) {
        imagePreview.innerHTML = "";
    }

    if (currentImage) {
        currentImage.style.display =
            "none";
    }

    if (currentImagePreview) {
        currentImagePreview.src = "";
    }

    if (removeImage) {
        removeImage.checked = false;
    }

    if (dateList) {
        dateList.innerHTML = "";
    }

    if (formMessage) {
        formMessage.textContent = "";
        formMessage.style.color = "";
    }

}


// ======================================================
// BUKA MODAL
// ======================================================

function openModal() {

    if (eventModal) {

        eventModal.classList.add(
            "show"
        );

    }

}


// ======================================================
// TUTUP MODAL
// ======================================================

function closeEventModal() {

    if (eventModal) {

        eventModal.classList.remove(
            "show"
        );

    }

}


// ======================================================
// TAMBAH EVENT
// ======================================================

if (addEventButton) {

    addEventButton.addEventListener(
        "click",
        function () {

            console.log(
                "Tombol Tambah Event diklik."
            );

            editMode = false;

            oldImage = "";

            resetEventForm();

            const year =
                document.getElementById(
                    "year"
                );

            if (year) {

                year.value =
                    new Date()
                        .getFullYear();

            }

            if (modalTitle) {

                modalTitle.textContent =
                    "Tambah Event";

            }

            if (modalSubtitle) {

                modalSubtitle.textContent =
                    "Buat dokumentasi kegiatan baru.";

            }

            if (saveButtonText) {

                saveButtonText.textContent =
                    "Simpan Event";

            }

            addDateRow();

            openModal();

        }
    );

}


// ======================================================
// TUTUP MODAL BUTTON
// ======================================================

if (closeModalButton) {

    closeModalButton.addEventListener(
        "click",
        closeEventModal
    );

}

if (cancelButton) {

    cancelButton.addEventListener(
        "click",
        closeEventModal
    );

}


// ======================================================
// KLIK LUAR MODAL
// ======================================================

if (eventModal) {

    eventModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target === eventModal
            ) {

                closeEventModal();

            }

        }
    );

}


// ======================================================
// TAMBAH BARIS TANGGAL
// ======================================================

function addDateRow(
    dateValue = "",
    linkValue = ""
) {

    if (!dateList) {
        return;
    }

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
            title="Hapus tanggal"
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

            // Kalau masih ada lebih dari 1,
            // langsung hapus.
            if (rows.length > 1) {

                row.remove();

                return;

            }

            // Kalau tinggal 1,
            // jangan langsung hapus semuanya.
            const dateInput =
                row.querySelector(
                    ".event-date"
                );

            const linkInput =
                row.querySelector(
                    ".drive-link"
                );

            if (dateInput) {
                dateInput.value = "";
            }

            if (linkInput) {
                linkInput.value = "";
            }

        }
    );

    dateList.appendChild(row);

}


// ======================================================
// TOMBOL TAMBAH TANGGAL
// ======================================================

if (addDateButton) {

    addDateButton.addEventListener(
        "click",
        function () {

            addDateRow();

        }
    );

}


// ======================================================
// EDIT EVENT
// ==

async function editEvent(id) {

    if (formMessage) {

        formMessage.textContent =
            "Memuat data event...";

        formMessage.style.color =
            "#28594b";

    }

    try {

        const response =
            await fetch(
                `${API_URL}/events/${id}`
            );

        const data =
            await response.json();

        console.log(
            "GET /events/" + id,
            data
        );

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Event tidak ditemukan."
            );

        }

        const event =
            data.event;

        const dates =
            data.dates || [];

        editMode = true;

        oldImage =
            event.image || "";

        if (eventIdInput) {

            eventIdInput.value =
                event.id;

        }

        const year =
            document.getElementById(
                "year"
            );

        const name =
            document.getElementById(
                "name"
            );

        const description =
            document.getElementById(
                "description"
            );

        if (year) {
            year.value =
                event.year || "";
        }

        if (name) {
            name.value =
                event.name || "";
        }

        if (description) {
            description.value =
                event.description || "";
        }

        if (eventImage) {
            eventImage.value = "";
        }

        if (imagePreview) {
            imagePreview.innerHTML = "";
        }

        if (removeImage) {
            removeImage.checked = false;
        }

        // ============================================
        // FOTO LAMA
        // ============================================

        if (
            oldImage &&
            currentImage &&
            currentImagePreview
        ) {

            currentImage.style.display =
                "block";

            currentImagePreview.src =
                oldImage;

        } else if (currentImage) {

            currentImage.style.display =
                "none";

            if (currentImagePreview) {
                currentImagePreview.src = "";
            }

        }

        // ============================================
        // TANGGAL
        // ============================================

        if (dateList) {

            dateList.innerHTML = "";

            if (dates.length > 0) {

                dates.forEach(
                    function (date) {

                        addDateRow(
                            date.event_date || "",
                            date.drive_link || ""
                        );

                    }
                );

            } else {

                addDateRow();

            }

        }

        if (modalTitle) {

            modalTitle.textContent =
                "Edit Event";

        }

        if (modalSubtitle) {

            modalSubtitle.textContent =
                "Perbarui data dokumentasi kegiatan.";

        }

        if (saveButtonText) {

            saveButtonText.textContent =
                "Simpan Perubahan";

        }

        if (formMessage) {

            formMessage.textContent = "";

        }

        openModal();

    } catch (error) {

        console.error(
            "editEvent error:",
            error
        );

        alert(
            error.message ||
            "Gagal memuat event."
        );

    }

}


// ======================================================
// SUBMIT FORM
// ======================================================

if (eventForm) {

    eventForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            if (formMessage) {

                formMessage.textContent =
                    editMode
                        ? "Menyimpan perubahan..."
                        : "Menyimpan event...";

                formMessage.style.color =
                    "#28594b";

            }

            const year =
                document.getElementById(
                    "year"
                )?.value;

            const name =
                document.getElementById(
                    "name"
                )?.value.trim();

            const description =
                document.getElementById(
                    "description"
                )?.value.trim();

            // ==========================================
            // VALIDASI DASAR
            // ==========================================

            if (!year || !name) {

                if (formMessage) {

                    formMessage.textContent =
                        "Tahun dan nama kegiatan wajib diisi.";

                    formMessage.style.color =
                        "#b33a3a";

                }

                return;

            }

            // ==========================================
            // AMBIL TANGGAL
            // ==========================================

            const rows =
                dateList
                    ? dateList.querySelectorAll(
                        ".date-row"
                    )
                    : [];

            const dates = [];

            let invalidRow = false;

            rows.forEach(
                function (row) {

                    const eventDate =
                        row.querySelector(
                            ".event-date"
                        )?.value;

                    const driveLink =
                        row.querySelector(
                            ".drive-link"
                        )?.value.trim();

                    // Baris kosong dianggap
                    // tidak dipakai.
                    if (
                        !eventDate &&
                        !driveLink
                    ) {

                        return;

                    }

                    // Kalau salah satu diisi,
                    // keduanya harus diisi.
                    if (
                        !eventDate ||
                        !driveLink
                    ) {

                        invalidRow = true;

                        return;

                    }

                    dates.push({

                        event_date:
                            eventDate,

                        drive_link:
                            driveLink

                    });

                }
            );

            if (invalidRow) {

                if (formMessage) {

                    formMessage.textContent =
                        "Setiap tanggal harus memiliki link Google Drive.";

                    formMessage.style.color =
                        "#b33a3a";

                }

                return;

            }

            if (dates.length === 0) {

                if (formMessage) {

                    formMessage.textContent =
                        "Minimal satu tanggal dan link Google Drive harus ada.";

                    formMessage.style.color =
                        "#b33a3a";

                }

                return;

            }

            // ==========================================
            // FOTO
            // ==========================================

            let image =
                oldImage || "";

            const file =
                eventImage &&
                eventImage.files
                    ? eventImage.files[0]
                    : null;

            // Foto baru dipilih
            if (file) {

                try {

                    image =
                        await compressImage(
                            file
                        );

                } catch (error) {

                    console.error(
                        "compressImage error:",
                        error
                    );

                    if (formMessage) {

                        formMessage.textContent =
                            "Foto tidak dapat diproses.";

                        formMessage.style.color =
                            "#b33a3a";

                    }

                    return;

                }

            }

            // Hapus foto lama
            if (
                editMode &&
                removeImage &&
                removeImage.checked &&
                !file
            ) {

                image = "";

            }

            // ==========================================
            // REQUEST
            // ==========================================

            const payload = {

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
                "Payload:",
                payload
            );

            try {

                const url =
                    editMode
                        ? `${API_URL}/events/${eventIdInput.value}`
                        : `${API_URL}/events`;

                const method =
                    editMode
                        ? "PUT"
                        : "POST";

                const response =
                    await fetch(
                        url,
                        {
                            method:
                                method,

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    payload
                                )
                        }
                    );

                const data =
                    await response.json();

                console.log(
                    "Response:",
                    data
                );

                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Gagal menyimpan event."
                    );

                }

                if (formMessage) {

                    formMessage.textContent =
                        editMode
                            ? "Event berhasil diperbarui."
                            : "Event berhasil dibuat.";

                    formMessage.style.color =
                        "#28594b";

                }

                // Tutup sebentar setelah sukses
                setTimeout(
                    function () {

                        closeEventModal();

                        loadEvents();

                    },
                    500
                );

            } catch (error) {

                console.error(
                    "Submit event error:",
                    error
                );

                if (formMessage) {

                    formMessage.textContent =
                        error.message ||
                        "Gagal menyimpan event.";

                    formMessage.style.color =
                        "#b33a3a";

                }

            }

        }
    );

}


// ======================================================
// LIHAT DETAIL EVENT
// ======================================================

function viewEvent(id) {

    if (!id) {

        console.error(
            "ID event tidak ditemukan."
        );

        return;
    }

    window.location.href =
        `event-detail.html?id=${id}`;

}

// ======================================================
// HAPUS EVENT
// ======================================================

async function deleteEvent(id) {

    const yakin =
        confirm(
            "Yakin ingin menghapus event ini?"
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
            "DELETE response:",
            data
        );

        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Gagal menghapus event."
            );

        }

        alert(
            "Event berhasil dihapus."
        );

        loadEvents();

    } catch (error) {

        console.error(
            "deleteEvent error:",
            error
        );

        alert(
            error.message ||
            "Gagal menghapus event."
        );

    }

}


// ======================================================
// LOGOUT
// ======================================================

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


// ======================================================
// LOAD AWAL
// ======================================================

loadEvents();

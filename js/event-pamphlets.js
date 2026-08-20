/* =========================================
   API
========================================= */

const API_BASE =
    "https://iroda-backend.irodapdd5.workers.dev";


/* =========================================
   ELEMENT
========================================= */

const pamphletList =
    document.getElementById("pamphletList");

const totalPamphlets =
    document.getElementById("totalPamphlets");

const addPamphletButton =
    document.getElementById("addPamphletButton");

const pamphletModal =
    document.getElementById("pamphletModal");

const deleteModal =
    document.getElementById("deleteModal");

const closeModal =
    document.getElementById("closeModal");

const cancelButton =
    document.getElementById("cancelButton");

const pamphletForm =
    document.getElementById("pamphletForm");

const pamphletId =
    document.getElementById("pamphletId");

const imageUrl =
    document.getElementById("imageUrl");

const imagePreview =
    document.getElementById("imagePreview");

const imagePreviewBox =
    document.getElementById("imagePreviewBox");

const modalTitle =
    document.getElementById("modalTitle");

const saveButton =
    document.getElementById("saveButton");

const cancelDelete =
    document.getElementById("cancelDelete");

const confirmDelete =
    document.getElementById("confirmDelete");

const logoutButton =
    document.getElementById("logoutButton");

const adminName =
    document.getElementById("adminName");

const avatar =
    document.getElementById("avatar");

const toast =
    document.getElementById("toast");

const toastIcon =
    document.getElementById("toastIcon");

const toastMessage =
    document.getElementById("toastMessage");


/* =========================================
   STATE
========================================= */

let pamphlets = [];

let deleteId = null;


/* =========================================
   INIT
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadAdmin();

        loadPamphlets();

    }
);


/* =========================================
   ADMIN
========================================= */

function loadAdmin() {

    try {

        const storedAdmin =
            localStorage.getItem("admin");

        if (storedAdmin) {

            const admin =
                JSON.parse(storedAdmin);

            if (admin && admin.name) {

                setAdminName(admin.name);

                return;

            }

        }

    } catch (error) {

        console.log(
            "Data admin tidak dapat dibaca:",
            error
        );

    }


    /*
     * Beberapa project lama menyimpan
     * data login dengan key berbeda.
     */

    const loginName =
        localStorage.getItem("adminName");

    if (loginName) {

        setAdminName(loginName);

    }

}


function setAdminName(name) {

    adminName.textContent = name;

    const firstLetter =
        name
            .trim()
            .charAt(0)
            .toUpperCase();

    avatar.textContent =
        firstLetter || "A";

}


/* =========================================
   LOAD PAMPHLETS
========================================= */

async function loadPamphlets() {

    showLoading();

    try {

        const response =
            await fetch(
                `${API_BASE}/event-pamphlets`
            );


        const result =
            await response.json();


        if (!response.ok || !result.success) {

            throw new Error(
                result.message ||
                "Gagal mengambil data pamflet"
            );

        }


        pamphlets =
            Array.isArray(result.data)
                ? result.data
                : [];


        renderPamphlets();


    } catch (error) {

        console.error(error);

        showError(
            "Gagal memuat pamflet. Periksa koneksi API."
        );

    }

}


/* =========================================
   RENDER
========================================= */

function renderPamphlets() {

    totalPamphlets.textContent =
        `${pamphlets.length} Pamflet`;


    if (pamphlets.length === 0) {

        pamphletList.innerHTML = `

            <div class="empty">

                <i class="fa-regular fa-image"></i>

                <strong>
                    Belum ada pamflet
                </strong>

                <p style="margin-top:6px;">
                    Silakan tambahkan pamflet event pertama.
                </p>

            </div>

        `;

        return;

    }


    pamphletList.innerHTML =
        pamphlets
            .map(
                pamphlet =>
                    createPamphletCard(pamphlet)
            )
            .join("");

}


/* =========================================
   CREATE CARD
========================================= */

function createPamphletCard(pamphlet) {

    const id =
        Number(pamphlet.id);

    const image =
        escapeAttribute(
            pamphlet.image_url || ""
        );

    const date =
        formatDate(
            pamphlet.created_at
        );


    return `

        <article class="pamphlet-card">

            <div class="pamphlet-image">

                <img
                    src="${image}"
                    alt="Pamflet Event"
                    loading="lazy"
                    onerror="this.onerror=null; this.src=''; this.parentElement.innerHTML='<span style=&quot;color:#666;font-size:13px;&quot;>Gambar tidak dapat dimuat</span>';"
                >

            </div>


            <div class="pamphlet-content">

                <div class="pamphlet-date">

                    <i class="fa-regular fa-clock"></i>

                    Ditambahkan ${date}

                </div>


                <div class="pamphlet-actions">

                    <button
                        type="button"
                        class="action-button edit-button"
                        onclick="openEditModal(${id})"
                    >

                        <i class="fa-solid fa-pen"></i>

                        Edit

                    </button>


                    <button
                        type="button"
                        class="action-button delete-action"
                        onclick="openDeleteModal(${id})"
                    >

                        <i class="fa-solid fa-trash"></i>

                        Hapus

                    </button>

                </div>

            </div>

        </article>

    `;

}


/* =========================================
   OPEN ADD
========================================= */

addPamphletButton.addEventListener(
    "click",
    () => {

        openAddModal();

    }
);


function openAddModal() {

    modalTitle.textContent =
        "Tambah Pamflet";

    pamphletId.value =
        "";

    imageUrl.value =
        "";

    hidePreview();

    saveButton.disabled =
        false;

    saveButton.innerHTML = `
        <i class="fa-solid fa-floppy-disk"></i>
        Simpan
    `;

    pamphletModal.classList.add(
        "show"
    );

    setTimeout(
        () => imageUrl.focus(),
        100
    );

}


/* =========================================
   OPEN EDIT
========================================= */

window.openEditModal =
    function(id) {

        const pamphlet =
            pamphlets.find(
                item =>
                    Number(item.id) === Number(id)
            );


        if (!pamphlet) {

            showToast(
                "Pamflet tidak ditemukan.",
                true
            );

            return;

        }


        modalTitle.textContent =
            "Edit Pamflet";

        pamphletId.value =
            pamphlet.id;

        imageUrl.value =
            pamphlet.image_url || "";


        updatePreview(
            pamphlet.image_url
        );


        saveButton.disabled =
            false;

        saveButton.innerHTML = `
            <i class="fa-solid fa-floppy-disk"></i>
            Simpan Perubahan
        `;


        pamphletModal.classList.add(
            "show"
        );

    };


/* =========================================
   CLOSE MODAL
========================================= */

function closePamphletModal() {

    pamphletModal.classList.remove(
        "show"
    );

}


closeModal.addEventListener(
    "click",
    closePamphletModal
);


cancelButton.addEventListener(
    "click",
    closePamphletModal
);


/* =========================================
   CLICK OVERLAY
========================================= */

pamphletModal
    .querySelector(".modal-overlay")
    .addEventListener(
        "click",
        closePamphletModal
    );


deleteModal
    .querySelector(".modal-overlay")
    .addEventListener(
        "click",
        closeDeleteModal
    );


/* =========================================
   IMAGE PREVIEW
========================================= */

imageUrl.addEventListener(
    "input",
    () => {

        const url =
            imageUrl.value.trim();

        if (!url) {

            hidePreview();

            return;

        }

        updatePreview(url);

    }
);


function updatePreview(url) {

    if (!url) {

        hidePreview();

        return;

    }


    imagePreview.src =
        url;


    imagePreview.onload =
        () => {

            imagePreviewBox.classList.remove(
                "hidden"
            );

        };


    imagePreview.onerror =
        () => {

            imagePreviewBox.classList.add(
                "hidden"
            );

        };

}


function hidePreview() {

    imagePreviewBox.classList.add(
        "hidden"
    );

    imagePreview.src =
        "";

}


/* =========================================
   SUBMIT FORM
========================================= */

pamphletForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const id =
            pamphletId.value.trim();

        const url =
            imageUrl.value.trim();


        if (!url) {

            showToast(
                "URL gambar wajib diisi.",
                true
            );

            return;

        }


        if (!isValidUrl(url)) {

            showToast(
                "URL gambar tidak valid.",
                true
            );

            return;

        }


        if (id) {

            await updatePamphlet(
                id,
                url
            );

        } else {

            await createPamphlet(
                url
            );

        }

    }
);


/* =========================================
   CREATE
========================================= */

async function createPamphlet(url) {

    setSaving(true);


    try {

        const response =
            await fetch(
                `${API_BASE}/event-pamphlets`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        image_url: url
                    })
                }
            );


        const result =
            await response.json();


        if (!response.ok || !result.success) {

            throw new Error(
                result.message ||
                "Gagal menambahkan pamflet"
            );

        }


        closePamphletModal();

        showToast(
            "Pamflet berhasil ditambahkan."
        );


        await loadPamphlets();


    } catch (error) {

        console.error(error);

        showToast(
            error.message ||
            "Gagal menambahkan pamflet.",
            true
        );

    } finally {

        setSaving(false);

    }

}


/* =========================================
   UPDATE
========================================= */

async function updatePamphlet(
    id,
    url
) {

    setSaving(true);


    try {

        const response =
            await fetch(
                `${API_BASE}/event-pamphlets/${id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        image_url: url
                    })
                }
            );


        const result =
            await response.json();


        if (!response.ok || !result.success) {

            throw new Error(
                result.message ||
                "Gagal memperbarui pamflet"
            );

        }


        closePamphletModal();

        showToast(
            "Pamflet berhasil diperbarui."
        );


        await loadPamphlets();


    } catch (error) {

        console.error(error);

        showToast(
            error.message ||
            "Gagal memperbarui pamflet.",
            true
        );

    } finally {

        setSaving(false);

    }

}


/* =========================================
   SAVE STATE
========================================= */

function setSaving(
    saving
) {

    saveButton.disabled =
        saving;


    if (saving) {

        saveButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Menyimpan...
        `;

    } else {

        const id =
            pamphletId.value.trim();

        saveButton.innerHTML =
            id
                ? `
                    <i class="fa-solid fa-floppy-disk"></i>
                    Simpan Perubahan
                  `
                : `
                    <i class="fa-solid fa-floppy-disk"></i>
                    Simpan
                  `;

    }

}


/* =========================================
   DELETE MODAL
========================================= */

window.openDeleteModal =
    function(id) {

        const pamphlet =
            pamphlets.find(
                item =>
                    Number(item.id) === Number(id)
            );


        if (!pamphlet) {

            showToast(
                "Pamflet tidak ditemukan.",
                true
            );

            return;

        }


        deleteId =
            Number(id);


        deleteModal.classList.add(
            "show"
        );

    };


function closeDeleteModal() {

    deleteModal.classList.remove(
        "show"
    );

    deleteId =
        null;

}


cancelDelete.addEventListener(
    "click",
    closeDeleteModal
);


/* =========================================
   CONFIRM DELETE
========================================= */

confirmDelete.addEventListener(
    "click",
    async () => {

        if (!deleteId) {

            return;

        }


        const id =
            deleteId;


        confirmDelete.disabled =
            true;

        confirmDelete.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Menghapus...
        `;


        try {

            const response =
                await fetch(
                    `${API_BASE}/event-pamphlets/${id}`,
                    {
                        method: "DELETE"
                    }
                );


            const result =
                await response.json();


            if (!response.ok || !result.success) {

                throw new Error(
                    result.message ||
                    "Gagal menghapus pamflet"
                );

            }


            closeDeleteModal();

            showToast(
                "Pamflet berhasil dihapus."
            );


            await loadPamphlets();


        } catch (error) {

            console.error(error);

            showToast(
                error.message ||
                "Gagal menghapus pamflet.",
                true
            );

        } finally {

            confirmDelete.disabled =
                false;

            confirmDelete.innerHTML = `
                <i class="fa-solid fa-trash"></i>
                Hapus
            `;

        }

    }
);


/* =========================================
   LOGOUT
========================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "admin"
            );

            localStorage.removeItem(
                "adminName"
            );

            localStorage.removeItem(
                "login"
            );


            window.location.href =
                "login.html";

        }
    );

}


/* =========================================
   ESC CLOSE
========================================= */

document.addEventListener(
    "keydown",
    event => {

        if (event.key !== "Escape") {

            return;

        }


        if (
            pamphletModal.classList.contains(
                "show"
            )
        ) {

            closePamphletModal();

        }


        if (
            deleteModal.classList.contains(
                "show"
            )
        ) {

            closeDeleteModal();

        }

    }
);


/* =========================================
   LOADING
========================================= */

function showLoading() {

    pamphletList.innerHTML = `

        <div class="loading">

            <i class="fa-solid fa-spinner fa-spin"></i>

            Memuat pamflet...

        </div>

    `;

}


/* =========================================
   ERROR
========================================= */

function showError(message) {

    pamphletList.innerHTML = `

        <div class="empty">

            <i class="fa-solid fa-triangle-exclamation"></i>

            <strong>
                ${escapeHtml(message)}
            </strong>

            <p style="margin-top:8px;">
                Silakan coba muat ulang halaman.
            </p>

        </div>

    `;

}


/* =========================================
   TOAST
========================================= */

let toastTimer = null;


function showToast(
    message,
    isError = false
) {

    toastMessage.textContent =
        message;


    toast.classList.toggle(
        "error",
        isError
    );


    if (isError) {

        toastIcon.className =
            "fa-solid fa-circle-exclamation";

    } else {

        toastIcon.className =
            "fa-solid fa-circle-check";

    }


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );

}


/* =========================================
   DATE
========================================= */

function formatDate(
    value
) {

    if (!value) {

        return "-";

    }


    const date =
        new Date(
            value.replace(" ", "T")
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;

    }


    return date.toLocaleDateString(
        "id-ID",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================
   URL VALIDATION
========================================= */

function isValidUrl(
    value
) {

    try {

        const url =
            new URL(value);

        return (
            url.protocol === "http:" ||
            url.protocol === "https:"
        );

    } catch {

        return false;

    }

}

/* =========================================
   ESCAPE HTML
========================================= */

function escapeHtml(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================
   ESCAPE ATTRIBUTE
========================================= */

function escapeAttribute(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        );

}

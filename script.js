// Membuat atau membuka IndexedDB
const dbRequest = indexedDB.open("ContactDB", 1);
let lastFeedbackTime = 0; // Menyimpan waktu pengiriman feedback terakhir
let currentUser = { name: "Ahmad Reza Yuansyah Putra", email: "jago@gmail.com" }; // Ganti dengan informasi pengguna yang sesuai

// Menyiapkan store dan index saat pertama kali dibuka
dbRequest.onupgradeneeded = (event) => {
    const db = event.target.result;
    db.createObjectStore("ContactStore", { keyPath: "id", autoIncrement: true });
};

// Memuat feedback saat database dibuka
dbRequest.onsuccess = (event) => {
    const db = event.target.result;
    loadFeedback(db); // Tampilkan feedback yang ada saat halaman dimuat

    // Fungsi untuk menyimpan feedback
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.onsubmit = function(event) {
            event.preventDefault(); // Mencegah pengiriman form secara default

            const name = document.getElementById("cname").value;
            const email = document.getElementById("cemail").value;
            const message = document.getElementById("cmessage").value;

            // Validasi: pastikan feedback tidak kosong
            if (!name || !email || !message) {
                alert("Semua kolom harus diisi.");
                return;
            }

            // Dapatkan waktu saat ini
            const currentTime = Date.now();
            if (currentTime - lastFeedbackTime < 1000 * 60) {
                alert("Anda harus menunggu 1 menit sebelum mengirim feedback lagi.");
                return;
            }
            lastFeedbackTime = currentTime;

            // Simpan ke IndexedDB
            const transaction = db.transaction("ContactStore", "readwrite");
            const store = transaction.objectStore("ContactStore");
            const feedback = { name, email, message, time: new Date() };
            store.add(feedback);

            // Tampilkan feedback yang baru ditambahkan
            loadFeedback(db);
            contactForm.reset(); // Mengosongkan form setelah pengiriman
        };
    }
};

function loadFeedback(db) {
    const feedbackList = document.getElementById("feedbackDisplay");

    if (!feedbackList) {
        console.error("Elemen dengan ID 'feedbackDisplay' tidak ditemukan.");
        return;
    }

    feedbackList.innerHTML = ""; // Kosongkan tampilan sebelum memuat ulang

    const transaction = db.transaction("ContactStore", "readonly");
    const store = transaction.objectStore("ContactStore");

    store.getAll().onsuccess = (event) => {
        const feedbacks = event.target.result;
        feedbacks.forEach(feedback => {
            const feedbackItem = document.createElement("div");
            feedbackItem.classList.add("feedback-card");
            feedbackItem.innerHTML = `
                <strong>${feedback.name}</strong> <br>
                <p>${feedback.message}</p>
                <small>${new Date(feedback.time).toLocaleString()}</small>
                <button onclick="deleteFeedback(${feedback.id})">Hapus</button>
            `;
            feedbackList.appendChild(feedbackItem);
        });
    };
}

// Fungsi untuk menghapus feedback (jika dibutuhkan)
function deleteFeedback(id) {
    const dbRequest = indexedDB.open("ContactDB", 1);

    dbRequest.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction("ContactStore", "readwrite");
        const store = transaction.objectStore("ContactStore");

        const deleteRequest = store.delete(id);
        deleteRequest.onsuccess = () => {
            console.log(`Feedback dengan ID ${id} berhasil dihapus.`);
            loadFeedback(db); // Muat ulang data untuk memperbarui tampilan
        };

        deleteRequest.onerror = () => {
            console.error(`Gagal menghapus feedback dengan ID ${id}.`);
        };
    };

    dbRequest.onerror = (event) => {
        console.error("Database tidak dapat dibuka:", event.target.errorCode);
    };
}


// Mendaftarkan service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
    .then(() => {
        console.log('Service Worker registered successfully');
    })
    .catch(error => {
        console.log('Service Worker registration failed:', error);
    });
}

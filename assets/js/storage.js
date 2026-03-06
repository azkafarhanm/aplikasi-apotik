// Key untuk LocalStorage
const KEY_OBAT = "apotikku_obat";
const KEY_TRANSAKSI = "apotikku_transaksi";

// ===== OBAT =====
function getObat() {
    return JSON.parse(localStorage.getItem(KEY_OBAT)) || [];
}

function saveObat(data) {
    localStorage.setItem(KEY_OBAT, JSON.stringify(data));
}

// ===== TRANSAKSI =====
function getTransaksi() {
    return JSON.parse(localStorage.getItem(KEY_TRANSAKSI)) || [];
}

function saveTransaksi(data) {
    localStorage.setItem(KEY_TRANSAKSI, JSON.stringify(data));
}

// ===== INIT DATA (isi data contoh kalau kosong) =====
function initData() {
    const obat = getObat();

    if (obat.length === 0) {
        const contohObat = [
            { id: "OBT001", nama: "Paracetamol", kategori: "Tablet", stok: 50, harga: 5000 },
            { id: "OBT002", nama: "Amoxicillin", kategori: "Kapsul", stok: 25, harga: 12000 },
            { id: "OBT003", nama: "Vitamin C", kategori: "Suplemen", stok: 80, harga: 7000 },
        ];
        saveObat(contohObat);
    }

    const transaksi = getTransaksi();
    if (transaksi.length === 0) {
        saveTransaksi([]);
    }
}

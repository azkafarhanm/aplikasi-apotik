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
        saveObat([]);
    }

    const transaksi = getTransaksi();
    if (transaksi.length === 0) {
        saveTransaksi([]);
    }
}

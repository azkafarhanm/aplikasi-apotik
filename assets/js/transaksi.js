/**
 * ===================================
 * ApotikKu - Transaksi Module
 * ===================================
 * Modul untuk mengelola histori transaksi penjualan
 */

const TRANSAKSI_STORAGE_KEY = "apotikku_transaksi";

function normalizeTransaksiItem(item) {
    return {
        id: item.id || "TRX" + Date.now(),
        obatId: item.obatId || "",
        namaObat: item.namaObat || "",
        jumlah: Number(item.jumlah ?? item.qty ?? 0),
        harga: Number(item.harga || 0),
        total: Number(item.total || 0),
        tanggal: item.tanggal || Date.now()
    };
}

function migrateLegacyTransaksiData() {
    try {
        const data = localStorage.getItem(TRANSAKSI_STORAGE_KEY);
        const transaksiList = data ? JSON.parse(data) : [];

        if (!Array.isArray(transaksiList) || transaksiList.length === 0) return;

        let needsMigration = false;
        const normalizedList = transaksiList.map(function (item) {
            if (item.qty !== undefined || item.jumlah === undefined) {
                needsMigration = true;
            }

            return normalizeTransaksiItem(item);
        });

        if (needsMigration) {
            saveAllTransaksi(normalizedList);
        }
    } catch (error) {
        console.error("Error migrating transaksi data:", error);
    }
}

function getAllTransaksi() {
    try {
        const data = localStorage.getItem(TRANSAKSI_STORAGE_KEY);
        const transaksiList = data ? JSON.parse(data) : [];

        return transaksiList.map(normalizeTransaksiItem);
    } catch (error) {
        console.error("Error parsing transaksi data:", error);
        return [];
    }
}

function saveAllTransaksi(data) {
    localStorage.setItem(TRANSAKSI_STORAGE_KEY, JSON.stringify(data));
}

function addTransaksi(data) {
    try {
        const allTransaksi = getAllTransaksi();
        const transaksiBaru = normalizeTransaksiItem(data);

        allTransaksi.push(transaksiBaru);
        saveAllTransaksi(allTransaksi);
        return transaksiBaru;
    } catch (error) {
        console.error("Error adding transaksi:", error);
        return null;
    }
}

function formatTanggalTransaksi(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function formatRupiahTransaksi(value) {
    return Number(value || 0).toLocaleString("id-ID");
}

const Transaksi = {
    getAll: function () {
        return getAllTransaksi();
    },

    add: function (data) {
        return addTransaksi(data);
    },

    renderTable: function (tbodyId, dataList) {
        const tbody = document.getElementById(tbodyId);
        if (!tbody) return;

        const transaksiList = Array.isArray(dataList) ? dataList : getAllTransaksi();

        if (transaksiList.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted">Belum ada histori transaksi</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = transaksiList.map(function (transaksi, index) {
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${formatTanggalTransaksi(transaksi.tanggal)}</td>
                    <td>${transaksi.id}</td>
                    <td>${transaksi.namaObat}</td>
                    <td>${transaksi.jumlah}</td>
                    <td>Rp ${formatRupiahTransaksi(transaksi.harga)}</td>
                    <td>Rp ${formatRupiahTransaksi(transaksi.total)}</td>
                </tr>
            `;
        }).join("");
    },

    getSummary: function (dataList) {
        const transaksiList = Array.isArray(dataList) ? dataList : getAllTransaksi();

        return transaksiList.reduce(function (summary, transaksi) {
            summary.totalTransaksi += 1;
            summary.totalPendapatan += Number(transaksi.total || 0);
            summary.totalItem += Number(transaksi.jumlah || 0);
            return summary;
        }, {
            totalTransaksi: 0,
            totalPendapatan: 0,
            totalItem: 0
        });
    },

    renderSummary: function (dataList) {
        const summary = this.getSummary(dataList);
        const countEl = document.getElementById("transaksiCount");
        const revenueEl = document.getElementById("transaksiRevenue");
        const itemsEl = document.getElementById("transaksiItems");

        if (countEl) countEl.textContent = summary.totalTransaksi;
        if (revenueEl) revenueEl.textContent = `Rp ${formatRupiahTransaksi(summary.totalPendapatan)}`;
        if (itemsEl) itemsEl.textContent = summary.totalItem;
    },

    renderHistoryPage: function () {
        const transaksiList = this.getAll().sort(function (a, b) {
            return Number(b.tanggal || 0) - Number(a.tanggal || 0);
        });

        this.renderSummary(transaksiList);
        this.renderTable("transaksiTableBody", transaksiList);
    }
};

document.addEventListener("DOMContentLoaded", function () {
    migrateLegacyTransaksiData();

    if (document.getElementById("transaksiTableBody")) {
        Transaksi.renderHistoryPage();

        const refreshButton = document.getElementById("btnRefreshTransaksi");
        if (refreshButton) {
            refreshButton.addEventListener("click", function () {
                Transaksi.renderHistoryPage();
            });
        }
    }

    console.log("Transaksi module initialized");
});

/**
 * ===================================
 * ApotikKu - Laporan Module
 * ===================================
 * Modul untuk mengelola laporan transaksi
 */

function formatRupiahLaporan(value) {
    return Number(value || 0).toLocaleString("id-ID");
}

function formatTanggalLaporan(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

const Laporan = {
    getFilteredTransaksi: function () {
        const transaksi = typeof getAllTransaksi === "function" ? getAllTransaksi() : [];
        const tanggalMulai = document.getElementById("tanggalMulai")?.value;
        const tanggalAkhir = document.getElementById("tanggalAkhir")?.value;

        return transaksi.filter(function (item) {
            const waktu = new Date(item.tanggal);
            const mulai = tanggalMulai ? new Date(tanggalMulai + "T00:00:00") : null;
            const akhir = tanggalAkhir ? new Date(tanggalAkhir + "T23:59:59") : null;

            if (mulai && waktu < mulai) return false;
            if (akhir && waktu > akhir) return false;
            return true;
        }).sort(function (a, b) {
            return b.tanggal - a.tanggal;
        });
    },

    getSummary: function (transaksiList) {
        return transaksiList.reduce(function (summary, item) {
            summary.totalTransaksi += 1;
            summary.totalPendapatan += Number(item.total || 0);
            summary.itemTerjual += Number(item.jumlah || 0);
            return summary;
        }, {
            totalTransaksi: 0,
            totalPendapatan: 0,
            itemTerjual: 0
        });
    },

    renderSummary: function (summary) {
        document.getElementById("totalTransaksi").textContent = summary.totalTransaksi;
        document.getElementById("totalPendapatan").textContent = `Rp ${formatRupiahLaporan(summary.totalPendapatan)}`;
        document.getElementById("itemTerjual").textContent = summary.itemTerjual;
    },

    renderTable: function (transaksiList) {
        const tbody = document.getElementById("laporanTableBody");
        if (!tbody) return;

        if (transaksiList.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted">Belum ada transaksi yang tercatat</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = transaksiList.map(function (item, index) {
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${formatTanggalLaporan(item.tanggal)}</td>
                    <td>${item.id}</td>
                    <td>${item.namaObat}</td>
                    <td>${item.jumlah}</td>
                    <td>Rp ${formatRupiahLaporan(item.harga)}</td>
                    <td>Rp ${formatRupiahLaporan(item.total)}</td>
                </tr>
            `;
        }).join("");
    },

    generate: function () {
        const transaksiList = this.getFilteredTransaksi();
        const summary = this.getSummary(transaksiList);

        this.renderSummary(summary);
        this.renderTable(transaksiList);
    }
};

document.addEventListener("DOMContentLoaded", function () {
    const btnGenerate = document.getElementById("btnGenerateLaporan");
    const btnExport = document.getElementById("btnExport");

    Laporan.generate();

    if (btnGenerate) {
        btnGenerate.addEventListener("click", function () {
            Laporan.generate();
        });
    }

    if (btnExport) {
        btnExport.addEventListener("click", function () {
            window.print();
        });
    }

    console.log("Laporan module initialized");
});

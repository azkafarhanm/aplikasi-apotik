/**
 * ===================================
 * ApotikKu - Obat Module
 * ===================================
 * Modul untuk mengelola data obat
 */

const Obat = {
    /**
     * Mendapatkan semua data obat dari localStorage
     * @returns {array}
     */
    getAllObat: function () {
        try {
            const data = localStorage.getItem("apotikku_obat");
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error("Error parsing obat data:", error);
            return [];
        }
    },

    /**
     * Menambah obat baru dengan ID yang auto-increment
     * @param {object} data - Data obat
     * @returns {object} Obat yang ditambahkan dengan ID
     */
    addObat: function (data) {
        try {
            const allObat = this.getAllObat();

            // Generate incremental ID
            let nextId = 1;
            if (allObat.length > 0) {
                const lastId = allObat[allObat.length - 1].id;
                const numericId = parseInt(lastId.replace(/\D/g, ""));
                nextId = numericId + 1;
            }

            const newObat = {
                id: "OBT" + String(nextId).padStart(3, "0"),
                ...data
            };

            allObat.push(newObat);
            localStorage.setItem("apotikku_obat", JSON.stringify(allObat));

            return newObat;
        } catch (error) {
            console.error("Error adding obat:", error);
            return null;
        }
    },

    /**
     * Mendapatkan obat berdasarkan ID
     * @param {string} id - ID obat
     * @returns {object|null}
     */
    getById: function (id) {
        try {
            const allObat = this.getAllObat();
            return allObat.find(obat => obat.id === id) || null;
        } catch (error) {
            console.error("Error getting obat by ID:", error);
            return null;
        }
    },

    /**
     * Mengupdate data obat
     * @param {string} id - ID obat
     * @param {object} data - Data obat yang diupdate
     * @returns {boolean}
     */
    update: function (id, data) {
        try {
            const allObat = this.getAllObat();
            const index = allObat.findIndex(obat => obat.id === id);

            if (index !== -1) {
                allObat[index] = { ...allObat[index], ...data };
                localStorage.setItem("apotikku_obat", JSON.stringify(allObat));
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error updating obat:", error);
            return false;
        }
    },

    /**
     * Menghapus obat
     * @param {string} id - ID obat
     * @returns {boolean}
     */
    delete: function (id) {
        try {
            const allObat = this.getAllObat();
            const filteredObat = allObat.filter(obat => obat.id !== id);

            if (filteredObat.length < allObat.length) {
                localStorage.setItem("apotikku_obat", JSON.stringify(filteredObat));
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error deleting obat:", error);
            return false;
        }
    },

    /**
     * Mencari obat berdasarkan nama
     * @param {string} keyword - Kata kunci pencarian
     * @returns {array}
     */
    search: function (keyword) {
        try {
            const allObat = this.getAllObat();
            const lowerKeyword = keyword.toLowerCase();
            return allObat.filter(obat => obat.nama.toLowerCase().includes(lowerKeyword));
        } catch (error) {
            console.error("Error searching obat:", error);
            return [];
        }
    },

    /**
     * Render tabel obat
     * @param {string} containerId - ID container untuk tabel
     */
    renderTable: function (containerId) {
        try {
            const container = document.getElementById(containerId);
            if (!container) return;

            const allObat = this.getAllObat();
            let html = "<table><thead><tr><th>ID</th><th>Nama</th><th>Kategori</th><th>Stok</th><th>Harga</th></tr></thead><tbody>";

            allObat.forEach(obat => {
                html += `<tr><td>${obat.id}</td><td>${obat.nama}</td><td>${obat.kategori}</td><td>${obat.stok}</td><td>${obat.harga}</td></tr>`;
            });

            html += "</tbody></table>";
            container.innerHTML = html;
        } catch (error) {
            console.error("Error rendering obat table:", error);
        }
    }
};

// Inisialisasi modul obat
document.addEventListener('DOMContentLoaded', function () {
    console.log('Obat module initialized');
});

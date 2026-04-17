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
    renderTable: function (dataList) {
        try {
            const tbody = document.getElementById("obatTableBody");

            if (!tbody) return;

            // Gunakan dataList jika diberikan, jika tidak ambil semua data
            const allObat = dataList || this.getAllObat();

            if (allObat.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center text-muted">
                            Tidak ada data ditemukan
                        </td>
                    </tr>
                `;
                return;
            }

            let html = "";

            allObat.forEach((obat, index) => {
                html += `
            <tr>
                <td>${index + 1}</td>
                <td>${obat.id}</td>
                <td>${obat.nama}</td>
                <td>${obat.kategori}</td>
                <td>${obat.harga}</td>
                <td>${obat.stok}</td>
                <td>
                    <button class="btn btn-warning btn-sm me-1" onclick="editObat('${obat.id}')">
                        <i class="bi bi-pencil me-1"></i>Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="if(confirm('Yakin ingin menghapus obat ${obat.nama}?')){Obat.delete('${obat.id}');Obat.renderTable();}">
                        <i class="bi bi-trash me-1"></i>Hapus
                    </button>
                </td>
            </tr>
            `;
            });

            tbody.innerHTML = html;
        } catch (error) {
            console.error("Error rendering obat table:", error);
        }
    },
    renderTableFromData: function (data) {
        try {
            const tbody = document.getElementById("obatTableBody");
            if (!tbody) return;

            if (data.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center text-muted">
                            Tidak ada data ditemukan
                        </td>
                    </tr>
                `;
                return;
            }

            let html = "";

            data.forEach((obat, index) => {
                html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${obat.id}</td>
                    <td>${obat.nama}</td>
                    <td>${obat.kategori}</td>
                    <td>${obat.harga}</td>
                    <td>${obat.stok}</td>
                    <td>
                        <button class="btn btn-warning btn-sm me-1" onclick="editObat('${obat.id}')">
                            <i class="bi bi-pencil me-1"></i>Edit
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="if(confirm('Yakin ingin menghapus obat ${obat.nama}?')){Obat.delete('${obat.id}'); applyFilters();}">
                            <i class="bi bi-trash me-1"></i>Hapus
                        </button>
                    </td>
                </tr>
                `;
            });

            tbody.innerHTML = html;

        } catch (error) {
            console.error("Error render search:", error);
        }
    }
};

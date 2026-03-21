/**
 * ===================================
 * ApotikKu - Auth Module
 * ===================================
 * Modul untuk mengelola autentikasi pengguna
 */

const Auth = {
    /**
     * Login pengguna
     * @param {string} username - Username pengguna
     * @param {string} password - Password pengguna
     * @returns {boolean} Status login
     */
    login: function (username, password) {
        let users = [];
        try {
            const stored = localStorage.getItem('apotikku_users');
            users = stored ? JSON.parse(stored) : [];
        } catch (e) {
            users = [];
        }

        const user = users.find(function (u) {
            return u.username === username && u.password === password;
        });

        if (!user) {
            return false;
        }

        const session = {
            id: user.id,
            username: user.username,
            role: user.role
        };
        sessionStorage.setItem('apotikku_session', JSON.stringify(session));
        return true;
    },

    /**
     * Logout pengguna
     */
    logout: function () {
        // TODO: Implementasi logout
        console.log('Auth.logout called');
    },

    /**
     * Mengecek apakah pengguna sudah login
     * @returns {boolean}
     */
    isLoggedIn: function () {
        return sessionStorage.getItem('apotikku_session') !== null;
    },

    /**
     * Mendapatkan data pengguna yang sedang login
     * @returns {object|null}
     */
    getCurrentUser: function () {
        const session = sessionStorage.getItem('apotikku_session');
        if (!session) {
            return null;
        }
        try {
            return JSON.parse(session);
        } catch (e) {
            return null;

        }
    },

    /**
     * Redirect ke halaman login jika belum login
     */
    requireAuth: function () {
        if (!Auth.isLoggedIn()) {
            window.location.href = 'index.html';
        }
    },

    /**
     * Inisialisasi data pengguna default di localStorage
     * Hanya berjalan jika key "apotikku_users" belum ada
     */
    initUser: function () {
        if (!localStorage.getItem('apotikku_users')) {
            const defaultUsers = [
                {
                    id: 1,
                    username: 'admin',
                    password: 'admin123',
                    role: 'admin'
                }
            ];
            localStorage.setItem('apotikku_users', JSON.stringify(defaultUsers));
            console.log('Default users initialized.');
        }
    }
};

// Inisialisasi modul auth
document.addEventListener('DOMContentLoaded', function () {
    Auth.initUser();
    console.log('Auth module initialized');
});

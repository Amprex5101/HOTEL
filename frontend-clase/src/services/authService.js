// Usar la variable de entorno para la URL base de la API
const API_URL = import.meta.env.VITE_API_URL;

export const authService = {
    async login(username, password) {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Error en el login');
        }

        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.user.username || username);
        
        return data;
    },

    async register(username, password, name, email) {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, name, email })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Error en el registro');
        }

        // Si el registro es exitoso y el backend devuelve un token, también podríamos
        // autenticar al usuario automáticamente
        if (data.token && data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.user.username || username);
        }

        return data;
    },

    logout() {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('username');
    },

    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    getToken() {
        return localStorage.getItem('token');
    },

    isAuthenticated() {
        return !!this.getToken();
    },

    // Método para actualizar los datos del usuario actual en el localStorage
    updateUserData(userData) {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            const updatedUser = { ...currentUser, ...userData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
        }
        return null;
    }
};
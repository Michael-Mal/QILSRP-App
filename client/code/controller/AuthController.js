import User from '../model/User.js';
import Storage from '../util/Storage.js';

/**
 * Handles login/registration against the real server (/user/login,
 * /user/register) and keeps the logged-in user + JWT in localStorage.
 */
export default class AuthController {
  constructor(apiClient) {
    this.api = apiClient;
    const storedUser = Storage.getUser();
    this.currentUser = storedUser ? new User(storedUser) : null;
  }

  get isAuthenticated() {
    return Boolean(Storage.getToken() && this.currentUser);
  }

  async login(email, password) {
    const data = await this.api.post('/user/login', { email, password });
    const user = new User({ user_id: data.user_id, name: data.name, email: data.email, role: data.role, cohort: data.cohort });
    Storage.setToken(data.token);
    Storage.setUser(user);
    this.currentUser = user;
    return user;
  }

  async register({ name, email, mobile, password, cohort, role, auth }) {
    return this.api.post('/user/register', { name, email, mobile, password, cohort, role }, { auth });
  }

  logout() {
    Storage.clearToken();
    Storage.clearUser();
    this.currentUser = null;
  }
}

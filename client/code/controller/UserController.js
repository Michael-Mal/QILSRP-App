import User from '../model/User.js';

/**
 * Admin-facing user management, backed by the real /user endpoints.
 */
export default class UserController {
  constructor(apiClient) {
    this.api = apiClient;
  }

  async list() {
    const rows = await this.api.get('/user/', { auth: true });
    return rows.map(row => new User(row));
  }

  async update(email, { name, password }) {
    return this.api.put(`/user/${encodeURIComponent(email)}`, { name, email, password }, { auth: true });
  }

  async remove(email) {
    return this.api.delete(`/user/${encodeURIComponent(email)}`, { auth: true });
  }
}

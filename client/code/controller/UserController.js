import User from '../model/User.js';

/**
 * Admin-facing user management, backed by the real /user endpoints.
 */
export default class UserController {
  constructor(apiClient) {
    this.api = apiClient;
  }

  async list(cohort, role) {
    let searchParams = ''

    if (cohort) {
      searchParams += `?cohort=${cohort}`
      if (role) {
        searchParams += `&role=${role}`
      }
    }
    else if (role) {
      searchParams += `?role=${role}`
    }

    const rows = await this.api.get('/user/' + searchParams, { auth: true });
    return rows.map(row => new User(row));
  }

  async update(email, { name, password, cohort, role }) {
    return this.api.put(`/user/${encodeURIComponent(email)}`, { name, email, password, cohort, role }, { auth: true });
  }

  async remove(email) {
    return this.api.delete(`/user/${encodeURIComponent(email)}`, { auth: true });
  }
}

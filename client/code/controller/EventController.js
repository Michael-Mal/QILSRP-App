import Event from '../model/Event.js';

/**
 * Event management
 */
export default class UserController {
  constructor(apiClient) {
    this.api = apiClient;
  }

  async post(name, datetime, location, description) {
    return this.api.post('/event/', { name, datetime, location, description }, { auth: true });
  }

  async update(id, name, datetime, location, description) {
    return this.api.put(`/event/${encodeURIComponent(id)}`, { name, datetime, location, description }, { auth: true });
  }

  async remove(id) {
    return this.api.delete(`/event/${encodeURIComponent(id)}`, { auth: true });
  }

  async confirm(id) {
    return this.api.post(`/${encodeURIComponent(id)}/confirm`, {}, { auth: true })
  }
}

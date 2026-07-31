import { escapeHtml } from '../util/dom.js';

export default class AdminView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
  }

  async mount() {
    const user = this.app.auth.currentUser;
    if (!user.isAdmin) {
      this.container.innerHTML = '<p>Access denied.</p>';
      return;
    }

    const [users, cohorts] = await Promise.all([
      this.app.users.list(),
      this.app.cohorts.list(),
    ]);

    this.container.innerHTML = `
      <h2>Admin Panel</h2>

      <div class="card">
        <h3>Register Ranger</h3>
        <label>Name</label><input type="text" id="admin-reg-name" />
        <label>Email</label><input type="text" id="admin-reg-email" />
        <label>Password</label><input type="password" id="admin-reg-password" />
        <button data-action="register-user">Create</button>
        <p id="admin-reg-error" class="error-text"></p>
      </div>

      <div class="card">
        <h3>Users</h3>
        <table>
          <thead><tr><th>Email</th><th>Name</th><th>Status</th><th>Created</th><th>Action</th></tr></thead>
          <tbody>
            ${users.map(u => `
              <tr data-email="${escapeHtml(u.email)}">
                <td>${escapeHtml(u.email)}</td>
                <td>${escapeHtml(u.name)}</td>
                <td>${escapeHtml(u.status || '-')}</td>
                <td>${escapeHtml(u.created || '-')}</td>
                <td>
                  <button data-action="edit-user" data-email="${escapeHtml(u.email)}">Edit</button>
                  <button data-action="delete-user" data-email="${escapeHtml(u.email)}">Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="card">
        <h3>Cohorts</h3>
        <table>
          <thead><tr><th>Name</th><th>Ranger</th><th>Members</th></tr></thead>
          <tbody>
            ${cohorts.map(c => `<tr><td>${escapeHtml(c.name)}</td><td>${escapeHtml(c.rangerName || '-')}</td><td>${c.members.length}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>

      <div class="card">
        <h3>Summary</h3>
        <p>Users: ${users.length} | Cohorts: ${cohorts.length}</p>
      </div>
    `;

    const registerBtn = this.container.querySelector('[data-action="register-user"]');
    if (registerBtn) registerBtn.addEventListener('click', () => this.registerUser());

    this.container.querySelectorAll('[data-action="edit-user"]').forEach(button => {
      button.addEventListener('click', () => this.editUser(button.dataset.email));
    });

    this.container.querySelectorAll('[data-action="delete-user"]').forEach(button => {
      button.addEventListener('click', () => this.deleteUser(button.dataset.email));
    });
  }

  async registerUser() {
    const name = this.container.querySelector('#admin-reg-name').value.trim();
    const email = this.container.querySelector('#admin-reg-email').value.trim();
    const password = this.container.querySelector('#admin-reg-password').value.trim();
    const errorEl = this.container.querySelector('#admin-reg-error');
    errorEl.style.display = 'none';

    if (!name || !email || !password) { alert('Name, email, and password are required.'); return; }

    try {
      await this.app.auth.register({ name, email, password });
      await this.mount();
    } catch (error) {
      errorEl.textContent = error.message || 'Registration failed.';
      errorEl.style.display = 'block';
    }
  }

  async editUser(email) {
    const name = prompt('New name for this user:');
    if (!name) return;
    const password = prompt('New password for this user:');
    if (!password) return;

    await this.app.users.update(email, { name, password });
    await this.mount();
  }

  async deleteUser(email) {
    if (!confirm(`Delete user ${email}? This cannot be undone.`)) return;
    await this.app.users.remove(email);
    await this.mount();
  }
}

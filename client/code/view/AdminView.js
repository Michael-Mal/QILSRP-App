import { escapeHtml } from '../util/dom.js';

export default class AdminView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
  }

  nameFilter = null
  emailFilter = null
  statusFilter = null
  cohortFilter = null
  roleFilter = null

  async mount() {
    const user = this.app.auth.currentUser;
    if (!user.isAdmin) {
      this.container.innerHTML = '<p>Access denied.</p>';
      return;
    }

    const [users, cohorts] = await Promise.all([
      this.app.users.list(this.nameFilter, this.emailFilter, this.statusFilter, this.cohortFilter, this.roleFilter),
      this.app.cohorts.list(),
    ]);

    this.container.innerHTML = `
      <h2>Admin Panel</h2>

      <div class="card">
        <h3>Register Ranger</h3>
        <label>Name</label><input type="text" id="admin-reg-name" />
        <label>Email</label><input type="text" id="admin-reg-email" />
        <label>Password</label><input type="password" id="admin-reg-password" />
        <label>Cohort</label><input type="text" id="admin-reg-cohort" />
        <label>Role</label><input type="text" id="admin-reg-role" />
        <button data-action="register-user">Create</button>
        <p id="admin-reg-error" class="error-text"></p>
      </div>

      <div class="card">
        <h3>Users</h3>
        <label>Name</label><input type="text" id="admin-fil-name" />
        <label>Email</label><input type="text" id="admin-fil-email" />
        <label>Status</label><input type="text" id="admin-fil-status" />
        <label>Cohort</label><input type="text" id="admin-fil-cohort" />
        <label>Role</label><input type="text" id="admin-fil-role" />
        <button data-action="filter">Filter</button>
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
                  ${u.status == "Pending" ? `<button data-action="verify-user" data-email="${escapeHtml(u.email)}">Verify</button>` : ""}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="card">
        <h3>Cohorts</h3>
        <table>
          <thead><tr><th>Name</th><th>Members</th></tr></thead>
          <tbody>
            ${cohorts.map(c => `<tr><td>${escapeHtml(c.name)}</td><td>${c.userCount}</td></tr>`).join('')}
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

    const filterBtn = this.container.querySelector('[data-action="filter"]');
    if (filterBtn) filterBtn.addEventListener('click', () => this.filterUsers());

    this.container.querySelectorAll('[data-action="edit-user"]').forEach(button => {
      button.addEventListener('click', () => this.editUser(button.dataset.email));
    });

    this.container.querySelectorAll('[data-action="delete-user"]').forEach(button => {
      button.addEventListener('click', () => this.deleteUser(button.dataset.email));
    });

    this.container.querySelectorAll('[data-action="verify-user"]').forEach(button => {
      button.addEventListener('click', () => this.verifyUser(button.dataset.email));
    });
  }

  async registerUser() {
    const name = this.container.querySelector('#admin-reg-name').value.trim();
    const email = this.container.querySelector('#admin-reg-email').value.trim();
    const password = this.container.querySelector('#admin-reg-password').value.trim();
    const cohort = this.container.querySelector('#admin-reg-cohort').value.trim();
    const role = this.container.querySelector('#admin-reg-role').value.trim();
    const errorEl = this.container.querySelector('#admin-reg-error');
    errorEl.style.display = 'none';

    if (!name || !email || !password || !cohort || !role ) { alert('Name, email, password, cohort, and role are required.'); return; }

    try {
      await this.app.auth.register({ name, email, password, cohort, role, auth: true });
      await this.mount();
    } catch (error) {
      errorEl.textContent = error.message || 'Registration failed.';
      errorEl.style.display = 'block';
    }
  }

  async filterUsers() {
    this.nameFilter = this.container.querySelector('#admin-fil-name').value.trim();
    this.emailFilter = this.container.querySelector('#admin-fil-email').value.trim();
    this.statusFilter = this.container.querySelector('#admin-fil-status').value.trim();
    this.cohortFilter = this.container.querySelector('#admin-fil-cohort').value.trim();
    this.roleFilter = this.container.querySelector('#admin-fil-role').value.trim();
    await this.mount();
  }

  async editUser(email) {
    const name = prompt('New name for this user:');
    if (!name) return;
    const cohort = prompt('Updated cohort for this user:');
    if (!cohort) return;
    const role = prompt('Updated role for this user:');
    if (!role) return;

    await this.app.users.update(email, { name, cohort, role });
    await this.mount();
  }

  async deleteUser(email) {
    if (!confirm(`Delete user ${email}? This cannot be undone.`)) return;
    await this.app.users.remove(email);
    await this.mount();
  }

  async verifyUser(email) {
    if (!confirm(`Verfy user ${email}?`)) return;
    await this.app.users.verify(email);
    await this.mount();
  }
}

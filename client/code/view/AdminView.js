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
      this.app.users.list(this.nameFilter, this.emailFilter, this.mobileFilter, this.statusFilter, this.cohortFilter, this.roleFilter),
      this.app.cohort.list(),
    ]);

    this.container.innerHTML = `
      <h2>Admin Panel</h2>

      <div class="card">
        <h3>Register Ranger</h3>
        <label>Name</label><input type="text" id="admin-reg-name" />
        <label>Email</label><input type="text" id="admin-reg-email" />
        <label>Mobile</label><input type="text" id="admin-reg-mobile" /> 
        <label>Password</label><input type="password" id="admin-reg-password" />
        <label>Cohort</label><input type="text" id="admin-reg-cohort" />
        <label>Role</label><input type="text" id="admin-reg-role" />
        <button data-action="register-user">Create</button>
        <p id="admin-reg-error" class="error-text"></p>
      </div>

      <div class="card">
        <div class="flexbox">
          <h3>Users</h3>
          <button data-action="show-filters" class="right-align">⌕ Filter</button>
          <button data-action="reset-filters" class="horizontal-gap">Reset Filter</button>
        </div>
        <div id="filters" style="display:none;">
          <label>Name</label><input type="text" id="admin-fil-name" />
          <label>Email</label><input type="text" id="admin-fil-email" />
          <label>Mobile</label><input type="text" id="admin-fil-mobile" />
          <label>Status</label><input type="text" id="admin-fil-status" />
          <label>Cohort</label><input type="text" id="admin-fil-cohort" />
          <label>Role</label><input type="text" id="admin-fil-role" />
          <button data-action="filter">Filter</button>
        </div>
        <table>
          <thead><tr><th>Contact</th><th>Name</th><th>Role</th><th>Created</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            ${users.map(u => `
              <tr data-id="${escapeHtml(u.user_id)}">
                <td>
                  <br>
                  ${u.email != undefined ? escapeHtml(u.email) : "(no email)"} 
                  <br><br>
                  ${u.mobile != undefined ? `${escapeHtml(u.mobile.slice(0, 4) + " " + u.mobile.slice(4, 7) + " " + u.mobile.slice(7, 10))}` : "(no mobile)"}
                  <br><br>
                </td>
                <td>${escapeHtml(u.name)}</td>
                <td>${escapeHtml(u.role)}</td>
                <td style="width: 60px">${escapeHtml(u.created || '-')}</td>
                <td>${escapeHtml(u.status)}</td>
                <td style="width: 145px">
                  <button data-action="edit-user" data-id="${escapeHtml(u.user_id)}">✎ Edit</button>
                  <button data-action="delete-user" data-id="${escapeHtml(u.user_id)}" style="margin-top: 5px">🗑 Delete</button>
                  ${u.status == "Pending" ? `<button data-action="verify-user" data-id="${escapeHtml(u.user_id)}" style="margin-top: 5px">✓ Verify</button>` : ""}
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

    const showFiltersBtn = this.container.querySelector('[data-action="show-filters"]');
    if (showFiltersBtn) showFiltersBtn.addEventListener('click', () => this.showFilters());

    const resetFiltersBtn = this.container.querySelector('[data-action="reset-filters"]');
    if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', () => this.resetFilters());

    const filterBtn = this.container.querySelector('[data-action="filter"]');
    if (filterBtn) filterBtn.addEventListener('click', () => this.filterUsers());

    const registerBtn = this.container.querySelector('[data-action="register-user"]');
    if (registerBtn) registerBtn.addEventListener('click', () => this.registerUser());

    this.container.querySelectorAll('[data-action="edit-user"]').forEach(button => {
      button.addEventListener('click', () => this.editUser(button.dataset.id));
    });

    this.container.querySelectorAll('[data-action="delete-user"]').forEach(button => {
      button.addEventListener('click', () => this.deleteUser(button.dataset.id));
    });

    this.container.querySelectorAll('[data-action="verify-user"]').forEach(button => {
      button.addEventListener('click', () => this.verifyUser(button.dataset.id));
    });
  }

  async showFilters() {
    const filters = this.container.querySelector('#filters');
    if (filters.style.display === 'none') {
      filters.style.display = 'block';

    }
    else {
      filters.style.display = 'none';

    }
  }

  async resetFilters() {
    this.nameFilter = null
    this.emailFilter = null
    this.statusFilter = null
    this.cohortFilter = null
    this.roleFilter = null
    await this.mount();

  }

  async filterUsers() {
    this.nameFilter = this.container.querySelector('#admin-fil-name').value.trim();
    this.emailFilter = this.container.querySelector('#admin-fil-email').value.trim();
    this.mobileFilter = this.container.querySelector('#admin-fil-mobile').value.trim();
    this.statusFilter = this.container.querySelector('#admin-fil-status').value.trim();
    this.cohortFilter = this.container.querySelector('#admin-fil-cohort').value.trim();
    this.roleFilter = this.container.querySelector('#admin-fil-role').value.trim();
    await this.mount();

  }

  async registerUser() {
    const name = this.container.querySelector('#admin-reg-name').value.trim();
    const email = this.container.querySelector('#admin-reg-email').value.trim();
    const mobile = this.container.querySelector('#admin-reg-mobile').value.trim(); // mobile field WIP
    const password = this.container.querySelector('#admin-reg-password').value.trim();
    const cohort = this.container.querySelector('#admin-reg-cohort').value.trim();
    const role = this.container.querySelector('#admin-reg-role').value.trim();
    const errorEl = this.container.querySelector('#admin-reg-error');
    errorEl.style.display = 'none';

    if (!name || !password || !cohort || !role) { alert('Name, password, cohort, and role are required.'); return; }
    if (!email && !mobile) { alert('Email or mobile is required.'); return; }

    try {
      await this.app.auth.register({ name, email, mobile, password, cohort, role, auth: true });
      await this.mount();
    } catch (error) {
      errorEl.textContent = error.message || 'Registration failed.';
      errorEl.style.display = 'block';
    }
  }

  async editUser(id) {
    const name = prompt('New name for this user:');
    if (!name) return;
    const email = prompt('Updated email for this user (Enter nothing for only mobile):');
    const mobile = prompt('Updated mobile for this user (Enter nothing for only email):');
    if (!email && !mobile) return;
    const cohort = prompt('Updated cohort for this user:');
    if (!cohort) return;
    const role = prompt('Updated role for this user:');
    if (!role) return;

    await this.app.users.update(id, { name, email, mobile, cohort, role });
    await this.mount();
  }

  async deleteUser(id) {
    if (!confirm(`Delete user? This cannot be undone.`)) return;
    await this.app.users.remove(id);
    await this.mount();
  }

  async verifyUser(id) {
    if (!confirm(`Verfy user?`)) return;
    await this.app.users.verify(id);
    await this.mount();
  }
}

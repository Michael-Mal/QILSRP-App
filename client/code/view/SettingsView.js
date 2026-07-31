import { escapeHtml } from '../util/dom.js';

export default class SettingsView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
  }

  async mount() {
    const user = this.app.auth.currentUser;

    this.container.innerHTML = `
      <h2>Settings</h2>
      <div class="card">
        <h3>Account</h3>
        <p>Name: ${escapeHtml(user.name)}</p>
        <p>Role: ${escapeHtml(user.role)}</p>
        <p>Email: ${escapeHtml(user.email)}</p>
      </div>
      <div class="card">
        <h3>Preferences</h3>
        <label><input type="checkbox" checked /> Push Notifications</label><br/>
        <label><input type="checkbox" /> Offline Mode</label>
      </div>
      <div class="card">
        <h3>About</h3>
        <p>Junior Ranger App</p>
        <p>QILSRP / QUT Team 184</p>
      </div>
      <br/>
      <button data-action="logout">Logout</button>
    `;

    this.container.querySelector('[data-action="logout"]').addEventListener('click', () => this.app.logout());
  }
}

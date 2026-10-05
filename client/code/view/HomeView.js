import { escapeHtml } from '../util/dom.js';

export default class HomeView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
  }

  async mount() {
    const user = this.app.auth.currentUser;
    const cohorts = await this.app.cohort.listForUser(user);

    this.container.innerHTML = `
      <h2>Home</h2>
      <p>Welcome, ${escapeHtml(user.name)}.</p>

      <div class="card">
        <h3>Next Event</h3>
        <p>No upcoming events.</p>
      </div>

      <div class="card">
        <h3>My Cohorts</h3>
        ${cohorts.length ? cohorts.map(cohort => `<p>${escapeHtml(cohort.name)}</p>`).join('') : '<p>No cohorts.</p>'}
      </div>
    `;
  }
}

/**
 * Static page shell. Layout/markup only for now — cohort creation and
 * membership management logic will be wired up once the feature is built out.
 */
export default class CohortsView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
  }

  async mount() {
    const user = this.app.auth.currentUser;
    if (user.isStudent) {
      this.container.innerHTML = '<p>Access denied.</p>';
      return;
    }

    this.container.innerHTML = `
      <h2>Cohort Management</h2>
      <div class="card">
        <h3>Create Cohort</h3>
        <label>Name</label><input type="text" id="coh-name" />
        <button disabled>Create</button>
      </div>
      <p>No cohorts yet.</p>
    `;
  }
}

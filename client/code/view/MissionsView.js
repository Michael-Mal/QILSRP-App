/**
 * Static page shell. Layout/markup only for now — mission creation and
 * listing logic will be wired up once the feature is built out.
 */
export default class MissionsView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
  }

  async mount() {
    const user = this.app.auth.currentUser;
    const canCreate = !user.isStudent;

    let html = '<h2>Missions</h2>';

    if (canCreate) {
      html += `
        <div class="card">
          <h3>Create Mission</h3>
          <label>Title</label><input type="text" id="msn-title" />
          <label>Description</label><textarea id="msn-desc" rows="2"></textarea>
          <label>Cohort</label>
          <select id="msn-cohort"></select>
          <button disabled>Publish</button>
        </div>
      `;
    }

    html += '<p>No missions yet.</p>';

    this.container.innerHTML = html;
  }
}

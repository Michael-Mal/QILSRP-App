/**
 * Static page shell. Layout/markup only for now — event creation and
 * listing logic will be wired up once the feature is built out.
 */
export default class EventsView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
  }

  async mount() {
    const user = this.app.auth.currentUser;
    const canCreate = !user.isStudent;

    let html = '<h2>Events</h2>';

    if (canCreate) {
      html += `
        <div class="card">
          <h3>Create Event</h3>
          <label>Title</label><input type="text" id="evt-title" />
          <label>Date</label><input type="date" id="evt-date" />
          <label>Description</label><textarea id="evt-desc" rows="2"></textarea>
          <label>Cohort</label>
          <select id="evt-cohort"></select>
          <button disabled>Add Event</button>
        </div>
      `;
    }

    html += '<p>No events yet.</p>';

    this.container.innerHTML = html;
  }
}

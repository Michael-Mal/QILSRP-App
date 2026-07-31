/**
 * Static page shell. Layout/markup only for now — resource creation and
 * listing logic will be wired up once the feature is built out.
 */
export default class ResourcesView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
  }

  async mount() {
    const user = this.app.auth.currentUser;
    const canAdd = !user.isStudent;

    let html = '<h2>Resource Hub</h2>';

    if (canAdd) {
      html += `
        <div class="card">
          <h3>Add Resource</h3>
          <label>Title</label><input type="text" id="res-title" />
          <label>Type</label>
          <select id="res-type">
            <option>PDF</option>
            <option>Podcast</option>
            <option>Video</option>
            <option>Link</option>
          </select>
          <label>URL</label><input type="text" id="res-url" placeholder="https://..." />
          <button disabled>Add</button>
        </div>
      `;
    }

    html += '<p>No resources yet.</p>';

    this.container.innerHTML = html;
  }
}

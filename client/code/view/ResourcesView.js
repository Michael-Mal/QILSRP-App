import { escapeHtml } from '../util/dom.js';

export default class ResourcesView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
  }

  async mount() {
    const user = this.app.auth.currentUser;
    const canAdd = !user.isStudent; // Flag for if the user should be allowed to add resources.

    const resources = await this.app.resources.getAllResources();

    let html = '<h2>Resource Hub</h2>';

    if (canAdd) {
      html += `
        <div class="card">
          <button data-action="goto-addResource">Add Resource</button>
        </div>
      `;
    }

    if (resources.length <= 0) {
      html += '<p>No resources yet.</p>';
    }
    else {
      html += '<div class="card">';
      resources.forEach(resource => {
        html += ` 
        <div class="card">
          <h3>${escapeHtml(resource.title)}</h3>
          <p>${escapeHtml(resource.desc)}</p>
        </div>
      `;
    })
    html += '</div>';
  }

    this.container.innerHTML = html;

    this.container.querySelector('[data-action="goto-addResource"]').addEventListener('click', () => this.app.navigate('resourceAdd'));
  
  }  
}

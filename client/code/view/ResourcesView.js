export default class ResourcesView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
  }

  async mount() {
    const user = this.app.auth.currentUser;
    const canAdd = !user.isStudent; // Flag for if the user should be allowed to add resources.

    let html = '<h2>Resource Hub</h2>';

    if (canAdd) {
      html += `
        <div class="card">
          <button data-action="goto-addResource">Add Resource</button>
        </div>
      `;
    }

    html += '<p>No resources yet.</p>';

    this.container.innerHTML = html;

    this.container.querySelector('[data-action="goto-addResource"]').addEventListener('click', () => this.app.navigate('resourceAdd'));
  
  }  
}

import { escapeHtml } from '../util/dom.js';

export default class ResourcesView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
  }

  async mount() {
    const user = this.app.auth.currentUser;
    const canAdd = !user.isStudent; // Flag for if the user should be allowed to add resources.

    const ROOT_ID = 1; // Assuming 1 is the root folder ID
    let current_folder_id = ROOT_ID; // Temp set, later will be parameter for population method

    let html_static = '<h2>Resource Hub</h2>';

    if (canAdd) {
      html_static += `
        <div class="card">
          <button data-action="goto-addResource">Add Resource</button>
        </div>
        <br>
      `;
    }

    html_static += `<div id="folder-contents"></div>`;

    this.container.innerHTML = html_static;
    
    await this.populateFolderContents(current_folder_id);

    this.container.querySelector('[data-action="goto-addResource"]').addEventListener('click', () => this.app.navigate('resourceAdd'));
  }

  async populateFolderContents(folderID) {
    // Start folder population method, 
    let { resources, folders } = await this.app.resources.listFolderContents(folderID);

    let html_dynamic = '';

    html_dynamic += `
    <div class="card">
    <ul>`;

    let folderPath = await this.app.resources.getFolderPath(folderID);
    folderPath.forEach(folder =>
      html_dynamic += `
      <li style="display: inline;"><p style="display: inline;">/</p><button data-action="goto-folder" data-id="${folder.id}">${escapeHtml(folder.name)}</button></li>
      `
    )

    html_dynamic += `</ul></div> <br>`;

    if (resources.length <= 0 && folders.length <= 0) {
      html_dynamic += '<p>No resources in this folder yet.</p>';
    }
    else {
      html_dynamic += '<div class="card">';
      folders.forEach(folder => {
        html_dynamic += `
        <div class="card">
          <button data-action="goto-folder" data-id="${folder.id}">FOLDER: ${escapeHtml(folder.name)} | Access level: ${escapeHtml(folder.accessLevel)}</button>
        </div>
      `;
    });

      resources.forEach(resource => {
        html_dynamic += ` 
        <div class="card">
          <h3>${escapeHtml(resource.title)}</h3>
          <p>${escapeHtml(resource.type)}</p>
        </div>
      `;
    })
  }

  this.container.querySelector('#folder-contents').innerHTML = html_dynamic;

  this.container.querySelectorAll('[data-action="goto-folder"]').forEach(button => {
    button.addEventListener('click', async (event) => {
      const folderID = parseInt(event.target.getAttribute('data-id'), 10);
      this.populateFolderContents(folderID); // Recursively populate the clicked folder's contents
    });  
  });
}
}

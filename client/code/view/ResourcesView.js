import { escapeHtml } from '../util/dom.js';

const ROOT_ID = 1; // Assuming 1 is the root folder ID

export default class ResourcesView {
  constructor(container, app) {
    
    this.container = container;
    this.app = app;
    this.currentFolderID = ROOT_ID;
  }

  async mount() {
    const user = this.app.auth.currentUser;
    const canAdd = !user.isStudent; // Flag for if the user should be allowed to add resources.

    let current_folder_id = ROOT_ID; // Temp set, later will be parameter for population method

    let html_static = '<h2>Resource Hub</h2>';

    if (canAdd) {
      html_static += `
        <div class="card">
          <h2>Add a resource</h2>
          <br>
          <form id="res-form">
            <label>Title</label><input type="text" id="res-title" name="title" required/>
            <label>Type</label>
            <select id="res-type" name="type" required>
              <option value="">Select a type</option>
              <option>Image</option>
              <option>PDF</option>
              <option>Audio</option>
              <option>Video</option>
            </select>

            <div id="res-input-container">
            </div>

            <label>Minimum Access Level</label>
            <select id="res-access" name="access">
              <option>Student</option>
              <option>Ranger</option>
              <option>Admin</option>
            </select>

            <input type="submit" value="Add Resource"/>
          </form>
        </div>
        </div>
        <br>
      `;
    }

    html_static += `
    <div class="card">
    <div id="folder-contents"></div>
    `;
    
    if (canAdd)
      {
        html_static += `
        <div class="card">
          <h2>Create New Folder</h2>
          <br>
          <form id="folder-form">
            <label>Name</label><input type="text" id="folder-name" name="name" required/>

            <label>Minimum Access Level</label>
            <select id="folder-access" name="access">
              <option>Student</option>
              <option>Ranger</option>
              <option>Admin</option>
            </select>

            <input type="submit" value="Add Folder"/>
          </form>
        </div>
        `
      }    

    this.container.innerHTML = html_static;

    
    // Update the resource input fields based on the selected type.
    if (canAdd) {
        const resTypeSelect = this.container.querySelector('#res-type');

        resTypeSelect.addEventListener('change', () => {
          this.updateResourceInput(resTypeSelect.value);
        });
    }

    // Form submission handling
    if (canAdd) {
      const resourceForm = this.container.querySelector('#res-form');
      resourceForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const title = this.container.querySelector('#res-title').value;
        const type = this.container.querySelector('#res-type').value;
        const parentID = this.currentFolderID;
        let fileRef = null; // Placeholder for file reference after upload.
        const accessLevel = this.container.querySelector('#res-access').value.toLowerCase();

        if (type === 'Image' || type === 'PDF' || type === 'Audio' || type === 'Video') {
          const fileInput = this.container.querySelector('#res-file');
          if (fileInput.files.length > 1) {
            alert("multiple files are not supported yet. Please select only one file.");
            return;
            for (const file of fileInput.files) {
            // Handle file upload logic here. Unsure how to handle multiple files in one resource.
            }
          } else {
            const file = fileInput.files[0];
            // TODO: 
            // Handle single file upload logic here. Probably await file upload completion? Should maybe be done *before* form submission.
            fileRef = 'qilsrp.com/dummy-file-url'; // Placeholder for file reference after upload.
          }
        }
        this.CreateNewResource({ title, type, fileRef, parentID, accessLevel });
      });

      const folderForm = this.container.querySelector('#folder-form');
      folderForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = this.container.querySelector('#folder-name').value;
        const parentID = this.currentFolderID;
        const accessLevel = this.container.querySelector('#folder-access').value.toLowerCase();


        this.CreateNewFolder({ name, parentID, accessLevel });
      });
    }
      
    await this.populateFolderContents(current_folder_id);
  }

  async populateFolderContents(folderID) {
    // Start folder population method
    this.currentFolderID = folderID;
    let { resources, folders } = await this.app.folders.listFolderContents(folderID);
    let currentFolder = await this.app.folders.getFolderInfo(folderID);

    let html_dynamic = '';

    html_dynamic += `
    <ul>`;

    let folderPath = currentFolder.path;
    folderPath.forEach(folder =>
      html_dynamic += `
      <li style="display: inline;"><p style="display: inline;">/</p><button data-action="goto-folder" data-id="${folder.id}">${escapeHtml(folder.name)}</button></li>
      `
    )

    html_dynamic += `</ul> <br>`;

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

  // Repopulate the contents every time user travels to a new folder
  this.container.querySelectorAll('[data-action="goto-folder"]').forEach(button => {
    button.addEventListener('click', async (event) => {
      const folderID = parseInt(event.target.getAttribute('data-id'), 10);
      this.populateFolderContents(folderID); // Recursively populate the clicked folder's contents
    });  
  });
}


updateResourceInput(type) {
      const resContainer = this.container.querySelector('#res-input-container');

      switch (type) {
      case 'Image':
          resContainer.innerHTML = `
          <label>Image File:</label>
          <input type="file" id="res-file" accept="image/*" name="file" required multiple/> <!-- * Accepts any type of image (png, jpg, etc.) -->
          `;
          break;

      case 'PDF':
          resContainer.innerHTML = `
          <label>PDF File:</label>
          <input type="file" id="res-file" accept=".pdf" name="file" required multiple/>
          `;
          break;

      case 'Audio':
          resContainer.innerHTML = `
          <label>Audio File:</label>
          <input type="file" id="res-file" accept="audio/*" name="file" required multiple/>
          `;
           break;

      case 'Video':
          resContainer.innerHTML = `
          <label>Video File:</label>
          <input type="file" id="res-file" accept="video/*" name="file" required multiple/>
          `;
          break;
      }
  }

  CreateNewResource({ type, title, fileRef, parentID, accessLevel }) {
    this.app.resources.createResource({type, title, fileRef, parentID, accessLevel});
    this.populateFolderContents(this.currentFolderID); // Repopulate folder with current folder to show updated form
  }

  CreateNewFolder({ name, parentID, accessLevel }) {
    this.app.folders.createFolder({ name, parentID, accessLevel })
    this.populateFolderContents(this.currentFolderID); // Repopulate folder with current folder to show updated form
  }
}

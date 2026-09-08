import { escapeHtml } from '../util/dom.js';

const ROOT_ID = 1; // Assuming 1 is the root folder ID

export default class ResourcesView {
  constructor(container, app) {
    
    this.container = container;
    this.app = app;
    this.currentFolderID = ROOT_ID;
    this.user = this.app.auth.currentUser; // Store the current user for permission checks
  }

  async mount() {
    const canAdd = !this.user.isStudent; // Flag for if the user should be allowed to add resources.

    let current_folder_id = ROOT_ID; // Temp set, later will be parameter for population method

    let html_static = '<h2>Resource Hub</h2>';

    if (canAdd) {
      html_static += `
        <div class="card">
          <h2>Add a resource</h2>
          <br>
          <form id="res-form">
            <label>Title</label><input type="text" id="res-title" name="title" placeholder="Leave blank to use file name"/>
            <label>Type</label>
            <select id="res-type" name="type" required>
              <option value="">Select a type</option>
              <option>Image</option>
              <option>PDF</option>
              <option>Audio</option>
              <option>Video</option>
              <option>Document</option>
              <option>Spreadsheet</option>
              <option>Presentation</option>
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
        const file = this.container.querySelector('#res-file').files[0];
        const mimeType = file.type; // Get the MIME type of the selected file

        let title = this.container.querySelector('#res-title').value.trim();
        if (title === '') {
          // If title is empty, use the file name (without extension) as the title.
          title = file.name.replace(/\.[^/.]+$/, ""); // Remove the extension from the file name, works with files with multiple dots in the name as well;
        }
        const type = this.container.querySelector('#res-type').value.toLowerCase();
        const parentID = this.currentFolderID;
        const accessLevel = this.container.querySelector('#res-access').value.toLowerCase();


        const extension = file.name.split('.').pop(); // Get the file extension from the selected file

        this.CreateNewResource({ title, type, extension, mimeType, parentID, accessLevel, file });
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
          <button data-action="goto-folder" data-id="${folder.id}">📁: ${escapeHtml(folder.name)} | Access level: ${escapeHtml(folder.accessLevel)}</button>
        </div>
      `;
    });

      resources.forEach(resource => {
        html_dynamic += ` 
        <div class="card">
          <h3>${escapeHtml(resource.title)}</h3>
          <p>${escapeHtml(resource.type)}</p>
          <button data-action="download-resource" data-id="${resource.id}">Download</button> | Access level: ${escapeHtml(resource.accessLevel)} | 
          <button data-action="edit-resource" data-id="${resource.id}" data-uploader="${resource.uploaderID}">Edit</button> | 
          <button data-action="delete-resource" data-id="${resource.id}" data-uploader="${resource.uploaderID}">Delete</button></p>
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

  this.container.querySelectorAll('[data-action="download-resource"]').forEach(button => {
    button.addEventListener('click', async (event) => {
      const resourceID = parseInt(event.target.getAttribute('data-id'), 10);
      this.downloadResource(resourceID);
    });
  });

  this.container.querySelectorAll('[data-action="edit-resource"]').forEach(button => {
    button.addEventListener('click', async (event) => {
      const resourceID = parseInt(event.target.getAttribute('data-id'), 10);
      const resourceUploaderID = parseInt(event.target.getAttribute('data-uploader'), 10);
      this.editResource(resourceID, resourceUploaderID);
    });
  });

  this.container.querySelectorAll('[data-action="delete-resource"]').forEach(button => {
    button.addEventListener('click', async (event) => {
      const resourceID = parseInt(event.target.getAttribute('data-id'), 10);
      const resourceUploaderID = parseInt(event.target.getAttribute('data-uploader'), 10);
      this.deleteResource(resourceID, resourceUploaderID);
    });
  });
}


updateResourceInput(type) {
      const resContainer = this.container.querySelector('#res-input-container');

      switch (type) {
        // NOTE: accept:* enforcements are assists for the file picker, but do not prevent users from selecting other file types. Validation should be implemented further, both server-side and client-side.
      case 'Image':
          resContainer.innerHTML = `
          <label>Image File:</label>
          <input type="file" id="res-file" accept="image/*" name="file" required/> <!-- * Accepts any type of image (png, jpg, etc.) -->
          `;
          break;

      case 'PDF':
          resContainer.innerHTML = `
          <label>PDF File:</label>
          <input type="file" id="res-file" accept=".pdf" name="file" required/>
          `;
          break;

      case 'Audio':
          resContainer.innerHTML = `
          <label>Audio File:</label>
          <input type="file" id="res-file" accept="audio/*" name="file" required/>
          `;
           break;

      case 'Video':
          resContainer.innerHTML = `
          <label>Video File:</label>
          <input type="file" id="res-file" accept="video/*" name="file" required/>
          `;
          break;
      case 'Document':
          resContainer.innerHTML = `
          <label>Document:</label>
          <input type="file" id="res-file" accept=".doc,.docx,.txt,.odt,.rtf" name="file" required/>
          `;
          // List of supported document file types: .doc, .docx, .txt, .odt, .rtf
          break;
      case 'Spreadsheet':
          resContainer.innerHTML = `
          <label>Spreadsheet:</label>
          <input type="file" id="res-file" accept=".xls,.xlsx,.ods,.csv" name="file" required/>
          `;
          // List of supported spreadsheet file types: .xls, .xlsx, .ods, .csv
          break;
      case 'Presentation':
          resContainer.innerHTML = `
          <label>Presentation:</label>
          <input type="file" id="res-file" accept=".ppt,.pptx,.odp,.key" name="file" required/>
          `;
          // List of supported presentation file types: .ppt, .pptx, .odp, .key
          break;
      }
  }

  async CreateNewResource({ type, title, extension, mimeType, parentID, accessLevel, file}) {
    try {
      await this.app.resources.createResource({type, title, extension, mimeType, parentID, accessLevel, file});
      
      this.populateFolderContents(this.currentFolderID); // Repopulate folder with current folder to show updated form
    }
    catch (e) {
      console.error("Error creating resource:", e);
      alert("The resource could not be uploaded, please try again. If the error persists, please contact a system administrator.");
    }
  }

  CreateNewFolder({ name, parentID, accessLevel }) {
    this.app.folders.createFolder({ name, parentID, accessLevel })
    this.populateFolderContents(this.currentFolderID); // Repopulate folder with current folder to show updated form
  }

  async downloadResource(resourceID) {
    try {
      await this.app.resources.downloadResource(resourceID);
    }
    catch (e) {
      console.error("Error downloading resource:", e);
      alert("The resource could not be downloaded, please try again. If the error persists, please contact a system administrator.");
    }
  }

  async editResource(resourceID, resourceUploaderID) {
    if (resourceUploaderID !== this.user.user_id && !this.user.isAdmin) {
      alert("You do not have permission to edit this resource. Only the uploader or an admin can edit it.");
      return;
    }

    const newTitle = prompt("Enter the new title for the resource (leave blank to keep current title):");
    const roles = ['student', 'ranger', 'admin', '']; // Include empty string to allow keeping current access level
    let newAccessLevel = prompt("Enter the new access level for the resource (student, ranger, admin) or leave blank to keep current level:").toLowerCase();

    while (!roles.includes(newAccessLevel)) {
      newAccessLevel = prompt("Invalid access level. Please enter a valid access level (student, ranger, admin) or leave blank to keep current level:").toLowerCase();
    }
    try {
      await this.app.resources.editResource(resourceID, { title: newTitle || undefined, accessLevel: newAccessLevel || undefined });
      this.populateFolderContents(this.currentFolderID); // Repopulate folder with current folder to show updated form
    }
    catch (e) {
      console.error("Error editing resource:", e);
      alert("The resource could not be edited, please try again. If the error persists, please contact a system administrator.");
    }
  }

  async deleteResource(resourceID, resourceUploaderID) {
    if (resourceUploaderID !== this.user.user_id && !this.user.isAdmin) {
      alert("You do not have permission to delete this resource. Only the uploader or an admin can delete it.");
      return;
    }

    const confirmDelete = confirm("Are you sure you want to delete this resource? This action cannot be undone.");
    if (!confirmDelete) {
      return; // User cancelled the deletion
    }
    else {
      try {
        await this.app.resources.deleteResource(resourceID);
        this.populateFolderContents(this.currentFolderID); // Repopulate folder with current folder to show updated form
      }
      catch (e) {
        console.error("Error deleting resource:", e);
        alert("The resource could not be deleted, please try again. If the error persists, please contact a system administrator.");
      }
    }
  }
}

/**
 * Basic page outline. Layout/markup only for now — resource creation and
 * listing logic will be expanded up once the feature is built out.
 */
 
export default class ResourceAddView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
  }

  async mount() {
    const user = this.app.auth.currentUser;
    const canAdd = !user.isStudent;

    let html = `
    <h2>Add a Resource</h2>
    <button data-action="goto-resources">Back to Resources</button>
    `;

    if (canAdd) {
      html += `
        <br/><br/>
        <div class="card">
          <h3>Add Resource</h3>
          <form>
            <label>Title</label><input type="text" id="res-title" name="title" required/>
            <label>Description</label><input type="text" id="res-desc" name="desc"/>
            <label>Type</label>
            <select id="res-type" name="type" required>
              <option value="">Select a type</option>
              <option>Image</option>
              <option>PDF</option>
              <option>Audio</option>
              <option>Video</option>
              <option>Link</option>
            </select>

            <div id="res-input-container">
            </div>

            <input type="submit" value="Add Resource"/>
          </form>
        </div>
      `;
    }

    this.container.innerHTML = html;

    // Listener for return to resource hub button.
    this.container.querySelector('[data-action="goto-resources"]').addEventListener('click', () => this.app.navigate('resources'));

    // Update the resource input fields based on the selected type.
    if (canAdd) {
        const resTypeSelect = this.container.querySelector('#res-type');

        resTypeSelect.addEventListener('change', () => {
          this.updateResourceInput(resTypeSelect.value);
        });
    }

    // Form submission handling
    if (canAdd) {
      const form = this.container.querySelector('form');
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const title = this.container.querySelector('#res-title').value;
        const desc = this.container.querySelector('#res-desc').value;
        const type = this.container.querySelector('#res-type').value;
        let fileRef = null; // Placeholder for file reference after upload.

        if (type === 'Link') {
          const url = this.container.querySelector('#res-url').value;
          const fileRef = 'qilsrp.com/dummy-link-url';
        }
        else if (type === 'Image' || type === 'PDF' || type === 'Audio' || type === 'Video') {
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
            const fileRef = 'qilsrp.com/dummy-file-url'; // Placeholder for file reference after upload.
          }
        }
        this.CreateNewResource({ title, desc, type, fileRef });
      });
    }

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

      case 'Link': //TODO: Sort out how to handle URLs, it's kinda problematic.
          resContainer.innerHTML = `
          <label>URL:</label>
          <input type="text" id="res-url" placeholder="https://..." name="url" required />
          `;
          break;
      }
  }

  CreateNewResource({ type, title, desc, fileRef }) {
    this.app.resources.createResource({type, title, desc, fileRef, uploaderID: this.app.auth.currentUser.id});
    //TODO:
    // Implement logic to create a new resource and save it to the database.
  }

}

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
            <option>Image</option>
            <option>PDF</option>
            <option>Audio</option>
            <option>Video</option>
            <option>Link</option>
          </select>

          <div id="res-input-container">
            <label>URL</label><input type="text" id="res-url" placeholder="https://..." />
          </div>

          <button disabled>Add</button>
        </div>
      `;
    }

    html += '<p>No resources yet.</p>';

    this.container.innerHTML = html;

    if (canAdd) {
        const resTypeSelect = this.container.querySelector('#res-type');

        resTypeSelect.addEventListener('change', () => {
          this.updateResourceInput(resTypeSelect.value);
        });
    }
  }

  updateResourceInput(type) {
      const resContainer = this.container.querySelector('#res-input-container');

      switch (type) {
      case 'Image':
          resContainer.innerHTML = `
          <label>Image File</label>
          <input type="file" id="res-file" accept="image/*" /> <!-- * Accepts any type of image (png, jpg, etc.) -->
          `;
          break;

      case 'PDF':
          resContainer.innerHTML = `
          <label>PDF File</label>
          <input type="file" id="res-file" accept=".pdf" />
          `;
          break;

      case 'Audio':
          resContainer.innerHTML = `
          <label>Audio File</label>
          <input type="file" id="res-file" accept="audio/*" />
          `;
           break;

      case 'Video':
          resContainer.innerHTML = `
          <label>Video File</label>
          <input type="file" id="res-file" accept="video/*" />
          `;
          break;

      case 'Link': //TODO: Sort out how to handle URLs, it's kinda problematic.
          resContainer.innerHTML = `
          <label>URL</label>
          <input type="text" id="res-url" placeholder="https://..." />
          `;
          break;
      }
  }



}

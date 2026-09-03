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
          <label>Name</label><input type="text" id="post-event-name" />
          <label>Date</label><input type="datetime-local" id="post-event-date" />
          <label>Location</label><input type="text" id="post-event-location" />
          <label>Description</label><textarea id="post-event-description" rows="2"></textarea>
          <button data-action="post-event">Add Event</button>
          <p id="post-event-error" class="error-text"></p>
        </div>
      `;
    }
    
    html += `
      <div class="card">
        <h3>Events</h3>
        <table>
          <thead><tr><th>Name</th><th>Date</th><th>Location</th><th>Description</th><th>Confirmed</th></tr></thead>
          <tbody>
          </tbody>
        </table>
      </div>
    `;

    this.container.innerHTML = html;

    const postEventBtn = this.container.querySelector('[data-action="post-event"]');
    if (postEventBtn) postEventBtn.addEventListener('click', () => this.postEvent());
  }

  async postEvent() {
    const name = this.container.querySelector('#post-event-name').value.trim();
    const date = this.container.querySelector('#post-event-date').value.trim();
    const location = this.container.querySelector('#post-event-location').value.trim();
    const description = this.container.querySelector('#post-event-description').value.trim();
    const errorEl = this.container.querySelector('#post-event-error');
    errorEl.style.display = 'none';

    if (!name || !date || !location || !description ) { alert('Name, date, location, and description are required.'); return; }

    try {
      await this.app.event.post(name, date.slice(0, 10) + " " + date.slice(11, 17), location, description);
      await this.mount();
      alert("Event successfully created")
    } catch (error) {
      errorEl.textContent = error.message || 'Creating a new event failed.';
      errorEl.style.display = 'block';
    }
  }
}

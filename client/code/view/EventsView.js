import { escapeHtml } from '../util/dom.js';

export default class EventsView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
  }

  yearFilter = null
  monthFilter = null

  async mount() {
    const user = this.app.auth.currentUser
    const canCreate = user.isAdmin
    const events = await this.app.event.list(this.yearFilter, this.monthFilter)

    let html = '<h2>Events</h2>'

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
        <label>Year</label><input type="number" id="filter-year" />
        <label>Month</label><input type="number" id="filter-month" />
        <button data-action="filter">Filter</button>
        <table>
          <thead><tr><th>Creator</th><th>Name</th><th>Date</th><th>Location</th><th>Description</th><th>Confirmed</th><th>Action</th></tr></thead>
          <tbody>
            ${events.map(event => `
              <tr event-id="${escapeHtml(event.event_id)}">
              <td>${escapeHtml(event.user)}</td>
              <td>${escapeHtml(event.name)}</td>
              <td>${escapeHtml(event.datetime)}</td>
              <td>${escapeHtml(event.location)}</td>
              <td>${escapeHtml(event.description)}</td>
              <td>${escapeHtml(event.confirmed)}</td>
                <td>
                  ${event.user_id == user.user_id ? `<button data-action="edit-event" event-id="${escapeHtml(event.event_id)}">Edit</button>` : ""}
                  ${event.user_id == user.user_id ? `<button data-action="delete-event" event-id="${escapeHtml(event.event_id)}">Delete</button>` : ""}
                  ${!event.confirmed ? `<button data-action="confirm-user" data-email="${escapeHtml(event.email)}">Confirm</button>` : ""}
                </td>
              </tr>
            `).join('')}
           </tbody>
        </table>
      </div>
    `;

    this.container.innerHTML = html;

    const postEventBtn = this.container.querySelector('[data-action="post-event"]');
    if (postEventBtn) postEventBtn.addEventListener('click', () => this.postEvent());

    const filterBtn = this.container.querySelector('[data-action="filter"]');
    if (filterBtn) filterBtn.addEventListener('click', () => this.filterEvents());

  }

  async postEvent() {
    const name = this.container.querySelector('#post-event-name').value.trim();
    const date = this.container.querySelector('#post-event-date').value.trim();
    const location = this.container.querySelector('#post-event-location').value.trim();
    const description = this.container.querySelector('#post-event-description').value.trim();
    const errorEl = this.container.querySelector('#post-event-error');
    errorEl.style.display = 'none';

    if (!name || !date || !location || !description) { alert('Name, date, location, and description are required.'); return; }

    try {
      await this.app.event.post(name, date.slice(0, 10) + " " + date.slice(11, 17), location, description);
      await this.mount();
      alert("Event successfully created")
    } catch (error) {
      errorEl.textContent = error.message || 'Creating a new event failed.';
      errorEl.style.display = 'block';
    }
  }

  async filterEvents() {
    this.yearFilter = this.container.querySelector('#filter-year').value.trim();
    this.monthFilter = this.container.querySelector('#filter-month').value.trim();
    await this.mount();
  }
}

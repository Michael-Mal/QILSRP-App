import { escapeHtml } from '../util/dom.js';

export default class EventsView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
  }

  yearFilter = null
  monthFilter = null

  event_id = null

  nameFilter = null
  emailFilter = null
  cohortFilter = null
  roleFilter = null

  async mount() {
    const user = this.app.auth.currentUser

    if (!this.event_id) {
      const events = await this.app.event.list(this.yearFilter, this.monthFilter)

      let html = '<h2>Events</h2>'

      if (user.isAdmin) {
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
              <tr data-id="${escapeHtml(event.event_id)}">
              <td>${escapeHtml(event.user)}</td>
              <td>${escapeHtml(event.name)}</td>
              <td>${escapeHtml(event.datetime)}</td>
              <td>${escapeHtml(event.location)}</td>
              <td>${escapeHtml(event.description)}</td>
              <td>${escapeHtml(event.confirmed)}</td>
                <td>
                  ${event.user_id == user.user_id ? `<button data-action="edit-event" data-id="${escapeHtml(event.event_id)}">Edit</button>` : ""}
                  ${event.user_id == user.user_id ? `<button data-action="delete-event" data-id="${escapeHtml(event.event_id)}">Delete</button>` : ""}
                  ${!event.confirmed ? `<button data-action="confirm-user" data-id="${escapeHtml(event.event_id)}">Confirm</button>` : ""}
                  <button data-action="member" data-id="${escapeHtml(event.event_id)}">Members</button>
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

      this.container.querySelectorAll('[data-action="edit-event"]').forEach(button => {
        button.addEventListener('click', () => this.editEvent(button.dataset.id));
      });

      this.container.querySelectorAll('[data-action="delete-event"]').forEach(button => {
        button.addEventListener('click', () => this.deleteEvent(button.dataset.id));
      });

      this.container.querySelectorAll('[data-action="member"]').forEach(button => {
        button.addEventListener('click', () => this.showMembers(button.dataset.id));
      });

    }
    else {
      // Member management
      if (!user.isAdmin) { // CHANGE THIS 
        this.container.innerHTML = '<p>Access denied.</p>';
        return;

      }

      const [members, users] = await Promise.all([
        this.app.users.list(this.nameFilter, this.emailFilter, null, this.cohortFilter, this.roleFilter),
        this.app.users.list(this.nameFilter, this.emailFilter, null, this.cohortFilter, this.roleFilter),

      ]);

      this.container.innerHTML = `
      <div class="card">
        <h3>Invite Users</h3>
        <label>Name</label><input type="text" id="fil-name" />
        <label>Email</label><input type="text" id="fil-email" />
        <label>Cohort</label><input type="text" id="fil-cohort" />
        <label>Role</label><input type="text" id="fil-role" />
        <button data-action="filter">Filter</button>
        <br>
        ${users.map(u => `
          <input type="checkbox" id="${escapeHtml(u.email)}" name="${escapeHtml(u.email)}" value="${escapeHtml(u.email)}">
          <label for="${escapeHtml(u.email)}" style="display:inline;">${escapeHtml(u.name)} (${escapeHtml(u.role || '-')}) - ${escapeHtml(u.email)}</label><br>
        `).join('')}
      </div>
      <button data-action="back">Back</button>
      `;

      const filterBtn = this.container.querySelector('[data-action="filter"]');
      if (filterBtn) filterBtn.addEventListener('click', () => this.filterUsers());

      const backBtn = this.container.querySelector('[data-action="back"]');
      if (backBtn) backBtn.addEventListener('click', () => this.back());
    }
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

  async editEvent(event_id) {
    const name = prompt('New name for this event:');
    if (!name) return;
    const datetime = prompt('Updated date for this event in YYYY-MM-DD HH:MM format:');
    if (!datetime) return;
    const location = prompt('Updated location for this event:');
    if (!location) return;
    const description = prompt('Updated description for this event:');
    if (!description) return;

    try {
      await this.app.event.update(event_id, { name, datetime, location, description });
      await this.mount();
      alert("Event successfully updated")

    } catch (error) {
      alert(error.message || 'Creating a new event failed.')

    }

  }

  async deleteEvent(id) {
    if (!confirm(`Delete event ${id}? This cannot be undone.`)) return;
    await this.app.event.remove(id);
    await this.mount();

  }

  async showMembers(id) {
    this.event_id = id
    await this.mount()
  }

  async filterUsers() {
    this.nameFilter = this.container.querySelector('#fil-name').value.trim();
    this.emailFilter = this.container.querySelector('#fil-email').value.trim();
    this.cohortFilter = this.container.querySelector('#fil-cohort').value.trim();
    this.roleFilter = this.container.querySelector('#fil-role').value.trim();
    await this.mount();
  }

  async back() {
    this.event_id = null
    await this.mount()
  }
}

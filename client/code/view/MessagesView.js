import { escapeHtml } from '../util/dom.js';

export default class MessagesView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
  }

  async mount() {
    const user = this.app.auth.currentUser;
    const cohorts = await this.app.cohorts.listForUser(user);

    const sections = await Promise.all(cohorts.map(async cohort => {
      const messages = await this.app.messages.listForCohort(cohort.id);
      return `
        <div class="card" data-cohort-id="${cohort.id}">
          <h3>${escapeHtml(cohort.name)}</h3>
          <div class="msg-list">
            ${messages.map(m => `<div class="msg"><strong>${escapeHtml(m.sender)}:</strong> ${escapeHtml(m.text)}</div>`).join('') || '<i>No messages.</i>'}
          </div>
          <div class="msg-input-row">
            <input type="text" data-cohort-input="${cohort.id}" placeholder="Type a message..." />
            <button data-action="send-message" data-id="${cohort.id}">Send</button>
          </div>
        </div>
      `;
    }));

    this.container.innerHTML = `<h2>Messages</h2>${sections.join('') || '<p>No cohorts available.</p>'}`;

    this.container.querySelectorAll('[data-action="send-message"]').forEach(button => {
      button.addEventListener('click', () => this.sendMessage(Number(button.dataset.id)));
    });
  }

  async sendMessage(cohortId) {
    const input = this.container.querySelector(`[data-cohort-input="${cohortId}"]`);
    const text = input.value.trim();
    if (!text) return;

    const user = this.app.auth.currentUser;
    await this.app.messages.send(cohortId, user.name, text);
    await this.mount();
  }
}

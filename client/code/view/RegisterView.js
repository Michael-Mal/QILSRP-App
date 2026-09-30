import { escapeHtml } from '../util/dom.js';

export default class RegisterView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
  }
  async mount() {

    this.container.innerHTML = `
      <h2>Registration</h2>

      <div class="card">
        <h3>Register</h3>
        <label>Name</label><input type="text" id="reg-name" />
        <label>Email</label><input type="text" id="reg-email" />
        <label>and/or Mobile</label><input type="text" id="reg-mobile" />
        <label>Password</label><input type="password" id="reg-password" />
        <label>Cohort</label><input type="text" id="reg-cohort" />
        <button data-action="register-user">Send</button>
        <p id="reg-error" class="error-text"></p>
      </div>
    `;

    const registerBtn = this.container.querySelector('[data-action="register-user"]');
    if (registerBtn) registerBtn.addEventListener('click', () => this.registerUser());
  }

  async registerUser() {
    const name = this.container.querySelector('#reg-name').value.trim();
    const email = this.container.querySelector('#reg-email').value.trim();
    const mobile = this.container.querySelector('#reg-mobile').value.trim();
    const password = this.container.querySelector('#reg-password').value.trim();
    const cohort = this.container.querySelector('#reg-cohort').value.trim();
    const errorEl = this.container.querySelector('#reg-error');
    errorEl.style.display = 'none';

    if (!name || !password || !cohort) { alert('Name, password, and cohort are required.'); return; }
    if (!email && !mobile) { alert('Email or mobile is required.'); return; }

    try {
      await this.app.auth.register({ name, email, mobile, password, cohort, role: "ranger", auth: false });
      await this.mount();
      alert("Registration sent. Please wait for an administrator to verify your details.");
    } catch (error) {
      errorEl.textContent = error.message || 'Registration failed.';
      errorEl.style.display = 'block';
    }
  }
}

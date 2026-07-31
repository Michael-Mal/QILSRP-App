export default class LoginView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.emailInput = container.querySelector('#login-email');
    this.passwordInput = container.querySelector('#login-password');
    this.errorEl = container.querySelector('#login-error');
    this.submitBtn = container.querySelector('#login-submit');
  }

  mount() {
    this.submitBtn.addEventListener('click', () => this.submit());
  }

  async submit() {
    const email = this.emailInput.value.trim();
    const password = this.passwordInput.value.trim();
    this.errorEl.style.display = 'none';

    try {
      await this.app.auth.login(email, password);
      await this.app.showApp();
    } catch (error) {
      this.errorEl.textContent = error.message || 'Invalid email or password.';
      this.errorEl.style.display = 'block';
    }
  }

  reset() {
    this.emailInput.value = '';
    this.passwordInput.value = '';
    this.errorEl.style.display = 'none';
  }
}

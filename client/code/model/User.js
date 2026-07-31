export default class User {
  constructor({ name, email, role, status, created } = {}) {
    this.name = name;
    this.email = email;
    this.role = role;
    this.status = status;
    this.created = created;
  }

  hasRole(role) {
    return (this.role || '').toLowerCase() === role.toLowerCase();
  }

  get isAdmin() {
    return this.hasRole('admin');
  }

  get isRanger() {
    return this.hasRole('ranger');
  }

  get isStudent() {
    return this.hasRole('student');
  }
}

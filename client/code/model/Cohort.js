export default class Cohort {
  constructor({ id, name, rangerName, members = [] } = {}) {
    this.id = id;
    this.name = name;
    this.rangerName = rangerName;
    this.members = members;
  }

  hasMember(email) {
    return this.members.includes(email);
  }
}

export default class Event {
  constructor({ name, datetime, location, description } = {}) {
    this.name = name;
    this.datetime = datetime;
    this.location = location
    this.description = description;
  }
}

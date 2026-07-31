export default class Message {
  constructor({ id, cohortId, sender, text, sentAt = null } = {}) {
    this.id = id;
    this.cohortId = cohortId;
    this.sender = sender;
    this.text = text;
    this.sentAt = sentAt ?? new Date().toISOString();
  }
}

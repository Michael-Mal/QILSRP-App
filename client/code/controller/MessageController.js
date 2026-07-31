import Message from '../model/Message.js';
import LocalRepository from '../util/LocalRepository.js';

const SEED = [
  { id: 1, cohortId: 1, sender: 'Sarah Ranger', text: 'Welcome to the cohort chat!', sentAt: new Date().toISOString() },
];

export default class MessageController {
  constructor() {
    this.repo = new LocalRepository('qilsrp.messages', SEED);
  }

  async listForCohort(cohortId) {
    const rows = await this.repo.all();
    return rows
      .filter(row => row.cohortId === cohortId)
      .map(row => new Message(row));
  }

  async send(cohortId, sender, text) {
    const row = await this.repo.insert({ cohortId, sender, text, sentAt: new Date().toISOString() });
    return new Message(row);
  }
}

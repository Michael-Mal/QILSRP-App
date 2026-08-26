import Cohort from '../model/Cohort.js';
import LocalRepository from '../util/LocalRepository.js';

const SEED = [
  { id: 1, name: 'Cohort A - Brisbane North', rangerName: 'Sarah Ranger', members: ['student1@email.com'] },
  { id: 2, name: 'Cohort B - Cairns', rangerName: 'Sarah Ranger', members: [] },
];

/**
 * The server does not yet expose cohort endpoints, so this controller reads
 * and writes to a browser-persisted repository instead. Its public methods
 * mirror what a REST-backed controller would look like so it can be swapped
 * out later without changing any view.
 */
export default class CohortController {
  constructor(apiClient) {
    this.repo = new LocalRepository('qilsrp.cohorts', SEED);
    this.api = apiClient;
  }

  async list() {
    const rows = await this.api.get('/cohort/', { auth: true });
    rows.forEach(row => {
      row.name = row.cohort
    });
    return rows.map(row => new Cohort(row));
  }

  async listForUser(user) {
    if (!user.isAdmin) {
      return [{ name: user.cohort }];
    }

    const all = await this.list();
    return all;
  }

  async create({ name, rangerName }) {
    const row = await this.repo.insert({ name, rangerName, members: [] });
    return new Cohort(row);
  }

  async addMember(cohortId, email) {
    const cohort = await this.repo.find(cohortId);
    if (!cohort) throw new Error('Cohort not found');
    const members = cohort.members.includes(email) ? cohort.members : [...cohort.members, email];
    const row = await this.repo.update(cohortId, { members });
    return new Cohort(row);
  }
}

import Resource from '../model/Resource.js';
import LocalRepository from '../util/LocalRepository.js';

const SEED = [
{ id: 1, type: 'image', title: 'Welcome to QILSRP!', desc: 'Took a celebratory photo for the launch of the QILSRP',
uploaderID: 2, creationDate: new Date().toISOString(), fileURL: 'qilsrp.com/dummy-url'},
]

export default class ResourceController {
  constructor() {
    this.repo = new LocalRepository('qilsrp.resources', SEED);
  }

  /// Gets and returns a list of all resources
  async getRows() {
  const rows = await this.repo.all();
  return rows;
  }

  /// Passes a Resources info through to the repo and creates a new Resource object.
  /// Likely needs to be reworked for each resource type, as they will have different attributes.
  async create(resourceInfo) {
  const row = await this.repo.insert(resourceInfo);
  return new Resource(row);
  }


}

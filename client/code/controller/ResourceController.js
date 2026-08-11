import Resource from '../model/Resource.js';
import LocalRepository from '../util/LocalRepository.js';

const SEED = [
{ id: 1, type: 'image', title: 'Welcome to QILSRP!', desc: 'Took a celebratory photo for the launch of the QILSRP',
uploaderID: 2, fileRef: 'qilsrp.com/dummy-url', creationDate: new Date().toISOString()},
{ id: 2, type: 'video', title: 'Welcome to QILSRP!', desc: 'Took a celebratory video for the launch of the QILSRP',
uploaderID: 2, fileRef: 'qilsrp.com/dummy-url', creationDate: new Date().toISOString()}
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

  /// Gets and returns a list of all resources as Resource objects
  async getAllResources() {
  const rows = await this.repo.all();
  return rows.map(row => new Resource(row));
  }

  /// Passes a Resources info through to the repo and creates a new Resource object.
  /// Likely needs to be reworked for each resource type, as they will have different attributes.
  async createResource({type, title, desc, fileRef, uploaderID}) {
  const row = await this.repo.insert({ type, title, desc, uploaderID, fileRef, creationDate: new Date().toISOString()});
  try {
    return new Resource(row);
  } catch (error) {
    console.error("Error creating resource:", error);
    throw error;
  }
  }
}
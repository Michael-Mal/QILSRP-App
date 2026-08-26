import Resource from '../model/Resource.js';

export default class ResourceController {
  constructor(apiClient) {
    this.api = apiClient;
  }

  /**
   * Gets a Resource object from the database using the resource's id as a reference. TODO: Test this.
   * @param {int} resourceID 
   * @returns Resource object containing the info of the specified resource
   */
  async getResource(resourceID)
  {
    const resource =  await this.api.get(`/resource/${resourceID}`, {auth: true});
    return new Resource(resource)
  }

  /**
   * Creates a new Resource in the database
   * @param {*} param0 - Object contiaing relevant Resource Info
   * @returns 
   */
  async createResource({type, title, fileRef, parentID, accessLevel}) {
    return this.api.post('/resource/create', { type, title, fileRef, parentID, accessLevel }, { auth: true });
  }
}
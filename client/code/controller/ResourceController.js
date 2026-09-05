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
   * Creates a new Resource in the database and returns a presigned URL for uploading the resource file to S3. The file must be uploaded to the returned URL before the resource can be used.
   * @param {*} param0 - Object contiaing relevant Resource Info
   * @returns The presigned URL for uploading the resource file and the ID of the newly created resource in the database
   */
  async createResource({type, title, extension, mimeType, parentID, accessLevel, file}) {
    try {
      const response = await this.api.post('/resource/create', { type, title, extension, mimeType, parentID, accessLevel }, { auth: true });
      const uploadURL = response.uploadURL;
      const resourceID = response.resourceID;

      const uploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        headers: {
          'Content-Type': mimeType
        },
        body: file, // Upload the selected file to S3 using the presigned URL
      });

      if (!uploadResponse.ok) {
        // TEMP
        const errorBody = await uploadResponse.text();

        console.error('S3 upload failed:', {
          status: uploadResponse.status,
          headers: [...uploadResponse.headers.entries()],
          body: errorBody
        });

        throw new Error(`S3 upload failed (${uploadResponse.status})`);

        // END TEMP
        throw new Error('Failed to upload file to S3');
      }

      await this.app.resources.completeResource(resourceID);
      this.populateFolderContents(this.currentFolderID); // Repopulate folder with current folder to show updated form
    }
    catch (e) {
      console.error("Error creating resource:", e);
    }    
    return;
  }

  /**
   * Marks a resource as complete after its file has been uploaded to S3.
   * @param {int} resourceID 
   * @returns A promise resolving to the result of the update operation
   */
  async completeResource(resourceID) {
    return await this.api.put(`/resource/${resourceID}/complete`, {}, { auth: true });
  }
}
const SUPPORTED_TYPES = ['video', 'audio', 'image', 'link', 'pdf']

/**
* Base Resource class that will cover any type of resource uploaded to the hub.
* Will most likely have several classes extending it for different resource types in the future.
*/
export default class Resource {
  constructor({ id, type, title, desc, uploaderID, creationDate = null } = {}) {
    if (!SUPPORTED_TYPES.includes(type)) {
        throw new ResTypeError("Resource type is not supported");
    }
    this.id = id; // TODO: Find what ID to set from db?
    this.type = type.toLowerCase(); // type of resource (video, audio, image, link, etc.).
    this.title = title;
    this.desc = desc; // TODO: Add character limits for title and description
    this.uploaderID = uploaderID;
    this.creationDate = creationDate ?? new Date().toISOString();
    this.fileURL = fileURL;
    //TODO: Add more properties for general resources that allow for better filtering? Tags?
    // Or implement a separate filtering system with resourceIDs and tags.
  }

  get resTitle() {
  return this.title;
  }

  get resType() {
  return this.type;
  }

  isType(type) {
    return (this.type || '').toLowerCase() === type.toLowerCase();
  }

  get isVideo() {
    return this.isType('video');
  }

  get isAudio() {
    return this.isType('audio');
  }

  get isImage() {
    return this.isType('image');
  }

  get isLink() {
    return this.isType('link');
  }

  get isPDF() {
    return this.isType('pdf');
  }

  get fileURL() {
    return this.fileURL;
  }
}
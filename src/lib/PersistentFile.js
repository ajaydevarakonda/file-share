import { requestFileSystem, createFile, errorHandler } from "./utils";

export default class PersistentFile {
  constructor(filename, filesize) {
    this.filename = filename;
    this.filesize = filesize;
    this.receivedData = [];

    this.fs = null;
    this.file = null;
  }

  async init() {
    try {
      this.fs = await requestFileSystem(this.filesize);
      this.file = await createFile(this.fs, this.filename);
    }
    catch (err) {
      errorHandler(err);
    }
  }

  async append(data) {
    try {
      // if no data, then we'll flush existing buffer.
      if (data) {
        this.receivedData.push(data);
      }

      // if not inited, just building up our buffer.
      if (!this.fs || !this.file) {
        console.warn("File not initialized!");
        return false;
      }

      // if initialized, append.
      return new Promise((resolve, reject) => {
        this.file.createWriter((fileWriter) => {
          const blob = new Blob(this.receivedData);

          // Start write position at EOF.
          fileWriter.seek(fileWriter.length); 
          fileWriter.write(blob);
          this.receivedData = [];

          resolve();
        }, reject);
      });  
    } catch (err) {
      errorHandler(err);
    }
  }

  async flush() {
    if (this.receivedData.length > 0) {
      // try to flush
      const didAppend = await this.append();

      if (didAppend) {
        return true;
      }

      // if could not append then, keep calling flush.
      window.setTimeout(() => {
        this.flush();        
      }, 500);
    }
  }
}

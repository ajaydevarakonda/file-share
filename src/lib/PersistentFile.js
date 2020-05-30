import { requestFileSystem, createFile, errorHandler } from "./utils";
import StreamSaver from "streamsaver";

export default class PersistentFile {
  constructor(filename, filesize) {
    this.filename = filename;
    this.filesize = filesize;
    this.receivedData = [];

    // this.fs = null;
    // this.file = null;
    this.fileStream = null;
    this._fileStreamWriter = null;
  }

  get fileStreamWriter() {
    if (!this.fileStream) {
      console.warn("File stream not initialized!");
      return;
    }

    if (!this._fileStreamWriter) {
      this._fileStreamWriter = this.fileStream.getWriter();
    }

    return this._fileStreamWriter;
  }

  get receivedStreamReader() {
    const blob = new Blob(this.receivedData)
    const readableStream = blob.stream();
    return readableStream.getReader()
  }

  async init() {
    try {
      // this.fs = await requestFileSystem(this.filesize);
      // this.file = await createFile(this.fs, this.filename);

      this.fileStream = StreamSaver.createWriteStream(this.filename, {
        size: this.filesize
      });
    }
    catch (err) {
      errorHandler(err);
    }
  }

  async append(data) {
    try {
      // flush with call append with no data, then we just write, what's in there.
      if (data) {
        this.receivedData.push(data);
      }

      // if not inited, just building up our buffer.
      if (!this.fileStream) {
        console.warn("File not initialized!");
        return false;
      }

      // no received data, nothing to do.
      if (!this.receivedData.length) {
        return true;
      }

      // if initialized, append.
      // we cannot use received data as is.
      const receivedData = await this.receivedStreamReader.read();
      await this.fileStreamWriter.write(receivedData);
      console.log("Wrote received")
      this.receivedData = [];

      return true;
    } catch (err) {
      console.error(err.message);
      throw err;
    }
  }

  /**
   * Should be called at the end of file appends.
   */
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

  close() {
    console.log("Closing file writer")
    this.fileStreamWriter.close();
  }
}

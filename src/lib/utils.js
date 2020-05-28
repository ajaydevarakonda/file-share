export async function requestFileSystem(filesize) {
  return new Promise((resolve, reject) => {
    window.requestFileSystem =
      window.requestFileSystem || window.webkitRequestFileSystem;

    window.requestFileSystem(
      window.TEMPORARY,
      filesize,
      resolve,
      reject
    );
  });
}

export async function createFile(fs, filename) {
  return new Promise((resolve, reject) => {
    fs.root.getFile(filename, { create: true, exclusive: true }, resolve, reject);
  });
}

export function errorHandler(e) {
  // NOTE: until we figure out how to import FileError, this function will be a facade.

  // var msg = '';

  // switch (e.code) {
  //   case FileError.QUOTA_EXCEEDED_ERR:
  //     msg = 'QUOTA_EXCEEDED_ERR';
  //     break;
  //   case FileError.NOT_FOUND_ERR:
  //     msg = 'NOT_FOUND_ERR';
  //     break;
  //   case FileError.SECURITY_ERR:
  //     msg = 'SECURITY_ERR';
  //     break;
  //   case FileError.INVALID_MODIFICATION_ERR:
  //     msg = 'INVALID_MODIFICATION_ERR';
  //     break;
  //   case FileError.INVALID_STATE_ERR:
  //     msg = 'INVALID_STATE_ERR';
  //     break;
  //   default:
  //     msg = 'Unknown Error';
  //     break;
  // };

  // throw new Error('Error: ' + msg);
  throw e;
}

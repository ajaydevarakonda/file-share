/**
 * Filespace to store huge files.
 */
export async function request_file_space(fileSpaceInMb = 1) {
  return new Promise((resolve, reject) => {
    window.requestFileSystem =
      window.requestFileSystem || window.webkitRequestFileSystem;

    window.requestFileSystem(
      window.TEMPORARY,
      fileSpaceInMb * 1024 * 1024,
      resolve,
      reject
    );
  });
}
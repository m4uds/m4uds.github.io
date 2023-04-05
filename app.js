//play/here/test does not work consult 

function app() {
  console.log("SFS");
  let files = [];

  async function loadFiles() {
    try {
      const response = await fetch('file_map.json');
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      files = await response.json();
    } catch (error) {
      console.error('Error fetching file_map.json:', error);
    }
  }

  function listFilesInDir(dir) {
    const prefix = dir ? `${dir}/` : '';
    return files.filter((filePath) => filePath.startsWith(prefix));
  }

  function buildTableForDir(dir) {
    const fileTable = document.getElementById("file-table");
    fileTable.innerHTML = '';
  
    const filePaths = listFilesInDir(dir);
    const filteredFilePaths = filePaths.filter(
      (path) => !['file_map.json', 'map_dir.py', 'app.js', 'index.html', 'style.css'].includes(path)
    );
  
    const uniqueDirs = new Set();
  
    filteredFilePaths.forEach(async (path) => {
      const parts = path.split('/');
      const isDir = parts.length > (dir ? 2 : 1);
      const fileName = isDir ? parts[dir ? 1 : 0] : parts[dir ? 1 : 0];
  
      if (isDir && uniqueDirs.has(fileName)) {
        return;
      }
      if (isDir) {
        uniqueDirs.add(fileName);
      }
  
      const newRow = fileTable.insertRow(-1);
      const anchor = document.createElement('a');
      anchor.textContent = fileName;
  
      if (isDir) {
        anchor.href = `javascript:changeDir('${dir ? dir + '/' : ''}${fileName}')`;
      } else {
        anchor.href = path;
      }
  
      newRow.insertCell(0).appendChild(anchor);
      newRow.insertCell(1).textContent = '';
      newRow.insertCell(2).textContent = '';
  
      if (!isDir) {
        newRow.insertCell(3).textContent = await getFileModifiedDate(path);
        newRow.insertCell(4).textContent = await getFileSize(path);
      } else {
        newRow.insertCell(3).textContent = '';
        newRow.insertCell(4).textContent = '';
      }
    });
  
    const navigation = document.getElementById("navigation");
    navigation.innerHTML = `<a href="javascript:changeDir('')">database</a>`;
    if (dir) {
      const parts = dir.split('/');
      let path = '';
      for (let i = 0; i < parts.length; i++) {
        path += (i > 0 ? '/' : '') + parts[i];
        navigation.innerHTML += ` / <a href="javascript:changeDir('${path}')">${parts[i]}</a>`;
      }
    }
  }
  function changeDir(dir) {
    buildTableForDir(dir);
  }

  // Expose the changeDir function as a global function
  window.changeDir = changeDir;

  document.addEventListener("DOMContentLoaded", async () => {
    await loadFiles();
    buildTableForDir(''); // Start with the root directory
  });
async function getFileModifiedDate(path) {
    try {
      const response = await fetch(path, { method: 'HEAD' });
  
      if (response.ok) {
        const lastModified = new Date(response.headers.get('Last-Modified'));
        const formattedDate = lastModified.toLocaleString('en-US', {
          timeZone: 'UTC',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        return formattedDate;
      } else {
        throw new Error(`Failed to get file last modified date: ${response.status}`);
      }
    } catch (error) {
      throw error;
    }
  }
  


  async function getFileSize(path) {
    try {
      const response = await fetch(path, { method: 'HEAD' });
  
      if (response.ok) {
        const size = parseInt(response.headers.get('Content-Length'), 10);
        return formatFileSize(size);
      } else {
        throw new Error(`Failed to get file size: ${response.status}`);
      }
    } catch (error) {
      throw error;
    }
  }
  
  function formatFileSize(size) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const index = Math.floor(Math.log(size) / Math.log(1024));
    const newSize = size / Math.pow(1024, index);
    return `${newSize.toFixed(2)} ${units[index]}`;
  }
}



app()


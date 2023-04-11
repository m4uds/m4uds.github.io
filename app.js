function getIconEmoji(path) {
  if (path.endsWith('/')) {
    return '📁';
  } else if (path.match(/\.(jpg|jpeg|png|gif|svg|bmp|tiff|webp|ico)$/i)) {
    return '🖼️';
  } else if (path.match(/\.(mp4|mov|avi|mkv|wmv|mpg|mpeg|webm|flv|3gp)$/i)) {
    return '🎞️';
  } else if (path.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|md)$/i)) {
    return '📄';
  } else if (path.match(/\.(mp3|wav|ogg|flac|aac|m4a)$/i)) {
    return '🎵';
  } else if (path.match(/\.(zip|rar|7z|tar|gz|bz2)$/i)) {
    return '🗜️';
  } else if (path.match(/\.(js|css|html|xml|json|py|php|rb|java|cpp|cs|go|r|swift|yml|yaml|ini|conf|properties|log)$/i)) {
    return '📜';
  } else if (path.match(/\.(ttf|otf|woff|woff2|eot)$/i)) {
    return '🔤';
  } else {
    return '📦';
  }
}

function app() {
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
    const filePaths = files.filter((filePath) => {
      // Remove .git directory
      if (filePath.startsWith('.git/')) return false;

      // Check if the file path starts with the prefix
      if (!filePath.startsWith(prefix)) return false;

      // Remove unwanted files
      const relativePath = filePath.slice(prefix.length);
      return !['file_map.json', 'map_dir.py', 'app.js', 'index.html', 'style.css',".DS_Store"].includes(relativePath);
    });

    const uniqueDirs = new Set();
    filePaths.forEach((path) => {
      const relativePath = dir ? path.slice(`${dir}/`.length) : path;
      const parts = relativePath.split('/');
      const isFolder = parts.length > 1;
      if (isFolder) {
        uniqueDirs.add(parts[0]);
      }
    });

    return filePaths.filter((path) => {
      const relativePath = dir ? path.slice(`${dir}/`.length) : path;
      const parts = relativePath.split('/');
      const isFolder = parts.length > 1;
      if (isFolder) {
        return uniqueDirs.has(parts[0]);
      } else {
        return true;
      }
    });
  }
  

  function buildTableForDir(dir) {
    const fileTable = document.getElementById("file-table");
    fileTable.innerHTML = '';
  
    const filePaths = listFilesInDir(dir);
  
    const uniqueDirs = new Set();
  
    filePaths.forEach(async (path) => {
      const relativePath = dir ? path.slice(`${dir}/`.length) : path;
      const parts = relativePath.split('/');
      const isDir = parts.length > 1;
      const fileName = parts[0];
  
      if (isDir && uniqueDirs.has(fileName)) {
        return;
      }
      if (isDir) {
        uniqueDirs.add(fileName);
      }
  
      const newRow = fileTable.insertRow(-1);
      const anchor = document.createElement('a');
      anchor.textContent = fileName;
  
      const icon = document.createElement('span');
      icon.textContent = isDir ? getIconEmoji(`${fileName}/`) : getIconEmoji(path);
      icon.style.marginRight = '8px';
  
      if (isDir) {
        anchor.href = `javascript:changeDir('${dir ? dir + '/' : ''}${fileName}')`;
      } else if (path.endsWith('.mp4')) {
        anchor.href = `javascript:playVideo('${path}')`;
      } else {
        anchor.href = path;
        anchor.target = '_blank'; // Open non-video files in a new tab
      }
  
      const cell = newRow.insertCell(0);
      cell.appendChild(icon);
      cell.appendChild(anchor);
  
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
    navigation.innerHTML = `<a href="javascript:changeDir('')">m4uds</a>`;
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

function playVideo(videoUrl) {
  const videoContainer = document.createElement('div');
  videoContainer.style.position = 'fixed';
  videoContainer.style.top = '0';
  videoContainer.style.left = '0';
  videoContainer.style.width = '100%';
  videoContainer.style.height = '100%';
  videoContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  videoContainer.style.display = 'flex';
  videoContainer.style.justifyContent = 'center';
  videoContainer.style.alignItems = 'center';
  videoContainer.style.zIndex = '1000';

  const video = document.createElement('video');
  video.src = videoUrl;
  video.controls = true;
  video.style.maxWidth = '90%';
  video.style.maxHeight = '90%';

  videoContainer.appendChild(video);
  document.body.appendChild(videoContainer);

  // Close the video container when the video ends or when clicked outside the video
  video.addEventListener('ended', () => {
    document.body.removeChild(videoContainer);
  });

  videoContainer.addEventListener('click', (event) => {
    if (event.target === videoContainer) {
      document.body.removeChild(videoContainer);
    }
  });
}
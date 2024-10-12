
function createNotification(title, message) {
  const options = {
    type: 'basic',
    iconUrl: '../img/icon128.png',
    title: title,
    message: message,
  };

  chrome.notifications.create(undefined, options);
}

// Event listener for installation and updates
chrome.runtime.onInstalled.addListener(details => {
  const manifestData = chrome.runtime.getManifest();
  let message;

  if (details.reason === 'install') {
    message = `Thank you for installing ${manifestData.name}`;
  } else if (details.reason === 'update') {
    message = `${manifestData.name} has been updated to version ${manifestData.version}`;
  }

  createNotification(manifestData.name, message);
});


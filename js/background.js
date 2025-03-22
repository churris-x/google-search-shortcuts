// Given the whole debacle with Manifest V3 background.Service_Worker
// not working as expected (see https://github.com/mozilla/web-ext/issues/2532)
// I need to change what runs the onInstalled callback
// Chrome AND Firefox needs to get their shit together ffs

const engine = typeof browser !== "undefined" ? browser : chrome

function createNotification(title, message) {
  const options = {
    type: 'basic',
    iconUrl: '../img/icon128.png',
    title: title,
    message: message,
  };

  engine.notifications.create(undefined, options);
}

// Event listener for installation and updates
engine.runtime.onInstalled.addListener(details => {
  const manifestData = engine.runtime.getManifest();
  let message;

  if (details.reason === 'install') {
    message = `Thank you for installing ${manifestData.name}`;
  } else if (details.reason === 'update') {
    message = `${manifestData.name} has been updated to version ${manifestData.version}`;
  }

  createNotification(manifestData.name, message);
});


// Background script - Main entry point
let rpcClient;
let walletManager;
let messageHandler;

// Initialize on startup
async function initialize() {
  console.log('Initializing ZClassic Wallet extension...');
  
  // Load RPC configuration
  const config = await browser.storage.local.get(['rpcConfig']);
  const rpcConfig = config.rpcConfig || {
    host: 'localhost',
    port: 8232,
    username: '',
    password: ''
  };
  
  // Create RPC client
  rpcClient = new ZClassicRPC(rpcConfig);
  
  // Create wallet manager
  walletManager = new WalletManager(rpcClient);
  await walletManager.initialize();
  await walletManager.loadConnectedSites();
  
  // Create message handler
  messageHandler = new MessageHandler(walletManager);
  
  console.log('ZClassic Wallet extension initialized');
}

// Message listener
browser.runtime.onMessage.addListener((message, sender) => {
  return messageHandler.handleMessage(message, sender);
});

// Icon click listener
browser.browserAction.onClicked.addListener(() => {
  browser.browserAction.openPopup();
});

// Initialize on install
browser.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('Extension installed, opening setup...');
    browser.runtime.openOptionsPage();
  }
  
  await initialize();
});

// Initialize on startup
browser.runtime.onStartup.addListener(async () => {
  await initialize();
});

// Initialize now
initialize();

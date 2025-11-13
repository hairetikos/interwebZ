// Popup UI controller
class PopupController {
  constructor() {
    this.currentAccount = null;
    this.balance = { transparent: 0, shielded: 0 };
    this.isShielded = false;
    
    this.init();
  }
  
  async init() {
    await this.loadState();
    this.attachEventListeners();
    this.updateUI();
    this.checkConnection();
    this.startAutoRefresh();
  }
  
  async loadState() {
    const state = await browser.storage.local.get(['currentAccount', 'isShielded']);
    this.currentAccount = state.currentAccount;
    this.isShielded = state.isShielded || false;
  }
  
  attachEventListeners() {
    // Settings
    document.getElementById('settingsBtn').addEventListener('click', () => {
      browser.runtime.openOptionsPage();
    });
    
    // Account menu
    document.getElementById('accountMenu').addEventListener('click', () => {
      this.showAccountMenu();
    });
    
    // Copy address
    document.getElementById('copyAddress').addEventListener('click', () => {
      this.copyAddress();
    });
    
    // Switch account type
    document.getElementById('switchType').addEventListener('click', () => {
      this.toggleAccountType();
    });
    
    // Actions
    document.getElementById('sendBtn').addEventListener('click', () => {
      this.showSendModal();
    });
    
    document.getElementById('receiveBtn').addEventListener('click', () => {
      this.showReceiveModal();
    });
    
    document.getElementById('shieldBtn').addEventListener('click', () => {
      this.shieldFunds();
    });
    
    // Modal controls
    document.querySelectorAll('.close-btn, .cancel-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeModals();
      });
    });
    
    document.getElementById('confirmSend').addEventListener('click', () => {
      this.confirmSend();
    });
    
    document.getElementById('maxBtn').addEventListener('click', () => {
      this.setMaxAmount();
    });
    
    // Listen for pending requests
    browser.runtime.onMessage.addListener((message) => {
      if (message.type === 'PENDING_REQUEST') {
        this.showPendingRequest(message.request);
      }
    });
  }
  
  async checkConnection() {
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    
    statusIndicator.className = 'indicator connecting';
    statusText.textContent = 'Connecting to node...';
    
    try {
      const response = await browser.runtime.sendMessage({
        type: 'RPC_CALL',
        method: 'getinfo'
      });
      
      if (response.success) {
        statusIndicator.className = 'indicator connected';
        statusText.textContent = `Connected - Block ${response.result.blocks}`;
        await this.loadBalance();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      statusIndicator.className = 'indicator disconnected';
      statusText.textContent = 'Disconnected - Check node';
      console.error('Connection error:', error);
    }
  }
  
  async loadBalance() {
    try {
      // Get transparent balance
      const tBalance = await browser.runtime.sendMessage({
        type: 'GET_BALANCE',
        addressType: 'transparent'
      });
      
      // Get shielded balance
      const zBalance = await browser.runtime.sendMessage({
        type: 'GET_BALANCE',
        addressType: 'shielded'
      });
      
      this.balance.transparent = tBalance.balance || 0;
      this.balance.shielded = zBalance.balance || 0;
      
      this.updateBalanceDisplay();
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  }
  
  updateBalanceDisplay() {
    const total = this.balance.transparent + this.balance.shielded;
    
    document.getElementById('balance').textContent = total.toFixed(8);
    document.getElementById('tBalance').textContent = `${this.balance.transparent.toFixed(8)} ZCL`;
    document.getElementById('zBalance').textContent = `${this.balance.shielded.toFixed(8)} ZCL`;
    
    // Update USD value (placeholder - would fetch from API)
    const usdValue = (total * 0.50).toFixed(2); // Example price
    document.getElementById('balanceUSD').textContent = `≈ $${usdValue} USD`;
  }
  
  async updateUI() {
    if (!this.currentAccount) {
      // No account, show setup message
      document.getElementById('addressText').textContent = 'No wallet configured';
      return;
    }
    
    // Display current address
    const addressElement = document.getElementById('addressText');
    const address = this.isShielded ? this.currentAccount.zAddress : this.currentAccount.tAddress;
    
    if (address) {
      addressElement.textContent = this.truncateAddress(address);
      addressElement.title = address;
    }
    
    // Update account type badge
    const typeBadge = document.querySelector('.type-badge');
    const switchBtn = document.getElementById('switchType');
    
    if (this.isShielded) {
      typeBadge.className = 'type-badge shielded';
      typeBadge.textContent = 'Shielded';
      switchBtn.textContent = 'Switch to Transparent';
    } else {
      typeBadge.className = 'type-badge transparent';
      typeBadge.textContent = 'Transparent';
      switchBtn.textContent = 'Switch to Shielded';
    }
  }
  
  truncateAddress(address) {
    if (!address) return '';
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  }
  
  async copyAddress() {
    const address = this.isShielded ? this.currentAccount.zAddress : this.currentAccount.tAddress;
    
    try {
      await navigator.clipboard.writeText(address);
      this.showNotification('Address copied to clipboard!');
    } catch (error) {
      console.error('Copy failed:', error);
    }
  }
  
  async toggleAccountType() {
    this.isShielded = !this.isShielded;
    await browser.storage.local.set({ isShielded: this.isShielded });
    this.updateUI();
  }
  
  showSendModal() {
    document.getElementById('sendModal').style.display = 'flex';
  }
  
  closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.style.display = 'none';
    });
  }
  
  async confirmSend() {
    const address = document.getElementById('sendAddress').value;
    const amount = parseFloat(document.getElementById('sendAmount').value);
    const memo = document.getElementById('sendMemo').value;
    
    if (!address || !amount) {
      this.showNotification('Please fill in all fields', 'error');
      return;
    }
    
    try {
      const result = await browser.runtime.sendMessage({
        type: 'SEND_TRANSACTION',
        from: this.isShielded ? this.currentAccount.zAddress : this.currentAccount.tAddress,
        to: address,
        amount: amount,
        memo: memo,
        fromShielded: this.isShielded
      });
      
      if (result.success) {
        this.showNotification(`Transaction sent! TXID: ${result.txid.substring(0, 16)}...`);
        this.closeModals();
        await this.loadBalance();
      } else {
        this.showNotification(`Error: ${result.error}`, 'error');
      }
    } catch (error) {
      this.showNotification(`Error: ${error.message}`, 'error');
    }
  }
  
  setMaxAmount() {
    const balance = this.isShielded ? this.balance.shielded : this.balance.transparent;
    const fee = 0.0001;
    const maxAmount = Math.max(0, balance - fee);
    document.getElementById('sendAmount').value = maxAmount.toFixed(8);
  }
  
  showReceiveModal() {
    // Show QR code and address
    const address = this.isShielded ? this.currentAccount.zAddress : this.currentAccount.tAddress;
    // Implementation for receive modal
    this.showNotification('Receive modal - to be implemented');
  }
  
  async shieldFunds() {
    if (this.balance.transparent === 0) {
      this.showNotification('No transparent funds to shield', 'error');
      return;
    }
    
    try {
      const result = await browser.runtime.sendMessage({
        type: 'SHIELD_FUNDS',
        amount: this.balance.transparent
      });
      
      if (result.success) {
        this.showNotification('Funds shielded successfully!');
        await this.loadBalance();
      } else {
        this.showNotification(`Error: ${result.error}`, 'error');
      }
    } catch (error) {
      this.showNotification(`Error: ${error.message}`, 'error');
    }
  }
  
  showPendingRequest(request) {
    const pendingSection = document.getElementById('pendingSection');
    const requestSite = document.getElementById('requestSite');
    const requestMessage = document.getElementById('requestMessage');
    
    pendingSection.style.display = 'block';
    requestSite.textContent = request.origin;
    requestMessage.textContent = request.message || 'Website is requesting to connect';
    
    // Handle approve/reject
    document.getElementById('approveBtn').onclick = async () => {
      await browser.runtime.sendMessage({
        type: 'APPROVE_REQUEST',
        requestId: request.id
      });
      pendingSection.style.display = 'none';
    };
    
    document.getElementById('rejectBtn').onclick = async () => {
      await browser.runtime.sendMessage({
        type: 'REJECT_REQUEST',
        requestId: request.id
      });
      pendingSection.style.display = 'none';
    };
  }
  
  showNotification(message, type = 'info') {
    browser.notifications.create({
      type: 'basic',
      iconUrl: '../icons/zcl-48.png',
      title: 'ZClassic Wallet',
      message: message
    });
  }
  
  startAutoRefresh() {
    // Refresh every 30 seconds
    setInterval(() => {
      this.checkConnection();
    }, 30000);
  }
  
  showAccountMenu() {
    // Show account menu (switch accounts, create new, etc.)
    // To be implemented
    this.showNotification('Account menu - to be implemented');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});

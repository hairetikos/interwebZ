// Web Z Provider - Injected into web pages
(function() {
  'use strict';
  
  // Web Z Provider API
  class WebZProvider {
    constructor() {
      this.isWebZ = true;
      this.version = '1.0.0';
      this.connected = false;
      this.account = null;
      this.callbacks = new Map();
      this.requestIdCounter = 0;
      
      // Listen for responses from content script
      window.addEventListener('message', (event) => {
        if (event.data && event.data.target === 'webz-page') {
          this.handleResponse(event.data);
        }
      });
    }
    
    // Request connection to wallet
    async connect(options = {}) {
      const preferShielded = options.preferShielded || false;
      
      const response = await this.sendMessage('GET_ACCOUNT', { preferShielded });
      
      if (response.success) {
        this.connected = true;
        this.account = response.account;
        return this.account;
      } else if (response.error === 'NOT_CONNECTED') {
        // Trigger connection request
        await this.sendMessage('CONNECT_SITE', {});
        // Retry getting account
        return await this.connect(options);
      } else {
        throw new Error(response.error);
      }
    }
    
    // Get current account
    async getAccount() {
      if (!this.connected) {
        throw new Error('Not connected. Call connect() first.');
      }
      return this.account;
    }
    
    // Get balance
    async getBalance(addressType = 'transparent') {
      const response = await this.sendMessage('GET_BALANCE', { addressType });
      
      if (response.success) {
        return response.balance;
      } else {
        throw new Error(response.error);
      }
    }
    
    // Send transaction
    async sendTransaction(params) {
      if (!this.connected) {
        throw new Error('Not connected. Call connect() first.');
      }
      
      const { to, amount, memo, fromShielded } = params;
      
      const response = await this.sendMessage('SEND_TRANSACTION', {
        from: this.account.address,
        to,
        amount,
        memo,
        fromShielded: fromShielded || (this.account.type === 'shielded')
      });
      
      if (response.success) {
        return response.txid;
      } else {
        throw new Error(response.error);
      }
    }
    
    // Sign message
    async signMessage(message) {
      if (!this.connected) {
        throw new Error('Not connected. Call connect() first.');
      }
      
      const response = await this.sendMessage('SIGN_MESSAGE', {
        address: this.account.address,
        message
      });
      
      if (response.success) {
        return response.result;
      } else {
        throw new Error(response.error);
      }
    }
    
    // Verify message signature
    async verifyMessage(address, signature, message) {
      const response = await this.sendMessage('VERIFY_MESSAGE', {
        address,
        signature,
        message
      });
      
      if (response.success) {
        return response.result;
      } else {
        throw new Error(response.error);
      }
    }
    
    // Send message to content script
    sendMessage(type, payload) {
      return new Promise((resolve, reject) => {
        const id = ++this.requestIdCounter;
        
        this.callbacks.set(id, { resolve, reject });
        
        window.postMessage({
          target: 'webz-content',
          id,
          type,
          payload
        }, '*');
        
        // Timeout after 30 seconds
        setTimeout(() => {
          if (this.callbacks.has(id)) {
            this.callbacks.delete(id);
            reject(new Error('Request timeout'));
          }
        }, 30000);
      });
    }
    
    // Handle response from content script
    handleResponse(data) {
      const { id, response, error } = data;
      const callback = this.callbacks.get(id);
      
      if (callback) {
        this.callbacks.delete(id);
        
        if (error) {
          callback.reject(new Error(error));
        } else {
          callback.resolve(response);
        }
      }
    }
  }
  
  // Inject into window
  if (typeof window.webz === 'undefined') {
    window.webz = new WebZProvider();
    console.log('Web Z Provider injected');
    
    // Dispatch event to notify page
    window.dispatchEvent(new Event('webz#initialized'));
  }
})();

// Message Handler - Handles communication between content scripts and background
class MessageHandler {
  constructor(walletManager) {
    this.wallet = walletManager;
    this.pendingRequests = new Map();
    this.requestIdCounter = 0;
  }
  
  async handleMessage(message, sender) {
    console.log('Background received message:', message.type);
    
    switch (message.type) {
      case 'RPC_CALL':
        return await this.handleRPCCall(message);
        
      case 'GET_BALANCE':
        return await this.handleGetBalance(message);
        
      case 'GET_ACCOUNT':
        return await this.handleGetAccount(message, sender);
        
      case 'SEND_TRANSACTION':
        return await this.handleSendTransaction(message, sender);
        
      case 'SIGN_MESSAGE':
        return await this.handleSignMessage(message, sender);
        
      case 'VERIFY_MESSAGE':
        return await this.handleVerifyMessage(message);
        
      case 'CONNECT_SITE':
        return await this.handleConnectSite(message, sender);
        
      case 'SHIELD_FUNDS':
        return await this.handleShieldFunds(message);
        
      case 'APPROVE_REQUEST':
        return await this.handleApproveRequest(message);
        
      case 'REJECT_REQUEST':
        return await this.handleRejectRequest(message);
        
      default:
        return { success: false, error: 'Unknown message type' };
    }
  }
  
  async handleRPCCall(message) {
    const { method, params } = message;
    return await this.wallet.rpc.call(method, params);
  }
  
  async handleGetBalance(message) {
    const { addressType } = message;
    return await this.wallet.getBalance(addressType);
  }
  
  async handleGetAccount(message, sender) {
    // Check if site is connected
    const origin = new URL(sender.url).origin;
    
    if (!this.wallet.isSiteConnected(origin)) {
      // Request user approval
      const requestId = await this.createPendingRequest({
        type: 'CONNECT',
        origin: origin,
        message: 'This site wants to connect to your ZClassic wallet'
      });
      
      return {
        success: false,
        error: 'NOT_CONNECTED',
        requestId: requestId
      };
    }
    
    const account = this.wallet.getCurrentAccount();
    const useShielded = message.preferShielded || false;
    
    return {
      success: true,
      account: {
        address: useShielded ? account.zAddress : account.tAddress,
        type: useShielded ? 'shielded' : 'transparent'
      }
    };
  }
  
  async handleSendTransaction(message, sender) {
    const origin = new URL(sender.url).origin;
    
    if (!this.wallet.isSiteConnected(origin)) {
      return { success: false, error: 'Site not connected' };
    }
    
    // Request user approval for transaction
    const requestId = await this.createPendingRequest({
      type: 'SEND_TX',
      origin: origin,
      message: `Send ${message.amount} ZCL to ${message.to}`,
      data: message
    });
    
    // Wait for user approval
    return await this.waitForApproval(requestId);
  }
  
  async handleSignMessage(message, sender) {
    const origin = new URL(sender.url).origin;
    
    if (!this.wallet.isSiteConnected(origin)) {
      return { success: false, error: 'Site not connected' };
    }
    
    // Request user approval for signing
    const requestId = await this.createPendingRequest({
      type: 'SIGN_MESSAGE',
      origin: origin,
      message: `Sign message: "${message.message}"`,
      data: message
    });
    
    return await this.waitForApproval(requestId);
  }
  
  async handleVerifyMessage(message) {
    return await this.wallet.verifyMessage(
      message.address,
      message.signature,
      message.message
    );
  }
  
  async handleConnectSite(message, sender) {
    const origin = new URL(sender.url).origin;
    return await this.wallet.connectSite(origin);
  }
  
  async handleShieldFunds(message) {
    return await this.wallet.shieldFunds(message.amount);
  }
  
  async createPendingRequest(request) {
    const requestId = ++this.requestIdCounter;
    
    this.pendingRequests.set(requestId, {
      ...request,
      id: requestId,
      pending: true,
      promise: null,
      resolve: null,
      reject: null
    });
    
    // Create a promise that will be resolved when user approves/rejects
    const promise = new Promise((resolve, reject) => {
      const req = this.pendingRequests.get(requestId);
      req.resolve = resolve;
      req.reject = reject;
      req.promise = promise;
    });
    
    // Notify popup about pending request
    browser.runtime.sendMessage({
      type: 'PENDING_REQUEST',
      request: this.pendingRequests.get(requestId)
    });
    
    return requestId;
  }
  
  async handleApproveRequest(message) {
    const { requestId } = message;
    const request = this.pendingRequests.get(requestId);
    
    if (!request) {
      return { success: false, error: 'Request not found' };
    }
    
    // Execute the approved action
    let result;
    
    switch (request.type) {
      case 'CONNECT':
        await this.wallet.connectSite(request.origin);
        result = { success: true };
        break;
        
      case 'SEND_TX':
        result = await this.wallet.sendTransaction(request.data);
        break;
        
      case 'SIGN_MESSAGE':
        result = await this.wallet.signMessage(
          request.data.address,
          request.data.message
        );
        break;
        
      default:
        result = { success: false, error: 'Unknown request type' };
    }
    
    // Resolve the pending promise
    if (request.resolve) {
      request.resolve(result);
    }
    
    this.pendingRequests.delete(requestId);
    return result;
  }
  
  async handleRejectRequest(message) {
    const { requestId } = message;
    const request = this.pendingRequests.get(requestId);
    
    if (!request) {
      return { success: false, error: 'Request not found' };
    }
    
    // Reject the pending promise
    if (request.reject) {
      request.reject(new Error('User rejected request'));
    }
    
    this.pendingRequests.delete(requestId);
    return { success: true };
  }
  
  async waitForApproval(requestId) {
    const request = this.pendingRequests.get(requestId);
    if (!request || !request.promise) {
      return { success: false, error: 'Invalid request' };
    }
    
    try {
      return await request.promise;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

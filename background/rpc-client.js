// RPC Client for communicating with zclassicd
class ZClassicRPC {
  constructor(config = {}) {
    this.host = config.host || 'localhost';
    this.port = config.port || 8232;
    this.username = config.username || '';
    this.password = config.password || '';
    this.timeout = config.timeout || 30000;
  }
  
  async call(method, params = []) {
    const url = `http://${this.host}:${this.port}/`;
    const auth = btoa(`${this.username}:${this.password}`);
    
    const payload = {
      jsonrpc: '1.0',
      id: Date.now(),
      method: method,
      params: params
    };
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'RPC Error');
      }
      
      return { success: true, result: data.result };
    } catch (error) {
      console.error('RPC call failed:', method, error);
      return { success: false, error: error.message };
    }
  }
  
  // Convenience methods
  async getInfo() {
    return await this.call('getinfo');
  }
  
  async getBalance(account = '', minconf = 1) {
    return await this.call('getbalance', [account, minconf]);
  }
  
  async getNewAddress(account = '') {
    return await this.call('getnewaddress', [account]);
  }
  
  async zGetNewAddress(type = 'sapling') {
    return await this.call('z_getnewaddress', [type]);
  }
  
  async zGetBalance(address, minconf = 1) {
    return await this.call('z_getbalance', [address, minconf]);
  }
  
  async zGetTotalBalance(minconf = 1, includeWatchonly = false) {
    return await this.call('z_gettotalbalance', [minconf, includeWatchonly]);
  }
  
  async sendToAddress(address, amount, comment = '', commentTo = '') {
    return await this.call('sendtoaddress', [address, amount, comment, commentTo]);
  }
  
  async zSendMany(fromAddress, amounts, minconf = 1, fee = 0.0001) {
    return await this.call('z_sendmany', [fromAddress, amounts, minconf, fee]);
  }
  
  async zShieldCoinbase(fromAddress, toAddress, fee = 0.0001, limit = 50) {
    return await this.call('z_shieldcoinbase', [fromAddress, toAddress, fee, limit]);
  }
  
  async listAddressGroupings() {
    return await this.call('listaddressgroupings');
  }
  
  async zListAddresses() {
    return await this.call('z_listaddresses');
  }
  
  async zListReceivedByAddress(address, minconf = 1) {
    return await this.call('z_listreceivedbyaddress', [address, minconf]);
  }
  
  async signMessage(address, message) {
    return await this.call('signmessage', [address, message]);
  }
  
  async verifyMessage(address, signature, message) {
    return await this.call('verifymessage', [address, signature, message]);
  }
  
  async getTransaction(txid, includeWatchonly = false) {
    return await this.call('gettransaction', [txid, includeWatchonly]);
  }
  
  async zGetOperationStatus(operationIds = []) {
    return await this.call('z_getoperationstatus', [operationIds]);
  }
  
  async zGetOperationResult(operationIds = []) {
    return await this.call('z_getoperationresult', [operationIds]);
  }
}

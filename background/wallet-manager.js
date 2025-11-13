// Wallet Manager - Handles keys, addresses, and wallet state
class WalletManager {
  constructor(rpcClient) {
    this.rpc = rpcClient;
    this.accounts = [];
    this.currentAccountIndex = 0;
    this.connectedSites = new Map();
  }
  
  async initialize() {
    await this.loadAccounts();
  }
  
  async loadAccounts() {
    try {
      // Load transparent addresses
      const tAddresses = await this.rpc.listAddressGroupings();
      
      // Load z-addresses
      const zAddresses = await this.rpc.zListAddresses();
      
      if (tAddresses.success && zAddresses.success) {
        // Match up t-addresses with z-addresses
        const tAddrs = tAddresses.result.flat().map(a => a[0]);
        const zAddrs = zAddresses.result;
        
        // Create account objects
        this.accounts = [];
        const maxLength = Math.max(tAddrs.length, zAddrs.length);
        
        for (let i = 0; i < maxLength; i++) {
          this.accounts.push({
            index: i,
            tAddress: tAddrs[i] || null,
            zAddress: zAddrs[i] || null,
            name: `Account ${i + 1}`
          });
        }
        
        // Save to storage
        await browser.storage.local.set({
          accounts: this.accounts,
          currentAccountIndex: this.currentAccountIndex
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error loading accounts:', error);
      return false;
    }
  }
  
  async createNewAccount() {
    try {
      // Generate new transparent address
      const tAddr = await this.rpc.getNewAddress();
      
      // Generate new z-address
      const zAddr = await this.rpc.zGetNewAddress('sapling');
      
      if (tAddr.success && zAddr.success) {
        const newAccount = {
          index: this.accounts.length,
          tAddress: tAddr.result,
          zAddress: zAddr.result,
          name: `Account ${this.accounts.length + 1}`
        };
        
        this.accounts.push(newAccount);
        
        await browser.storage.local.set({
          accounts: this.accounts
        });
        
        return newAccount;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating account:', error);
      return null;
    }
  }
  
  getCurrentAccount() {
    return this.accounts[this.currentAccountIndex] || null;
  }
  
  async switchAccount(index) {
    if (index >= 0 && index < this.accounts.length) {
      this.currentAccountIndex = index;
      await browser.storage.local.set({ currentAccountIndex: index });
      return true;
    }
    return false;
  }
  
  async getBalance(addressType = 'transparent') {
    const account = this.getCurrentAccount();
    if (!account) return { balance: 0 };
    
    try {
      if (addressType === 'transparent') {
        const result = await this.rpc.getBalance();
        return { balance: result.success ? result.result : 0 };
      } else {
        const address = account.zAddress;
        if (!address) return { balance: 0 };
        
        const result = await this.rpc.zGetBalance(address);
        return { balance: result.success ? result.result : 0 };
      }
    } catch (error) {
      console.error('Error getting balance:', error);
      return { balance: 0 };
    }
  }
  
  async sendTransaction(params) {
    const { from, to, amount, memo, fromShielded } = params;
    
    try {
      if (fromShielded) {
        // Shielded transaction using z_sendmany
        const amounts = [{
          address: to,
          amount: amount
        }];
        
        // Add memo if provided and destination is shielded
        if (memo && to.startsWith('zs')) {
          amounts[0].memo = this.stringToHex(memo);
        }
        
        const result = await this.rpc.zSendMany(from, amounts);
        
        if (result.success) {
          // z_sendmany returns operation ID
          const opid = result.result;
          
          // Wait for operation to complete
          const txid = await this.waitForOperation(opid);
          return { success: true, txid: txid };
        }
        
        return { success: false, error: result.error };
      } else {
        // Transparent transaction
        const result = await this.rpc.sendToAddress(to, amount);
        
        if (result.success) {
          return { success: true, txid: result.result };
        }
        
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error sending transaction:', error);
      return { success: false, error: error.message };
    }
  }
  
  async waitForOperation(opid, maxAttempts = 30) {
    for (let i = 0; i < maxAttempts; i++) {
      const result = await this.rpc.zGetOperationStatus([opid]);
      
      if (result.success && result.result.length > 0) {
        const op = result.result[0];
        
        if (op.status === 'success') {
          return op.result.txid;
        } else if (op.status === 'failed') {
          throw new Error(op.error.message);
        }
      }
      
      // Wait 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    throw new Error('Operation timeout');
  }
  
  async shieldFunds(amount) {
    const account = this.getCurrentAccount();
    if (!account || !account.zAddress) {
      return { success: false, error: 'No z-address available' };
    }
    
    try {
      // Shield from transparent to z-address
      const result = await this.rpc.zShieldCoinbase('*', account.zAddress, 0.0001, 50);
      
      if (result.success) {
        const opid = result.result.opid;
        const txid = await this.waitForOperation(opid);
        return { success: true, txid: txid };
      }
      
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Error shielding funds:', error);
      return { success: false, error: error.message };
    }
  }
  
  async signMessage(address, message) {
    try {
      const result = await this.rpc.signMessage(address, message);
      return result;
    } catch (error) {
      console.error('Error signing message:', error);
      return { success: false, error: error.message };
    }
  }
  
  async verifyMessage(address, signature, message) {
    try {
      const result = await this.rpc.verifyMessage(address, signature, message);
      return result;
    } catch (error) {
      console.error('Error verifying message:', error);
      return { success: false, error: error.message };
    }
  }
  
  stringToHex(str) {
    let hex = '';
    for (let i = 0; i < str.length; i++) {
      hex += str.charCodeAt(i).toString(16).padStart(2, '0');
    }
    return hex;
  }
  
  hexToString(hex) {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
  }
  
  // Site permissions
  async connectSite(origin) {
    this.connectedSites.set(origin, {
      connected: true,
      timestamp: Date.now()
    });
    
    await this.saveConnectedSites();
    return true;
  }
  
  async disconnectSite(origin) {
    this.connectedSites.delete(origin);
    await this.saveConnectedSites();
    return true;
  }
  
  isSiteConnected(origin) {
    return this.connectedSites.has(origin);
  }
  
  async saveConnectedSites() {
    const sites = Array.from(this.connectedSites.entries());
    await browser.storage.local.set({ connectedSites: sites });
  }
  
  async loadConnectedSites() {
    const data = await browser.storage.local.get('connectedSites');
    if (data.connectedSites) {
      this.connectedSites = new Map(data.connectedSites);
    }
  }
}

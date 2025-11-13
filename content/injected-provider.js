// Content script - Injects the Web Z provider into the page
(function() {
  'use strict';
  
  // Inject the provider script into the page context
  const script = document.createElement('script');
  script.src = browser.runtime.getURL('inpage/webz-provider.js');
  script.onload = function() {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);
  
  // Relay messages between page and background
  window.addEventListener('message', async (event) => {
    // Only accept messages from the same window
    if (event.source !== window) return;
    
    // Check if it's a Web Z message
    if (event.data && event.data.target === 'webz-content') {
      console.log('Content script received:', event.data);
      
      try {
        // Forward to background script
        const response = await browser.runtime.sendMessage({
          type: event.data.type,
          ...event.data.payload
        });
        
        // Send response back to page
        window.postMessage({
          target: 'webz-page',
          id: event.data.id,
          response: response
        }, '*');
      } catch (error) {
        // Send error back to page
        window.postMessage({
          target: 'webz-page',
          id: event.data.id,
          error: error.message
        }, '*');
      }
    }
  });
})();

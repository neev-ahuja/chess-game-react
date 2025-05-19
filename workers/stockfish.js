let stockfish = null;

function initStockfish() {
  if (!stockfish) {
    stockfish = new Worker('/stockfish.js');
    
    stockfish.onmessage = function(event) {
      self.postMessage(event.data);
    };
  }
}

self.onmessage = function(e) {
  if (!stockfish) {
    initStockfish();
  }
  
  if (stockfish) {
    stockfish.postMessage(e.data);
  }
}; 
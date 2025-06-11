import './App.css';
import { useState, useEffect , useRef } from 'react';
import { Chess } from 'chess.js';

const chess = new Chess();

const App = () => {

  const [board, setBoard] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [isWhiteTurn, setIsWhiteTurn] = useState(true);
  const [gameStatus, setGameStatus] = useState('ongoing');
  const [winner, setWinner] = useState(null);
  const [error, setError] = useState(null);
  const [capturable , setCapturable] = useState({});
  const [isAiMode , setIsAiMode] = useState(false);
  const [isAiThinking , setIsAiThinking] = useState(false);

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const stockfishWorker = useRef(null);

  const updateBoard = () => {
    setBoard(chess.board().map(row => row.map(piece => piece ? piece.color === 'w' ? piece.type.toUpperCase() : piece.type : null)));
  };

  useEffect(() => {
    setBoard(chess.board().map(row => row.map(piece => piece ? piece.color === 'w' ? piece.type.toUpperCase() : piece.type : null)));
    setCapturable({});
  } , []);

  useEffect(() => {
    stockfishWorker.current = new window.Worker(process.env.PUBLIC_URL + '/stockfish.js');
    return () => {
      if (stockfishWorker.current) stockfishWorker.current.terminate();
    };
  }, []);
  

  const suggestMove = () => {
    if (!stockfishWorker.current) return;
    const fen = chess.fen();
    stockfishWorker.current.postMessage('uci');
    stockfishWorker.current.postMessage('ucinewgame');
    stockfishWorker.current.postMessage(`position fen ${fen}`);
    stockfishWorker.current.postMessage('go depth 15');

    stockfishWorker.current.onmessage = (event) => {
      const line = event.data;
      if (line.startsWith('bestmove')) {
        const move = line.split(' ')[1];
        if (move && move.length >= 4) {
          // Highlight or make the move
          // console.log(`Suggested move: ${move}`);
          return move;
        }
      }
    };
  };


  const getPieceComponent = (piece, rowIndex, colIndex) => {
    if (!piece) return null;

    const pieceType = piece.toLowerCase();
    const isWhitePiece = piece === piece.toUpperCase();
    const pieceClass = `chess-piece ${piece === 'dot' ? 'dot' : `${isWhitePiece ? 'white-' + pieceType : 'black-' + pieceType}`} ${capturable[`${rowIndex}-${colIndex}`] ? 'capturable' : ''}`;

    return (
      <div className={pieceClass} data-row={rowIndex} data-col={colIndex}>
      </div>
    );
  }
  const addDots = (moves) => {
    const newBoard = board.map(row => row.slice());
    
    for (let i = 0; i < newBoard.length; i++) {
      for (let j = 0; j < newBoard[i].length; j++) {
        if (newBoard[i][j] === 'dot') {
          newBoard[i][j] = null;
        }
      }
    }
    let newCapturable = {};
    moves.forEach(element =>{
      const row = ranks.indexOf(element.to.slice(-1));
      const col = files.indexOf(element.to.charAt(0));
      if(newBoard[row][col] !== null) {
        newCapturable[`${row}-${col}`] = true;
        return;
      };
      newBoard[row][col] = 'dot';
    });
    setCapturable(newCapturable);
    setBoard(newBoard);
  }

  useEffect(() => {
    const checkGameStatus = () => {
      if (chess.isCheckmate()) {
        setGameStatus('checkmate');
        setWinner(isWhiteTurn ? 'black' : 'white');
      } else if (chess.isStalemate()) {
        setGameStatus('stalemate');
      } else if (chess.isCheck()) {
        setGameStatus('check');
      } else {
        setGameStatus('ongoing');
      }
    };

    checkGameStatus();
  }, [board, isWhiteTurn]);


  
  useEffect(() => {
    if (isAiMode && !isWhiteTurn) {
      setIsAiThinking(true);
      handleAiMove().then(() => {
        setIsWhiteTurn(true);
        setIsAiThinking(false);
      });
    }
  }, [isAiMode, isWhiteTurn]);

  const handleAiMove = async () => {
    if (!stockfishWorker.current) return;
    const fen = chess.fen();
    stockfishWorker.current.postMessage('uci');
    stockfishWorker.current.postMessage('ucinewgame');
    stockfishWorker.current.postMessage(`position fen ${fen}`);
    stockfishWorker.current.postMessage('go depth 15');

    return new Promise((resolve) => {
      stockfishWorker.current.onmessage = (event) => {
        const line = event.data;
        if (line.startsWith('bestmove')) {
          const move = line.split(' ')[1];
          if (move && move.length >= 4) {
            chess.move({ from: move.slice(0, 2), to: move.slice(2, 4) });
            updateBoard();
          }
          resolve();
        }
      };
    });
  };

  const handleCellClick  = (rowIndex, colIndex, piece) => {
    setError(null);
    if(piece === null) {
      setCapturable({});
      updateBoard();
      setSelectedCell(null);
      return;
    }

    if(!selectedCell) {
      if(piece !== 'dot' && piece !== null && ((piece.toLowerCase() !== piece && !isWhiteTurn) || (piece.toUpperCase() !== piece && isWhiteTurn))) {
        setError('Invalid piece selection');
        return;
      }
    }

    if(!selectedCell || (piece !== null && piece !== 'dot' && piece.toLowerCase() !== piece && isWhiteTurn) || (piece !== null && piece !== 'dot' && piece.toUpperCase() !== piece && !isWhiteTurn)) {
      const moves = chess.moves({ square: `${files[colIndex]}${ranks[rowIndex]}`, verbose: true , piece: piece });
      if(moves) addDots(moves); 
      setSelectedCell({ rowIndex, colIndex  , piece});
      return;
    }

    try {
      chess.move({ from: `${files[selectedCell.colIndex]}${ranks[selectedCell.rowIndex]}`, to: `${files[colIndex]}${ranks[rowIndex]}` });
      updateBoard();
      setIsWhiteTurn(!isWhiteTurn);
      setCapturable({});
      if(isAiMode) setIsAiThinking(true);
    } catch (error) { 
      setError('Invalid move: ' + error.message);
    }

    setSelectedCell(null);
  };


  const handleReset = () => {
    chess.reset();
    updateBoard();  
    setSelectedCell(null);
    setIsWhiteTurn(true);
    setGameStatus('ongoing');
    setWinner(null);
    setError(null);
    setCapturable({});
  }

  const handleUndo = () =>{
    chess.undo();
    updateBoard();
    setSelectedCell(null);
    setIsWhiteTurn(!isWhiteTurn);
    setCapturable({});
    setError(null);
  }

  return (
    <div className="flex flex-col items-center min-h-screen py-8 bg-gradient-to-b from-amber-50 to-amber-100">
      <h1 className="text-3xl font-bold mb-2 text-amber-900">Chess Game</h1>
      
      <div className='flex items-center justify-center mb-4'>
      <input type='checkbox'  checked={isAiMode} onChange={() => {
        setIsAiMode(!isAiMode);
        if(!isAiMode) {
          setIsAiThinking(false);
          setCapturable({});
          updateBoard();
        }
      }} /> 
      <label className='ml-2 text-lg text-amber-900'>AI Mode</label>
      </div>

      <div className="mb-6 px-4 py-2 bg-amber-800 text-amber-50 rounded-full font-semibold">
        {gameStatus === 'checkmate' ? `Checkmate! ${winner === 'white' ? 'White' : 'Black'} wins!` :
         gameStatus === 'stalemate' ? 'Stalemate! Game is a draw.' :
         gameStatus === 'check' ? `${isWhiteTurn ? 'White' : 'Black'} is in check!` :
         `${isAiThinking ? 'AI is Thinking' : isWhiteTurn ? 'White' : 'Black'} to move`}
      </div>

      {gameStatus === 'checkmate' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl text-center">
            <h2 className="text-4xl font-bold mb-4 text-amber-900">
              Checkmate!
            </h2>
            <p className="text-2xl mb-6">
              {winner === 'white' ? 'White' : 'Black'} wins!
            </p>
            <button
              className="px-6 py-3 bg-amber-700 text-white rounded-md hover:bg-amber-600 transition-colors font-medium"
            >
              New Game
            </button>
          </div>
        </div>
      )}
      

      <div className="chess-board-container">
        <div className="chess-board">
          <div className="files-labels">
            <div className='files-labels ml-7'>
              {files.map(file => (
                <div key={file} className="coord-label files">{file}</div>
              ))}
            </div>
          </div>
          
          <div className="board-with-ranks">
            <div className="ranks-labels">
              {ranks.map(rank => (
                <div key={rank} className="coord-label ranks">{rank}</div>
              ))}
            </div>
            
            <div className="board">
              {board && board.map((row, rowIndex) => (
                <div key={`row-${rowIndex}`} className="board-row">
                  {row.map((piece, colIndex) => {
                    const isBlackSquare = (rowIndex + colIndex) % 2 === 1;
                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`board-cell ${isBlackSquare ? 'black-cell' : 'white-cell'}`}
                        onClick={() => handleCellClick(rowIndex, colIndex, piece)}
                        data-row={rowIndex}
                        data-col={colIndex}
                      >
                        {getPieceComponent(piece, rowIndex, colIndex)}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex flex-col sm:flex-row gap-2 sm:gap-4">
        <button
          className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-amber-700 text-amber-50 rounded-md shadow-md hover:bg-amber-600 transition-colors font-medium"
          onClick={handleReset}
        >
          Reset Game
        </button>
        <button
          className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-gray-700 text-amber-50 rounded-md shadow-md hover:bg-gray-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleUndo}
        >
          Undo Move
        </button>
      </div>  

      
      {
        error && (
          <div>
            <p className="text-red-600 font-bold mt-2">{error}</p>
            </div>
        )
      }
    </div>
  );
};

export default App;
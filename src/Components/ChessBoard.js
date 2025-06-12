import { useState, useEffect, useRef } from 'react';
import { Crown, RotateCcw, Undo, Bot, Users, Zap, Shield } from 'lucide-react';
import { Chess } from 'chess.js';
import '../Styles/ChessBoard.css';
import { useNavigate } from 'react-router-dom';
const chess = new Chess();

const ChessBoard = ({mode}) => {
  const [board, setBoard] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [isWhiteTurn, setIsWhiteTurn] = useState(true);
  const [gameStatus, setGameStatus] = useState('ongoing');
  const [winner, setWinner] = useState(null);
  const [error, setError] = useState(null);
  const [capturable, setCapturable] = useState({});
  const [isAiMode, setIsAiMode] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const navigate = useNavigate();

  const stockfishWorker = useRef(null);

  const updateBoard = () => {
    setBoard(chess.board().map(row => row.map(piece => piece ? piece.color === 'w' ? piece.type.toUpperCase() : piece.type : null)));
  };

  useEffect(() => {
    setBoard(chess.board().map(row => row.map(piece => piece ? piece.color === 'w' ? piece.type.toUpperCase() : piece.type : null)));
    setCapturable({});
    setIsAiMode(mode === 'computer');
  }, []);

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
          return move;
        }
      }
    };
  };

  const getPieceComponent = (piece, rowIndex, colIndex) => {
    if (!piece) return null;

    const isWhitePiece = piece === piece.toUpperCase();
    const isDot = piece === 'dot';
    const isCapturable = capturable[`${rowIndex}-${colIndex}`];
    const pieceType = piece.toLowerCase();

    if (isDot) {
      return (
        <div className="w-4 h-4 bg-yellow-400/60 rounded-full shadow-lg animate-pulse" />
      );
    }

    return (
      <div className={`text-5xl select-none cursor-pointer transition-all duration-200 hover:scale-110 ${
        isWhitePiece ? 'text-white drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)]' : 'text-slate-800 drop-shadow-[1px_1px_2px_rgba(255,255,255,0.5)]'
      } ${isCapturable ? 'animate-pulse ring-4 ring-red-500/50 rounded-full p-1' : ''} chess-piece ${piece === 'dot' ? 'dot' : `${isWhitePiece ? 'white-' + pieceType : 'black-' + pieceType}`}`}>
      </div>
    );
  };

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
    moves.forEach(element => {
      const row = ranks.indexOf(element.to.slice(-1));
      const col = files.indexOf(element.to.charAt(0));
      if (newBoard[row][col] !== null) {
        newCapturable[`${row}-${col}`] = true;
        return;
      }
      newBoard[row][col] = 'dot';
    });
    setCapturable(newCapturable);
    setBoard(newBoard);
  };

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

  const handleCellClick = (rowIndex, colIndex, piece) => {
    setError(null);
    if (piece === null) {
      setCapturable({});
      updateBoard();
      setSelectedCell(null);
      return;
    }

    if (!selectedCell) {
      if (piece !== 'dot' && piece !== null && ((piece.toLowerCase() !== piece && !isWhiteTurn) || (piece.toUpperCase() !== piece && isWhiteTurn))) {
        setError('Invalid piece selection');
        return;
      }
    }

    if (!selectedCell || (piece !== null && piece !== 'dot' && piece.toLowerCase() !== piece && isWhiteTurn) || (piece !== null && piece !== 'dot' && piece.toUpperCase() !== piece && !isWhiteTurn)) {
      const moves = chess.moves({ square: `${files[colIndex]}${ranks[rowIndex]}`, verbose: true, piece: piece });
      if (moves) addDots(moves);
      setSelectedCell({ rowIndex, colIndex, piece });
      return;
    }

    try {
      chess.move({ from: `${files[selectedCell.colIndex]}${ranks[selectedCell.rowIndex]}`, to: `${files[colIndex]}${ranks[rowIndex]}` });
      updateBoard();
      setIsWhiteTurn(!isWhiteTurn);
      setCapturable({});
      if (isAiMode) setIsAiThinking(true);
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
  };

  const handleUndo = () => {
    chess.undo();
    updateBoard();
    setSelectedCell(null);
    setIsWhiteTurn(!isWhiteTurn);
    setCapturable({});
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 text-6xl text-yellow-400/10 animate-pulse">♜</div>
        <div className="absolute top-40 right-20 text-8xl text-yellow-400/5 animate-bounce">♞</div>
        <div className="absolute bottom-40 left-20 text-7xl text-yellow-400/10 animate-pulse" style={{animationDelay: '1s'}}>♝</div>
        <div className="absolute bottom-20 right-10 text-9xl text-yellow-400/5 animate-bounce" style={{animationDelay: '2s'}}>♛</div>
        
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center min-h-screen py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Crown className="h-10 w-10 text-yellow-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent cursor-pointer" onClick={() => navigate('/')}>
              Royal Chess
            </h1>
          </div>
          <p className="text-slate-300 text-lg">Master the Game of Kings</p>
        </div>

        <div className="bg-slate-800/70 backdrop-blur-sm border border-yellow-500/30 px-6 py-3 rounded-xl mb-8 shadow-lg">
          <div className="flex items-center justify-center space-x-3">
            {isAiThinking ? (
              <>
                <Bot className="h-6 w-6 text-yellow-400 animate-pulse" />
                <span className="text-yellow-400 font-semibold text-lg">AI is thinking...</span>
              </>
            ) : gameStatus === 'checkmate' ? (
              <>
                <Crown className="h-6 w-6 text-yellow-400" />
                <span className="text-yellow-400 font-bold text-lg">
                  Checkmate! {winner === 'white' ? 'White' : 'Black'} wins!
                </span>
              </>
            ) : gameStatus === 'stalemate' ? (
              <>
                <Shield className="h-6 w-6 text-slate-400" />
                <span className="text-slate-300 font-semibold text-lg">Stalemate! Game is a draw.</span>
              </>
            ) : gameStatus === 'check' ? (
              <>
                <Zap className="h-6 w-6 text-red-400 animate-pulse" />
                <span className="text-red-400 font-semibold text-lg">
                  {isWhiteTurn ? 'White' : 'Black'} is in check!
                </span>
              </>
            ) : (
              <>
                <div className={`w-4 h-4 rounded-full ${isWhiteTurn ? 'bg-white' : 'bg-slate-700'} shadow-lg`}></div>
                <span className="text-white font-semibold text-lg">
                  {isWhiteTurn ? 'White' : 'Black'} to move
                </span>
              </>
            )}
          </div>
        </div>

        <div className="bg-slate-800/30 backdrop-blur-sm border border-yellow-500/20 p-6 rounded-2xl shadow-2xl mb-8">
          <div className="flex justify-center mb-2">
            <div className="flex ml-8">
              {files.map(file => (
                <div key={file} className="w-16 h-6 flex items-center justify-center text-yellow-400 font-bold text-lg">
                  {file}
                </div>
              ))}
            </div>
          </div>

          <div className="flex">
            <div className="flex flex-col mr-2">
              {ranks.map(rank => (
                <div key={rank} className="w-6 h-16 flex items-center justify-center text-yellow-400 font-bold text-lg">
                  {rank}
                </div>
              ))}
            </div>

            <div className="border-4 border-yellow-500/30 rounded-lg overflow-hidden shadow-2xl">
              {board && board.map((row, rowIndex) => (
                <div key={`row-${rowIndex}`} className="flex">
                  {row.map((piece, colIndex) => {
                    const isLightSquare = (rowIndex + colIndex) % 2 === 0;
                    const isSelected = selectedCell && selectedCell.rowIndex === rowIndex && selectedCell.colIndex === colIndex;
                    
                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`w-16 h-16 flex items-center justify-center cursor-pointer transition-all duration-200 relative
                          ${isLightSquare 
                            ? 'bg-gradient-to-br from-yellow-100 to-yellow-50 hover:from-yellow-200 hover:to-yellow-100' 
                            : 'bg-gradient-to-br from-yellow-800 to-yellow-700 hover:from-yellow-700 hover:to-yellow-600'
                          }
                          ${isSelected ? 'ring-4 ring-blue-400 ring-opacity-60' : ''}
                          hover:shadow-lg transform hover:scale-105
                        `}
                        onClick={() => handleCellClick(rowIndex, colIndex, piece)}
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

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={handleReset}
            className="group bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/25 flex items-center space-x-2"
          >
            <RotateCcw className="h-5 w-5 group-hover:rotate-180 transition-transform duration-300" />
            <span>New Game</span>
          </button>
          
          <button
            onClick={handleUndo}
            className="group bg-slate-700/50 backdrop-blur-sm border border-yellow-500/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-600/50 transition-all flex items-center space-x-2"
          >
            <Undo className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span>Undo Move</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/40 px-4 py-2 rounded-lg">
            <p className="text-red-300 font-medium">{error}</p>
          </div>
        )}

        {gameStatus === 'checkmate' && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800/90 backdrop-blur-lg border border-yellow-500/30 p-8 rounded-2xl shadow-2xl text-center max-w-md mx-4">
              <Crown className="h-16 w-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                Checkmate!
              </h2>
              <p className="text-2xl mb-6 text-white">
                {winner === 'white' ? '♔ White' : '♚ Black'} wins!
              </p>
              <button
                onClick={handleReset}
                className="bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/25"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChessBoard;
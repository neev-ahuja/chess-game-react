import React from 'react';
import './App.css';
import { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';

const App = () => {
  const initialBoard = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
  ];

  const [board, setBoard] = useState(initialBoard);
  const [selectedCell, setSelectedCell] = useState(null);
  const [isWhiteTurn, setIsWhiteTurn] = useState(true);
  const [capturablePieces, setCapturablePieces] = useState([]);
  const [moveHistory, setMoveHistory] = useState([]);
  const [isAIMode, setIsAIMode] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState(10);
  const [isThinking, setIsThinking] = useState(false);
  const [isEngineReady, setIsEngineReady] = useState(false);
  const [gameStatus, setGameStatus] = useState('ongoing');
  const [winner, setWinner] = useState(null);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [animatingPiece, setAnimatingPiece] = useState(null);
  const [illegalMoveMessage, setIllegalMoveMessage] = useState('');

  const chess = useRef(new Chess());
  const stockfish = useRef(null);
  const moveSound = useRef(new Audio('/sounds/move.mp3'));
  const captureSound = useRef(new Audio('/sounds/capture.mp3'));
  const checkSound = useRef(new Audio('/sounds/check.mp3'));
  const gameEndSound = useRef(new Audio('/sounds/game-end.mp3'));

  useEffect(() => {
    moveSound.current.load();
    captureSound.current.load();
    checkSound.current.load();
    gameEndSound.current.load();
  }, []);

  const playSound = (sound) => {
    if (isSoundOn) {
      try {
        sound.current.currentTime = 0;
        const playPromise = sound.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log('Error playing sound:', error);
            sound.current.load();
            sound.current.play().catch(e => console.log('Failed to play sound after reload:', e));
          });
        }
      } catch (error) {
        console.log('Error with sound playback:', error);
      }
    }
  };

  const animatePiece = (from, to) => {
    const fromCell = document.querySelector(`[data-row="${from.row}"][data-col="${from.col}"]`);
    const toCell = document.querySelector(`[data-row="${to.row}"][data-col="${to.col}"]`);
    
    if (fromCell && toCell) {
      const fromRect = fromCell.getBoundingClientRect();
      const toRect = toCell.getBoundingClientRect();
      
      const moveX = toRect.left - fromRect.left;
      const moveY = toRect.top - fromRect.top;
      
      const piece = fromCell.querySelector('.chess-piece');
      if (piece) {
        piece.style.setProperty('--move-x', `${moveX}px`);
        piece.style.setProperty('--move-y', `${moveY}px`);
        piece.classList.add('animating');
        
        setTimeout(() => {
          piece.classList.remove('animating');
          piece.style.removeProperty('--move-x');
          piece.style.removeProperty('--move-y');
        }, 300);
      }
    }
  };

  useEffect(() => {
    if (isAIMode && !stockfish.current) {
      console.log('Initializing Stockfish...');
      setIsEngineReady(false);
      stockfish.current = new Worker('/workers/stockfish.js');
      
      stockfish.current.onmessage = (event) => {
        const message = event.data;
        console.log('Received from Stockfish:', message);
        
        if (message.includes('uciok')) {
          stockfish.current.postMessage('setoption name Skill Level value ' + aiDifficulty);
          stockfish.current.postMessage('setoption name MultiPV value 1');
          stockfish.current.postMessage('isready');
        } else if (message.includes('readyok')) {
          setIsEngineReady(true);
        } else if (message.includes('bestmove')) {
          const move = message.split(' ')[1];
          makeAIMove(move);
        }
      };

      stockfish.current.postMessage('uci');
    }

    return () => {
      if (stockfish.current) {
        stockfish.current.terminate();
        stockfish.current = null;
        setIsEngineReady(false);
      }
    };
  }, [isAIMode]);

  useEffect(() => {
    if (stockfish.current && isEngineReady) {
      stockfish.current.postMessage('setoption name Skill Level value ' + aiDifficulty);
    }
  }, [aiDifficulty, isEngineReady]);

  const checkGameStatus = () => {
    if (chess.current.isCheckmate()) {
      setGameStatus('checkmate');
      setWinner(isWhiteTurn ? 'black' : 'white');
      playSound(gameEndSound);
    } else if (chess.current.isStalemate()) {
      setGameStatus('stalemate');
      setWinner(null);
      playSound(gameEndSound);
    } else if (chess.current.isCheck()) {
      const currentPlayerColor = isWhiteTurn ? 'w' : 'b';
      if (chess.current.turn() === currentPlayerColor) {
        setGameStatus('check');
        playSound(checkSound);
      } else {
        setGameStatus('ongoing');
      }
    } else {
      setGameStatus('ongoing');
    }
  };

  const handleCellClick = (rowIndex, colIndex, piece) => {
    if (gameStatus === 'checkmate' || gameStatus === 'stalemate') return;
    
    if (isAIMode && !isWhiteTurn) return;

    if(!selectedCell) {
      if(!piece) return;
      if(isWhiteTurn && piece === piece.toLowerCase()) return;
      if(!isWhiteTurn && piece === piece.toUpperCase()) return;
      setSelectedCell({row: rowIndex, col: colIndex, piece: piece});
      changeBoardBasedOnPiece(rowIndex, colIndex, piece);
      setIllegalMoveMessage('');
    } else {
      if(piece && piece !== 'dot' && ((isWhiteTurn && piece === piece.toUpperCase()) || (!isWhiteTurn && piece === piece.toLowerCase()))) {
        const newBoard = [...board];
        for(let i = 0; i < 8; i++){
          for(let j = 0; j < 8; j++){
            if(newBoard[i][j] === 'dot'){
              newBoard[i][j] = null;
            }
          }
        }
        setBoard(newBoard);
        setCapturablePieces([]);
        setSelectedCell({row: rowIndex, col: colIndex, piece: piece});
        changeBoardBasedOnPiece(rowIndex, colIndex, piece);
        setIllegalMoveMessage('');
        return;
      }

      const isCapturablePiece = capturablePieces.some(p => p.row === rowIndex && p.col === colIndex);
      if(board[rowIndex][colIndex] !== 'dot' && !isCapturablePiece) {
        const newBoard = [...board];
        for(let i = 0; i < 8; i++){
          for(let j = 0; j < 8; j++){
            if(newBoard[i][j] === 'dot'){
              newBoard[i][j] = null;
            }
          }
        }
        setBoard(newBoard);
        setCapturablePieces([]);
        setSelectedCell(null);
        setIllegalMoveMessage(gameStatus === 'check' ? 'This move does not get you out of check!' : 'Illegal move!');
        setTimeout(() => setIllegalMoveMessage(''), 2000);
        return;
      }

      const from = files[selectedCell.col] + ranks[selectedCell.row];
      const to = files[colIndex] + ranks[rowIndex];

      try {
        const move = chess.current.move({ from, to, promotion: 'q' });
        if (move) {
          if (chess.current.isCheck() && chess.current.turn() === (isWhiteTurn ? 'w' : 'b')) {
            chess.current.undo();
            setIllegalMoveMessage('This move does not get you out of check!');
            setTimeout(() => setIllegalMoveMessage(''), 2000);
            return;
          }

          const newBoard = [...board];
          const selectedPiece = selectedCell.piece;
          
          const moveHistoryEntry = {
            from: { row: selectedCell.row, col: selectedCell.col, piece: selectedPiece },
            to: { row: rowIndex, col: colIndex, capturedPiece: board[rowIndex][colIndex] }
          };
          setMoveHistory(prev => [...prev, moveHistoryEntry]);
          
          newBoard[rowIndex][colIndex] = selectedPiece;
          newBoard[selectedCell.row][selectedCell.col] = null;
          
          for(let i = 0; i < 8; i++){
            for(let j = 0; j < 8; j++){
              if(newBoard[i][j] === 'dot'){
                newBoard[i][j] = null;
              }
            }
          }
          
          setBoard(newBoard);
          setCapturablePieces([]);
          setSelectedCell(null);
          setIsWhiteTurn(false);
          checkGameStatus();

          if (board[rowIndex][colIndex]) {
            playSound(captureSound);
          } else {
            playSound(moveSound);
          }
          animatePiece(
            { row: selectedCell.row, col: selectedCell.col },
            { row: rowIndex, col: colIndex }
          );

          if (isAIMode) {
            setIsThinking(true);
            setTimeout(() => {
              if (stockfish.current && isEngineReady) {
                console.log('Requesting AI move...');
                console.log('Current FEN:', chess.current.fen());
                stockfish.current.postMessage('position fen ' + chess.current.fen());
                stockfish.current.postMessage('go movetime 1000');
              }
            }, 100);
          }
        } else {
          chess.current.undo();
          const newBoard = [...board];
          for(let i = 0; i < 8; i++){
            for(let j = 0; j < 8; j++){
              if(newBoard[i][j] === 'dot'){
                newBoard[i][j] = null;
              }
            }
          }
          setBoard(newBoard);
          setCapturablePieces([]);
          setSelectedCell(null);
          setIllegalMoveMessage(gameStatus === 'check' ? 'This move does not get you out of check!' : 'Illegal move!');
          setTimeout(() => setIllegalMoveMessage(''), 2000);
        }
      } catch (error) {
        chess.current.undo();
        const newBoard = [...board];
        for(let i = 0; i < 8; i++){
          for(let j = 0; j < 8; j++){
            if(newBoard[i][j] === 'dot'){
              newBoard[i][j] = null;
            }
          }
        }
        setBoard(newBoard);
        setCapturablePieces([]);
        setSelectedCell(null);
        setIllegalMoveMessage(gameStatus === 'check' ? 'This move does not get you out of check!' : 'Illegal move!');
        setTimeout(() => setIllegalMoveMessage(''), 2000);
      }
    }
  };

  const makeAIMove = (move) => {
    if (!move) return;

    const from = move.substring(0, 2);
    const to = move.substring(2, 4);
    
    const fromRow = 8 - parseInt(from[1]);
    const fromCol = from.charCodeAt(0) - 'a'.charCodeAt(0);
    const toRow = 8 - parseInt(to[1]);
    const toCol = to.charCodeAt(0) - 'a'.charCodeAt(0);

    const newBoard = [...board];
    const piece = newBoard[fromRow][fromCol];
    
    newBoard[toRow][toCol] = piece;
    newBoard[fromRow][fromCol] = null;

    const moveHistoryEntry = {
      from: { row: fromRow, col: fromCol, piece: piece },
      to: { row: toRow, col: toCol, capturedPiece: board[toRow][toCol] }
    };
    
    setBoard(newBoard);
    setMoveHistory(prev => [...prev, moveHistoryEntry]);
    setSelectedCell(null);
    setCapturablePieces([]);
    setIsWhiteTurn(true);
    setIsThinking(false);

    if (board[toRow][toCol]) {
      playSound(captureSound);
    } else {
      playSound(moveSound);
    }
    animatePiece(
      { row: fromRow, col: fromCol },
      { row: toRow, col: toCol }
    );

    try {
      chess.current.move({ from, to });
      checkGameStatus();
    } catch (error) {
      console.error('Invalid move:', error);
    }
  };

  useEffect(() => {
    if (moveHistory.length > 0) {
      const lastMove = moveHistory[moveHistory.length - 1];
      const from = files[lastMove.from.col] + ranks[lastMove.from.row];
      const to = files[lastMove.to.col] + ranks[lastMove.to.row];
      
      try {
        chess.current.move({ from, to });
        checkGameStatus();
      } catch (error) {
        console.error('Invalid move:', error);
      }
    }
  }, [moveHistory]);

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const isWithinBounds = (row, col) => {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  };

  const canCapture = (piece, targetPiece) => {
    if (!targetPiece) return false;
    const isPieceWhite = piece === piece.toUpperCase();
    const isTargetWhite = targetPiece === targetPiece.toUpperCase();
    return isPieceWhite !== isTargetWhite;
  };

  const addValidMove = (newBoard, row, col, piece) => {
    if (!isWithinBounds(row, col)) return false;
    
    if (board[row][col] === null) {
      newBoard[row][col] = 'dot';
      return true;
    } else if (canCapture(piece, board[row][col])) {
      newBoard[row][col] = board[row][col];
      setCapturablePieces(prev => [...prev, {row, col}]);
      return false;
    }
    return false;
  };

  const getPieceComponent = (piece, rowIndex, colIndex) => {
    if (!piece) return null;
    
    if(piece === 'dot') {
      return <div className="chess-piece dot" />;
    }

    const pieceColor = piece === piece.toUpperCase() ? 'white' : 'black';
    const pieceType = piece.toLowerCase();
    const isCapturable = capturablePieces.some(p => p.row === rowIndex && p.col === colIndex);
    
    return (
      <div className={`chess-piece ${pieceColor}-${pieceType} ${isCapturable ? 'capturable' : ''}`} />
    );
  };

  const changeBoardBasedOnPiece = (rowIndex, colIndex, piece) => {
    const newBoard = [...board];
    setCapturablePieces([]);
    
    const isWhite = piece === piece.toUpperCase();
    const pieceType = piece.toLowerCase();

    switch (pieceType) {
      case 'p':
        const direction = isWhite ? -1 : 1;
        const startRow = isWhite ? 6 : 1;
        
        if (isWithinBounds(rowIndex + direction, colIndex) && board[rowIndex + direction][colIndex] === null) {
          newBoard[rowIndex + direction][colIndex] = 'dot';
          
          if (rowIndex === startRow && board[rowIndex + 2 * direction][colIndex] === null) {
            newBoard[rowIndex + 2 * direction][colIndex] = 'dot';
          }
        }
        
        [-1, 1].forEach(offset => {
          const captureRow = rowIndex + direction;
          const captureCol = colIndex + offset;
          if (isWithinBounds(captureRow, captureCol) && canCapture(piece, board[captureRow][captureCol])) {
            newBoard[captureRow][captureCol] = board[captureRow][captureCol];
            setCapturablePieces(prev => [...prev, {row: captureRow, col: captureCol}]);
          }
        });
        break;

      case 'r':
        for (let col = colIndex - 1; col >= 0; col--) {
          if (!addValidMove(newBoard, rowIndex, col, piece)) break;
        }
        for (let col = colIndex + 1; col < 8; col++) {
          if (!addValidMove(newBoard, rowIndex, col, piece)) break;
        }
        
        for (let row = rowIndex - 1; row >= 0; row--) {
          if (!addValidMove(newBoard, row, colIndex, piece)) break;
        }
        for (let row = rowIndex + 1; row < 8; row++) {
          if (!addValidMove(newBoard, row, colIndex, piece)) break;
        }
        break;

      case 'n':
        const knightMoves = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        
        knightMoves.forEach(([rowOffset, colOffset]) => {
          const newRow = rowIndex + rowOffset;
          const newCol = colIndex + colOffset;
          if (isWithinBounds(newRow, newCol)) {
            if (board[newRow][newCol] === null) {
              newBoard[newRow][newCol] = 'dot';
            } else if (canCapture(piece, board[newRow][newCol])) {
              newBoard[newRow][newCol] = board[newRow][newCol];
              setCapturablePieces(prev => [...prev, {row: newRow, col: newCol}]);
            }
          }
        });
        break;

      case 'b':
        const bishopDirections = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        
        bishopDirections.forEach(([rowDir, colDir]) => {
          let row = rowIndex + rowDir;
          let col = colIndex + colDir;
          
          while (isWithinBounds(row, col)) {
            if (!addValidMove(newBoard, row, col, piece)) break;
            row += rowDir;
            col += colDir;
          }
        });
        break;

      case 'q':
        for (let col = colIndex - 1; col >= 0; col--) {
          if (!addValidMove(newBoard, rowIndex, col, piece)) break;
        }
        for (let col = colIndex + 1; col < 8; col++) {
          if (!addValidMove(newBoard, rowIndex, col, piece)) break;
        }
        for (let row = rowIndex - 1; row >= 0; row--) {
          if (!addValidMove(newBoard, row, colIndex, piece)) break;
        }
        for (let row = rowIndex + 1; row < 8; row++) {
          if (!addValidMove(newBoard, row, colIndex, piece)) break;
        }
        
        const queenDirections = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        queenDirections.forEach(([rowDir, colDir]) => {
          let row = rowIndex + rowDir;
          let col = colIndex + colDir;
          
          while (isWithinBounds(row, col)) {
            if (!addValidMove(newBoard, row, col, piece)) break;
            row += rowDir;
            col += colDir;
          }
        });
        break;

      case 'k':
        const kingMoves = [
          [-1, -1], [-1, 0], [-1, 1],
          [0, -1], [0, 1],
          [1, -1], [1, 0], [1, 1]
        ];
        
        kingMoves.forEach(([rowOffset, colOffset]) => {
          const newRow = rowIndex + rowOffset;
          const newCol = colIndex + colOffset;
          if (isWithinBounds(newRow, newCol)) {
            if (board[newRow][newCol] === null) {
              newBoard[newRow][newCol] = 'dot';
            } else if (canCapture(piece, board[newRow][newCol])) {
              newBoard[newRow][newCol] = board[newRow][newCol];
              setCapturablePieces(prev => [...prev, {row: newRow, col: newCol}]);
            }
          }
        });
        break;
    }

    setBoard(newBoard);
  };

  const handleUndo = () => {
    if (moveHistory.length === 0) return;

    const lastMove = moveHistory[moveHistory.length - 1];
    const newBoard = board.map(row => [...row]);
    
    newBoard[lastMove.to.row][lastMove.to.col] = lastMove.to.capturedPiece;
    newBoard[lastMove.from.row][lastMove.from.col] = lastMove.from.piece;
    
    for(let i = 0; i < 8; i++){
      for(let j = 0; j < 8; j++){
        if(newBoard[i][j] === 'dot'){
          newBoard[i][j] = null;
        }
      }
    }
    
    setBoard(newBoard);
    setMoveHistory(prev => prev.slice(0, -1));
    setIsWhiteTurn(prevTurn => !prevTurn);
    setSelectedCell(null);
    setCapturablePieces([]);
  };

  const handleReset = () => {
    setBoard(initialBoard);
    setSelectedCell(null);
    setIsWhiteTurn(true);
    setCapturablePieces([]);
    setMoveHistory([]);
    setGameStatus('ongoing');
    setWinner(null);
    chess.current = new Chess();
  };

  const handleAIModeToggle = (e) => {
    const newAIMode = e.target.checked;
    setIsAIMode(newAIMode);
    handleReset();
  };

  return (
    <div className="flex flex-col items-center min-h-screen py-8 bg-gradient-to-b from-amber-50 to-amber-100">
      <h1 className="text-3xl font-bold mb-2 text-amber-900">Chess Game</h1>
      
      <div className="mb-6 px-4 py-2 bg-amber-800 text-amber-50 rounded-full font-semibold">
        {gameStatus === 'checkmate' ? `Checkmate! ${winner === 'white' ? 'White' : 'Black'} wins!` :
         gameStatus === 'stalemate' ? 'Stalemate! Game is a draw.' :
         isThinking ? 'AI is thinking...' :
         gameStatus === 'check' ? `${isWhiteTurn ? 'White' : 'Black'} is in check!` :
         `${isWhiteTurn ? 'White' : 'Black'} to move`}
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
              onClick={handleReset}
            >
              New Game
            </button>
          </div>
        </div>
      )}
      
      {illegalMoveMessage && (
        <div className="mb-4 px-4 py-2 bg-red-600 text-white rounded-full font-semibold animate-fade-in">
          {illegalMoveMessage}
        </div>
      )}

      <div className="mb-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-amber-900 font-medium">AI Mode:</label>
          <input
            type="checkbox"
            checked={isAIMode}
            onChange={handleAIModeToggle}
            className="w-4 h-4"
          />
        </div>
        
        {isAIMode && (
          <div className="flex items-center gap-2">
            <label className="text-amber-900 font-medium">AI Difficulty:</label>
            <input
              type="range"
              min="1"
              max="20"
              value={aiDifficulty}
              onChange={(e) => setAiDifficulty(parseInt(e.target.value))}
              className="w-32"
            />
            <span className="text-amber-900">{aiDifficulty}</span>
          </div>
        )}
      </div>

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
              {board.map((row, rowIndex) => (
                <div key={`row-${rowIndex}`} className="board-row">
                  {row.map((piece, colIndex) => {
                    const isBlackSquare = (rowIndex + colIndex) % 2 === 1;
                    const isSelected = selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex;
                    
                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`board-cell ${isBlackSquare ? 'black-cell' : 'white-cell'} ${isSelected ? 'selected-cell' : ''}`}
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
          disabled={moveHistory.length === 0}
        >
          Undo Move
        </button>
        <button
          className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base ${isSoundOn ? 'bg-green-700 text-green-50 hover:bg-green-600' : 'bg-red-700 text-red-50 hover:bg-red-600'} rounded-md shadow-md transition-colors font-medium`}
          onClick={() => setIsSoundOn(!isSoundOn)}
        >
          {isSoundOn ? '🔊 Sound On' : '🔇 Sound Off'}
        </button>
      </div>

      <style jsx>{`
        .chess-piece {
          transition: transform 0.3s ease;
        }
        
        .chess-piece.animating {
          animation: movePiece 0.3s ease;
        }
        
        @keyframes movePiece {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(var(--move-x), var(--move-y));
          }
        }
      `}</style>
    </div>
  );
};

export default App;
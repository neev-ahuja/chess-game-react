import { Routes , Route } from "react-router-dom";
import LandingPage from "./Components/LandingPage";
import ChessBoard from "./Components/ChessBoard";
import ComingSoon from "./Components/ComingSoon";
const App = () => {
  return (
    <div>
      <Routes>
        <Route exact path="/" element={<LandingPage />} />
        <Route path="/pass" element={<ChessBoard mode={'pass'} />} />
        <Route path="/online" element={<ComingSoon/>} />
        <Route path="/computer" element={<ChessBoard mode={'computer'} />} />
      </Routes>
    </div>
  )
}

export default App

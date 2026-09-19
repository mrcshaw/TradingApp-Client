import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { generateStrategy, testStrategy } from './features/strategySlice';
import { ClipboardCopy } from 'lucide-react';
import Editor from '@monaco-editor/react';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const { pineScript, pythonScript, explanation, testResults, status, testStatus, error, testError } = useSelector((state) => state.strategy);

  const [description, setDescription] = useState('Buy when RSI crosses below 30');
  const [symbol, setSymbol] = useState('ES=F');
  const [quantity, setQuantity] = useState(1);
  
  // Keep local state for editors so users can manually edit before testing
  const [localPythonScript, setLocalPythonScript] = useState('');
  
  useEffect(() => {
    setLocalPythonScript(pythonScript);
  }, [pythonScript]);

  const handleGenerate = (e) => {
    e.preventDefault();
    dispatch(generateStrategy({ description, symbol, quantity }));
  };

  const handleTest = () => {
    if (localPythonScript) {
      dispatch(testStrategy({ pythonScript: localPythonScript, symbol }));
    } else {
      alert("No Python script generated yet. Please generate the strategy first.");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="App">
      <header className="header">
        <h1>TradingApp Strategy Studio</h1>
        <p>Powered by Qwen 2.5 Coder & VectorBT</p>
      </header>

      <main className="main-content">
        {/* LEFT PANEL - INPUTS */}
        <div className="left-panel">
          <h2>Strategy Generator</h2>
          <form onSubmit={handleGenerate}>
            <div className="form-group">
              <label>Natural Language Strategy</label>
              <textarea 
                rows="6" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your strategy logic..."
              />
            </div>
            
            <div className="form-group">
              <label>Target Contract / Symbol</label>
              <input 
                type="text" 
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Default Quantity</label>
              <input 
                type="number" 
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>

            <button type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Generating with Qwen...' : 'Generate Strategy'}
            </button>
            
            {error && <div style={{color: 'red', marginTop: '10px'}}>Error: {JSON.stringify(error)}</div>}
          </form>

          {explanation && (
            <div style={{marginTop: '20px', padding: '15px', backgroundColor: '#333', borderRadius: '4px'}}>
              <h4>AI Explanation</h4>
              <p>{explanation}</p>
            </div>
          )}
        </div>

        {/* RIGHT PANEL - RESULTS */}
        <div className="right-panel">
          
          <div className="result-card">
            <div className="card-header">
              <h3>Pine Script v5 (TradingView)</h3>
              <button className="copy-btn" onClick={() => copyToClipboard(pineScript)}>
                <ClipboardCopy size={16} style={{marginRight: '5px'}}/> Copy
              </button>
            </div>
            <div style={{ border: '1px solid #444', borderRadius: '4px', overflow: 'hidden' }}>
              <Editor
                height="350px"
                defaultLanguage="javascript" // Pine Script isn't built-in, JS gives reasonable highlighting
                theme="vs-dark"
                value={pineScript || "// Pine Script will appear here"}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 14
                }}
              />
            </div>
          </div>

          <div className="result-card">
            <div className="card-header">
              <h3>Python (VectorBT Logic)</h3>
              <div>
                <button className="copy-btn" onClick={() => copyToClipboard(pythonScript)} style={{marginRight: '10px'}}>
                  <ClipboardCopy size={16} style={{marginRight: '5px'}}/> Copy
                </button>
                <button 
                  onClick={handleTest} 
                  disabled={!pythonScript || testStatus === 'loading'}
                  style={{backgroundColor: '#00e676', color: '#000'}}
                >
                  {testStatus === 'loading' ? 'Running Backtest...' : 'Run Local Backtest'}
                </button>
              </div>
            </div>
            <div style={{ border: '1px solid #444', borderRadius: '4px', overflow: 'hidden' }}>
              <Editor
                height="250px"
                defaultLanguage="python"
                theme="vs-dark"
                value={localPythonScript || "# Python vectorized logic will appear here"}
                onChange={(value) => setLocalPythonScript(value)}
                options={{
                  readOnly: false,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 14
                }}
              />
            </div>
            {testError && <div style={{color: 'red', marginTop: '10px'}}>Test Error: {JSON.stringify(testError)}</div>}
          </div>

          {testResults && (
            <div className="result-card">
              <div className="card-header">
                <h3>Backtest Results ({testResults.symbol})</h3>
              </div>
              <div className="stats-grid">
                <div className="stat-box">
                  <div className="stat-label">Net Profit</div>
                  <div className={`stat-value ${testResults.netProfit >= 0 ? 'positive' : 'negative'}`}>
                    ${testResults.netProfit.toFixed(2)}
                  </div>
                </div>
                <div className="stat-box">
                  <div className="stat-label">Max Drawdown</div>
                  <div className="stat-value negative">
                    {(testResults.maxDrawdown * 100).toFixed(2)}%
                  </div>
                </div>
                <div className="stat-box">
                  <div className="stat-label">Win Rate</div>
                  <div className="stat-value">
                    {(testResults.winRate * 100).toFixed(2)}%
                  </div>
                </div>
                <div className="stat-box">
                  <div className="stat-label">Total Trades</div>
                  <div className="stat-value">{testResults.totalTrades}</div>
                </div>
                <div className="stat-box">
                  <div className="stat-label">Avg Winning Trade</div>
                  <div className="stat-value positive">
                    {(testResults.stats['Avg Winning Trade [%]'] * 100).toFixed(2)}%
                  </div>
                </div>
                <div className="stat-box">
                  <div className="stat-label">Expectancy</div>
                  <div className={`stat-value ${testResults.stats['Expectancy'] >= 0 ? 'positive' : 'negative'}`}>
                    {testResults.stats['Expectancy'].toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
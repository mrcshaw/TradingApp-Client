import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Thunk to call the Java Analysis Service for generation
export const generateStrategy = createAsyncThunk(
  'strategy/generate',
  async ({ description, symbol, quantity }, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://localhost:8082/api/analysis/strategy/generate', {
        userDescription: description,
        contractSymbol: symbol,
        defaultQuantity: quantity
      });
      // The Java backend returns a StrategyScriptResponse object containing pineScript, pythonScript, explanation
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Thunk to test the generated Python script
export const testStrategy = createAsyncThunk(
  'strategy/test',
  async ({ pythonScript, symbol }, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://localhost:8082/api/analysis/strategy/test', {
        pythonScript,
        symbol
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const strategySlice = createSlice({
  name: 'strategy',
  initialState: {
    pineScript: '',
    pythonScript: '',
    explanation: '',
    testResults: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    testStatus: 'idle',
    error: null,
    testError: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(generateStrategy.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(generateStrategy.fulfilled, (state, action) => {
        state.status = 'succeeded';
        try {
           let rawText = action.payload.pineScript || action.payload;
           
           // Strategy 1: The AI returned standard markdown json ```json ... ```
           let match = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
           let jsonStr = match ? match[1] : rawText;

           // Strategy 2: Some models like Gemma escape quotes and add random backticks (e.g. ` instead of ") inside the JSON values.
           // To be absolutely robust against erratic local LLM outputs, we will perform a safe eval if JSON.parse fails.
           let parsed;
           try {
               parsed = JSON.parse(jsonStr);
           } catch (e) {
               // Fallback: use a safe function constructor to evaluate the string if it's formatted as a Javascript object
               // This handles cases where Gemma uses backticks for multiline strings instead of standard JSON formatting
               parsed = new Function('return ' + jsonStr)();
           }
           
           // Format Pine Script to ensure it looks clean if escaped characters are present
           const rawPine = parsed.pineScript || '';
           state.pineScript = rawPine.replace(/\\n/g, '\n');
           
           const rawPython = parsed.pythonScript || '';
           state.pythonScript = rawPython.replace(/\\n/g, '\n');
           
           state.explanation = parsed.explanation || '';
        } catch (e) {
           state.pineScript = action.payload.pineScript || action.payload;
           state.pythonScript = action.payload.pythonScript || '';
           state.explanation = action.payload.explanation || 'Failed to parse JSON cleanly. See raw output in Pine Script box.';
        }
      })
      .addCase(generateStrategy.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(testStrategy.pending, (state) => {
        state.testStatus = 'loading';
        state.testError = null;
        state.testResults = null;
      })
      .addCase(testStrategy.fulfilled, (state, action) => {
        state.testStatus = 'succeeded';
        state.testResults = action.payload;
      })
      .addCase(testStrategy.rejected, (state, action) => {
        state.testStatus = 'failed';
        state.testError = action.payload;
      });
  }
});

export default strategySlice.reducer;
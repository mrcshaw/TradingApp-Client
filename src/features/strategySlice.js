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
        // Note: Right now our Java backend just dumps Gemma's raw text into 'pineScript'.
        // In a real structured JSON output from Gemma, we'd parse this.
        // For MVP, if it returns raw JSON string, we can try to parse it.
        try {
           const parsed = JSON.parse(action.payload.pineScript);
           state.pineScript = parsed.pineScript || '';
           state.pythonScript = parsed.pythonScript || '';
           state.explanation = parsed.explanation || '';
        } catch (e) {
           // Fallback to dumping whatever the LLM returned into pineScript
           state.pineScript = action.payload.pineScript;
           state.pythonScript = action.payload.pythonScript || '';
           state.explanation = action.payload.explanation || 'Failed to parse JSON';
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
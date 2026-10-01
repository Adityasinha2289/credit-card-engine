import { render, screen } from '@testing-library/react';
import { it, expect } from 'vitest';
import React from 'react';
import App from './src/App';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';

it('renders app', async () => {
  try {
    render(
      <ClerkProvider publishableKey="test">
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ClerkProvider>
    );
    await new Promise(r => setTimeout(r, 2000));
    console.log(document.body.innerHTML);
  } catch (e) {
    console.log("REACT ERROR IS:", e);
  }
});

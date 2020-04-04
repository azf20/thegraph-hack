import React from 'react';
import ReactDOM from 'react-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/core/styles';
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";
import App from './App';
import theme from './theme';

const client = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/sablierhq/sablier",
});

ReactDOM.render(
  <ThemeProvider theme={theme}>
    {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
    <CssBaseline />
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </ThemeProvider>,
  document.querySelector('#root'),
);

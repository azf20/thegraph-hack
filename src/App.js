import React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import ProTip from './ProTip';
import GraphNetwork from './GraphNetwork'
import Paper from '@material-ui/core/Paper';
import AppBar from './app-bar'

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://azfuller.com/">
        Adam Fuller
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

export default function App() {
  return (
    <>
    <AppBar title={"Graph TheGraph: Explore Sablier Streams"} githubUser={"azf20/thegraph-hack"} />
    <Container>
      <Box my={4}>
        <Paper>
        <GraphNetwork/>
        </Paper>
        <ProTip />
        <Copyright />
      </Box>
    </Container>
    </>
  );
}

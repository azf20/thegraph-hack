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
    <AppBar title={"Graph TheGraph: Sablier Interactive"} githubUser={"azf20/thegraph-hack"} />
    <Container>
      <Box m={1}>
        <ProTip test={<>Click Start to explore <Link href="https://sablier.finance/">Sablier</Link> streams</>}/>
        <Paper>
        <GraphNetwork/>
        </Paper>
        <ProTip test={
          <>
              Made with curiosity as part of the
              <Link href="https://medium.com/encode-club/prizes-and-challenges-future-of-blockchain-competition-40fe71bfe0ac">StakeZero Future of Blockchain Hackathon</Link>
              . Built with <Link href="https://thegraph.com/">The Graph</Link>, <Link href="https://sablier.finance/">Sablier</Link>, <Link href="https://js.cytoscape.org/">Cytoscape</Link>, <Link href="https://github.com/PaulRBerg/create-eth-app">create-eth-app</Link> and <Link href="https://material-ui.com/">material-ui</Link>.
              </>}/>
        <Copyright />
      </Box>
    </Container>
    </>
  );
}

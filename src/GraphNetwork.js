import React from "react";
import { gql } from "apollo-boost";
import { useQuery } from "@apollo/react-hooks";
import CytoscapeComponent from 'react-cytoscapejs';
import Select from 'react-select'
import Link from '@material-ui/core/Link';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import "./GraphNetwork.css";
import { makeStyles } from '@material-ui/core/styles';
import Cytoscape from 'cytoscape';
import cola from 'cytoscape-cola';
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from '@date-io/date-fns'; // choose your lib
import fcose from 'cytoscape-fcose';

Cytoscape.use(fcose);

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));

var EventEmitter = require('eventemitter3');

var EE = new EventEmitter()

const GET_TRANSFERS = gql`
query GetStreams($streamsToShow: Int! $startingTime: String! $endingTime: String!)
  {
    streams(first: $streamsToShow where: {timestamp_gte: $startingTime timestamp_lte: $endingTime}) {
      id
      sender
      recipient
      deposit
      token { id name decimals symbol}
      startTime
      stopTime
      ratePerSecond
      exchangeRateInitial
      timestamp
    	txs(where: { event: "CreateStream" }) {
        from
        to
      event
      }
    	withdrawals {
        id
        amount
        timestamp
      }
      cancellation {
        id
        recipientBalance
        senderBalance
        txhash
        timestamp
      }
  },
    tokens {
      id
      name
      symbol
    }
  }
`;

function InfoTab() {

    const [infoNode, updateInfoNode] = React.useState(null);
    const [totalStreams, updateTotalStreams] = React.useState(0);
    const [totalNodes, updateTotalNodes] = React.useState(0);

    function emitted(context) {
        updateInfoNode(context); // true
      }

    function totalsUpdate(context) {
        updateTotalNodes(context[0])
        updateTotalStreams(context[1])
      }

    EE.on('node-click', emitted);
    EE.on('totals-update', totalsUpdate);

    function niceDateString(timestamp) {
      return new Intl.DateTimeFormat('en-GB', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'}).format(timestamp)
    }

    function etherscanLink(type, id) {
      return 'https://etherscan.io/' + type + '/' + id
    }

  return (
    <>
    <div className="nodeInfo">
    <TableContainer component={Paper}>
          <Table aria-label="simple table" size="small">
            <TableBody>
                <TableRow key="totalNodes">
                  <TableCell component="th" scope="row" className="addressCell">
                    Active Accounts
                  </TableCell>
                  <TableCell align="right">{totalNodes}</TableCell>
                </TableRow>
                <TableRow key="totalStreams">
                  <TableCell component="th" scope="row" className="addressCell">
                    Total Streams
                  </TableCell>
                  <TableCell align="right">{totalStreams}</TableCell>
                </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
    </div>
    {infoNode ? <div className="nodeInfo">
    {"source" in infoNode ?
    <>
    <TableContainer component={Paper}>
          <Table aria-label="simple table" size="small">
            <TableBody>
                <TableRow key="source">
                  <TableCell component="th" scope="row">Sender</TableCell>
                  <TableCell align="right" className="addressCell"><Link href={etherscanLink('address',infoNode.source)} target="_blank">{infoNode.source}</Link></TableCell>
                </TableRow>
                <TableRow key="target">
                  <TableCell component="th" scope="row">Recipient</TableCell>
                  <TableCell align="right" className="addressCell"><Link href={etherscanLink('address',infoNode.target)} target="_blank">{infoNode.target}</Link></TableCell>
                </TableRow>
                <TableRow key="token">
                  <TableCell component="th" scope="row">Token</TableCell>
                  <TableCell align="right">{infoNode.token}</TableCell>
                </TableRow>
                <TableRow key="timestamp">
                  <TableCell component="th" scope="row">Created at</TableCell>
                  <TableCell align="right">{niceDateString(infoNode.timestamp * 1000)}</TableCell>
                </TableRow>
                <TableRow key="timeframe">
                  <TableCell component="th" scope="row">Timeframe</TableCell>
                  <TableCell align="right">{niceDateString(infoNode.startTime * 1000) + " to " + niceDateString(infoNode.stopTime * 1000)}</TableCell>
                </TableRow>
                <TableRow key="timeLength">
                  <TableCell component="th" scope="row">Minutes</TableCell>
                  <TableCell align="right">{(infoNode.stopTime - infoNode.startTime) / 60}</TableCell>
                </TableRow>
                <TableRow key="deposit">
                  <TableCell component="th" scope="row">Deposit</TableCell>
                  <TableCell align="right">{infoNode.deposit / Math.pow(10, infoNode.decimals)}</TableCell>
                </TableRow>
                <TableRow key="withdrawn">
                  <TableCell component="th" scope="row">Withdrawn</TableCell>
                  <TableCell align="right">{infoNode.withdrawalTotal / Math.pow(10, infoNode.decimals)}</TableCell>
                </TableRow>
                {infoNode.cancellation ?
                <>
                <TableRow key="cancellationTransaction">
                  <TableCell component="th" scope="row">Cancellation</TableCell>
                  <TableCell align="right" className="addressCell">
                    <Link href={etherscanLink('tx',infoNode.cancellation.txhash)} target="_blank">{infoNode.cancellation.txhash}</Link>
                  </TableCell>
                </TableRow>
                <TableRow key="cancellationSenderBalance">
                  <TableCell component="th" scope="row">SenderBalance</TableCell>
                  <TableCell align="right">{infoNode.cancellation.senderBalance / Math.pow(10, infoNode.decimals)}</TableCell>
                </TableRow>
                <TableRow key="cancellationRecipientBalance">
                  <TableCell component="th" scope="row">RecipientBalance</TableCell>
                  <TableCell align="right">{infoNode.cancellation.recipientBalance / Math.pow(10, infoNode.decimals)}</TableCell>
                </TableRow>
                </>
                : null
              }
            </TableBody>
          </Table>
        </TableContainer>
    {infoNode.withdrawalCount > 0 ?
    <>
    <p></p>
    <TableContainer component={Paper}>
          <Table aria-label="simple table" size="small">
            <TableHead>
              <TableRow>
                <TableCell>Withdrawal</TableCell>
                <TableCell align="right">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {infoNode.withdrawals.map((row) => (
                <TableRow key={row.id}>
                  <TableCell component="th" scope="row" className="addressCell">
                    <Link href={etherscanLink('tx',row.id)} target="_blank">{row.id}</Link>
                  </TableCell>
                  <TableCell align="right">{row.amount / Math.pow(10, infoNode.decimals)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        </>
        : null}
    </>
    : <>
    <TableContainer component={Paper}>
    <Table size="small">
    <TableBody>
        <TableRow key="id">
          <TableCell component="th" scope="row">Account</TableCell>
          <TableCell align="right" className="addressCell">
          <Link href={etherscanLink('address',infoNode.id)} target="_blank">{infoNode.id}</Link>
          </TableCell>
        </TableRow>
        <TableRow key="sends">
          <TableCell component="th" scope="row">Sends</TableCell>
          <TableCell align="right">{infoNode.sends}</TableCell>
        </TableRow>
        <TableRow key="receives">
          <TableCell component="th" scope="row">Receives</TableCell>
          <TableCell align="right">{infoNode.receives}</TableCell>
        </TableRow>
    </TableBody>
  </Table>
  </TableContainer>
  <p></p>
  <TableContainer component={Paper}>
        <Table aria-label="simple table" size="small">
          <TableHead>
            <TableRow>
              <TableCell>Counterpart</TableCell>
              <TableCell align="right">Stream</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {infoNode.transactionDetails.map((row) => (
              <TableRow key={row.id + row.type}>
                <TableCell component="th" scope="row" className="addressCell">
                  <Link href={etherscanLink('address',row.counterpart)} target="_blank">{row.counterpart}</Link>
                </TableCell>
                <TableCell align="right">{row.type + ' ' + Math.round(row.transferred / Math.pow(10, row.decimals) * 100) / 100 + ' / ' + Math.round(row.deposit / Math.pow(10, row.decimals) * 100) / 100 + ' ' + row.token}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>}
    </div>
    : null}
    </>
    )
}

function CytoscapeNetwork() {

    const streamsToShow = 500

    function dateToTimestampString(date) {
      return Math.round(date.getTime()/1000).toString();
    }

    const [startingTime, updateStartingTime] = React.useState(new Date(2020,1,1))
    const [endingTime, updateEndingTime] = React.useState(new Date())

    const { loading, error, data } = useQuery(GET_TRANSFERS, {
    variables: { streamsToShow, startingTime: dateToTimestampString(startingTime), endingTime: dateToTimestampString(endingTime)},
  });

    const [myCyRef, updateMyCyRef] = React.useState({
    });

    const [cytoscapeData, updateCytoscapeData] = React.useState({
    });

    const [windowSize, updateWindowSize] = React.useState({
      w: "40vw",
      h: "50vh"
    })

    const [tokenOptions, setTokenOptions] = React.useState([]);

    const [refreshButton, setRefreshButton] = React.useState('Start');

    const coseLayout = {
    name: 'cola',
    animate: true, // whether to show the layout as it's running
    refresh: 1, // number of ticks per frame; higher is faster but more jerky
    maxSimulationTime: 6000, // max length in ms to run the layout
    ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
    fit: true, // on every layout reposition of nodes, fit the viewport
    padding: 30, // padding around the simulation
    boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
    nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node

    // layout event callbacks
    ready: function(){}, // on layoutready
    stop: function(){}, // on layoutstop

    // positioning options
    randomize: false, // use random node positions at beginning of layout
    avoidOverlap: true, // if true, prevents overlap of node bounding boxes
    handleDisconnected: true, // if true, avoids disconnected components from overlapping
    convergenceThreshold: 0.01, // when the alpha value (system energy) falls below this value, the layout stops
    nodeSpacing: function( node ){ return 10; }, // extra spacing around nodes
    flow: undefined, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
    alignment: undefined, // relative alignment constraints on nodes, e.g. function( node ){ return { x: 0, y: 1 } }
    gapInequalities: undefined, // list of inequality constraints for the gap between the nodes, e.g. [{"axis":"y", "left":node1, "right":node2, "gap":25}]

    // different methods of specifying edge length
    // each can be a constant numerical value or a function like `function( edge ){ return 2; }`
    edgeLength: undefined, // sets edge length directly in simulation
    edgeSymDiffLength: undefined, // symmetric diff edge length in simulation
    edgeJaccardLength: undefined, // jaccard edge length in simulation

    // iterations of cola algorithm; uses default values on undefined
    unconstrIter: undefined, // unconstrained initial layout iterations
    userConstIter: undefined, // initial layout iterations with user-specified constraints
    allConstIter: undefined, // initial layout iterations with all constraints including non-overlap

    // infinite layout options
    infinite: false // overrides all other options for a forces-all-the-time mode
  };

  var cytoscapeLayout = {
  name: 'fcose',

  // 'draft', 'default' or 'proof'
  // - "draft" only applies spectral layout
  // - "default" improves the quality with incremental layout (fast cooling rate)
  // - "proof" improves the quality with incremental layout (slow cooling rate)
  quality: "default",
  // Use random node positions at beginning of layout
  // if this is set to false, then quality option must be "proof"
  randomize: true,
  // Whether or not to animate the layout
  animate: true,
  // Duration of animation in ms, if enabled
  animationDuration: 1000,
  // Easing of animation, if enabled
  animationEasing: undefined,
  // Fit the viewport to the repositioned nodes
  fit: true,
  // Padding around layout
  padding: 30,
  // Whether to include labels in node dimensions. Valid in "proof" quality
  nodeDimensionsIncludeLabels: false,
  // Whether or not simple nodes (non-compound nodes) are of uniform dimensions
  uniformNodeDimensions: false,
  // Whether to pack disconnected components - valid only if randomize: true
  packComponents: true,

  /* spectral layout options */

  // False for random, true for greedy sampling
  samplingType: true,
  // Sample size to construct distance matrix
  sampleSize: 25,
  // Separation amount between nodes
  nodeSeparation: 75,
  // Power iteration tolerance
  piTol: 0.0000001,

  /* incremental layout options */

  // Node repulsion (non overlapping) multiplier
  nodeRepulsion: 4500,
  // Ideal edge (non nested) length
  idealEdgeLength: 50,
  // Divisor to compute edge forces
  edgeElasticity: 0.45,
  // Nesting factor (multiplier) to compute ideal edge length for nested edges
  nestingFactor: 0.1,
  // Maximum number of iterations to perform
  numIter: 2500,
  // For enabling tiling
  tile: true,
  // Represents the amount of the vertical space to put between the zero degree members during the tiling operation(can also be a function)
  tilingPaddingVertical: 10,
  // Represents the amount of the horizontal space to put between the zero degree members during the tiling operation(can also be a function)
  tilingPaddingHorizontal: 10,
  // Gravity force (constant)
  gravity: 0.25,
  // Gravity range (constant) for compounds
  gravityRangeCompound: 1.5,
  // Gravity force (constant) for compounds
  gravityCompound: 1.0,
  // Gravity range (constant)
  gravityRange: 3.8,
  // Initial cooling factor for incremental layout
  initialEnergyOnIncremental: 0.3,

  /* layout event callbacks */
  ready: () => {}, // on layoutready
  stop: () => {} // on layoutstop
};

    function normaliseTransactions(node) {
      const newNode = node;
      newNode['data']['normalisedTransactions'] = Math.log(newNode['data']['transactions']*10000);
      return newNode
    }

    function tokenSelectChange(values) {
      EE.emit('filter-select', values)}

    function resetView() {
      EE.emit('reset-view')}

    const colors = [
    "#63b598", "#ce7d78", "#ea9e70", "#a48a9e", "#c6e1e8", "#648177" ,"#0d5ac1" ,
    "#f205e6" ,"#1c0365" ,"#14a9ad" ,"#4ca2f9" ,"#a4e43f" ,"#d298e2" ,"#6119d0",
    "#d2737d" ,"#c0a43c" ,"#f2510e" ,"#651be6" ,"#79806e" ,"#61da5e" ,"#cd2f00" ,
    "#9348af" ,"#01ac53" ,"#c5a4fb" ,"#996635","#b11573" ,"#4bb473" ,"#75d89e" ,
    "#2f3f94" ,"#2f7b99" ,"#da967d" ,"#34891f" ,"#b0d87b" ,"#ca4751" ,"#7e50a8" ,
    "#c4d647" ,"#e0eeb8" ,"#11dec1" ,"#289812" ,"#566ca0" ,"#ffdbe1" ,"#2f1179" ,
    "#935b6d" ,"#916988" ,"#513d98" ,"#aead3a", "#9e6d71", "#4b5bdc", "#0cd36d",
    "#250662", "#cb5bea", "#228916", "#ac3e1b", "#df514a", "#539397", "#880977",
    "#f697c1", "#ba96ce", "#679c9d", "#c6c42c", "#5d2c52", "#48b41b", "#e1cf3b",
    "#5be4f0", "#57c4d8", "#a4d17a", "#225b8", "#be608b", "#96b00c", "#088baf",
    "#f158bf", "#e145ba", "#ee91e3", "#05d371", "#5426e0", "#4834d0", "#802234",
    "#6749e8", "#0971f0", "#8fb413", "#b2b4f0", "#c3c89d", "#c9a941", "#41d158",
    "#fb21a3", "#51aed9", "#5bb32d", "#807fb", "#21538e", "#89d534", "#d36647",
    "#7fb411", "#0023b8", "#3b8c2a", "#986b53", "#f50422", "#983f7a", "#ea24a3",
    "#79352c", "#521250", "#c79ed2", "#d6dd92", "#e33e52", "#b2be57", "#fa06ec",
    "#1bb699", "#6b2e5f", "#64820f", "#1c271", "#21538e", "#89d534", "#d36647",
    "#7fb411", "#0023b8", "#3b8c2a", "#986b53", "#f50422", "#983f7a", "#ea24a3",
    "#79352c", "#521250", "#c79ed2", "#d6dd92", "#e33e52", "#b2be57", "#fa06ec",
    "#1bb699", "#6b2e5f", "#64820f", "#1c271", "#9cb64a", "#996c48", "#9ab9b7",
    "#06e052", "#e3a481", "#0eb621", "#fc458e", "#b2db15", "#aa226d", "#792ed8",
    "#73872a", "#520d3a", "#cefcb8", "#a5b3d9", "#7d1d85", "#c4fd57", "#f1ae16",
    "#8fe22a", "#ef6e3c", "#243eeb", "#1dc18", "#dd93fd", "#3f8473", "#e7dbce",
    "#421f79", "#7a3d93", "#635f6d", "#93f2d7", "#9b5c2a", "#15b9ee", "#0f5997",
    "#409188", "#911e20", "#1350ce", "#10e5b1", "#fff4d7", "#cb2582", "#ce00be",
    "#32d5d6", "#17232", "#608572", "#c79bc2", "#00f87c", "#77772a", "#6995ba",
    "#fc6b57", "#f07815", "#8fd883", "#060e27", "#96e591", "#21d52e", "#d00043",
    "#b47162", "#1ec227", "#4f0f6f", "#1d1d58", "#947002", "#bde052", "#e08c56",
    "#28fcfd", "#bb09b", "#36486a", "#d02e29", "#1ae6db", "#3e464c", "#a84a8f",
    "#911e7e", "#3f16d9", "#0f525f", "#ac7c0a", "#b4c086", "#c9d730", "#30cc49",
    "#3d6751", "#fb4c03", "#640fc1", "#62c03e", "#d3493a", "#88aa0b", "#406df9",
    "#615af0", "#4be47", "#2a3434", "#4a543f", "#79bca0", "#a8b8d4", "#00efd4",
    "#7ad236", "#7260d8", "#1deaa7", "#06f43a", "#823c59", "#e3d94c", "#dc1c06",
    "#f53b2a", "#b46238", "#2dfff6", "#a82b89", "#1a8011", "#436a9f", "#1a806a",
    "#4cf09d", "#c188a2", "#67eb4b", "#b308d3", "#fc7e41", "#af3101", "#ff065",
    "#71b1f4", "#a2f8a5", "#e23dd0", "#d3486d", "#00f7f9", "#474893", "#3cec35",
    "#1c65cb", "#5d1d0c", "#2d7d2a", "#ff3420", "#5cdd87", "#a259a4", "#e4ac44",
    "#1bede6", "#8798a4", "#d7790f", "#b2c24f", "#de73c2", "#d70a9c", "#25b67",
    "#88e9b8", "#c2b0e2", "#86e98f", "#ae90e2", "#1a806b", "#436a9e", "#0ec0ff",
    "#f812b3", "#b17fc9", "#8d6c2f", "#d3277a", "#2ca1ae", "#9685eb", "#8a96c6",
    "#dba2e6", "#76fc1b", "#608fa4", "#20f6ba", "#07d7f6", "#dce77a", "#77ecca"]

    function createEdges(lineItem, tokenLookup) {
      var withdrawalCount = 0
      var withdrawalTotal = 0
      for (let withdrawal of lineItem.withdrawals) {
        withdrawalCount++;
        withdrawalTotal += Number(withdrawal.amount);
      };
      return {data: {source: lineItem['txs'][0]['from'], target: lineItem.recipient, label: lineItem.id, token: lineItem.token.name, startTime: lineItem.startTime, stopTime: lineItem.stopTime, timestamp: lineItem.timestamp, decimals:lineItem.token.decimals, symbol:lineItem.token.symbol, deposit: lineItem.deposit, withdrawalCount: withdrawalCount, withdrawalTotal: withdrawalTotal, withdrawals: lineItem.withdrawals, cancellation: lineItem.cancellation, color: tokenLookup[lineItem.token.name]['color']}}
    };

    function createNodes(streams) {
      const nodes = {}
      for (let stream of streams) {
        var withdrawalTotal = 0
        for (let withdrawal of stream.withdrawals) {
          withdrawalTotal += Number(withdrawal.amount);
        }

        var transferred = withdrawalTotal + Number(stream.cancellation ? stream.cancellation.recipientBalance : 0)

        if (stream['txs'][0]['from'] in nodes) {
          nodes[stream['txs'][0]['from']]['data']['sends']++
          nodes[stream['txs'][0]['from']]['data']['transactions']++
          nodes[stream['txs'][0]['from']]['data']['isSender'] = true
          nodes[stream['txs'][0]['from']]['data'][stream.token.symbol] = true
          nodes[stream['txs'][0]['from']]['data']['transactionDetails'].push({id: stream.id, type: 'sent', token: stream.token.symbol, decimals: stream.token.decimals, deposit: stream.deposit, transferred: transferred, startTime: stream.startTime, counterpart: stream.recipient})
        }
        else {
          nodes[stream['txs'][0]['from']] = {data: {id: stream['txs'][0]['from'], label: stream['txs'][0]['from'], sends: 1, receives: 0, transactions: 1, isSender: true, isRecipient: false, [stream.token.symbol]: true,
            transactionDetails: [{id: stream.id, type: 'sent', token: stream.token.symbol, decimals: stream.token.decimals, deposit: stream.deposit, transferred: transferred, startTime: stream.startTime, counterpart: stream.recipient}]}}
        }
        if (stream.recipient in nodes) {
          nodes[stream.recipient]['data']['receives']++
          nodes[stream.recipient]['data']['transactions']++
          nodes[stream.recipient]['data']['isRecipient'] = true
          nodes[stream.recipient]['data'][stream.token.symbol] = true
          nodes[stream.recipient]['data']['transactionDetails'].push({id: stream.id, type: 'received', token: stream.token.symbol, decimals: stream.token.decimals, deposit: stream.deposit, transferred: transferred, startTime: stream.startTime, counterpart: stream['txs'][0]['from']})
        }
        else {
          nodes[stream.recipient] = {data: {id: stream.recipient, label: stream.recipient, sends: 0, receives: 1, transactions: 1, isSender: false, isRecipient: true, [stream.token.symbol]: true,
            transactionDetails: [{id: stream.id, type: 'received', token: stream.token.symbol, decimals: stream.token.decimals, deposit: stream.deposit, transferred: transferred, startTime: stream.startTime, counterpart: stream['txs'][0]['from']}]}}
        }
      }

      const normalisedNodes = Object.values(nodes).map(normaliseTransactions)

      return normalisedNodes //Object.values(nodes)
    }

    React.useEffect(() => {
      if (!loading && !error && data && data.streams) {

        var tokenLookup = {}
        var newTokenOptions = [{}]
        for (var j = 0; j < data.tokens.length; j++) {
          tokenLookup[data.tokens[j]['name']] = data.tokens[j]
          tokenLookup[data.tokens[j]['name']]['color'] = colors[j]
          tokenOptions.push({label: data.tokens[j]['name'], value: data.tokens[j]['symbol']})
        }

        const newNodes = createNodes(data.streams)

        EE.emit('totals-update', [newNodes.length, data.streams.length])
        EE.emit('reset-view')
        updateCytoscapeData({nodes: newNodes, edges: data.streams.map(function (x) {return createEdges(x, tokenLookup)})})


        function setUpListeners() {
        myCyRef.on('tap', function(event) {
          var evtTarget = event.target;
          if( evtTarget === myCyRef ){
            EE.emit('node-click', null)
          } else {
            EE.emit('node-click', event.target._private.data)
          }
        })

        var filteredEdges = {}
        var tokenFiltered = false



        EE.on('filter-select',function(values) {
          if(!Array.isArray(values) || !values.length) {
            filteredEdges.restore()
            tokenFiltered = false
          }
          else {
            if(tokenFiltered) {filteredEdges.restore()}

          var edgeFilter  = 'edge'
          var nodeFilter  = 'node'

          for (let tkn of values) {
            edgeFilter = edgeFilter + '[symbol != "' + tkn.value + '"]'
            nodeFilter = nodeFilter + '[^' + tkn.value + ']'
          }

          filteredEdges = myCyRef.filter(edgeFilter + ", " + nodeFilter);
          myCyRef.remove(filteredEdges)
          tokenFiltered = true
        }
      })

      EE.on('reset-view',function() {
        if(tokenFiltered) {filteredEdges.restore()}
        setRefreshButton('Refresh')
        updateCytoscapeData({nodes: newNodes, edges: data.streams.map(function (x) {return createEdges(x, tokenLookup)})})
        //myCyRef.layout({name: 'random'}).run()
      })
      }
        setUpListeners()
    }
    }, [loading, error, data]);

    return (
      <div className="CytoscapeNetwork">
      <div className="filters">
      <Grid container spacing={2}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Grid item>
        <DateTimePicker value={startingTime} onChange={updateStartingTime} />
        </Grid>
        <Grid item>
        <DateTimePicker value={endingTime} onChange={updateEndingTime} padding="5px" />
        </Grid>
      </MuiPickersUtilsProvider>
      <Grid item>
      <Button onClick={resetView} color="primary" variant="contained" >{refreshButton}</Button>
      </Grid>
      </Grid>
      {loading ? <p>Loading...</p> :
      <>
      <p></p>
      <Select isMulti options={tokenOptions} onChange={tokenSelectChange} placeholder="Select tokens"/>
      </>}
      </div>


        <CytoscapeComponent
        className="foo bar"
        elements={CytoscapeComponent.normalizeElements(cytoscapeData)}
        style={{
          width: windowSize.w, height: windowSize.h, minWidth: "300px", minHeight: "400px", left: 0, right: 0}}
        stylesheet={[
      {
        selector: 'node',
        style: {
          width: 'data(normalisedTransactions)',
          height: 'data(normalisedTransactions)',
          //label: 'data(id)'
        }
      },
      {
      selector: 'edge',
      style: {
        'width': 1,
        'line-color': 'data(color)',
        'target-arrow-color': '#ccc',
        'target-arrow-shape': 'triangle'
      }
    }
    ]}
        layout={cytoscapeLayout}
        cy={(cy) => { updateMyCyRef(cy) }}
        />
      </div>
    );
}

function GraphNetwork() {
  const classes = useStyles();
  return (
    <div className={classes.root}>
    <Grid container spacing={3}>
        <Grid item>
          <CytoscapeNetwork/>
        </Grid>
        <Grid item>
          <InfoTab/>
        </Grid>
    </Grid>
    </div>
  );
}

export default GraphNetwork;

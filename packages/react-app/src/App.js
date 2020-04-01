import React from "react";
import { addresses, abis } from "@project/contracts";
import { gql } from "apollo-boost";
import { ethers } from "ethers";
import { useQuery } from "@apollo/react-hooks";
import { Graph } from 'react-d3-graph';
import CytoscapeComponent from 'react-cytoscapejs';
import Select from 'react-select'
import "./App.css";
var EventEmitter = require('eventemitter3');

var EE = new EventEmitter()

const GET_TRANSFERS = gql`
  {
    streams(first: 100) {
      id
      sender
      recipient
      deposit
      token { id name decimals symbol}
      startTime
      ratePerSecond
      exchangeRateInitial
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


    function emitted(context) {
        console.log('once')
        updateInfoNode(context); // true
        console.log(infoNode)
      }

    EE.on('node-click', emitted);

  return (
    <>
    {infoNode ? <div className="nodeInfo">
    {"source" in infoNode ?
    <>
    <p>Sender: {infoNode.source}</p>
    <p>Recipient: {infoNode.target}</p>
    <p>Token: {infoNode.token}</p>
    <p>Deposit: {infoNode.deposit / Math.pow(10, infoNode.decimals)}</p>
    </>
    : <>
    <p>Address: {infoNode.id}</p>
    <p>Sends: {infoNode.sends}</p>
    <p>Receives: {infoNode.receives}</p> </>}
    </div>
    : null}
    </>
    )
}

function CytoscapeNetwork() {

    const { loading, error, data } = useQuery(GET_TRANSFERS);

    const [myCyRef, updateMyCyRef] = React.useState({
    });

    const [cytoscapeData, updateCytoscapeData] = React.useState({
    });

    const [windowSize, updateWindowSize] = React.useState({
      w: window.innerWidth,
      h: "500px"
    })

    const [tokenOptions, setTokenOptions] = React.useState([]);

    const cytoscapeLayout = {
    name: 'cose',
    fit: true, // whether to fit to viewport
    padding: 30, // fit padding
    boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
    animate: false, // whether to transition the node positions
    ready: undefined, // callback on layoutready
    stop: undefined, // callback on layoutstop
    transform: function (node, position ){ return position; } // transform a given node position. Useful for changing flow direction in discrete layouts
  };

    function normaliseTransactions(node) {
      const newNode = node;
      newNode['data']['normalisedTransactions'] = Math.log(newNode['data']['transactions']*100);
      return newNode
    }

    function tokenSelectChange(values) {
      EE.emit('filter-select', values)}

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
      return {data: {source: lineItem.sender, target: lineItem.recipient, label: lineItem.id, token: lineItem.token.name, decimals:lineItem.token.decimals, symbol:lineItem.token.symbol, deposit: lineItem.deposit, color: tokenLookup[lineItem.token.name]['color']}}
    };

    function createNodes(streams) {
      const nodes = {}
      for (let stream of streams) {
        if (stream.sender in nodes) {
          nodes[stream.sender]['data']['sends']++
          nodes[stream.sender]['data']['transactions']++
          nodes[stream.sender]['data']['isSender'] = true
          nodes[stream.sender]['data'][stream.token.symbol] = true
        }
        else {
          nodes[stream.sender] = {data: {id: stream.sender, label: stream.sender, sends: 1, receives: 0, transactions: 1, isSender: true, isRecipient: false, [stream.token.symbol]: true}}
        }
        if (stream.recipient in nodes) {
          nodes[stream.recipient]['data']['receives']++
          nodes[stream.recipient]['data']['transactions']++
          nodes[stream.recipient]['data']['isRecipient'] = true
          nodes[stream.recipient]['data'][stream.token.symbol] = true
        }
        else {
          nodes[stream.recipient] = {data: {id: stream.recipient, label: stream.recipient, sends: 0, receives: 1, transactions: 1, isSender: false, isRecipient: true, [stream.token.symbol]: true}}
        }
      }

      const normalisedNodes = Object.values(nodes).map(normaliseTransactions)

      return normalisedNodes //Object.values(nodes)
    }

    React.useEffect(() => {
      if (!loading && !error && data && data.streams) {
        console.log({ streams: data.streams });
        console.log([loading, error, data])

        var tokenLookup = {}
        var newTokenOptions = [{}]
        for (var j = 0; j < data.tokens.length; j++) {
          tokenLookup[data.tokens[j]['name']] = data.tokens[j]
          tokenLookup[data.tokens[j]['name']]['color'] = colors[j]
          tokenOptions.push({label: data.tokens[j]['name'], value: data.tokens[j]['symbol']})
        }
        console.log(tokenLookup)

        const newNodes = createNodes(data.streams)
        console.log(newNodes)
        updateCytoscapeData({nodes: newNodes, edges: data.streams.map(function (x) {return createEdges(x, tokenLookup)})})

      }
      console.log(myCyRef)



    }, [loading, error, data]);

    React.useEffect(() => {
      if (!loading && !error && data) {

        function setUpListeners() {
        myCyRef.on('tap', function(event) {
          if( event.target === myCyRef ){
            console.log('tap on background');
            EE.emit('node-click', null)
          } else {
            console.log('tap on some element');
            EE.emit('node-click', event.target._private.data)
            console.log(event.target._private.data)
          }
        })

        var filteredEdges = {}
        var tokenFiltered = false

        EE.on('filter-select',function(values) {
          console.log(values)
          if(!Array.isArray(values) || !values.length) {
            console.log('tried')
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
            console.log(nodeFilter)
            console.log(edgeFilter)
          }

          filteredEdges = myCyRef.filter(edgeFilter + ", " + nodeFilter);
          console.log(filteredEdges)
          myCyRef.remove(filteredEdges)
          tokenFiltered = true
        }
      })
      }
        setUpListeners()
    }
    }, [loading, error, data]);

    return (
      <div className="CytoscapeNetwork">
      <div className="filters">
      {loading ? <p>Loading...</p> : <Select isMulti options={tokenOptions} onChange={tokenSelectChange}/>}
      </div>


        <CytoscapeComponent
        className="foo bar"
        elements={CytoscapeComponent.normalizeElements(cytoscapeData)}
        style={{
          width: windowSize.w, height: windowSize.h, left: 0, right: 0}}
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

function App() {

  return (
    <div className="App">
    <CytoscapeNetwork/>
    <InfoTab/>
    </div>
  );
}

export default App;

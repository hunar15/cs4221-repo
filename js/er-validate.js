function isValidERDiagram() {


	function _getAllUnsetNodes () {
		var elementSet = {};

		jsPlumb.selectEndpoints().each(function(e) {
		    elementSet[e.elementId] = 0;
		});

		return elementSet;
	}

	function _getAllEdges () {
		var connectionSet = jsPlumb.getAllConnections();

		return connectionSet;
	}

	function _getAllEdgesOfNode (node) {
		var connectionSet = jsPlumb.getConnections({ source : node})
							.concat(jsPlumb.getConnections({target : node}));

		return connectionSet;
	}

	function _markAllNeighbors(currentNode, nodeSet) {
		var allEdgesOfNode = _getAllEdgesOfNode(currentNode);
		nodeSet[currentNode] = 1;

		for(var counter in allEdgesOfNode) {
			var currentEdge = allEdgesOfNode[counter];

			var otherEndpointId = currentEdge.endpoints[0].elementId == currentNode ?
							currentEdge.endpoints[1].elementId : currentEdge.endpoints[0].elementId;
			if(nodeSet[otherEndpointId] != 1) {
				_markAllNeighbors(otherEndpointId, nodeSet);
			}
		}
	}

	function _isConnectedGraph() {
		
		var nodeSet = _getAllUnsetNodes(),
			startingNode = null;

		for (var i in nodeSet) {
			startingNode = i;
			break;
		}
		_markAllNeighbors(startingNode,nodeSet);

		for (var i in nodeSet) {
			if(nodeSet[i] != 1)
				return false;
		}
		return true;
	}

	function mainExecution () {
		
		//Check if the ER-Diagram is a connected graph
		if(_isConnectedGraph()) {

		} else {
			console.log("Some objects in the ER Diagram are not connected..");
		}
	}
}
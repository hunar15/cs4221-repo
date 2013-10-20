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

	function _hasStrongEntityAtRoot (object) {
		var allConnectionsToObject = _getAllEdgesOfNode(object),
			objectSelector = "#"+object;

		if(isNormalEntityType($(objectSelector))) {
			return true;
		}

		//nodeSet[object] = 1;
		for (var i = 0; i < allConnectionsToObject.length; i++) {
			var currentConnection = allConnectionsToObject[i];

			var objectAtOtherEnd = currentConnection.endpoints[0].elementId == object ?
								currentConnection.endpoints[1].elementId : currentConnection.endpoints[0].elementId;
			if(currentConnection.getParameters().isParentConnection == true && isNormalWeakRelationshipType($(objectSelector)) ||
			   currentConnection.getParameters().isParentConnection == false && !isNormalEntityType($(objectSelector)) &&
			    isEntityType($(objectSelector))) {
				return _hasStrongEntityAtRoot(objectAtOtherEnd);
			} 

		};
		return false;
	}
	function _weakEntitiesHaveStrongRoots () {
		//fetch all weak entities
		//TODO: Highlight objects with highlighted content
		//debugger;
		var weakEntitySet = $(".weak-entity");

		for (var i = 0; i < weakEntitySet.length; i++) {
			var current = weakEntitySet[i].id;

			//is connected to parent via ID or EX relationship

			if(!_hasStrongEntityAtRoot(current))
				return false;
		}
		return true;
	}

	function mainExecution () {
		
		//Check if the ER-Diagram is a connected graph
		if(_isConnectedGraph()) {
			if(_weakEntitiesHaveStrongRoots()) {
				
			} else {
				console.log("Some weak entities do not have ID or EX connections to strong entities");
			}
		} else {
			console.log("Some objects in the ER Diagram are not connected..");
		}
	}

	mainExecution();
}
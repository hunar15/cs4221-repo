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
			objectSelector = "#"+object,
			returnResult = false;

		if(isNormalEntityType($(objectSelector))) {
			return true;
		}

		//nodeSet[object] = 1;
		for (var i = 0; i < allConnectionsToObject.length; i++) {
			var currentConnection = allConnectionsToObject[i];

			var objectAtOtherEnd = currentConnection.endpoints[0].elementId == object ?
								currentConnection.endpoints[1].elementId : currentConnection.endpoints[0].elementId;
			
			//is child connection and other side relationship
			// or is parent connection and other side entity
			if((currentConnection.getParameters().isParentConnection == false && isNormalWeakRelationshipType($("#"+objectAtOtherEnd))) ||
			   (currentConnection.getParameters().isParentConnection == true && isEntityType($("#"+objectAtOtherEnd)))) {
			   	//debugger;
				returnResult = (returnResult || _hasStrongEntityAtRoot(objectAtOtherEnd));
			} 

		};
		return returnResult;
	}
	function _weakEntitiesHaveStrongRoots () {
		//fetch all weak entities
		//TODO: Highlight objects with highlighted content
		//debugger;
		var weakEntitySet = $(".weak-entity"),
			returnResult = false;
		if (weakEntitySet.length == 0) { 
			return true;
		} else {
			for (var i = 0; i < weakEntitySet.length; i++) {
				var current = weakEntitySet[i].id;

				//is connected to parent via ID or EX relationship
				//debugger;
				if(_hasStrongEntityAtRoot(current))
					returnResult = returnResult || true;
			}
			return returnResult;
		}
	}

	function _allRelationsHaveTwoNonAttributeConnections() {
		var allRelationships = $("div[class*='relationship']");
		for (var i = 0; i < allRelationships.length; i++) {
			var currentRelationship = allRelationships[i],
				entityCounter = 0;

			_forAllConnectionsToObjectPerform(currentRelationship, function (currentConnection, otherNode) {
				if(isEntityType($("#"+otherNode))) {
					entityCounter++;
				}
				return true;
			});
			if(entityCounter < 2) {
				return false;
			}	
		}
		return true;
	}

	function _forAllConnectionsToObjectPerform( object, call) {
		//object is a Jquery object

		var allRelationships = _getAllEdgesOfNode(object);

		for (var i = 0; i < allRelationships.length; i++) {
			var currentConnection = allRelationships[i],

			otherNode = currentConnection.endpoints[0].elementId == object.id ?
							currentConnection.endpoints[1].elementId : currentConnection.endpoints[0].elementId;

			if(call(currentConnection, otherNode)) {
				continue;
			} else {
				break;
			}
		}
	}
	function _singleParentRelationshipsHaveParentAndTwoChildren () {
		var allRelationships = $(".op-relationship, .isa-relationship, .dc-relationship");

		if(allRelationships.length != 0) {
			for (var i = 0; i < allRelationships.length; i++) {
				var currentRelationship = allRelationships[i].id;

				var allConnectionsToObject =_getAllEdgesOfNode(currentRelationship),
					hasParent = false,
					childCount = 0;

				for (var j = 0; j < allConnectionsToObject.length; j++) {
					var currentConnection = allConnectionsToObject[j];
					if(currentConnection.getParameters().isParentConnection)
						hasParent = true;
					else
						childCount++;
				}

				if(!hasParent || (childCount <2))
					return false;
			}
		} else {
			return true;
		}
		return true;
	}

	function _getTypeOfEntity (object) {
		if(isNormalEntityType(object)) {
			return "strong";
		} else {
			return "weak";
		}
	}

	function _areChildAndParentOfSingleParentRelationsOfSameType (argument) {
		var allRelationships = $(".isa-relationship, .dc-relationship, .op-relationship"),
			errorFlag = false;

		for (var i = 0; i < allRelationships.length; i++) {
			var currentRelationship = allRelationships[i];

			var currentType =  null;
			_forAllConnectionsToObjectPerform(currentRelationship,function (currentConnection, otherNode) {
				var objectSelector = "#"+otherNode;

				if (isEntityType($(objectSelector))) {
					if(currentType == null) {
						currentType = _getTypeOfEntity($(objectSelector));
					} else if (currentType != _getTypeOfEntity($(objectSelector))) {
						errorFlag = true;
						return false;
					}
					return true;
				}
			});
		}

		if (errorFlag) {
			return false;
		} else {
			return true;
		}
	}
	function mainExecution () {
		
		//Check if the ER-Diagram is a connected graph
		if(_isConnectedGraph()) {
			if(_weakEntitiesHaveStrongRoots()) {
				if (_singleParentRelationshipsHaveParentAndTwoChildren()) {
					if(_allRelationsHaveTwoNonAttributeConnections()) {
						//if contains attributes make further analysis
						//else leave it here?
						if (_areChildAndParentOfSingleParentRelationsOfSameType()) {
							console.log("Works");
						} else {
							console.log("Single parent relationships should have same type of entities as parents and children");
						}

					} else {
						console.log("Some relationships have < 2 entity connections");
					}
				} else {
					console.log("Some relationships have no parent..");
				}
			} else {
				console.log("Some weak entities do not have ID or EX connections to strong entities");
			}
		} else {
			console.log("Some objects in the ER Diagram are not connected..");
		}
	}

	mainExecution();
}
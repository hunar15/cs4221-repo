var intervalId= 0;
function _cleanStatusBar () {
		$("#status-bar").removeClass("ui-state-error");
		$("#status-bar").removeClass("ui-state-success");
		$("#status-bar").removeClass("ui-state-highlight");
	}

function _setStatusMessage (message, isError) {
	clearTimeout(intervalId);
	_cleanStatusBar();
	if (isError) {
		$("#status-bar").addClass("ui-state-error");
	} else {
		$("#status-bar").addClass("ui-state-success");
	}
	$("#status-bar").text(message);
	intervalId = setTimeout(_resetStatusBar,5000);
}

function _resetStatusBar () {
	_cleanStatusBar();
	$("#status-bar").addClass("ui-state-highlight");
	$("#status-bar").text("Welcome to DBMod!");
}

function isValidERDiagram(statusBar) {

	function _animatr(object) {
		var initVal = $(object).css("background-color"),
			animateVal = { backgroundColor: "#d2857f" };

		$(object).animate(animateVal, {
			duration : 2000,
			complete : function () {
				$(object).animate({ backgroundColor: initVal }, {
					duration : 2000
				});
			}	
		});
	}


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
			startingNode = null,
			returnVal = true,
			animationQueue = [];

		for (var i in nodeSet) {
			startingNode = i;
			break;
		}
		_markAllNeighbors(startingNode,nodeSet);

		for (var i in nodeSet) {
			if(nodeSet[i] != 1) {
				animationQueue.push(i);
				//_animatr("#"+i);
				returnVal = false;
			}
				
		}
		$.each(animationQueue, function (i) {
			_animatr("#"+animationQueue[i]);
		});
		return returnVal;
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
			returnResult = true,
			animationQueue = [];
		if (weakEntitySet.length == 0) { 
			return true;
		} else {
			for (var i = 0; i < weakEntitySet.length; i++) {
				var current = weakEntitySet[i].id;

				//is connected to parent via ID or EX relationship
				//debugger;
				if(!_hasStrongEntityAtRoot(current)) {
					returnResult = false;
					animationQueue.push(current);
				}
			}
			$.each(animationQueue, function (i) {
				_animatr("#"+animationQueue[i]);
			});
			return returnResult;
		}
	}

	function _allRelationsHaveTwoNonAttributeConnections() {
		var allRelationships = $("div[class*='relationship']"),
			returnVal = true,
			animationQueue = [];
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
				returnVal = false;
				animationQueue.push(currentRelationship.id);
			}	
		}
		$.each(animationQueue, function (i) {
			_animatr("#"+animationQueue[i]);
		});
		return returnVal;
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
		var allRelationships = $(".op-relationship, .isa-relationship, .dc-relationship"),
			animationQueue = [],
			returnVal = true;

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

				if(!hasParent || (childCount <2)) {
					animationQueue.push(currentRelationship);
					returnVal = false;
				}		
			}
		} else {
			return returnVal;
		}
		$.each(animationQueue, function (i) {
			_animatr("#"+animationQueue[i]);
		});
		return returnVal;
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
			errorFlag = false,
			animationQueue = [];

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
						animationQueue.push(otherNode);
						return false;
					}
					return true;
				}
			});
		}

		$.each(animationQueue, function (i) {
			_animatr("#"+animationQueue[i]);
		});
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
							_setStatusMessage("Your ER Schema is valid",false);
						} else {
							_setStatusMessage("Single parent relationships should have same type of entities as parents and children",true);
						}

					} else {
						_setStatusMessage("Some relationships have < 2 entity connections",true);
					}
				} else {
					_setStatusMessage("Some relationships have no parent..",true);
				}
			} else {
				_setStatusMessage("Some weak entities do not have ID or EX connections to strong entities",true);
			}
		} else {
			_setStatusMessage("Some objects in the ER Diagram are not connected..",true);
		}
	}

	mainExecution();
}


function getInnerTextHTMLContent(value) {
	
	return "<div class=\"inner-text\">" +
				"<strong>"+value+"</strong>"+
			"</div>";
}

function createEntityWithNameAndId(name,id) {
	/*
	Name is the unique identifier of the object
	*/
	var newEntity = "<div id=\""+id+"\" class=\"entity\">"+
						getInnerTextHTMLContent(name)+
					"</div>";

	return newEntity;
}

function createWeakEntityWithNameAndId(name,id) {
	/*
	Name is the unique identifier of the object
	*/
	var newEntity = "<div id=\""+id+"\" class=\"weak-entity\">"+
						getInnerTextHTMLContent(name)+
					"</div>";

	return newEntity;
}

function createAttributeWithNameAndId(name,id) {
	/*
	Name is the unique identifier of the Attribute
	*/
	var newEntity = "<div id=\""+id+"\" class=\"attribute\">"+
						getInnerTextHTMLContent(name)+
					"</div>";

	return newEntity;
}

function createRelationshipWithName (name, id) {
	/*
	Name is the unique identifier of the relationship
	*/
    var newEntity = "<div id=\""+id+"\" class=\"relationship\"";    
    return diamondExpand(newEntity,name);
}

function createISARelationshipWithId (id) {
	/*
	Id is the unique identifier of the relationship
	*/
    var newEntity = "<div id=\""+id+"\" class=\"isa-relationship\"";
    var name = "IS-A";
	return diamondExpand(newEntity,name);
}

function createOPRelationshipWithIdAndType (id, type) {
	/*
	Id is the unique identifier of the relationship
	Type is from {"Union","Intersection"}
	*/
	type = type.charAt(0).toUpperCase() + type.slice(1);
    var newEntity = "<div id=\""+id+"\" class=\"op-relationship\">" + getInnerTextHTMLContent(type) +"</div>";

	return newEntity;
}

function createDRelationshipWithName (name, id) {
	/*
	Id is the unique identifier of the relationship
	Type is from {"Union","Intersection"}
	*/
	name = name.charAt(0).toUpperCase() + name.slice(1);
    name = "By " + name;
    var newEntity = "<div id=\""+id+"\" class=\"dc-relationship\"";
    return diamondExpand(newEntity,name);
}

function createEXRelationshipWithName (name, id) {
	/*
	Id is the unique identifier of the relationship
	Type is from {"Union","Intersection"}
	*/
	name = name.charAt(0).toUpperCase() + name.slice(1);
    var newEntity = "<div id=\""+id+"\" class=\"ex-relationship\"";
	return diamondExpand(newEntity,name);
}

function createIDRelationshipWithName (name, id) {
	/*
	Id is the unique identifier of the relationship
	Type is from {"Union","Intersection"}
	*/
	name = name.charAt(0).toUpperCase() + name.slice(1);
    var newEntity = "<div id=\""+id+"\" class=\"id-relationship\"";
    return diamondExpand(newEntity,name);
    
}

function diamondExpand(line,name){
    var length = name.length;
    if(length >= 10 && length < 15)
    {
        line = line + " style=\"background-size:110px 110px; width:110px;" + 
                "height:110px; line-height:110px;\">" +
                getInnerTextHTMLContent(name)+
                "</div>";
    }
    else if (length >= 15)
    {
        line = line + " style=\"background-size:150px 150px; width:150px;" + 
                "height:150px; line-height:150px;\">" +
                getInnerTextHTMLContent(name)+
                "</div>";
    }
    else
    {
        line = line + ">" + getInnerTextHTMLContent(name)+"</div>";
    }
    return line
}

function isEntityType (element) {
	if(element.hasClass('entity') || element.hasClass('weak-entity')) {
		return true;
	} else {
		return false;
	}
}

function isNormalEntityType (element) {
	if(element.hasClass('entity')) {
		return true;
	} else {
		return false;
	}
}

function isRelationshipType( element ) {
	if(element.hasClass('relationship') || element.hasClass('isa-relationship') || 
		element.hasClass('op-relationship') || element.hasClass('dc-relationship') ||
		element.hasClass('ex-relationship') || element.hasClass('id-relationship')) {
		return true;
	} else {
		return false;
	}
}

function isRegularRelationshipType( element ) {
	if(element.hasClass('relationship')) {
		return true;
	} else {
		return false;
	}
}

function isOPRelationshipType( element ) {
	if(element.hasClass('op-relationship')) {
		return true;
	} else {
		return false;
	}
}

function isSingleParentRelationshipType(element) {
	if(element.hasClass('op-relationship') || element.hasClass('dc-relationship') || element.hasClass('isa-relationship')) {
		return true;
	} else {
		return false;
	}
}

function isNormalWeakRelationshipType(element) {
	if(element.hasClass('ex-relationship') || element.hasClass('id-relationship')) {
		return true;
	} else {
		return false;
	}
}

function isAttributeType( element ) {
	if(element.hasClass('attribute')) {
		return true;
	} else {
		return false;
	}
}

function fetchParentOfEndpoint( endpoint ) {
	console.log(endpoint);
	return $("#"+endpoint.elementId);
} 

function _getConnectionLimitOfElement (element) {
	// body...
	if(isAttributeType(element)) {
		return 1;
	} else if (isEntityType(element)) {
		return 0;
	} else if (element.hasClass('isa-relationship')) {
		return 2;
	} else if (element.hasClass('ex-relationship')) {
		return 2;
	} else if (element.hasClass('id-relationship')) {
		return 2;
	} else {
		return 0;
	}
}
function hasReachedConnectionLimit (elementObject) {
	// body...
	var maxLimit =  _getConnectionLimitOfElement(elementObject);
	if(maxLimit == 0) {
		return false;
	} else {
		var currentNumber = jsPlumb.getConnections( { source : elementObject}).length +
						 jsPlumb.getConnections( { target : elementObject}).length;
		return (currentNumber == maxLimit) ;
	}
}

function getConnectionCount(obj1) {
	return jsPlumb.getConnections( { source : obj1}).length +
						 jsPlumb.getConnections( { target : obj1}).length;
}
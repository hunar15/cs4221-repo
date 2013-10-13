

function getInnerTextHTMLContent(value) {
	
	return "<div class=\"inner-text\">" +
				"<strong>"+value+"</strong>"+
			"</div>";
}

function createEntityWithName(name) {
	/*
	Name is the unique identifier of the object
	*/
	var newEntity = "<div id=\""+name+"-entity\" class=\"entity\">"+
						getInnerTextHTMLContent(name)+
						"<div id=\""+name+"-entity-ep\" class=\"connector-container\"> "+
							//"<img src=\"img/littledot.png\">"+
						"</div>"+
					"</div>";

	return newEntity;
}

function createWeakEntityWithName(name) {
	/*
	Name is the unique identifier of the object
	*/
	var newEntity = "<div id=\""+name+"-weak-entity\" class=\"weak-entity iw-mTrigger\">"+
						getInnerTextHTMLContent(name)+
					"</div>";

	return newEntity;
}

function createAttributeWithName(name) {
	/*
	Name is the unique identifier of the Attribute
	*/
	var newEntity = "<div id=\""+name+"-attribute\" class=\"attribute\">"+
						getInnerTextHTMLContent(name)+
					"</div>";

	return newEntity;
}

function createRelationshipWithName (name, id) {
	/*
	Name is the unique identifier of the relationship
	*/
    var newEntity = "<div id=\""+id+"\" class=\"relationship\"";
    
    if(name.length >= 10 && name.length < 20)
    {
        newEntity = newEntity + " style=\"background-size:150px 150px; width:150px;" + 
                    "height:150px; line-height:150px;\">" +
                    getInnerTextHTMLContent(name)+
					"</div>";
    }
    else if (name.length >= 20)
    {
        newEntity = newEntity + " style=\"background-size:200px 200px; width:200px;" + 
                    "height:200px; line-height:200px;\">" +
                    getInnerTextHTMLContent(name)+
					"</div>";
    }
    else
    {
        newEntity = newEntity + ">" + getInnerTextHTMLContent(name)+"</div>";
    }

	return newEntity;
}

function createISARelationshipWithId (id) {
	/*
	Id is the unique identifier of the relationship
	*/
    var newEntity = "<div id=\""+id+"\" class=\"isa-relationship\">"+getInnerTextHTMLContent("IS-A")+"</div>";

	return newEntity;
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
    var newEntity = "<div id=\""+id+"\" class=\"dc-relationship\">" + getInnerTextHTMLContent("By " + name) +"</div>";

	return newEntity;
}

function createEXRelationshipWithName (name, id) {
	/*
	Id is the unique identifier of the relationship
	Type is from {"Union","Intersection"}
	*/
	name = name.charAt(0).toUpperCase() + name.slice(1);
    var newEntity = "<div id=\""+id+"\" class=\"ex-relationship\">" + getInnerTextHTMLContent("EX <br/>Has " + name) +"</div>";

	return newEntity;
}

function isEntityType (element) {
	if(element.hasClass('entity') || element.hasClass('weak-entity')) {
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
		return (jsPlumb.getConnections( { 
			source : elementObject
		}).length == maxLimit) ;
	}
}
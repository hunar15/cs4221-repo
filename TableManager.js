/*
Cookie functions
*/

var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;

function setCookie(name, value)
{
	if (is_chrome)
	{
		$.Storage.saveItem(name, value);
	}
	else
	{
		$.cookie(name, value);
	}
} 

function getCookie(name)
{
	var ret=(is_chrome)?$.Storage.loadItem(name):$.cookie(name);
	return ret;
}

function removeCookie(name)
{
	if (is_chrome)
	{
		$.Storage.deleteItem(name);
	}
	else
	{
		$.removeCookie(name);
	}
}

function clearAllCookie()
{
	removeCookie("table_list");
	removeCookie("attribute");
	removeCookie("fd");
}

/*
Table functions
*/

var table_list_JSON = {"table_list": [
        {"name": "test1"},
		{"name": "test2"}
    ]
};

var attribute_JSON = {"attribute": [
        {"table":"test1", "name": ""}
    ]
};

var fd_JSON = {"fd": [
        {"table":"test1", "left": "", "right": "", "type": ""}
    ]
};
/* Table */
function getTableList()
{
	table_list_JSON = JSON.parse(getCookie("table_list"));
	if (!table_list_JSON)
		table_list_JSON = {"table_list":[]};
	return table_list_JSON;
}

function createTable(name)
{
	if(name=="") return false;
	table_list_JSON = getTableList();
	//Check table existence
	for(var i = 0; i < table_list_JSON.table_list.length; i++)
	{
		if (!table_list_JSON.table_list[i]) continue;
		if (table_list_JSON.table_list[i].name == name)
		{
			return true;
		}
	}
	var table_to_insert = {"name": name};
	table_list_JSON.table_list.push(table_to_insert);
	setCookie("table_list", JSON.stringify(table_list_JSON)); 
	return true;
}

function dropTable(name)
{
	table_list_JSON = getTableList();
	for(var i = 0; i < table_list_JSON.table_list.length; i++)
	{
		if (!table_list_JSON.table_list[i]) continue;
		if (table_list_JSON.table_list[i].name == name)
		{
			table_list_JSON.table_list.splice(i,1);
		}
	}
	setCookie("table_list", JSON.stringify(table_list_JSON)); 
}

/* Attribute */
/*
function addAttribute(table_name, attribute_name, type, not_null, PK, FK, UN, AI, Default)
{
	attribute_JSON = JSON.parse(getCookie("attribute"));
	if (attribute_JSON.attribute==null || attribute_JSON.attribute.length==null) attribute_JSON = {"attribute":[]};
	var attribute_to_insert = {"table": table_name, "name": attribute_name, "type": type, "not_null": not_null, "PK": PK, "FK": FK, "UN": UN, "AI": AI, "Default": Default};
	for(var i = 0; i < attribute_JSON.attribute.length; i++)
	{
		if (attribute_JSON.attribute[i]==null) continue;
		if (attribute_JSON.attribute[i].table == table_name && attribute_JSON.attribute[i].name == attribute_name)
		{
			attribute_JSON.attribute.splice(i,1);
			break;
		}
	}
	attribute_JSON.attribute.push(attribute_to_insert);
	setCookie("attribute", JSON.stringify(attribute_JSON)); 
}
*/

function addAttribute(table_name, object)
{
	attribute_JSON = JSON.parse(getCookie("attribute"));
	if (!attribute_JSON) attribute_JSON = {"attribute": []};

	for(var i = attribute_JSON.attribute.length - 1; i >=0 ; i--)
	{
		if (attribute_JSON.attribute[i].table == table_name) attribute_JSON.attribute.splice(i,1);
	}

	for(var i = 0; i < object.length; i++)
	{
		var attribute_to_insert = {"table": table_name, "name": object[i].name};
		attribute_JSON.attribute.push(attribute_to_insert);
	}
	setCookie("attribute", JSON.stringify(attribute_JSON)); 
}

function deleteAttribute(table_name, attribute_name)
{
	if (!attribute_name) return;
	attribute_JSON = JSON.parse(getCookie("attribute"));
	if (!attribute_JSON) attribute_JSON = {"attribute": []};
	fd_JSON = getFD(table_name);
	for(var i = 0; i < attribute_JSON.attribute.length; i++)
	{
		if (!attribute_JSON.attribute[i]) continue;
		if (attribute_JSON.attribute[i].table == table_name && attribute_JSON.attribute[i].name == attribute_name)
		{
			attribute_JSON.attribute.splice(i,1);
			
			for(var j = fd_JSON.fd.length - 1; j >=0 ; j--)
			{
				if (fd_JSON.fd[j].left.indexOf(attribute_name)!=-1) 
				{
					fd_JSON.fd.splice(j,1);
					continue;
				}
				if (fd_JSON.fd[j].right.indexOf(attribute_name)!=-1)
				{
					fd_JSON.fd.splice(fd_JSON.fd[j].right.indexOf(attribute_name),1);
				}
			}
			break;
		}
	}
	setCookie("attribute", JSON.stringify(attribute_JSON)); 
	setCookie("fd", JSON.stringify(fd_JSON)); 
}

function getAttribute(table_name)
{
	attribute_JSON = JSON.parse(getCookie("attribute"));
	if (!attribute_JSON) attribute_JSON = {"attribute": []};
	
	var ret = {"attribute": []};
	
	for(var i = 0; i < attribute_JSON.attribute.length; i++)
	{
		if (!attribute_JSON.attribute[i]) continue;
		if (attribute_JSON.attribute[i].table == table_name)
		{
			ret.attribute.push(attribute_JSON.attribute[i]);
		}
	}
	return ret;
}

/* functional dependency */
function insertFD(table_name, left, right, type)
{
	fd_JSON = JSON.parse(getCookie("fd"));
	if (!fd_JSON) fd_JSON = {"fd":[]};
	var fd_to_insert = {"table": table_name, "left": left, "right": right, "type": type};
	if (!fd_JSON) fd_JSON = {"fd":[]};
	for(var i = 0; i < fd_JSON.fd.length; i++)
	{
		if (!fd_JSON.fd[i]) continue;
		if (fd_JSON.fd[i].table == table_name && fd_JSON.fd[i].left == left && fd_JSON.fd[i].right == right && fd_JSON.fd[i].type == type)
		{
			fd_JSON.fd.splice(i,1);
			break;
		}
	}
	fd_JSON.fd.push(fd_to_insert);
	setCookie("fd", JSON.stringify(fd_JSON)); 
}

function deleteFD(table_name, left, type)
{
	fd_JSON = JSON.parse(getCookie("fd"));
	if (!fd_JSON) fd_JSON = {"fd":[]};
	for(var i = 0; i < fd_JSON.fd.length; i++)
	{
		if (!fd_JSON.fd[i]) continue;
		if (fd_JSON.fd[i].table == table_name && fd_JSON.fd[i].left == left  && fd_JSON.fd[i].type == type)
		{
			fd_JSON.fd.splice(i,1);
			break;
		}
	}
	setCookie("fd", JSON.stringify(fd_JSON)); 
}

function getFD(table_name)
{
	fd_JSON = JSON.parse(getCookie("fd"));
	if (!fd_JSON) fd_JSON = {"fd":[]};
	var ret = {"fd": []};
	
	for(var i = 0; i < fd_JSON.fd.length; i++)
	{
		if (!fd_JSON.fd[i]) continue;
		if (fd_JSON.fd[i].table == table_name)
		{
			ret.fd.push(fd_JSON.fd[i]);
		}
	}
	return ret;
}


function getFDNumber(table_name)
{
	var ret = [];
	var fd = getFD(table_name).fd;
	var attribute = getAttribute(table_name).attribute;
	for(var i = 0; i < fd.length; i++)
	{
		if (fd[i].type=="0")
		{
			var retObj = {"left":"", "right":""};
			retObj.left = 0;
			retObj.right = 0
			var left_array = fd[i].left.split(',');
			var right_array = fd[i].right.split(',');
			
			for(var j = 0; j<left_array.length; j++) retObj.left+=Math.pow(2, retLocation(attribute, left_array[j]));
			for(var j = 0; j<right_array.length; j++) retObj.right+=Math.pow(2, retLocation(attribute, right_array[j]));
			
			ret.push(retObj);
		}
	}
	return ret;
}git
function getMVDNumber(table_name)
{
	var ret = [];
	var fd = getFD(table_name).fd;
	var attribute = getAttribute(table_name).attribute;
	for(var i = 0; i < fd.length; i++)
	{
		if (fd[i].type=="1")
		{
			var retObj = {"left":"", "right":""};
			retObj.left = 0;
			retObj.right = 0
			var left_array = fd[i].left.split(',');
			var right_array = fd[i].right.split(',');
			
			for(var j = 0; j<left_array.length; j++) retObj.left+=Math.pow(2, retLocation(attribute, left_array[j]));
			for(var j = 0; j<right_array.length; j++) retObj.right+=Math.pow(2, retLocation(attribute, right_array[j]));
			
			ret.push(retObj);
		}
	}
	return ret;
}

function numToAttribute(table_name, num)
{
	var attribute = getAttribute(table_name).attribute;
	var ret = "";
	var i = 0;
	while(num>0)
	{
		if(num&1)
		{
			ret += attribute[attribute.length-i-1].name + ",";
		}
		num>>=1;
		i++;
	}
	ret = ret.split("").reverse().join("");
	return ret.substr(1, ret.length);
}

function attributeToNum(table_name, attribute_input)
{
	var ret = 0;
	var attribute = getAttribute(table_name).attribute;
	var attribute_split = attribute_input.split(",");
	for(var i = 0; i<attribute_split.length; i++) ret += Math.pow(2, retLocation(attribute, attribute_split[i]));
	return ret;
}

function retLocation(array, object)
{
	for(var i = 0; i<array.length; i++)
	{
		if (array[i].name == object) return array.length-i-1;
	}
	return -1;
}


/*
 * jquery.Storage
 * A jQuery plugin to make localStorage easy and managable to use
 *
 * Copyright (c) Brandon Hicks (Tarellel)
 *
 * Version: 1.0.0a (12/6/10)
 * Requires: jQuery 1.4
 *
 *
 */
(function(jQuery) {
  // validate if the visiting browser supports localStorage
  var supported = true;
  var keyMeta = 'ls_';

  //var localStorage === window.localStorage
  if (typeof localStorage == 'undefined' || typeof JSON == 'undefined'){
      supported = false;
  }

  // errors produced by localStorage
  this.storageError = function(error){
    switch(error){
      // current browser/device is not supported
      case 'SUPPORTED':
        alert("Your browser does not support localStorage!");
        break;

      // browsers database quota is full
      case 'QUOTA':
        alert("Your storage quota is currently full!");
        console.log("Browser database quote exceeded.");
        break;

      // Any other error that may have occurred
      default:
        alert('An unknown error has occurred!');
        break;
    }
    return true;
  };

  // saves specified item using ("key","value")
  this.saveItem = function(itemKey, itemValue, lifetime){
    if (typeof lifetime == 'undefined'){
       lifetime = 60000;
    }

    if (!supported){
      // set future expiration for cookie
      dt = new Date();
      // 1 = 1day can use days variable
      //dt.setTime(dt.getTime() + (1*24*60*60*1000));
      dt.setTime(dt.getTime() + lifetime);
      expires = "expires= " + dt.toGMTString();

      document.cookie = keyMeta + itemKey.toString() + "=" + itemValue + "; " + expires + "; path=/";
      return true;
    }

    // set specified item
    try{
      localStorage.setItem(keyMeta+itemKey.toString(), JSON.stringify(itemValue));
    } catch (e){
      // if the browsers database is full produce error
      if (e == QUOTA_EXCEEDED_ERR) {
        this.storageError('QUOTA');
        return false;
      }
    }
    return true;
  };

  // load value of a specified database item
  this.loadItem = function(itemKey){
    if(itemKey===null){ return null; }
    if (!supported){
      var cooKey = keyMeta + itemKey.toString() + "=";
      // go through cookies looking for one that matchs the specified key
      var cookArr = document.cookie.split(';');
      for(var i=0, cookCount = cookArr; i < cookCount; i++){
        var current_cookie = cookArr[i];
        while(current_cookie.charAt(0) == ''){
          current_cookie = current_cookie.substring(1, current_cookie.length);
          // if keys match return cookie
          if (current_cookie.indexOf(cooKey) == 0) {
            return current_cookie.substring(cooKey.length, current_cookie.length);
          }
        }
      }
      return null;
    }

    var data = localStorage.getItem(keyMeta+itemKey.toString());
    if (data){
      return JSON.parse(data);
    }else{
      return false;
    }
  };

  // removes specified item
  this.deleteItem = function (itemKey){
    if (!supported){
      document.cookie = keyMeta + itemKey.toString() + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
      return true;
    }

    localStorage.removeItem(keyMeta+itemKey.toString());
    return true;
  };

  // WARNING!!! this clears entire localStorage Database
  this.deleteAll = function(){
    if (!supported){
      // process each and every cookie through a delete funtion
      var cookies = document.cookie.split(";");
      for (var i = 0; i < cookies.length; i++){
        this.deleteItem(cookies[i].split("=")[0]);
      }
      return true;
    }

    localStorage.clear();
    return true;
  };

  // jquery namespace for the function set
  jQuery.Storage = this;
})(jQuery);


/*!
 * jQuery Cookie Plugin v1.3
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2011, Klaus Hartl
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/GPL-2.0
 */
(function ($, document, undefined) {

	var pluses = /\+/g;

	function raw(s) {
		return s;
	}

	function decoded(s) {
		return decodeURIComponent(s.replace(pluses, ' '));
	}

	var config = $.cookie = function (key, value, options) {

		// write
		if (value !== undefined) {
			options = $.extend({}, config.defaults, options);

			if (value === null) {
				options.expires = -1;
			}

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setDate(t.getDate() + days);
			}

			value = config.json ? JSON.stringify(value) : String(value);

			return (document.cookie = [
				encodeURIComponent(key), '=', config.raw ? value : encodeURIComponent(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// read
		var decode = config.raw ? raw : decoded;
		var cookies = document.cookie.split('; ');
		for (var i = 0, l = cookies.length; i < l; i++) {
			var parts = cookies[i].split('=');
			if (decode(parts.shift()) === key) {
				var cookie = decode(parts.join('='));
				return config.json ? JSON.parse(cookie) : cookie;
			}
		}

		return null;
	};

	config.defaults = {};

	$.removeCookie = function (key, options) {
		if ($.cookie(key) !== null) {
			$.cookie(key, null, options);
			return true;
		}
		return false;
	};

})(jQuery, document);

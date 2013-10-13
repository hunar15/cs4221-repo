// JavaScript Document

function isSubsetOf(a,b){ return (a&b)==a; }

function isProperSubsetOf(a,b){ return a!=b && isSubsetOf(a,b);}

function setUnion(a,b){ return a|b; }

function setIntersect(a,b){ return a&b; }

function setExclude(a,b){ return setIntersect(a,~b); }

function max(a,b){
	if(a > b)
		return a;
	else
		return b;
}

//define integer pair called PII
function getClosure(fd, tableName){
	var varNum = 0;
	varNum = getAttribute(tableName).attribute.length;
	
	//allocate the space for p (all possible combinations)
	var n=1<<varNum;
	var g = [];
	//add in the rhs
	for(var i = 0;i<n;i++)g[i]=i;
	for(var i = 0; i < fd.length; i++){
		var a = fd[i]; 
		g[a.left]=setUnion(g[a.left],a.right);
	}
	//check the transitivity
	while(true){
		var update=false;
		for(var k=0;k<n;k++)
			for(var i=0;i<n;i++)
				for(var j=0;j<n;j++)
					if(isSubsetOf(k,g[i]) && isSubsetOf(j,g[k]) && !isSubsetOf(j,g[i])){
						g[i] = setUnion(g[i],j);
						update=true;
					}
		if(!update)break;
	}
	
	return g;
}

function getClosureWithMVD(fd, mvd, tableName){
	var closure = getClosure(fd,tableName);
	
	//check coalescence rule for MVD
	if(mvd.length != 0){
		while(true){
			var update = false;
			for(var i=0;i<mvd.length;i++){
				var subset = allSubsets(mvd[i].right);
				for(var j=0;j<subset.length;j++){
					for(var k=0;k<closure.length;k++){
						//Z is a subset of Y and W and Y have no intersection
						if(isSubsetOf(subset[j], closure[k]) && !setIntersect(k, mvd[i].right) && !isSubsetOf(subset[j], closure[mvd[i].left])){
							closure[mvd[i].left] |= subset[j];
							update = true;
						}
					}
				}
			}
			if(!update) break;
		}
	}
	
	return closure;
}

function removeTrivialSupersets(a){
	a.sort(function(a,b){return a - b;});
	for(var i=0;i<a.length;i++)
		for(var j=i+1;j<a.length;)
			if(isSubsetOf(a[i],a[j]))	
				a.erase(a.begin()+j);
			else
				j++;
}

function getKeys(closure){
	var keys = [];
	var n=closure.length;
	for(var i=0;i<n;i++){
		var a=i,b=closure[i];
		if(b==n-1)
			keys.push(a);
	}
	keys.sort(function(a,b){return a - b;})
	for(var i=0;i<keys.length;i++)
		for(var j=i+1;j<keys.length;)
			if(isSubsetOf(keys[i],keys[j]))	// j is superkey
				keys.splice(j,1);
			else
				j++;
	return keys;
}

//get closure with a specific attribute
function getClosureForAttribute(attr, fd){
	var res=attr;
	var update;
	do{
		update=false;
		for(var i = 0; i < fd.length; i++){
			var a = fd[i];
			if(isSubsetOf(a.left,res) && setExclude(a.right,res))
			{
				update=true;
				res = setUnion(res,a.right);
			}
		}
	}while(update);
	return res;
}

function isMemberOf(p, fd){
	return isSubsetOf(p.right,getClosureForAttribute(p.left,fd));
}

function is2NF(fd, tableName){
	// return false if some non-prime attribute is determined by a proper subset of key
	var closure=getClosure(fd, tableName);
	var keys=getKeys(closure);
	//no attributes at all
	if(keys.length==0)return true;
	var N=getAttribute(tableName).attribute.length; 	//num of variables
	var prime=0,nonPrime;
	//find all the primes
	for(var i=0;i<keys.length;i++)
		prime = setUnion(prime, keys[i]);
	//find the sum of nonprimes
	nonPrime=(~prime) & ((1<<N)-1);
	//no nonprime
	if(!nonPrime)return true;
	//test if every nonprime attrbute is fully dependent on each key
	for(var i=1;i<closure.length;i++){
		var is_proper_subset_of_key=false;
		for(var j=0;j<keys.length;j++)
		//if i is a subset of keys
			if(isProperSubsetOf(i,keys[j])){
				is_proper_subset_of_key=true;
				break;
			}
			if(is_proper_subset_of_key && setIntersect(closure[i],nonPrime))
				return false;
	}
	return true;
}

function is3NF(fd, tableName){
	// return true if some set (not superkey) non-trivially determin some non-prime attribute
	var closure=getClosure(fd, tableName);
	var keys=getKeys(closure);
	if(keys.length==0)return true;
	var N=getAttribute(tableName).attribute.length;
	var prime=0,nonPrime;
	for(var i=0;i<keys.length;i++)
		prime |= keys[i];
	nonPrime=(~prime) & ((1<<N)-1);
	if(!nonPrime)return true;
	for(var i=1;i<closure.length;i++){
		var is_superkey=false;
		//find any superkey and test
		for(var j=0;j<keys.length;j++)
			if(isSubsetOf(keys[j],i)){
				is_superkey=true;
				break;
			}
		if(!is_superkey && setIntersect(setExclude(closure[i],i),nonPrime))
			return false;
	}
	return true;
}

function isBCNF(g, tableName){
// return true if some attribute set (not superkey) non-trivially determin something
	var closure=getClosure(g, tableName);
	var keys=getKeys(closure);
	for(var i=1;i<closure.length;i++){
		var is_superkey=false;
		for(var j=0;j<keys.length;j++)
			if(isSubsetOf(keys[j],i)){
				is_superkey=true;
				break;
			}
			//not a superkey and not a trivial fd
			if(!is_superkey && setExclude(closure[i],i))
				return false;
	}
	return true;
}

function findFDNotInBCNF(fd, tableName) {
	var FDNotInBCNF = [];
	var lhs = [];
	var closure=getClosure(fd, tableName);
	var keys = getKeys(closure);
	var inBCNF = true;
	
	//find all the lhs not superkey & has some fd and push them into FDNotInBCNF
	for(var i=1;i<closure.length;i++){
		var is_superkey=false;
		for(var j=0;j<keys.length;j++)
			if(isSubsetOf(keys[j],i)){
				is_superkey=true;
				break;
			}
		if(!is_superkey && setExclude(closure[i],i))
			lhs.push(i);
	}
	
	for(var i=0;i<fd.length;i++)
		for(var j=0;j<lhs.length;j++)
			if(fd[i].left == lhs[j]){
				FDNotInBCNF.push(fd[i]);
			}
	
	return FDNotInBCNF;
}

function BCNFDecomposition(fd, tableName){
	//find all the FD not in BCNF and store them
	var FDNotInBCNF = [];
	var inBCNF = true;
	var varNum = getAttribute(tableName).attribute.length;
	var mask = (1<<varNum) - 1;
	var step = 1;
	var ouput;
	output = "BCNF Decomposition Method\n\n";
	
	//find all the fd not in BCNF and push them into FDNotInBCNF
	FDNotInBCNF = findFDNotInBCNF(fd, tableName);
	
	if(FDNotInBCNF.length != 0)
		inBCNF = false;
	else{
		output += "No change\n";
		return output;	
	}
	
	var relations = [];
	
	//decompose one by one
	while(!inBCNF){
		//decompose on one FD and insert the table
		var fdt = FDNotInBCNF[0];
		FDNotInBCNF.splice(0,1);
		relations.push(fdt.left | fdt.right);
		mask = setExclude(mask, fdt.right);
		
		output += "Step" + step + ":";
		output += numToAttribute(tableName, fdt.left) + "->" + numToAttribute(tableName, fdt.right) + " makes the relation not in BCNF\n";
		output += "R" + step + ": {" + numToAttribute(tableName, fdt.left) + "," + numToAttribute(tableName, fdt.right) + "}" + "(keys:" + numToAttribute(tableName, fdt.left) + ")\n\n"; 
		
		var count = 0;
		//update the remaining fds
		for(var i=0;i<fd.length;i++){
			if(setIntersect(fd[count].left, fdt.right) || setIntersect(fd[count].right, fdt.right)){
				fd.splice(count,1);
			}
			else
				count++;
		}
		
		if(fd.length == 0){
			inBCNF = true;
		}
		else{
			FDNotInBCNF = findFDNotInBCNF(fd, tableName);
			if(FDNotInBCNF.length == 0){
				inBCNF = true;
			}
		}
		step++;
		if(inBCNF){
			output += "R" + step + ": {" + numToAttribute(tableName, mask) + "}" + "(keys:" + numToAttribute(tableName, mask) + ")"; 
		}
		
	}
	return output;
}

function is4NF(fd,mvd,tableName){
	var closure=getClosureWithMVD(fd, mvd, tableName);
	var keys=getKeys(closure);
	
	//test BCNF
	for(var i=1;i<closure.length;i++){
		var is_superkey=false;
		for(var j=0;j<keys.length;j++)
			if(isSubsetOf(keys[j],i)){
				is_superkey=true;
				break;
			}
		if(!is_superkey && setExclude(closure[i],i))
			return false;
	}
	
	//now guaranteed to be BCNF
	//test 4NF
	for(var i = 0; i < mvd.length; i++){
		var a = mvd[i];
		is_superkey = false;
		//test if the lhs is a superkey
		for(var j = 0; j < keys.length;j++){
			if(isSubsetOf(keys[j], a.left)){
				is_superkey = true;
				break;
			}
		}
		
		//lhs not superkey and it is not a trivial mvd
		if(!is_superkey && !isSubsetOf(mvd[i].right, mvd[i].left) && (getAttribute(tableName).attribute.length != 2 || setIntersect(mvd[i].left, mvd[i].right)))
			return false;
	}
	
	return true;
}

//test if a has more variables than b
function bitNumCmp(a,b){
	var na=0,nb=0;
	while(a){
		a &= a-1;
		na++;
	}
	while(b){
		b &= b-1;
		nb++;
	}
	return na - nb;
}

//get all the subsets of a
function allSubsets(a){
	//	return vector of all subsets of a except empty set
	var t = [];
	var res = [];
	
	//separate the variables and add them in
	while(a){
		t.push(a - ( a & ( a-1 ) ));
		a &= a-1;
	}
	//the number of variables
	var n=t.length;
	
	//find all the subsets
	for(var i=1;i<(1<<n);i++){
		var k=0;
		for(var j=0;j<n;j++)
			if(i & (1<<j))
				k|=t[j];
		res.push(k);
	}
	//to make sure that smallest number of variables will be tested left
	res.sort(bitNumCmp);
	return res;
}

function removeEmptyFD(fd){
	for(var j=0;j<fd.length;)
		if(fd[j].right==0)
			fd.splice(j,1);
		else
			j++;
}

function equivalent(a,b,closure){
	return isSubsetOf(a,closure[b]) && isSubsetOf(b,closure[a]);
}

function printFDs(fd){
	var output = "";
	
	return output;
}

function Bernstein(_fd, tableName){
	var output = "Bernstein Algorithm\n\n";
	var fd=_fd;
	var closure=getClosure(fd, tableName);
	// step 1, for each A->B, find the smallest subset of A
	// such that A'->B is within the closure
	for(var i=0;i<fd.length;i++){
		var l=allSubsets(fd[i].left);
		for(var j=0;j<l.length;j++)
			if(isSubsetOf(fd[i].right,closure[l[j]])){
				fd[i].left=l[j];
				break;
			}
	}
	
	output += "Step 1: \n";
	for(var i=0;i<fd.length;i++)
		output += numToAttribute(tableName, fd[i].left) + "->" + numToAttribute(tableName, fd[i].right) + "\n";
	
	// step 2, for each A->B, find the minimal subset of B such that
	// replacing it with A->B' doesn't change closure
	for(var i=0;i<fd.length;i++){
		for(var j=0;(1<<j)<=fd[i].right;j++){
			if((1<<j) & fd[i].right){
				fd[i].right ^= (1<<j);
				var p = PII(fd[i].left, 1<<j);
				if(!isMemberOf(p,fd))
					fd[i].right |= (1<<j);
			}
		}
	}
	removeEmptyFD(fd);
	
	output += "\nStep 2: \n";
	for(var i=0;i<fd.length;i++)
		output += numToAttribute(tableName, fd[i].left) + "->" + numToAttribute(tableName, fd[i].right) + "\n";
	
	// step 3, group fds with the same lhs
	//sort according to lhs
	fd.sort();
	
	for(var i=1;i<fd.length;){
		if(fd[i].left == fd[i-1].left){
			fd[i-1].right |= fd[i].right;
			fd.splice(i,1);
		}else{
			i++;
		}
	}
	
	output += "\nStep 3: \n";
	for(var i=0;i<fd.length;i++)
		output += numToAttribute(tableName, fd[i].left) + "->" + numToAttribute(tableName, fd[i].right) + "\n";
	
	// step 4, find equivalent lhs, group them together
	var J = [];
	var H = [];
	
	//construct J
	for(var i=0;i<fd.length;i++){
		for(var j=i+1;j<fd.length;j++)
			if(equivalent(fd[i].left,fd[j].left,closure)){
				var p = PII(fd[i].left, fd[j].left);
				var q = PII(fd[j].left, fd[i].left);
				if(J.length != 0){
					for(var k=0;k<J.length;k++){
						//alert(p.left + " " + p.right);
						if(equivalent(fd[i].left, J[k][0].left,closure)){
							J[k].push(p);
							J[k].push(q);
							break;
						}
						else{
							var x = [];
							x.push(p);
							x.push(q);
							J.push(x);
							break;
						}
					}
				}
				else{
					var x = [];
					x.push(p);
					x.push(q);
					J.push(x);
				}
			}
	}
			
	output += "\nStep 4: \n";
	if(J.length <= 1){
		output += "J = {"
		for(var i=0;i<J.length;i++)
			for(var j=0;j<J[i].length;j++)
				output += numToAttribute(tableName, J[i][j].left) + "->" + numToAttribute(tableName, J[i][j].right) + ";";
		output += "}\n";
	}
	else{
		for(var i=0;i<J.length;i++){
			output += "J" + (i+1) + ": {";
			for(var j=0;j<J[i].length;j++)
				output += numToAttribute(tableName, J[i][j].left) + "->" + numToAttribute(tableName, J[i][j].right) + ";";
			output += "}\n";
		}
	}
	
	//construct H
	for(var i=0;i<fd.length;i++){
		var id=-1;
		//group all the fd with equivalent lhs
		for(var j=0;j<H.length;j++){
			if(equivalent(H[j][0].left,fd[i].left,closure)){
				id=j;
				break;
			}
		}
		if(id==-1){
			var x = [];
			x.push(fd[i]);
			H.push(x);
		}else{
			H[id].push(fd[i]);
		}
	}
	
	//removal of J from H[i]
	for(var i=0;i<H.length;i++){
		var t=0;
		for(var j=0;j<H[i].length;j++)
			t|=H[i][j].left;
		for(var j=0;j<H[i].length;j++)
			H[i][j].right=setExclude(H[i][j].right,t);
		removeEmptyFD(H[i]);
	}

	for(var i=0;i<H.length;i++){
		output += "H" + (i+1) + ": {";
		for(var j=0;j<H[i].length;j++)
			output += numToAttribute(tableName, H[i][j].left) + "->" + numToAttribute(tableName, H[i][j].right) + ";";
		output += "}\n";
	}

	// step 5, for each H[i], eliminate rhs attributes as much as possible without changing
	// closure of H union J
	var HJ = [];
	
	//push everything in H and J into HJ
	for(var i=0;i<H.length;i++)
		for(var j=0;j<H[i].length;j++)
			HJ.push(H[i][j]);
	for(var i=0;i<J.length;i++)
		for(var j=0;j<J[i].length;j++)	
			HJ.push(J[i][j]);
		
	var ct=0;
	for(var i=0;i<H.length;i++){
		for(var j=0;j<H[i].length;j++){
			var rhs=H[i][j].right;
			for(var k=1;k<=rhs;k<<=1){
				if(rhs & k){
					HJ[ct].right ^= k;
					var p = PII(H[i][j].left, k);
					if(isMemberOf(p,HJ)){
					}else{
						HJ[ct].right |= k;
					}
				}
			}
			ct++;
		}
	}
	
	for(var i=0;i<H.length;i++)
		removeEmptyFD(H[i]);
	
	output += "\nStep 5: \n";
	if(J.length <= 1){
		output += "J = {"
		for(var i=0;i<J.length;i++)
			for(var j=0;j<J[i].length;j++)
				output += numToAttribute(tableName, J[i][j].left) + "->" + numToAttribute(tableName, J[i][j].right) + ";";
		output += "}\n";
	}
	else{
		for(var i=0;i<J.length;i++){
			output += "J" + (i+1) + ": {";
			for(var j=0;j<J[i].length;j++)
				output += numToAttribute(tableName, J[i][j].left) + "->" + numToAttribute(tableName, J[i][j].right) + ";";
			output += "}\n";
		}
	}
	
	for(var i=0;i<H.length;i++){
		output += "H" + (i+1) + ": {";
		for(var j=0;j<H[i].length;j++)
			output += numToAttribute(tableName, H[i][j].left) + "->" + numToAttribute(tableName, H[i][j].right) + ";";
		output += "}\n";
	}
	
	var JLength = J.length;
	
	//step 6 
	// Add corresponding FD in J into H[i]
	for(var i=0;i<H.length;i++)
		for(var j=0;j<H[i].length;j++)
			for(var r=0;r<J.length;r++)
				for(var k=0;k<J[r].length;)
					if(J[r][k].left == H[i][j].left){
						//push everything in J inside H[i]
						for(var t=0;t<J[r].length;t++)
							H[i].push(J[r][t]);
						J[r] = [];
						JLength--;
						break;
					}else{
						k++;
					}
					
	output += "\nStep 6: \n";
	
	//if J is not empty
	var index = 1;
	if(JLength != 0){
		for(var r=0;r<J.length;r++){
			var keys = [];
			for(var i=0;i<J[r].length;i++){
				var attributeValue = 0;
				var isKey = true;
				attributeValue |= J[r][i].left;
				attributeValue |= J[r][i].right;
				//test if the key is inserted already
				for(var k=0;k<keys.length;k++){
					if(keys[k] == J[r][i].left)
						isKey = false;
				}
				if(isKey)
					keys.push(J[r][i].left);
			}
			output += "R" + index + ": {" + numToAttribute(tableName, attributeValue) + ";}" + "(keys:";
			for(var k=0;k<keys.length;k++) 
				output += numToAttribute(tableName, keys[k]) + ";"; 
			output += ")\n";
			index++;
		}
	}
	
	//remove empty H[i]
	for(var i=0;i<H.length;i++) 
		removeEmptyFD(H[i]);
	
	for(var i=0;i<H.length;i++){
		var attributeValue = 0;
		var keys = [];
		for(var j=0;j<H[i].length;j++){
			var isKey = true;
			attributeValue |= H[i][j].left;
			attributeValue |= H[i][j].right;
			for(var k=0;k<keys.length;k++)
				if(keys[k] == H[i][j].left)
					isKey = false;
			if(isKey)
				keys.push(H[i][j].left);
		}
		
		if(H[i].length != 0){
			output += "R" + index + ": {" + numToAttribute(tableName, attributeValue) + ";}" + "(keys:";
			for(var k=0;k<keys.length;k++) 
				output += numToAttribute(tableName, keys[k]) + ";"; 
			output += ")\n";
			index++;	
		}		
	}

	return output;
}

//LTK Algorithm
function PII(a,b){
	var obj = new Object();
	obj.left = a;
	obj.right = b;
	return obj;

}


function removeDulplicateSet(a){
	a.sort();
	for(var i=1;i<a.length;i++){
		if(a[i]==a[i-1])
		{
			a.splice(i,1);
			i--;
		}
	}
	//return a;
}
function preparatory( _fd, tableName){
	var fd=_fd;
	var closure=getClosure(fd,tableName);
	
	//step 1 is the same as step 1 and 2 of Bernstein's algo
	for(var i=0;i<fd.length;i++){
		var l=allSubsets(fd[i].left);
		for(var j=0;j<l.length;j++)
			if(isSubsetOf(fd[i].right,closure[l[j]])){
				fd[i].left=l[j];
				break;
			}
	}
	for(var i=0;i<fd.length;i++){
		for(var j=0;(1<<j)<=fd[i].right;j++){
			if((1<<j) & fd[i].right){
				fd[i].right ^= (1<<j);
				//PII p(fd[i].left,1<<j);
				var p = new Object();
				p.left = fd[i].left;
				p.right = 1<<j
				if(!isMemberOf(p,fd))
					fd[i].right |= (1<<j);
			}
		}
	}
	
	removeEmptyFD(fd);
	//step 2, 3: group fds together by equivalent lhs,
	//build relations and synthesized keys
	//
	var vis = new Array(fd.length);
	var res =[];

	
	for(var i=0;i<fd.length;i++){
		if(vis[i])continue;
		vis[i]=true;
		var p=fd[i];
		var A=p.left | p.right;
		//alert(A);
		var synKeys=new Array();
		synKeys.push(p.left);
		//alert(synKeys);
		for(var j=i+1;j<fd.length;j++){
			if(vis[j])continue;
			var q=fd[j];
			if(equivalent(p.left,q.left,closure)){
				vis[j]=true;
				A |= q.left | q.right;
				synKeys.push(q.left);
				//alert(synKeys);
			}
		}
		
		removeDulplicateSet(synKeys);
		var obj = new Object();
		obj.A=A;
		obj.keys= synKeys;
		res.push(obj);
	}
	//step 4: if not relation's all attributes form a key
	//then add "all key relation" with some minimal key
	var hasKey=false;
	var allAttr=closure.length-1;
	for(var i =0;i<res.length;i++){
		if(closure[res[i].A]==allAttr){
			hasKey=true;
			
			break;
		}
	}
	if(!hasKey){
		var A=getAkey(closure);
		var keys = new Array();
		keys.push(A);
		var obj = new Object();
		obj.A = A;
		obj.keys = keys
		res.push(obj);
	}
	return res;
}
function getAkey(closure){
	var allAttr=closure.length-1;
	for(var i=0;i<=allAttr;i++)
		if(closure[i]==allAttr)
			return closure[i];
	//alert("never reach here");
}
function findAKeyIn(K,A,fd,tableName){
	var closure=getClosure(fd,tableName);
	//assert(isSubsetOf(A,closure[K]));
	var t=K;
	while(t){
		var B=t - (t & (t-1));
		t-=B;
		if(isSubsetOf(A,closure[K-B]))
			K-=B;
	}
	return K;
}

function superfluousAttributeDetection (R, B, I,fd,tableName){
	var Ai=R[I].A;
	var isSup=true;
	//construct Ki prime
	var Ki=R[I].keys;
	var Kip = new Array();
	var Kipr = new Array();
	for(var i=0;i<Ki.length;i++){
		if(!isSubsetOf(B,Ki[i]))
			Kip.push(Ki[i]);
		else
			Kipr.push(Ki[i]);
	}
	if(Kip.length ==0) {var c= new Array();return c;}
	//construct Gi(B) prime
	var GiBp = new Array();
	for(var i=0;i<R.length;i++){ 
		//alert(R.length);
		var tAi=R[i].A;
		var K=R[i].keys;
		for(var j=0;j<K.length;j++){
			var t=setExclude(tAi,K[j]);
			if(i==I){
				t=setExclude(t,B);
				if(isSubsetOf(B,K[j]))continue;
			}
			
			GiBp.push(PII(K[j],t));
			//alert(PII(K[j],t));
		}
	}
	for(var i=0;i<Kip.length;i++){
		if(isMemberOf(PII(Kip[i],B),GiBp)){
			//step 3
			for(var j=0;j<Kipr.length;j++){
				var K=Kipr[j];
				if(!isMemberOf(PII(K,Ai),GiBp)){
					var M=getClosureForAttribute(K,GiBp);
					if(!isMemberOf(PII(setExclude(setIntersect(M,Ai),B),Ai),fd)){
						isSup=false;
						var c=[];
						return c;
					}else{
						Kip.push(findAKeyIn(setExclude(setUnion(M,Ai),B),R[i].A,fd,tableName));
					}
				}
			}
			return Kip;
		}
	}
	var c=[];
	return c;
}
function LTK( fd,tableName){
	var R=preparatory(fd,tableName);
	var resultString = "preparatory result: \n" ;
	for(var i=0;i<R.length;i++){
		resultString += "R" + (i+1) +"\n" + numToAttribute(tableName,R[i].A)+"\n" ;
		resultString += "Keys: \n";
		
		var keys=R[i].keys;
		for(var j=0;j<keys.length;j++)
			resultString += " " +numToAttribute(tableName,keys[j]) + "\n";
		resultString += "\n" ;
	}
	for(var i=0;i<R.length;i++){
		var temp=R[i].A;
		var synKeys=R[i].keys;
		var t=temp;
		while(t){
			var B=t - (t & (t-1));
			t-=B;
			
			var res=superfluousAttributeDetection(R,B,i,fd,tableName);
			if(res.length){
				temp^=B;
				synKeys=res;
				R[i].A=temp;
				R[i].keys=synKeys;
			}
		}
	}
	
	for(var i=0;i<R.length;i++) removeDulplicateSet(R[i].keys);
	var result= "\nFinal result: \n" ;
	for(var i=0;i<R.length;i++){
		result += "R" +(i+1)+":{" +
			numToAttribute(tableName,R[i].A) +"} ";
		result+="keys:"
		var keys=R[i].keys;
		for(var j=0;j<keys.length;j++)
			result += " (" +numToAttribute(tableName,keys[j]) + ").";
		result+= "\n";
	}
	return result;
}

function thirdNFDecomposition(fd, tablename)	
{

	//if (is3NF(fd, tablename)) return "\nIt is 3NF already.";
	var _fd = fd;
	var closure=getClosure(fd, tablename);
	var string="";
	
	//left reduction
	string+="3NF Decomposition: \n\nStep 1: left reduction\n";
	for(var i=0;i<_fd.length;i++)
	{
		var subset=allSubsets(_fd[i].left);
		for(var j=0;j<subset.length;j++)
		{
			if(_fd[i].left!=subset[j] && isSubsetOf(_fd[i].right,closure[subset[j]]))
			{
				string+=numToAttribute(tablename,_fd[i].left)+"->"+numToAttribute(tablename,_fd[i].right)+" becomes "+numToAttribute(tablename,subset[j])+"->"+numToAttribute(tablename,_fd[i].right)+"\n";
				_fd[i].left=subset[j];
				break;
			}
		}
	}
	
	for(var i=0;i<_fd.length;i++)
	{
		for(var j=_fd.length-1;j>i;j--)
		{
			if(_fd[i].left==_fd[j].left)
			{
				_fd[i].right = setUnion(_fd[i].right, _fd[j].right);
				_fd.splice(j, 1);
			}
		}
	}
	
	string+="\nStep 2: right reduction\n";
	//right reduction
	
	var count = [];
	var attribute = getAttribute(tablename).attribute;
	
	for(var i=0;i<attribute.length;i++)
	{
		count[i] = 0;
	}
	
	for(var i=0;i<_fd.length;i++)
	{
		for(var j=0;j<attribute.length;j++)
		{
			var mask = 1<<j;
			count[attribute.length-Math.log(_fd[i].right&mask)/Math.log(2)]++;
		}
	}
	
	for(var i=0;i<_fd.length;i++)
	{
		var subset=allSubsets(_fd[i].right);
		for(var j=0;j<subset.length;j++)
		{
			if(_fd[i].right!=subset[j] && isSubsetOf(_fd[i].right,closure[subset[j]]))
			{
				string+=numToAttribute(tablename,_fd[i].left)+"->"+numToAttribute(tablename,_fd[i].right)+" becomes "+numToAttribute(tablename, _fd[i].left)+"->"+numToAttribute(tablename,subset[j])+"\n";
				_fd[i].right=subset[j];
				break;
			}
		}
	}
	
	string+="\nStep 3: redudunt dependency reduction\n";
	//redudunt dependency reduction
	
	for(var i=0;i<_fd.length;i++)
	{
		for(var j=_fd.length-1;j>i;j--)
		{
			if(_fd[i].right==_fd[j].left)
			{
				for(var k=_fd.length-1; k>=0; k--)
				{
					if (_fd[k].left==_fd[j].left && _fd[k].right==_fd[i].right)
					{
						string+=numToAttribute(tablename,_fd[k].left)+"->"+numToAttribute(tablename,_fd[k].right) + " is removed. \n"
						fd.splice(k, 1);
					}
				}
			}
		}
	}
	
	string+="\nFinal output:\n";
	for(var i=0;i<_fd.length;i++)
	{
		string+="R"+(i+1)+": {" + numToAttribute(tablename,_fd[i].left) +","+ numToAttribute(tablename,_fd[i].right) + "} (key: " + numToAttribute(tablename,_fd[i].left) +")\n";
	}
	
	return string;
}

function isLossless(tables,closure){
	var update;
	do{
		update=false;
		for(var i=0;i<tables.size();i++){
			for(var j=i+1;j<tables.size();){
				var k=setIntersect(tables[i],tables[j]);
				//	if common part of two tables determins at least one of the table,
				//	then can join the two tables;
				if(isSubsetOf(tables[i],closure[k]) 
					|| isSubsetOf(tables[j],closure[k])){
					update=true;
					tables[i] |= tables[j];
					tables.splice(j,1);
				}else j++;
			}
		}
	}while(update);
	return tables.size()==1 && tables[0]==closure.size()-1;
}

function isDependencyPreserving(tables,closure,fds0){
	var fds;
	for(var i=0;i<tables.size();i++){
		var ss=allSubsets(tables[i]);
		for(var j=0;j<ss.size();j++){
			var a=ss[j],b=setExclude(closure[a],a);
			if(b)fds.push_back(PII(a,b));
		}
	}
	for(var i=0;i<fds0.size();i++)
		if(!isMemberOf(fds0[i],fds))
			return false;
	return true;
}

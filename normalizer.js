var attr_JSON = {"attribute": [
        {"name": ""}
    ]
};

var fd_JSON = {"fd": [
        {"left": "", "right": "", "type": ""}
    ]
};

function isSubsetOf(a, b) {
    return (a & b) == a;
}

function isProperSubsetOf(a, b) {
    return a != b && isSubsetOf(a, b);
}

function setUnion(a, b) {
    return a | b;
}

function setIntersect(a, b) {
    return a & b;
}

function setExclude(a, b) {
    return setIntersect(a, ~b);
}

function max(a, b) {
    if (a > b)
        return a;
    else
        return b;
}

function addAttr(object)
{
    for(var i = attr_JSON.attribute.length - 1; i >=0 ; i--)
    {
        attr_JSON.attribute.splice(i,1);
    }

    for(var i = 0; i < object.length; i++)
    {
        var attribute_to_insert = {"name": object[i]};
        attr_JSON.attribute.push(attribute_to_insert);
    }
}


function getAttr()
{
    
    var result = {"attribute": []};
    for(var i = 0; i < attr_JSON.attribute.length; i++)
    {
        if (!attr_JSON.attribute[i]) continue;
        result.attribute.push(attr_JSON.attribute[i]);
    }
    return result;
}

function insertFD(left, right, type)
{
    var fd_to_insert = {"left": left, "right": right, "type": type};
    for(var i = 0; i < fd_JSON.fd.length; i++)
    {
        if (!fd_JSON.fd[i]) continue;
        if (fd_JSON.fd[i].left=="") {fd_JSON.fd.splice(i,1); continue;}
        if (fd_JSON.fd[i].left == left && fd_JSON.fd[i].right == right && fd_JSON.fd[i].type == type)
        {
            fd_JSON.fd.splice(i,1);
            break;
        }
    }
    fd_JSON.fd.push(fd_to_insert);
}


function getFD()
{
    var result = {"fd": []};    
    for(var i = 0; i < fd_JSON.fd.length; i++)
    {
        if (!fd_JSON.fd[i]) continue;
         result.fd.push(fd_JSON.fd[i]);
    }
    return result;
    console.log(result);
}

function getFDNo()
{
    var result = [];
    var fd = getFD().fd;
    var attribute = getAttr().attribute;

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
            
            result.push(retObj);
        }
    }
    return result;
}

function getMVDNo()
{
    var ret = [];
    var fd = getFD().fd;
    var attribute = getAttr().attribute;
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

function numToAttr(num)
{
    var attribute = getAttr().attribute;
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

function MVDclosure(fd, mvd) {
    var closure = getclosure(fd);

    if (mvd.length != 0) {
        while (1) {
            var update = false;
            for (var i = 0; i < mvd.length; i++) {
                var subset = allSubsets(mvd[i].right);
                for (var j = 0; j < subset.length; j++) {
                    for (var k = 0; k < closure.length; k++) {
                        if (isSubsetOf(subset[j], closure[k]) && !setIntersect(k, mvd[i].right) && !isSubsetOf(subset[j], closure[mvd[i].left])) {
                            closure[mvd[i].left] |= subset[j];
                            update = true;
                        }
                    }
                }
            }
            if (!update) break;
        }
    }
    return closure;
}

function getKeys(closure) {
    var keys = [];
    var n = closure.length;
    for (var i = 0; i < n; i++) {
        var a = i,
            b = closure[i];
        if (b == n - 1)
            keys.push(a);
    }
    keys.sort(function (a, b) {
        return a - b;
    })
    for (var i = 0; i < keys.length; i++)
        for (var j = i + 1; j < keys.length;)
            if (isSubsetOf(keys[i], keys[j]))
                keys.splice(j, 1);
            else
                j++;
    return keys;
}


function retLocation(array, object)
{
    for(var i = 0; i<array.length; i++)
    {
        if (array[i].name == object) return array.length-i-1;
    }
    return -1;
}

function getclosure(fd) {
    var varNum = 0;
    varNum = getAttr().attribute.length;
    console.log(fd);
    var n = 1 << varNum;
    var g = [];
    for (var i = 0; i < n; i++) g[i] = i;
    for (var i = 0; i < fd.length; i++) {
        var a = fd[i];
        g[a.left] = setUnion(g[a.left], a.right);
    }
    while (1) {
        var update = false;
        for (var k = 0; k < n; k++)
            for (var i = 0; i < n; i++)
                for (var j = 0; j < n; j++)
                    if (isSubsetOf(k, g[i]) && isSubsetOf(j, g[k]) && !isSubsetOf(j, g[i])) {
                        g[i] = setUnion(g[i], j);
                        update = true;
                    }
        if (!update) break;
    }

    return g;
}


function closureForAttr(attr, fd) {
    var res = attr;
    var update;
    do {
        update = false;
        for (var i = 0; i < fd.length; i++) {
            var a = fd[i];
            if (isSubsetOf(a.left, res) && setExclude(a.right, res)) {
                update = true;
                res = setUnion(res, a.right);
            }
        }
    } while (update);
    return res;
}

function isMemberOf(p, fd) {
    return isSubsetOf(p.right, closureForAttr(p.left, fd));
}

function is2NF(fd) {

    var closure = getclosure(fd);
    var keys = getKeys(closure);
    if (keys.length == 0) return true;
    var N = getAttr().attribute.length; 
    var prime = 0;
    for (var i = 0; i < keys.length; i++)
        prime = setUnion(prime, keys[i]);
    var nonPrime = (~prime) & ((1 << N) - 1);
    if (!nonPrime) return true;
    for (var i = 1; i < closure.length; i++) {
        var is_proper_subset_of_key = false;
        for (var j = 0; j < keys.length; j++)
            if (isProperSubsetOf(i, keys[j])) {
                is_proper_subset_of_key = true;
                break;
            }
        if (is_proper_subset_of_key && setIntersect(closure[i], nonPrime))
            return false;
    }
    return true;
}

function is3NF(fd) {
    var closure = getclosure(fd);
    var keys = getKeys(closure);
    if (keys.length == 0) return true;
    var N = getAttr().attribute.length;
    var prime = 0,
        nonPrime;
    for (var i = 0; i < keys.length; i++)
        prime |= keys[i];
    nonPrime = (~prime) & ((1 << N) - 1);
    if (!nonPrime) return true;
    for (var i = 1; i < closure.length; i++) {
        var is_superkey = false;
        for (var j = 0; j < keys.length; j++)
            if (isSubsetOf(keys[j], i)) {
                is_superkey = true;
                break;
            }
        if (!is_superkey && setIntersect(setExclude(closure[i], i), nonPrime))
            return false;
    }
    return true;
}

function isBCNF(g) {
    var closure = getclosure(g);
    var keys = getKeys(closure);
    for (var i = 1; i < closure.length; i++) {
        var is_superkey = false;
        for (var j = 0; j < keys.length; j++)
            if (isSubsetOf(keys[j], i)) {
                is_superkey = true;
                break;
            }
        if (!is_superkey && setExclude(closure[i], i))
            return false;
    }
    return true;
}

function findFDNotInBCNF(fd) {
    var FDNotInBCNF = [];
    var lhs = [];
    var closure = getclosure(fd);
    var keys = getKeys(closure);
    var inBCNF = true;

    for (var i = 1; i < closure.length; i++) {
        var is_superkey = false;
        for (var j = 0; j < keys.length; j++)
            if (isSubsetOf(keys[j], i)) {
                is_superkey = true;
                break;
            }
        if (!is_superkey && setExclude(closure[i], i))
            lhs.push(i);
    }

    for (var i = 0; i < fd.length; i++)
        for (var j = 0; j < lhs.length; j++)
            if (fd[i].left == lhs[j]) {
                FDNotInBCNF.push(fd[i]);
            }

    return FDNotInBCNF;
}

function is4NF(fd, mvd) {
    var closure = MVDclosure(fd, mvd);
    var keys = getKeys(closure);

    //test BCNF
    for (var i = 1; i < closure.length; i++) {
        var is_superkey = false;
        for (var j = 0; j < keys.length; j++)
            if (isSubsetOf(keys[j], i)) {
                is_superkey = true;
                break;
            }
        if (!is_superkey && setExclude(closure[i], i))
            return false;
    }

    for (var i = 0; i < mvd.length; i++) {
        var a = mvd[i];
        is_superkey = false;
        for (var j = 0; j < keys.length; j++) {
            if (isSubsetOf(keys[j], a.left)) {
                is_superkey = true;
                break;
            }
        }
        if (!is_superkey && !isSubsetOf(mvd[i].right, mvd[i].left) && (getAttr().attribute.length != 2 || setIntersect(mvd[i].left, mvd[i].right)))
            return false;
    }

    return true;
}


function BCNFDecomp(fd) {
    var FDNotInBCNF = [];
    var inBCNF = true;
    var varNum = getAttr().attribute.length;
    var mask = (1 << varNum) - 1;
    var step = 1;
    var ouput;
    output = "BCNF Decomposition Method\n\n";

    FDNotInBCNF = findFDNotInBCNF(fd);

    if (FDNotInBCNF.length != 0)
        inBCNF = false;
    else {
        output += "No change\n";
        return output;
    }

    var relations = [];
    while (!inBCNF) {
        var fdt = FDNotInBCNF[0];
        FDNotInBCNF.splice(0, 1);
        relations.push(fdt.left | fdt.right);
        mask = setExclude(mask, fdt.right);

        output += "Step" + step + ":";
        output += numToAttr(fdt.left) + "->" + numToAttr(fdt.right) + " makes the relation not in BCNF\n";
        output += "R" + step + ": {" + numToAttr(fdt.left) + "," + numToAttr(fdt.right) + "}" + "(keys:" + numToAttr(fdt.left) + ")\n\n";

        var count = 0;
        for (var i = 0; i < fd.length; i++) {
            if (setIntersect(fd[count].left, fdt.right) || setIntersect(fd[count].right, fdt.right)) {
                fd.splice(count, 1);
            } else
                count++;
        }

        if (fd.length == 0) {
            inBCNF = true;
        } else {
            FDNotInBCNF = findFDNotInBCNF(fd);
            if (FDNotInBCNF.length == 0) {
                inBCNF = true;
            }
        }
        step++;
        if (inBCNF) {
            output += "R" + step + ": {" + numToAttr(mask) + "}" + "(keys:" + numToAttr(mask) + ")";
        }

    }
    return output;
}

function numCmp(a, b) {
    var na = 0,
        nb = 0;
    while (a) {
        a &= a - 1;
        na++;
    }
    while (b) {
        b &= b - 1;
        nb++;
    }
    return na - nb;
}

function allSubsets(a) {

    var t = [];
    var res = [];

    while (a) {
        t.push(a - (a & (a - 1)));
        a &= a - 1;
    }
    //the number of variables
    var n = t.length;

    //find all the subsets
    for (var i = 1; i < (1 << n); i++) {
        var k = 0;
        for (var j = 0; j < n; j++)
            if (i & (1 << j))
                k |= t[j];
        res.push(k);
    }

    res.sort(numCmp);
    return res;
}

function rmvEmFD(fd) {
    for (var j = 0; j < fd.length;)
        if (fd[j].right == 0)
            fd.splice(j, 1);
        else
            j++;
}

function equal(a, b, closure) {
    return isSubsetOf(a, closure[b]) && isSubsetOf(b, closure[a]);
}

function Bernstein(_fd) {
    var fd = _fd;
    var closure = getclosure(fd);
    var output = "Bernstein Algorithm\n";
    for (var i = 0; i < fd.length; i++) {
        var l = allSubsets(fd[i].left);
        for (var j = 0; j < l.length; j++)
            if (isSubsetOf(fd[i].right, closure[l[j]])) {
                fd[i].left = l[j];
                break;
            }
    }

    output += "Step 1: \n";
    for (var i = 0; i < fd.length; i++)
        output += numToAttr(fd[i].left) + "->" + numToAttr(fd[i].right) + "\n";

    for (var i = 0; i < fd.length; i++) {
        for (var j = 0;
            (1 << j) <= fd[i].right; j++) {
            if ((1 << j) & fd[i].right) {
                fd[i].right ^= (1 << j);
                var p = PII(fd[i].left, 1 << j);
                if (!isMemberOf(p, fd))
                    fd[i].right |= (1 << j);
            }
        }
    }
    rmvEmFD(fd);

    output += "\nStep 2: \n";
    for (var i = 0; i < fd.length; i++)
        output += numToAttr(fd[i].left) + "->" + numToAttr(fd[i].right) + "\n";

    fd.sort();

    for (var i = 1; i < fd.length;) {
        if (fd[i].left == fd[i - 1].left) {
            fd[i - 1].right |= fd[i].right;
            fd.splice(i, 1);
        } else {
            i++;
        }
    }

    output += "\nStep 3: \n";
    for (var i = 0; i < fd.length; i++)
        output += numToAttr(fd[i].left) + "->" + numToAttr(fd[i].right) + "\n";

    var J = [];
    var H = [];

    for (var i = 0; i < fd.length; i++) {
        for (var j = i + 1; j < fd.length; j++)
            if (equal(fd[i].left, fd[j].left, closure)) {
                var p = PII(fd[i].left, fd[j].left);
                var q = PII(fd[j].left, fd[i].left);
                if (J.length != 0) {
                    for (var k = 0; k < J.length; k++) {
                        //alert(p.left + " " + p.right);
                        if (equal(fd[i].left, J[k][0].left, closure)) {
                            J[k].push(p);
                            J[k].push(q);
                            break;
                        } else {
                            var x = [];
                            x.push(p);
                            x.push(q);
                            J.push(x);
                            break;
                        }
                    }
                } else {
                    var x = [];
                    x.push(p);
                    x.push(q);
                    J.push(x);
                }
            }
    }

    output += "\nStep 4: \n";
    if (J.length <= 1) {
        output += "J = {"
        for (var i = 0; i < J.length; i++)
            for (var j = 0; j < J[i].length; j++)
                output += numToAttr(J[i][j].left) + "->" + numToAttr(J[i][j].right) + ";";
        output += "}\n";
    } else {
        for (var i = 0; i < J.length; i++) {
            output += "J" + (i + 1) + ": {";
            for (var j = 0; j < J[i].length; j++)
                output += numToAttr(J[i][j].left) + "->" + numToAttr(J[i][j].right) + ";";
            output += "}\n";
        }
    }

    for (var i = 0; i < fd.length; i++) {
        var id = -1;
        for (var j = 0; j < H.length; j++) {
            if (equal(H[j][0].left, fd[i].left, closure)) {
                id = j;
                break;
            }
        }
        if (id == -1) {
            var x = [];
            x.push(fd[i]);
            H.push(x);
        } else {
            H[id].push(fd[i]);
        }
    }

    for (var i = 0; i < H.length; i++) {
        var t = 0;
        for (var j = 0; j < H[i].length; j++)
            t |= H[i][j].left;
        for (var j = 0; j < H[i].length; j++)
            H[i][j].right = setExclude(H[i][j].right, t);
        rmvEmFD(H[i]);
    }

    for (var i = 0; i < H.length; i++) {
        output += "H" + (i + 1) + ": {";
        for (var j = 0; j < H[i].length; j++)
            output += numToAttr(H[i][j].left) + "->" + numToAttr(H[i][j].right) + ";";
        output += "}\n";
    }

    var HJ = [];

    for (var i = 0; i < H.length; i++)
        for (var j = 0; j < H[i].length; j++)
            HJ.push(H[i][j]);
    for (var i = 0; i < J.length; i++)
        for (var j = 0; j < J[i].length; j++)
            HJ.push(J[i][j]);

    var ct = 0;
    for (var i = 0; i < H.length; i++) {
        for (var j = 0; j < H[i].length; j++) {
            var rhs = H[i][j].right;
            for (var k = 1; k <= rhs; k <<= 1) {
                if (rhs & k) {
                    HJ[ct].right ^= k;
                    var p = PII(H[i][j].left, k);
                    if (isMemberOf(p, HJ)) {} else {
                        HJ[ct].right |= k;
                    }
                }
            }
            ct++;
        }
    }

    for (var i = 0; i < H.length; i++)
        rmvEmFD(H[i]);

    output += "\nStep 5: \n";
    if (J.length <= 1) {
        output += "J = {"
        for (var i = 0; i < J.length; i++)
            for (var j = 0; j < J[i].length; j++)
                output += numToAttr(J[i][j].left) + "->" + numToAttr(J[i][j].right) + ";";
        output += "}\n";
    } else {
        for (var i = 0; i < J.length; i++) {
            output += "J" + (i + 1) + ": {";
            for (var j = 0; j < J[i].length; j++)
                output += numToAttr(J[i][j].left) + "->" + numToAttr(J[i][j].right) + ";";
            output += "}\n";
        }
    }

    for (var i = 0; i < H.length; i++) {
        output += "H" + (i + 1) + ": {";
        for (var j = 0; j < H[i].length; j++)
            output += numToAttr(H[i][j].left) + "->" + numToAttr(H[i][j].right) + ";";
        output += "}\n";
    }

    var JLength = J.length;

    for (var i = 0; i < H.length; i++)
        for (var j = 0; j < H[i].length; j++)
            for (var r = 0; r < J.length; r++)
                for (var k = 0; k < J[r].length;)
                    if (J[r][k].left == H[i][j].left) {
                        for (var t = 0; t < J[r].length; t++)
                            H[i].push(J[r][t]);
                        J[r] = [];
                        JLength--;
                        break;
                    } else {
                        k++;
                    }

    output += "\nStep 6: \n";

    var index = 1;
    if (JLength != 0) {
        for (var r = 0; r < J.length; r++) {
            var keys = [];
            for (var i = 0; i < J[r].length; i++) {
                var attributeValue = 0;
                var isKey = true;
                attributeValue |= J[r][i].left;
                attributeValue |= J[r][i].right;
                for (var k = 0; k < keys.length; k++) {
                    if (keys[k] == J[r][i].left)
                        isKey = false;
                }
                if (isKey)
                    keys.push(J[r][i].left);
            }
            output += "R" + index + ": {" + numToAttr(attributeValue) + ";}" + "(keys:";
            for (var k = 0; k < keys.length; k++)
                output += numToAttr(keys[k]) + ";";
            output += ")\n";
            index++;
        }
    }

    for (var i = 0; i < H.length; i++)
        rmvEmFD(H[i]);

    for (var i = 0; i < H.length; i++) {
        var attributeValue = 0;
        var keys = [];
        for (var j = 0; j < H[i].length; j++) {
            var isKey = true;
            attributeValue |= H[i][j].left;
            attributeValue |= H[i][j].right;
            for (var k = 0; k < keys.length; k++)
                if (keys[k] == H[i][j].left)
                    isKey = false;
            if (isKey)
                keys.push(H[i][j].left);
        }

        if (H[i].length != 0) {
            output += "R" + index + ": {" + numToAttr(attributeValue) + ";}" + "(keys:";
            for (var k = 0; k < keys.length; k++)
                output += numToAttr(keys[k]) + ";";
            output += ")\n";
            index++;
        }
    }

    return output;
}

function PII(a, b) {
    var obj = new Object();
    obj.left = a;
    obj.right = b;
    return obj;

}


function removeDuSet(a) {
    a.sort();
    for (var i = 1; i < a.length; i++) {
        if (a[i] == a[i - 1]) {
            a.splice(i, 1);
            i--;
        }
    }
}

//(function(){

/*---------------------------------工具函数开始---------------------------------------------*/
    
/**
 * 给一个element绑定一个针对event事件的响应，响应函数为listener，兼容IE
 * 
 * @param {HTMLELement} 
 * @param {event}
 * @param {Function}
 */
function addEvent(element, event, listener) {
    if (!!element.addEventListener){
        element.addEventListener(event,listener,!1);
    }else{
        element.attachEvent('on'+event,listener);
    }
}

/**
 * 移除element对象对于event事件发生时执行listener的响应
 * 
 * @param  {HTMLElement}
 * @param  {event}
 * @param  {Function}
 */
function removeEvent(element, event, listener) {
    if (!!element.removeEventListener){
        element.removeEventListener(event,listener,!1);
    }else{
        element.detachEvent('on'+event,listener);
    }
}

/**
 * 实现对click事件的绑定
 * 
 * @param {HTMLElement}
 * @param {Function}
 */
function addClickEvent(element, listener) {
    addEvent(element,'click',listener);
}
    
/**
 * 判断parent是否element的祖先节点
 * 
 * @param  {HTMLElement}
 * @param  {HTMLElement}
 * @return {Boolean}
 */
function isParent(element,parentName,stopElem){
	for (var node = element; node !== stopElem; node = node.parentNode) {
        if (node.nodeName.toLowerCase() === parentName) {
            return node;
        }
    }
    return false;
}

/**
 * 事件代理函数，实现对element里面所有tag的eventName事件进行响应
 * 
 * @param  {HTMLElement} 目标节点的祖先元素
 * @param  {HTMLElement} 目标节点
 * @param  {event} 监听事件
 * @param  {Function} 响应函数
 */
function delegateEvent(element, tag, eventName, listener) {
    addEvent(element, eventName, function(event){
    	var event = event || window.event;
    	var target = event.target || event.srcElement;
        var parent = isParent(target,tag,element);
    	if (!!parent) {
    		listener(parent,event);
    	};
    })
}

//innerText的FF兼容
if (!('innerText' in document.body)) {
  HTMLElement.prototype.__defineGetter__('innerText', function(){
    return this.textContent;
  });
  HTMLElement.prototype.__defineSetter__('innerText', function(s) {
    return this.textContent = s;
  });
}
    
/**
 * 以下是class的操作，增删改查
 * 
 * @author 是百度IFE的hushicai
 */

/**
* 判断是否有某个className
* @param {HTMLElement} element 元素
* @param {string} className className
* @return {boolean}
*/
function hasClass(element, className) {
    var classNames = element.className;
    if (!classNames) {
        return false;
    }
    classNames = classNames.split(/\s+/);
    for (var i = 0, len = classNames.length; i < len; i++) {
        if (classNames[i] === className) {
            return true;
        }
    }
    return false;
}

/**
* 添加className
*
* @param {HTMLElement} element 元素
* @param {string} className className
*/
function addClass(element, className) {
    if (!hasClass(element, className)) {
        element.className = element.className ?[element.className, className].join(' ') : className;
    }
}

/**
* 删除元素className
*
* @param {HTMLElement} element 元素
* @param {string} className className
*/
function removeClass(element, className) {
    if (className && hasClass(element, className)) {
        var classNames = element.className.split(/\s+/);
        for (var i = 0, len = classNames.length; i < len; i++) {
            if (classNames[i] === className) {
                classNames.splice(i, 1);
                break;
            }
        }
    element.className = classNames.join(' ');
    }
}

//get请求函数封装
function get(url,options,callback){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                callback(xhr.responseText);
            } else {
                console.error('Request was unsuccessful: ' + xhr.status);
            }
        };
    }
    if (!!options) {
        var url = url + '?' + serialize(options);
    };
    xhr.open("get",url,true);
    xhr.send(null);

    function serialize(data){
        if (!data) {
            return "";
        };
        var pairs = [];
        for (var name in data) {
            if (!data.hasOwnProperty(name)) {
                continue;
            };
            if (typeof data[name] === "function") {
                continue;
            };
            var value = data[name].toString();
            name = encodeURIComponent(name);
            value = encodeURIComponent(value);
            pairs.push(name + '=' + value);
        };
        return pairs.join("&");
    }
}
    
/*---------------------------------工具函数结束--------------------------------------------*/
    
/*---------------------------------模块函数开始--------------------------------------------*/

/*分页模块，参考妙味课堂分页的写法*/
function page(opt){
    if(!opt.id){
        return false;
    };
    var obj = opt.id;
    var nowNum = opt.nowNum || 1;
    var childLength = opt.childLength;
    var allNum = opt.allNum || childLength;
    var callback = opt.callback || function(){};
    // 可显示页数二分之一+1的位置
    var point = Math.floor(childLength/2) + 1;
    
    //当前页不等于1时上一页可选
    var oA = document.createElement('a');    
    oA.innerText = '上一页';
    oA.setAttribute('index',nowNum - 1);
    if(nowNum != 1){
        oA.className = 'prv';
    }
    else{
        oA.className = 'prv f-dis';
    }    
    obj.appendChild(oA);
    
    //生成具体页数，总页数小于等于可显示页数的情况
    if(allNum <= childLength){
        for(var i=1; i <= allNum; i++){ 
            var oA = document.createElement('a');
            oA.setAttribute('index',i);
            oA.className = 'pg';
            oA.innerText = i;
            if(nowNum == i){
                addClass(oA,'selected');
            }
            obj.appendChild(oA);
        }
    }
    //生成具体页数，总页数大于可显示页数的情况
    else{
        for(var i=1; i <= childLength; i++){
            //当前页是小于一半+1的可显示页数
            if(nowNum < point){
                var oA = document.createElement('a');
                oA.setAttribute('index',i);
                oA.className = 'pg';
                oA.innerText = i;
                if(nowNum == i){
                    addClass(oA,'selected');
                }
            }
            //当前页是倒数第1或倒数第2
            else if(allNum - nowNum <= point){
                var oA = document.createElement('a');
                oA.setAttribute('index',allNum - childLength +i);
                oA.className = 'pg';
                oA.innerText = allNum - childLength +i;
                if(nowNum == allNum - childLength +i){
                    addClass(oA,'selected');
                }
            }
            //当前页在可显示页数一半+1的位置显示，例如可以显示8页，当前页就在第5个位置
            else{
                var oA = document.createElement('a');
                oA.setAttribute('index',nowNum - point + i);
                oA.className = 'pg';
                oA.innerText = nowNum - point + i;
                if(i == point){
                    addClass(oA,'selected');
                }
            }            
            obj.appendChild(oA);
        }
    }
    //当前页不是最后一页时显示下一页
    var oA = document.createElement('a');    
    oA.innerText = '下一页';    
    oA.setAttribute('index',nowNum + 1);
    if(allNum != nowNum){
        oA.className = 'nxt';
    }
    else{
        oA.className = 'nxt f-dis';
    }
    obj.appendChild(oA);
    
    //用addevent会重复注册
    var aA = obj.getElementsByTagName('a');
    for(var i=0;i<aA.length;i++){
        aA[i].onclick=function(){
            if(nowNum != parseInt(this.getAttribute('index'))){
                var nowNum = parseInt(this.getAttribute('index'));
                obj.innerHTML = '';
                page({
                    id:opt.id,
                    nowNum:nowNum,
                    allNum:allNum,
                    childLength:childLength,
                    callback:callback
                });
                callback(nowNum,allNum);
            }            
            return false;
        }
    }
    
}

/*---------------------------------模块函数结束--------------------------------------------*/
    
/*---------------------------------应用函数开始--------------------------------------------*/    

var url = "http://study.163.com/webDev/couresByCategory.htm";
var pageSize = 8;
var pageType = 10;

var mnav = document.querySelector('.m-nav');
var mnavTag = mnav.getElementsByTagName('a');
var mpager = document.querySelector('.m-pager');

delegateEvent(mnav,'a','click',
    function(target,event){
        if(pageType != target.getAttribute('data')){
            for(i=0;i<mnavTag.length;i++){
                removeClass(mnavTag[i],'selected');        
            }
            addClass(target,'selected');
            pageType = target.getAttribute('data');
            mpager.innerHTML = '';
            getPageNum(1);
        }
        event.preventDefault();
    }
);

//获取分页器总页数以及课程列表第一页
function getPageNum(now){    
    var options = {pageNo:now,psize:pageSize,type:pageType};
    get(url,options,function(response){
            initPager(response,now);
        }
    );    
}
//初始化分页和课程列表
function initPager(response,now){
    var res = JSON.parse(response);
    var option = {id:mpager,nowNum:now,allNum:res.totalPage,childLength:8,callback:getCourse};
    //初始化课程列表
    drawCourse(response);
    //初始化分页
    page(option);
}
//获取课程列表
function getCourse(now,all){
    console.log(now);
    
    var options = {pageNo:now,psize:pageSize,type:pageType};
    get(url,options,drawCourse);
}
//生成课程列表
function drawCourse(response){
    var data = JSON.parse(response);
    console.log(data.pagination.pageIndex);
    
    var boo = document.querySelectorAll('.u-cover');
    for(var i=boo.length-1;i>0;i--){
        boo[i].parentNode.removeChild(boo[i]);
    }
    
    var templete = document.querySelector('.m-data-lists .f-templete');
        
    for(var i=0,list=data.list;i<list.length;i++){       
        var cloned = templete.cloneNode(true);
        removeClass(cloned,'f-templete');
        var imgpic = cloned.querySelector('.imgpic');
        var title = cloned.querySelector('.tt');
        var orgname = cloned.querySelector('.orgname');
        var pri = cloned.querySelector('.pri');
        
        imgpic.src = list[i].middlePhotoUrl;
        imgpic.alt = list[i].name;
        title.innerText = list[i].name;
        orgname.innerText = list[i].provider;
        pri.innerText = '￥' + list[i].price + '.00';        
        templete.parentNode.appendChild(cloned);
    }
}

getPageNum(1);    
    
//})();
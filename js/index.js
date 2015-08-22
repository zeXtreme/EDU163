//(function(){

/*---------------------------------工具函数开始---------------------------------------------*/

//innerText的FF兼容
if (!('innerText' in document.body)) {
  HTMLElement.prototype.__defineGetter__('innerText', function(){
    return this.textContent;
  });
  HTMLElement.prototype.__defineSetter__('innerText', function(s) {
    return this.textContent = s;
  });
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

/*获取cookie*/
function getCookie() {
    var cookie = {};
    var all = document.cookie;
    if (all === '') return cookie;
    var list = all.split('; ');
    for (var i = 0, len = list.length; i < len; i++) {
        var item = list[i];
        var p = item.indexOf('=');
        var name = item.substring(0, p);
        name = decodeURIComponent(name);
        var value = item.substring(p + 1);
        value = decodeURIComponent(value);
        cookie[name] = value;
    }
    return cookie;
}

/*设置cookie*/
function setCookie(name, value, expires, path, domain, secure) {
    var cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);
    if (expires)
        cookie += '; expires=' + expires.toGMTString();
    if (path)
        cookie += '; path=' + path;
    if (domain)
        cookie += '; domain=' + domain;
    if (secure)
        cookie += '; secure=' + secure;
    document.cookie = cookie;
}

/*删除cookie*/
function removeCookie(name, path, domain) {
    console.log('name=' + name + '; path=' + path + '; domain=' + domain + '; max-age=0');
    document.cookie = 'name=' + name + '; path=' + path + '; domain=' + domain + '; max-age=0';
}

/*分页模块，参考妙味课堂分页的写法，有点累赘，准备重构*/
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

/*小黄条模块*/
var tips_module = (function(){

    var tips = document.querySelector('.m-tips');
    var closeTip = document.querySelector('.u-notips');

    var cookie = getCookie();

    if (!cookie.noTips) {
        tips.style.display = 'block';
    };

    addClickEvent(closeTip,function(event){
        setCookie('noTips',1,new Date(9999,9));
        tips.style.marginTop = '-36px';
    });

})();

/*关注和登录模块*/
var follow_module = (function(){

    var follow = document.querySelector('.follow');
    var closeTip = document.querySelector('.u-notips');
    var loginMask = document.querySelector('.m-mask');

    // 登录模块
    var login_module = (function(){

        var form = document.forms.loginForm;
        var itmAccount = document.querySelector('.itm1');
        var itmPassword = document.querySelector('.itm2');
    
        function disableSubmit(disabled){
            form.loginBtn.disabled = !!disabled;
            var method = !disabled?'remove':'add';
            form.loginBtn.classList[method]('j-disabled');
        }
    
        function invalidInput(node,msg){
            node.classList.add('j-error');
        }
    
        function clearInvalid(node){
            node.classList.remove('j-error');
        }
    
        form.addEventListener(
            'input',function(event){
                var target = event.target;
                var parentTarget = target.parentNode;
                var lab = parentTarget.querySelector('.lab');
                lab.style.display = 'none';
                // 还原错误状态
                clearInvalid(event.target.parentNode);
                // 还原登录按钮状态
                disableSubmit(false);
            }
        );

        function blurHandler(event){
            var target = event.target;
            var parentTarget = target.parentNode;
            var lab = parentTarget.querySelector('.lab');
            if (target.value == ''){
                lab.style.display = 'block';
            }
        }

        form.account.addEventListener('blur',blurHandler);

        form.password.addEventListener('blur',blurHandler);
    
        form.addEventListener(
            'submit',function(event){
                // 密码验证
                var input = form.password,
                    pswd = input.value,
                    account = form.account.value;

                if (account == ''){
                    // event.preventDefault();
                    invalidInput(itmAccount);
                    return;
                }else if(pswd == ''){
                    // event.preventDefault();
                    invalidInput(itmPassword);
                    return;
                }

                var options = {userName:md5(account),password:md5(pswd)};
                var url = 'http://study.163.com/webDev/login.htm';
                console.log(options);
                function fu(response){
                    // 还原登录按钮状态
                    disableSubmit(false);
                    if (response == 1) {
                        loginMask.style.display = 'none';
                        setCookie('loginSuc',1,new Date(9999,9));
                        followAPI();
                    }
                    else{
                        alert('账号密码错误');
                    }
                }
                get(url,options,fu);

                event.preventDefault();
                // 禁用提交按钮
                disableSubmit(true);
            }
        );
        
    })();    

    // followAPI
    function followAPI(){
        var url = 'http://study.163.com/webDev/attention.htm';
        get(url,null,function(response){
            if (response == 1) {
                setCookie('followSuc',1,new Date(9999,9));
                // 重新设置关注按钮
                setFollowbtn();
            };
        })
    }

    function setFollowbtn(){
        var cookie = getCookie();
        var followBtn = document.querySelector('.follow');
        var followedBtn = document.querySelector('.followed');
        if (cookie.followSuc == 1) {
            followBtn.style.display = 'none';
            followedBtn.style.display = 'block';
        }
        else{
            followBtn.style.display = 'block';
            followedBtn.style.display = 'none';
        }
    }

    addClickEvent(follow,function(event){
        var cookie = getCookie();
        if (!cookie.loginSuc) {
            loginMask.style.display = 'block';
        }
        else{
            followAPI();
        }
        event.preventDefault();
    });

    setFollowbtn();

})();


/*课程列表及分页模块*/
var course_module = (function(){

    var url = "http://study.163.com/webDev/couresByCategory.htm";
    var pageSize = 20;
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
        console.log('分页器：'+now);
        
        var options = {pageNo:now,psize:pageSize,type:pageType};
        get(url,options,drawCourse);
    }
    //生成课程列表
    function drawCourse(response){
        var data = JSON.parse(response);
        console.log('获取的页码：'+data.pagination.pageIndex);
        
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

})();

//})();
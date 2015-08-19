function addEvent(element, event, listener) {
    if (!!element.addEventListener){
        element.addEventListener(event,listener,!1);
    }else{
        element.attachEvent('on'+event,listener);
    }
}

function addClickEvent(element, listener) {
    addEvent(element,"click",listener);
}


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

function removeCookie(name, path, domain) {
  document.cookie = 'name=' + name + '; path=' + path + '; domain=' + domain + '; max-age=0';
}

function noTips(){
  var cookie = getCookie();
  if (!cookie[notips]) {
    tips.style.display = 'show';
  };
}

addClickEvent(notips,function(event){
    setCookie('notips',true,time);
});

addClickEvent(follow,function(event){
  var cookie = getCookie();
  if (!cookie[logined]) {
    login.style.display = 'show';
  }
  else{
    followsucess = get(followAPI);
    if (followsucess) {
      setCookie('followSuc',true,time);
    };
  }
});


var SPEED = 500;//入场持续时间
var STEP = 10;//步长的时间，一帧多长时间
var NUMBER = 3;//图片数量
var DURATION = 5000;//单张图片停留时间
var PREV = 0;//上一张图片索引
var CURRENT = 0;//当前图片索引
var NEXT = CURRENT + 1;//下一张图片的索引


//位移动画
var animation = (function(){
  var intervalId;
  return function (ele, from, to, callback) {
    var distance = Math.abs(to - from);
    var cover = 0;
    var symbol = (to - from)/distance;//正值负值标识符
    var stepLength = ((distance*STEP)/SPEED).toFixed(2);//SPEED除以STEP等于多少步，distance除以多少步等于一步的步长
    var step = function () {
        var des = cover + stepLength;
        if (des < distance) {
            cover += stepLength;
            ele.style.opacity += stepLength*symbol;
        } else {
            intervalId = clearInterval(intervalId);
            ele.style.left = to;
            if (callback)
                callback();
        }
    }
    if (!!intervalId){
      intervalId = clearInterval(intervalId);
    }
    intervalId = setInterval(step, STEP);
  }
})();
window.addEventListener('load',function(){
 var root=document.getElementById('list');
 var elem=document.createElement('div');
 elem.className='loading';
 elem.appendChild(document.createTextNode('loading...'));
 root.appendChild(elem);
 var max=256;
 new Promise(function(resolve,reject){
  max*=max;
  browser.history.search({'text':'','startTime':new Date('2000-01-01'),'maxResults':max}).then((res)=>{
   if(res.length<max || max>1e9)resolve(res);
   else arguments.callee(resolve,reject);
  });
 }).then(function(logs){
  var dates=new Array();
  while(root.firstChild)root.removeChild(root.firstChild);
  logs.forEach((log)=>{
   if(!log.url.match(new RegExp('^(?:https?|file)://([^/]+)/(.*)')))return;
   var logdate=Math.floor(log.lastVisitTime/86400000);
   var nowdate=Math.floor(Date.now()/86400000);
   var logd=new Date(log.lastVisitTime);
   var nowd=new Date();
   var inc=new Array();
   if(logdate+1>nowdate){inc[0]=true;}
   if(logdate+2>nowdate){inc[1]=true;}
   if(logdate+7>nowdate){inc[2]=true;}
   inc[nowd.getMonth()+nowd.getFullYear()*12-logd.getMonth()-logd.getFullYear()*12+3]=true;
   for(var i=0;i<inc.length;i++){
    if(!inc[i])continue;
    if(!dates[i])dates[i]=new Object();
    if(!dates[i][RegExp.$1])dates[i][RegExp.$1]=new Object();
    dates[i][RegExp.$1][RegExp.$2]=log;
   }
  });
  dates.forEach((domains,i)=>{
   if(!domains)return;
   elem=document.createElement('h2');
   var label=['今日','昨日','今週','今月'];
   var mon=Math.floor((new Date()).getMonth()+15-i)%12+1;
   elem.appendChild(document.createTextNode(i<label.length?label[i]:mon+'月'));
   root.appendChild(elem);
   var epck=document.createElement('div');
   root.appendChild(epck);
   epck.className='hosts';
   epck.style.display='none';
   elem.addEventListener('click',function(e){
    var elem=this.nextSibling;
    elem.style.display=elem.style.display=='none'?'':'none';
   },false);
   Object.keys(domains).sort().forEach((domain)=>{
    elem=document.createElement('h3');
    elem.appendChild(document.createTextNode(domain));
    epck.appendChild(elem);
    var ebox=document.createElement('div');
    epck.appendChild(ebox);
    ebox.className='urls';
    ebox.style.display='none';
    elem.addEventListener('click',function(e){
     var elem=this.nextSibling;
     elem.style.display=elem.style.display=='none'?'':'none';
    },false);
    Object.keys(domains[domain]).sort().forEach((path)=>{
     var elem=document.createElement('a');
     var title=domains[domain][path].title;
     if(!title)title=domains[domain][path].url;
     elem.appendChild(document.createTextNode(title));
     elem.setAttribute('href',domains[domain][path].url);
     elem.setAttribute('target','_blank');
     elem.setAttribute('title',title+'\n'+domains[domain][path].url);
     ebox.appendChild(elem);
    });
   });
  });
  var focused=undefined;
  window.addEventListener('click',(e)=>{
   if(e.target.nodeName.toLowerCase()=='body' || e.target.nodeName.toLowerCase()=='html')return;
   if(focused)focused.className=focused.className.replace(/ ?focus/,'');
   e.target.className=e.target.className?e.target.className+' focus':'focus';
   focused=e.target;
  },false);
  window.addEventListener('keydown',(e)=>{
   if(e.code=='ArrowUp' || e.code=='ArrowDown'){
    if(!document.getElementsByTagName('h2').length)return;
    e.preventDefault();
    var el,es,box,dir;
    if(!focused){
     if(e.code=='ArrowUp'){
      el=document.getElementById('list').lastChild;
      while(el && el.lastChild.nodeName!='#text'){
       el=el.lastChild;
       if(el.lastChild.style.display=='none')break;
      }
      if(el.style.display=='none')el=el.previousSibling;
     }else{
      el=document.getElementsByTagName('h2')[0];
     }
    }else{
     if(e.code=='ArrowUp'){
      var el=focused.previousSibling;
      if(el){
       while(el.nodeName.toLowerCase()=='div' && el.style.display!='none')el=el.lastChild;
       if(el.style.display=='none')el=el.previousSibling;
      }else{
       if(focused.nodeName.toLowerCase()!='h2')el=focused.parentNode.previousSibling;
      }
     }else{
      var el=focused.nextSibling;
      if(el && el.style.display=='none')el=el.nextSibling;
      if(el){
       if(el.style.display=='none')el=el.nextSibling;
       else if(el.nodeName.toLowerCase()=='div')el=el.firstChild;
      }else{
       el=focused.parentNode;
       while(!el.nextSibling)el=el.parentNode;
       el=el.nextSibling;
       if(el.style.display=='none')el=el.nextSibling;
      }
     }
    }
    if(!el)return;
    if(focused)focused.className=focused.className.replace(/ ?focus/,'');
    el.className=el.className?el.className+' focus':'focus';
    focused=el;
    focused.focus();
    box=el.getBoundingClientRect();
    if(box.top+el.clientHeight>document.documentElement.clientHeight){
     window.scrollTo(window.scrollX,window.scrollY+box.top-document.documentElement.clientHeight+el.clientHeight);
    }else if(box.top<0){
     window.scrollTo(window.scrollX,window.scrollY+box.top);
    }
   }else if(e.code=='ArrowLeft'){
    if(!focused){
     window.dispatchEvent(new KeyboardEvent('keydown',{code:'ArrowDown'}));
     return;
    }
    if(focused.nodeName.toLowerCase()!='a' && focused.nextSibling.style.display!='none')focused.nextSibling.style.display='none';
    else if(focused.nodeName.toLowerCase()=='h2')return;
    else{
     focused.className=focused.className.replace(/ ?focus/,'');
     focused=focused.parentNode.previousSibling;
     focused.className+=focused.className?focused.className+' focus':'focus';
    }
    focused.focus();
    e.preventDefault();
   }else if(e.code=='ArrowRight' || e.code=='Enter'){
    if(!focused){
     if(!document.getElementsByTagName('h2').length)return;
     focused=document.getElementsByTagName('h2')[0];
     return;
    }
    if(focused.nodeName.toLowerCase()=='a'){
     if(e.code=='Enter')focused.click();
     e.preventDefault();
     return;
    }
    if(focused.nextSibling.style.display=='none')focused.nextSibling.style.display='';
    else window.dispatchEvent(new KeyboardEvent('keydown',{code:'ArrowDown'}));
    focused.focus();
    e.preventDefault();
   }
  },false);
 });
},false);

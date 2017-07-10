window.addEventListener('load',function(){
 var root=document.getElementById('list');
 var domains=new Object();
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
  for(i=0;i<dates.length;i++){
   for(domain in dates[i]){
    if(!domains[domain])domains[domain]=new Array();
    domains[domain]=domains[domain].concat(dates[i][domain]);
   }
  }
  Object.keys(domains).sort().forEach((domain)=>{
   var elem=document.createElement('h2');
   elem.appendChild(document.createTextNode(domain));
   root.appendChild(elem);
   var ebox=document.createElement('div');
   root.appendChild(ebox);
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
},false);

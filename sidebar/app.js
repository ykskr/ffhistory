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
  while(root.firstChild)root.removeChild(root.firstChild);
  logs.forEach((log)=>{
   if(!log.url.match(new RegExp('^(?:https?|file)://([^/]+)/(.*)')))return;
   if(!domains[RegExp.$1])domains[RegExp.$1]=new Object();
   domains[RegExp.$1][RegExp.$2]=log;
  });
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

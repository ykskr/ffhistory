window.addEventListener('load',function(){
 var root=document.getElementById('list');
 while(root.firstChild)root.removeChild(root.firstChild);
 var domains=new Object();
 browser.history.search({'text':''}).then((logs)=>{
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
   Object.keys(domains[domain]).sort().forEach((path)=>{
    var elem=document.createElement('a');
    elem.appendChild(document.createTextNode(domains[domain][path].title));
    elem.setAttribute('href',domains[domain][path].url);
    elem.setAttribute('target','_blank');
    elem.setAttribute('title',domains[domain][path].title+'\n'+domains[domain][path].url);
    root.appendChild(elem);
   });
  });
 });
},false);

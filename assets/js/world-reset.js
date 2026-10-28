(function(){
  // The reset card: the night world loses its lights east to west, then the
  // eight committee cities come back on in their own colours. home.js toggles
  // body.in-blackout; everything here is CSS driven from that class.
  var veil=document.getElementById('impactVeil');if(!veil)return;
  var cities=[
    ['UNHRC','Geneva',46.2044,6.1432,'#73a9ff'],
    ['MCC','New York',40.7128,-74.006,'#a48cff'],
    ['CCEP','Singapore',1.3521,103.8198,'#3be1c2'],
    ['IPL','Bengaluru',12.9716,77.5946,'#ffca4b'],
    ['AIPPM','New Delhi',28.6139,77.209,'#ff8c4b'],
    ['DALAL','Mumbai',19.076,72.8777,'#65e778'],
    ['STARTUP','San Francisco',37.7749,-122.4194,'#ff5d78'],
    ['IP','London',51.5074,-.1278,'#f0e9db']
  ];
  var world=document.createElement('div');world.className='reset-world';world.setAttribute('aria-hidden','true');
  world.innerHTML='<div class="rw-ghost"></div><div class="rw-earth"></div><div class="rw-cities"></div>';
  var list=world.querySelector('.rw-cities');
  // Light the cities west to east so the relight sweeps back the way the dark came.
  cities.slice().sort(function(a,b){return a[3]-b[3];}).forEach(function(c,i){
    var el=document.createElement('span');el.className='rw-city';
    el.style.left=((c[3]+180)/360*100)+'%';el.style.top=((90-c[2])/180*100)+'%';
    el.style.setProperty('--c',c[4]);el.style.setProperty('--i',i);
    el.innerHTML='<i></i><b>'+c[0]+'</b>';
    list.appendChild(el);
  });
  veil.insertBefore(world,veil.firstChild);
  var caption=document.createElement('small');caption.className='rw-caption';caption.textContent='Eight rooms. One new order.';
  veil.appendChild(caption);
})();

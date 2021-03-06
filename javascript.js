var confetti = {
	maxCount: 150, //set max confetti count
	speed: 5, //set the particle animation speed
	frameInterval: 15, //the confetti animation frame interval in milliseconds
	alpha: 1.0, //the alpha opacity of the confetti (between 0 and 1, where 1 is opaque and 0 is invisible)
	gradient: false, //whether to use gradients for the confetti particles
	start: null, //call to start confetti animation (with optional timeout in milliseconds, and optional min and max random confetti count)
	stop: null, //call to stop adding confetti
	toggle: null, //call to start or stop the confetti animation depending on whether it's already running
	pause: null, //call to freeze confetti animation
	resume: null, //call to unfreeze confetti animation
	togglePause: null, //call to toggle whether the confetti animation is paused
	remove: null, //call to stop the confetti animation and remove all confetti immediately
	isPaused: null, //call and returns true or false depending on whether the confetti animation is paused
	isRunning: null, //call and returns true or false depending on whether the animation is running
  };
  
  confetti.start = startConfetti;
  confetti.stop = stopConfetti;
  confetti.toggle = toggleConfetti;
  confetti.pause = pauseConfetti;
  confetti.resume = resumeConfetti;
  confetti.togglePause = toggleConfettiPause;
  confetti.isPaused = isConfettiPaused;
  confetti.remove = removeConfetti;
  confetti.isRunning = isConfettiRunning;
  var supportsAnimationFrame =
	window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.oRequestAnimationFrame ||
	window.msRequestAnimationFrame;
  var colorss = [
	'rgba(30,144,255,',
	'rgba(107,142,35,',
	'rgba(255,215,0,',
	'rgba(255,192,203,',
	'rgba(106,90,205,',
	'rgba(173,216,230,',
	'rgba(238,130,238,',
	'rgba(152,251,152,',
	'rgba(70,130,180,',
	'rgba(244,164,96,',
	'rgba(210,105,30,',
	'rgba(220,20,60,',
  ];
  var streamingConfetti = false;
  var animationTimer = null;
  var pause = false;
  var lastFrameTime = Date.now();
  var particles = [];
  var waveAngle = 0;
  var context = null;
  
  function resetParticle(particle, width, height) {
	particle.color =
	  colorss[(Math.random() * colorss.length) | 0] + (confetti.alpha + ')');
	particle.color2 =
	  colorss[(Math.random() * colorss.length) | 0] + (confetti.alpha + ')');
	particle.x = Math.random() * width;
	particle.y = Math.random() * height - height;
	particle.diameter = Math.random() * 10 + 5;
	particle.tilt = Math.random() * 10 - 10;
	particle.tiltAngleIncrement = Math.random() * 0.07 + 0.05;
	particle.tiltAngle = Math.random() * Math.PI;
	return particle;
  }
  
  function toggleConfettiPause() {
	if (pause) resumeConfetti();
	else pauseConfetti();
  }
  
  function isConfettiPaused() {
	return pause;
  }
  
  function pauseConfetti() {
	pause = true;
  }
  
  function resumeConfetti() {
	pause = false;
	runAnimation();
  }
  
  function runAnimation() {
	if (pause) return;
	else if (particles.length === 0) {
	  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
	  animationTimer = null;
	} else {
	  var now = Date.now();
	  var delta = now - lastFrameTime;
	  if (!supportsAnimationFrame || delta > confetti.frameInterval) {
		context.clearRect(0, 0, window.innerWidth, window.innerHeight);
		updateParticles();
		drawParticles(context);
		lastFrameTime = now - (delta % confetti.frameInterval);
	  }
	  animationTimer = requestAnimationFrame(runAnimation);
	}
  }
  
  function startConfetti(timeout, min, max) {
	var width = window.innerWidth;
	var height = window.innerHeight;
	window.requestAnimationFrame = (function () {
	  return (
		window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function (callback) {
		  return window.setTimeout(callback, confetti.frameInterval);
		}
	  );
	})();
	var canvas = document.getElementById('confetti-canvas');
	if (canvas === null) {
	  canvas = document.createElement('canvas');
	  canvas.setAttribute('id', 'confetti-canvas');
	  canvas.setAttribute(
		'style',
		'display:block;z-index:999999;pointer-events:none;position:fixed;top:0'
	  );
	  document.body.prepend(canvas);
	  canvas.width = width;
	  canvas.height = height;
	  window.addEventListener(
		'resize',
		function () {
		  canvas.width = window.innerWidth;
		  canvas.height = window.innerHeight;
		},
		true
	  );
	  context = canvas.getContext('2d');
	} else if (context === null) context = canvas.getContext('2d');
	var count = confetti.maxCount;
	if (min) {
	  if (max) {
		if (min == max) count = particles.length + max;
		else {
		  if (min > max) {
			var temp = min;
			min = max;
			max = temp;
		  }
		  count = particles.length + ((Math.random() * (max - min) + min) | 0);
		}
	  } else count = particles.length + min;
	} else if (max) count = particles.length + max;
	while (particles.length < count)
	  particles.push(resetParticle({}, width, height));
	streamingConfetti = true;
	pause = false;
	runAnimation();
	if (timeout) {
	  window.setTimeout(stopConfetti, timeout);
	}
  }
  
  function stopConfetti() {
	streamingConfetti = false;
  }
  
  function removeConfetti() {
	stop();
	pause = false;
	particles = [];
  }
  
  function toggleConfetti() {
	if (streamingConfetti) stopConfetti();
	else startConfetti();
  }
  
  function isConfettiRunning() {
	return streamingConfetti;
  }
  
  function drawParticles(context) {
	var particle;
	var x, y, x2, y2;
	for (var i = 0; i < particles.length; i++) {
	  particle = particles[i];
	  context.beginPath();
	  context.lineWidth = particle.diameter;
	  x2 = particle.x + particle.tilt;
	  x = x2 + particle.diameter / 2;
	  y2 = particle.y + particle.tilt + particle.diameter / 2;
	  if (confetti.gradient) {
		var gradient = context.createLinearGradient(x, particle.y, x2, y2);
		gradient.addColorStop('0', particle.color);
		gradient.addColorStop('1.0', particle.color2);
		context.strokeStyle = gradient;
	  } else context.strokeStyle = particle.color;
	  context.moveTo(x, particle.y);
	  context.lineTo(x2, y2);
	  context.stroke();
	}
  }
  
  function updateParticles() {
	var width = window.innerWidth;
	var height = window.innerHeight;
	var particle;
	waveAngle += 0.01;
	for (var i = 0; i < particles.length; i++) {
	  particle = particles[i];
	  if (!streamingConfetti && particle.y < -15) particle.y = height + 100;
	  else {
		particle.tiltAngle += particle.tiltAngleIncrement;
		particle.x += Math.sin(waveAngle) - 0.5;
		particle.y +=
		  (Math.cos(waveAngle) + particle.diameter + confetti.speed) * 0.5;
		particle.tilt = Math.sin(particle.tiltAngle) * 15;
	  }
	  if (particle.x > width + 20 || particle.x < -20 || particle.y > height) {
		if (streamingConfetti && particles.length <= confetti.maxCount)
		  resetParticle(particle, width, height);
		else {
		  particles.splice(i, 1);
		  i--;
		}
	  }
	}
  }



let refresh = document.querySelector('#refresh');
let persons = document.querySelectorAll('.person__choice i');
let computers = document.querySelectorAll('.computer__choice i');
let color_person = document.querySelector('#color_person');
let color_computer = document.querySelector('#color_computer');
let name_person_choice = document.querySelector('#name_person_choice');
let name_computer_choice = document.querySelector('#name_computer_choice');
let person_score = document.querySelector('#person_score');
let computer_score = document.querySelector('#computer_score');
let result = document.querySelector('#result');
let person__choice = document.querySelector('#person__choice');
let computer__choice = document.querySelector('#computer__choice');
let audio_win = document.querySelector('#audio_win');
let audio_loss = document.querySelector('#audio_loss');
let audio_even = document.querySelector('#audio_even');

let ScoreUser = 0, ScoreComputer = 0;
const colors = [
    "#00aefd","#ffa400","#07a787", "black", "red","#2979ff", ];
const loss = [
    "G?? qu??", "D??? win th??? m?? c??ng kh??ng win ???????c", "HaHa win ????u d???", "Ngon th?? win ??i ????u d???", "Win h??? c??i", "Ng???c ?????p trai", "V??o kiemthecao.com l???y h??n ??i"];
const wins = [
    "G?? qu?? m??i m???i win", "H??n th??i b???n ??i", "Win ???????c v??n ch??? m???y", "Ngon th?? win ti???p ??i", "Wow. Th??ng minh ?????y"];
// Remove Active
function removeActive()
{
    persons.forEach(person => {
        person.classList.remove('active');
    });
    computers.forEach(computer => {
        computer.classList.remove('active');
    });
}

// Refresh All
function clearActive() {
    removeActive();
    removeConfetti();
    color_person.setAttribute('style', 'display:none');
    color_computer.setAttribute('style', 'display:none');
    name_person_choice.setAttribute('style', 'display:none');
    name_computer_choice.setAttribute('style', 'display:none');
    ScoreUser = 0; ScoreComputer = 0;
    person_score.innerHTML = '0';
    computer_score.innerHTML = '0';
    result.innerHTML = "Thua nhi???u qu?? xong x??a d??? li???u ??!"
    setTimeout(() =>{
        result.innerHTML = "B???n ngh?? b???n c?? th??? th???ng t??i"
    },1000);
}
refresh.addEventListener('click', () =>{
    clearActive();
});

// Person Choose
persons.forEach(person =>{
    person.addEventListener('click', () =>{
        removeActive();
        person.classList.add('active');
        computerRandom();
        console.log(person.getAttribute('class'));
        const arr = [];
        checkWinLost(arr);
        console.log(arr);
        handleDisplay(arr);
        handleScore(arr);
    })
})

// Computer Random Active
function computerRandom() {
    computers[Math.floor(Math.random()* computers.length)].classList.add('active');
}

// Check Win or Loss
function checkWinLost(arr)
{
    persons.forEach(person => {
        if(person.classList.contains('active'))
            arr.push(person.getAttribute('data-item'));
    });
    computers.forEach(computer => {
        if(computer.classList.contains('active'))
            arr.push(computer.getAttribute('data-item'));
    });
}

// X??? l?? ??i???m
function handleScore(arr)
{
    let win = '';
    if(arr[0] === 'bua')
    {
        if(arr[1] === 'bua')
            win = 'even';
        else if(arr[1] === 'keo_2' || arr[1] === 'keo_1') win = 'win';
        else win = 'lost';
    }
    else if(arr[0] === 'la_5')
    {   if(arr[1] === 'la_5')
            win = 'even';
        else if(arr[1] === 'bua' || arr[1] === 'la_4') win = 'win';
        else win = 'lost';
    }
    else if(arr[0] === 'keo_2')
    {   if(arr[1] === 'la_5')
            win = 'even';
        else if(arr[1] === 'keo_1' || arr[1] === 'la_5') win = 'win';
        else win = 'lost';
    }
    else if(arr[0] === 'keo_2')
    {   if(arr[1] === 'keo_2')
             win = 'even';
        else if(arr[1] === 'keo_1' || arr[1] === 'la_5') win = 'win';
        else win = 'lost';
    }
    else if(arr[0] === 'keo_1')
    {   if(arr[1] === 'keo_1')
            win = 'even';
        else if(arr[1] === 'la_4' || arr[1] === 'la_5') win = 'win';
        else win = 'lost';
    }
    else if(arr[0] === 'la_4')
    {   
        if(arr[1] === 'la_4')
            win = 'even';
        else if(arr[1] === 'bua' || arr[1] === 'keo_2') win = 'win';
        else win = 'lost';
    }
    result.setAttribute('style', `color : ${colors[Math.floor(Math.random() * colors.length)]}`);
    if(win === 'win')
    {   
        startConfetti();
		RemoveAudio();
		audio_win.play();
        result.innerHTML = `${wins[Math.floor(Math.random() * wins.length)]}`;
        ScoreUser++;
    }
    else if(win === 'lost')
    {
        stopConfetti();
		RemoveAudio();
		audio_loss.play();
        result.innerHTML = `${loss[Math.floor(Math.random() * loss.length)]}`;
        ScoreComputer++;
    }
    else
	{
		result.innerHTML = "H??a th??i Win ????u d???";
		RemoveAudio();
		audio_even.play();
	}
       
    person_score.innerHTML = `${ScoreUser}`;
    computer_score.innerHTML = `${ScoreComputer}`;

}

// Remove Audio
function RemoveAudio()
{
	audio_win.currentTime = 0;
	audio_win.pause();
	audio_loss.currentTime = 0;
	audio_loss.pause();
	audio_even.currentTime = 0;
	audio_even.pause();
}


// X??? l?? hi???n th???
function handleDisplay(arr){
    color_person.setAttribute('style', 'display:block');
    color_computer.setAttribute('style', 'display:block');
    name_person_choice.setAttribute('style', 'display:block');
    name_computer_choice.setAttribute('style', 'display:block');
    const choose_one = person__choice.querySelector(`[data-item = ${arr[0]}]`).getAttribute('data-name');
    name_person_choice.innerHTML = `${choose_one}`;
    const choose_two = computer__choice.querySelector(`[data-item = ${arr[1]}]`).getAttribute('data-name');
    name_person_choice.innerHTML = `${choose_one}`;
    name_computer_choice.innerHTML = `${choose_two}`;
}

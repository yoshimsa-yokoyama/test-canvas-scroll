(function(){

	var canvas = document.getElementById('canvas'),
			ctx = canvas.getContext('2d');

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	ctx.fillStyle = 'rgb(255,255,255)';
	ctx.fillRect(0,0,200,200);

	var onWindowScroll = function(){
		window.console.log('window.innerWidth = ', window.innerWidth);
		window.console.log('window.innerHeight = ', window.innerHeight);
	};

	//add event listeners
	window.addEventListener('scroll', function(e){
		e.preventDefault();

		var posOrgY = (window.pageYOffset < 0) ? 0 : window.pageYOffset;

		window.console.log('posOrgY =' + posOrgY);

		ctx.fillStyle = 'rgb(' + (255 - posOrgY) + ',' + (255 - posOrgY) + ',' + (255 - posOrgY) + ')';

		ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
		ctx.fillRect(0,posOrgY + (posOrgY - posOrgY * 0.2),200 + posOrgY,200 + posOrgY);
	}, false, false);

}());
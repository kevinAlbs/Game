/*
Singleton class for managing enemies and enemy fire
*/
GM.enemyList = (function(){
	var that = {};
	var root = null;//since platforms only have the extra next/prev properties, I'm going to use Movable objects
	var rear = null;
	var cur = null;
	var fbRoot = null;

	that.addFireBall = function(x,y,xVel,yVel){
		var fb = new FireBall();
		fb.setX(x);
		fb.setY(y);
		fb.setXVel(xVel);
		fb.setYVel(yVel);
		fb.next = fbRoot;
		fbRoot = fb;
	};

	that.updateFireBalls = function(){
		var prev = null;
		var ptr = fbRoot;
		while(ptr != null){
			ptr.movementUpdate();
			if(!GM.main.inScreen(ptr)){
				if(prev == null){
					fbRoot = fbRoot.next;
					ptr = ptr.next;
				}
				else{
					prev.next = ptr.next;
					ptr = ptr.next;
				}
			}
			else{
				prev = ptr;
				ptr = ptr.next;
			}
		}
	}

	that.checkFireBallCollisions = function(m){
		for(var f = fbRoot; f != null; f = f.next){
			if(f.explodingOn(m)){
				f.explode();
			}
		}
	}

	that.paintFireBalls = function(ctx){
		for(var f = fbRoot; f != null; f = f.next){
			f.paint(ctx);
		}
	}
	that.getRoot = function(){
		return root;
	}
	/*
	From experimentation, seems like maximum y difference is 119 away (up) in exactly 11 frames (I think)
	The maximum x will depend on y. I will have to figure this out later.

	This will generate platforms on the end of the linked list
	*/
	that.generateEnemies = function(platform, difficulty){
		var pNode = platform;
		if(pNode == null){
			return;
		}
		if(root == null){
			root = new Centaur(pNode);
			root.next = null;
			root.prev = null;
			rear = root;
		}
		for(var p = pNode.next; p != null; p = p.next){
			var newObj = new Zombie(p);
			rear.next = newObj;
			newObj.prev = rear;
			newObj.next = null;
			rear = newObj;
		}
	};

	that.cleanUp = function(){
		//cleans up old platforms
		var prev = null;
		var ptr = root;
		while(ptr != null){
			if(ptr.getX() + ptr.getWidth() - GM.viewport.getXOffset() < 0){
				console.log("Removing enemy");
				//remove
				if(prev == null){
					root = ptr.next;
					if(ptr.next){
						ptr.next.prev = null;
					}
					ptr = ptr.next;
				}
				else{
					prev.next = ptr.next;
					if(ptr.next){
						ptr.next.prev = prev;
					}
					ptr = prev;
				}
			}
			else if(!ptr.isActivated()){
				break;//in order by x values, so break at point when no more are off screen
			}
			prev = ptr;
			if(ptr){
				ptr = ptr.next;
			}
		}
	};
	
	return that;
}());
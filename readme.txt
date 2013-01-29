Alaskan State Troopers - the Game

Based off of the hit National Geographic television show.

Designed and developed by:
Daniel Deutsch - ddeutsch
Tyler Healy - thealy
Michael Hankowsky - mhankows

Description:

You are a member of the elite Askan State Troopers, sworn to protect your
beautiful state. You must avoid the majestic wildlife and traffic while
making sure to arrest the swerving drunk drivers.

Use the WASD keys to move your police cruiser, while using your space bar
turn your lights on, receive a speed boost, and arrest the drunk drivers.

Difficulty can be changed from the Main Menu using the numerical keys 1, 2,
3, and 4. The change in difficulty affects the spawn rate of cars as well
as what kinds of cars appear during your stint as an Alaskan State Trooper.

Ideas from Week 1 used in this project:

- Javascript
	- console.log
		- Although there is no logging code left, this was used a lot during
		  debugging
	- Functions
		- All major functionality was split up into functions
	- Function callbacks
		- Every update of the interval, we call a function that determines the
		  necessary function to call based on the current state of the game
	- Arrays
		- The obstacles are stored dynamically in an array, which allows
		  us to perform functions on all of the objects at once
	- Multidimensional-Arrays
		- The allObstacle array is multidimensional, allowing store related
		  objects together
	- Predefined Methods
		- Numerous Math and Array methods were used throughout our code
	- Objects
		- Many major components of the game are objects we created, such as
		  Sprite, Score, RoadLines, etc.
		- Each of these objects had a constructor
		- Objects such as Score and RoadLines had methods written in the
		  constructor
- Canvas
	- Shapes
		- The fillRect was used to draw certain aspects of the game such
		  as the road and road lines.
	- Text
		- Canvas allows us to dynamically print the user's score during
		  the game.
	- Style
		- Style was used to alter the appearance of our canvas-drawn
		  objects and text
	- Images
		- We used numerous sprite images throughout the game, as well as
		  custom Main Menu and Instructions images.
	- Keyboard Events
		- The game is played entirely by using keys.
	- Timer Events
		- The entire game runs on a timer. It updates at 60 fps. This allows
		  us to animate sprites, change the background scrolling speed, etc.
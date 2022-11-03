$(document).ready(function() {
    //Create an array containing all image file names 
    var bgArray = ['arena1.png', 'arena2.png', 'arena3.png', 'arena4.png'];
    var bg = bgArray[Math.floor(Math.random() * bgArray.length)];
    //Create base path of where images are stored
    var path = '../resources/imgs/';
    var imageUrl = path + bg;
    $('body').css('background-image', 'url(' + imageUrl +')');
  });
var callback = function (results) {
  document.getElementById("client_editing").style.display = "none";
  const srcImage1 = new Image()
    // Do something with the image urls (found in results[0])
    var dict = {};
    for(var i = 0; i<results[0].length; i++){
        dict["url" + i] = results[0][i];
    }
    console.log(dict);



    document.getElementById("loader").style.display = "block"; 

    $.ajax({
        type: "POST",
        url: "http://127.0.0.1:8000/steganalysis/detect/",
        data: dict,
        success: function(msg){
          document.getElementById("loader").style.display = "none";
          console.log(msg);
          alert("Scraping Complete!");
          //alert(msg['Creation Time']);
          //alert(alert['Contrast']);
          //var exif = JSON.stringify(msg);
          document.getElementById("orignal_user_image").removeAttribute('src');
          document.getElementById("orignal_user_image").style.visibility = "hidden";
          document.getElementById("exif_data").innerHTML = '';
          document.getElementById("prediction").innerHTML = '';

          document.getElementById("images").innerHTML = '';

          
          //Dictionary Keys For Prediction Result
          //const keys1 = [];
          //for (var key in msg) {
            //if (msg.hasOwnProperty(key)) {
              //  //console.log(key+exif[key]);
                ////console.log(key);
                //var str1 = "pred";
                //var key1 = key.concat(str1);
                //keys1.push(key1);
            //}
          //}
          
          
          //Dictionary Keys
          const keys = [];
          for (var key in msg) {
            if (msg.hasOwnProperty(key)) {
                //console.log(key+exif[key]);
                //console.log(key);
                keys.push(key);
            }
          }

          //metadata keys
          const metadata_keys = [];
          for(var i = 0; i<keys.length; i=i+3) {
            metadata_keys.push(keys[i]);
          }

          //Prediction data keys
          const prediction_keys = [];
          for(var i = 1; i<keys.length; i=i+3) {
            prediction_keys.push(keys[i]);
          }

          //image keys
          const image_keys = [];
          for(var i = 2; i<keys.length; i=i+3) {
            image_keys.push(keys[i]);
          }
          
          for(var i = 0; i<results[0].length; i++){

            //dict["url" + i] = results[0][i];
            var img = document.createElement( 'img' );
            img.src = 'data:image/png;base64,'+msg[image_keys[i]];
            img.style.width = "60%";
            img.style.height = "50%";
            //img.setAttribute( 'src', results[0][i] );
            document.getElementById("images").appendChild( img );
            
            var text1 = document.createElement( 'p' );
            text1.style.fontWeight = "bold";
            text1.innerHTML = '<pre>' + JSON.stringify(msg[prediction_keys[i]], null, 2) + '</pre>';
            document.getElementById("images").appendChild( text1 );
            
            var text = document.createElement( 'p' );
            text.style.fontWeight = "bold";
            text.innerHTML = '<pre>' + JSON.stringify(msg[metadata_keys[i]], null, 2) + '</pre>';
            document.getElementById("images").appendChild( text );
            //text.innerHTML = '<pre>' + JSON.stringify(Object.values(msg), null, 2) + '</pre>';
          }
          
        },
        error: function(){
          console.log("Error Occured!");
        }
    });
    //$.post("http://127.0.0.1:8000/steganalysis/detect/",
    //{myJSON},
    //function(data,status){
      //alert("Success");
    //});
    
};
//WEB SCRAPE
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("scraper").addEventListener("click", handler);
  });

function handler() {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.executeScript(tabs[0].id, {
            code: 'Array.prototype.map.call(document.images, function (i) { return i.src; });'
        }, callback);
    });
  }

  
//USER IMAGES
document.addEventListener('change', (event) => {
  document.getElementById('file-selector');
  const fileList = event.target.files;
  console.log(fileList[0]);
  document.getElementById("client_editing").style.display = "block";
  //const fileinput = document.getElementById('fileinput')
  //const fileinput = document.getElementById('file-selector')

  // Used to show the effects of the image edit
  canvas = document.getElementById('canvas')

  // Get the 2d drawing context on the canvas
  ctx = canvas.getContext('2d')

  //Image load to canvas functions
  srcImage.src = URL.createObjectURL(fileList[0])

  srcImage.onload = function () {

    // copy the image's dimensions to the canvas
    canvas.width = srcImage.width
    canvas.height = srcImage.height

    // draw the image with same dimensions as the original
    ctx.drawImage(srcImage, 0, 0, srcImage.width, srcImage.height)

    // gets an ImageData object which represents the underlying pixel data for the area of the canvas
    imgData = ctx.getImageData(0, 0, srcImage.width, srcImage.height)

    // (.data) gets the array of integers with 0-255 range
    //(.slice) returns a copy of the array 
    originalPixels = imgData.data.slice()
  }


  document.getElementById("loader1").style.display = "block";
  var fd = new FormData();
  fd.append('image', fileList[0])
  $.ajax({
    type: "POST",
    url: "http://127.0.0.1:8000/steganalysis/detect/",
    data: fd,
    processData: false,
    contentType: false,
    success: function(msg){
        console.log(msg);
        document.getElementById("loader1").style.display = "none";

        // create an image
        var outputImg = document.getElementById('orignal_user_image');
        outputImg.src = 'data:image/png;base64,'+msg['user_image'];

        //alert(msg['Creation Time']);
        //alert(alert['Contrast']);
        //var exif = JSON.stringify(msg, null, 2);
        

        
        document.getElementById("images").innerHTML = '';
        document.getElementById("orignal_user_image").style.visibility = "visible";


        document.getElementById("exif_data").innerHTML = '<pre>' + JSON.stringify(msg['User Image'], null, 2) + '</pre>';
        document.getElementById("prediction").innerHTML = '<pre>' + JSON.stringify(msg['User Prediction'], null, 2) + '</pre>';
        alert("Complete!");

        //var reader = new FileReader();
        //reader.onload = function(){
          //var dataURL = reader.result;
          //var output = document.getElementById('orignal_user_image');
          //output.src = dataURL;
        //};
        //reader.readAsDataURL(fileList[0]);
        ////document.getElementById("test").src = data;
   },
   error: function(){
        console.log("Error Occured!");
   }
 });

  //var reader = new FileReader();
  //reader.onload = function(){
    //var hello = reader.result;
    //console.log(hello);
  //};
  //reader.readAsDataURL(event.target.files[0]);
});


// Editors for the USER image - Eventlisteners
  //const red = document.getElementById('red')
  document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("red").addEventListener("change", runPipeline);
  });
  //const green = document.getElementById('green')
  document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("green").addEventListener("change", runPipeline);
  });
  //const blue = document.getElementById('blue')
  document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("blue").addEventListener("change", runPipeline);
  });
  //const brightness = document.getElementById('brightness')
  document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("brightness").addEventListener("change", runPipeline);
  });
  //const grayscale = document.getElementById('grayscale')
  document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("grayscale").addEventListener("change", runPipeline);
  });
  //const contrast = document.getElementById('contrast')
  document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("contrast").addEventListener("change", runPipeline);
  });


// Initialize canvas and canvas context
let canvas = null
let ctx = null

//Setting up variables for edit

  // Creating background element. Not rendered to document
  const srcImage = new Image()

  let imgData = null
  let originalPixels = null
  let currentPixels = null

// Filter functions

  // Apply changes and display on canvas
  function commitChanges() {
    
    // Apply current pixel changes to the image
    for (let i = 0; i < imgData.data.length; i++) {
      imgData.data[i] = currentPixels[i]
    }

    // Updating the 2d rendering canvas with the image we just updated so it can be displayed
    ctx.putImageData(imgData, 0, 0, 0, 0, srcImage.width, srcImage.height)
  }
  
  // Updates the canvas with the all of the filter changes - Contains all processing
  function runPipeline() {

    // Create a copy of the array of integers with 0-255 range 
    currentPixels = originalPixels.slice()

    // Representing the intensity of the filter
    const brightnessFilter = Number(brightness.value)
    const contrastFilter = Number(contrast.value)
    const redFilter = Number(red.value)
    const greenFilter = Number(green.value)
    const blueFilter = Number(blue.value)

    // Check for gray scale
    const grayscaleFilter = grayscale.checked

    // For every pixel of the src image
    for (let i = 0; i < srcImage.height; i++) {
      for (let j = 0; j < srcImage.width; j++) {
        
        // Apply effect

        if (grayscaleFilter) {
          setGrayscale(j, i)
        }

        addBrightness(j, i, brightnessFilter)
        addContrast(j, i, contrastFilter)

        // Remove effect
        if (!grayscaleFilter) {
          addRed(j, i, redFilter)
          addGreen(j, i, greenFilter)
          addBlue(j, i, blueFilter)
        }
      }
    }

    commitChanges()
  }

  //Filter effects

  // The image is stored as a 1d array with red first, then green, and blue 
  const R_OFFSET = 0
  const G_OFFSET = 1
  const B_OFFSET = 2

  function addRed(x, y, value) {
    const index = getIndex(x, y) + R_OFFSET
    const currentValue = currentPixels[index]
    currentPixels[index] = clamp(currentValue + value)
  }

  function addGreen(x, y, value) {
    const index = getIndex(x, y) + G_OFFSET
    const currentValue = currentPixels[index]
    currentPixels[index] = clamp(currentValue + value)
  }

  function addBlue(x, y, value) {
    const index = getIndex(x, y) + B_OFFSET
    const currentValue = currentPixels[index]
    currentPixels[index] = clamp(currentValue + value)
  }

  function addBrightness(x, y, value) {
    addRed(x, y, value)
    addGreen(x, y, value)
    addBlue(x, y, value)
  }

  function setGrayscale(x, y) {
    const redIndex = getIndex(x, y) + R_OFFSET
    const greenIndex = getIndex(x, y) + G_OFFSET
    const blueIndex = getIndex(x, y) + B_OFFSET

    const redValue = currentPixels[redIndex]
    const greenValue = currentPixels[greenIndex]
    const blueValue = currentPixels[blueIndex]

    const mean = (redValue + greenValue + blueValue) / 3

    currentPixels[redIndex] = clamp(mean)
    currentPixels[greenIndex] = clamp(mean)
    currentPixels[blueIndex] = clamp(mean)
  }

  function addContrast(x, y, value) {
    const redIndex = getIndex(x, y) + R_OFFSET
    const greenIndex = getIndex(x, y) + G_OFFSET
    const blueIndex = getIndex(x, y) + B_OFFSET

    const redValue = currentPixels[redIndex]
    const greenValue = currentPixels[greenIndex]
    const blueValue = currentPixels[blueIndex]

    // Goes from 0 to 2, where 0-1 is less contrast and 1-2 is higher contrast
    const alpha = (value + 255) / 255 

    const nextRed = alpha * (redValue - 128) + 128
    const nextGreen = alpha * (greenValue - 128) + 128
    const nextBlue = alpha * (blueValue - 128) + 128

    currentPixels[redIndex] = clamp(nextRed)
    currentPixels[greenIndex] = clamp(nextGreen)
    currentPixels[blueIndex] = clamp(nextBlue)
  }
  
  //Filter effects - helper

  // Returns position in 1d array
  function getIndex(x, y) {
    return (x + y * srcImage.width) * 4
  }

  // Ensure value remain in range (RGB -> 0-255)
  function clamp(value) {
    return Math.max(0, Math.min(Math.floor(value), 255))
  }

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById("view_btn").addEventListener("click", myFunction);
});
function myFunction() {
  var x = document.getElementById("myDIV");
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
  }

}






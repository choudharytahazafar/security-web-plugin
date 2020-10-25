var callback = function (results) {
    // ToDo: Do something with the image urls (found in results[0])
    var dict = {};
    for(var i = 0; i<results[0].length; i++){
        dict["url" + i] = results[0][i];
    }
    console.log(dict);


    
    $.ajax({
        type: "POST",
        url: "http://127.0.0.1:8000/steganalysis/detect/",
        data: dict,
        success: function(msg){
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



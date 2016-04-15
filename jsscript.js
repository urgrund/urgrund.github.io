

function image(url, divid, subtext, contid, imgid)
{
	if(contid == undefined)
		contid = "sscontainer";
	if(imgid == undefined)
		imgid = "ss";
	
	// A new div to hold everything
	var newdiv = document.createElement("div");
	newdiv.id = "sscell";
	
	
	var ssdiv =  document.createElement("div");
	ssdiv.id = contid;//"sscontainer";
	
	// the image in the webpage
	var a = document.createElement('a');
	a.href = '#'+url; 
	a.innerHTML = "<img id ='"+imgid+"' src='"+url+"'/><br/>";
	
		
	// the hidden lightbox div
	var b = document.createElement('a');
	b.href = '#_';
	b.innerHTML = "<img src='"+url+"'/>";
	b.className = 'lightbox';
	b.id = url; 
		
	// add the two image links to teh ss div
	ssdiv.appendChild(a);	
	ssdiv.appendChild(b);
	
	// add the ss div to the new div
	newdiv.appendChild(ssdiv);

	

	// Add the text if available	
	if(subtext != undefined)
	{
		var txtd = document.createElement("div");
		txtd.innerHTML += "<p class='sst'>" + subtext + "</p>";
		newdiv.appendChild(txtd);
	}
	
	document.getElementById(divid).appendChild(newdiv);	
}

function screenShot(url)
{
	window.open( "imageframe.htm?"+url, "_self",  
    "resizable=no,status=no,HEIGHT=200,WIDTH=200");
}

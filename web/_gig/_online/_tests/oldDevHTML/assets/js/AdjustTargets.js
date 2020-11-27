// Get the modal
var adjustTargetsElement = document.getElementById('adjustTargetsElement');

// Get the button that opens the modal
var openAdjustFormBtn = document.getElementById("openAdjustFormBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("adj_close")[0];

// When the user clicks the button, open the modal 
openAdjustFormBtn.onclick = function ()
{
    adjustTargetsElement.style.display = "block";
}

// Submit
var adjustSubmitButton = document.getElementById("adj_Submit");
adjustSubmitButton.onclick = function ()
{
    console.log("Run updates here");
    adjustTargetsElement.style.display = "none";
}


// When the user clicks on <span> (x), close the modal
span.onclick = function ()
{
    adjustTargetsElement.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event)
{
    if (event.target == adjustTargetsElement)
    {
        adjustTargetsElement.style.display = "none";
    }
}


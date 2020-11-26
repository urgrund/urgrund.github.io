<link rel="icon" href="favicon.ico" type="image/x-icon">

<head>
    <title>Mine Mage</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
    <link rel="stylesheet" href="assets/css/main.css" />
    <link rel="stylesheet" href="assets/css/form.css" />
    <noscript>
        <link rel="stylesheet" href="assets/css/noscript.css" /></noscript>


</head>

<header id="header">
    <div class="content" style="display: flex; flex-direction: column;">

        <?
$mail_to_send_to = "matt@gigworth.com.au";
$from_email = "matt@gigworth.com.au";
$sendflag = $_REQUEST['sendflag'];    
$name=$_REQUEST['name'];

if ( $sendflag == "send" )
{
    $subject= "Gigworth Contact [" . $name . "]";
    $email = $_REQUEST['email'] ;
   
    $message = "\r\n" . "DO NOT REPLY DIRECTLY TO THIS EMAIL";
    $message .= "\r\n" . "Name: $name" . "\r\n" . "\r\n"; //get recipient name in contact form
    $message .= "Message:" . "\r\n";
    $message = $message.$_REQUEST['message'] . "\r\n" ;//add message from the contact form to existing message(name of the client)
   
    $headers = "From: $from_email" . "\r\n" . "Reply-To: $email"  ;
    $a = mail( $mail_to_send_to, $subject, $message, $headers );
    if ($a)
    {
            print("Thanks for getting in touch! We will return your message shortly.");
    } else {
            print("Something went wrong when trying to send your message... please try again.");
    }
}



?>
        <br />
        <a href="http://www.mine-mage.com" class="button icon solid fa-chevron-left scrolly">Back to Mine Mage</a>
    </div>
</header>
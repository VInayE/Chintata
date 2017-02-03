/*global moment*/

var commentId2 = fsi.pageParameter("CommentId");


function DeleteNotification(button)
{
  debugger;
  var result = fsi.confirm('Are you sure you wish to delete this Issue?');
  if (result === true){
    var inputs = {};
    var outputs = {};
    
    inputs.NotificationID = button.name;
    
    fsi.workflow('DeleteNotification', inputs, outputs, null, 
                 function(responseData){fsi.changePage('Messages');},
                 function(errorData){}); 
  }
  
}

function updateNotificationStatus(obj){
  
  
  debugger;
  
  
  
  var inputs = {};
  var outputs = {};
  var confirm_msg = "Are you sure you want to mark all notifications as read?";
  
  if(fsi.confirm(confirm_msg) !== true)
  {
    document.getElementById("markread").checked = false;
    return false;// its getting checked even user cancels//
    // thas why nmanually did checked and unchecked.//

  }
  else
  {
      fsi.workflow('UpdateUnreadMessages', inputs, outputs, null, function(responseData){
      document.getElementById("markread").checked = true;
      document.getElementById("markread").disabled = true;
        $('.peach').removeClass('peach').addClass('white');
   }, function(errorData){});
  }
  
}


// function to update notifications.

function setNotificationRead(sysid)
{
		var inputs = {};
		var outputs = {};
		inputs.NotifictiontId = sysid;
	// calling workflow to update the particular notification.
		fsi.workflow('SetNotificationRead', inputs, outputs, null, function(responseData){
   }, function(errorData){});
   
}

function msgClick(control){
  debugger;

  var notification = control.getAttribute("data-notification");
  fsi.pageParameter("SYSTEMID",control.getAttribute("data-issue"));
   setNotificationRead(control.id);
  if(notification=='message')
  {
    fsi.pageParameter("SYSTEMID",control.id);
    fsi.changePage('NewMessagePage');
  }
  else if(notification=='Issue' || notification=='Shared' || notification=='likes' || notification=='MeToo')  {

    fsi.pageParameter("SYSTEMID",control.id);
    fsi.changePage('Comment');
    
  }
  else if(notification=='Comment')
  {
    fsi.pageParameter("SYSTEMID",control.id);  
    fsi.changePage('Comment');
    
  }
  else if(notification=='Feedback'){
    
    fsi.pageParameter("SYSTEMID",control.getAttribute("data-issueid"));
    fsi.changePage('Feedback');
  }
  
 
}

function AddMessage(userImage,notification,issueid,userHandle, points, text, time, systemId, notificationStatus ,fkMessage ,pageToOpen, foriegnKey){
  
  debugger;
  
  var inputs = {};
  var outputs = {};
  inputs.FKIssue = issueid;
  
  
  var message = 
      '<div class="container-fluid">' +
        '<div class="row">' +
          '<!-- Card Projects -->' +
			'<div class="col-md-6 col-md-offset-3">';
            
            if(notificationStatus == "New"){
              message =  message + '<div class="card inner peach">';
            }
			else{
              message =  message + '<div class="card inner white">';
			}
                message =  message + '<div class="card-user" >' +
                    '<img class="img-responsive userpic" src="data:image/png;base64,' + userImage + '">' +
                      '<p>' + points + ' Points</p>' +
                        '</div>' +
                          '<div class="card-content" id="' + systemId + '" data-notification ="' + notification + '" data-issue ="' + issueid + '" onClick="msgClick(this)">' +
                            '<button name="' + systemId + '" type="button" class="btn btn-default standard-dark-icons del test-icon pull-right" onClick="DeleteNotification(this)"> <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAANCAYAAAB/9ZQ7AAAACXBIWXMAABcSAAAXEgFnn9JSAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAHNJREFUeNpi/P//PwMIqCgoCgCpB0DMz4AAB+88uO8A47AAFcE4BlCFjkj8fiT5D4zK8gr/GYgDB1mAhCDUFHzgA9A5F1igCvcTMhWIHZiQBBwJ0AxMDCSAoa44gQDNwAhKG8AoXQBkK+AxdAMwUiYABBgAdssew6bT+jsAAAAASUVORK5CYII=" width="20" /> Delete</button>'+
                              '<p>' + userHandle + '</p>' +
                                '<p>' + text + '</p>' +
                                  '<div class = "pull-right standard-dark-icons">' + time +
                                    '</div>' +
                                      '</div>' +
                                        '</div>' +
                                          '</div>' +
                                            '</div>' +
                                              '</div>';

  $("[data-control-id='pnlMessagesWithColor'] .col1.row1").append(message);
  
  $('img').on('click',function(event){
    
    event.stopPropagation();
    
    
    //fsi.changePage('OtherUsersProfilePage');
    
    
  });
  
}



function GenerateMessages(notifications){
  var item;  
  var image;

  
  for (var i=0; i<notifications.length; i++){
    item = notifications[i];
    debugger;
    image = searchAvatars(item.UserId);
    
    var dateLogged = moment(item.Date).format("MMM DD YYYY HH:mm");
    var diffLogDate = moment.utc().diff(dateLogged, 'hours');
    
    
    if(item.NotificationStatus == "New"){
      AddMessage(image,item.NotificationType,item.FKIssue,item.SocialHandle,item.UserPoint,item.NotificationMessage, dateLogged, item.NotificationID,item.NotificationStatus,item.FKMessage,'','');
      
    }
    else{
      //if(diffLogDate <= 24)
      //{
        AddMessage(image,item.NotificationType,item.FKIssue,item.SocialHandle,item.UserPoint,item.NotificationMessage, dateLogged, item.NotificationID,item.NotificationStatus,item.FKMessage,'','');
        
     // }
      
    }
    
    
    
    
  }
}

function setStaticValues()
{
  var FKSender= '7f9eb921-1c6c-48a2-8098-38a10fa2931e';
  var SenderID='id1234';
  var msg='Message has been created';  
  var dte= fsi.getById("datepicker-1");
  var FKReceiver= '7f9eb921-1c6c-48a2-8098-38a10fa2931e';
  var ReceiverId= 'rc11977';
  var cmntid= '7f9eb921-1c6c-48a2-8098-38a10fa2931e';
  
  
  fsi.setById("text-0", FKSender);
  fsi.setById("text-1", SenderID);
  fsi.setById("text-2", msg);
  fsi.setById("datepicker-1", dte);
  fsi.setById("text-3", FKReceiver);
  fsi.setById("text-4", ReceiverId);
  fsi.setById("text-systemid", cmntid);
  
}

function onLoad(){
  
  
  debugger;
  
  $('[id=mast-header] .span10 .bell').remove();
  
  // Page Title
  var span2 = '<span class="glyphicon glyphicon-chevron-left back-button" aria-hidden="true"  onClick="GoBack()"></span><div class="page-title-notifications"></div>';
  removePageTitles();
  $('[id=mast-header]').prepend(span2);
  
  //removing notification icon
  $('[id=mast-header] .span10 .bell').remove();
  
  var item;
  var inputs = {};
  var outputs = {};
  
  fsi.workflow('GetNotifications', inputs, outputs, null, function(responseData){
    
    var notifications = JSON.parse(responseData.Notifications).Output;
    // alert("responseData.Notifications" + " " + responseData.Notifications);
      
// no notification, disable checkbox
  
  if(notifications.length === 0 )
  {
	  document.getElementById("markread").checked = true;
      document.getElementById("markread").disabled = true;
  }
    
    var status = JSON.parse(responseData.Notifications).Output[0].NotificationStatus;
    
    GenerateMessages(notifications);
  }, function(errorData){});
  //setStaticValues();
  
  if(document.getElementById("markread")!== undefined )
  {
	  document.getElementById("markread").checked = false;
  }
  
}






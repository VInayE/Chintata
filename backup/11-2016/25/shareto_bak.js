/*global moment*/
var commentId = fsi.pageParameter("CommentId");
var notificationID = fsi.pageParameter("SYSTEMID");


var dataSet = {}, 
    dataSetArr = [], 
    $input = $('#text-Share'),
    $input1 = $('#text-id');
var addUser =[];
var tag;
var temparray=[];
var scialHandleArr=[];
/*function btnComment(button){

fsi.pageParameter("SYSTEMID",button.name);
fsi.changePage('Comment');

}*/

function removePerson(btn)
{
  
  for(var i=0; i< addUser.length; i++){
        //ert('array wrong value is  '+ addUser[i]);
        if(btn.value == addUser[i].UserName)
        {
          addUser.splice(i, 1);
          break;
        }
  }
    
  btn.remove();
}


function showTextBox()
{
  
  var txt = fsi.getById("text-Share");  
  //var dots = (txt.length > 11 ? "..." : "" );
 
  tag =      
    '<div class="tag">' +  
      '<input type="button" id="tagPeople" onClick="removePerson(this)" value= '+ txt +'>'+
        '</div>';
  
  //txt.substring(1,11)  + dots
  
  $("[data-control-id='container-tag']").append(tag) ;
  
  
}



function checkUserAdd(){
  
  var txt = fsi.getById("text-Share");  
  var a = dataSetArr.indexOf(txt);
  var useid=temparray[a];
  
  if (txt.length > 0) {
    if(addUser.length>0)
    {
      
      var count=0;
      
      for(var i=0; i< addUser.length; i++){
        //ert('array wrong value is  '+ addUser[i]);
        if(txt == addUser[i].UserName)
        {
          count = 1;
          
        }
        else
        {
        
          alert("Please enter correct social handle");
        
        }
       
      }
      if(count == 1){
        alert("You can't share this issue to the same user more than one time, Please add others"); 
      }
      else{
        
         addUser.push({"UserName":txt,"UserID":useid});
        showTextBox();
        $("#text-Share").val(''); 
     
      }
    }
    
    else
    {
      addUser.push({"UserName":txt,"UserID":useid});
      showTextBox();
      $("#text-Share").val('');  
     
    }
  }
  else
  {
    alert("Please select a user to share with");
  }
  
  
  
}





function AddIssue(liked, userImage, userHandle, points, text, time, privacy, noLikes, noComments, systemId){
  
  debugger;
  
  
  /*var txt = fsi.getById("text-Share");  
var tag =  '<div class="container-Tag">' + 
'<input type="button">' + tag + '</input>'+
'</div>';

$("[data-control-id='containerTag']").append(tag);id = "addpeople"*/
  
  var issue = 
      '<div class="container-fluid">' +
        '<div class="row">' +
          
          
          '<!-- Card Projects -->' +
            '<div class="col-md-6 col-md-offset-3">' +
              '<div class="">' +
                //'<div id="container-tag1">'+  '</div>'+
                '<input type="button"  onClick="checkUserAdd()"  value="Add more people..." id = "addpeople"/>'+  
                  //'<input type="text" id="autoText" placeholder="Enter Name">' +
                  //'</input>' +
                  
                  
                  '<hr id=shareHR>' +
                    '<div class="card-user share">' +
                      
                      '<img class="img-responsive userpic" src="data:image/png;base64,' + userImage + '">' +
                        '<p id="sharepoints">' + points + ' Points</p>' +
                          
                          '</div>' +
                            '<div class="card-content share">' +
                              '<p>' + userHandle + '</p>' +
                                //'<button id="shareResolved">' + "Resolved" + '</button>' +
                                
                                  '<p>' + text + '</p>' +
                                    '</div>' +
                                      
                                      '<div class="card-action share">' +
                                        '<span>' + time + '</span>'+
                                          '<textarea rows="4" cols="50" placeholder= "Type you comment here..." id="txtarComment">' + '</textarea>' ;
  //'<button type="button" class="btn btn-default pull-right" data-toggle="popover"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAECAYAAABREWWJAAAACXBIWXMAAA0SAAANEgG1gDd0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAHFJREFUeNpidPXyXcDAwBDPAAGJu7ZuWuDm7WcAZB8AYn4gvgjEDkDxD0BxkJg9EH8E4gQmJI0gMAFKN0A1goA+EAcANTpANTJA5QqYGIgDD7CIfQBpToQ6A4QLkGx+CGVPBDr5AAiD2FAxkFwDQIABANKGIDfSOIKtAAAAAElFTkSuQmCC" width="20" /></button>' +
  //'<button name="' + systemId + '" type="button" class="btn btn-default pull-right standard-dark-icons btncomment" onClick="btnComment(this)"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAKCAYAAABi8KSDAAAACXBIWXMAAA0SAAANEgG1gDd0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAEpJREFUeNpidPXy/cDAwMDPQARgIlYhTDHDcFbMAsQTgdgBiPWhYh+B+AIWtR8Y////z+Dm7QdSvB+q0GHX1k0XCDkDr0IQAAgwADXSEs9UFnHkAAAAAElFTkSuQmCC" width="20" /> ' + noComments + ' Comments</button>'
  
  
  // If the current user has already liked the comment then set image to orange hand else set to black
  /*if (liked==1)
{

issue = issue + '<button name="' + systemId + '" type="button" class="btn btn-default pull-right standard-orange-icons" onClick="btnLike(this)"><img src="" width="20" /> ' + noLikes + ' MeToo!</button>';
}
else
{

issue = issue + '<button name="' + systemId + '" type="button" class="btn btn-default pull-right standard-dark-icons black" onClick="btnLike(this)"><img src="" width="20" /> ' + noLikes + ' MeToo!</button>';
}*/
  
  issue = issue + 
    '</div>';
  if (privacy == 'Private'){issue = issue + '<div class="card-block"><p>this is private</p></div>';}
  
  issue = issue +   
    '</div>' +
      '</div>' +
        '</div>' +
          //'<button id="shareSend">' + "Send" + '</button>' +
          // '<button id="shareCancel">' + "Cancel" + '</button>' +
          '</div>';
  
  $("[data-control-id='container-share'] .col1.row1").append(issue);
  
  
}


function afterSelection(){
  //fsi.alert("in afterSelection");
  var val = $(this).val();
  //var vin = $(this).vin();
  var index1 = $(this).index();
  
  var a = dataSetArr.indexOf(val);
  //alert('index of ' + a);
  var useid=temparray[a];
  //ert('user id is ' + useid);
}



function attachListeners(){
  //fsi.alert("in attachListeners");
  $input.autocomplete({source:dataSetArr}).blur(afterSelection);
  // $input1.autocomplete({source:temparray}).blur(afterSelection);
  // alert('array value is ' + dataSetArr);
  
}

function workflowSuccess(res){
  //fsi.alert("in WorkflowSuccess");
  dataSet = JSON.parse(res.JSOutput), dataSetArr = [],temparray=[];  
  $.each(dataSet.Output, function(idx, val){
    dataSetArr.push(val.SocialHandle);
    temparray.push(val.UserId);
    
    // alert("val.userid" + " " + val.UserId);
    //addUser.push(val.UserId);
    // alert("Value" + " " + dataSetArr.push(val.SocialHandle));
    //alert("res" + " " + res.JSOutput);
  });
  
  attachListeners();
}

function callWorkflow(){
  //fsi.alert("in CallWorkflow");
  fsi.workflow('GetShareFunction',{},{},{},workflowSuccess,{});
}






function onLoad(){
  debugger;
 
  
  //fsi.hide("text-Share");
  /*// Notificstion icon
var span = '<span class="bell"><span class="label label-danger counts" onClick="onNotificationClick()">1</span><i class="glyphicon glyphicon-bell end-user-bell orange" onClick="onNotificationClick()" style="background-image: url()"></i></span>';
$('[id=mast-header] .span10').prepend(span);*/
  
  var loggedUserId = fsi.getLoggedUserId();
   fsi.setById('text-UserId', loggedUserId);
  
  $('#button-fSQn').click();
  
  var inputs1 = {};
  
  var outputs1 = {};
  
  fsi.workflow('GetNotificationCount', inputs1, outputs1, null, 
               function(responseData){
                 debugger;
                 var count = JSON.parse(responseData.Result).Output[0].Count;
                 
                 // Notificstion icon
                 
                 var span = '<span class="bell"><span class="label label-danger counts" onClick="onNotificationClick()">' + count + '</span><i class="glyphicon glyphicon-bell end-user-bell orange" onClick="onNotificationClick()" style="background-image: url()"></i></span>';
                 $('[id=mast-header] .span10 .bell').remove();
                 $('[id=mast-header] .span10').prepend(span);
               },
               function(errorData){
                 
               });
  
  //Page Title
  var span2 = '<span class="glyphicon glyphicon-chevron-left back-button" aria-hidden="true"  onClick="GoBack()"></span><div class="page-title-share"></div>';
  removePageTitles();
  $('[id=mast-header]').prepend(span2);
  
  
  /*Appending the list in Text Box*/
  callWorkflow();
  
  
  /*dummy static valuse workflow test by Gaurav*/  
  var inputs = {};
  var outputs = {};
  
  inputs.SystemId = fsi.pageParameter('IssueId');
  // *** Need to get timeline details from Workflow and generate issue HTML for each one ****
  fsi.workflow('GetIssueDetail', inputs, outputs, null, 
               function(responseData){
                 var issue = JSON.parse(responseData.Issue).Output[0];
                 
                 var userImage ;//= JSON.parse(issue.Avatar)[0].Content;
                 
                 var image = '';
                 if ( JSON.parse(issue.IssuePic).length > 0){
                   image = JSON.parse(issue.IssuePic)[0].Content; 
                 }
                 
                 debugger;
                 
                 
                 var dateLogged = moment(issue.LoggedDate).format("MMM DD YYYY HH:mm");
                 
                 var logdate = issue.LoggedDate;
                 
                 var diffLogDate = moment.utc().diff(logdate, 'minutes');
                 
                 var crntdate = moment.utc();
                 var sdate;
                 
                 if(diffLogDate <= 60)
                 {
                   sdate = diffLogDate + " " + "minutes ago";
                   
                 }
                 else if(diffLogDate <= 1440)
                 {
                   var v1 = Math.round(diffLogDate/60);
                   sdate =  v1 + " " + "hours ago";
                   
                 }
                 else
                 {
                   sdate = dateLogged;
                   
                 }
                 
                 
                 userImage = searchAvatars(issue.UserId);
                 
                 if (userImage.length > 0){
                   AddIssue(issue.Liked,userImage,issue.SocialHandle,issue.UserPoint,issue.IssueDesc,sdate,issue.Privacy,issue.NoLikes,issue.NoComments,issue.IssueSystemId,image);
                 }
                 else{
                   var inputs4 = {};
                   var outputs4 = {};
                   inputs4.UserId = issue.UserId;
                    fsi.workflow('GetUserImage', inputs4, outputs4, null, 
                     function(responseData){
                       userImage = JSON.parse(responseData.Image).Output[0].Picture;
                       
                       addAvatar(issue.UserId,userImage);
                       
                       
                       AddIssue(issue.Liked,userImage,issue.SocialHandle,issue.UserPoint,issue.IssueDesc,sdate,issue.Privacy,issue.NoLikes,issue.NoComments,issue.IssueSystemId,image);
                     
                     },function(errorData){debugger;}); 
                 }
                 
                 
                 if(cache.length>0) {
                   var count =0;
                   
                   //check the userId if is there in cache or not for loop
                   for (var z=0; z < cache.length; z++){
                     if (cache[z].UserID == issue.UserId){
                       count=1;
                       userImage = cache[z].Avtar;
                       break; 
                     }
                   }
                   if(count == 1){
                     AddIssue(issue.Liked,userImage,issue.SocialHandle,issue.UserPoint,issue.IssueDesc,sdate,issue.Privacy,issue.NoLikes,issue.NoComments,issue.IssueSystemId,image);
                     
                   }
                   else{
                     // call the workflow to retrieve image
                     
                     // on success of retrieve image add the user id and image in cache
                     // and call AddIssue function
                     var inputs2 = {};
                     var outputs2 = {};
                     
                     inputs2.UserId = issue.UserId;
                     
                     fsi.workflow('GetUserImage', inputs2, outputs2, null, 
                                  function(responseData){
                                    userImage = JSON.parse(responseData.Image).Output[0].Picture;
                                    cache.push({'UserID':issue.UserId,'Avtar':userImage});
                                    
                                    AddIssue(issue.Liked,userImage,issue.SocialHandle,issue.UserPoint,issue.IssueDesc,sdate,issue.Privacy,issue.NoLikes,issue.NoComments,issue.IssueSystemId,image);
                                    
                                  },function(errorData){debugger;}); 
                   }
                 }
                 
               },
               function(errorData){});
  
  // Register popover
  $('[data-toggle="popover"]').popover({
    placement : 'bottom',
    html : true,
    trigger : 'focus',
    content : '<div><button type="button" class="btn btn-default standard-dark-icons">Delete</button><button type="button" class="btn btn-default standard-dark-icons">Share</button></div>'
  });
  
  
  
}

function createSocial(socialHandle){
   var scialhndle2 = fsi.getById("text-Social");
  
  var issueId=  fsi.pageParameter('IssueId');
  var msg = scialhndle2 + " has shared a logged issue with you";
  var status = "New";
  var type = "Issue";
  
  var inputs = {};
  var outputs = {};
  
  
  
  inputs.Social = socialHandle;
  inputs.FKIssue = issueId;
  inputs.Msg = msg;
  inputs.Status = status;
  inputs.Type = type;
  
  fsi.workflow('ShareIssue', inputs, outputs, null, 
               function(responseData){
                 //alert("success");
                 fsi.redirectPage("MyTimeline");
                  
                  },function(errorData){debugger;
                                    // alert("failed");
                                    });  
}




function clearValues()
{

$("#text-Share").val(''); 
  //for(var i=0; i< addUser.length; i++){
    $( "#tagPeople" ).remove();
  //}
 
  addUser.length = 0;
  
   fsi.redirectPage("MyTimeline");

}


function sendShare(){
  
  //Calling wokflow for get all social Handle
  
  var inputs = {};
  var outputs = {};
 
  if(addUser.length>0)
  {
    
    var txtShare = fsi.getById("text-Share");
    
   // alert("You have tagged people successfully");

  for(var i=0; i< addUser.length; i++){
    var socialHandle = addUser[i].UserName;
   
    createSocial(socialHandle);
    
    
  }
  }
    else
    {
    
      alert("Please select any social handle to share"); 
    
    }

  
}



function cancel(){
  
  $("#text-Share").val('');  
  for(var i=0; i< addUser.length; i++){
    $( "#tagPeople" ).remove();
  }
  
  addUser.length = 0;
}






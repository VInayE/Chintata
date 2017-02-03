/*global moment*/
/*global Swiper*/

var swiper;
var swipeLoadMore = 5;
var slideIndex = 0;
var lastIssueDate;
var lastSysId;
var issues;
var SystmID;
var searchText;

    function BtnDelete(button)
{
  var result = fsi.confirm('Are you sure you wish to delete this Issue?');
  if (result === true){
    var inputs = {};
    var outputs = {};
    
    inputs.Sysid = button.name;
    
    
    fsi.workflow('Delete Issue', inputs, outputs, null, 
                 function(responseData){flashMessage("Successfully deleted the issue");fsi.changePage('MyTimeline');
                                       
                                       },
                 function(errorData){}); 
  }
  
}


function sharePage(button)
{
 
  fsi.pageParameter("IssueId",button.name);
  fsi.changePage('SharePage');
}

function userProfilePage(button){
  //alert("issue system id "+ button.id);
  var inputs = {};
  // alert("user id: "+ button.name);
  var userId = fsi.getLoggedUserId();
  
  if(userId == button.name){
    fsi.pageParameter("UserId",button.name);
  fsi.changePage('MyProfilePage');
  }
  else{
    fsi.pageParameter("UserId",button.name);
    
  fsi.pageParameter("IssuId",button.id);
   
  fsi.changePage('OtherUsersProfilePage');
  }
  
}

function btnComment(button){
  //button.disabled = true;
  
  fsi.pageParameter("IssueID",button.name);
  
  fsi.changePage('Comment');
  
}

function logItClick(){
  fsi.changePage('LogItPage');
}


function AddIssue(liked,status,userImage, userHandle, points, text, time, privacy, noLikes, noComments, systemId,image, userSystemId){
  
  
  
  //alert('id is in Add issues' +  userSystemId);
  var issue = 
      '<div class="swiper-slide">' +
        '<!-- Card Projects -->' +
          '<div class="col-md-6 col-md-offset-3" style="width:100%;">' +
            '<div class="card white">' +
              '<div class="card-user">' +
                '<a name="' + userSystemId + '" id="'+ systemId +'" type="button" class="btn btn-default pull-right standard-dark-icons" onClick="userProfilePage(this)"><img class="img-responsive userpic" src="data:image/png;base64,' + userImage + '"></a>' +
                  '<p class="carduser-points">' + points + ' Points</p>' +
                    '</div>' +
                      '<div class="card-content">' +
                        '<p style="font-size:12px !important;">' + userHandle + '</p>' +
                          '<p class="timeline-label">' + text + '</p>' +
                            '</div>';
  
  if (image.length > 0){
    issue = issue + '<div class="card-content">' +
      '<img class="card-image" src="data:image/png;base64,' + image + '">' +
        '</div>';
  }
  
  
  issue = issue + '<div class="card-action">' +
    '<span>' + time + '</span>' +
      '<button type="button" class="btn btn-default pull-right btnDots" data-toggle="popover"><img src="" width="20" /></button>' +
        '<button name="' + systemId + '" type="button" class="btn btn-default pull-right standard-dark-icons btncomment" onClick="btnComment(this)"><img src="" width="20" /> ' + noComments + '</button>';  
  
  //if current user logged the issue then disable me too button
  var loggedUserId = fsi.getLoggedUserId();
  if(loggedUserId == userSystemId){
    
  }
  else{
    // If the current user has already liked the comment then set image to orange hand else set to black
    if (liked==1)
    {
      
      issue = issue + '<button name="' + systemId + '" type="button" class="btn btn-default pull-right standard-orange-icons" onClick="btnLike(this)"><img src="" width="20" /> ' + noLikes + '</button>';
    }
    else
    {
      issue = issue + '<button name="' + systemId + '" type="button" class="btn btn-default pull-right standard-dark-icons black" onClick="btnLike(this)"><img src="" width="20" /> ' + noLikes + '</button>';
    }
  }
  issue = issue + 
    '</div>';
  if (privacy == 'Private'){issue = issue + '<div class="card-block" style="padding-left:10px"><p> This issue is marked as private</p></div>';}
  
  issue = issue +
    '</div>' +
      '</div>' +
        '</div>';
  
  swiper.appendSlide(issue);
  
  
  if(status=='Complete' || status=='Assigned')
  {
    $('[data-toggle="popover"]').popover({
      placement : 'left',
      html : true,
      trigger:'hover',
      content : '<div><button name="' + systemId + '" type="button" class="btn btn-default standard-dark-icons share test-icon" onClick="sharePage(this)"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAKpJREFUeNpi+f//PwMh4ObtNwFI5QNxISMhDUDFAUBqPYzPgkehAJAqgGIGnBrQFPID8UEgPgDECkD8gNHVy9cAyGgA4gtADFKcgKSwYdfWTQfQbdgAxPJA7A8Vw6oQBpigipHBAlyKYRoCgfgjlH8RiOcD/fEAiBOwaQAHK1BSAWjqA6inHaB+sgfih1A2A9TTE3DGA5pGGLhITMTBYhnuB0JgAbINAAEGANb2POJF6eO5AAAAAElFTkSuQmCC" width="20" />Share</button></div>'
    });
  }
  else
  {
    $('[data-toggle="popover"]').popover({
      placement : 'left',
      html : true,
      trigger:'focus',
      content : '<div><button name="' + systemId + '" type="button" class="btn btn-default standard-dark-icons del test-icon" onClick="BtnDelete(this)">  <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAANCAYAAAB/9ZQ7AAAACXBIWXMAABcSAAAXEgFnn9JSAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAHNJREFUeNpi/P//PwMIqCgoCgCpB0DMz4AAB+88uO8A47AAFcE4BlCFjkj8fiT5D4zK8gr/GYgDB1mAhCDUFHzgA9A5F1igCvcTMhWIHZiQBBwJ0AxMDCSAoa44gQDNwAhKG8AoXQBkK+AxdAMwUiYABBgAdssew6bT+jsAAAAASUVORK5CYII=" width="20" />  Delete</button></div><div><button name="' + systemId + '" type="button" class="btn btn-default standard-dark-icons share" onClick="sharePage(this)"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAKpJREFUeNpi+f//PwMh4ObtNwFI5QNxISMhDUDFAUBqPYzPgkehAJAqgGIGnBrQFPID8UEgPgDECkD8gNHVy9cAyGgA4gtADFKcgKSwYdfWTQfQbdgAxPJA7A8Vw6oQBpigipHBAlyKYRoCgfgjlH8RiOcD/fEAiBOwaQAHK1BSAWjqA6inHaB+sgfih1A2A9TTE3DGA5pGGLhITMTBYhnuB0JgAbINAAEGANb2POJF6eO5AAAAAElFTkSuQmCC" width="20" />    Share</button></div>'
    });
  }
}

function generateIssues(issueSysId,i,callback){
  var dateLogged;
  var issue;
  
  var inputs = {};
  var outputs = {};
  
  inputs.SystemId = issueSysId.SystemID;
  
  //alert('sytems id is ' + inputs.SystemId);

    
  fsi.workflow('GetIssueDetail', inputs, outputs, null, 
               function(responseData){
                 issue = JSON.parse(responseData.Issue).Output[0];
                 
                SystmID = issue.IssueSystemId;
                 //alert("SystemID" + " " + SystmID);
                 var userImage;
                 
                 var image = '';
                 if ( JSON.parse(issue.IssuePic).length > 0){
                   image = JSON.parse(issue.IssuePic)[0].Content; 
                 }
                 debugger;
                 lastIssueDate = moment.utc(issue.LoggedDate).format("MMM DD YYYY HH:mm:ss");
                 
                 lastSysId = issueSysId.SystemID;
                 
                 dateLogged = moment(issue.LoggedDate).format("MMM DD YYYY HH:mm");
                 dateLogged = friendlyDate(dateLogged);
                 
                 userImage = searchAvatars(issue.UserId);
                 
                 if (userImage.length > 0){
                   AddIssue(issue.Liked,issue.IssueStatus,userImage,issue.SocialHandle,issue.UserPoint,issue.IssueDesc,dateLogged,issue.Privacy,issue.NoLikes,issue.NoComments,issue.IssueSystemId,image, issue.UserId);
                 }
                 else{
                   var inputs2 = {};
                   var outputs2 = {};
                   inputs2.UserId = issue.UserId;
                    fsi.workflow('GetUserImage', inputs2, outputs2, null, 
                     function(responseData){
                       userImage = JSON.parse(responseData.Image).Output[0].Picture;
                       
                       addAvatar(issue.UserId,userImage);
                       
                       
                       AddIssue(issue.Liked,issue.IssueStatus,userImage,issue.SocialHandle,issue.UserPoint,issue.IssueDesc,dateLogged,issue.Privacy,issue.NoLikes,issue.NoComments,issue.IssueSystemId,image, issue.UserId);
                       
                     },function(errorData){debugger;}); 
                 }
                 

                 var index = i+1;
                 callback(index);
               },
               
                 function(errorData){debugger;});
 
}

function GetIssues(i){
  var issue;
  if (i < issues.length){
    issue = issues[i];
    generateIssues(issue,i, GetIssues);
  }
}
//alert("Length of array :- " + " " + cache.length);

function GetTimeline(filter, search, date, sysId){
  var inputs = {};
  var outputs = {};
  
  if (filter === undefined){filter = '';}
  if (search === undefined){search = '';}
  
  inputs.Filter = filter;
  inputs.Search = search;
  inputs.DateSearch = date;
  inputs.SystemIdSearch = sysId;
  
  // *** Need to get timeline details from Workflow and generate issue HTML for each one ****
  fsi.workflow('GetTimeline', inputs, outputs, null, 
               function(responseData){
                 issues = JSON.parse(responseData.Issues).Output;
                 if (issues.length > 0){
                   GetIssues(0);
                   
                 }
               },
                 function(errorData){debugger; });
  
}

function MyCalls(){
  
 swiper.removeAllSlides(); 
 
  $("[data-control-id='filteroptions']").toggleClass("filter-options-show");
   
  var date = moment().utc().valueOf();
  date = moment(date).format("MMM DD YYYY HH:mm");
  fsi.globalVariable('filterDelete',"MyCalls");
  fsi.setById('txtFILTER', fsi.globalVariable('filterDelete'));
   
  GetTimeline('MyCalls',fsi.getById('txtSearch'),date,"00000000-0000-0000-0000-000000000000");
  
}
function ResolvedCalls(){

swiper.removeAllSlides(); 
 
  $("[data-control-id='filteroptions']").toggleClass("filter-options-show");
  
  var date = moment().utc().valueOf();
  date = moment(date).format("MMM DD YYYY HH:mm");
   fsi.globalVariable('filterDelete',"ResolvedCalls");
  fsi.setById('txtFILTER',fsi.globalVariable('filterDelete'));
  GetTimeline('ResolvedCalls',fsi.getById('txtSearch'),date,"00000000-0000-0000-0000-000000000000");
}
function AllCalls(){
  
swiper.removeAllSlides(); 
 
  $("[data-control-id='filteroptions']").toggleClass("filter-options-show");
  
  var date = moment().utc().valueOf();
  date = moment(date).format("MMM DD YYYY HH:mm");
   fsi.globalVariable('filterDelete',"AllCalls");
  fsi.setById('txtFILTER', fsi.globalVariable('filterDelete'));
  GetTimeline('AllCalls',fsi.getById('txtSearch'),date,"00000000-0000-0000-0000-000000000000");
}

function AddSwiper(){
  var swipe = '<div class="swiper-container">' +
    '<!-- Additional required wrapper -->' +
      '<div data-control-id="swiper" class="swiper-wrapper">' +
        '</div>' +
          //'<div class="swiper-scrollbar"></div>' +
            '</div>';
  
  $("[data-control-id='pnlTimeline'] .col1.row1").append(swipe); 
  
  
  // Init Swiper
  swiper = new Swiper ('.swiper-container', {
    // Optional parameters
    direction: 'vertical',
    loop: false,
    mousewheelControl: true,
    keyboardControl: true,
    slidesPerView: 'auto',
    spaceBetween: 5,
    speed: 100,
    grabCursor: true,
    freeMode: true,
    freeModeMomentum: false
  });
}


function search(){
  searchText = fsi.getById('txtSearch');
  debugger;
  if(searchText === '' || searchText === null){
    
  }
  else{
  var date = moment().utc().valueOf();
  date = moment(date).format("MMM DD YYYY HH:mm");
  issues = '';
  swiper.removeAllSlides(); 
  
  GetTimeline(fsi.getById('txtFILTER'),searchText,date,"00000000-0000-0000-0000-000000000000");
  fsi.setById('txtSearch','');
  }
}

function onLoad(){
  fsi.setById('txtFILTER', fsi.globalVariable('filterDelete'));

  AddSwiper();
  
  var inputs = {};
  
  var outputs = {};
  
  fsi.workflow('GetNotificationCount', inputs, outputs, null, 
               function(responseData){
                 var count = JSON.parse(responseData.Result).Output[0].Count;
                
                 // Notificstion icon
                 
                 var span = '<span class="bell"><span class="label label-danger counts" onClick="onNotificationClick()">' + count + '</span><i class="glyphicon glyphicon-bell end-user-bell orange" onClick="onNotificationClick()" style="background-image: url()"></i></span>';
                 $('[id=mast-header] .span10 .bell').remove();
                 $('[id=mast-header] .span10').prepend(span);
               },
               function(errorData){
                 
               });
  
  
  // Page Title
  var span2 = '<div class="page-title-mytimeline"></div>';
  removePageTitles();
  $('[id=mast-header]').prepend(span2);
  
  
  
  // Check for user profile and create default entry if not found (Self Registration)
  inputs = {};
  outputs = {};
  
  fsi.workflow('CheckUserProfile', inputs, outputs, null, 
               function(responseData){},
               function(errorData){});
  
  // Register popover
  
  $("#buttonfilter").click(function(){
    $("[data-control-id='filteroptions']").toggleClass("filter-options-show");
  });
  
   $(document).ready(function () {
     
     var date = moment().utc().valueOf();
    date = moment(date).format("MMM DD YYYY HH:mm");
    issues = '';
    GetTimeline(fsi.getById('txtFILTER'),fsi.getById('txtSearch'),date,"00000000-0000-0000-0000-000000000000");
     
    // Reset the filter
	var val= fsi.pageParameter('FILTER', '');
     
      
  if($("[data-control-id='filteroptions']").hasClass("filter-options-show"))
  {
   
    $("[data-control-id='filteroptions']").removeClass("filter-options-show");
  }
       
    swiper.onTransitionStart = function(swipe){
      if (swiper.isEnd){
        // Load the next 5
        issues = '';
        GetTimeline(fsi.getById('txtFILTER'),searchText,lastIssueDate, lastSysId);
      }
	}; 
  });
}



function goBack() {
    window.history.back();
}
function flashMessage(msg){
  
$("#Chat_Window").after('<div class="alert alert-success" id="msg_div"><strong>Success!</strong> '+msg+'</div>');
  setTimeout(function(){ $("#msg_div").remove(); }, 3000);
}
 
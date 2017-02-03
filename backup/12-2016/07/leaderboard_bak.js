var users;


function buildComment(index, userName, SocialHandle,  points,userImage)
{
  // Building the dynamic LaederBoard display Data Card
  
  var comment = 
      '<div class="container-fluid">' +
        '<div class="row">' +
          '<!-- Card Projects -->' +
            '<div class="col-md-6 col-md-offset-3">' +
              
              '<div class="card-number">' +
                  '<p>' + index + '</p>' +
                    '</div>' +
              
              '<div class="card leaderboard peach">' +
                
                      '<div class="card inner peach">' +
                        '<div class="card-user">' +
                          '<img class="img-responsive userpic" src="data:image/png;base64,' + userImage + '">' +
                            '</div>' +
                              '<div class="card-content">' +
                                '<p class="leaderboard-labels">' + userName + '</p>' +
                                  '<p class="leaderboard-labels">' + SocialHandle + '</p>' +
                                    '</div>' +
                                      '<div class="card-content-right card-number">' +
                                        '<p>' + points + '</p>' +
                                          '<p>' + "Points" + '</p>' +
                                            '</div>' +
                                              
                                              '</div>' +
                                                '</div>' +
                                                  '</div>' +
                                                    '</div>' +
                                                      '</div>';
  
  return comment;
}

function buildRankComment(index, userName, SocialHandle,  points,userImage)
{
  // Building the dynamic LaederBoard display Data Card
  
  var comment = 
      '<div class="container-fluid">' +
        '<div class="row">' +
          '<!-- Card Projects -->' +
            '<div class="col-md-6 col-md-offset-3">' +
              '<div class="card-number">' +
                  '<p>' + index + '</p>' +
                    '</div>' +
              
              '<div class="card leaderboard peach">' +
                
                      '<div class="card inner peach">' +
                        '<div class="card-user">' +
                          '<img class="img-responsive userpic" src="data:image/png;base64,' + userImage +'">' +
                            '</div>' +
                              '<div class="card-content">' +
                                '<p class="leaderboard-labels">' + userName + '</p>' +
                                  '<p class="leaderboard-labels">' + SocialHandle + '</p>' +
                                    '</div>' +
                                      '<div class="card-content-right card-number">' +
                                        '<p>' + points + '</p>' +
                                          '<p>' + "Points" + '</p>' +
                                            '</div>' +
                                              
                                              '</div>' +
                                                '</div>' +
                                                  '</div>' +
                                                    '</div>' +
                                                      '</div>';
  
  return comment;
}



function GenerateCommentCard(item, index, callback)
{
  var comment = "";
  var userImage;
  
  index = index+1;
  
  userImage = searchAvatars(item.UserId);
                 
  if (userImage.length > 0){
    comment = buildComment(index, item.UserName, item.SocialHandle,item.UserPoint, userImage);
  }
  else{
    var inputs2 = {};
    var outputs2 = {};
    inputs2.UserId = item.UserId;
    fsi.workflow('GetUserImage', inputs2, outputs2, null, 
                 function(responseData){
                   userImage = JSON.parse(responseData.Image).Output[0].Picture;
                   
                   addAvatar(item.UserId,userImage);
                   
                   comment = buildComment(index, item.UserName, item.SocialHandle,item.UserPoint, userImage);
                 },function(errorData){debugger;}); 
  }
  // Append to the container
  $("[data-control-id='pnlComments'] .col1").append(comment);
    
    callback(index);
}


function GenerateCommentCardForRank(data)
{
  var comment = "";
  var item;
  var index = 0;
  //var data = fsi.getById('txtComments');
  var ret = JSON.parse(data).Output;
  
  var userImage;
  if (ret.length > 0){
    item = ret[0];
    index = item.Rank;
    userImage = searchAvatars(item.UserId);
                   
    if (userImage.length > 0){
      comment = buildRankComment(index, item.UserName, item.SocialHandle,item.UserPoint, userImage);
    }
    else{
      var inputs2 = {};
      var outputs2 = {};
      inputs2.UserId = item.UserId;
      fsi.workflow('GetUserImage', inputs2, outputs2, null, 
                   function(responseData){
                     userImage = JSON.parse(responseData.Image).Output[0].Picture;
                     
                     addAvatar(item.UserId,userImage);
                     
                     comment = buildRankComment(index, item.UserName, item.SocialHandle,item.UserPoint, userImage);
                   },function(errorData){debugger;}); 
    }
    
  
        $("[data-control-id='contnrRank'] .col1").append(comment);
    }
}


function callWorkflowForRank()
{
  
  var inputs = {};
  var outputs = {};
  
  // calling the workflow for getting the LeaderBoard Data on Dynamic HTML
  
  fsi.workflow('GetMyUserRank', inputs, outputs, null, 
               function(responseData){
                 GenerateCommentCardForRank(responseData.UserRank);           
               },
               function(errorData){
                 alert("Failed to get user rank");
               });
  
}

function GetUser(i){
  var user;
  debugger;
  if (i < users.length){
    user = users[i];
    GenerateCommentCard(user,i, GetUser);
  }
}

function onLoadButton()
{
  
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
                 alert("Failed to get notificaitons count");
               });
  
  
  // Page Title
  var span2 = '<span class="glyphicon glyphicon-chevron-left back-button" aria-hidden="true"  onClick="GoBack()"></span><div class="page-title-leaderboard"></div>';
  removePageTitles();
  $('[id=mast-header]').prepend(span2);
  
  
  /*// Page Title
var span2 = '<div class="page-title">MyTimeline</div>';
$('[id=mast-header] .page-title').remove();
$('[id=mast-header]').prepend(span2);*/
  
  
  var inputs = {};
  var outputs = {};
  
  // calling the workflow for getting the LeaderBoard Data on Dynamic HTML
  fsi.workflow('GetLeaderBoard', inputs, outputs, null, 
               function(responseData){
                 debugger;
                 users = JSON.parse(responseData.Users).Output;
                 GetUser(0);            
               },
               
               function(errorData){
                 alert("Failed to load leaderboard");
               });
  
  callWorkflowForRank();
  
}

function rankCount()
{
  
  var rankvalue =fsi.getById("text-output");
  
  if(rankvalue>20)
  {
    
    callWorkflowForRank();
    //onLoadButton();
  }
  
}  
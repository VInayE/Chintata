/*===   Global variable sdeclaration ====*/
var userDevicecount;
var userid = fsi.getLoggedUserId();

//allow add device access to admin/authorize user only
/*== pass the uid to allow access to specific user int value ===*/
var admin = {id:[12345,12395,12394]};


// getting the desired date //
function getTheDate(margin)
{
var date = new Date();
var newdate = new Date();

newdate.setDate(date.getDate() + margin);

var dd = newdate.getDate();
var mm = newdate.getMonth() + 1;
var y = newdate.getFullYear();

return  mm + '/' + dd + '/' + y;
}


//alert(admin.id[0]);

function isadmin(){
  //alert(typeof(userid));
  if($.inArray(parseInt(userid,10), admin.id) !== -1){
    
    $("#add-device-button").css("display","inline-block");
    fsi.log("You are logged in as admin user");
  //alert("in array");
  }else{
    $("#add-device-button").css("display","none");
  fsi.log("Not admin user");
  }
}




/*===== func() checks user have permission for loan or not =======*/
function loanPermission(userDevicecount){
var imgPath = "url('data:image/png;base64,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')";
 //userDevicecount=2;
  if(userDevicecount == 2){
  $('div[ data-control-id="request-loan-cont"] .container-row.main-container-row.ui-grid-b:first-child').css('display','none');
  $("#sucess-msg").text("You have no more devices available for loan");
  $('div[data-control-css="css-notification-img"].inlinediv.component-container.container:last-child').css('background-image',imgPath);
  }else {
  //$('div[ data-control-id="request-loan-cont"] .container-row.main-container-row.ui-grid-b:first-child').css('display','block');
  } 
}


/*==== count user devices =====*/
function countUserDevices(){
var count;
var inputs = {};
var outputs = {};
//var uId =  fsi.getLoggedUserId();
inputs.UserId = userid;  
fsi.workflow('countDevices',inputs,outputs,null,
function(responseData){
 var parseData = JSON.parse(responseData.Result).Output;
   //alert(responseData.Result);
   count = parseData[0].Column1;
  var msg = "You currently have '" + count  + "' device(s) on loan";
  $("#current-device-msg").text(msg);
  loanPermission(count);
  
},function(errorData){
  fsi.log("Problem in counting rows");
});
}

/*==== populate select list ====*/
function populatelist(){
//alert("get list data");
var inputs = {};
var outputs = {};
var i,len;
inputs.Status = 1;  
fsi.workflow('populateComboList',inputs,outputs,null,
function(responseData){
 var parseData = JSON.parse(responseData.Result).Output;
   //alert(responseData.Result);
   len = parseData.length;
 // alert(len);
  for(i=0;i<len;i++){
  $("#select-device").append("<option id='" + parseData[i].SystemID + "'>"+ parseData[i].Name +"</option>");
  }
},function(errorData){
  fsi.log("Problem in populating device list");
});
}



// function to get my page //
function getMyPage(){
   var inputs = {};
   var outputs = {};
   fsi.workflow('MyPage', inputs, outputs, null, 
               function(responseData){
					fsi.log("Data displayed on the my page grid");
               },
               function(errorData){
                    $("#message-label").html("<B>Workflow Error while processing.</B>");
               }); 
}  

// function to get all devices //
function getAllDevices() {
    fsi.hide("myPagegrid");
	fsi.show("alldevicesgrid");
   var inputs = {};
   var outputs = {};
   fsi.workflow('AllDevices', inputs, outputs, null, 
               function(responseData){
				fsi.log("Data displayed on the all devices grid");
               },
               function(errorData){
                    $("#message-label").html("<B>Workflow Error while processing.</B>");
               }); 
}  

// function to validate add loan device //
function validateAddLoanDevice(){
 //fsi.alert("valid");
   var trim;
   var msg = [];
   var name = fsi.getById("new-device");
   var return_by = fsi.getById("return-by");
	if( name === '' )
		msg.push(' Device Name');
	if( return_by === '' ||  JSON.stringify(return_by) === 'null' )
		msg.push(' Return By');
	if(msg.length >0){
     // fsi.alert("msg length");
		$("#message-label").html("<B>Please provide valid value(s) for "+msg.join(',')+".</B>");
		return false;
	} else {
      $("#message-label").html("");
      return true;
    }
} 


// function to add loan devices //
function addLoanDevice(){
 //  fsi.alert("add loan device");
   var inputs = {};
   var outputs = {};
   var deviceid = fsi.getById("new-device");
   var return_by = fsi.getById("return-by");
   
   if(validateAddLoanDevice()){
  inputs.DeviceId= deviceid;
  inputs.ReturnDate = "";//return_by;
  //inputs.UserName = getuserdata();
     
   fsi.workflow('AddLoanDevice', inputs, outputs, null, 
               function(responseData){
					$("#message-label").html("<B>Loan Device Added Successfully.</B>");
               },
               function(errorData){
                    $("#message-label").html("<B>Workflow Error while processing.</B>");
               }); 
   } else {
	  
		return false;
  }
} 

  
/* function call app onload */
function invokeonLoad(){
 $('#refreshBtn').click();
//getuserdata();
isadmin();
//getuserdata();
countUserDevices();
populatelist();


fsi.setById('return-by',getTheDate(2));
}
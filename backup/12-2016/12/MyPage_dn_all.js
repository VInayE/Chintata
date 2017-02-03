var username = '';


/* For GetUserRank onLoad */
// function getting user details    //

function getuserdata(){
  
	var inputs = {};
	var outputs = {};
	  
	var getUid = fsi.getLoggedUserId();
	  
	inputs.UserId = getUid;
	
	fsi.workflow('getUName',inputs,outputs,null,
	function(responseData){
	 var parseData = JSON.parse(responseData.Result);
	 var fName = parseData.Output[0].FirstName;
	 var lName = parseData.Output[0].LastName;
		 username =   fName + ' ' + lName;
		 
	  $("#welcome-msg").text("welcome" + ' "' + fName + ' ' + lName + '"');

	},function(errorData){
	  fsi.log("Problem in getting user data");
	});
  
}

function onLoad()
{
  debugger;
 
 
// fsi.refreshGrid('myPagegrid');
 $('#refreshBtn').click();
//fsi.alert("onload");  
  
  //getuserdata();
}

function refreshGrid(){
  debugger;
  
  //alert("in refresh grid");
  //fsi.refreshGrid('myPagegrid');

}





function getAllAvailableDevices(){
  
	var inputs = {};
	var outputs = {};
	  
	var getUid = fsi.getLoggedUserId();
	  
	inputs.UserId = getUid;
	
	fsi.workflow('availableDevices',inputs,outputs,null,
	function(responseData){
      var a =  JSON.stringify(responseData); 
		fsi.alert("responseData = "+a);
	 //var parseData = JSON.parse(responseData.Result);
	 //var fName = parseData.Output[0].FirstName;
	 //var lName = parseData.Output[0].LastName;
		
		 
	 

	},function(errorData){
	  fsi.log("Problem in getting available devices");
	});
  
}

getAllAvailableDevices();


// function to get my page //

function getMyPage()
{
   var inputs = {};
   var outputs = {};
     
   fsi.workflow('MyPage', inputs, outputs, null, 
               function(responseData){

					
               },
               function(errorData){
                    $("#message-label").html("<B>Workflow Error while processing.</B>");
               }); 
}  

// function to get all devices //
function getAllDevices()
{
    fsi.hide("myPagegrid");
	fsi.show("alldevicesgrid");
//	$("#alldevices-but").css('background', '#007FC0');
//	$("#alldevices-but").css('color', '#FFFFFF');
   var inputs = {};
   var outputs = {};
     
   fsi.workflow('AllDevices', inputs, outputs, null, 
               function(responseData){

					
               },
               function(errorData){
                    $("#message-label").html("<B>Workflow Error while processing.</B>");
               }); 
 
}  

// function to validate add loan device //
 

 
function validateAddLoanDevice()
{
 //fsi.alert("valid");
   var msg = [];
   var name = fsi.getById("new-device");
   var return_by = fsi.getById("return-by");
  
	if( name === '' )
		msg.push(' Device Name');
	if( return_by === '' )
		msg.push(' Return By');
	
	
	if(msg.length >0)
	{
     // fsi.alert("msg length");
		$("#message-label").html("<B>Please provide valid value(s) for "+msg.join(',')+".</B>");
        
		return false;
	}	
	else
    {
      $("#message-label").html("");
      return true;
    }

} 

function addLoanDevice()
{
 //  fsi.alert("add loan device");
   var inputs = {};
   var outputs = {};
   
   var deviceid = fsi.getById("new-device");
   var return_by = fsi.getById("return-by");
   
   if(validateAddLoanDevice())
   {
 
  inputs.DeviceId= deviceid;
  inputs.ReturnDate = "";//return_by;
  inputs.UserName = username;
     
   fsi.workflow('AddLoanDevice', inputs, outputs, null, 
               function(responseData){
					$("#message-label").html("<B>Loan Device Added Successfully.</B>");
               },
               function(errorData){
                    $("#message-label").html("<B>Workflow Error while processing.</B>");
               }); 
   }
  else
  {
	  
		return false;
  }
} 


  

  
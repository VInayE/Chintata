//  function to validate.
function validation(){
  
  
   var msg = [];
   var name = fsi.getById("device-name");
   var model = fsi.getById("device-model");
   var imei = fsi.getById("imei-number");
  
	if( name === '' )
		msg.push(' Name');
	if( model === '' )
		msg.push(' Model');
	if( imei === '' )
		msg.push(' IMEI');
	
	if(msg.length >0)
	{
		$("#message-cont").html("<B>Please enter valid value for "+msg.join(',')+".</B>");
        
		return false;
	}	
	else
    {
      $("#message-cont").html("");
      return true;
    }
}	


// add data //
function addNewDevice(){
 
   var inputs = {};
   var outputs = {};
   var device_name = fsi.getById("device-name");
   var device_model = fsi.getById("device-model");
   var imei_number = fsi.getById("imei-number");
   
   if(validation())
   {

  inputs.Name= device_name;
  inputs.Model = device_model;
  inputs.IMEI = imei_number;
  
   fsi.workflow('AddNewDevice', inputs, outputs, null, 
               function(responseData){
					$("#message-cont").html("<B>Device Added Successfully.</B>");
               },
               function(errorData){
                    $("#message-cont").html("<B>Workflow Error while processing.</B>");
               }); 
   }
  else
  {
	  
		return false;
  }  
  
}

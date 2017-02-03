var rankData;

/*Function for validation of Rank & minRange or maxRange*/



function checkValidation(rankData,min,max){
		var count = 0;
  
  if( rankData.length > 0)
  {
	  for(var i=0; i<rankData.length; i++){
		var minimum = 0,maximum =0;
		
		minimum =  rankData[i].MinRange;
		maximum =  rankData[i].MaxRange;
	  
	  if( ( min >= minimum && min <= maximum ) && ( max >= minimum && max <= maximum ) || ( min <= minimum && max >= maximum ) )
	  {  
 
		return false;
	  }
	  else
	  {
		
		return true;
	  }	  
	}
  }
  else
  {
	  return true;
  }	  
}

function save(){
  var event1 = arguments.callee.caller.caller;
  var samernk;
  debugger;
  
    var inputs = {};
    var outputs = {};
    var min= fsi.getById('number-min').trim();
	var max= fsi.getById('number-max').trim();
	
		min=parseInt(min,10);
		max=parseInt(max,10);
    
    fsi.workflow('ReadRanks', inputs, outputs, null, 
                 function(responseData){
                   
                   debugger;
                   
                   rankData = JSON.parse(responseData.Ranks).Output;
                   
                  var is_valid = checkValidation(rankData,min,max);
                   //alert("val of count "+count);
                   if(!is_valid){
                      fsi.alert("Ranges must be unique and must not overlap");
                   }
                   else{
					   
					   
					   
					inputs.Min=min;   
					inputs.Max=max;
					inputs.Rank=fsi.getById("combo-rank");
					alert("inputs="+inputs);
				fsi.workflow('InsertRanks', inputs, outputs, null, 
                 function(responseData){
                    alert("event");
						  fsi.changePage("UserRankings");
                 },
                 function(errorData){
                   
                 }); 
					   
				  
					   
				/*	
						fsi.saveForm(false,function(){
						  
						  alert("event");
						  fsi.changePage("UserRankings");
						  
						},function(){
						  
						  });
					*/
                  
					}
				 },
                 function(errorData){
                   //lert("in fail");
                 }); 

  // If everything is nice then go ahead.
  

 
}


function rankAlert()
{
  
  var samernk=fsi.getById("text-output");
  samernk = 0 + samernk;

  
  //alert("count" + samernk);
  var min=fsi.getById("number-min");
  var max=fsi.getById("number-max");
  //fsi.alert("samernk" + " " + samernk);
  //alert("min: "+min+"max: "+max);
  if(samernk>0)
  {
    fsi.alert("Rank Already Exist");
  }
  else if(min > max  || min == max)
  {
    fsi.alert("Minimum range cannot be greater than or equal to Maximum value");
  }
  else if(min <='0')
  {
    fsi.alert("Minimum range must be greater than 0");
  }
  else
  {
    var inputs = {};
    var outputs = {};
    //alert("inside alert");
    
    fsi.workflow('ReadRanks', inputs, outputs, null, 
                 function(responseData){
                   alert("in success");
                   debugger;
                   
                   rankData = JSON.parse(responseData.Ranks).Output;
                   alert(rankData+"=rankData");
                  var count = checkValidation(rankData,min,max);
                   //alert("val of count "+count);
                   if(count == 1){
                      fsi.alert("Ranges must be unique and must not overlap");
                   }
                   else{
                    save();
                   }
                   
                 },
                 function(errorData){
                   //lert("in fail");
                 }); 
    
    
    /*
debugger;

var event = arguments.callee.caller;

fsi.saveForm(event,function(){

//fsi.alert("Save Successfully");
fsi.changePage("UserRankings");

},function(){

});*/
    }
}


function validation(){
  var min= fsi.getById('number-min').trim();
  var max= fsi.getById('number-max').trim();
  var txtRank=fsi.getById('combo-rank').trim();
  
  min=parseInt(min,10);
  max=parseInt(max,10);
    
//alert("vald");
  
  
  if( min !== '' && max !== '' && min < max  && min !== max && min > 0 && (txtRank !== '' && txtRank !== 'Name Rank')){
   // alert("min =" +min +" -- Max = "+max);
    fsi.enable('button-Save');
    
  }
  else{
    
    fsi.disable('button-Save');
  }
  
}

function onLoad()
{
  
  var inputs = {};
  
  var outputs = {};
  
  fsi.workflow('GetNotificationCount', inputs, outputs, null, 
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
  
  
  // Page Title
  var span2 = '<span class="glyphicon glyphicon-chevron-left back-button" aria-hidden="true" onClick="GoBack()"></span><div class="page-title-addnew"></div>';
  removePageTitles();
  $('[id=mast-header]').prepend(span2);
  fsi.disable('button-Save');
  
  fsi.hide("text-output");
  fsi.hide("text-min");
  fsi.hide("text-max");
  
  //validation();
}
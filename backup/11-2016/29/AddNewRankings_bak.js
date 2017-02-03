var rankData;

/*Function for validation of Rank & minRange or maxRange*/

function save(){
  var event = arguments.callee.caller.caller;
  var samernk;
  debugger;
  
  

  // If everything is nice then go ahead.
  
    fsi.saveForm(event,function(){
      
      
      fsi.changePage("UserRankings");
      
    },function(){
      
      });
 
}

function checkValidation(rankData,min,max){
  var count = 0;
  //alert("inside check validation");
  for(var i=0; i<rankData.length; i++){
    var minimum = 0,maximum =0;
   // alert("min val"+rankData[i].MinRange);
   // alert("max vak: "+rankData[i].MaxRange);
    minimum =  rankData[i].MinRange;
    maximum =  rankData[i].MaxRange;
    if(min >=minimum){
     // alert("inside first if");
     // alert("vals: "+ min + "db min: "+ rankData[i].MinRange + "db max: "+rankData[i].MaxRange);
      if(min < maximum){
     // alert("in if");
      
     count=1;
      break;
      }
      else if (min == maximum){
      //  alert("in else if");
       count=1;
      break;
      }
      else{
       // alert("inside first else");
      }
      
    }
  if(max >=minimum){
    //alert("inside second else if");
    //alert("vals: "+ max + "db min: "+ rankData[i].MinRange + "db max: "+rankData[i].MaxRange);
       if(max < maximum){
      //alert("in else if if");
      
     count=1;
      break;
      }
      else if (max == maximum){
       // alert("in else if else if");
     count=1;
      break;
      }
      else{
       // alert("inside second else");
      }
      
    }
    else{
     //alert("inside else"); 
    }
    
  }
  //alert("val of count after loop: "+count);
  return count;
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
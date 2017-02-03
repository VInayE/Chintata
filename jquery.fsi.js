function fsi() { }
function fsiPrivate() { }

/// <summary>
/// purify JSON
/// </summary>
/// <param name="data" type="type">data</param>
/// <returns type=""></returns>
function purifyJSON(data) {
    return data.replace(/\{"/g, "{'").replace(/\":"/g, "':'").replace(/\"}/g, "'}").replace(/\"/g, "##").replace(/\{'/g, '{"').replace(/\':'/g, '":"').replace(/\','/g, '","').replace(/\'}/g, '"}').replace(/\##/g, "'").replace(/(?:\r\n|\r|\n)/g, '');
}

/// <summary>
/// log writer
/// </summary>
/// <param name="logStr" type="type"> log string</param>
fsi.prototype.log = function (logStr) {
    console.log(logStr);
};

/// <summary>
/// workflow ready method
/// </summary>
/// <returns type="">boolean</returns>
fsi.prototype.WorkflowReady = function () {
    var isPageLoad = false;
    var allControls = $('form, form [data-control-type]');
    var controls = $('form [data-control-type]');
    $.each(allControls, function (a, b) {
        var events = {};
        // List of all events for b control
        var attr = {};
        var execution = "inprocess";
        $.each($(b).get(0).attributes, function (a, b) {
            if (b.name.match(/data-event/)) {
                attr[b.name] = b.value;
            }
            if (b.name.match(/data-event-execution/)) {
                execution = b.value;
            }

        });
        // var outputPara;
        var outputPara = {};
        var outputParaWorkflow = {};
        var outputParaType;
        var workflowEventArr = {};
        workflowEventArr = [];
        var arrPara = {};
        $.each(attr, function (y, u) {
            arrPara = y.split('::');
            workflowEventArr.push(arrPara);
            if (y.indexOf('event::') !== -1 && u !== '') {
                events[arrPara[4]] = JSON.parse(u);
                //outputPara = $(controls).map(function () {
                //    if ($(this).attr('data-control-id').toLowerCase().trim() === arrPara[3].toLowerCase().trim()) return this
                //}).get();
                $(controls).each(function () {
                    var _this = this;
                    var outCotrols = JSON.parse(arrPara[3]);
                    $(outCotrols).each(function (key, value) {
                        var controlId = value.controls.split('_');
                        if (controlId[0] !== '') {
                            if ($(_this).attr('data-control-id').toLowerCase().trim() === controlId[1].toLowerCase().trim()) {
                                outputPara[$(_this).attr('data-control-id')] = value.paraout;
                                outputParaWorkflow[$(_this).attr('data-control-id')] = arrPara[2];
                            }
                        }
                    });
                });
            }
        });
        $.each(events, function (currentEvent, eventParameters) {
            var outputControl = outputPara;
            //var outputControlType = $(outputControl).data('controlType')
            var outputControlType = {};
            for (var key in outputControl) {
                outputControlType[key] = $("[data-control-id=" + key + "]").data('controlType');
            }
            var action = currentEvent.indexOf('page') !== -1 ? currentEvent.split('page')[1] : currentEvent;
            var control = currentEvent.indexOf('page') !== -1 ? window : b;
            isPageLoad = isPageLoad || currentEvent.indexOf('pageload') !== -1;
            $(control).on(action, function (e) {
                $.each(workflowEventArr, function (i, v) {
                    if (v[4] === action) {
                        arrPara = v;
                    }
                });

                if (action === 'click') {
                    $(control).trigger('beforeClick');
                }

                var validBeforeClick = $(e.target).closest('div[data-control-type]').data('validbefore');
                if (!validBeforeClick && validBeforeClick !== undefined) {
                    return;
                }
                e.preventDefault();
                var workflowId = '';
                var para = {};
                $.each(eventParameters, function (aa, bb) {
                    var control = bb['controls'].split('_');
                    var controlValue = '';
                    var controlType = (control[0].indexOf('pageParameters') === 0 ? 'pageParameters' : $("[data-control-id=" + control[1] + "]").data('controlType'));
                    if (controlType === 'pageParameters') {
                        controlValue = $.map((JSON.parse(localStorage.pageParameters)), function (a, b, c) {
                            if (a['key'] === control[1]) { return a['value']; }
                        })[0];
                    }
                    else if (controlType === 'button') {
                        controlValue = $("[data-control-id=" + control[1] + "] [type=button]").text();
                    }
                    else if (controlType === 'textbox') {
                        controlValue = $("[data-control-id=" + control[1] + "] [type=text]").val();
                    }
                    else if (controlType === 'numberbox') {
                        controlValue = $("[data-control-id=" + control[1] + "] [type=number]").val();
                    }
                    else if (controlType === 'radio') {
                        controlValue = fsi.getById(control[1]);
                    }
                    else if (controlType === 'combo') {
                        controlValue = $("[data-control-id=" + control[1] + "] select option:selected").val();
                    }
                    else if (controlType === 'checkbox') {
                        var isChecked = $("[data-control-id=" + control[1] + "] [type=checkbox]").is(':checked');
                        controlValue = isChecked;
                    }
                    else if (controlType === 'text') {
                        controlValue = $("[data-control-id=" + control[1] + "] [type=text]").text();
                    }
                    else if (controlType === 'textarea') {
                        controlValue = $("[data-control-id=" + control[1] + "] textarea").val();
                    }
                    else if (controlType === 'label') {
                        controlValue = $("[data-control-id=" + control[1] + "] label").text().trim();
                    }
                    else if (controlType === 'datalist') {
                        controlValue = $(e.target).parent().find('td:first').html().trim();
                    }
                    else if (controlType === 'grid') {
                        controlValue = $(e.target).parent().attr('id').split('row_')[1];
                        // para[bb['para']] = $(e.target).parent().find('td:first').html().trim()
                    }
                    else if (controlType === 'slider') {
                        controlValue = $("[data-control-id=" + control[1] + "] [type=number]").val();
                    }
                    else if (controlType === 'datepicker') {
                        var dateElement = $("[data-control-id=" + control[1] + "]");
                        var type = dateElement.data('display-format');
                        var dateFormat = dateElement.data('dateformat');
                        var value = dateElement.find('[type=text]').val();
                        if (value === '') {
                            value = "01/01/1970";
                        }
                        controlValue = getDateTimestamp(value, type, dateFormat);
                    }
                    else if (controlType === 'imagepanel') {
                        var imagePanelData = {};
                        imagePanelData.Name = $("[data-control-id=" + control[1] + "]").attr('data-image-name');
                        imagePanelData.Type = $("[data-control-id=" + control[1] + "]").attr('data-image-type');
                        imagePanelData.Size = $("[data-control-id=" + control[1] + "]").attr('data-image-size');
                        imagePanelData.Content = $("[data-control-id=" + control[1] + "]").attr('data-image-content').split(',')[1];
                        controlValue = imagePanelData.Name + ',' + imagePanelData.Type + ',' + imagePanelData.Size + ',' + imagePanelData.Content + ',ImagePanel';
                    }
                    else if (controlType === 'documentlinker') {
                        var fileData = {};
                        fileData.Name = $("[data-control-id=" + control[1] + "]").attr('data-file-name');
                        fileData.Type = $("[data-control-id=" + control[1] + "]").attr('data-file-type');
                        fileData.Size = $("[data-control-id=" + control[1] + "]").attr('data-file-size');
                        fileData.Content = $("[data-control-id=" + control[1] + "]").attr('data-file-content');
                        fileData.FormId = $('form').attr('id');
                        $.each(fileObject, function (key, value) {
                            if (controlValue !== '') {
                                controlValue += ',';
                            }
                            controlValue += $(value).attr('data-file-name') + ',' + $(value).attr('data-file-type') + ',' + $(value).attr('data-file-size') + ',' + $(value).attr('data-file-content') + ',DocumentLinker,' + fileData.FormId + ',' + control[1];

                        });
                        fileObject = [];
                    }
                    else if (controlType === 'htmlpanel') {
                        controlValue = $("[data-control-id=" + control[1] + "]").find('.nicEdit-main').html();
                    }
                    else if (controlType === 'timepicker') {
                        controlValue = $("[data-control-id=" + control[1] + "]").find('input[type="text"]').val();
                    }
                    //---------------------- Set Para Value -----------------------
                    if (controlValue == '' || controlValue == undefined) {
                        para[bb['para']] = bb['staticValue'];
                    }
                    else {
                        para[bb['para']] = controlValue;
                    }
                    //---------------------------------------------
                    if (aa === 0) {
                        workflowId = bb['workflow'];
                    }
                });
                workflowId = arrPara[2];
                para = Object.keys(para).length > 0 ? para : {
                    'NULL': 'NULL'
                };
                var data = {
                    workflow: workflowId, list: para, execution: execution
                };
                var tenantUrl = getTenantUrl();
                var myurl = tenantUrl + '/Web/ExecuteWorkflow';
                $(document).ajaxStop($.unblockUI);
                $.blockUI({
                    message: '<h1><img src="' + loadingImageUrl + 'loader.gif" /> Loading... </h1>'
                });
                $.ajax({
                    cache: false,
                    url: myurl,
                    data: data,
                    type: 'POST',
                    beforeSend: function () {
                    },
                    complete: function () {
                        if (isPageLoad) {
                            renderPage($('form'));
                            multidirection();
                            isPageLoad = false;
                        }
                        if (action === 'click') {
                            setTimeout(function () { $(control).trigger('afterClick'); }, 100);
                        }
                        //checkPageEvents();
                    },
                    success: function (data) {
                        try {
                            var result;
                            if ($.type(data) === 'string') {
                                result = JSON.parse(data);
                            }
                            else {
                                result = data;
                                var errorkey = Object.keys(data);
                                if (errorkey.indexOf("executionError") > -1) {
                                    alert('Workflow: ' + data[errorkey[errorkey.indexOf("executionError")]]);
                                    return false;
                                }
                            }
                            if (Object.keys(result).length > 1) {
                                for (var dataKey in result) {
                                    for (var key in outputControlType) {
                                        if (outputParaWorkflow[key] === workflowId) {
                                            if (outputControlType[key] === 'button' && dataKey.toLowerCase().trim() === outputPara[key].toLowerCase().trim()) {
                                                $("[type=button]", "[data-control-id=" + key + "]").text(arrayToString(result[dataKey]));
                                            }
                                            else if (outputControlType[key] === 'textbox' && dataKey.toLowerCase().trim() === outputPara[key].toLowerCase().trim()) {
                                               $("[type=text]", "[data-control-id=" +key + "]").val(arrayToString(result[dataKey]));

                                            }
                                            else if (outputControlType[key] === 'checkbox' && dataKey.toLowerCase().trim() === outputPara[key].toLowerCase().trim()) {
                                                $("[type=checkbox]", "[data-control-id=" + key + "]").val(JSON.stringify(result[dataKey]));
                                            }
                                            else if (outputControlType[key] === 'text' && dataKey.toLowerCase().trim() === outputPara[key].toLowerCase().trim()) {
                                                $("[type=text]", "[data-control-id=" + key + "]").text(arrayToString(result[dataKey]));
                                            }
                                            else if (outputControlType[key] === 'numberbox' && dataKey.toLowerCase().trim() === outputPara[key].toLowerCase().trim()) {
                                                var ctrlValue = arrayToString(result[dataKey]);
                                                fsi.setById(key, ctrlValue);
                                            }
                                            else if (outputControlType[key] === 'slider' && dataKey.toLowerCase().trim() === outputPara[key].toLowerCase().trim()) {
                                                $("[type=number]", "[data-control-id=" + key + "]").val(arrayToString(result[dataKey]));
                                            }
                                            else if (outputControlType[key] === 'textarea' && dataKey.toLowerCase().trim() === outputPara[key].toLowerCase().trim()) {
                                                $("textarea", "[data-control-id=" + key + "]").val(arrayToString(result[dataKey]));
                                            }
                                            else if (outputControlType[key] === 'htmlpanel' && dataKey.toLowerCase().trim() === outputPara[key].toLowerCase().trim()) {
                                                $("[data-control-id=" + key + "]").find('.nicEdit-main').html(arrayToString(result[dataKey]));
                                            }
                                            else if (outputControlType[key] === 'combo' && dataKey.toLowerCase().trim() === outputPara[key].toLowerCase().trim()) {
                                                var comboData = {};
                                                if ($.type(result[dataKey]) === 'string') {
                                                    var tempComboData = JSON.parse(result[dataKey]);
                                                    var objectKeysw = Object.keys(tempComboData);
                                                    if (objectKeysw.length > 0) {
                                                        comboData = tempComboData[objectKeysw[0]];
                                                    }
                                                }
                                                else {
                                                    comboData = result[dataKey];
                                                }
                                                var html = '';
                                                var fieldString = '';
                                                if (comboData.length > 0) {
                                                    $.each(comboData[0], function (colName, b) {
                                                        if (fieldString === '') {
                                                            fieldString = colName;
                                                        }
                                                        else {
                                                            fieldString += ',' + colName;
                                                        }
                                                    });
                                                    var fields = fieldString.split(',');
                                                    $.each(comboData, function (a, b) {
                                                        if (fields.length > 0) {
                                                            if (fields.length > 1) {
                                                                $("select", "[data-control-id=" + key + "]").append('<option value="' + b[fields[0]] + '">' + b[fields[1]] + '</option>');
                                                            }
                                                            else {
                                                                $("select", "[data-control-id=" + key + "]").append('<option value="' + b[fields[0]] + '">' + b[fields[0]] + '</option>');
                                                            }
                                                        }
                                                    });
                                                    $(".ui-btn-text", "[data-control-id=" + key + "]").html($("select option:selected", "[data-control-id=" + key + "]").text());
                                                }
                                            }
                                            else if (outputControlType[key] === 'label' && dataKey.toLowerCase().trim() === outputPara[key].toLowerCase().trim()) {
                                                $("label", "[data-control-id=" + key + "]").text('');
                                                $("label", "[data-control-id=" + key + "]").text(arrayToString(result[dataKey]));
                                            }
                                            else if (outputControlType[key] === 'datalist' && dataKey.toLowerCase().trim() === outputPara[key].toLowerCase().trim()) {
                                                var datalistData = {};
                                                if ($.type(result[dataKey]) === 'string') {
                                                    var tempDatalistData = JSON.parse(result[dataKey]);
                                                    var objectKeys = Object.keys(tempDatalistData);
                                                    if (objectKeys.length > 0) {
                                                        datalistData = tempDatalistData[objectKeys[0]];
                                                    }
                                                }
                                                else {
                                                    datalistData = result[dataKey];
                                                }
                                                $("[data-control-id=" + key + "]").attr('isBindWorkflow', 'true');
                                                if (datalistData.length > 0) {
                                                    var table = '<div class="row fixed-table" style="height: 299px; padding-bottom: 37px; position:relative;top:-37px;margin-left:0px;"><div id="content-' + key + '" class="table-content"><table data-toggle="table" data-url="data1.json" data-cache="false" data-height="299" class="table table-striped table-fixed-header table-hover tblDataList" style="margin:0px;">';
                                                    if ($("[data-control-id=" + key + "]").data('headervisible').toLowerCase() === 'on') {
                                                        table += '<thead class="header"><tr>';
                                                    }
                                                    else {
                                                        table += '<thead class="header" style="display:none;"><tr>';
                                                    }
                                                    var thCount = 0;
                                                    $.each(datalistData[0], function (colName, b) {
                                                        if ($("[data-control-id=" + key + "]").data('hidefirstcolumn') === 'yes' && thCount === 0) {
                                                            table += ('<th style="display:none;"> ' + colName + '</th>');
                                                        }
                                                        else {
                                                            table += ('<th> ' + colName + '</th>');
                                                        }
                                                        thCount++;
                                                    });
                                                    table += '</tr></thead>';

                                                    table += '<tbody>';
                                                    $.each(datalistData, function (a, row) {
                                                        table += '<tr>';
                                                        var tdCount = 0;
                                                        $.each(row, function (p, rowData) {
                                                            if ($("[data-control-id=" + key + "]").data('hidefirstcolumn') === 'yes' && tdCount === 0) {
                                                                if (rowData !== '' && rowData !== null) {
                                                                    table += ('<td style="display:none;">' + rowData + '</td>');
                                                                }
                                                                else {
                                                                    table += ('<td style="display:none;">&nbsp;</td>');
                                                                }
                                                            }
                                                            else {
                                                                if (rowData !== '' && rowData !== null) {
                                                                    table += ('<td>' + rowData + '</td>');
                                                                }
                                                                else {
                                                                    table += ('<td>&nbsp;</td>');
                                                                }
                                                            }
                                                            tdCount++;
                                                        });
                                                        table += '</tr>';
                                                    });
                                                    table += '</tbody></table></div><div class="fixed-table-pagination"></div></div>';
                                                    $('#tbl_' + $("[data-control-id=" + key + "]").data('control-id')).html(table);
                                                    $('#tbl_' + $("[data-control-id=" + key + "]").data('control-id')).parent().siblings('li').find('.ui-li-count').html(datalistData.length);
                                                    setTimeout(function () {
                                                        // $('.table-fixed-header').fixedHeader();
                                                    }, 100);
                                                    if ($("[data-control-id=" + key + "]").attr('data-redirect-url') !== "select" && $("[data-control-id=" + key + "]").attr('data-redirect-url') !== undefined) {
                                                        fsi.dataListRowClickEvent($("[data-control-id=" + key + "]"), $("[data-control-id=" + key + "]").attr('data-redirect-url'), $("[data-control-id=" + key + "]").attr('data-url'));
                                                    }
                                                }
                                                else {
                                                    var table = '<div class="bootstrap-table"><div class="fixed-table-toolbar"></div>  <div class="fixed-table-container" style="height: 299px; padding-bottom: 37px;"><div class="fixed-table-body"><table data-toggle="table" data-url="data1.json" data-cache="false" data-height="299" class="table table-hover" style="margin-top:0px;"><tr><td>No records found!</td></tr></table></div><div class="fixed-table-pagination"></div></div></div>';
                                                    $('#tbl_' + $("[data-control-id=" + key + "]").data('control-id')).html(table);
                                                }
                                                $("[data-control-id=" + key + "]").find('ul').trigger('rendered');
                                            }
                                            else if (outputControlType[key] === 'grid' && dataKey.toLowerCase().trim() === outputPara[key].toLowerCase().trim()) {
                                                try {
                                                    var gridData = {
                                                    };
                                                    if ($.type(result[dataKey]) === 'string') {
                                                        var tempgridData = JSON.parse(result[dataKey]);
                                                        var objectKeysb = Object.keys(tempgridData);
                                                        if (objectKeysb.length > 0) {
                                                            gridData = tempgridData[objectKeysb[0]];
                                                        }
                                                    }
                                                    else {
                                                        gridData = result[dataKey];
                                                    }
                                                }
                                                catch (e) {
                                                    $.unblockUI();
                                                    alert(gridData + "=> Incorrect data format");
                                                    return;
                                                }

                                                var dynamicColumns = [];
                                                var i = 0;
                                                var colList = '';
                                                $.each(gridData[0], function (key, value) {
                                                    var obj = {
                                                        sTitle: key
                                                    };
                                                    dynamicColumns[i] = obj;
                                                    colList += key + ",";
                                                    i++;
                                                });
                                                //fetch all records from JSON result and make row data set.
                                                var rowDataSet = [];
                                                var rowValue = 0;
                                                $.each(gridData, function (key, value) {
                                                    var rowData = [];
                                                    var j = 0;
                                                    $.each(gridData[i], function (key, value) {
                                                        if (key.toLowerCase() === 'systemid') {
                                                            rowData["DT_RowId"] = "row_" + value;
                                                        }
                                                        rowData[j] = value;
                                                        j++;
                                                    });
                                                    rowDataSet[rowValue] = rowData;
                                                    rowValue++;
                                                });
                                                var tableObj = $('table', $("[data-control-id=" + key + "]"));
                                                setTimeout(function () {
                                                    BindGridWithWorkflow(tableObj[0], rowDataSet, dynamicColumns);
                                                }, 100);
                                            }
                                            else if (outputControlType[key] === "pivot" && dataKey.toLowerCase().trim() === outputPara[key].toLowerCase().trim()) {
                                                var pivotData = {
                                                };
                                                if ($.type(result[dataKey]) === 'string') {
                                                    var tempPivotData = JSON.parse(result[dataKey]);
                                                    var objectKeysc = Object.keys(tempPivotData);
                                                    if (objectKeysc.length > 0) {
                                                        pivotData = tempPivotData[objectKeysc[0]];
                                                    }
                                                }
                                                else {
                                                    pivotData = result[dataKey];
                                                }
                                                //pivot control
                                                $('.pivot-table').each(function () {
                                                    $('#' + this.id).pivotUI(pivotData,
                                        {
                                            rows: '',
                                            cols: ''
                                        });
                                                });
                                            }
                                            else if (outputControlType[key] === 'datepicker' && dataKey.toLowerCase().trim() === outputPara[key].toLowerCase().trim()) {
                                                var pattern = /Date\(([^)]+)\)/;
                                                var dateResults = pattern.exec(arrayToString(result[dataKey]));
                                                var dt = new Date(parseFloat(dateResults[1]));
                                                var formatted = $.datepicker.formatDate("mm/dd/yy", dt);
                                                $("[type=text]", "[data-control-id=" + key + "]").calendarsPicker('setDate', formatted);
                                                $("[type=text]", "[data-control-id=" + key + "]").val(JSON.stringify(result[dataKey]));
                                            }
                                            else if (outputControlType[key] === 'chart' && dataKey.toLowerCase().trim() === outputPara[key].toLowerCase().trim()) {
                                                var chartData = {};
                                                if ($.type(result[dataKey]) === 'string') {
                                                    var tempChartData = JSON.parse(result[dataKey]);
                                                    var objectKeysd = Object.keys(tempChartData);
                                                    if (objectKeysd.length > 0) {
                                                        chartData = tempChartData[objectKeysd[0]];
                                                    }
                                                }
                                                else {
                                                    chartData = result[dataKey];
                                                }
                                                var elementDiv = $("div[data-control-id=" + key + "]");
                                                if (isPageLoad) {
                                                    loadChardOnPageLoad(elementDiv, chartData);
                                                }
                                                else {
                                                    renderChartDataWithWorkflow(elementDiv, chartData);
                                                }
                                            }
                                            else if (outputControlType[key] === 'imagepanel' && dataKey.toLowerCase().trim() === outputPara[key].toLowerCase().trim()) {
                                                $("[data-control-id=" + key + "]").find("[id^=ui-imagepanel-]").css('background-image', 'url(data:image/jpeg;base64,' + imagePanelNodeData(result[dataKey], 'content') + ')');
                                                $("[data-control-id=" + key + "]").attr('data-image-content', 'data:image/jpeg;base64,' + imagePanelNodeData(result[dataKey], 'content'));
                                                $("[data-control-id=" + key + "]").attr('data-image-name', imagePanelNodeData(result[dataKey], 'name'));
                                                $("[data-control-id=" + key + "]").attr('data-image-size', imagePanelNodeData(result[dataKey], ''));
                                            }
                                            else if (outputControlType[key] === 'documentlinker') {
                                                //Document linker-------------------------
                                                if (result[0].CType) {
                                                    if (result[0].CType === 'D') {
                                                        var pattern = /Date\(([^)]+)\)/;
                                                        if (outputParaWorkflow[key] === workflowId) {
                                                            //var divElem = $("[data-control-id=" + key + "]");
                                                            var divElem = $("#tblDocument_" + key);
                                                            divElem.empty();
                                                            var str = '';
                                                            if (result.length > 0) {
                                                                str += "<table class=\"table table-striped table-bordered table-hover table-condensed\">" +
                                                                      "<tr>" +
                                                                          "<th>Version</th>" +
                                                                            "<th>File</th>" +
                                                                          "<th>Creation date</th>" +
                                                                           "<th>Delete</th>" +
                                                                    "</tr>";
                                                                $.each(result, function (i, state) {
                                                                    var docDate = pattern.exec(state.CreateDate)[1];
                                                                    var basePath = location.protocol + "//" + location.host + "/" + location.pathname.split('/').splice(2, 1).join('/');
                                                                    str += "<tr>" +
                                                                              "<td style='width:5%'>" +
                                                                                state.Version +
                                                                               "</td>" +
                                                                                "<td>" +
                                                                                  "<a title='" + state.FileName + "' href='javascript:void(0)' onclick='DownLoadFile(" + state.FileDocumentId + ");'><img style='width:50px;height:44px' src=" + rootImageUrl + "/DocumentsFile.png" + " /></a>" +
                                                                                "</td>" +
                                                                                "<td>" + ToJavaScriptDate(docDate) + "" +
                                                                                "</td>";
                                                                    str += '<td><a href="javascript:void(0)" onclick="DeleteFileFromWorkflow(this,';
                                                                    str += "'" + state.FileDocumentId + "','" + state.FormId + "','" + state.DocumentSystemID + "','" + state.FormControlId + "'";
                                                                    str += ')"><img style="width:26px;height:28px" src="' + rootImageUrl + '/Bin.png" + " /></td></tr>';
                                                                });
                                                                str += "</table>";
                                                            }
                                                            divElem.append(str);
                                                        }
                                                    }
                                                }
                                                //----------------------
                                                //Others control
                                            }
                                        }
                                    }
                                }
                            }
                            else {

                                for (var key in outputControlType) {
                                    if (outputParaWorkflow[key] === workflowId) {
                                        if (outputControlType[key] === 'button') {
                                            $("[type=button]", "[data-control-id=" + key + "]").text(singleKeyToString(data));
                                        }
                                        else if (outputControlType[key] === 'textbox') {
                                            $("[type=text]", "[data-control-id=" + key + "]").val(singleKeyToString(data));
                                        }
                                        else if (outputControlType[key] === 'checkbox') {
                                            $("[type=checkbox]", "[data-control-id=" + key + "]").val(singleKeyToString(data));
                                        }
                                        else if (outputControlType[key] === 'text') {
                                            $("[type=text]", "[data-control-id=" + key + "]").text(singleKeyToString(data));
                                        }
                                        else if (outputControlType[key] === 'numberbox') {
                                            var ctrlValue = singleKeyToString(data);
                                            fsi.setById(key, ctrlValue);
                                        }
                                        else if (outputControlType[key] === 'slider') {
                                            $("[type=number]", "[data-control-id=" + key + "]").val(singleKeyToString(data));
                                        }
                                        else if (outputControlType[key] === 'textarea') {
                                            $("textarea", "[data-control-id=" + key + "]").val(singleKeyToString(data));
                                        }
                                        else if (outputControlType[key] === 'htmlpanel') {
                                            $("[data-control-id=" + key + "]").find('.nicEdit-main').html(singleKeyToString(data));
                                        }
                                        else if (outputControlType[key] === 'label') {
                                            $("label", "[data-control-id=" + key + "]").text('');
                                            $("label", "[data-control-id=" + key + "]").text(singleKeyToString(data));
                                            //$("form").find("[data-control-id=" + key + "]").find('label').html(data)
                                        }
                                        else if (outputControlType[key] === 'combo') {
                                            var comboData = {};
                                            var tempcomboDataData = result;
                                            var objectKeyse = Object.keys(tempcomboDataData);
                                            if (objectKeyse.length > 0) {
                                                try {
                                                    comboData = JSON.parse(tempcomboDataData[objectKeyse[0]]);
                                                }
                                                catch (e) {
                                                    comboData = result;
                                                }
                                            }
                                            var html = '';
                                            var fieldString = '';
                                            if (comboData.Output.length > 0) {
                                                $.each(comboData.Output[0], function (colName, b) {
                                                    if (fieldString === '') {
                                                        fieldString = colName;
                                                    }
                                                    else {
                                                        fieldString += ',' + colName;
                                                    }
                                                });
                                                var fields = fieldString.split(',');
                                                $.each(comboData.Output, function (a, b) {
                                                    if (fields.length > 0) {
                                                        if (fields.length > 1) {
                                                            $("select", "[data-control-id=" + key + "]").append('<option value="' + b[fields[0]] + '">' + b[fields[1]] + '</option>');
                                                        }
                                                        else {
                                                            $("select", "[data-control-id=" + key + "]").append('<option value="' + b[fields[0]] + '">' + b[fields[0]] + '</option>');
                                                        }
                                                    }
                                                });
                                                $(".ui-btn-text", "[data-control-id=" + key + "]").html($("select option:selected", "[data-control-id=" + key + "]").text());
                                            }
                                        }
                                        else if (outputControlType[key] === 'datalist') {
                                            $("[data-control-id=" + key + "]").attr('isBindWorkflow', 'true');
                                            var datalistData = {};
                                            var tempdatalistData = result;
                                            var objectKeysf = Object.keys(tempdatalistData);
                                            if (objectKeysf.length > 0) {
                                                try {
                                                    datalistData = JSON.parse(tempdatalistData[objectKeysf[0]]);
                                                }
                                                catch (e) {
                                                    $.unblockUI();
                                                    datalistData = result;
                                                }
                                            }
                                            if (datalistData.Output.length > 0) {
                                                var table = '<div class="row fixed-table" style="height: 299px; padding-bottom: 37px; position:relative;top:-37px;margin-left:0px;"><div id="content-' + key + '" class="table-content"><table data-toggle="table" data-url="data1.json" data-cache="false" data-height="299" class="table table-striped table-fixed-header table-hover tblDataList" style="margin:0px;">';
                                                if ($("[data-control-id=" + key + "]").data('headervisible').toLowerCase() === 'on') {
                                                    table += '<thead class="header"><tr>';
                                                }
                                                else {
                                                    table += '<thead class="header" style="display:none;"><tr>';
                                                }
                                                var thCount = 0;
                                                $.each(datalistData.Output[0], function (colName, b) {
                                                    if ($("[data-control-id=" + key + "]").data('hidefirstcolumn') === 'yes' && thCount === 0) {
                                                        table += ('<th style="display:none;"> ' + colName + '</th>');
                                                    }
                                                    else {
                                                        table += ('<th> ' + colName + '</th>');
                                                    }
                                                    thCount++;
                                                });
                                                table += '</tr></thead>';

                                                table += '<tbody>';
                                                $.each(datalistData.Output, function (a, row) {
                                                    table += '<tr>';
                                                    var tdCount = 0;
                                                    $.each(row, function (p, rowData) {
                                                        if ($("[data-control-id=" + key + "]").data('hidefirstcolumn') === 'yes' && tdCount === 0) {
                                                            if (rowData !== '' && rowData !== null) {
                                                                table += ('<td style="display:none;">' + rowData + '</td>');
                                                            }
                                                            else {
                                                                table += ('<td style="display:none;">&nbsp;</td>');
                                                            }
                                                        }
                                                        else {
                                                            if (rowData !== '' && rowData !== null) {
                                                                table += ('<td>' + rowData + '</td>');
                                                            }
                                                            else {
                                                                table += ('<td>&nbsp;</td>');
                                                            }
                                                        }
                                                        tdCount++;
                                                    });
                                                    table += '</tr>';
                                                });
                                                table += '</tbody></table></div><div class="fixed-table-pagination"></div></div>';
                                                $('#tbl_' + $("[data-control-id=" + key + "]").data('control-id')).html(table);
                                                $('#tbl_' + $("[data-control-id=" + key + "]").data('control-id')).parent().siblings('li').find('.ui-li-count').html(datalistData.Output.length);
                                                setTimeout(function () {
                                                    // $('.table-fixed-header').fixedHeader();
                                                }, 100);

                                                if ($("[data-control-id=" + key + "]").attr('data-redirect-url') !== "select" && $("[data-control-id=" + key + "]").attr('data-redirect-url') !== undefined) {
                                                    fsi.dataListRowClickEvent($("[data-control-id=" + key + "]"), $("[data-control-id=" + key + "]").attr('data-redirect-url'), $("[data-control-id=" + key + "]").attr('data-url'));
                                                }
                                            }
                                            else {
                                                var table = '<div class="bootstrap-table"><div class="fixed-table-toolbar"></div>  <div class="fixed-table-container" style="height: 299px; padding-bottom: 37px;"><div class="fixed-table-body"><table data-toggle="table" data-url="data1.json" data-cache="false" data-height="299" class="table table-hover" style="margin-top:0px;"><tr><td>No records found!</td></tr></table></div><div class="fixed-table-pagination"></div></div></div>';
                                                $('#tbl_' + $("[data-control-id=" + key + "]").data('control-id')).html(table);
                                            }
                                        }
                                        else if (outputControlType[key] === 'grid') {
                                            var path = location.protocol + '//' + (location.host.match('localhost') ? location.host : location.host + '/FSITenant');
                                            try {
                                                var gridData = {
                                                };
                                                var tempgridDataData = result;
                                                var objectKeysg = Object.keys(tempgridDataData);
                                                if (objectKeysg.length > 0) {
                                                    try {
                                                        gridData = JSON.parse(tempgridDataData[objectKeysg[0]]);
                                                    }
                                                    catch (e) {
                                                        $.unblockUI();
                                                        gridData = result;
                                                    }
                                                }
                                            }
                                            catch (e) {
                                                $.unblockUI();
                                                alert(gridData + "=> Incorrect data format");
                                                return;
                                            }
                                            //var table = '';
                                            //var thead = "<thead>";
                                            //$.each(gridData.Output[0], function (key, value) {
                                            //    thead += "<th  class='sorting'>" + key + "</th>";
                                            //});
                                            //thead += "</thead>";

                                            //table = thead+'<tbody>';
                                            //$.each(gridData.Output, function (index, node) {
                                            //    table += '<tr>';
                                            //    $.each(node, function (key, value) {                                              
                                            //        table += ('<td>' + (value === null ? '' : value) + '</td>');
                                            //    });
                                            //    table += '</tr>';
                                            //});                                       
                                            //table += '</tbody>';
                                            var dynamicColumns = [];
                                            var i = 0;
                                            var colList = '';
                                            $.each(gridData.Output[0], function (key, value) {
                                                var obj = {
                                                    sTitle: key
                                                };
                                                dynamicColumns[i] = obj;
                                                colList += key + ",";
                                                i++;
                                            });
                                            //fetch all records from JSON result and make row data set.
                                            var rowDataSet = [];
                                            var i = 0;
                                            $.each(gridData.Output, function (key, value) {
                                                var rowData = [];
                                                var j = 0;
                                                $.each(gridData.Output[i], function (key, value) {
                                                    if (key.toLowerCase() === 'systemid') {
                                                        rowData["DT_RowId"] = "row_" + value;
                                                    }
                                                    rowData[j] = value;
                                                    j++;
                                                });
                                                rowDataSet[i] = rowData;
                                                i++;
                                            });

                                            var tableObj = $('table', $("[data-control-id=" + key + "]"));
                                            BindGridWithWorkflow(tableObj[0], rowDataSet, dynamicColumns);
                                        }
                                        else if (outputControlType[key] === "pivot") {
                                            var pivotData = {
                                            };
                                            var temppivotDataData = result;
                                            var objectKeysh = Object.keys(temppivotDataData);
                                            if (objectKeysh.length > 0) {
                                                try {
                                                    pivotData = JSON.parse(temppivotDataData[objectKeysh[0]]);
                                                }
                                                catch (e) {
                                                    $.unblockUI();
                                                    pivotData = result;
                                                }
                                            }

                                            //pivot control
                                            $('.pivot-table').each(function () {
                                                $('#' + this.id).pivotUI(pivotData,
                            {
                                rows: '',
                                cols: ''
                            });

                                            });
                                        }
                                        else if (outputControlType[key] === 'datepicker') {
                                            var pattern = /Date\(([^)]+)\)/;
                                            var dateResults = pattern.exec(singleKeyToString(data));
                                            var dt = new Date(parseFloat(dateResults[1]));
                                            var formatted = $.datepicker.formatDate("mm/dd/yy", dt);
                                            $("[type=text]", "[data-control-id=" + key + "]").calendarsPicker('setDate', formatted);
                                            $("[type=text]", "[data-control-id=" + key + "]").val(formatted);
                                        }
                                        else if (outputControlType[key] === 'chart') {
                                            var chartData = {};
                                            var tempchartDataData = result;
                                            var objectKeysi = Object.keys(tempchartDataData);
                                            if (objectKeysi.length > 0) {
                                                try {
                                                    chartData = JSON.parse(tempchartDataData[objectKeysi[0]]);
                                                }
                                                catch (e) {
                                                    $.unblockUI();
                                                    chartData = result;
                                                }
                                            }
                                            var elementDiv = $("div[data-control-id=" + key + "]");
                                            if (isPageLoad) {
                                                loadChardOnPageLoad(elementDiv, chartData.Output);
                                            }
                                            else {
                                                renderChartDataWithWorkflow(elementDiv, chartData.Output);
                                            }
                                        }
                                        else if (outputControlType[key] === 'imagepanel') {
                                            $("[data-control-id=" + key + "]").find("[id^=ui-imagepanel-]").css('background-image', 'url(data:image/jpeg;base64,' + imagePanelNodeData(data, 'content') + ')');
                                            $("[data-control-id=" + key + "]").attr('data-image-content', 'data:image/jpeg;base64,' + imagePanelNodeData(data, 'content'));
                                            $("[data-control-id=" + key + "]").attr('data-image-name', imagePanelNodeData(data, 'name'));
                                            $("[data-control-id=" + key + "]").attr('data-image-size', imagePanelNodeData(data, ''));
                                        }
                                        else if (outputControlType[key] === 'documentlinker') {
                                            //Document linker-------------------------
                                            if (result[0].CType) {
                                                if (result[0].CType === 'D') {
                                                    var pattern = /Date\(([^)]+)\)/;
                                                    if (outputParaWorkflow[key] === workflowId) {
                                                        //var divElem = $("[data-control-id=" + key + "]");
                                                        var divElem = $("#tblDocument_" + key);
                                                        divElem.empty();
                                                        var str = '';
                                                        if (result.length > 0) {
                                                            str += "<table class=\"table table-striped table-bordered table-hover table-condensed\">" +
                                                                  "<tr>" +
                                                                      "<th>Version</th>" +
                                                                        "<th>File</th>" +
                                                                      "<th>Creation date</th>" +
                                                                       "<th>Delete</th>" +
                                                                "</tr>";
                                                            $.each(result, function (i, state) {
                                                                var docDate = pattern.exec(state.CreateDate)[1];
                                                                var basePath = location.protocol + "//" + location.host + "/" + location.pathname.split('/').splice(2, 1).join('/');
                                                                str += "<tr>" +
                                                                          "<td style='width:5%'>" +
                                                                            state.Version +
                                                                           "</td>" +
                                                                            "<td>" +
                                                                              "<a title='" + state.FileName + "' href='javascript:void(0)' onclick='DownLoadFile(" + state.FileDocumentId + ");'><img style='width:50px;height:44px' src=" + rootImageUrl + "/DocumentsFile.png" + " /></a>" +
                                                                            "</td>" +
                                                                            "<td>" + ToJavaScriptDate(docDate) + "" +
                                                                            "</td>";
                                                                str += '<td><a href="javascript:void(0)" onclick="DeleteFileFromWorkflow(this,';
                                                                str += "'" + state.FileDocumentId + "','" + state.FormId + "','" + state.DocumentSystemID + "','" + state.FormControlId + "'";
                                                                str += ')"><img style="width:26px;height:28px" src="' + rootImageUrl + '/Bin.png" + " /></td></tr>';
                                                            });
                                                            str += "</table>";
                                                        }
                                                        divElem.append(str);
                                                    }
                                                }
                                            }
                                            //----------------------
                                            //Others control
                                        }

                                    }
                                }
                            }
                        }
                        catch (e) {
                            $.unblockUI();
                            for (var key in outputControlType) {
                                if (outputParaWorkflow[key] === workflowId) {
                                    if (outputControlType[key] === 'button') {
                                        $("[type=button]", "[data-control-id=" + key + "]").text(singleKeyToString(data));
                                    }
                                    else if (outputControlType[key] === 'textbox') {
                                        $("[type=text]", "[data-control-id=" + key + "]").val(singleKeyToString(data));
                                    }
                                    else if (outputControlType[key] === 'checkbox') {
                                        $("[type=checkbox]", "[data-control-id=" + key + "]").val(singleKeyToString(data));
                                    }
                                    else if (outputControlType[key] === 'text') {
                                        $("[type=text]", "[data-control-id=" + key + "]").text(singleKeyToString(data));
                                    }
                                    else if (outputControlType[key] === 'numberbox') {
                                        $("[type=number]", "[data-control-id=" + key + "]").val(singleKeyToString(data));
                                    }
                                    else if (outputControlType[key] === 'textarea') {
                                        $("textarea", "[data-control-id=" + key + "]").val(singleKeyToString(data));
                                    }
                                    else if (outputControlType[key] === 'htmlpanel') {
                                        $("[data-control-id=" + key + "]").find('.nicEdit-main').html(singleKeyToString(data));
                                    }
                                    else if (outputControlType[key] === 'label') {
                                        $("form").find("[data-control-id=" + key + "]").find('label').html('');
                                        $("form").find("[data-control-id=" + key + "]").find('label').html(singleKeyToString(data));
                                        //$("lable", "[data-control-id=" + key + "]").text(data);
                                    }
                                    else if (outputControlType[key] === 'datepicker') {
                                        var pattern = /Date\(([^)]+)\)/;
                                        var dateResults = pattern.exec(singleKeyToString(data));
                                        var dt = new Date(parseFloat(dateResults[1]));
                                        var formatted = $.datepicker.formatDate("mm/dd/yy", dt);
                                        $("[type=text]", "[data-control-id=" + key + "]").calendarsPicker('setDate', formatted);
                                        $("[type=text]", "[data-control-id=" + key + "]").val(formatted);
                                    }
                                    else if (outputControlType[key] === 'grid') {
                                        console.log(e);
                                    }
                                    else if (outputControlType[key] === 'imagepanel') {
                                        $("[data-control-id=" + key + "]").find("[id^=ui-imagepanel-]").css('background-image', 'url(data:image/jpeg;base64,' + imagePanelNodeData(data, 'content') + ')');
                                        $("[data-control-id=" + key + "]").attr('data-image-content', 'data:image/jpeg;base64,' + imagePanelNodeData(data, 'content'));
                                        $("[data-control-id=" + key + "]").attr('data-image-name', imagePanelNodeData(data, 'name'));
                                        $("[data-control-id=" + key + "]").attr('data-image-size', imagePanelNodeData(data, ''));
                                    }
                                }
                            }
                        }
                    },
                    error: function (a, b, c) {
                        $.unblockUI();
                        alert(a);
                    }
                });
            });
        });
    });
    return isPageLoad;
};

/// <summary>
/// load chard on page load
/// </summary>
/// <param name="elementDiv" type="type">element div</param>
/// <param name="chartData" type="type">chart data</param>
function loadChardOnPageLoad(elementDiv, chartData) {
    setTimeout(function () {
        renderChartDataWithWorkflow(elementDiv, chartData);
    }, 100);
};

/// <summary>
/// array to string
/// </summary>
/// <param name="arrayData" type="type"> array data</param>
/// <returns type="">string</returns>
function arrayToString(arrayData) {

    if ($.isArray(arrayData)) {
        if (arrayData.length > 0 && Object.keys(arrayData[0]).length > 0) {
            var objectkeysj = Object.keys(arrayData[0]);
            return arrayData[0][objectkeysj[0]];
        }
        else if (arrayData.length > 0 && $.isArray(arrayData[0])) {
            arrayToString(arrayData[0]);
        }
        return arrayData[0];
    }
    else {
        try {
            if (isNaN(arrayData)) {
                var resultData = JSON.parse(arrayData);
                var key = Object.keys(resultData);
                return arrayToString(resultData[key[0]]);
            }
            else {
                return arrayData;
            }
        }
        catch (e) {
            return arrayData;
        }
    }
    return arrayData;
}


/// <summary>
/// single key to string
/// </summary>
/// <param name="keyData" type="type">key data</param>
/// <returns type=""></returns>
function singleKeyToString(keyData) {
    if ($.type(keyData) === 'object') {
        var result;
        var key = Object.keys(keyData);
        if ($.type(keyData[key[0]]) === 'string') {
            try {
                var nestedKeyData = JSON.parse(keyData[key[0]]);
                var nkey = Object.keys(nestedKeyData);
                if ($.type(nestedKeyData[nkey[0]]) === 'array') {
                    result = arrayToString(nestedKeyData[nkey[0]]);
                }
            }
            catch (e) {
                result = keyData[key[0]];
            }

        }
        else if ($.type(keyData[key[0]]) === 'object') {
            result = keyData[key[0]];
        }
        else if ($.type(keyData[key[0]]) === 'number') {
            result = keyData[key[0]];
        }
        return result;
    }
    else {
        return keyData;
    }
}

/// <summary>
/// image panel node data
/// </summary>
/// <param name="nodeData" type="type">node data</param>
/// <param name="type" type="type">type</param>
/// <returns type=""></returns>
function imagePanelNodeData(nodeData, type) {
    try {
        var jsonData = JSON.parse(nodeData);
        if (type === 'content') {
            return jsonData[0].Content;
        }
        else if (type === 'name') {
            return jsonData[0].FileName;
        }
        else {
            return jsonData[0].Length;
        }
    }
    catch (e) {
        return;
    }

}

/// <summary>
/// add grid filter
/// </summary>
/// <param name="ctrlSelector" type="type">control selector </param>
/// <param name="gridSelector" type="type">grid selector</param>
fsi.prototype.addGridFilter = function (ctrlSelector, gridSelector) {
    $(ctrlSelector).on('change', function (event) {
        $('form').off('submit');
        $('form').on('submit', function () {
            return false;
        });
        fsi.gridFilterList = [];
        var filterComponent = 'null';
        var getctrlSelector;
        if (gridSelector.data('filter-component')) {
            filterComponent = gridSelector.data('filter-component');
            for (var i = 0; i < filterComponent.length; i++) {
                var where = {
                    ColumnName: '',
                    ColumnValue: '',
                    Condition: '',
                    Operator: '',
                    DataType: ''
                };
                getctrlSelector = $('#' + filterComponent[i].component);
                var filterControlValue = fsi.getById(filterComponent[i].component);
                if (filterControlValue !== undefined && filterControlValue != null && filterControlValue !== '') {
                    if (filterControlValue != null && filterControlValue !== '') {
                        where['ColumnName'] = filterComponent[i].source;
                        where['Condition'] = filterComponent[i].filterCondition;
                        where['Operator'] = filterComponent[i].operation;
                        if ($('#' + filterComponent[i].component).closest('div[data-control-id]').data('control-type') === 'datepicker') {
                            where['DataType'] = 'datetime';
                            var ctrlSelectorParent = getctrlSelector.closest('div[data-control-type]');
                            var type = $(ctrlSelectorParent).data('display-format');
                            var dateFormat = $(ctrlSelectorParent).data('dateformat');
                            filterControlValue = getDateTimestamp(getctrlSelector.val(), type, dateFormat);
                        }
                        where['ColumnValue'] = filterControlValue;
                        fsi.gridFilterList.push(where);
                    }
                    else if ($('#' + filterComponent[i].component).parents('div[data-control-id="' + filterComponent[i].component + '"]').data('control-type') !== undefined && $('#' + filterComponent[i].component).parents('div[data-control-id="' + filterComponent[i].component + '"]').data('control-type').trim() === 'label' && getctrlSelector.text() != '') {
                        where['ColumnName'] = filterComponent[i].source;
                        where['Condition'] = filterComponent[i].filterCondition;
                        where['Operator'] = filterComponent[i].operation;
                        where['ColumnValue'] = filterControlValue;
                        fsi.gridFilterList.push(where);
                    }
                    else {
                        where['ColumnName'] = filterComponent[i].source;
                        where['ColumnValue'] = filterComponent[i].filterStaticValue;
                        where['Condition'] = filterComponent[i].filterCondition;
                        where['Operator'] = filterComponent[i].operation;
                        fsi.gridFilterList.push(where);
                    }
                }
                else {
                    if (filterComponent[i].filterStaticValue !== undefined && filterComponent[i].filterStaticValue !== null && filterComponent[i].filterStaticValue !== '') {
                        where['ColumnName'] = filterComponent[i].source;
                        where['ColumnValue'] = filterComponent[i].filterStaticValue;
                        where['Condition'] = filterComponent[i].filterCondition;
                        where['Operator'] = filterComponent[i].operation;
                        fsi.gridFilterList.push(where);
                    }
                }
            }
        }
        var table = $('table', gridSelector).DataTable();
        $('table', gridSelector).trigger('filtered');
        if ($('table', gridSelector).attr('paging') === 'client') {
            fsi.refreshGrid($('table', gridSelector)[1]);
        } else {
            table.draw();
        }
    });
};

/// <summary>
/// grid relation data
/// </summary>
fsi.prototype.gridRelationData = {};

/// <summary>
/// grid columns
/// </summary>
fsi.prototype.gridColumns = [];
/// <summary>
/// grid filter list
/// </summary>
fsi.prototype.gridFilterList = [];

/// <summary>
/// load once
/// </summary>
fsi.prototype.loadOnce = '';

/// <summary>
/// render grid
/// </summary>
/// <param name="element" type="type">element </param>
/// <param name="type" type="type">type</param>
renderGrid = function (element, type) {
    $('table', element).html('');
    var url = getTenantUrl() + '/Test/DataObjectColumnInfo';
    //$.blockUI({ message: '<h1><img src="' + loadingImageUrl + 'loader.gif" /> Loading... </h1>' });
    //$('.gridContainer').block({
    //    message: '<h1><img src="' + loadingImageUrl + 'loader.gif" /> Loading... </h1>',
    //    /*css: { border: '3px solid #a00' },*/
    //    overlayCSS: { opacity: 0.2, cursor: 'wait' }
    //});
    $.get(url, {
        tableName: $('table', element).data('table'), properties: element.data('object-properties')
    }, function (data) {
        fsi.gridFilterList = [];
        fsi.gridColumns = data.Fields;
        fsi.gridRelationData = data.RefrenceTableData;
        var filterComponent = 'null';
        var ctrlSelector;
        if (element.data('filter-component')) {
            filterComponent = element.data('filter-component');
            for (var i = 0; i < filterComponent.length; i++) {
                var where = {
                    ColumnName: '',
                    ColumnValue: '',
                    Condition: '',
                    Operator: '',
                    DataType: ''
                };
                if ($('#' + filterComponent[i].component).closest('div [data-control-type]').attr('data-control-type') === 'datepicker') {
                    ctrlSelector = $('#' + filterComponent[i].component);
                    $(ctrlSelector).off('blur');
                    $(ctrlSelector).off('change', fsi.addGridFilter(ctrlSelector, element));
                    $(ctrlSelector).on('change', fsi.addGridFilter(ctrlSelector, element));
                }
                else if ($('#' + filterComponent[i].component).closest('div [data-control-type]').attr('data-control-type') === 'combo') {
                    ctrlSelector = $('#' + filterComponent[i].component);
                    $(ctrlSelector).off('change', fsi.addGridFilter(ctrlSelector, element));
                    $(ctrlSelector).on('change', fsi.addGridFilter(ctrlSelector, element));
                    $(ctrlSelector).on('change', function () {
                        $(this).siblings('span').find('.ui-btn-text').html('<span>' + $(this).find('option:selected').text() + '</span>');
                    });
                }
                else {
                    ctrlSelector = $('#' + filterComponent[i].component);
                    $(ctrlSelector).on('keydown keyup', function (event) {
                        if (event.keyCode === 13) {
                            $(element).focus();
                            return false;
                        }

                    });
                    $(ctrlSelector).off('change', fsi.addGridFilter(ctrlSelector, element));
                    $(ctrlSelector).on('change', fsi.addGridFilter(ctrlSelector, element));
                }
                var filterControlValue = fsi.getById(filterComponent[i].component);
                if (filterControlValue !== undefined && filterControlValue !== null && filterControlValue !== '') {
                    if (filterControlValue != null && filterControlValue !== '') {
                        where['ColumnName'] = filterComponent[i].source;
                        where['Condition'] = filterComponent[i].filterCondition;
                        where['Operator'] = filterComponent[i].operation;
                        if ($('#' + filterComponent[i].component).closest('div[data-control-id]').data('control-type') === 'datepicker') {
                            where['DataType'] = 'datetime';
                            var ctrlSelectorParent = ctrlSelector.closest('div[data-control-type]');
                            var type = $(ctrlSelectorParent).data('display-format');
                            var dateFormat = $(ctrlSelectorParent).data('dateformat');
                            filterControlValue = getDateTimestamp(ctrlSelector.val(), type, dateFormat);
                        }
                        where['ColumnValue'] = filterControlValue;
                        fsi.gridFilterList.push(where);
                    }
                    else if ($('#' + filterComponent[i].component).parents('div[data-control-id="' + filterComponent[i].component + '"]').data('control-type') !== undefined && $('#' + filterComponent[i].component).parents('div[data-control-id="' + filterComponent[i].component + '"]').data('control-type').trim() === 'label' && ctrlSelector.text() !== '') {
                        where['ColumnName'] = filterComponent[i].source;
                        where['Condition'] = filterComponent[i].filterCondition;
                        where['Operator'] = filterComponent[i].operation;
                        where['ColumnValue'] = filterControlValue;
                        fsi.gridFilterList.push(where);
                    }
                    else {
                        where['ColumnName'] = filterComponent[i].source;
                        where['ColumnValue'] = filterComponent[i].filterStaticValue;
                        where['Condition'] = filterComponent[i].filterCondition;
                        where['Operator'] = filterComponent[i].operation;
                        fsi.gridFilterList.push(where);
                    }
                }
                else {
                    if (filterComponent[i].filterStaticValue !== undefined && filterComponent[i].filterStaticValue !== null && filterComponent[i].filterStaticValue !== '') {
                        where['ColumnName'] = filterComponent[i].source;
                        where['ColumnValue'] = filterComponent[i].filterStaticValue;
                        where['Condition'] = filterComponent[i].filterCondition;
                        where['Operator'] = filterComponent[i].operation;
                        fsi.gridFilterList.push(where);
                    }
                }
            }
        }
        applyDataTable($('table', element));
        //  $('.gridContainer').unblock();
    }).fail(function () {
        // $('.gridContainer').unblock();
    }).always(function () {
        //$('.gridContainer').unblock();
    });
}



/// <summary>
/// validate Email
/// </summary>
/// <param name="validateEmail" type="type">Control Value</param>
fsi.prototype.validateEmail = function (controlvalue) {
    var expr = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
    var pattern = new RegExp(expr);
    return pattern.test(controlvalue);
}




/// <summary>
/// refresh grid
/// </summary>
/// <param name="tableObj" type="type">table object</param>
fsi.prototype.refreshGrid = function (tableObj) {
    //refresh the table
    try {
        var geturl = getTenantUrl() + '/Test/Get';
        $.fn.dataTable.ext.errMode = 'none';
        //$(tableObj).on('error.dt', function (e, settings, techNote, message) {
        //    console.log('An error has been reported by DataTables: ', message);
        //});
        var oTable = $(tableObj).dataTable();
        var oSettings = oTable.fnSettings();
        oTable.fnReloadAjax(geturl, null, true);
    }
    catch (ex) {
        console.log('session time out');
    }
}

/// <summary>
/// refresh data grid
/// </summary>
/// <param name="tableObj" type="type">table object</param>
//refresh the table
fsi.prototype.refreshDataGrid = function (tableObj) {
    var geturl = getTenantUrl() + '/Test/Get';
    var oTable = $('#' + tableObj).dataTable();
    var oSettings = oTable.fnSettings();
    oTable.fnReloadAjax(geturl, null, true);
}

/// <summary>
/// refresh combo
/// </summary>
/// <param name="controldId" type="type">controld id</param>
/// <param name="intialData" type="type">intial data</param>
fsi.prototype.refreshCombo = function (controldId, intialData) {
    var element = $('#' + controldId).closest("[data-control-type^='combo']");
    var filterControl = element.attr('data-filter-control');
    if (filterControl) {
        $('#' + filterControl).on('change', function () {
            fillCombo(element, intialData);
        });
        fillCombo(element, intialData);
    }
    else {
        fillCombo(element, intialData);
    }
    $(element).find('.ui-icon').on("click", function () {
        $(element).find('.ui-btn-corner-all').trigger('click');
    });
    $(element).find('.ui-btn-text').children().on("click", function (e) {
        $(this).parent().trigger('click');
    });
}

/// <summary>
/// show document pop up
/// </summary>
/// <param name="systemId" type="type">system id</param>
function ShowDocumentPopUp(systemId) {
    fsi.selectDataObjectForDocumentLinker(systemId, 0, '', function (data) {
        var divElem = document.getElementById('tblDocumentPopUp');
        if (divElem) {
            $("#tblDocumentPopUp").remove();
        }
        divElem = document.createElement('div');
        divElem.id = 'tblDocumentPopUp';
        //divElem.className = 'modal-body';
        divElem.title = "documents";
        var str = '';
        if (data.length > 0) {
            var pattern = /Date\(([^)]+)\)/;

            //$("#tblDocument").attr({ "class": "modal fade", "role": "dialog" });
            str += "<div class='popup-overlay'></div>"
            str += "<div class='open-popup'><div  class='title'>Documents</div><div class='close'>x</div>"
            str += "<table class=\"table table-striped table-bordered table-hover table-condensed\" style=\"width: 100%\">" +
                  "<tr>" +
                      "<th>Version</th>" +
                        "<th>File</th>" +
                      "<th>Creation date</th>" +
                                         "</tr>";
            $.each(data, function (i, state) {
                var docDate = pattern.exec(state.CreateDate)[1];
                var basePath = location.protocol + "//" + location.host + "/" + location.pathname.split('/').splice(2, 1).join('/');

                str += "<tr>" +
                          "<td style='width:5%'>" +
                            state.Version +
                           "</td>" +
                            "<td>" +
                              "<a title='" + state.FileName + "' href='javascript:void(0)' onclick='DownLoadFile(" + state.FileDocumentId + ");'><img style='width:50px;height:44px' src=" + state.imagesURL + "/DocumentsFile.png" + " /></a>" +
                            "</td>" +
                             "<td>" + ToJavaScriptDate(docDate) + "" +
                            "</td>";
                '</tr>';
            });
            str += "</table></div>";
        }
        divElem.innerHTML = str;
        document.getElementsByTagName("body")[0].appendChild(divElem);

        $(".docCountTd").on("click", function () {
            $("#tblDocumentPopUp").fadeIn(500);
        })
        $(".open-popup .close, .popup-overlay").on("click", function () {
            $("#tblDocumentPopUp").fadeOut(500);
            $("#tblDocumentPopUp").remove();
        });
    });
}
var selectedRow = '';

/// <summary>
/// bind grid with data object
/// </summary>
/// <param name="tableObj" type="type">table object</param>
/// <param name="bindingtype" type="type">binding type</param>
var applyDataTable = function (tableObj, bindingtype) {
    var colList = '';
    var isCheckboxEnable = -1;
    var headerVisible = '';
    attributes = {};
    $.each(tableObj.get(0).attributes, function (i, attrib) {
        attributes[attrib.name] = attrib.value;
    });
    attributes["dataobjectpropertiesdatalist"] = JSON.parse(attributes["dataobjectpropertiesdatalist"]);
    if (attributes["data-pagedocument"] === 'show') {
        var docLabel = '';
        if (attributes['data-pageDocumentLable'])
            docLabel = attributes['data-page-document-lable'];
        attributes["dataobjectpropertiesdatalist"].push({ name: attributes['data-page-document-lable'], type: 'int', value: 'docCount' });
    }
    // set load once attribute value...
    if (attributes["isshowexport"] === 'true') {
        fsi.loadOnce = attributes["data-loadonce"];
    }
    else {
        fsi.loadOnce = 'off';
    }
    var tableHeight = tableObj.parent().prop('style')['height'];
    $(tableObj).css('height', 'auto');
    //set fixed height
    var fixedHeight = true;
    if (attributes["data-fixedheight"] === 'no') {
        fixedHeight = false;
    }

    if ((attributes.isshowpaging === 'false')) {
        if (tableHeight !== undefined) {
            tableHeight = parseInt(tableHeight) - 31;
        }
    }
    var tableWidth = tableObj.parent().prop('style')['width'];
    $(tableObj).parent().css('height', 'auto');
    if ((attributes.isshowpaging === 'false')) {
        $(tableObj).parent().css('overflow-x', '');
    }
    var columns = []; var fields = [];

    if (attributes.isshowheader === 'false') {
        headerVisible = "style='display:none;'";
    }
    var thead = "<thead  class='vertical-border' " + headerVisible + ">";
    thead += "<tr>";
    var sortColArr = [];
    var selectType = 'os';
    if (attributes['data-checkbox'] === 'true') {
        columns.push({
            data: null,
            render: function (data, type, row) {
                if (type === 'display') {
                    return '<input type="checkbox" class="editor-active">';
                }
                return data;
            },
            aoColumnDefs: [
                { "width": "30px", targets: [0] }
            ],
            className: "dt-body-left",
            orderable: false,
            targets: 0,
            orderable: false
        });
        thead += "<th id='chekbox-col' style='width:30px !important;' class='sorting'></th>";
        isCheckboxEnable = 1;
        selectType = 'multi';
    }

    var duplicateColumn = [];
    var colList = [];
    try {
        $.each(attributes["dataobjectpropertiesdatalist"], function (i, data) {
            if (data.value) {
                if ($.inArray(data.value, colList) === -1) {
                    colList.push(data.value);
                } else {
                    //  duplicateColumn.push(data.value);
                    attributes["dataobjectpropertiesdatalist"].splice(i, 1);
                }
            }
        });
    }
    catch (e) {
    }
    $.each(attributes["dataobjectpropertiesdatalist"], function (a, b) {
        if (attributes['data-sort-column'] === b.value) {
            sortColArr.push([a, attributes['data-sort-order']]);
        }
        var ob = {
        };
        $.each(attributes['dataobjectpropertiesdatalist'], function (x, y) {
            if (y['value'] === b.value) {
                ob = y;
            }
        });

        var editOb = {
            label: ((b.name === undefined || b.name === '' || b.name === null) ? b.value : b.name) + " : ", name: b.value
        };
        switch (ob['type']) {
            case 'bit':
                editOb.type = "checkbox";
                editOb.separator = "|";
                editOb.options = [
                    {
                        label: '', value: 1
                    }
                ]
                func = function (data, type, row, pos) {
                    var ctrl = '';
                    if (type === 'display') {

                        if (data === false || data === 0 || data === null || data === undefined) {
                            ctrl = '<input type="checkbox" disabled="disabled" class="editor-active"/>';
                        } else {
                            ctrl = '<input type="checkbox" disabled="disabled"  checked="true" />';
                        }
                        return ctrl;
                    }
                    return '';
                }
                break;
            case 'nvarchar':
                func = function (a, b, c, d) {
                    return a;
                }
                break;
            case 'datetime':
                $.each(fsi.gridColumns.Fields, function (key, value) {
                    if (value.Name === ob.value) {
                        if (ob.format === 'timeformat') {
                            editOb.type = "date";      //Still Have some Editor Problems for handling DateTime
                            editOb.subType = "time";
                            func = function (a, b, c, d) {
                                if (a !== undefined && a !== null) {
                                    var dateString = a.substr(6);
                                    var currentTime = new Date(parseInt(dateString));
                                    var hours = currentTime.getHours();
                                    var minutes = currentTime.getMinutes();
                                    if (minutes < 10) {
                                        minutes = '0' + minutes;
                                    }
                                    var time = (hours > 12) ? (hours - 12 + ':' + minutes + ' PM') : (hours + ':' + minutes + ' AM');//dd/MM/yyyy
                                    return time;
                                }
                                return a;
                            }
                        }
                        else {
                            editOb.type = "date";      //Still Have some Editor Problems for handling DateTime
                            if (ob.format === undefined || ob.format === null) {
                                editOb.format = 'dd/mm/yyyy';
                            } else {
                                editOb.format = ob.format; //'dd/mm/yyyy'
                            }

                            editOb.calendarFormat = ob.calenderType //'dd/mm/yyyy'
                            //editOb.def = function (a,b,c) {
                            //    
                            //    return new Date();
                            //}
                            func = function (a, b, c, d) {
                                if (a !== undefined && a !== null) {
                                    if (ob.format === undefined || ob.format === null) {
                                        ob.format = 'dd/mm/yyyy';
                                    }
                                    var requiredFormat = ob.format.split('/');
                                    var dateComponent = {
                                    };
                                    var dateString = a.substr(6);
                                    var currentTime = new Date(parseInt(dateString));
                                    dateComponent['mm'] = currentTime.getMonth() + 1;
                                    dateComponent['dd'] = currentTime.getDate();
                                    dateComponent['yyyy'] = currentTime.getFullYear();
                                    var date = dateComponent[requiredFormat[0]] + "/" + dateComponent[requiredFormat[1]] + "/" + dateComponent[requiredFormat[2]];//dd/MM/yyyy
                                    return date;//new Date(year + "/" + month + "/" + day);
                                }
                                return a;
                            }
                        }
                    }

                })

                break;
            case 'varbinary':
                editOb.type = "upload";
                //editOb.display = function (file_id) {
                //    return '<img src="' + table.file('files', file_id).web_path + '"/>';
                //}
                //editOb.clearText = "Clear";
                //editOb.noImageText = 'No image';
                func = function (a, b, c, d) {
                    if (a === null)
                        a = "../../../Images/noImage.png";
                    return "<img src='" + a + "' alt='No Image'/>";
                }
                break;
            default: func = function (a, b, c, d) {
                if (ob["value"] === "docCount") {
                    if (parseInt(a) > 0) {
                        a = '<a title="abc" href="javascript:void(0)" onclick="ShowDocumentPopUp(\'' + $.trim(c["DT_RowId"].split("_")[1]) + '\');">' + a + '</a>';
                    }
                    else {
                        a = "";
                    }
                }
                return a;
            }
                break;
        }
        var t = getGridColumnType(ob.type);
        if (b.display) {
            columns.push({
                width: b.width === null || b.width === '' ? null : b.width + b.widthtype,
                data: b.display, render: func, type: t, onblur: 'cancel', buttons: true, className: 'editable',
                submit: 'submit',
            });
        } else {
            columns.push({
                width: b.width === null || b.width === '' ? null : b.width + b.widthtype,
                data: b.value, render: func, type: t, onblur: 'cancel',
                submit: 'submit', buttons: true,
            });
        }
        thead += ("<th>" + (b.name === '' ? b.value : b.name) + "</th>");
        $.each(fsi.gridColumns.Fields, function (i, v) {

            if ((v.Name.toLowerCase() === b.value.toLowerCase()) && (!v.Identity)) {
                if (ob['type'] !== "varbinary" && ob['type'] !== "uniqueidentifier") {
                    fields.push(editOb);
                }
                else {
                    $.each(fsi.gridRelationData, function (i, table) {
                        if (v.ReferencedTable) {
                            if (v.ReferencedTable === Object.keys(table).toString()) {
                                editOb.label = ((b.name === undefined || b.name === '' || b.name === null) ? b.value : b.name);
                                editOb.name = b.display;
                                editOb.type = "select";
                                editOb.onblur = 'submit';
                                editOb.submit = 'Ok';
                                var comboValue = [];
                                $.each(table[Object.keys(table)], function (i, value) {
                                    comboValue.push({
                                        label: value.Value, value: value.SystemID
                                    });
                                });
                                editOb.options = comboValue;
                                fields.push(editOb);
                            }
                        }
                    });
                }
            }
        });
    });

    if (sortColArr.length === 0) {
        sortColArr.push([0, 'asc']);
    }
    thead += ("</tr>");
    if (attributes.iscoumnfilter === 'true') {
        thead += "<tr>";
        if (attributes['data-checkbox'] === 'true' && bindingtype !== 'workflow') {
            thead += "<th></th>";
        }
        $.each(attributes["dataobjectpropertiesdatalist"], function (a, b) {
            thead += ("<th>" + b.name + "</th>");
        });
        thead += ("</tr>");
    }
    thead += ("</thead>");
    tableObj.prepend(thead);
    //setting
    var config = {
        columns: columns,
        lengthMenu: [[10, 20, 30, 50, 100, 200, 500, 1000, 100000], [10, 20, 30, 50, 100, 200, 500, 1000, "All"]],
        oLanguage: {
            sLengthMenu: "Page Size _MENU_",
            "sEmptyTable": "No data available!"
        },
        jQueryUI: false,
        tableTools: {
            aButtons: [],
            sSwfPath: "../../../WebDesigner/extensions/grid/extensions/TableTools/swf/copy_csv_xls_pdf.swf"
        },
        "bStateSave": true,
        select: true,
        sRowSelect: selectType,
        processing: true,
        responsive: false,
        order: sortColArr,
        scrollY: tableHeight === undefined ? "auto" : tableHeight,
        sScrollX: tableWidth === undefined ? "auto" : tableWidth,
        autoWidth: false,
        bScrollAutoCss: true,
        bScrollCollapse: false,
        scrollCollapse: false,
        bLengthChange: true,
        fixedHeader: true,
        fixedColumns: false,
        "searchDelay": 1000,
        oColReorder: {
            "iFixedColumns": isCheckboxEnable
        },
        dom: 'frtlip',
        stateSaveCallback: function (settings, data) {
            //localStorage.setItem('DataTables_' + settings.sInstance, JSON.stringify(data));          
            // $('#' + selectedRow).click();
        },
        stateLoadCallback: function (settings) {
            //return JSON.parse(localStorage.getItem('DataTables_' + settings.sInstance));
        }
    }

    var columnsNo = $('thead tr:first th', tableObj).map(function (a, b) {
        return a;
    }).get();
    if (bindingtype !== 'workflow') {
        var tenantUrl = getTenantUrl();
        var myurl = tenantUrl + '/Test/Get';
        config.ajax = {
            url: myurl,
            type: "POST"
        }
    }
    if ((attributes.isshowpaging === 'true')) {
        if (attributes.isshowfooter === 'true') {
            config.pagingType = "full_numbers";
            config.pageLength = parseInt(attributes['pagesize']);
            config.paging = true;
            config.bInfo = true;
            if (attributes["paging"] === "client") {
                config.serverSide = false;
                config.processing = false;
            }
            else {
                if (columns.length > 1) {
                    config.serverSide = true;
                    config.processing = true;
                }
            }
        }
        else {
            config.bInfo = true;
            config.bPaginate = false;
            config.paging = false;
            config.serverSide = true;
            config.processing = true;
        }
    }
    else {
        config.bInfo = true;
        config.bPaginate = false;
        config.paging = false;
        config.serverSide = true;
        config.processing = true;
    }
    if ((attributes.iseditable === "true" || attributes.iscreate === "true" || attributes.isdelete === "true") && bindingtype !== 'workflow') {

        var myurl = getTenantUrl() + '/Test/Post';
        window[attributes['id']] = {
        };
        window[attributes['id']] = new $.fn.dataTable.Editor({
            ajax: myurl,
            table: $(tableObj),
            fields: fields,
            onEdit: function (a, b, c) {
                $.notifyBar({
                    cssClass: "success", html: "Updated successfully!", close: false, closeOnClick: false, target: '#content'
                });
                try {
                    //refresh the table
                    fsi.refreshGrid(tableObj);
                }
                catch (e) {

                }
                return false;
            },
            beforeEdit: undefined,
            onCreate: function (a, b, c) {
                $.notifyBar({
                    cssClass: "success", html: "Created successfully!", close: false, closeOnClick: false, target: '#content'
                });
                //refresh the table
                fsi.refreshGrid(tableObj);
            },
            beforeCreate: undefined,
            onPreRemove: undefined,
            onPostRemove: function (a, b, c) {
                //var table1 = $(tableObj).DataTable();;
                //table1.draw();
            },

        });

        var editor = window[attributes['id']];
        var openVals;
        window[attributes['id']].on('submit', function (e, o, action) {

        });
        window[attributes['id']].on('initEdit', function (e, o, action) {

        });
        window[attributes['id']].on('preOpen', function (e, o, action) {
        });
        window[attributes['id']].on('onOpen', function (e, o, action) {
            $.each($('.' + this.classes.field.input).find('.hasCalendarsPicker'), function (i, v) {
                $(v.parentElement).find('img').remove();
                if ($(v.parentElement).parent().parent().hasClass('DTE_Inline_Field')) {
                    $(v).empty().after('<img style="width: 20px !important;height: 20px;position: absolute;right: 18px;top: -2px;" id="datePickerImage" src="../../../images/calendar.gif" alt="Popup" class="trigger dtp-ico">');
                } else {
                    $(v).empty().after('<img style="width: 20px !important;height: 20px;position: absolute;top: 9px" id="datePickerImage" src="../../../images/calendar.gif" alt="Popup" class="trigger dtp-ico">');
                }
            });
        });
        window[attributes['id']].on('preBlur', function (e) {
            if (openVals !== JSON.stringify(window[attributes['id']].get())) {
                return confirm('You have unsaved changes. Press enter to save value.\n Are you sure you want to exit?');
            }
        });
        window[attributes['id']].on('preSubmit', function (e, o, action) {   //Client-Side Validation   
            if (action !== 'remove') {
                var _that = this;
                //var types = ["BIGINT", "REAL", "SMALLINT", "TINYINT", "DECIMAL", "FLOAT", "INT","NVARCHAR", "BIT", "DATETIME", "UNIQUEIDENTIFIER", "VARBINARY"];
                var alreadyError = true;
                $.each(o.data, function (a, b, c) {
                    if (o.update !== undefined && o.update !== a) {
                        return;
                    }
                    if (!alreadyError) {
                        return false;
                    }
                    var currentTd = a;
                    var currentValue = b.trim();
                    var ob = {
                    };
                    $.each(attributes['dataobjectpropertiesdatalist'], function (x, y) {
                        if (y['value'] === currentTd) {
                            ob = y;
                        }
                    });
                    var pattern = ob['pattern'];
                    var isRequired = ob['required'];
                    var errorMessage = ob['patternMessage'];
                    if (ob.type === 'datetime') {
                        if (currentValue.toString().toLowerCase().indexOf("undefined") >= 0) {
                            currentValue = '';
                        }
                    }

                    if (currentValue === "" && isRequired === "on") {
                        errorMessage = "This is a required field.";
                        _that.error(currentTd, errorMessage);
                        alreadyError = false;
                        return false;
                    }
                    else if (pattern !== undefined && pattern.trim() !== "" && currentValue !== "" && (!(new RegExp(pattern).test(currentValue)))) {
                        alreadyError = false;
                        _that.error(currentTd, errorMessage, _that);
                        return false;
                    }
                    else if (ob.type === 'nvarchar') {
                        var maxLength = 0;
                        var minLength = 0;
                        var msg = '';
                        var maxValue = ob.maxValue !== undefined ? ob.maxValue : '';
                        var minValue = ob.minValue !== undefined ? ob.minValue : '';
                        if ($.isNumeric(maxValue)) {
                            maxLength = maxValue;
                        }
                        if ($.isNumeric(minValue)) {
                            minLength = minValue;
                        }
                        if (minValue !== '' && currentValue.trim().length < minLength) {
                            if (isRequired === "on") {
                                msg = "Character length should be greater than or equal to " + minLength + ".</br>";
                            } else if (currentValue.trim() !== '') {
                                msg = "Character length should be greater than or equal to " + minLength + ".</br>";
                            }
                        }
                        if (maxValue !== '' && currentValue.trim().length > maxLength) {
                            if (isRequired === "on") {
                                msg += "Character length should be less than or equal to " + maxLength + ".";
                            } else if (currentValue.trim() !== '') {
                                msg = "Character length should be less than or equal to " + maxLength + ".";
                            }
                        }
                        if (msg !== '') {
                            alreadyError = false;
                            errorMessage = msg;
                            _that.error(currentTd, errorMessage, _that);
                            return false;
                        }

                    }
                    else if (ob.type !== 'datetime' && ob.type !== 'bit') {
                        if (ob.type === "bigint" || ob.type === "real" || ob.type === "smallint" || ob.type === "tinyint" || ob.type === "decimal" || ob.type === "float" || ob.type === "int") {
                            if ($.isNumeric(currentValue)) {
                                var maxValue = ob.maxValue !== undefined ? ob.maxValue : ' ';
                                var minValue = ob.minValue !== undefined ? ob.minValue : '';
                                if (maxValue.trim() !== "" && currentValue !== "" && (parseFloat(currentValue) > parseFloat(ob.maxValue) || !$.isNumeric(currentValue))) {
                                    alreadyError = false;
                                    errorMessage = !$.isNumeric(currentValue) ? "This value is not a number." : ("This value can not be greater than " + (ob.maxValue) + '.');
                                    _that.error(currentTd, errorMessage, _that);
                                    return false;
                                }
                                else {
                                    if (minValue.trim() !== "" && currentValue !== "" && (parseFloat(currentValue) < parseFloat(ob.minValue) || !$.isNumeric(currentValue))) {
                                        alreadyError = false;
                                        errorMessage = !$.isNumeric(currentValue) ? "This value is not a number." : ("This value can not be less than " + (ob.minValue) + '.');
                                        _that.error(currentTd, errorMessage, _that);
                                        return false;
                                    }
                                }
                            } else {
                                if (currentValue !== "") {
                                    errorMessage = 'Please enter valid numeric value.';
                                    _that.error(currentTd, errorMessage);
                                    alreadyError = false;
                                    return false;
                                }
                            }
                        }
                    }
                    else if (ob.type !== 'datetime' && ob.type !== 'bit') {
                        if (ob.type === "bigint" || ob.type === "real" || ob.type === "smallint" || ob.type === "tinyint" || ob.type === "decimal" || ob.type === "float" || ob.type === "int") {
                            if ($.isNumeric(currentValue)) {
                                var minValue = ob.minValue !== undefined ? ob.minValue : '';
                                if (minValue.trim() !== "" && currentValue !== "" && (parseFloat(currentValue) < parseFloat(ob.minValue) || !$.isNumeric(currentValue))) {
                                    alreadyError = false;
                                    errorMessage = !$.isNumeric(currentValue) ? "This value is not a number." : ("This value can not be less than " + (ob.minValue) + '.');
                                    _that.error(currentTd, errorMessage, _that);
                                    return false;
                                }
                            } else {
                                if (currentValue !== "") {
                                    errorMessage = 'Please enter valid numeric value.';
                                    _that.error(currentTd, errorMessage);
                                    alreadyError = false;
                                    return false;
                                }
                            }
                        }
                    }
                    else if (ob.type === 'bit') {
                        //need disscussion
                    }

                    if (a === 'Tags') {
                        if (!new RegExp('^(?![\W_]+$)[a-zA-Z0-9 .&,_-]+$').test(currentValue)) {
                            return true;
                            //errorMessage = 'please enter valid tag.';
                            //_that.error(currentTd, errorMessage);
                            //alreadyError = false;
                            //return false;
                            //*** Changing for Tag mandatory 68965 ****//
                        }
                    }
                });

                if (!alreadyError) {
                    return false;
                }
            }
            return true;
        });
        window[attributes['id']].on('postSubmit', function (e, o, action) {
            if (o.error !== '') {
                if (o.error) {
                    $.notifyBar({
                        cssClass: "error", html: o.error, close: true, closeOnClick: true, target: '#content'
                    });
                    return false;
                }
            }
        });

        config.tableTools.sRowSelect = selectType;
        if (attributes.iseditable === "true" || attributes.iscreate === "true") {
            config.tableTools.sRowSelector = 'tr';
            if (attributes.iseditable === "true") {
                //$(tableObj).on('dblclick', 'tbody td:not(:first-child)', function (e) {
                $(tableObj).on('dblclick', 'tbody td', function (e) {
                    var _that = this;
                    var editCellIndex = 0;
                    if (attributes['data-checkbox'] === 'true') {
                        editCellIndex = _that.cellIndex - 1;
                    } else {
                        editCellIndex = _that.cellIndex
                    }
                    if (attributes["dataobjectpropertiesdatalist"][editCellIndex]['type'] === 'bit') {
                        return false;
                    }
                    var ob = $(_that).parent().parent().parent().attr('id');
                    if ($('input', _that).length === 0)
                        var val = this.innerHTML;
                    try {
                        if ($(this).hasClass('editable')) {
                            window[ob].inline(_that, {
                                buttons: {
                                    label: '', fn: function () {
                                        this.submit();
                                    }
                                }
                            });
                        } else {
                            window[ob].inline(_that, {
                                drawType: 'page'
                            });
                        }
                    }
                    catch (e) {
                        $('.gridContainer').unblock();
                    }
                    if (val !== undefined)
                        $('input', _that).val(val);
                    $('input', _that).focus();
                });
            }
            if (attributes['data-checkbox'] === 'true') {
                //handle first column checkbox event
                $(tableObj).on('change', 'input.editor-active', function (e) {
                    var $row = $(this).closest('tr');
                    if (this.checked) {
                        $(tableObj).find('tbody tr> td:first-child input[type="checkbox"]').each(function (i, v) {
                            if (!$(v).closest('tr').hasClass('selected'))
                                $(v).prop('checked', false);
                        });
                    }
                    e.stopPropagation();
                });
                //handle first column checkbox event
                $(tableObj).on('click', 'tr', function (e) {
                    if ($(this).hasClass('selected')) {
                        $(tableObj).find('tbody tr> td:first-child input[type="checkbox"]').each(function (i, v) {
                            if (!$(v).closest('tr').hasClass('selected'))
                                $(v).prop('checked', false);
                            else
                                $(v).prop('checked', false);
                        });
                    } else {
                        $(this).find('td:first-child input:checkbox').prop('checked', false);
                    }
                    selectedRow = $(this).attr('id');
                    e.stopPropagation();
                });
            }
            if (attributes.iscreate === "true") {
                config.tableTools.aButtons.push(
                   {
                       sExtends: "editor_create", editor: window[attributes['id']], sButtonClass: 'new-entry', "sToolTip": "Create new record"
                   });
            }
            if (attributes.iseditable === "true") {
                config.tableTools.aButtons.push(
                   {
                       sExtends: "editor_edit", editor: window[attributes['id']], sButtonClass: 'edit-entry', sToolTip: "Edit selected record"
                   });
            }
            //config.tableTools.aButtons.push(
            //        {
            //            sExtends: "editor_create", editor: window[attributes['id']], sButtonClass: 'new-entry', "sToolTip": "Create new record"
            //        },
            //        {
            //            sExtends: "editor_edit", editor: window[attributes['id']], sButtonClass: 'edit-entry', sToolTip: "Edit selected record"
            //        });
        }
        if (attributes['isdelete'] === 'true') {
            config.tableTools.aButtons.push({
                sExtends: "editor_remove", editor: window[attributes['id']], sButtonClass: 'delete-entry', sToolTip: "Delete selected record",
                message: 'Are you sure you wish to remove this record?'
            });
        }
        config.tableTools.sSwfPath = "../../../WebDesigner/extensions/grid/extensions/TableTools/swf/copy_csv_xls_pdf.swf";
        config.dom = 'T' + config.dom;
    }
    if (attributes.isprintoptions === 'true') {
        if (!((attributes.iseditable === "true" || attributes.iscreate === "true" || attributes.isdelete === "true") && bindingtype !== 'workflow')) {
            config.dom = 'T' + config.dom;
        }
        config.tableTools.aButtons.push(
           //   { sExtends: "print", sToolTip: "Print preview" },
        {
            sExtends: "xls", sToolTip: "Save to csv"
        },
                {
                    sExtends: "pdf", sToolTip: "Save to pdf"
                },
                    {
                        sExtends: "copy", sToolTip: "Copy to clipboard"
                    }


                    );

    }
    else {
        $(this).parents('.dataTables_wrapper').first().find('thead').show();
    }
    if (attributes.iscolumnshowhide === 'true') {
        config.dom = 'C' + config.dom;
    }
    if (attributes.isreordercolumn === 'true') {
        config.dom = 'R' + config.dom;
    }
    if (attributes.issortable === 'true') {
        config.bSort = true;
        config.aoColumnDefs = [{
            "bSortable": true, "aTargets": columnsNo
        }];
    }
    else {
        config.bSort = false;
        config.aoColumnDefs = [{
            "bSortable": false, "aTargets": []
        }]
    } var rows_selected = [];
    config.rowCallback = function (row, data, dataIndex) {
        // Set the checked state of the checkbox in the table
        $('input.editor-active', row).prop('checked', data.active === 1);
        // Get row ID
        var rowId = data[0];
        // If row ID is in the list of selected row IDs
        if ($.inArray(rowId, rows_selected) !== -1) {
            $(row).find('input[type="checkbox"]').prop('checked', true);
            $(row).addClass('selected');
        }
        $('.dataTables_scrollHeadInner').css('width', '');
    };

    if (attributes['data-checkbox'] === 'true') {
        if (attributes.iseditable !== "true") {
            tableObj.on('click', 'tbody tr', function () {
                tableObj.find('tbody tr.selected').removeClass('selected');
                if ($(this).hasClass('selected')) {
                    if ($(this).hasClass('DTTT_selected')) {
                        $(this).removeClass('selected');
                    }
                }
                else {
                    $(this).addClass('selected');
                    tableObj.find('tbody tr> td:first-child input[type="checkbox"]').each(function (i, v) {
                        if (!$(v).closest('tr').hasClass('selected'))
                            $(v).prop('checked', false);
                        else
                            $(v).prop('checked', true);
                    });
                }
            });
        } else {
            //handle first column checkbox event
            tableObj.on('click', 'tr', function (e) {
                if ($(this).hasClass('selected')) {
                    tableObj.find('tbody tr> td:first-child input[type="checkbox"]').each(function (i, v) {
                        if (!$(v).closest('tr').hasClass('selected'))
                            $(v).prop('checked', false);
                        else
                            $(v).prop('checked', true);
                    });
                } else {
                    $(this).find('td:first-child input:checkbox').prop('checked', false);
                }
                selectedRow = $(this).attr('id');
                e.stopPropagation();
            });
        }

        //handle first column checkbox event
        tableObj.on('change', 'input.editor-active', function (e) {
            var $row = $(this).closest('tr');
            if (this.checked) {
                tableObj.find('tbody tr> td:first-child input[type="checkbox"]').each(function (i, v) {
                    if (!$(v).closest('tr').hasClass('selected'))
                        $(v).prop('checked', false);
                });
            }
            e.stopPropagation();
        });
    } else {
        $(tableObj).on('click', 'tbody tr', function () {
            tableObj.find('tbody tr.selected').removeClass('selected');
            if ($(this).hasClass('selected')) {
                if ($(this).hasClass('DTTT_selected')) {
                    $(this).removeClass('selected');
                }
            }
            else {
                $(this).addClass('selected');
            }
        });
    }
    tableObj.on('mouseenter', 'tbody tr', function () {
        //$(this).css('background-color', 'whitesmoke !important');
    });

    if (attributes.isshowfooter === 'false') {
        config.bInfo = false;
        config.bPaginate = false;
    }
    if (attributes.isshowheader === 'false') {
        config.initComplete = function (oSettings, json) {
            //show/hide header
            $(this).parents('.dataTables_wrapper').first().find('thead').hide();
            $('.dataTables_scrollHeadInner').css('padding-right', '0px !important');
            if (attributes['redirecturl'].toUpperCase() !== 'INTERNAL' && attributes['redirecturl'].toUpperCase() !== 'EXTERNAL') {
                $('#' + $(tableObj).attr('id') + ' tbody tr:eq(0)').click();
            }
        };
    }
    config.initComplete = function (oSettings, json) {
        if (attributes['redirecturl'].toUpperCase() !== 'INTERNAL' && attributes['redirecturl'].toUpperCase() !== 'EXTERNAL') {
            $('#' + $(tableObj).attr('id') + ' tbody tr:eq(0)').click();
        }
        $('.delete-entry').find('span').text('');
        $(dataTable).trigger('rendered');
    };

    try {
        dataTable = $(tableObj)
        .off('search.dt')
        //.on('order.dt', function () {alert('Order'); })            
        .on('search.dt', function (event) {
            if (event) {
                if (event.type !== 'readystatechange') {
                    if (event.type === 'keyup') {
                        if (!$(this).attr('isFilteredTrigger') || $(this).attr('isFilteredTrigger') === 'false') {
                            if ($(event.target).val() !== '') {
                                $(this).attr('isFilteredTrigger', true);
                                $(this).trigger('filtered');
                            }
                        } else {
                            $(this).removeAttr('isFilteredTrigger');
                        }
                    } else if (event.type === 'input') {
                        $(this).trigger('filtered');
                    }
                }
            }
        })
        .on('page.dt', function () {
            $(this).trigger('fetch');
        })
        .dataTable(config);

        if (attributes.isshowheader === 'false') {
            $(tableObj).closest('div[data-control-type=grid]').find('.dataTables_filter').hide();
        }
        if (attributes.issearch === 'false') {
            $(tableObj).closest('div[data-control-type=grid]').find('.dataTables_filter').hide();
        }
        if (attributes.iscolumnshowhide === 'false') {
            $(tableObj).closest('div[data-control-type=grid]').find('.dataTables_filter').css("right", "0px");
        }
        else {
            if (!tableObj.closest('div[data-control-type=grid]').find('.dataTables_filter').is(':visible'))
                $(tableObj).closest('div[data-control-type=grid]').find('.ColVis').css("position", "relative");
            else {
                $(tableObj).closest('div[data-control-type=grid]').find('.ColVis').css("position", "absolute");
            }
        }
        if ($('.dataTables_scrollBody table').hasClass('nowrap'))
            $('.dataTables_scrollBody table').removeClass('nowrap')
        $('thead', tableObj).hide();
        if (attributes['iseditable'] !== 'true' && (attributes['redirecturl'] !== 'select' && attributes['redirecturl'] !== '#')) {
            $(tableObj).on('click', 'tr', function (event) {
                if (attributes['redirecturl'].toUpperCase() === 'INTERNAL') {
                    fsi.pageParameter('SYSTEMID', this.id.split('row_')[1]);
                    fsi.redirectPage($(tableObj).attr('internalurl'));
                }
                else {
                    var externalUrl = $(tableObj).attr('externalurl');
                    if (externalUrl && !externalUrl.match(/^.+:\/\/.*/)) {
                        externalUrl = ('http://' + externalUrl);
                    }
                    window.open(externalUrl, "height=300,width=400")
                }
            });
            $(dataTable).on('draw.dt', function () {
                $('.dataTables_scrollBody tbody').css('cursor', 'pointer');
            });
        }

        $('div[data-control-id="' + $(tableObj).attr('id') + '"]').find('.redirect-url-page').on('click', function (event) {
            var selectedRow = $(tableObj).find('tbody tr.selected');
            if ($(selectedRow).attr('id')) {
                if (attributes['redirecturl'].toUpperCase() === 'INTERNAL') {
                    fsi.pageParameter('SYSTEMID', $(selectedRow).attr('id').split('row_')[1]);
                    fsi.redirectPage(attributes['internalurl']);
                }
                else {
                    var externalUrl = attributes['externalurl'];
                    if (externalUrl && !externalUrl.match(/^.+:\/\/.*/)) {
                        externalUrl = ('http://' + externalUrl);
                    }
                    window.open(externalUrl, "height=300,width=400")
                }
            }
            else {
                alert('Please select a row');
            }
        });


        if ((attributes.isshowpaging === 'false')) {
            $(dataTable).on('draw.dt', function () {
                // var theme = attributes['data-theme'];
                //tableObj.parents('div[data-control-type=grid]').find('.dataTables_wrapper .dataTables_info').addClass(theme);
                if (attributes.isshowfooter === 'true')
                    tableObj.parents('div[data-control-type=grid]').find('.dataTables_wrapper').css({
                        "padding-bottom": "33px", "clear": "both"
                    })
                //$('.dataTables_wrapper .dataTables_info').addClass(theme);
                // $("head").append($('<style>.container:after { padding: 18px;clear: both; }</style>'));
                //$('.dataTables_wrapper .dataTables_info').css({ "left": "0px", "width": "100%" });
                tableObj.parents('div[data-control-type=grid]').find('.dataTables_wrapper .dataTables_info').css({
                    "left": "0px", "width": "100%"
                });
            });

        }
    }
    catch (e) {
        $.notifyBar({
            cssClass: "error", html: e.error, close: true, closeOnClick: true, target: '#content'
        });
    }

    $.each($(tableObj.closest('div[data-control-type=grid]')).find('.ColVis_Button'), function () {
        $(this).on('click', function () {
            $(".ColVis_collection li").map(function () {
                if ($(this).text() === "")
                    $(this).remove();
            });
            var optionLeft = $(".ColVis_catcher").css('left');
            var optionControl = parseInt(optionLeft) - 200;
            $(".ColVis_collection").css({
                left: optionControl
            });
        });
    });
    if (attributes.iscoumnfilter === 'true' && (attributes["paging"] === undefined || bindingtype === 'workflow')) {
        dataTable = dataTable.columnFilter({
            sPlaceHolder: "head:after"
        });
        if (attributes['data-checkbox'] === 'true' && bindingtype !== 'workflow') {
            $('#chekbox-col').removeClass('sorting').find('input').hide();
            //$("#" + attributes['id'] + "_filter").hide();
            //$("[iseditable=true] tr:nth(1) th:nth(0)").html('');
        }
    } else {
        var oTable = dataTable;
        var asInitVals = new Array();
        var aoFilterCells = oTable.fnSettings().aoFooter[0];
        var oHost = oTable.fnSettings().nTFoot;
        var sFilterRow = "tr";
        var tr = $("tr:first", oTable.fnSettings().nTHead).detach();
        if (oTable.fnSettings().bSortCellsTop) {
            tr.prependTo($(oTable.fnSettings().nTHead));
            aoFilterCells = oTable.fnSettings().aoHeader[1];


        }
        else {
            tr.appendTo($(oTable.fnSettings().nTHead));
            aoFilterCells = oTable.fnSettings().aoHeader[0];
        }
        sFilterRow = "tr:last";
        oHost = oTable.fnSettings().nTHead;

        $("tr", dataTable.fnSettings().nTHead).eq(1).find('th').each(function () {
            var title = $(this).text();
            if (title !== '') {
                $(this).html('<input type="text" placeholder="' + title + '" />');
            } else {
                $(this).removeClass('sorting');
            }
        });
        var dtable = dataTable.DataTable();
        $("tr", dataTable.fnSettings().nTHead).eq(1).find('th').each(function (colIdx, th) {
            var timer;
            $('input', th).on('keyup', function (e) {
                clearTimeout(timer);
                var searchValue = this.value;
                var ms = 1000; // milliseconds
                timer = setTimeout(function () {
                    //if (e.keyCode === 13) {
                    var dtable = dataTable.DataTable();
                    dtable
                        .column(colIdx)
                        .search(searchValue)
                        .draw();
                    //}
                }, ms);
            });
            $('input', dtable.column(colIdx).header()).on('click', function (e) {
                e.stopPropagation();
            });
        });
        //var searchBox = $(tableObj).closest('div[data-control-type=grid]').find('.dataTables_filter').find('input');
        //var timer1;
        //searchBox.on('keyup', function (e) {
        //    clearTimeout(timer1);
        //    var searchValue = this.value;
        //    var ms = 1000; // milliseconds
        //    timer1 = setTimeout(function () {
        //        var dtable = dataTable.DataTable();
        //        dtable                    
        //            .search(searchValue)
        //            .draw();
        //    }, ms);
        //});
    }
    $(dataTable).on('draw.dt', function () {
        //$('.dataTables_scrollBody table').css('table-layout', 'fixed');
        //$('.dataTables_scrollBody').css('display', 'inline block');
        var conditionalFormating = tableObj.parents('div[data-control-type=grid]').data('conditionalFormating');
        var splitColumnName = columns;
        //custom filter code---
        $.each(conditionalFormating, function (k) {
            for (var j = 0; j < splitColumnName.length; j++) {
                var dataColumn, formateColumn;
                dataColumn = splitColumnName[j].data === undefined ? '' : splitColumnName[j].data;
                formateColumn = conditionalFormating[k].column === undefined ? ' ' : conditionalFormating[k].column;
                if (dataColumn !== null) {
                    if (dataColumn !== '' && formateColumn !== '') {
                        if (dataColumn.trim() === formateColumn.trim()) {
                            var colDataType = conditionalFormating[k].dataType;
                            var colConditionValue = conditionalFormating[k].value;
                            var colCondition = conditionalFormating[k].condition;
                            var nChild = j + 1;
                            var arraytableTd = dataTable.find("tr td:nth-child(" + nChild + ")");
                            $.each(arraytableTd, function (tdIndex, tableTd) {
                                var colTdStyle = '';
                                var colDBValue = $(tableTd).html();
                                try {
                                    if (colDataType === 'int') {
                                        colConditionValue = parseInt(colConditionValue);
                                        colDBValue = parseInt(colDBValue);
                                    }
                                    if (colDataType === 'float') {
                                        colConditionValue = parseFloat(colConditionValue);
                                        colDBValue = parseFloat(colDBValue);
                                    }
                                    if (colDataType === 'date') {
                                        colConditionValue = new Date(colConditionValue);
                                        colDBValue = new Date(colDBValue);
                                    }
                                }
                                catch (err) {
                                    colConditionValue = null;
                                }
                                var conditonValid = false;
                                if (colCondition === '=') {
                                    conditonValid = colConditionValue === colDBValue ? true : false;
                                }
                                else if (colCondition === '<>') {
                                    conditonValid = colConditionValue !== colDBValue ? true : false;
                                }
                                else if (colCondition === '>') {
                                    conditonValid = colConditionValue < colDBValue ? true : false;
                                }
                                else if (colCondition === '<') {
                                    conditonValid = colConditionValue > colDBValue ? true : false;
                                }
                                if (conditonValid) {
                                    colTdStyle = 'color:' + conditionalFormating[k].forColor + ';' + 'background:' + conditionalFormating[k].backColor;
                                }
                                var existingStle = $(tableTd).attr('style');
                                if (existingStle) {
                                    $(tableTd).attr('style', existingStle + colTdStyle)
                                }
                                else {
                                    $(tableTd).attr('style', colTdStyle);
                                }
                            })
                        }
                    }
                }
            }
        });
    });

    //dataTable.fnReloadAjax(dataTable.fnSettings());
    //dataTable.columns.adjust().draw();
    //  new $.fn.dataTable.FixedHeader(dataTable);  //To see the columns header when scrolling, Cant not work scrollX or scrollY
}

/// <summary>
/// bind grid with workflow
/// </summary>
/// <param name="tableObj" type="type">table object</param>
/// <param name="rowDataSet" type="type">row data set</param>
/// <param name="dynamicColumns" type="type">dynamic columns</param>
var BindGridWithWorkflow = function (tableObj, rowDataSet, dynamicColumns) {
    var colList = '';
    var headerVisible = '';
    attributes = {
    };
    $.each(tableObj.attributes, function (i, attrib) {
        attributes[attrib.name] = attrib.value;
    });
    attributes["dataobjectpropertiesdatalist"] = JSON.parse(attributes["dataobjectpropertiesdatalist"]);
    var tableHeight = tableObj.parentElement.style.height;
    if ((attributes.isshowpaging === 'false')) {
        if (tableHeight !== undefined) {
            tableHeight = parseInt(tableHeight) - 31;
        }
    }
    var tableWidth = tableObj.parentElement.style.width;
    $(tableObj).parent().css('height', 'auto');
    if ((attributes.isshowpaging === 'false')) {
        $(tableObj).parent().css('overflow-x', '');
    }

    var config = {
        aoColumns: dynamicColumns,
        aaData: rowDataSet,
        bRetrive: true,
        bDestroy: true,
        lengthMenu: [[10, 20, 30, 50, 100, 200, 500, 1000, 100000], [10, 20, 30, 50, 100, 200, 500, 1000, "All"]],
        oLanguage: {
            sLengthMenu: "Page Size _MENU_",
            "sEmptyTable": "No data available!"
        },
        jQueryUI: false,
        tableTools: {
            aButtons: [],
            sSwfPath: "../../../WebDesigner/extensions/grid/extensions/TableTools/swf/copy_csv_xls_pdf.swf"
        },
        "bStateSave": true,
        select: true,
        sRowSelect: "os",
        processing: false,
        responsive: false,
        scrollY: tableHeight === undefined ? "auto" : tableHeight,
        sScrollX: tableWidth === undefined ? "auto" : tableWidth,
        //sScrollXInner: '99%',
        "autoWidth": false,
        bAutoWidth: false,
        bScrollAutoCss: true,
        bScrollCollapse: false,
        bLengthChange: true,

        fixedHeader: true,
        scrollCollapse: false,
        dom: 'frtlip',
    }
    var columnsNo = $('thead tr:first th', $(tableObj)).map(function (a, b) {
        return a;
    }).get();

    if ((attributes.isshowpaging === 'true')) {
        if (attributes.isshowfooter === 'true') {
            config.pagingType = "full_numbers";
            config.pageLength = parseInt(attributes['pagesize']);
            config.paging = true;
            config.bInfo = true;
            config.serverSide = false;
        }
    }
    else {
        config.bInfo = true;
        config.bPaginate = false;
    }


    if (attributes.isprintoptions === 'true') {
        config.dom = 'T' + config.dom;
        config.tableTools.aButtons.push(
            //   { sExtends: "print", sToolTip: "Print preview" },
            {
                sExtends: "xls", sToolTip: "Save to csv"
            },
                {
                    sExtends: "pdf", sToolTip: "Save to pdf"
                },
        {
            sExtends: "copy", sToolTip: "Copy to clipboard"
        });
    }
    else {
        $(this).parents('.dataTables_wrapper').first().find('thead').show();
    }
    if (attributes.iscolumnshowhide === 'true') {
        config.dom = 'C' + config.dom;
    }
    if (attributes.isreordercolumn === 'true') {
        config.dom = 'R' + config.dom;
    }
    if (attributes.issortable === 'true') {
        config.bSort = true;
        config.aoColumnDefs = [{
            "bSortable": false, "aTargets": []
        }];
    }
    else {
        config.bSort = false;
        config.aoColumnDefs = [{
            "bSortable": false, "aTargets": []
        }]
    }
    config.rowCallback = function (row, data) {
        // Set the checked state of the checkbox in the table
        $('input.editor-active', row).prop('checked', data.active === 1);
    };

    if (attributes.isshowfooter === 'false') {
        config.bInfo = false;
        config.bPaginate = false;
    }
    if (attributes.isshowheader === 'false') {
        config.initComplete = function (oSettings, json) {
            //show/hide header
            $(this).parents('.dataTables_wrapper').first().find('thead').hide();
        };
    }

    try {
        if ($(tableObj).hasClass('dataTable')) {
            $(tableObj).fnDestroy();
        }
        $(tableObj).html('');
        config.aaSorting = [];
        dataTable = $(tableObj).dataTable(config);

        //setTimeout(function () {
        //    dataTable.fnSort([[0, 'asc']]);
        //}, 100);
        //// $('.dataTable').wrap('<div class="dataTables_scroll" />');
        //if (attributes.isshowheader === 'false') {
        //    $(tableObj).closest('div[data-control-type=grid]').find('.dataTables_filter').hide();
        //}
        if (attributes.issearch === 'false') {
            $(tableObj).closest('div[data-control-type=grid]').find('.dataTables_filter').hide();
        }
        if (attributes.iscolumnshowhide === 'false') {
            $(tableObj).closest('div[data-control-type=grid]').find('.dataTables_filter').css("right", "0px");
        }
        else {
            if (!$(tableObj).closest('div[data-control-type=grid]').find('.dataTables_filter').is(':visible'))
                $(tableObj).closest('div[data-control-type=grid]').find('.ColVis').css("position", "relative");
            else {
                $(tableObj).closest('div[data-control-type=grid]').find('.ColVis').css("position", "absolute");
            }
        }
        //if ($('.dataTables_scrollBody table').hasClass('nowrap'))
        //    $('.dataTables_scrollBody table').removeClass('nowrap')
        //$('thead', tableObj).hide();

        if (attributes['iseditable'] !== 'true' && attributes['redirecturl'] !== 'select') {
            $(tableObj).on('click', 'tr', function (event) {
                if (attributes['redirecturl'].toUpperCase() === 'INTERNAL') {

                    if (this.id.split('row_')[1]) {
                        fsi.pageParameter('SYSTEMID', this.id.split('row_')[1]);
                    }
                    else {
                        fsi.pageParameter('SYSTEMID', $(this).find('td:first').html());
                    }
                    fsi.redirectPage(attributes['internalurl']);
                }
                else {
                    var externalUrl = attributes['externalurl'];
                    if (externalUrl && !externalUrl.match(/^.+:\/\/.*/)) {
                        externalUrl = ('http://' + externalUrl);
                    }
                    window.open(externalUrl, "height=300,width=400")
                }
            });
            $(dataTable).on('draw.dt', function () {
                $('.dataTables_scrollBody tbody').css('cursor', 'pointer');
            });
        }

        if ((attributes.isshowpaging === 'false')) {
            $(dataTable).on('draw.dt', function () {
                // var theme = attributes['data-theme'];
                //tableObj.parents('div[data-control-type=grid]').find('.dataTables_wrapper .dataTables_info').addClass(theme);
                if (attributes.isshowfooter === 'true') {
                    $(tableObj).parents('div[data-control-type=grid]').find('.dataTables_wrapper').css({
                        "padding-bottom": "33px", "clear": "both"
                    })
                }
                //$('.dataTables_wrapper .dataTables_info').addClass(theme);
                // $("head").append($('<style>.container:after { padding: 18px;clear: both; }</style>'));
                //$('.dataTables_wrapper .dataTables_info').css({ "left": "0px", "width": "100%" });
                $(tableObj).parents('div[data-control-type=grid]').find('.dataTables_wrapper .dataTables_info').css({
                    "left": "0px", "width": "100%"
                });
            });

        }
    }
    catch (e) {
        // alert('Error : ' + e);
    }

    $.each($(tableObj.closest('div[data-control-type=grid]')).find('.ColVis_Button'), function () {
        $(this).on('click', function () {
            $(".ColVis_collection li").map(function () {
                if ($(this).text() === "")
                    $(this).remove();
            });
            var optionLeft = $(".ColVis_catcher").css('left');
            var optionControl = parseInt(optionLeft) - 200;
            $(".ColVis_collection").css({
                left: optionControl
            });
        });
    });
    if (attributes.iscoumnfilter === 'true') {

        //dataTable = $(dataTable).columnFilter({ sPlaceHolder: "head:after" });
        dataTable = dataTable.columnFilter({
            sPlaceHolder: "head:after"
        });

    }
    //clear search filter text and redraw table
    dataTable.fnFilterClear();
}

/// <summary>
/// get grid column type
/// </summary>
/// <param name="type" type="type">type</param>
/// <returns type="">return grid column type</returns>
getGridColumnType = function (type) {
    var returnType = 'text';
    switch (type) {
        case 'bit':
            returnType = 'checkbox';
            break;
        case 'nvarchar':
            returnType = 'text';
            break;
        case 'datetime':
            returnType = 'datetime';
            break;
        case 'varbinary':
            returnType = 'upload';
            break;
        default:
            returnType = 'text';
    }
    return returnType;
};

/// <summary>
/// get url
/// </summary>
/// <returns type="">return url</returns>
var getUrl = function () {
    var regex = /\/CustomPage.*/i;
    var result = window.location.href.replace(regex, '');
    return result;
};

/// <summary>
/// get design preview url
/// </summary>
/// <returns type="">return url</returns>
var getDesignPreviewUrl = function () {
    var regex = /\/DesignPreview.*/i;
    var result = window.location.href.replace(regex, '');
    return result;
};

/// <summary>
/// get tenant url
/// </summary>
/// <returns type="">return url</returns>
var getTenantUrl = function () {
    var regex = /\/Web.*/i;
    var result = window.location.href.replace(regex, '');
    return result;
};

/// <summary>
/// get form id
/// </summary>
/// <returns type=""></returns>
var getFormId = function () {
    var name = "id";
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

/// <summary>
/// get tenant
/// </summary>
fsi.prototype.tenant = getUrl();

/// <summary>
/// get tenant for design
/// </summary>
fsi.prototype.tenantForDesign = getDesignPreviewUrl();
/// <summary>
/// get form id
/// </summary>
fsi.prototype.formId = getFormId();

/// <summary>
/// select data object order by
/// </summary>
/// <param name="dataObject" type="type">data object</param>
/// <param name="where" type="type">where</param>
/// <param name="orderBy" type="type">order by</param>
/// <param name="success" type="type">success</param>
/// <param name="error" type="type">error</param>
fsi.prototype.selectDataObjectOrderBy = function (dataObject, where, orderBy, success, error) {
    var tenantUrl = window.location.href.split('/Web')[0];
    var myurl = tenantUrl + '/DataObject/SelectDataObjectOrderBy';
    var postData = {
        dataObject: dataObject, where: where, orderBy: orderBy
    };
    $.ajax({
        cache: false,
        url: myurl,
        data: postData,
        beforeSend: function () {
        },
        success: success,
        complete: function () {
        },
        error: error,
    });
};

/// <summary>
/// select data object for pivot table
/// </summary>
/// <param name="dataObject" type="type">data object</param>
/// <param name="where" type="type">where</param>
/// <param name="columnList" type="type">column list</param>
/// <param name="success" type="type">success</param>
/// <param name="error" type="type">error</param>
fsi.prototype.selectDataObjectForPivotTable = function (dataObject, where, columnList, success, error) {
    var tenantUrl = getTenantUrl();
    var myurl = tenantUrl + '/DataObject/GetDataObjectRowsForPivotTable';
    var postData;
    if ($.isEmptyObject(where)) {
        where = 'null';
    }

    postData = {
        dataObject: dataObject, where: where, columnList: columnList
    };

    $.ajax({
        cache: false,
        url: myurl,
        data: postData,
        beforeSend: function () {

        },
        success: success,
        complete: function () {

        },
        error: error,
    });
};

/// <summary>
/// select data object rows for chart
/// </summary>
/// <param name="dataObject" type="type">data object</param>
/// <param name="where" type="type">where</param>
/// <param name="columnList" type="type">column list</param>
/// <param name="displayColumn" type="type">display column</param>
/// <param name="success" type="type">success</param>
/// <param name="error" type="type">error</param>
fsi.prototype.SelectDataObjectRowsForChart = function (dataObject, where, columnList, displayColumn, success, error) {

    var tenantUrl = getTenantUrl();
    var myurl = tenantUrl + '/DataObject/GetDataObjectRowsForChart';
    var postData;
    if ($.isEmptyObject(where)) {
        where = 'null';
    }

    //postData = { dataObject: dataObject, where: where, columnList: columnList, displayColumn: displayColumn };
    postData = JSON.stringify({
        'dataObject': dataObject, 'where': where, 'columnList': columnList, 'displayColumn': displayColumn
    });

    $.ajax({
        //  cache: false,
        url: myurl,
        async: true,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'POST',
        data: postData,
        beforeSend: function () {

        },
        success: success,
        complete: function () {
            // make the header fixed on scroll
            // $('.table-fixed-header').fixedHeader();
        },
        error: function (xhr, status, error) {
            if (xhr.status === 200 && status === 'parsererror') {
                location.reload();
            }
        }
    });
};

/// <summary>
/// select data object
/// </summary>
/// <param name="dataObject" type="type">data object</param>
/// <param name="where" type="type">where</param>
/// <param name="success" type="type">success</param>
/// <param name="error" type="type">error</param>
/// <param name="complete" type="type">complete</param>
fsi.prototype.selectDataObject = function (dataObject, where, success, error, complete) {
    console.log('time : ' + new Date());
    var tenantUrl = getTenantUrl();
    var myurl = tenantUrl + '/DataObject/SelectDataObject/t=' + Date.now();
    var postData;
    if ($.isEmptyObject(where) || where.key === 'undefined') {
        where = 'null';
    }
    postData = {
        dataObject: dataObject, where: where
    };
    $.ajax({
        cache: false,
        url: myurl,
        async: false,
        data: postData,
        beforeSend: function () {
        },
        success: success,
        complete: complete,
        error: error,
    });
};

/// <summary>
/// select data object for tree view data
/// </summary>
/// <param name="childdataObject" type="type">childdata object</param>
/// <param name="parentDataObject" type="type">parent data object</param>
/// <param name="childDataObjectColumn" type="type">child data object column</param>
/// <param name="parentRelatedColumn" type="type">parent related column</param>
/// <param name="childRelatedColumnText" type="type">child related column text</param>
/// <param name="success" type="type">success</param>
/// <param name="error" type="type">error</param>
fsi.prototype.selectDataObjectForTreeViewData = function (childdataObject, parentDataObject, childDataObjectColumn, parentRelatedColumn, childRelatedColumnText, success, error) {
    var tenantUrl = getTenantUrl();
    var myurl = tenantUrl + '/DataObject/SelectDataObjectForTreeViewData';
    var postData;
    postData = { childdataObject: childdataObject, parentDataObject: parentDataObject, childDataObjectColumn: childDataObjectColumn, parentRelatedColumn: parentRelatedColumn, childRelatedColumnText: childRelatedColumnText };
    $.ajax({
        cache: false,
        url: myurl,
        data: postData,
        beforeSend: function () {
        },
        success: success,
        complete: function () {
        },
        error: error,
    });
};

/// <summary>
/// set editable component
/// </summary>
/// <param name="element" type="type">element</param>
/// <param name="data" type="type">data</param>
setEditableComponent = function (element, data) {
    var type, column;
    type = $(element).data('control-type');
    column = $(element).data('object-column');
    if (type === 'label') {
        $(element).find(':first').html(data[0][column]);
    }
    else if (type === 'textbox' || type === 'textarea') {
        $(element).find(':input').val(data[0][column]);
    }
};

/// <summary>
/// render page
/// </summary>
/// <param name="_this" type="type">this</param>
renderPage = function (_this) {
    $('#HtmlContentDiv').show();
    if (_this) {
        fsi.getPageParameters(_this);
        var systemId = fsi.pageParameter("SYSTEMID");
        if (systemId && systemId !== '') {
            fsi.setDataKey(systemId);
            fsi.getSystemParameters(_this);
            fsi.removeParameter("SYSTEMID");
            setEditableForm(_this, _this.attr('data-object-table'), systemId);
        }
        else {
            var controls = $('form [data-control-type]');
            for (var i = 0; i < controls.length; i++) {
                fsi.renderControl($(controls[i]));
            }
        }
    }
};

/// <summary>
/// set editable form
/// </summary>
/// <param name="form" type="type">form</param>
/// <param name="dataObject" type="type">data object</param>
/// <param name="systemId" type="type">system id</param>
setEditableForm = function (form, dataObject, systemId) {
    var where = {};
    where['SYSTEMID'] = systemId;
    fsi.selectDataObject(dataObject, where, function (data) {
        var controls = $('form [data-control-type]');
        if (data !== '') {
            var intialData = JSON.parse(data);
            for (var i = 0; i < controls.length; i++) {
                fsi.renderControl($(controls[i]), intialData);
            }
        }
        else {
            for (var i = 0; i < controls.length; i++) {
                fsi.renderControl($(controls[i]));
            }
        }
    });
}

/// <summary>
/// render control
/// </summary>
/// <param name="element" type="type">element</param>
/// <param name="intialData" type="type">intial data</param>
fsi.prototype.renderControl = function (element, intialData) {
    var type, column, ctrDefaultValue = '';
    type = $(element).data('control-type');
    column = $(element).data('object-column');
    if (type === 'button') {
        var action = $(element).find('button').attr('data-action');
        var selectorId = $(element).data('control-id');
        if (action !== 'Other') {
            fsi.on('click', '#' + selectorId, function (e) {
                fsiPrivate.buttonEvent(arguments.callee.caller.arguments[0], '#' + selectorId);
            })
        }
        //if (action !== 'Other')
        //{       
        //    $(element).on('click', function (e)
        //    {
        //        fsiPrivate.buttonEvent(e, '#'+selectorId);
        //    });
        //}
    }
    else if (type === 'label') {
        if (intialData && column) {
            if ($(element).attr('data-related-table')) {
                var displayCol = $(element).attr('data-object-properties')
                var where = {};
                where['SYSTEMID'] = intialData[0][column];
                fsi.selectDataObject($(element).attr('data-related-table'), where, function (data) {
                    if (data !== '') {
                        var dispalyData = JSON.parse(data);
                        if (dispalyData[0][displayCol] !== null) {
                            $(element).find('label').text(dispalyData[0][displayCol]);
                        }
                        else {
                            $(element).find('label').text('');
                        }
                    }
                });
            }
            else {
                if (intialData[0][column] !== null) {
                    $(element).find('label').text(intialData[0][column]);
                }
                else {
                    $(element).find('label').text('');
                }
            }
        }
    }
    else if (type === 'textbox') {
        if (intialData && column) {
            if ($(element).attr('data-related-table')) {
                var displayCol = $(element).attr('data-object-properties')
                var where = {};
                where['SYSTEMID'] = intialData[0][column];
                fsi.selectDataObject($(element).attr('data-related-table'), where, function (data) {
                    if (data !== '') {
                        var dispalyData = JSON.parse(data);
                        $(element).find(':input').val(dispalyData[0][displayCol]);
                    }
                });
            }
            else {
                $(element).find(':input').val(intialData[0][column]);
            }
        }
        $(element).find(':input').on('keydown', function (e) {
            if (e.keyCode === 13) { return false; }
        });
    }
    else if (type === 'textarea') {
        if (intialData && column) {
            if ($(element).attr('data-related-table')) {
                var displayCol = $(element).attr('data-object-properties')
                var where = {};
                where['SYSTEMID'] = intialData[0][column];
                fsi.selectDataObject($(element).attr('data-related-table'), where, function (data) {
                    if (data !== '') {
                        var dispalyData = JSON.parse(data);
                        $(element).find('textarea').html(dispalyData[0][displayCol]);
                    }
                });
            }
            else {
                $(element).find('textarea').html(intialData[0][column]);
            }
        }
    }
    else if (type === 'checkbox') {
        if (intialData) {
            $(element).find(':input[type="checkbox"]').attr('checked', (intialData[0][column] === null ? false : intialData[0][column]));
            if (intialData[0][column] === true || intialData[0][column] === 'true') {
                $(element).find(':input[type="checkbox"]').siblings('label').removeClass('ui-checkbox-off').addClass('ui-checkbox-on');
                $(element).find(':input[type="checkbox"]').siblings('label').find('.ui-icon').removeClass('ui-icon-checkbox-off').addClass('ui-icon-checkbox-on');
            }
        }
    }
    else if (type === 'combo') {
        renderCombo(element, intialData);
    }
    else if (type === 'currency') {
        if (intialData && column) {
            var p = $(element).data('decimalplaces');
            var num = intialData[0][column];
            if (num !== '' && num !== undefined) {
                if ($(element).data('base-currency') !== undefined && $(element).data('base-currency') !== '') {
                    if ($(element).data('base-currency').trim() === 'EUR') {
                        num = parseFloat(num).toFixed(p);
                        num = num.toLocaleString('de-DE');
                    }
                    else {
                        num = parseFloat(num).toFixed(p);
                        num = num.toLocaleString();
                    }
                }
                else {
                    if (localCulture === 'de-DE') {
                        num = parseFloat(num).toFixed(p);
                        num = num.toLocaleString(localCulture);
                    }
                    else {
                        num = parseFloat(num).toFixed(p);
                        num = num.toLocaleString(localCulture);
                    }
                }
            }
            $(element).find(':input').val(num);
        }
    }
    else if (type === 'datepicker') {
        renderDatePicker(element);
        var currentDate = $(element).data('currentDate');
        if (intialData && intialData[0] !== undefined && column !== undefined) {
            if (intialData[0][column] === null || intialData[0][column] === 'null') {
                $(element).find("input[type=text]").val('');
            }
            else {
                if (intialData[0]["CalendarType"] === '0' && $(element).data('display-format') === 'islamic')//0-gregorian 1-hijri (islamic)
                {
                    fsi.convertDateTime(intialData[0][column], 1, element);
                }
                else
                    if (intialData[0]["CalendarType"] === '1' && $(element).data('display-format') === 'gregorian') {
                        fsi.convertDateTime(intialData[0][column], 0, element);
                    }
                    else {
                        var dateFormat = $(element).data('dateformat');
                        if (dateFormat === 'dd/mm/yyyy') {
                            dateFormat = 'dd/mm/yy';
                        }
                        else if (dateFormat === 'yyyy/mm/dd') {
                            dateFormat = 'yy/mm/dd';
                        }
                        else if (dateFormat === 'mm/dd/yyyy') {
                            dateFormat = 'mm/dd/yy';
                        }
                        var formatted = $.datepicker.formatDate(dateFormat, new Date(intialData[0][column]));
                        $(element).find(':input[type="text"]').calendarsPicker('setDate', formatted);
                        $(element).find(':input[type="text"]').val(formatted);
                    }
            }
        }
        else if (currentDate) {
            var type = $(element).data('display-format');
            var dateFormat = $(element).data('dateformat');
            var date = getDateTimeString(type, dateFormat, new Date());
            $(element).find("input[type=text]").val(date);
        }
        var timezone = $(element).data('timezone');
        if (timezone === 'on') {
            fsi.selectTimeZones(element);
        }
        if ($(element).find("input[type=text]").val().length > 0) {
            $(element).find("input[type=text]").trigger('change');
        }
    }
    else if (type === 'timepicker') {
        if (intialData && intialData[0] !== undefined && column !== undefined) {
            renderTimePicker(element, intialData[0][column]);
        } else {
            renderTimePicker(element);
        }
    }
    else if (type === 'link') {
        if (intialData) {
            if (intialData[0][column].indexOf('http') === -1) {
                $(element).find('a').attr("href", 'http://' + intialData[0][column]);
            }
            else {
                $(element).find('a').attr("href", intialData[0][column]);
            }
        }
        else {
            var hrefInialValue = $(element).find('a').attr("href");
            if (hrefInialValue) {
                if (hrefInialValue.indexOf('http') === -1) {
                    $(element).find('a').attr("href", 'http://' + hrefInialValue);
                }
            }
        }
    }
    else if (type === 'color') {
        if (intialData) {
            $(element).find(':input').val(intialData[0][column]);
            if (intialData[0][column].indexOf('#') > -1) {
                $(element).find(':input').css("background-color", intialData[0][column]);
            }
            else {
                $(element).find(':input').css("background-color", "#" + intialData[0][column]);
            }

        }
        jscolor.init();
    }
    else if (type === 'numberbox') {
        if (intialData) {
            $(element).find(':input').val(intialData[0][column]);
        }
        $(element).find(':input').on('keyup', function () {
            if ($(element).find(':input').val().indexOf('.') > -1) {
                if ($(element).find(':input').val().split('.')[1].length > $(element).data('decimal-place')) {
                    if ($(element).data('decimal-place') === '0') {
                        var value = $(element).find(':input').val().slice(0, $(element).find(':input').val().split('.')[0].length);
                        $(element).find(':input').val(value);
                    }
                    else {
                        //var value = $(element).find(':input').val().slice(0, $(element).find(':input').val().length - 1);
                        //$(element).find(':input').val(value);
                    }
                }
            }
            var regexp = /^[+-]?((\d+(\.\d*)?)|(\.\d+))$/;
            var result = regexp.test($(element).find(':input').val());
            if (!result) {
                alert('Please enter valid decimal values.');
                e.preventDefault();
                }
            //if (result) {
            //    $(element).find(':input').val() = $(element).find(':input').val();
            //}
            //else {
            //    alert('Please enter valid decimal values.');
            //}
        });
        $(element).find(':input').on('keydown', function (e) {
            if (e.keyCode === 13) { return false; }
        });
    }
    else if (type === 'datalist') {
        if (!element.attr('isBindWorkflow')) {
            element.find('.dynamic-datalist').empty();
        }
        fsi.renderDataList(element, false);

    }
    else if (type === 'grid') {
        if (element.data('object-properties') === undefined) {
            $($(element).find('table >tbody')[1]).find('tr').remove().remove();
            $(element).find('table').css("height", "auto");
            $($(element).find('table >tbody')[1]).append('<tr valign="top" style="text-align:center;" ><td colspan="3"><label>Data source not selected!</label></td></tr>');
            return;
        }
        renderGrid(element);
        $(window).on('resize', function () {
            var elm = element.find('table')[0];
            var oTable = $('table', element).dataTable();
            if (oTable.length > 0) {
                $('.dataTables_scrollHeadInner').css("width", "100%");
                var tbl = $('#' + oTable[1].id).dataTable();
                tbl.fnAdjustColumnSizing(false);
            }
        });
    }
    else if (type === 'calendar') {
        var type = $(element).data('display-format');
        var defaultdate = $(element).data('default-date');
        var calendarId = $(element).parents('.cal-parent').find("input[type=text]").attr('id');
        var divid = $(element).attr('id');
        $('#' + divid).calendarsPicker('clear');
        $('#' + calendarId).val(defaultdate);
        $('#' + divid).calendarsPicker({
            calendar: $.calendars.instance(type),
            dateFormat: 'mm/dd/yyyy',
            defaultDate: defaultdate,
            selectDefaultDate: true,
            onSelect: function (dates) {
                $('#' + calendarId).val(dates);
            }
        });
        $('#' + divid).calendarsPicker('setDate', defaultdate);
        var calendarType = '';
        if (intialData && intialData[0] !== undefined && column !== undefined) {
            if (intialData[0][column] === null || intialData[0][column] === 'null') {
                $(element).parent().find(':input[type="text"]').calendarsPicker('setDate', '');
                $('#' + divid).calendarsPicker('setDate', '');
                $(element).parent().find(':input[type="text"]').val('');
            }
            else {
                var date = new Date(intialData[0][column]);
                var formatted = $.datepicker.formatDate("mm/dd/yy", new Date(intialData[0][column]));
                $(element).parent().find(':input[type="text"]').calendarsPicker('setDate', formatted);
                $('#' + divid).calendarsPicker('setDate', formatted);
                $(element).parent().find(':input[type="text"]').val(formatted);
            }
        }

        var timezone = $(element).data('timezone');
        if (timezone === 'on') {
            fsi.selectTimeZonesForCalendar(element);
        }
        if (element.attr('data-display-format')) {
            calendarType = element.attr('data-display-format');
        }
        $(element).find('option').filter(function () {
            return this.value === calendarType;
        }).attr('selected', 'selected');
        if (calendarType === 'islamic') {
            $(element).parent().find('.switcher').find('select').first().val(calendarType);
            $(element).parent().find('select').siblings('span').find('.ui-btn-text').first().html(calendarType === 'islamic' ? 'Hijri' : 'Gregorian');
            $(element).find('span .switcher').html('Hijri');
        }

    }
    else if (type === 'datatag') {
        if (intialData) {
            if (intialData[0][column] !== null && intialData[0][column] !== '') {
                var tags = intialData[0][column].split(',');
                $(element).find('#CustomTagEdit').tagit({
                    initialTags: tags
                });
            }
        }

        $(element).find('.CustomTagEdit').tagit({
            triggerKeys: ['enter', 'comma', 'tab'],
            sortable: true,
            editable: true,
            tagsChanged: function (a, b) {
                showtagList($('.CustomTagEdit .tags').tagit('tags'));
                $('#ShowtagAction').html(a + ' ' + b);
            }
        });
    }
    else if (type === 'htmlpanel') {
        if (intialData) {
            $(element).find('.nicEdit-main').html(intialData[0][column]);
        }
        var width = element.attr('data-width') === undefined ? 0 : element.attr('data-width');
        var width1 = element.attr('data-width') === undefined ? 0 : element.attr('data-width').split(' ');;
        var w = width1[0] + width1[1];
        var w1 = width1[0] - 2 + width1[1];
        $(element).find('.nicEdit-panelContain').parent().width(w);
        $(element).find('.nicEdit-panelContain').parent().next().width(w1);

        $(element).find('.nicEdit-main').on('click', 'a', function (e) {
            e.preventDefault();
            var link = $(this).attr('href');
            if (e.ctrlKey || e.shiftKey || e.type === 'click') {
                window.open(link, '_blank');
            }
        });
    }
    else if (type === "imagepanel") {
        //var permissionAttr = $(element).attr('data-permission_disable');
        //var isAssignedCustomPermission = false;
        //fsi.checkCustomPermssionExist(function (data) {
        //    if (data) {
        //        isAssignedCustomPermission = true;
        //    }
        //});
        //if (permissionAttr) {
        //    if ($(element).attr('data-permission_disable') != '--Select--' && isAssignedCustomPermission) {
        //        $(element).find('input').on('click', false);
        //    }
        //}
        if (intialData && column) {
            if (intialData[0][column]) {
                $(element).find("[id^=ui-imagepanel-]").css('background-image', 'url(data:image/jpeg;base64,' + intialData[0][column] + ')');
                $(element).attr('data-image-content', 'data:image/jpeg;base64,' + intialData[0][column]);
            }
        }
    }
    if (type === 'map') {
        renderMap(element);
    }
    if (type === 'treeview') {
        renderTreeView(element, intialData);
    }
    else if (type === 'documentlinker') {
        //var permissionAttr = $(element).attr('data-permission_disable');
        //var isAssignedCustomPermission = false;
        //fsi.checkCustomPermssionExist(function (data) {
        //    if (data) {
        //        isAssignedCustomPermission = true;
        //    }

        //});
        //if (permissionAttr) {
        //    if ($(element).attr('data-permission_disable') != '--Select--' && isAssignedCustomPermission) {
        //        $(element).find('input').on('click', false);
        //    }
        //}
        renderDocumentLinker(element, intialData);
    }
    else if (type === 'rssfeed') {
        renderRssFeed(element);
    }
    else if (type === 'chart') {
        renderChart(element);
    }
    else if (type === 'pivot') {
        renderPivotTable(element);
    }
    else if (type === 'slider') {
        var initialValue = $(element).attr('value');
        if (intialData) {
            initialValue = intialData[0][column];
            var a_tag = $(element).find('a');
            a_tag.attr('aria-valuenow', initialValue);
            a_tag.attr('aria-valuetext', initialValue);
            a_tag.attr('title', initialValue);
            a_tag.css('left', initialValue + "%")
        }
        $(element).find(':input[type="number"]').attr('value', initialValue);
        $(element).find(':input[type="number"]').off('change');
        $(element).find(':input[type="number"]').on('change', function () {
            this.focus();
            var number = $(element).find(':input[type="number"]');
            $(element).find(':input[type="text"]').val(number.val());
            $(element).find(':input[type="text"]').trigger('change');
        });
        // $(document).off('mousemove mouseover');
    }
    else if (type === 'social') {
        element.find('a').on('click', function ()
        {
            window.open(this.href, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600'); return false;
        })
    }
    else if (type === 'togglebutton') {
        if (intialData) {
            $(element).find(':input[type="checkbox"]').attr('checked', (intialData[0][column] === null ? false : intialData[0][column]));
            var columnValue = intialData[0][column] === null ? false : intialData[0][column];
            if (columnValue) {
                $(element).find('label').removeClass('ui-checkbox-off').addClass('ui-checkbox-on');
            } else {
                $(element).find('label').removeClass('ui-checkbox-on').addClass('ui-checkbox-off');
            }
        }
    }
    else if (type === 'help') {
        var popoverContent = $(element).find('.my-popover-content').html();
        popoverOptions = {
            content: popoverContent,
            trigger: 'hover',
            animation: false,
            html: true
        };
        $(element).find('.panel-heading').popover(popoverOptions);
    }
    else if (type === 'report') {
        fsi.renderReport(element);
    }
    else if (type === 'radio') {
        if (intialData) {
            $(element).find('input[type=radio]').each(function () {
                if (intialData[0][column] !== null && intialData[0][column] !== '' && $(this).val() === intialData[0][column]) {
                    $(this).prop('checked', true);
                    $(this).siblings('label').removeClass('ui-radio-off').addClass('ui-radio-on');
                    $(this).siblings('label').find('.ui-icon-shadow').removeClass('ui-icon-radio-off').addClass('ui-icon-radio-on');
                }

            });
        }
        else {
            if ($(element).data('defaultvalue') === 'yes' && $(element).data('radiostatus') === undefined) {
                var controlId = $(element).data('control-id');
                $('#' + controlId + '-0').attr('checked', 'checked');
                $('#' + controlId + '-0').prop('checked', true);
                $('#' + controlId + '-0').siblings('label').removeClass('ui-radio-off').addClass('ui-radio-on');
                $('#' + controlId + '-0').siblings('label').find('.ui-icon-shadow').removeClass('ui-icon-radio-off').addClass('ui-icon-radio-on');
            }
        }
    }
    else if (type === 'tabs') {
        var grids = element.find('div[data-role=dataGrid]');
        if (grids.length >= 0) {
            var tabs = element.find('li[role=tab]');
            var tabpanel = element.find('div[role=tabpanel]');
            $.each(tabs, function (i) {
                $(tabs[i]).find('span').on('click', function () {
                    fsi.refreshGrid($(tabpanel[i]).find('table')[1]);
                });

            })
        }
    }
}

/// <summary>
/// render control language
/// </summary>
/// <param name="element" type="type">element</param>
fsi.prototype.renderControlLanguage = function (element) {
    var type, column;
    type = $(element).data('control-type');
    column = $(element).data('object-column');
    if (type === 'button') {
        var ctrValue = $(element).find('button').attr('data-translatable');
        var ctrStyle = $(element).find('button').attr("style");
        if (ctrStyle.indexOf('background-image') > 0) {
            ctrStyle = ctrStyle.replace("background-image", " ");
        }
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrValue !== undefined && ctrValue.trim() === key) {
                    if (value === '') {
                        ctrValue = ctrValue;
                    } else {
                        ctrValue = value;
                    }
                }

            })
        }
        $(element).find('.ui-btn-inner.ui-btn-corner-all .ui-btn-text').html(ctrValue);
        $(element).find('.ui-btn-inner.ui-btn-corner-all .ui-btn-text').attr({
            style: ctrStyle
        });
        $(element).find('.ui-btn-inner.ui-btn-corner-all').attr({
            style: ctrStyle
        });
    }
    else if (type === 'action-button') {
        var ctrValue = $(element).find('span').attr('data-translatable');
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrValue !== undefined && ctrValue.trim() === key) {
                    if (value === '') {
                        ctrValue = ctrValue;
                    } else {
                        ctrValue = value;
                    }
                }
            })
        }
        $(element).find('.ui-btn-text').html(ctrValue);
    }
    else if (type === 'label') {
        var ctrValue = $(element).find('label').data('translatable');
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrValue !== undefined && ctrValue.trim() === key) {
                    if (value === '') {
                        ctrValue = ctrValue;
                    } else {
                        ctrValue = value;
                    }
                }

            })
        }
        $(element).find('label').html(ctrValue);
    }
    else if (type === 'textbox') {
        var ctrPlaceholderValue = $(element).find(':input').attr('data-translatable-placeholder');
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrPlaceholderValue !== undefined && ctrPlaceholderValue.trim() === key) {
                    if (value === '') {
                        ctrPlaceholderValue = ctrPlaceholderValue;
                    }
                    else {
                        ctrPlaceholderValue = value;
                    }
                }
            })
        }
        var ctrDefaultValue = $(element).find(':input').attr('data-translatable-value');
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrDefaultValue !== undefined && ctrDefaultValue.trim() === key) {
                    if (value === '') {
                        ctrDefaultValue = ctrDefaultValue;
                    }
                    else {
                        ctrDefaultValue = value;
                    }
                }
            })
        }
        var ctrErrorPatternMessageValue = $(element).find(':input').attr('data-translatable-error-pattern');
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrErrorPatternMessageValue !== undefined && ctrErrorPatternMessageValue.trim() === key) {
                    if (value === '') {
                        ctrErrorPatternMessageValue = ctrErrorPatternMessageValue;
                    }
                    else {
                        ctrErrorPatternMessageValue = value;
                    }
                }
            })
        }
        var ctrErrorMessageValue = $(element).find(':input').attr('data-translatable-error-required');
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrErrorMessageValue !== undefined && ctrErrorMessageValue.trim() === key) {
                    if (value === '') {
                        ctrErrorMessageValue = ctrErrorMessageValue;
                    }
                    else {
                        ctrErrorMessageValue = value;
                    }
                }
            })
        }
        $(element).find(':input').attr({
            'placeholder': ctrPlaceholderValue
        });
        $(element).find(':input').val(ctrDefaultValue);
        $(element).find(':input').attr({
            'error-pattern': ctrErrorPatternMessageValue
        });
        $(element).find(':input').attr({
            'error-required': ctrErrorMessageValue
        });


        var ctrlblValue = $(element).find('.lbl-translatable').data('translatable');
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrlblValue !== undefined && ctrlblValue.trim() === key) {
                    if (value === '') {
                        ctrlblValue = ctrlblValue;
                    } else {
                        ctrlblValue = value;
                    }
                }

            })
        }
        $(element).find('.lbl-translatable').html(ctrlblValue);
    }
    else if (type === 'textarea') {
        var ctrErrorMessageValue = $(element).find('div').attr('data-translatable');
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrErrorMessageValue !== undefined && ctrErrorMessageValue.trim() === key) {
                    if (value === '') {
                        ctrPlaceholderValue = ctrPlaceholderValue;
                    }
                    else {
                        ctrErrorMessageValue = value;
                    }
                }
            })
        }
        $(element).find('div').html(ctrErrorMessageValue);
        var ctrDefaultValue = $(element).find('textarea').attr('data-translatable-defaultvalue');
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrDefaultValue !== undefined && ctrDefaultValue.trim() === key) {
                    if (value === '') {
                        ctrDefaultValue = ctrDefaultValue;
                    }
                    else {
                        ctrDefaultValue = value;
                    }
                }
            })
        }
        $(element).find('textarea').html(ctrDefaultValue);

        var ctrlblValue = $(element).find('.lbl-translatable').data('translatable');
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrlblValue !== undefined && ctrlblValue.trim() === key) {
                    if (value === '') {
                        ctrlblValue = ctrlblValue;
                    } else {
                        ctrlblValue = value;
                    }
                }

            })
        }
        $(element).find('.lbl-translatable').html(ctrlblValue);
    }
    else if (type === 'checkbox') {
        var ctrCheckboxValue = $("label[for=" + $(element).find(':input').attr("id") + "]").attr('data-translatable');
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrCheckboxValue !== undefined && ctrCheckboxValue.trim() === key) {
                    if (value === '') {
                        ctrCheckboxValue = ctrCheckboxValue;
                    }
                    else {
                        ctrCheckboxValue = value;
                    }
                }
            })
        }
        $(element).find('span').find(':first').text(ctrCheckboxValue);
        var ctrCheckbocErrorMessageValue = $(element).find('.error-message').attr("data-translatable");
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrCheckbocErrorMessageValue !== undefined && ctrCheckbocErrorMessageValue.trim() === key) {
                    if (value === '') {
                        ctrCheckbocErrorMessageValue = ctrCheckbocErrorMessageValue;
                    }
                    else {
                        ctrCheckbocErrorMessageValue = value;
                    }
                }
            })
        }
        $(element).find('.error-message').html(ctrCheckbocErrorMessageValue);
        $(element).find('.error-message').html(ctrCheckbocErrorMessageValue);
    }
    else if (type === 'combo') {
        var ctrComboValue = [];
        var ctrComboChangedValue = [];
        $(element).find('option').each(function () {
            ctrComboValue.push($(this).attr("data-translatable"));
        });
        if (!$.isEmptyObject(fsi.LanguageData)) {
            for (var i = 0; i < ctrComboValue.length; i++) {
                $.each(fsi.LanguageData, function (key, value) {
                    $.each(fsi.LanguageData, function (key, value) {
                        if (ctrComboValue[i] !== undefined && ctrComboValue[i].trim() === key) {
                            if (value === '') {
                                ctrComboChangedValue[i] = ctrComboValue[i].trim();
                            }
                            else {
                                ctrComboChangedValue[i] = value;
                            }
                        }
                    })
                })
            }
        }
        $(element).find('option').each(function () {
            var index = $(this).index();
            $(this).html(ctrComboChangedValue[index]);
        });
        var ctrComboName = $(element).find('select').siblings('span').find('.ui-btn-text').text();
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrComboName !== undefined && ctrComboName.trim() === key) {
                    if (value === '') {
                        ctrComboName = ctrComboName;
                    }
                    else {
                        ctrComboName = value;
                    }
                }
            })
        }
        var ctrErrorMessageValue = $(element).find('.error-message').attr("data-translatable");
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrErrorMessageValue !== undefined && ctrErrorMessageValue.trim() === key) {
                    if (value === '') {
                        ctrErrorMessageValue = ctrErrorMessageValue;
                    } else {
                        ctrErrorMessageValue = value;
                    }
                }
            })
        }
        $(element).find('.error-message').html(ctrErrorMessageValue);
        $(element).find('select').siblings('span').find('.ui-btn-text').html(ctrComboName);

        var ctrlblValue = $(element).find('.lbl-translatable').data('translatable');
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrlblValue !== undefined && ctrlblValue.trim() === key) {
                    if (value === '') {
                        ctrlblValue = ctrlblValue;
                    } else {
                        ctrlblValue = value;
                    }
                }

            })
        }
        $(element).find('.lbl-translatable').html(ctrlblValue);

    }
    else if (type === 'currency') {
        var ctrPlaceholderValue = $(element).find(':input').attr('data-translatable-placeholder')
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrPlaceholderValue !== undefined && ctrPlaceholderValue.trim() === key) {
                    if (value === '') {
                        ctrPlaceholderValue = ctrPlaceholderValue;
                    } else {
                        ctrPlaceholderValue = value;
                    }
                }
            })
        }
        var ctrErrorMessageValue = $(element).find(':input').attr('data-translatable-error-required')
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrErrorMessageValue !== undefined && ctrErrorMessageValue.trim() === key) {
                    if (value === '') {
                        ctrErrorMessageValue = ctrErrorMessageValue;
                    } else {
                        ctrErrorMessageValue = value;
                    }
                }
            })
        }
        var ctrPatternErrorMessageValue = $(element).find(':input').attr('data-translatable-error-pattern')
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrPatternErrorMessageValue !== undefined && ctrPatternErrorMessageValue.trim() === key) {
                    if (value === '') {
                        ctrPatternErrorMessageValue = ctrPatternErrorMessageValue;
                    } else {
                        ctrPatternErrorMessageValue = value;
                    }
                }
            })
        }
        $(element).find(':input').attr({
            'placeholder': ctrPlaceholderValue
        });
        $(element).find(':input').attr({
            'error-required': ctrErrorMessageValue
        });
        $(element).find(':input').attr({
            'error-pattern': ctrPatternErrorMessageValue
        });

    }
    else if (type === 'datepicker') {
        var ctrDatepickerValue = $(element).find(':first').attr('data-translatable')
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrDatepickerValue !== undefined && ctrDatepickerValue.trim() === key) {
                    if (value === '') {
                        ctrDatepickerValue = ctrDatepickerValue;
                    }
                    else {
                        ctrDatepickerValue = value;
                    }
                }
            })
        }

        $(element).find(':first').html(ctrDatepickerValue);
        var ctrErrorMessageValue = $(element).find('div.error-message').attr('data-translatable');
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrErrorMessageValue != undefined && ctrErrorMessageValue.trim() === key) {
                    if (value === '') {
                        ctrErrorMessageValue = ctrErrorMessageValue
                    }
                    else {
                        ctrErrorMessageValue = value;
                    }
                }
            })
        }
        $(element).find('div.error-message').html(ctrErrorMessageValue);
        $(element).find(':input').attr('error-required', ctrErrorMessageValue);

        var ctrlblValue = $(element).find('.lbl-translatable').data('translatable');
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrlblValue !== undefined && ctrlblValue.trim() === key) {
                    if (value === '') {
                        ctrlblValue = ctrlblValue;
                    } else {
                        ctrlblValue = value;
                    }
                }

            })
        }
        $(element).find('.lbl-translatable').html(ctrlblValue);

    }
    else if (type === 'timepicker') {
        var ctrDatepickerValue = $(element).find(':first').attr('data-translatable')
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrDatepickerValue !== undefined && ctrDatepickerValue.trim() === key) {
                    if (value === '') {
                        ctrDatepickerValue = ctrDatepickerValue;
                    }
                    else {
                        ctrDatepickerValue = value;
                    }
                }
            })
        }

        $(element).find(':first').html(ctrDatepickerValue);

        var ctrErrorMessageValue = $(element).find('div').attr('data-translatable');
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrErrorMessageValue !== undefined && ctrErrorMessageValue.trim() === key) {
                    if (value === '') {
                        ctrErrorMessageValue = ctrErrorMessageValue
                    }
                    else {
                        ctrErrorMessageValue = value;
                    }
                }
            })
        }
        $(element).find('div').html(ctrErrorMessageValue);
        $(element).find(':input').attr('error-required', ctrErrorMessageValue);

        var cntrlId = $(element).data('control-id');
        var ctrlblValue = $(element).siblings('.' + cntrlId).find('.lbl-translatable').data('translatable');
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrlblValue !== undefined && ctrlblValue.trim() === key) {
                    if (value === '') {
                        ctrlblValue = ctrlblValue;
                    } else {
                        ctrlblValue = value;
                    }
                }

            })
        }
        $(element).siblings('.' + cntrlId).find('.lbl-translatable').html(ctrlblValue);

    }
    else if (type === 'link') {
        var ctrLinkValue = $(element).find('a').attr('data-translatable')
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrLinkValue !== undefined && ctrLinkValue.trim() === key) {
                    if (value === '') {
                        ctrLinkValue = ctrLinkValue;
                    }
                    else {
                        ctrLinkValue = value;
                    }
                }
            })
        }
        $(element).find('a').html(ctrLinkValue);
    }
    else if (type === 'radio') {
        var ctrRadioValue = [];
        var ctrRadioChangedValue = [];
        var ctrCheckboxValue = $("label[for=" + $(element).find(':input').attr("id") + "]").attr('data-translatable');
        $(element).find('fieldset').find('label').each(function () {
            ctrRadioValue.push($(this).attr('data-translatable'));
        });
        if (!$.isEmptyObject(fsi.LanguageData)) {
            for (var i = 0; i < ctrRadioValue.length; i++) {
                $.each(fsi.LanguageData, function (key, value) {
                    if (ctrRadioValue[i] !== undefined && ctrRadioValue[i].trim() === key) {
                        if (value === '') {
                            ctrRadioChangedValue[i] = ctrRadioValue[i];
                        }
                        else {
                            ctrRadioChangedValue[i] = value;
                        }
                    }
                })
            }
        }
        $(element).find('fieldset').find('label').find('.ui-btn-text').each(function (i) {
            $(this).html(ctrRadioChangedValue[i]);
        });
        var ctrErrorMessageValue = $(element).find('.error-message').attr("data-translatable");
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrErrorMessageValue !== undefined && ctrErrorMessageValue.trim() === key) {
                    if (value === '') {
                        ctrErrorMessageValue = ctrErrorMessageValue;
                    } else {
                        ctrErrorMessageValue = value;
                    }
                }
            })
        }
        $(element).find('.error-message').html(ctrErrorMessageValue);


        var ctrlblValue = $(element).find('.lbl-translatable').data('translatable');
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrlblValue !== undefined && ctrlblValue.trim() === key) {
                    if (value === '') {
                        ctrlblValue = ctrlblValue;
                    } else {
                        ctrlblValue = value;
                    }
                }

            })
        }
        $(element).find('.lbl-translatable').html(ctrlblValue);
    }
    else if (type === "accordion") {
        var ctrAccordionValue = [];
        var ctrAccordionChangedValue = [];
        $(element).find('span').find('div').each(function () {
            ctrAccordionValue.push($(this).html());
        });

        if (!$.isEmptyObject(fsi.LanguageData)) {
            for (var i = 0; i < ctrAccordionValue.length; i++) {
                $.each(fsi.LanguageData, function (key, value) {
                    if (ctrAccordionValue[i] !== undefined && ctrAccordionValue[i].trim() === key) {
                        if (value === '') {
                            ctrAccordionChangedValue[i] = ctrAccordionValue[i];
                        }
                        else {
                            ctrAccordionChangedValue[i] = value;
                        }
                    }
                })
            }
        }
        $(element).find('span').find('div').each(function (i) {
            $(this).html(ctrAccordionChangedValue[i]);
        });
    }
    else if (type === 'collapsible') {
        var ctrCollapsibleValue = $(element).find('.collapsible-heading').find('.ui-btn-text').html();
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrCollapsibleValue !== undefined && ctrCollapsibleValue.trim() === key) {
                    if (value === '') {
                        ctrCollapsibleValue = ctrCollapsibleValue;
                    }
                    else {
                        ctrCollapsibleValue = value;
                    }
                }
            })
        }
        $(element).find('.collapsible-heading').find('.ui-btn-text').html(ctrCollapsibleValue);
    }

    else if (type === "tabs") {
        var ctrTabsValue = [];
        var ctrTabsChangedValue = [];
        $(element).find('a').find('.ui-btn-inner').each(function () {
            ctrTabsValue.push($(this).html());
        });
        if (!$.isEmptyObject(fsi.LanguageData)) {
            for (var i = 0; i < ctrTabsValue.length; i++) {
                $.each(fsi.LanguageData, function (key, value) {
                    if (ctrTabsValue[i] !== undefined && ctrTabsValue[i].trim() === key) {
                        if (value === '') {
                            ctrTabsChangedValue[i] = ctrTabsChangedValue[i];
                        }
                        else {
                            ctrTabsChangedValue[i] = value;
                        }
                    }
                })
            }
        }
        $(element).find('a').find('.ui-btn-inner').each(function (i) {
            $(this).html(ctrTabsChangedValue[i]);
        });
    }
    else if (type === 'color') {
        jscolor.init();
    }
    else if (type === 'numberbox') {
        var ctrPlaceholderValue = $(element).find(':input').attr('data-translatable-placeholder')
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrPlaceholderValue !== undefined && ctrPlaceholderValue.trim() === key) {
                    if (value === '') {
                        ctrPlaceholderValue = ctrPlaceholderValue;
                    }
                    else {
                        ctrPlaceholderValue = value;
                    }
                }
            })
        }

        var ctrErrorMessageValue = $(element).find('.error-message').attr("data-translatable");
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrErrorMessageValue !== undefined && ctrErrorMessageValue.trim() === key) {
                    if (value === '') {
                        ctrErrorMessageValue = ctrErrorMessageValue;
                    } else {
                        ctrErrorMessageValue = value;
                    }
                }
            })
        }
        $(element).find('.error-message').html(ctrErrorMessageValue);
        $(element).find(':input').attr({
            'placeholder': ctrPlaceholderValue
        });

        var ctrlblValue = $(element).find('.lbl-translatable').data('translatable');
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrlblValue !== undefined && ctrlblValue.trim() === key) {
                    if (value === '') {
                        ctrlblValue = ctrlblValue;
                    } else {
                        ctrlblValue = value;
                    }
                }

            })
        }
        $(element).find('.lbl-translatable').html(ctrlblValue);
    }
    else if (type === 'datalist') {

        var ctrdatalistPageDocumentValue = $(element).attr("data-translatable-page-document-lable");
        var ctrdatalistValue = $(element).find('span').attr('data-translatable');
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrdatalistPageDocumentValue !== undefined && ctrdatalistPageDocumentValue.trim() === key) {
                    if (value === '') {
                        ctrdatalistPageDocumentValue = ctrdatalistPageDocumentValue;
                    } else {
                        ctrdatalistPageDocumentValue = value;
                    }
                }
            })
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrdatalistValue !== undefined && ctrdatalistValue.trim() === key) {
                    if (value === '') {
                        ctrdatalistValue = ctrdatalistValue;
                    } else {
                        ctrdatalistValue = value;
                    }
                }
            })
        }
        $(element).attr({
            "data-page-document-lable": ctrdatalistPageDocumentValue
        });
        $(element).find('header .list-header-text').html(ctrdatalistValue);
    }

    else if (type === 'grid') {
        var ctrDataGridValue = $(element).find(':first').attr('data-translatable');
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrDataGridValue !== undefined && ctrDataGridValue.trim() === key) {
                    if (value === '') {
                        ctrDataGridValue = ctrDataGridValue;
                    } else {
                        ctrDataGridValue = value;
                    }
                }
            })
        }
        $(element).find(':first').html(ctrDataGridValue);
        if (element.data('object-properties') === undefined) {
            return;
        }
    }
    else if (type === 'calendar') {
        var ctrNextValue = $(element).data('nexttranslatable');
        var ctrPrevValue = $(element).data('prevtranslatable');
        var ctrTodayValue = $(element).data('todaytranslatable');
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrNextValue !== undefined && ctrNextValue.trim() === key) {
                    if (value === '') {
                        ctrNextValue = ctrNextValue;
                    } else {
                        ctrNextValue = value;
                    }
                }
                else if (ctrPrevValue !== undefined && ctrPrevValue.trim() === key) {
                    if (value === '') {
                        ctrPrevValue = ctrPrevValue;
                    } else {
                        ctrPrevValue = value;
                    }
                }
                else if (ctrTodayValue !== undefined && ctrTodayValue.trim() === key) {
                    if (value === '') {
                        ctrTodayValue = ctrTodayValue;
                    } else {
                        ctrTodayValue = value;
                    }
                }
            })
        }
        $.calendars.picker._defaults.nextText = ctrNextValue + '&gt;';
        $.calendars.picker._defaults.prevText = '&lt;' + ctrPrevValue;
        $.calendars.picker._defaults.todayText = ctrTodayValue;

        var calendarType = '';
        var timezone = $(element).data('timezone');
        if (timezone === 'on') {
            fsi.selectTimeZonesForCalendar(element);
        }
        if (element.attr('data-display-format')) {
            calendarType = element.attr('data-display-format');
        }
        $(element).find('option').filter(function () {
            return this.value === calendarType;
        }).attr('selected', 'selected');
        if (calendarType === 'islamic') {
            $(element).parent().find('.switcher').find('select').first().val(calendarType);
            $(element).parent().find('select').siblings('span').find('.ui-btn-text').first().html(calendarType === 'islamic' ? 'Hijri' : 'Gregorian');
            $(element).find('span .switcher').html('Hijri');
        }
    }
    else if (type === 'datatag') {
        var ctrDatatagValue = $(element).find('label').attr('data-translatable');

        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrDatatagValue !== undefined && ctrDatatagValue.trim() === key) {
                    if (value === '') {
                        ctrDatatagValue = ctrDatatagValue;
                    } else {
                        ctrDatatagValue = value;
                    }
                }
            })
        }
        $(element).find('label').html(ctrDatatagValue);
    }
    else if (type === "imagepanel") {
        var ctrTitleValue = $(element).attr('data-translatable');
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrTitleValue !== undefined && ctrTitleValue.trim() === key) {
                    if (value === '') {
                        ctrTitleValue = ctrTitleValue;
                    } else {
                        ctrTitleValue = value;
                    }
                }
            })
        }
        var fileControl = $(element).find('.file-input.btn.btn-primary.btn-file').find(':input');
        $(element).find('.file-input.btn.btn-primary.btn-file').text(ctrTitleValue);
        $(element).find('.file-input.btn.btn-primary.btn-file').append(fileControl);
        //var permissionAttr = $(element).attr('data-permission_disable');
        //var isAssignedCustomPermission = false;
        //fsi.checkCustomPermssionExist(function (data) {
        //    if (data) {
        //        isAssignedCustomPermission = true;
        //    }
        //});
        //if (permissionAttr) {
        //    if ($(element).attr('data-permission_disable') != '--Select--' && isAssignedCustomPermission) {
        //        $(element).find('input').on('click', false);
        //    }
        //}
    }
    if (type === 'map') {
        // header translation
        var mapHeaderValue = $(element).find('.maphead').data('translatable');
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (mapHeaderValue !== undefined && mapHeaderValue.trim() === key) {
                    if (value === '') {
                        mapHeaderValue = mapHeaderValue;
                    } else {
                        mapHeaderValue = value;
                    }
                }
            })
        };
        $(element).find('.maphead span').html('&nbsp;' + mapHeaderValue + '&nbsp;');

        // footer translation
        var mapFooterValue = $(element).find('.mapfoot').data('translatable');
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (mapFooterValue !== undefined && mapFooterValue.trim() === key) {
                    if (value === '') {
                        mapFooterValue = mapFooterValue;
                    } else {
                        mapFooterValue = value;
                    }
                }
            })
        };
        $(element).find('.mapfoot span').html('&nbsp;' + mapFooterValue + '&nbsp;');
    }
    if (type === 'treeview') {
        var ctrTreeViewDefaultValueData = $(element).attr("data-translatable-defaultnode");
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrTreeViewDefaultValueData !== undefined && ctrTreeViewDefaultValueData.trim() === key) {
                    if (value === '') {
                        ctrTreeViewDefaultValueData = ctrTreeViewDefaultValueData;
                    } else {
                        ctrTreeViewDefaultValueData = value;
                    }
                }
            })
        }
        $(element).attr({
            "data-defaultnode": ctrTreeViewDefaultValueData
        });
    }
    else if (type === 'documentlinker') {

        var ctrTitleValue = $(element).attr('data-translatable');
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrTitleValue !== undefined && ctrTitleValue.trim() === key) {
                    if (value === '') {
                        ctrTitleValue = ctrTitleValue;
                    } else {
                        ctrTitleValue = value;
                    }
                }
            })
        }

        //        var fileControl = $(element).find('.btn-browse.btn-file').find(':input');
        $(element).find('.btn-browse.btn-file').find('a').text(ctrTitleValue);
        //      $(element).find('.btn-browse.btn-file').append(fileControl);

        //var permissionAttr = $(element).attr('data-permission_disable');
        //var isAssignedCustomPermission = false;
        //fsi.checkCustomPermssionExist(function (data) {
        //    if (data) {
        //        isAssignedCustomPermission = true;
        //    }
        //});
        //if (permissionAttr) {
        //    if ($(element).attr('data-permission_disable') != '--Select--' && isAssignedCustomPermission) {
        //        $(element).find('input').on('click', false);
        //    }
        //}
    }
    else if (type === 'rssfeed') {
        // header translation
        var rssfeedHeaderValue = $(element).data('translatable');
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (rssfeedHeaderValue !== undefined && rssfeedHeaderValue.trim() === key) {
                    if (value === '') {
                        rssfeedHeaderValue = rssfeedHeaderValue;
                    } else {
                        rssfeedHeaderValue = value;
                    }
                }
            })
        };
        $(element).find('header div h2').html(rssfeedHeaderValue);
    }
    else if (type === 'chart') {
        // header translation
        var chartHeaderValue = $(element).find('table tr:first span').data('translatable');
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (chartHeaderValue !== undefined && chartHeaderValue.trim() === key) {
                    if (value === '') {
                        chartHeaderValue = chartHeaderValue;
                    } else {
                        chartHeaderValue = value;
                    }
                }
            })
        };
        $(element).find('table tr:first span').html(chartHeaderValue);

        // footer translation
        var chartFooterValue = $(element).find('table tr:last span').data('translatable');
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (chartFooterValue !== undefined && chartFooterValue.trim() === key) {
                    if (value === '') {
                        chartFooterValue = chartFooterValue;
                    } else {
                        chartFooterValue = value;
                    }
                }
            })
        };
        $(element).find('table tr:last span').html(chartFooterValue);

        // X-Axis translation
        var xAxisValue = $(element).find('table tr:nth-child(2) td:first h6').data('translatable');
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (xAxisValue !== undefined && xAxisValue.trim() === key) {
                    if (value === '') {
                        xAxisValue = xAxisValue;
                    } else {
                        xAxisValue = value;
                    }
                }
            })
        };
        $(element).find('table tr:nth-child(2) td:first h6').html(xAxisValue);

        // Y-Axis translation
        var yAxisValue = $(element).find('table tr:nth-child(2) td:last h6').data('translatable');
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (yAxisValue !== undefined && yAxisValue.trim() === key) {
                    if (value === '') {
                        yAxisValue = yAxisValue;
                    } else {
                        yAxisValue = value;
                    }
                }
            })
        };
        $(element).find('table tr:nth-child(2) td:last h6').html(yAxisValue);
    }
    else if (type === 'pivot') {
        var ctrPivotDataValue = $(element).find('span').attr('data-translatable');
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrPivotDataValue !== undefined && ctrPivotDataValue.trim() === key) {
                    if (value === '') {
                        ctrPivotDataValue = ctrPivotDataValue;
                    } else {
                        ctrPivotDataValue = value;
                    }
                }
            })
        };
        $(element).find('span').html(ctrPivotDataValue);
    }
    else if (type === 'social') {
        //language should be implemented here
        //element.find('a').on('click', function () {
        //    window.open(this.href, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600'); return false;
        //})
    }
    else if (type === 'help') {
        var ctrHelpTitle = $(element).find('a').data('translatable');
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrHelpTitle !== undefined && ctrHelpTitle.trim() === key) {
                    if (value === '') {
                        ctrHelpTitle = ctrHelpTitle;
                    }
                    else {
                        ctrHelpTitle = value;
                    }
                }
            })
        }
        $(element).find('a').attr('title', ctrHelpTitle);
        var ctrHelpTooltip = $(element).data('translatable-tooltip');
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrHelpTooltip !== undefined && ctrHelpTooltip.trim() === key) {
                    if (value === '') {
                        ctrHelpTooltip = ctrHelpTooltip;
                    }
                    else {
                        ctrHelpTooltip = value;
                    }
                }
            })
        }
        $(element).children('div').attr('title', ctrHelpTooltip);


        //popoverOptions = {
        //    content: function () {
        //        // Get the content from the hidden sibling.
        //        return $(this).siblings('.my-popover-content').html();
        //    },
        //    trigger: 'hover',
        //    animation: false,
        //    delay: {
        //        show: 100, hide: 1000
        //    },
        //    html: true,
        //    placement: 'bottom'
        //};
        //$(element).find('.panel-heading').popover(popoverOptions);
        //$('.panel-heading').popover({
        //    delay: {
        //        show: 100, hide: 3000
        //    }
        //});
    }
    else if (type === 'report') {
        var ctrReportTitle = $(element).find('header span').data('translatable');
        if (!$.isEmptyObject(fsi.LanguageData)) {
            $.each(fsi.LanguageData, function (key, value) {
                if (ctrReportTitle !== undefined && ctrReportTitle.trim() === key) {
                    if (value === '') {
                        ctrReportTitle = ctrReportTitle;
                    }
                    else {
                        ctrReportTitle = value;
                    }
                }
            })
        }
        $(element).find('header span').html(ctrReportTitle);

    }
}

/// <summary>
/// select time zones
/// </summary>
/// <param name="element" type="type">element</param>
fsi.prototype.selectTimeZones = function (element) {
    var tenantUrl = fsi.tenant
    var myurl = tenantUrl + '/GetTimeZones?id=' + fsi.formId;
    $.ajax({
        cache: false,
        url: myurl,
        type: 'GET',
        beforeSend: function () {

        },
        success: function (data) {
            if (data.isSuccess && data.timeZones.length > 0) {
                var timeZoneDropdown = '<select class="time-zone">';
                $(data.timeZones).each(function (key, value) {
                    if (value.IsDefault) {
                        timeZoneDropdown += '<option value="' + value.Code + '" selected="selected">' + value.Name + '</option>';
                    }
                    else {
                        timeZoneDropdown += '<option value="' + value.Code + '">' + value.Name + '</option>';
                    }
                });
                timeZoneDropdown += '</select>';
                $(element).append(timeZoneDropdown);
            }
        },
        error: function (x, y, z) {
        },
    });
}

/// <summary>
/// select timezones for calendar
/// </summary>
/// <param name="element" type="type">element</param>
fsi.prototype.selectTimeZonesForCalendar = function (element) {
    var tenantUrl = fsi.tenant
    var myurl = tenantUrl + '/GetTimeZones?id=' + fsi.formId;
    $.ajax({
        cache: false,
        url: myurl,
        type: 'GET',
        beforeSend: function () {

        },
        success: function (data) {
            if (data.isSuccess && data.timeZones.length > 0) {
                var timeZoneDropdown = element.parent().find('.timezone').find('select').empty();
                $(data.timeZones).each(function (key, value) {
                    if (value.IsDefault) {
                        timeZoneDropdown.append('<option value="' + value.Code + '" selected="selected">' + value.Name + '</option>');
                    }
                    else {
                        timeZoneDropdown.append('<option value="' + value.Code + '">' + value.Name + '</option>');
                    }
                });
                element.parent().find('.timezone').find('select').siblings('span').find('.ui-btn-text').html('<span>' + element.parent().find('.timezone').find('select option:selected').text() + '</span>');
            }
        },
        error: function (x, y, z) {
        },
    });
}

/// <summary>
/// render date picker
/// </summary>
/// <param name="element" type="type">element</param>
renderDatePicker = function (element) {
    var type = $(element).data('display-format');
    var defaultdate = $(element).data('default-date');
    var minDate = $(element).data('min-date');
    var maxDate = $(element).data('max-date');
    var dateFormat = $(element).data('dateformat');
    var position = $(element).data('position');
    var theme = $(element).data('theme');
    var datepickerID = $(element).find("input[type=text]").attr('id');
    $('#' + datepickerID).calendarsPicker('clear');
    $('#' + datepickerID).val(defaultdate);
    $('#' + datepickerID).calendarsPicker({
        showOnFocus: true, pickerClass: theme,
        calendar: $.calendars.instance(type),
        dateFormat: dateFormat,
        defaultDate: defaultdate, selectDefaultDate: true,
        minDate: minDate,
        maxDate: maxDate,
        alignment: position,
        yearRange: 'c-50:c+50',
        showTrigger: '<img src="' + rootImageUrl + 'calendar.gif" alt="Popup" class="trigger dtp-ico">',
        onSelect: function (d, i) {
            if (i === undefined || d !== i.lastVal) {
                $(this).change();
            }
        }
    });
    var imgDateIcon = $("[id^=datePickerImage]");
    if (imgDateIcon !== null || imgDateIcon !== undefined) {
        imgDateIcon.hide();
    }
}

/// <summary>
/// get default gregorian date
/// </summary>
/// <param name="defaultDate" type="type">default date</param>
/// <param name="calendarType" type="type">calendar type</param>
/// <param name="dateFormat" type="type">date format</param>
/// <returns type=""></returns>
getDefaultGregorianDate = function (defaultDate, calendarType, dateFormat) {
    var arrDate = defaultDate.split('/');
    var year = arrDate[0];
    var month = arrDate[1];
    var day = arrDate[2];
    if (dateFormat === "mm/dd/yyyy") {
        var year = arrDate[2];
        var month = arrDate[0];
        var day = arrDate[1];
    }
    else if (dateFormat === "dd/mm/yyyy") {
        var year = arrDate[2];
        var month = arrDate[1];
        var day = arrDate[0];
    }
    else if (dateFormat === "yyyy/mm/dd") {
        var year = arrDate[0];
        var month = arrDate[1];
        var day = arrDate[2];
    }
    var date = month + '/' + day + '/' + year;
    if (calendarType === "islamic") {
        var jd = $.calendars.instance(calendarType).newDate(
                    parseInt(year, 10),
                    parseInt(month, 10),
                    parseInt(day, 10)).toJD();
        date = getLocalizeDate("gregorian", jd, "mm/dd/yyyy");
    }
    return date;

}

/// <summary>
/// get date timestamp
/// </summary>
/// <param name="defaultDate" type="type">default date</param>
/// <param name="calendarType" type="type">calendar type</param>
/// <param name="dateFormat" type="type">date format</param>
/// <returns type=""></returns>
getDateTimestamp = function (defaultDate, calendarType, dateFormat) {
    var arrDate = defaultDate.split('/');
    var year = arrDate[0];
    var month = arrDate[1];
    var day = arrDate[2];
    if (dateFormat === "mm/dd/yyyy") {
        var year = arrDate[2];
        var month = arrDate[0];
        var day = arrDate[1];
    }
    else if (dateFormat === "dd/mm/yyyy") {
        var year = arrDate[2];
        var month = arrDate[1];
        var day = arrDate[0];
    }
    else if (dateFormat === "yyyy/mm/dd") {
        var year = arrDate[0];
        var month = arrDate[1];
        var day = arrDate[2];
    }

    var date = new Date();
    date.setYear(year);
    date.setMonth(month - 1);
    date.setDate(day);
    if (calendarType === "islamic") {
        var jd = $.calendars.instance(calendarType).newDate(
                    parseInt(year, 10),
                    parseInt(month, 10),
                    parseInt(day, 10)).toJD();
        date = getLocalizeDate("gregorian", jd, "mm/dd/yyyy");
    }
    return date.getTime();
}

/// <summary>
/// get datetime stamp for calendar
/// </summary>
/// <param name="defaultDate" type="type">default date</param>
/// <param name="calendarType" type="type">calendar type</param>
/// <param name="dateFormat" type="type">date format</param>
/// <returns type=""></returns>
getDateTimestampForCalendar = function (defaultDate, calendarType, dateFormat) {
    var arrDate = defaultDate.split('-');
    var year = arrDate[0];
    var month = arrDate[1];
    var day = arrDate[2];
    if (dateFormat === "mm-dd-yyyy") {
        var year = arrDate[2];
        var month = arrDate[0];
        var day = arrDate[1];
    }
    else if (dateFormat === "dd-mm-yyyy") {
        var year = arrDate[2];
        var month = arrDate[1];
        var day = arrDate[0];
    }
    else if (dateFormat === "yyyy-mm-dd") {
        var year = arrDate[0];
        var month = arrDate[1];
        var day = arrDate[2];
    }

    var date = new Date();
    date.setYear(year);
    date.setMonth(month - 1);
    date.setDate(day);
    if (calendarType === "islamic") {
        var jd = $.calendars.instance(calendarType).newDate(
                    parseInt(year, 10),
                    parseInt(month, 10),
                    parseInt(day, 10)).toJD();
        date = getLocalizeDate("gregorian", jd, "mm/dd/yyyy");
    }
    return date.getTime();
}

/// <summary>
/// get date time object
/// </summary>
/// <param name="calendarType" type="type">calendar type</param>
/// <param name="dateFormat" type="type">date format</param>
/// <param name="dateString" type="type">date string</param>
/// <returns type=""></returns>
getDateTimeObject = function (calendarType, dateFormat, dateString) {
    var arrDate = dateString.split('/');
    if (dateFormat === "mm/dd/yyyy") {
        var year = arrDate[2];
        var month = arrDate[0];
        var day = arrDate[1];
    }
    else if (dateFormat === "dd/mm/yyyy") {
        var year = arrDate[2];
        var month = arrDate[1];
        var day = arrDate[0];
    }
    else if (dateFormat === "yyyy/mm/dd") {
        var year = arrDate[0];
        var month = arrDate[1];
        var day = arrDate[2];
    }

    var currentDate = new Date();
    var calType = calendarType;
    var prevCalType = "gregorian";
    if (calendarType === "islamic") {
        var jd = $.calendars.instance(prevCalType).newDate(
                    parseInt(year, 10),
                    parseInt(month, 10),
                    parseInt(day, 10)).toJD();
        currentDate = getLocalizeDate(calType, jd, "mm/dd/yyyy");
    }
    else if (calendarType === "gregorian") {
        currentDate.setYear(year);
        currentDate.setMonth(month - 1);
        currentDate.setDate(day);
    }
    return currentDate;
}

/// <summary>
/// get datetime string
/// </summary>
/// <param name="calendarType" type="type">calendar type</param>
/// <param name="dateFormat" type="type">date format</param>
/// <param name="date" type="type">date</param>
/// <returns type=""></returns>
getDateTimeString = function (calendarType, dateFormat, date) {
    var currentDate;
    var calType = calendarType;
    var prevCalType = "gregorian";
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    if (calendarType === "islamic") {
        var jd = $.calendars.instance(prevCalType).newDate(
                    parseInt(year, 10),
                    parseInt(month, 10),
                    parseInt(day, 10)).toJD();
        currentDate = getLocalizeDate(calType, jd, dateFormat);
    }
    else if (calendarType === "gregorian") {
        if (day < 10) {
            day = '0' + day;
        }
        if (month < 10) {
            month = '0' + month;
        }
        if (dateFormat === "mm/dd/yyyy") {
            currentDate = month + '/' + day + '/' + year;
        }
        else if (dateFormat === "dd/mm/yyyy") {
            currentDate = day + '/' + month + '/' + year;
        }
        else if (dateFormat === "yyyy/mm/dd") {
            currentDate = year + '/' + month + '/' + day;
        }
    }
    return currentDate;
}

/// <summary>
/// get localize date
/// </summary>
/// <param name="name" type="type">name</param>
/// <param name="jd" type="type">jd</param>
/// <param name="dateFormat" type="type">date format</param>
/// <returns type=""></returns>
getLocalizeDate = function (name, jd, dateFormat) {
    try {
        var date = $.calendars.instance(name).fromJD(jd);
        var Year = date.formatYear();
        var Month = date.month();
        var Day = date.day();
        if (dateFormat === 'dd/mm/yyyy') {
            return Day + '/' + Month + '/' + Year;
        }
        else
            if (dateFormat === 'mm/dd/yyyy') {
                return Month + '/' + Day + '/' + Year;
            }
            else
                if (dateFormat === 'yyyy/mm/dd') {
                    return Year + '/' + Month + '/' + Day;
                }
    }
    catch (e) {
        console.log(e);
        return null;
    }
}

/// <summary>
/// render time picker
/// </summary>
/// <param name="element" type="type">element</param>
/// <param name="initialdata" type="type">initial data</param>
renderTimePicker = function (element, initialdata) {
    var minHrs = '';
    var minMin = '';
    var maxHrs = '';
    var maxMin = '';
    var timeFormat = true;
    timeFormat = $(element).data('timeformat') === 12 ? true : false;
    var defaulttime = '';
    if (initialdata !== '' && initialdata !== undefined && initialdata !== null) {
        var dtLocal = initialdata.replace('T', ' ');
        var dt = new Date(dtLocal);
        var hh = dt.getHours();
        var mm = dt.getMinutes();
        defaulttime = hh + ':' + mm;
    } else if ($(element).data('default-time') !== '') {
        defaulttime = $(element).data('default-time');
    } else {
        defaulttime = '';
    }
    if (timeFormat) {
        defaulttime = ConvertTimeTo12format(defaulttime);
    }
    var minTime = $(element).data('min-date');
    if (minTime !== '') {
        if (timeFormat) {
            minHrs = ConvertTimeformat('H', minTime);//minTime.split(':')[0];
            minMin = ConvertTimeformat('M', minTime);//minTime.split(':')[1].split(' ')[0]
        } else {
            minHrs = minTime.split(':')[0];
            minMin = minTime.split(':')[1].split(' ')[0]
        }
    }
    var maxTime = $(element).data('max-date');
    if (maxTime !== '') {
        if (timeFormat) {
            maxHrs = ConvertTimeformat('H', maxTime); //maxTime.split(':')[0] != '' ? maxTime.split(':')[0] : 23;
            maxMin = ConvertTimeformat('M', maxTime);//maxTime.split(':')[1].split(' ')[0] != '' ? maxTime.split(':')[1].split(' ')[0] : 55;
        }
        else {
            maxHrs = maxTime.split(':')[0] !== '' ? maxTime.split(':')[0] : 23;
            maxMin = maxTime.split(':')[1].split(' ')[0] !== '' ? maxTime.split(':')[1].split(' ')[0] : 55;
        }
    }
    var timepickerID = $(element).find("input[type=text]").attr('id');

    $('#' + timepickerID).val(defaulttime);
    $('#' + timepickerID).timepicker({
        showPeriod: timeFormat,
        showLeadingZero: true,
        showNowButton: true,
        minutes: {
            interval: 3
        },
        rows: 4,
        minTime: {
            hour: minHrs, minute: minMin
        },
        maxTime: {
            hour: maxHrs, minute: maxMin
        },
    });
    $(element).children('.glyphicon-time').on("click", function () {
        $(this).siblings('input[type=text]').timepicker("show");
    });
}

/// <summary>
/// render rss feed
/// </summary>
/// <param name="element" type="type">element</param>
renderRssFeed = function (element) {
    var tableName = 'null', columnName = 'null';
    var rssUrl = '';
    if (element.attr('data-related-table')) {
        tableName = element.attr('data-related-table');
    }
    if (element.attr('data-rssurl')) {
        rssUrl = element.attr('data-rssurl');
    }
    where = {
    };
    fsi.selectDataObject(tableName, where, function (data) {
        if (element.attr('data-object-properties')) {
            columnName = element.attr('data-object-properties');
        }
        if (data !== '') {
            var result = JSON.parse(data);
            if (result[0][columnName] !== null) {
                element.attr('data-rssurl', result[0][columnName]);
            }
        }
    });
}

/// <summary>
/// add data chart filter
/// </summary>
/// <param name="ctrlSelector" type="type">ctrl selector</param>
/// <param name="dataChartSelector" type="type">data chart selector</param>
fsi.prototype.addDataChartFilter = function (ctrlSelector, dataChartSelector) {
    $(ctrlSelector).on('change', function (event) {
        $('form').off('submit');
        $('form').on('submit', function () {
            return false;
        });
        renderChart(dataChartSelector);
    });
};

/// <summary>
/// render chart control
/// </summary>
/// <param name="element" type="type">element</param>
renderChart = function (element) {
    element.find('canvas').empty();
    element.find('.chartLegend').empty();
    var tableName = 'null';
    var displayColumn = '';
    var bindedColumns = [];
    var chartType = '';
    if (element.attr('data-related-table')) {
        tableName = element.attr('data-related-table');
    }
    if (element.attr('data-object-properties')) {
        var objectProperties = element.attr('data-object-properties');
        bindedColumns = objectProperties.split(',');
    }
    if (element.attr('data-chart-type')) {
        chartType = element.attr('data-chart-type');
    }
    if (element.attr('data-legend-column')) {
        displayColumn = element.attr('data-legend-column');
    }
    where = {
    };
    var filterComponent = 'null';
    var filterList = [];
    var ctrlSelector;
    if (element.data('filter-component')) {
        filterComponent = element.data('filter-component');
        for (var i = 0; i < filterComponent.length; i++) {
            var where = {
                ColumnName: '',
                ColumnValue: '',
                Condition: '',
                Operator: '',
                DataType: ''
            };
            if ($('#' + filterComponent[i].component).closest('div [data-control-type]').attr('data-control-type') === 'datepicker') {
                ctrlSelector = $('#' + filterComponent[i].component);
                $(ctrlSelector).off('blur');
                $(ctrlSelector).off('change', fsi.addDataChartFilter(ctrlSelector, element));
                $(ctrlSelector).on('change', fsi.addDataChartFilter(ctrlSelector, element));
            }
            else if ($('#' + filterComponent[i].component).closest('div [data-control-type]').attr('data-control-type') === 'combo') {
                ctrlSelector = $('#' + filterComponent[i].component);
                $(ctrlSelector).off('change', fsi.addDataChartFilter(ctrlSelector, element));
                $(ctrlSelector).on('change', fsi.addDataChartFilter(ctrlSelector, element));
                $(ctrlSelector).on('change', function () {
                    $(this).siblings('span').find('.ui-btn-text').html('<span>' + $(this).find('option:selected').text() + '</span>');
                });
            }
            else {
                ctrlSelector = $('#' + filterComponent[i].component);
                $(ctrlSelector).on('keydown keyup', function (event) {
                    if (event.keyCode === 13) {
                        $(element).focus();
                        return false;
                    }
                });
                $(ctrlSelector).off('change', fsi.addDataChartFilter(ctrlSelector, element));
                $(ctrlSelector).on('change', fsi.addDataChartFilter(ctrlSelector, element));
            }
            var filterControlValue = fsi.getById(filterComponent[i].component)
            if (filterControlValue === '') {
                filterControlValue = filterComponent[i].filterStaticValue;
            }
            if (filterControlValue !== undefined && filterControlValue !== null && filterControlValue !== '') {
                if (filterControlValue !== null && filterControlValue !== '' && filterComponent[i].component !== 'rowFilter') {
                    where['ColumnName'] = filterComponent[i].source;
                    where['Condition'] = filterComponent[i].filterCondition;
                    where['Operator'] = filterComponent[i].operation;
                    if ($('#' + filterComponent[i].component).closest('div[data-control-id]').data('control-type') === 'datepicker') {
                        where['DataType'] = 'datetime';
                        var ctrlSelectorParent = ctrlSelector.closest('div[data-control-type]');
                        var type = $(ctrlSelectorParent).data('display-format');
                        var dateFormat = $(ctrlSelectorParent).data('dateformat');
                        filterControlValue = getDateTimestamp(ctrlSelector.val(), type, dateFormat);
                    }
                    where['ColumnValue'] = filterControlValue;
                    filterList.push(where);
                }
                else if ($('#' + filterComponent[i].component).parents('div[data-control-id="' + filterComponent[i].component + '"]').data('control-type') !== undefined && $('#' + filterComponent[i].component).parents('div[data-control-id="' + filterComponent[i].component + '"]').data('control-type').trim() === 'label' && ctrlSelector.text() !== '' && filterComponent[i].component !== 'rowFilter') {
                    where['ColumnName'] = filterComponent[i].source;
                    where['Condition'] = filterComponent[i].filterCondition;
                    where['Operator'] = filterComponent[i].operation;
                    where['ColumnValue'] = filterControlValue;
                    filterList.push(where);
                }
            }
        }
        if (tableName !== '' && tableName !== 'null' && tableName !== 'undefined' && tableName !== null && tableName !== undefined && tableName) {
            fsi.SelectDataObjectRowsForChart(tableName, filterList, objectProperties, displayColumn, function (data) {
                renderChartData(element, data);
            });
        }
        else {
            renderChartData(element, '');
        }
    }
    else {
        if (tableName !== '' && tableName !== 'null' && tableName !== 'undefined' && tableName !== null && tableName !== undefined && tableName) {
            fsi.SelectDataObjectRowsForChart(tableName, where, objectProperties, displayColumn, function (data) {
                renderChartData(element, data);
            });
        }
        else {
            renderChartData(element, '');
        }
    }

}

/// <summary>
/// render chart data
/// </summary>
/// <param name="element" type="type">element</param>
/// <param name="data" type="type">data</param>
renderChartData = function (element, data) {
    if (element.attr('isWorkflow')) {
        return;
    }
    var displayColumn = '';
    var datasetValue = [];
    var arr = [];
    var labels = [];
    var displayArr = [];
    var lableArr = [];
    //----------------------------RenderChart End------------------------------------     
    var chartDataI = [];
    var chartDataII = [];
    var chartType = element.data('chartType');
    var datasetValue = [];
    if (chartType === 'bar' || chartType === 'line' || chartType === 'radar') {
        if (data !== '' && data !== '[]') {
            var result = JSON.parse(data);
            lableArr = Object.keys(result[0]);
            //create label
            for (var i = 1; i < lableArr.length; i++) {
                displayArr.push(lableArr[i]);
            }
            displayColumn = element.attr('data-legend-column');
            //create label
            if (displayColumn) {
                for (var i = 0; i < result.length; i++) {
                    labels.push(result[i][displayColumn]);
                }
            }
            var objectColorProperties = element.attr('data-object-color-properties');
            bindedColumnColumn = objectColorProperties !== undefined ? objectColorProperties.split(',') : undefined;
            for (var i = 0; i < displayArr.length; i++) {
                var dataArray = [];
                for (var j = 0; j < result.length; j++) {
                    dataArray.push(result[j][displayArr[i]])
                }
                var columnColor = (bindedColumnColumn !== undefined && bindedColumnColumn[i] !== undefined) ? bindedColumnColumn[i] : fsi.getRandomColor();
                datasetValue.push({
                    label: displayArr[i],
                    fillColor: columnColor,
                    strokeColor: 'rgba(220,220,220,2)',
                    strokeColor: "rgba(151,187,205,0.8)",
                    highlightFill: "rgba(151,187,205,0.75)",
                    highlightStroke: "rgba(151,187,205,1)",
                    data: dataArray
                });
            }
            var chartDataI = {
                labels: labels,
                datasets: datasetValue
            };
        }
        else {
            chartDataI = {
                labels: ["No data"],
                datasets: [
                    {
                        label: "No data I",
                        fillColor: "rgba(255, 0, 0, 1)",
                        strokeColor: "rgba(220,220,220,0.8)",
                        highlightFill: "rgba(154, 154, 154, 0.67)",
                        highlightStroke: "rgba(220,220,220,1)",
                        data: [0]
                    }
                ]
            };
        }
    }
    else if (chartType === 'pie' || chartType === 'doughnut' || chartType === 'polararea') {
        if (data !== '' && data !== '[]') {
            var result = JSON.parse(data);
            lableArr = Object.keys(result[0]);
            //create label
            for (var i = 1; i < lableArr.length; i++) {
                labels.push(lableArr[i]);
            }
            //create display label
            for (var i = 0; i < result.length; i++) {
                displayArr.push(result[i][lableArr[0]]);
            }
            displayColumn = element.attr('data-object-properties') !== undefined ? element.attr('data-object-properties').trim() : '';
            var colorSeries = [];
            if (element.attr('data-series-color')) {
                colorSeries = element.attr('data-series-color').split(',');
            }
            $.each(result, function (i, j) {
                chartDataII.push({
                    value: result[i][displayColumn],
                    color: colorSeries[i] ? colorSeries[i] : fsi.getRandomColor(),
                    highlight: fsi.getRandomColor(),
                    label: displayArr[i]
                });
            });
        }
        else {
            chartDataII = [
          {
              value: 0,
              color: "#F7464A",
              highlight: "#FF5A5E",
              label: "No data"
          }
            ];
        }
    }
    var ctxRandomId = element.find('canvas').attr('id');
    $("#" + ctxRandomId).remove();
    $('#canvas-' + ctxRandomId + '').append('<canvas id="' + ctxRandomId + '"></canvas>');
    var ctx = document.getElementById(ctxRandomId).getContext("2d");
    var jsChart = {};
    var chartOption = {
        responsive: true,
        animation: true,
        animationSteps: 60,
        animationEasing: element.data('chartAnimation'),
        showScale: element.data('chartShowscale'),
        scaleOverride: false,
        scaleSteps: null,
        scaleStepWidth: null,
        scaleStartValue: null,
        scaleLineColor: element.data('chartScalelinecolor'),
        scaleLineWidth: element.data('chartScalelinewidth'),
        scaleShowLabels: element.data('chartScaleshowlabels'),
        scaleLabel: "<%=value%>",
        scaleIntegersOnly: true,
        scaleBeginAtZero: false,
        scaleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
        scaleFontSize: 12,
        scaleFontStyle: "normal",
        scaleFontColor: "#666",
        maintainAspectRatio: true,
        showTooltips: element.data('chartShowtooltips'),
        customTooltips: false,
        tooltipEvents: ["mousemove", "touchstart", "touchmove"],
        tooltipFillColor: element.data('chartTooltipfillcolor'),
        tooltipFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
        tooltipFontSize: 14,
        tooltipFontStyle: "normal",
        tooltipFontColor: "#fff",
        tooltipTitleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
        tooltipTitleFontSize: 14,
        tooltipTitleFontStyle: "bold",
        tooltipTitleFontColor: "#fff",
        tooltipYPadding: 6,
        tooltipXPadding: 6,
        tooltipCaretSize: 8,
        tooltipCornerRadius: 6,
        tooltipXOffset: 10,
        tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %>",
        multiTooltipTemplate: "<%= value %>",
        onAnimationProgress: function () {
        },
        onAnimationComplete: function () {
        },
        omitXLabels: element.data('chartxaxislabel')
    }
    var chartOptionI = chartOption;
    if (chartType === 'bar' || chartType === 'line' || chartType === 'radar') {
        chartOptionI['scaleShowGridLines'] = element.data('chartScaleshowgridlines');
        chartOptionI['scaleGridLineColor'] = element.data('chartScalegridlinecolor');
        chartOptionI['scaleGridLineWidth'] = element.data('chartScalegridlinewidth');
        chartOptionI['scaleShowHorizontalLines'] = true;
        chartOptionI['scaleShowVerticalLines'] = true;
        chartOptionI['barShowStroke'] = true;
        chartOptionI['barStrokeWidth'] = 2;
        chartOptionI['barValueSpacing'] = 2
        chartOptionI['barDatasetSpacing'] = 1;
        chartOptionI['legendTemplate'] = "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><div style=\"padding-left: 20px; margin-top: -7px;\"><span style=\"background-color:<%=datasets[i].fillColor%>\" title=<%if(datasets[i].label){%><%=datasets[i].label%><%}%> ></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></div></li><%}%></ul>"
        //element.find('.chartXaxis').html(lableArr[0]);
        //element.find('.chartYaxis').html(lableArr[1]);
    }
    //-----------------------------------------------------------------------------------------------------------------------------------------------
    var chartOptionII = chartOption;
    if (chartType === 'pie' || chartType === 'doughnut' || chartType === 'polararea') {
        chartOptionII['scaleShowLabelBackdrop'] = true;
        chartOptionII['scaleBackdropColor'] = "rgba(255,255,255,0.75)";
        chartOptionII['scaleBeginAtZero'] = true;
        chartOptionII['scaleBackdropPaddingY'] = 2;
        chartOptionII['scaleBackdropPaddingX'] = 2;
        chartOptionII['scaleShowLine'] = true;
        chartOptionII['segmentShowStroke'] = true;
        chartOptionII['segmentStrokeColor'] = "#fff";
        chartOptionII['segmentStrokeWidth'] = 2;
        chartOptionII['animateRotate'] = true;
        chartOptionII['animateScale'] = false;
        chartOptionII['legendTemplate'] = "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><div style=\"padding-left: 20px; margin-top: -7px;\"><span style=\"background-color:<%=segments[i].fillColor%>\" title=<%if(segments[i].label){%><%=segments[i].label%><%}%> ></span><%if(segments[i].label){%><%=segments[i].label%><%}%></div></li><%}%></ul>";
        //element.find('.chartXaxis').html(lableArr[1]);
        //element.find('.chartYaxis').html('');
    }
    //-----------------------------------------------------------------------------------------------------------------------------------------------
    if (chartType === 'bar') {
        jsChart = new Chart(ctx).Bar(chartDataI, chartOptionI);
    }
    else if (chartType === 'line') {
        jsChart = new Chart(ctx).Line(chartDataI, chartOptionI);
    }
    else if (chartType === 'radar') {
        jsChart = new Chart(ctx).Radar(chartDataI, chartOptionI);
    }
    else if (chartType === 'pie') {
        jsChart = new Chart(ctx).Pie(chartDataII, chartOptionII);
    }
    else if (chartType === 'doughnut') {
        jsChart = new Chart(ctx).Doughnut(chartDataII, chartOptionII);
    }
    else if (chartType === 'polararea') {
        jsChart = new Chart(ctx).PolarArea(chartDataII, chartOptionII);
    }
    var legendHolder = document.createElement('div');
    legendHolder.innerHTML = jsChart.generateLegend();
    element.find('.chartLegend').append(legendHolder.firstChild);
    //----------------------------RenderChart End------------------------------------    
}

/// <summary>
/// render chart data with workflow
/// </summary>
/// <param name="element" type="type">element</param>
/// <param name="data" type="type">data</param>
renderChartDataWithWorkflow = function (element, data) {
    element.attr('isWorkflow', 'true');
    var controlId = element.data('control-id');
    element.find('#' + controlId).empty();
    element.find('#' + controlId).html('');
    element.find('.chartLegend').empty();
    var displayColumn = '';
    var datasetValue = [];
    var arr = [];
    var labels = [];
    var displayArr = [];
    var lableArr = [];
    //----------------------------RenderChart End------------------------------------     
    var chartDataI = [];
    var chartDataII = [];
    var chartType = element.data('chartType');
    var datasetValue = [];
    if (chartType === 'bar' || chartType === 'line' || chartType === 'radar') {
        if (data !== '' && data.length > 0) {
            var result = data;
            lableArr = Object.keys(result[0]);
            //create label
            for (var i = 1; i < lableArr.length; i++) {
                displayArr.push(lableArr[i]);
            }
            if (lableArr.length > 0) {
                displayColumn = lableArr[0];
            }
            displayColumn = element.attr('data-legend-column');
            displayArr = element.attr('data-object-properties').split(',');

            //create label
            for (var i = 0; i < result.length; i++) {
                labels.push(result[i][displayColumn]);
            }
            var objectColorProperties = element.attr('data-object-color-properties');
            if (objectColorProperties !== undefined) {
                bindedColumnColumn = objectColorProperties.split(',');
            }
            for (var i = 0; i < displayArr.length; i++) {
                var dataArray = [];
                for (var j = 0; j < result.length; j++) {
                    dataArray.push(result[j][displayArr[i].trim()])
                }
                var columnColor;
                if (bindedColumnColumn !== null && bindedColumnColumn !== undefined) {
                    columnColor = bindedColumnColumn[i] !== undefined ? bindedColumnColumn[i] : getRandomColor();
                }
                else {
                    columnColor = fsi.getRandomColor();
                }
                datasetValue.push({
                    label: displayArr[i],
                    fillColor: columnColor,
                    strokeColor: 'rgba(220,220,220,2)',
                    strokeColor: "rgba(151,187,205,0.8)",
                    highlightFill: "rgba(151,187,205,0.75)",
                    highlightStroke: "rgba(151,187,205,1)",
                    data: dataArray
                });
            }
            var chartDataI = {
                labels: labels,
                datasets: datasetValue
            };
        }
        else {
            var bindedColumns, bindedColumnColumn;
            var objectProperties = element.attr('data-object-properties');
            var objectColorProperties = element.attr('data-object-color-properties');
            if (objectProperties) {
                bindedColumns = objectProperties.split(',');
            }
            if (objectColorProperties) {
                bindedColumnColumn = objectColorProperties.split(',');
            }
            var datasetValue = [];
            if (objectColorProperties && bindedColumns) {
                for (var i = 0; i < bindedColumns.length; i++) {
                    var columnColor = bindedColumnColumn[i];
                    datasetValue.push({
                        label: bindedColumns[i],
                        fillColor: columnColor,
                        strokeColor: "rgba(151,187,205,0.8)",
                        highlightFill: "rgba(151,187,205,0.75)",
                        highlightStroke: "rgba(151,187,205,1)",
                        data: [Math.floor(Math.random() * (100 - 10 + 1)) + 10, Math.floor(Math.random() * (100 - 10 + 1)) + 10, Math.floor(Math.random() * (100 - 10 + 1)) + 10,
                        Math.floor(Math.random() * (100 - 10 + 1)) + 10, Math.floor(Math.random() * (100 - 10 + 1)) + 10, Math.floor(Math.random() * (100 - 10 + 1)) + 10]
                    });
                }
            }
            chartDataI = {
                labels: ["Data-I", "Data-II", "Data-III", "Data-IV", "Data-V", "Data-VI"],
                datasets: datasetValue.length > 0 ? datasetValue : [
                    {
                        label: "Dataset-I",
                        fillColor: "rgba(105, 103, 103, 0.67)",
                        strokeColor: "rgba(220,220,220,0.8)",
                        highlightFill: "rgba(154, 154, 154, 0.67)",
                        highlightStroke: "rgba(220,220,220,1)",
                        data: [0, 0, 0, 0, 0, 0, 0]
                    },
                    {
                        label: "Dataset-II",
                        fillColor: "rgb(91, 144, 171)",
                        strokeColor: "rgba(151,187,205,0.8)",
                        highlightFill: "rgba(151,187,205,0.75)",
                        highlightStroke: "rgba(151,187,205,1)",
                        data: [0, 0, 0, 0, 0, 0, 30]
                    }
                ]
            };
        }
    }
    else if (chartType === 'pie' || chartType === 'doughnut' || chartType === 'polararea') {
        if (data !== '' && data.length > 0) {
            var result = data;
            lableArr = Object.keys(result[0]);
            //create label
            for (var i = 1; i < lableArr.length; i++) {
                labels.push(lableArr[i]);
            }
            //create display label
            for (var i = 0; i < result.length; i++) {
                displayArr.push(result[i][lableArr[0]]);
            }
            displayColumn = element.attr('data-object-properties').trim();
            var colorSeries = [];
            if (element.attr('data-series-color')) {
                colorSeries = element.attr('data-series-color').split(',');
            }
            $.each(result, function (i, j) {
                chartDataII.push({
                    value: result[i][displayColumn],
                    color: colorSeries[i] ? colorSeries[i] : fsi.getRandomColor(),
                    highlight: fsi.getRandomColor(),
                    label: displayArr[i]
                });
            });
        }
        else {
            chartDataII = [
          {
              value: 0,
              color: "#F7464A",
              highlight: "#FF5A5E",
              label: "Red"
          },
          {
              value: 0,
              color: "#46BFBD",
              highlight: "#5AD3D1",
              label: "Green"
          },
          {
              value: 0,
              color: "#FDB45C",
              highlight: "#FFC870",
              label: "Yellow"
          },
          {
              value: 0,
              color: "#949FB1",
              highlight: "#A8B3C5",
              label: "Grey"
          },
          {
              value: 0,
              color: "#4D5360",
              highlight: "#616774",
              label: "Dark Grey"
          }
            ];
        }
    }
    var ctxRandomId = element.find('canvas').attr('id');
    $("#" + ctxRandomId).remove();
    $('#canvas-' + ctxRandomId + '').append('<canvas id="' + ctxRandomId + '"></canvas>');
    var ctx = document.getElementById(ctxRandomId).getContext("2d");
    var jsChart = {};
    var chartOption = {
        responsive: true,
        animation: true,
        animationSteps: 60,
        animationEasing: element.data('chartAnimation'),
        showScale: element.data('chartShowscale'),
        scaleOverride: false,
        scaleSteps: null,
        scaleStepWidth: null,
        scaleStartValue: null,
        scaleLineColor: element.data('chartScalelinecolor'),
        scaleLineWidth: element.data('chartScalelinewidth'),
        scaleShowLabels: element.data('chartScaleshowlabels'),
        scaleLabel: "<%=value%>",
        scaleIntegersOnly: true,
        scaleBeginAtZero: false,
        scaleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
        scaleFontSize: 12,
        scaleFontStyle: "normal",
        scaleFontColor: "#666",
        maintainAspectRatio: true,
        showTooltips: element.data('chartShowtooltips'),
        customTooltips: false,
        tooltipEvents: ["mousemove", "touchstart", "touchmove"],
        tooltipFillColor: element.data('chartTooltipfillcolor'),
        tooltipFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
        tooltipFontSize: 14,
        tooltipFontStyle: "normal",
        tooltipFontColor: "#fff",
        tooltipTitleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
        tooltipTitleFontSize: 14,
        tooltipTitleFontStyle: "bold",
        tooltipTitleFontColor: "#fff",
        tooltipYPadding: 6,
        tooltipXPadding: 6,
        tooltipCaretSize: 8,
        tooltipCornerRadius: 6,
        tooltipXOffset: 10,
        tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %>",
        multiTooltipTemplate: "<%= value %>",
        onAnimationProgress: function () {
        },
        onAnimationComplete: function () {
        },
        omitXLabels: element.data('chartxaxislabel')
    }
    var chartOptionI = chartOption;
    if (chartType === 'bar' || chartType === 'line' || chartType === 'radar') {
        chartOptionI['scaleShowGridLines'] = element.data('chartScaleshowgridlines');
        chartOptionI['scaleGridLineColor'] = element.data('chartScalegridlinecolor');
        chartOptionI['scaleGridLineWidth'] = element.data('chartScalegridlinewidth');
        chartOptionI['scaleShowHorizontalLines'] = true;
        chartOptionI['scaleShowVerticalLines'] = true;
        chartOptionI['barShowStroke'] = true;
        chartOptionI['barStrokeWidth'] = 2;
        chartOptionI['barValueSpacing'] = 2
        chartOptionI['barDatasetSpacing'] = 1;
        chartOptionI['legendTemplate'] = "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><div style=\"padding-left: 20px; margin-top: -7px;\"><span style=\"background-color:<%=datasets[i].fillColor%>\" title=<%if(datasets[i].label){%><%=datasets[i].label%><%}%> ></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></div></li><%}%></ul>"
        //element.find('.chartXaxis').html(lableArr[0]);
        //element.find('.chartYaxis').html(lableArr[1]);
    }
    //-----------------------------------------------------------------------------------------------------------------------------------------------
    var chartOptionII = chartOption;
    if (chartType === 'pie' || chartType === 'doughnut' || chartType === 'polararea') {
        chartOptionII['scaleShowLabelBackdrop'] = true;
        chartOptionII['scaleBackdropColor'] = "rgba(255,255,255,0.75)";
        chartOptionII['scaleBeginAtZero'] = true;
        chartOptionII['scaleBackdropPaddingY'] = 2;
        chartOptionII['scaleBackdropPaddingX'] = 2;
        chartOptionII['scaleShowLine'] = true;
        chartOptionII['segmentShowStroke'] = true;
        chartOptionII['segmentStrokeColor'] = "#fff";
        chartOptionII['segmentStrokeWidth'] = 2;
        chartOptionII['animateRotate'] = true;
        chartOptionII['animateScale'] = false;
        chartOptionII['legendTemplate'] = "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><div style=\"padding-left: 20px; margin-top: -7px;\"><span style=\"background-color:<%=segments[i].fillColor%>\" title=<%if(segments[i].label){%><%=segments[i].label%><%}%> ></span><%if(segments[i].label){%><%=segments[i].label%><%}%></div></li><%}%></ul>";
        //element.find('.chartXaxis').html(lableArr[1]);
        //element.find('.chartYaxis').html('');
    }
    //-----------------------------------------------------------------------------------------------------------------------------------------------
    if (chartType === 'bar') {
        jsChart = new Chart(ctx).Bar(chartDataI, chartOptionI);
    }
    else if (chartType === 'line') {
        jsChart = new Chart(ctx).Line(chartDataI, chartOptionI);
    }
    else if (chartType === 'radar') {
        jsChart = new Chart(ctx).Radar(chartDataI, chartOptionI);
    }
    else if (chartType === 'pie') {
        jsChart = new Chart(ctx).Pie(chartDataII, chartOptionII);
    }
    else if (chartType === 'doughnut') {
        jsChart = new Chart(ctx).Doughnut(chartDataII, chartOptionII);
    }
    else if (chartType === 'polararea') {
        jsChart = new Chart(ctx).PolarArea(chartDataII, chartOptionII);
    }
    var legendHolder = document.createElement('div');
    legendHolder.innerHTML = jsChart.generateLegend();
    element.find('.chartLegend').append(legendHolder.firstChild);
    //----------------------------RenderChart End------------------------------------    
}

/// <summary>
/// get random color
/// </summary>
/// <returns type=""></returns>
fsi.prototype.getRandomColor = function () {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

/// <summary>
/// get random color bar
/// </summary>
/// <returns type=""></returns>
getRandomColorBar = function () {
    var letters = '0123456789'.split('');
    var color = 'rgba(';
    for (var j = 0; j <= 3; j++) {
        if (j === 3) {
            color += Math.floor(Math.random() * 10);
        } else {
            for (var i = 0; i < 3; i++) {
                color += letters[Math.floor(Math.random() * 10)];
            }
            color += ',';
        }
    }
    color += ')';

    return color;
}

/// <summary>
/// render pivot table
/// </summary>
/// <param name="element" type="type">element</param>
renderPivotTable = function (element) {
    var tableName = 'null';
    var bindedColumns = [];
    if (element.attr('data-related-table')) {
        tableName = element.attr('data-related-table');
    }
    if (element.attr('data-object-properties')) {
        var objectProperties = element.attr('data-object-properties');
        bindedColumns = objectProperties.split(',');
    }
    var pivotRows = '';
    var pivotCols = '';
    var pivotView = element.attr('data-default-pivot-view');
    if (element.attr('data-object-rows-properties') !== undefined && element.attr('data-object-rows-properties') !== '') {
        pivotRows = element.attr('data-object-rows-properties').split(',');
        pivotRows = pivotRows.map(function (s) {
            return s.trim()
        });
    }
    if (element.attr('data-object-cols-properties') !== undefined && element.attr('data-object-cols-properties') !== '') {
        pivotCols = element.attr('data-object-cols-properties').split(',');
        pivotCols = pivotCols.map(function (s) {
            return s.trim()
        });
    }
    where = {};
    fsi.selectDataObjectForPivotTable(tableName, where, objectProperties, function (data) {
        if (data !== '') {
            var result = JSON.parse(data.result);
            var colNames = Object.keys(result[0]);
            for (var i = 0; i < result.length; i++) {
                for (var d = 0; d < data.fieldsAndType.length; d++) {
                    for (var j = 0; j < colNames.length; j++) {
                        if (colNames[j].trim() === data.fieldsAndType[d].Name && data.fieldsAndType[d].BaseType === "DATETIME") {
                            var colData = new Date(result[i][colNames[j]]);
                            var datetm = new Date(result[i][colNames[j].trim()]);
                            var dateString = datetm.toLocaleString();
                            result[i][colNames[j]] = dateString
                        }
                    }
                }
            }
            var pivotId = element.attr('data-control-id');
            $('#' + pivotId).empty().pivotUI(result,
                          {
                              rows: pivotRows,
                              cols: pivotCols,
                              rendererName: pivotView
                          });
        }
    });
};

/// <summary>
/// refresh report
/// </summary>
/// <param name="reportSector" type="type">report sector</param>
fsi.prototype.refreshReport = function (reportSector) {
    var element = $('div[data-control-id=' + reportSector + ']');
    fsi.renderReport(element);
}

/// <summary>
/// render report
/// </summary>
/// <param name="element" type="type">element</param>
fsi.prototype.renderReport = function (element) {
    $('#' + element.attr('data-control-id')).find('div').closest('.holds-the-iframe').css('display', 'block');
    $('#' + element.attr('data-control-id')).find('div').parents('div[data-control-css]').css('border', 'none');
    if (element.attr('data-control-id')) {
        var reportName = element.attr('data-reportpath');
        var reportParams = [];
        var jsonString = '';
        if ((element.attr('data-reportparams') !== undefined) || (element.attr('data-reportparams') !== '')) {
            reportParamsArr = JSON.parse(element.attr('data-reportparams'));
            jsonString += '[';
            if (reportParamsArr) {
                $.each(reportParamsArr, function (i) {
                    var rptControl;
                    if (Object.keys(reportParamsArr[i]).length > 0) {
                        rptControl = reportParamsArr[i]['control'].split('control_')[1];
                    }
                    var rptParamValue = '';
                    if (rptControl !== undefined) {
                        rptParamValue = fsi.getById(rptControl);
                    }
                    if (rptParamValue === '') {
                        rptParamValue = reportParamsArr[i]['staticValue']
                    }
                    if (jsonString.length > 1) {
                        jsonString += ",";
                    }
                    jsonString += '{"Name":"' + reportParamsArr[i]['param'] + '","Value":"' + rptParamValue + '"}';
                });
            }
            jsonString += ']';
        }
        var isShowParameterPrompt = false;
        if (element.attr('data-showReportParameters')) {
            if (element.attr('data-showReportParameters') === 'on') {
                isShowParameterPrompt = true;
            }
        }
        var reportUrl = getTenantUrl() + '/webdesigner/ReportViewerPage?reportName=' + reportName + "&ShowReportParameters=" + isShowParameterPrompt + "&param=" + jsonString;
        if (reportName) {
            $.ajax({
                traditional: true,
                cache: false,
                url: reportUrl,
                beforeSend: function () {
                },
                success: function (data) {
                    $('#' + element.attr('data-control-id')).find('div').empty();
                    $('#' + element.attr('data-control-id')).find('div').append(data);
                },
                error: function (e) {
                },
                complete: function () {
                    $('#' + element.attr('data-control-id')).find('div').closest('.holds-the-iframe').css('display', 'none');;
                }
            });
        } else {
            $('#' + element.attr('data-control-id')).find('div').closest('.holds-the-iframe').css('display', 'none');;
        }
    }
};

/// <summary>
/// render document linker
/// </summary>
/// <param name="element" type="type">element</param>
/// <param name="intialData" type="type">intial data</param>
renderDocumentLinker = function (element, intialData) {
    var formId = element.parents().find('form').attr('id');
    var systemId = element.parents().find('form').find('#fsiSystemId').val();
    var controlId = element.data('control-id');
    var tblDocument = element.find('div[id^="tblDocument_"]').attr('id');
    var pattern = /Date\(([^)]+)\)/;
    if (systemId !== '' && systemId !== 0) {
        fsi.selectDataObjectForDocumentLinker(systemId, formId, controlId, function (data) {
            var divElem = $('#' + tblDocument);
            divElem.empty();
            var str = '';
            if (data.length > 0) {
                str += "<table class=\"table table-striped table-bordered table-hover table-condensed\">" +
                      "<tr>" +
                          "<th>Version</th>" +
                            "<th>File</th>" +
                          "<th>Creation date</th>" +
                           "<th>Delete</th>" +
                    "</tr>";
                $.each(data, function (i, state) {
                    var docDate = pattern.exec(state.CreateDate)[1];
                    var basePath = location.protocol + "//" + location.host + "/" + location.pathname.split('/').splice(2, 1).join('/');
                    str += "<tr>" +
                              "<td style='width:5%'>" +
                                state.Version +
                               "</td>" +
                                "<td>" +
                                  "<a title='" + state.FileName + "' href='javascript:void(0)' onclick='DownLoadFile(" + state.FileDocumentId + ");'><img style='width:50px;height:44px' src=" + state.imagesURL + "/DocumentsFile.png" + " /></a>" +
                                "</td>" +
                                "<td>" + ToJavaScriptDate(docDate) + "" +
                                "</td>";
                    str += '<td><a href="javascript:void(0)" onclick="DeleteFile(';
                    str += "'" + state.FileDocumentId + "','" + formId + "','" + systemId + "','" + controlId + "'";
                    str += ')"><img style="width:26px;height:28px" src="' + state.imagesURL + '/Bin.png" + " /></td></tr>';
                });
                str += "</table>";
            }
            divElem.append(str);
        });
    }
};

/// <summary>
/// to java script date
/// </summary>
/// <param name="value" type="type">value</param>
/// <returns type=""></returns>
function ToJavaScriptDate(value) {
    var dt = new Date(parseFloat(value));
    return dt.toLocaleString();//(dt.getMonth() + 1) + "/" + dt.getDate() + "/" + dt.getFullYear();
}

/// <summary>
/// select data object for document linker
/// </summary>
/// <param name="systemId" type="type">systemId</param>
/// <param name="formId" type="type">formId</param>
/// <param name="controlId" type="type">controlId</param>
/// <param name="success" type="type">success</param>
/// <param name="error" type="type">error</param>
fsi.prototype.selectDataObjectForDocumentLinker = function (systemId, formId, controlId, success, error) {
    var myurl = getTenantUrl() + '/DataObject/SelectDataObjectForDocumentLinker';
    var postData;
    postData = {
        systemId: systemId, formId: formId, documentId: controlId
    };
    $.ajax({
        cache: false,
        url: myurl,
        data: postData,
        beforeSend: function () {

        },
        success: success,
        complete: function () {

        },
        error: error,
    });
}

/// <summary>
/// check custom permssion exist
/// </summary>
/// <param name="success" type="type">success</param>
/// <param name="error" type="type">error</param>
fsi.prototype.checkCustomPermssionExist = function (success, error) {
    var myurl = getTenantUrl() + '/Web/CheckCustomPermssionExistForLoggedInUser';
    var postData;
    postData = {
    };
    $.ajax({
        cache: false,
        url: myurl,
        data: postData,
        async: true,
        beforeSend: function () {

        },
        success: success,
        complete: function () {

        },
        error: error,
    });
}

/// <summary>
/// data list progressive loading
/// </summary>
/// <param name="element" type="type">element</param>
DataListLoading = function (element) {
    $(element.find('.table-content')).scroll(function () {
        if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
            var pageIndex = 0;
            var totalRecord = 0;
            var dataLimit = 0;
            var totalPage = 0;
            if (element.attr('totalRecords')) {
                totalRecord = parseInt(element.attr('totalRecords'));
            }
            if (element.attr('data-limit')) {
                dataLimit = element.attr('data-limit');
            }
            if (dataLimit > 0) {
                totalPage = Math.ceil(totalRecord / dataLimit);
            }
            if (element.attr('pageIndex')) {
                if (parseInt(element.attr('pageIndex')) <= totalPage) {
                    pageIndex = parseInt(element.attr('pageIndex')) + 1;
                    element.attr('pageIndex', pageIndex);
                }
            }
            if (pageIndex > 0 && pageIndex <= totalPage) {
                if (dataLimit < totalRecord) {
                    element.find('.imgLoader').show();
                    fsi.renderDataList(element, true);
                    element.find('ul').trigger('fetch');
                }
            }
        }
    });
}

/// <summary>
/// add data list filter
/// </summary>
/// <param name="ctrlSelector" type="type">ctrl selector</param>
/// <param name="dataListSelector" type="type">data list selector</param>
fsi.prototype.addDataListFilter = function (ctrlSelector, dataListSelector) {
    $(ctrlSelector).on('change', function (event) {
        $('form').off('submit');
        $('form').on('submit', function () {
            return false;
        });
        dataListSelector.find('ul').trigger('filtered');
        fsi.renderDataList(dataListSelector, true);
    });
};

/// <summary>
/// refresh data list
/// </summary>
/// <param name="dataListId" type="type">dataListId</param>
fsi.prototype.refreshDataList = function (dataListId) {
    var element = $('#' + dataListId).closest('div[data-control-id=' + dataListId + ']');
    fsi.renderDataList(element, true);
}

/// <summary>
/// render data list
/// </summary>
/// <param name="element" type="type">element</param>
/// <param name="isLoad" type="type">isLoad</param>
fsi.prototype.renderDataList = function (element, isLoad) {
    var filterComponent = 'null';
    var filterList = [];
    var ctrlSelector;
    if (element.data('filter-component')) {
        filterComponent = element.data('filter-component');
        for (var i = 0; i < filterComponent.length; i++) {
            var where = {
                ColumnName: '',
                ColumnValue: '',
                Condition: '',
                Operator: '',
                DataType: ''
            };
            if ($('#' + filterComponent[i].component).closest('div [data-control-type]').attr('data-control-type') === 'datepicker') {
                ctrlSelector = $('#' + filterComponent[i].component);
                $(ctrlSelector).off('blur');
                $(ctrlSelector).off('change', fsi.addDataListFilter(ctrlSelector, element));
                $(ctrlSelector).on('change', fsi.addDataListFilter(ctrlSelector, element));
            }
            else if ($('#' + filterComponent[i].component).closest('div [data-control-type]').attr('data-control-type') === 'combo') {
                ctrlSelector = $('#' + filterComponent[i].component);
                $(ctrlSelector).off('change', fsi.addDataListFilter(ctrlSelector, element));
                $(ctrlSelector).on('change', fsi.addDataListFilter(ctrlSelector, element));
                $(ctrlSelector).on('change', function () {
                    $(this).siblings('span').find('.ui-btn-text').html('<span>' + $(this).find('option:selected').text() + '</span>');
                });
            }
            else {
                ctrlSelector = $('#' + filterComponent[i].component);
                $(ctrlSelector).on('keydown keyup', function (event) {
                    if (event.keyCode === 13) {
                        $(element).focus();
                        return false;
                    }

                });
                $(ctrlSelector).off('change', fsi.addDataListFilter(ctrlSelector, element));
                $(ctrlSelector).on('change', fsi.addDataListFilter(ctrlSelector, element));
            }
            if (!isLoad) {
                if (filterComponent[i].filterStaticValue !== '') {
                    ctrlSelector.val(filterComponent[i].filterStaticValue);
                }
            }
            var filterControlValue = fsi.getById(filterComponent[i].component);
            if (filterControlValue !== undefined && filterControlValue !== null && filterControlValue !== '') {
                if (filterControlValue !== null && filterControlValue !== '' && filterComponent[i].component !== 'rowFilter') {
                    where['ColumnName'] = filterComponent[i].source;
                    where['Condition'] = filterComponent[i].filterCondition;
                    where['Operator'] = filterComponent[i].operation;
                    if ($('#' + filterComponent[i].component).closest('div[data-control-id]').data('control-type') === 'datepicker') {
                        where['DataType'] = 'datetime';
                        var ctrlSelectorParent = ctrlSelector.closest('div[data-control-type]');
                        var type = $(ctrlSelectorParent).data('display-format');
                        var dateFormat = $(ctrlSelectorParent).data('dateformat');
                        filterControlValue = getDateTimestamp(ctrlSelector.val(), type, dateFormat);
                    }
                    where['ColumnValue'] = filterControlValue;
                    filterList.push(where);
                }
                else if ($('#' + filterComponent[i].component).parents('div[data-control-id="' + filterComponent[i].component + '"]').data('control-type') !== undefined && $('#' + filterComponent[i].component).parents('div[data-control-id="' + filterComponent[i].component + '"]').data('control-type').trim() === 'label' && ctrlSelector.text() !== '' && filterComponent[i].component !== 'rowFilter') {
                    where['ColumnName'] = filterComponent[i].source;
                    where['Condition'] = filterComponent[i].filterCondition;
                    where['Operator'] = filterComponent[i].operation;
                    where['ColumnValue'] = filterControlValue;
                    filterList.push(where);
                }
                else if (filterComponent[i].component === 'rowFilter') {
                    where['ColumnName'] = filterComponent[i].source;
                    where['ColumnValue'] = filterComponent[i].filterStaticValue;
                    where['Condition'] = filterComponent[i].filterCondition;
                    where['Operator'] = filterComponent[i].operation;
                    filterList.push(where);
                }
            }
            else {
                if (filterComponent[i].filterStaticValue !== undefined && filterComponent[i].filterStaticValue !== null && filterComponent[i].filterStaticValue !== '') {
                    where['ColumnName'] = filterComponent[i].source;
                    where['ColumnValue'] = filterComponent[i].filterStaticValue;
                    where['Condition'] = filterComponent[i].filterCondition;
                    where['Operator'] = filterComponent[i].operation;
                    filterList.push(where);
                }
            }
        }
        fsi.fillDataList(element, filterList);
    } else {
        fsi.fillDataList(element, filterList);
    }
    console.log('renderDataList complete :' + element.data('controlId') + ' : ' + new Date());
    if (!isLoad) {
        element.find('ul').trigger('rendered');
    }
}

/// <summary>
/// fill data list
/// </summary>
/// <param name="element" type="type">element</param>
/// <param name="columnList" type="type">column list</param>
fsi.prototype.fillDataList = function (element, columnList) {
    console.log('renderDataList start :' + element.data('controlId') + ' : ' + new Date());
    var dataObject = 'null'; var where = 'null'; var orderBy = 'null'; var order = 'null';
    var columnName = 'null'; var splitColumnName = []; var filterComponent = 'null', displayColumnName = '';
    var splitDisplayColumnName = []; var splitColumnNameValue = [];
    var conditionalFormating = '';
    var pageDoc = '', pageDocLable = '';
    var style = '', dataLimit = 0, progressiveSteps = 0;
    var redirectUrl = '#';
    var isFilterExist = false;
    var pageIndex = 1;
    var totalRecord = 0;
    var isTitleVisible = true, isHeaderVisible = true;
    var height = 0;
    if (element.attr('data-Height')) {
        height = element.attr('data-Height');
    }
    if (element.attr('pageIndex')) {
        pageIndex = element.attr('pageIndex');
    }
    if (element.attr('data-page-document')) {
        pageDoc = element.attr('data-page-document');
    }
    if (element.attr('data-page-document-lable')) {
        pageDocLable = element.attr('data-page-document-lable');
    }
    if (element.attr('data-related-table')) {
        dataObject = element.attr('data-related-table');
    }
    if (element.attr('data-object-properties')) {
        columnName = element.attr('data-object-properties');
    }
    if (element.attr('data-object-properties-display')) {
        displayColumnName = element.attr('data-object-properties-display');
    }
    if (element.attr('data-sort-column')) {
        orderBy = element.attr('data-sort-column');
    }
    if (element.attr('data-sort-order')) {
        order = element.attr('data-sort-order');
    }
    if (element.find('li').attr('style')) {
        style = element.find('li').attr('style');
    }
    if (element.attr('data-limit')) {
        dataLimit = element.attr('data-limit');
    }
    if (element.attr('data-progressive')) {
        progressiveSteps = element.attr('data-progressive');
    }
    if (element.attr('data-redirect-url')) {
        redirectUrl = element.attr('data-redirect-url');
    }
    if (element.attr('data-TitleVisible')) {
        isTitleVisible = element.attr('data-TitleVisible') === 'off' ? false : true;
    }
    if (element.attr('data-HeaderVisible')) {
        isHeaderVisible = element.attr('data-HeaderVisible') === 'off' ? false : true;
    }
    if (dataObject !== 'null') {
        console.log('data object start :' + element.data('controlId') + ' : ' + new Date());
        if (columnList.length > 0) {
            pageIndex = 1;
            element.attr('pageIndex', '1');
        }
        fsi.selectDataObjectForFiltring(dataObject, columnName, columnList, dataLimit, pageIndex, progressiveSteps, orderBy, order, function (data) {
            console.log('data object complete :' + element.data('controlId') + ' : ' + new Date());
            if (JSON.parse(data.result).length > 0) {
                if (displayColumnName !== 'null') {
                    splitDisplayColumnName = displayColumnName.split(',');
                }
                if (columnName !== 'null') {
                    $.each(columnName.split(','), function (i, v) {
                        splitColumnName.push(v.trim().split('/')[v.trim().split('/').length - 1])
                    })
                }
                var columnKeyValueList = [];
                for (var i = 0; i < splitColumnName.length; i++) {
                    if (splitDisplayColumnName[i] !== undefined && splitDisplayColumnName[i] !== null) {
                        if (splitDisplayColumnName[i].trim() === "") {
                            splitColumnNameValue[i] = splitColumnName[i].trim()
                        }
                        else {
                            splitColumnNameValue[i] = splitDisplayColumnName[i].trim()
                        }
                        var keyValue = {
                            key: splitColumnName[i].trim(),
                            value: splitColumnNameValue[i]

                        }
                        columnKeyValueList.push(keyValue);
                    }

                }

                if (element.attr('data-page-document') === 'show') {
                    var keyValue = {
                        key: 'DocumentUploaded',
                        value: 'docCount'
                    }
                    columnKeyValueList.push(keyValue);
                    splitColumnName.push('docCount');
                }
                var objKeys = Object.keys(JSON.parse(data.result)[0]);
                var jsonData = JSON.parse(data.result);
                result = fsi.sortResults(jsonData, orderBy, order);
                if (element.find('span').next('span')) {
                    element.find('span').next('span').text(parseInt(data.RowCount));//set total no of record of data list
                }

                if (element.attr('totalRecords')) {
                    element.attr('totalRecords', parseInt(data.RowCount));
                }
                if (element.data('conditionalFormating')) {
                    conditionalFormating = element.data('conditionalFormating');
                }

                var tableTag = element.find('.dynamic-datalist');
                ////////// tableTag.html('');
                var str = '';
                var strStyle = '';
                if (parseInt(pageIndex) === 1) {
                    tableTag.empty();
                    //str += '<div class="container">';
                    //str += '<div class="fixed-table-toolbar"></div>';
                    str += '<div class="row fixed-table" style="height: 299px; padding-bottom: 37px; position:relative;top:-37px;margin-left:0px;">';
                    str += '<div id="' + "content-" + element.attr('data-control-id') + '" class="table-content">';
                    str += '<table id="mytable" width="100%" data-toggle="table" data-url="data1.json" data-cache="false" data-height="299" class="table table-striped table-fixed-header table-hover tblDataList" style= "margin:0px;">';
                    if (!isHeaderVisible) {
                        strStyle = 'style="display:none;"';
                    }
                    str += '<thead class="header"' + strStyle + ' ><tr> ';
                    //hearder start
                    str += '<th style="display:none">SystemID </th>';
                    var thCount = 0;
                    for (var i = 0; i < columnKeyValueList.length; i++) {
                        if (columnKeyValueList[i].value === 'docCount') {
                            var docStyle = 'style="display:none;"';
                            var docCustomLable = 'Page Documents';
                            if (element.attr('data-page-document') === 'show') {
                                docStyle = 'style="display:grid;"';
                                if ($.trim(element.attr('data-page-document-lable')) !== '') {
                                    docCustomLable = $.trim(element.attr('data-page-document-lable'));
                                }
                                str += '<th ' + docStyle + '> ' + docCustomLable + '</th>';
                            }
                        }
                        else {
                            if (element.data('hidefirstcolumn') === 'yes' && thCount === 0) {
                                str += '<th style="display:none;">' + columnKeyValueList[i].value + ' </th>';
                            }
                            else {
                                str += '<th>' + columnKeyValueList[i].value + ' </th>';
                            }
                            thCount++;
                        }
                    }
                    str += '</tr></thead>';
                    str += '<tbody>';
                }
                for (var i = 0; i < result.length; i++) {
                    str += '<tr style="cursor:pointer;" data-index="0" data-url="' + redirectUrl + '">';
                    str += ' <td style="display:none">' + result[i]['SystemID'] + '</td>';
                    //  str += ' <td style="display:none">' + result[i]['RowNumber'] + '</td>';
                    var tdCount = 0;
                    for (var j = 0; j < splitColumnName.length; j++) {
                        var isDateTime = false;
                        var columnDataType = '';
                        for (var d = 0; d < data.fieldsAndType.length; d++) {
                            if (splitColumnName[j].trim() === data.fieldsAndType[d].Name && data.fieldsAndType[d].BaseType === "DATETIME") {
                                isDateTime = true;
                            } else if (splitColumnName[j].trim() === data.fieldsAndType[d].Name && data.fieldsAndType[d].BaseType === "VARBINARY") {
                                columnDataType = data.fieldsAndType[d].BaseType
                            }
                        }
                        var docTdStyle = 'display:none;';
                        if (j === splitColumnName.length - 1 && element.attr('data-page-document') === 'show') {
                            docTdStyle = 'display:block;';
                            str += ' <td class="docCountTd" style=" ' + docTdStyle + '">' + result[i]['docCount'] + '</td>';
                        }
                        else {
                            var colTdStyle = '';
                            $.each(conditionalFormating, function (k) {
                                var dataColumn, formateColumn;
                                dataColumn = splitColumnName[j] === undefined ? '' : splitColumnName[j];
                                formateColumn = conditionalFormating[k].column === undefined ? ' ' : conditionalFormating[k].column;
                                if (dataColumn !== '' && formateColumn !== '' && dataColumn.trim() === formateColumn.trim()) {
                                    var colDBValue = result[i][splitColumnName[j].trim()];
                                    var colDataType = conditionalFormating[k].dataType;
                                    var colConditionValue = conditionalFormating[k].value;
                                    var colCondition = conditionalFormating[k].condition;
                                    try {
                                        if (colDataType === 'int') {
                                            colConditionValue = parseInt(colConditionValue);
                                            colDBValue = parseInt(colDBValue);
                                        }
                                        if (colDataType === 'float') {
                                            colConditionValue = parseFloat(colConditionValue);
                                            colDBValue = parseFloat(colDBValue);
                                        }
                                        if (colDataType === 'date') {
                                            colConditionValue = new Date(colConditionValue);
                                            colDBValue = new Date(colDBValue);
                                        }
                                    }
                                    catch (err) {
                                        colConditionValue = null;
                                    }
                                    var conditonValid = false;
                                    if (colCondition === '=') {
                                        conditonValid = colConditionValue === colDBValue ? true : false;
                                    }
                                    else if (colCondition === '<>') {
                                        conditonValid = colConditionValue !== colDBValue ? true : false;
                                    }
                                    else if (colCondition === '>') {
                                        conditonValid = colConditionValue < colDBValue ? true : false;
                                    }
                                    else if (colCondition === '<') {
                                        conditonValid = colConditionValue > colDBValue ? true : false;
                                    }
                                    if (conditonValid) {
                                        colTdStyle = 'color:' + conditionalFormating[k].forColor + ';' + 'background:' + conditionalFormating[k].backColor;
                                    }
                                }
                            })
                            if (isDateTime) {

                                var datetm = new Date(result[i][splitColumnName[j].trim()]);
                                var dateString = datetm.getDate() + '/' + (datetm.getMonth() + 1) + '/' + datetm.getFullYear();
                                if (datetm.getFullYear() <= 1900) {
                                    dateString = '';
                                }
                                str += ' <td style=" ' + colTdStyle + '">' + dateString + '</td>';
                            }
                            else if ('VARBINARY' === columnDataType) {
                                if (splitColumnName[j].trim() !== '' && splitColumnName[j].trim().toLowerCase() !== 'null' && result[i][splitColumnName[j].trim()] !== '' && result[i][splitColumnName[j].trim()] !== null) {
                                    str += ' <td class="binaryData" style=" ' + colTdStyle + '">' + ' <a title="abc" href="javascript:void(0)" onclick="fsi.DownLoadFile(\'' + result[i][splitColumnName[j].trim()] + '\');">Download</a>' + '</td>';
                                }
                                else {
                                    str += ' <td style=" ' + colTdStyle + '">&nbsp;</td>';
                                }
                            }
                            else {
                                if (element.data('hidefirstcolumn') === 'yes' && tdCount === 0) {
                                    if (splitColumnName[j].trim() !== '' && splitColumnName[j].trim().toLowerCase() !== 'null') {
                                        var cellValue = '&nbsp;';
                                        if (result[i][splitColumnName[j].trim()] !== '') {
                                            cellValue = result[i][splitColumnName[j].trim()];
                                        }
                                        str += ' <td style="display:none;  ' + colTdStyle + '">' + cellValue + '</td>';
                                    }
                                    else {
                                        str += ' <td style="display:none; ' + colTdStyle + '">&nbsp;</td>';
                                    }
                                }
                                else {
                                    if (splitColumnName[j].trim() !== '' && splitColumnName[j].trim().toLowerCase() !== 'null') {
                                        var cellValue = '&nbsp;';
                                        if (result[i][splitColumnName[j].trim()] !== '') {
                                            cellValue = result[i][splitColumnName[j].trim()];
                                        }
                                        str += ' <td style=" ' + colTdStyle + '">' + cellValue + '</td>';
                                    }
                                    else {
                                        str += ' <td style=" ' + colTdStyle + '">&nbsp;</td>';
                                    }
                                }
                                tdCount++;
                            }
                        }
                    }
                    str += '</tr>';
                    element.find('.imgLoader').hide();
                }
                if (parseInt(pageIndex) === 1) {
                    str += '</tbody></table></div>';
                    str += '<div class="fixed-table-pagination"></div>';
                    str += '</div></div>';
                    tableTag.append(str);
                }
                else {
                    tableTag.children().find('table').append(str);
                    element.find('.imgLoader').hide();
                }
                if (element.attr('data-progressive-status') === 'on') {
                    DataListLoading(element);
                }
                if (element.attr('data-redirect-url') !== "select" && element.attr('data-redirect-url') !== undefined) {
                    fsi.dataListRowClickEvent(element, element.attr('data-redirect-url'), element.attr('data-url'));
                }
                if (element.attr('data-page-document') === 'show' && element.attr('data-page-document') !== undefined) {
                    fsi.dataListRowDocumentClick(element);
                }
                if (element.data('isfirstrowselected') === true) {
                    var firstRowTd = $(element.find('table>tbody>tr:first>td:first'));
                    var firstRowAllTd = firstRowTd.parent().children();
                    $.each(firstRowAllTd, function (i, v) {
                        $(v).addClass('datalist-active-row-' + element.attr('data-control-id'));
                    });
                    firstRowTd.trigger('click');
                }

                $(element.find('table>tbody>tr>td')).on('click', function () {
                    $.each(element.find('table>tbody>tr>td'), function (i, v) {
                        $(v).removeClass('datalist-active-row-' + element.attr('data-control-id'));
                    });
                    var rowAllTd = $(this).parent().children();
                    $.each(rowAllTd, function (i, v) {
                        $(v).addClass('datalist-active-row-' + element.attr('data-control-id'));
                    });
                });
            }
            else {
                if (element.find('span').next('span')) {
                    element.find('span').next('span').text('0');
                }
                if (element.attr('totalRecords')) {
                    element.attr('totalRecords', '0');
                }
                var tableTag = element.find('.dynamic-datalist');
                var str = '';
                tableTag.empty();
                str += '<div class="bootstrap-table">';
                str += '<div class="fixed-table-toolbar"></div>   ';
                str += '<div class="fixed-table-container" style="height: 100px; padding-bottom: 37px;">';
                str += '<div class="fixed-table-body data-list-scroll">';
                str += '<table width="100%" data-toggle="table" data-url="data1.json" data-cache="false" data-height="100" class="table table-hover tblDataList">';
                str += '<tr><td> No records found!</td></tr></table></div></div>';//</div>
                tableTag.append(str);
            }
        });
    }
    else {
        if (!element.attr('isBindWorkflow')) {
            if (element.find('span').next('span')) {
                element.find('span').next('span').text('0');
            }
            if (element.attr('totalRecords')) {
                element.attr('totalRecords', '0');
            }
            var tableTag = element.find('.dynamic-datalist');
            var str = '';
            tableTag.empty();
            str += '<div class="bootstrap-table">';
            str += '<div class="fixed-table-toolbar"></div>   ';
            str += '<div class="fixed-table-container" style="height: 100px; padding-bottom: 37px;">';
            str += '<div class="fixed-table-body data-list-scroll">';
            str += '<table width="100%" data-toggle="table" data-url="data1.json" data-cache="false" data-height="100" class="table table-hover tblDataList">';
            str += '<tr><td style="text-align:center;"> No records found!</td></tr></table></div></div>';//</div>
            tableTag.append(str);
        }
    }
    console.log('renderDataList complete :' + element.data('controlId') + ' : ' + new Date());
}

/// <summary>
/// download file
/// </summary>
/// <param name="id" type="type">id</param>
fsi.prototype.DownLoadFile = function (id) {
    var myUrl = getTenantUrl() + '/DataObject/DownloadFile';
    window.location = myUrl + '?id=' + id;
}

/// <summary>
/// dataList filter
/// </summary>
/// <param name="element" type="type">element</param>
/// <param name="columnName" type="type">column name</param>
/// <param name="columnValue" type="type">column value</param>
/// <returns type=""></returns>
fsi.prototype.dataListFilter = function (element, columnName, columnValue) {
    if (element === '' || element) { return };
    if (columnName === '' || columnName) { return };
    if (columnValue === '' || columnValue) { return };
    element = $('#' + element).closest('div[data-control-id=' + element + ']');
    var filterComponent = element.data('filter-component');
    $.each(filterComponent, function (i) {
        if (filterComponent[i].component === 'rowFilter' || filterComponent[i].source === columnName) {
            filterComponent.splice(i, 1)
        }
    });
    filterComponent.push({
        component: 'rowFilter',
        dest: '',
        filterCondition: '',
        filterStaticValue: columnValue,
        filterType: 'custom',
        operation: '',
        relationDisabled: '',
        source: columnName
    });
    element.removeData('filterComponent');
    element.attr('data-filter-component', JSON.stringify(filterComponent));
}

/// <summary>
/// data list row values
/// </summary>
/// <param name="dataListName" type="type">data list name</param>
/// <returns type=""></returns>
fsi.prototype.dataListRowValues = function (dataListName) {
    var rowValues = [];
    var row = $(event.target).parent('tr').find("td");
    $.each(row, function (i, v) {
        if (i !== 0 && i !== row.length) {
            rowValues.push($(v).html());
        }
    });
    return rowValues;
}

/// <summary>
/// data list row document click
/// </summary>
/// <param name="element" type="type">element</param>
fsi.prototype.dataListRowDocumentClick = function (element) {
    element.find('.tblDataList').on('click', 'tr td.docCountTd', function (event) {
        if ($(event.target).html() !== "0") {
            var systemId = $(this).parent().find("td:first").text();
            fsi.selectDataObjectForDocumentLinker(systemId, 0, '', function (data) {
                var divElem = document.getElementById('tblDocumentPopUp');
                if (divElem) {
                    $("#tblDocumentPopUp").remove();
                }
                divElem = document.createElement('div');
                divElem.id = 'tblDocumentPopUp';
                //divElem.className = 'modal-body';
                divElem.title = "documents";
                var str = '';
                if (data.length > 0) {
                    var pattern = /Date\(([^)]+)\)/;

                    //$("#tblDocument").attr({ "class": "modal fade", "role": "dialog" });
                    str += "<div class='popup-overlay'></div>"
                    str += "<div class='open-popup'><div  class='title'>Documents</div><div class='close'>x</div>"
                    str += "<table class=\"table table-striped table-bordered table-hover table-condensed\" style=\"width: 100%\">" +
                          "<tr>" +
                              "<th>Version</th>" +
                                "<th>File</th>" +
                              "<th>Creation date</th>" +
                                                 "</tr>";
                    $.each(data, function (i, state) {
                        var docDate = pattern.exec(state.CreateDate)[1];
                        var basePath = location.protocol + "//" + location.host + "/" + location.pathname.split('/').splice(2, 1).join('/');

                        str += "<tr>" +
                                  "<td style='width:5%'>" +
                                    state.Version +
                                   "</td>" +
                                    "<td>" +
                                      "<a title='" + state.FileName + "' href='javascript:void(0)' onclick='DownLoadFile(" + state.FileDocumentId + ");'><img style='width:50px;height:44px' src=" + state.imagesURL + "/DocumentsFile.png" + " /></a>" +
                                    "</td>" +
                                     "<td>" + ToJavaScriptDate(docDate) + "" +
                                    "</td>";
                        '</tr>';
                    });
                    str += "</table></div>";
                }
                divElem.innerHTML = str;
                document.getElementsByTagName("body")[0].appendChild(divElem);

                $(".docCountTd").on("click", function () {
                    $("#tblDocumentPopUp").fadeIn(500);
                })
                $(".open-popup .close, .popup-overlay").on("click", function () {
                    $("#tblDocumentPopUp").fadeOut(500);
                    $("#tblDocumentPopUp").remove();
                });
            });
        }
    });
}

/// <summary>
/// data list row click event
/// </summary>
/// <param name="element" type="type">element</param>
/// <param name="redirectUrlType" type="type">redirect url type</param>
/// <param name="redirectUrl" type="type">redirect url</param>
fsi.prototype.dataListRowClickEvent = function (element, redirectUrlType, redirectUrl) {
    element.find('.tblDataList').on('click', 'tr td:not(.docCountTd,.binaryData)', function (event) {
        if (redirectUrlType.toUpperCase() === 'INTERNAL') {
            $(document).ajaxStop($.unblockUI);
            $.blockUI({ message: '<h1><img src="' + loadingImageUrl + 'loader.gif" /> Loading... </h1>' });
            fsi.pageParameter('SYSTEMID', $(this).parent().find("td:first").text());
            fsi.setPageParameters($('form'));
            fsi.redirectPage(redirectUrl);
        }
        else {
            var externalUrl = redirectUrl;
            if (externalUrl && !externalUrl.match(/^.+:\/\/.*/)) {
                externalUrl = ('http://' + externalUrl);
            }
            window.open(externalUrl, "height=300,width=400")
        }
    });
};

/// <summary>
/// select data object for filtring
/// </summary>
/// <param name="dataObject" type="type">data object</param>
/// <param name="clumnList" type="type">clumn list</param>
/// <param name="where" type="type">where</param>
/// <param name="dataLimit" type="type">data limit</param>
/// <param name="pageIndex" type="type">page index</param>
/// <param name="progressiveSteps" type="type">progressive steps</param>
/// <param name="success" type="type">success</param>
/// <param name="error" type="type">error</param>
fsi.prototype.selectDataObjectForFiltring = function (dataObject, clumnList, where, dataLimit, pageIndex, progressiveSteps, orderBy, order, success, error) {
    var myurl = getTenantUrl() + '/DataObject/SelectDataObjectForDataList';
    var postData;
    if ($.isEmptyObject(where)) {
        where = 'null';
    }
    var orderBy = {
        ColumnName: orderBy,
        ColumnValue: order,
        Condition: '',
        Operator: ''
    };
    postData = JSON.stringify({
        'dataObject': dataObject, 'clumnList': clumnList, 'where': where, 'dataLimit': dataLimit, 'pageIndex': pageIndex, 'progressiveSteps': progressiveSteps, 'orderBy': orderBy
    });
    $.ajax({
        //  cache: false,
        url: myurl,
        async: true,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'POST',
        data: postData,
        beforeSend: function () {

        },
        success: success,
        complete: function () {
            // make the header fixed on scroll
            //$('.table-fixed-header').fixedHeader();
        },
        error: error,
    });
}

/// <summary>
/// render combo
/// </summary>
/// <param name="element" type="type">element</param>
/// <param name="intialData" type="type">intial data</param>
renderCombo = function (element, intialData) {
    var filterControl = element.attr('data-filter-control');
    if (filterControl) {
        $('#' + filterControl).on('change', function () {
            fillCombo(element, intialData);
        });
        fillCombo(element, intialData);
    }
    else {
        fillCombo(element, intialData);
    }
    $(element).find('.ui-icon').on("click", function () {
        $(element).find('.ui-btn-corner-all').trigger('click');
    });
    $(element).find('.ui-btn-text').children().on("click", function (e) {
        $(this).parent().trigger('click')
    });
}

/// <summary>
/// fill combo
/// </summary>
/// <param name="element" type="type">element</param>
/// <param name="intialData" type="type">intial data</param>
/// <param name="filterData" type="type">filter data</param>
fillCombo = function (element, intialData, filterData) {
    var dataObject = 'null'; var where = 'null'; var orderBy = 'null'; var order = 'null', defaultOption, result;;
    if (element.attr('data-related-table')) {
        dataObject = element.attr('data-related-table');
    }
    if (element.attr('data-sort-column')) {
        orderBy = element.attr('data-sort-column');
    }
    if (element.attr('data-sort-order')) {
        order = element.attr('data-sort-order');
    }
    if (element.attr('data-default-option')) {
        defaultOption = element.attr('data-default-option');
    }
    if (filterData) {
        where = {
        };
        if (Object.keys(filterData).length > 0) {
            for (var i = 0; i < Object.keys(filterData).length; i++) {
                where[Object.keys(filterData)[0]] = filterData[Object.keys(filterData)[0]];
            }
        }
    }
    else if (element.attr('data-filter-control') && !filterData) {
        var filterControl = $('#' + element.attr('data-filter-control'));
        where = {
        };
        if (filterControl.val() !== '' && filterControl.val() !== null) {
            where[element.attr('data-filter-column')] = filterControl.val();
        }
        else {
            where[element.attr('data-filter-column')] = filterControl.find('option').first().val();
        }

    }
    if (dataObject !== 'null' && dataObject !== undefined) {
        fsi.selectDataObject(dataObject, where, function (data) {
            var jsonData;
            if (data !== '') {
                jsonData = JSON.parse(data);
                result = fsi.sortResults(jsonData, orderBy, order);
            }
            var text, value;
            text = element.attr('data-object-properties');
            value = element.attr('data-object-properties');
            $(element).find('select').empty();
            $(element).find('select').siblings('span').find('.ui-btn-text').html('<span></span>');
            if (defaultOption) {
                element.find('select').append('<option value="">' + defaultOption + '</option>');
            }
            if (result) {
                for (var i = 0; i < result.length; i++) {
                    if (result[i][text] !== '') {
                        if (moment(result[i][text], moment.ISO_8601, true).isValid()) {
                            var m = moment(result[i][text]);
                            var dateFormatted = m.format('D/MM/YYYY H:mm:ss');
                            element.find('select').append('<option value=' + result[i]['SystemID'] + '>' + dateFormatted + '</option>');
                        }
                        else {
                            element.find('select').append('<option value=' + result[i]['SystemID'] + '>' + result[i][text] + '</option>');
                        }
                    }
                }
            }
            var intialValue = $(element).find('select').find('option:first').val();
            var intialText = $(element).find('select').find('option:first').text();
            if (intialValue) {
                if (!defaultOption) {
                    element.find('select').val(intialValue);
                }
                $(element).find('select').siblings('span').find('.ui-btn-text').html('<span>' + intialText + '</span>');
            }
            if ($(element).data('object-column')) {
                if (intialData) {
                    var selectedVal = intialData[0][$(element).data('object-column')];
                    if (selectedVal) {
                        $(element).find('select').val(selectedVal);
                        $(element).find('select').siblings('span').find('.ui-btn-text').html('<span>' + $(element).find('select option:selected').text() + '</span>');
                    }
                }
            }
        }, function (error) {
            console.log(error);
        },
        function () {
            //element.find('select').trigger('change');
        });
    }
    else {
        var intialValue = $(element).find('select').find('option:first').text();
        if (intialValue) {
            if (!defaultOption) {
                element.find('select').val(intialValue);
            }
            $(element).find('select').siblings('span').find('.ui-btn-text').html('<span>' + intialValue + '</span>');
        }
        if (intialData) {
            var selectedVal = intialData[0][$(element).data('object-column')];
            if (selectedVal) {
                $(element).find('select').val(selectedVal);
                $(element).find('select').siblings('span').find('.ui-btn-text').html('<span>' + $(element).find('select option:selected').text() + '</span>');
            }
        }
    }
}

/// <summary>
/// render map control
/// </summary>
/// <param name="element" type="type">element</param>
renderMap = function (element) {
    var dataObject = 'null'; var where = 'null'; var orderBy = 'null'; var order = 'null'; var dataObjectColumn = null;
    var pinpoints = [];
    var identifier = element.find('[data-control=map]').empty().attr('id');
    if (element.data('pinpoints') !== '') {
        pinpoints = element.data('pinpoints').split(',');
        $.each(pinpoints, function (id, value) {
            var data = value.split(';');
            if (data[0] !== undefined && data[1] !== undefined) {
                pinpoints[id] = { lat: +data[0], lon: +data[1] };
            }
        });
    }
    else {
        pinpoints[0] = fsi.getCurrentPosition();
    }
    if (element.attr('data-related-table')) {
        dataObject = element.attr('data-related-table');
    }
    if (element.attr('data-object-properties')) {
        dataObjectColumn = element.attr('data-object-properties').split(',');
    }
    if (element.attr('data-sort-column')) {
        orderBy = element.attr('data-sort-column');
    }
    if (element.attr('data-sort-order')) {
        order = element.attr('data-sort-order');
    }

    if (element.attr('data-filter-column')) {
        where = {
        };
        where[element.attr('data-filter-column')] = element.attr('data-filter-values');
    }
    if (dataObject !== 'null') {
        fsi.selectDataObject(dataObject, where, function (data) {
            var jsonData = JSON.parse(data);
            result = fsi.sortResults(jsonData, orderBy, order);
            $.each(result, function (index, value) {
                if (dataObjectColumn !== null && dataObjectColumn.length > 0) {
                    if (pinpoints.length > 0) {
                        var objIndex = pinpoints.length;
                        pinpoints[objIndex] = {
                            lat: +value[dataObjectColumn[0]], lon: +value[dataObjectColumn[1]]
                        };
                    }
                    else {
                        pinpoints[index] = { lat: +value[dataObjectColumn[0]], lon: +value[dataObjectColumn[1]] };
                    }
                }
            });
        }, function () { }, function () {
            fsi.Mapping(identifier, pinpoints)
        });
    } else {
        fsi.Mapping(identifier, pinpoints);
    }
}

/// <summary>
/// mapping
/// </summary>
/// <param name="identifier" type="type">identifier</param>
/// <param name="pinpoints" type="type">pinpoints</param>
fsi.prototype.Mapping = function (identifier, pinpoints) {
    var map, layer;
    var size, icon;
    var epsg4326 = new OpenLayers.Projection("EPSG:4326"); //WGS 1984 projection

    map = new OpenLayers.Map(identifier, {
        theme: null
    });
    layer = new OpenLayers.Layer.OSM("OpenStreetMap", null, {
        attribution: ''
    });
    map.addLayer(layer);
    var markers = new OpenLayers.Layer.Markers("Markers");
    map.addLayer(markers);
    size = new OpenLayers.Size(21, 25);
    var calculateOffset = function (size) {
        return new OpenLayers.Pixel(-(size.w / 2), -size.h);
    };
    if ($('#' + identifier).parent().data('pinimage') !== undefined && $('#' + identifier).parent().data('pinimage') !== '') {
        icon = new OpenLayers.Icon($('#' + identifier).parent().data('pinimage'), size, null, calculateOffset);
    }
    else {
        icon = new OpenLayers.Icon(rootImageUrl + 'marker.png', size, null, calculateOffset);
    }
    $.each(pinpoints, function (id, value) {
        var lonlat = new OpenLayers.LonLat(value.lon, value.lat).transform(epsg4326, map.getProjectionObject());
        if (id === 0) {
            markers.addMarker(new OpenLayers.Marker(lonlat, icon));
        } else {
            markers.addMarker(new OpenLayers.Marker(lonlat, icon.clone()));
        }
    });

    if (pinpoints.length > 0) {
        if ($('#' + identifier).parent().data('hidden') !== undefined && $('#' + identifier).parent().data('hidden').toLowerCase() !== 'hidden') {
            var newBound = map.layers[1].getDataExtent();
            if (!$('#' + identifier).parent().data('permission_hidden')) {
                map.zoomToExtent(newBound);
            }

        }
    }
}

/// <summary>
/// get current position
/// </summary>
/// <returns type=""></returns>
fsi.prototype.getCurrentPosition = function () {
    var locationCoords = {
        lat: '51.557647', lon: '0.252052'
    };
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            locationCoords = { lat: + '' + position.coords.latitude + '', lon: + '' + position.coords.latitude + '' };
        }, function (error) {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    alert("User denied the request for Geolocation.");
                    break;
                case error.POSITION_UNAVAILABLE:
                    alert("Location information is unavailable.");
                    break;
                case error.TIMEOUT:
                    alert("The request to get user location timed out.");
                    break;
                case error.UNKNOWN_ERROR:
                    alert("An unknown error occurred.");
                    break;
            }
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
    return locationCoords;
}

/// <summary>
/// render tree view control
/// </summary>
/// <param name="element" type="type">element</param>
/// <param name="intialData" type="type">intial data</param>
renderTreeView = function (element, intialData) {
    var dataObject = 'null'; var where = 'null'; var dataObjectColumn = null, dataObjectColumnText = null, dataobjectproperties = null;
    var childObject = 'null';
    if (element.parents('form').attr('data-object-table')) {
        childObject = element.parents('form').attr('data-object-table');
    }
    if (element.attr('data-object-column')) {
        dataObjectColumn = element.attr('data-object-column');
    }
    if (element.attr('data-display-text')) {
        dataObjectColumnText = element.attr('data-display-text');
    }
    if (element.attr('data-related-table')) {
        dataObject = element.attr('data-related-table');
    }
    if (element.attr('data-object-properties')) {
        dataobjectproperties = element.attr('data-object-properties');
    }
    fsi.selectDataObjectForTreeViewData(childObject, dataObject, dataObjectColumn, dataobjectproperties, dataObjectColumnText, function (data) {
        var container = $(element).find('.tree-menu-wrapper');
        if (data.length > 0) {
            var rootNode = "Root";
            if ($(element).data('defaultnode')) {
                var rootNode = $(element).data('defaultnode');
            }
            var treeObject = [{
                "Name": rootNode,
                "ChildSubSet": data
                , "folder": true
            }
            ];

            $(container).html("");
            var jsonObj = {
                "Root": treeObject
            };
            buildTree(jsonObj, container[0]);
        }
        else {
            $(container).html('');
            $(container).html('No record found.');
        }
    });
}

/// <summary>
/// sort results
/// </summary>
/// <param name="data" type="type">data</param>
/// <param name="prop" type="type">prop</param>
/// <param name="order" type="type">order</param>
fsi.prototype.sortResults = function (data, prop, order) {
    return data.sort(function (a, b) {
        var x = a[prop]; var y = b[prop];
        if (typeof x === 'string') {
            x = x.toLowerCase();
        }
        if (typeof y === 'string') {
            y = y.toLowerCase();
        }
        if (order === 'asc') {
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        }
        else if (order === 'desc') {
            return ((x < y) ? 1 : ((x > y) ? -1 : 0));
        }
    });
}

/// <summary>
/// filter combo
/// </summary>
/// <param name="id" type="type">id</param>
/// <param name="column" type="type">column</param>
/// <param name="value" type="type">value</param>
fsi.prototype.filterCombo = function (id, column, value) {
    var element = $("[data-control-id=" + id + "]");
    var filterData = {};
    filterData[column] = value;
    fillCombo(element, '', filterData);
}

/// <summary>
/// set page hitory
/// </summary>
/// <param name="pageName" type="type">page name</param>
fsi.prototype.setPageHitory = function (pageName) {
    var pageHistory = JSON.parse(sessionStorage.getItem("pageHistory"));
    if (pageHistory === null) pageHistory = [];
    if (pageHistory.length > 0) {
        $.each(pageHistory, function (i) {
            if (pageHistory[i] === pageName && pageName !== '') {
                pageHistory.splice(i, 1);
            }
        });
        pageHistory.push(pageName);
    }
    else {
        pageHistory.push(pageName);
    }
    sessionStorage.setItem("pageHistory", JSON.stringify(pageHistory));
}

/// <summary>
/// go back
/// </summary>
fsi.prototype.goBack = function () {
    var pageHistory = sessionStorage.getItem("pageHistory");
    var goPage;
    if (JSON.parse(pageHistory).length < 2) {
        goPage = JSON.parse(pageHistory)[JSON.parse(pageHistory).length - 1]
    }
    else {
        goPage = JSON.parse(pageHistory)[JSON.parse(pageHistory).length - 2]
    }
    console.log('goPage ' + goPage);
    checkPageEvents('beforeunload');
    checkPageEvents('unload');
    fsi.changePage(goPage);
};
/// <summary>
/// object declaration for Language Data
/// </summary>
fsi.prototype.LanguageData = [];

/// <summary>
/// object declaration for IsAssignedCustomPermission
/// </summary>
fsi.prototype.IsAssignedCustomPermission = false;

/// <summary>
/// check Page DataKey
/// </summary>
/// <param name="form" type="type"></param>
fsi.prototype.checkPageDataKey = function (form) {
};

/// <summary>
/// change page
/// </summary>
/// <param name="pageName" type="type">page name</param>
fsi.prototype.changePage = function (pageName) {
    try {
        $(window).off('load');
        fsi.loadBackground(pageName, 'versionPreview');
        $(document).ajaxStop($.unblockUI);
        $.blockUI({ message: '<h1><img src="' + loadingImageUrl + 'loader.gif" /> Loading... </h1>' });
        var myurl = null;
        var toActiveMenuId = $('#menuNavigation').attr('menuId');
        if (toActiveMenuId === undefined || toActiveMenuId === null) {
            toActiveMenuId = 0;
        }
        if (pageName !== undefined) {
            setLastPage(pageName);
            fsi.setPageHitory(pageName);
            if (pageName === 'startPage') {
                myurl = fsi.tenant + '/App?id=' + fsi.formId + '&menuId=' + toActiveMenuId;
            } else {
                myurl = fsi.tenant + '/ChangePage?pageName=' + pageName + '&versionId=0&menuId=' + toActiveMenuId;
            }
        } else {
            pageName = fsi.getLastPage();
            if (!pageName || pageName === 'startPage') {
                sessionStorage.removeItem("pageHistory");
                fsi.setPageHitory('startPage');
                myurl = fsi.tenant + '/App?id=' + fsi.formId + '&menuId=' + toActiveMenuId;
            }
            else {
                setLastPage(pageName);
                myurl = fsi.tenant + '/ChangePage?pageName=' + pageName + '&versionId=0&menuId=' + toActiveMenuId;
            }
        }
        $.ajax({
            cache: false,
            url: myurl,
            async: true,
            beforeSend: function () {
            },
            success: function (data) {
                if (!data.formData) {
                    $.unblockUI();
                    return;
                }

                $('ul.nav-tabs').find('li[menu="parent"]').each(function (index, element) {
                    var parent = $(this);
                    var a = $(this).find('ul.dropdown-menu mega-menu li');
                    var style = $(this).find('ul').attr('class');
                    var ul = $(this).find('ul').val();
                    var classname = $(this).attr('class');
                    if (style === "dropdown-menu mega-menu" || style === "dropdown-menu" || ul === null) {
                        $(this).find('.dropdown-menu li').find('a').each(function (key, childElement) {
                            var click = $(this).attr('onclick');
                            if (click !== null && click !== undefined) {
                                var arrParam = click.split(',');
                                var _menuId = data.menuId === 0 ? arrParam[5] : "'" + data.menuId + "'";
                                if (arrParam[1] === "'" + data.formId + "'" && arrParam[4] === "'" + data.formKey + "'" && arrParam[5] === _menuId)//1=formid 4-formkey
                                {
                                    $('ul.nav-tabs li').removeClass('active');
                                    parent.addClass('active');
                                    $(childElement).parent().addClass('active');
                                    return false;
                                }
                            }
                        });
                        if (classname === "" || classname === " ") {
                            $(this).find('a').each(function (key, childElement) {
                                var click = $(this).attr('onclick');
                                if (click !== null && click !== undefined) {
                                    var arrParam = click.split(',');
                                    var _menuId = data.menuId === 0 ? arrParam[5] : "'" + data.menuId + "'";
                                    if (arrParam[1] === "'" + data.formId + "'" && arrParam[4] === "'" + data.formKey + "'" && arrParam[5] === _menuId)//1=formid 4-formkey
                                    {
                                        $('ul.nav-tabs li').removeClass('active');
                                        parent.addClass('active');
                                        $(childElement).parent().addClass('active');
                                        return false;

                                    }
                                }
                            });
                        }
                        var clickText = $(element).find('a').attr('onclick');
                        if (clickText !== null && clickText !== undefined) {
                            var arrParameters = clickText.split(',');
                            var _menuId = data.menuId === 0 ? arrParameters[5] : "'" + data.menuId + "'";
                            if (arrParameters[1] === "'" + data.formId + "'" && arrParameters[4] === "'" + data.formKey + "'" && arrParameters[5] === _menuId)//1=formid 4-formkey
                            {
                                //$('ul.nav-tabs li').removeClass('active');
                                $('ul.nav-tabs li').find('div').find('li').removeClass('active');
                                $('ul.nav-tabs li').find('ul.dropdown-menu li').removeClass('active');
                                $(element).addClass('active');
                                return false;
                            }
                        }
                    }
                    else if (style === "dropdown-menu mega-menu") {
                        $(this).find('.dropdown-menu li').find('li').find('a').each(function (key, childElement) {
                            var click = $(this).attr('onclick');
                            if (click !== null && click !== undefined) {
                                var arrParam = click.split(',');
                                var _menuId = data.menuId === 0 ? arrParam[5] : "'" + data.menuId + "'";
                                if (arrParam[1] === "'" + data.formId + "'" && arrParam[4] === "'" + data.formKey + "'" && arrParam[5] === _menuId)//1=formid 4-formkey
                                {
                                    $('ul.nav-tabs li').removeClass('active');
                                    parent.addClass('active');
                                    $(childElement).parent().addClass('active');
                                    return false;
                                }
                            }
                        });

                        $(element).find('li').find('li').each(function () {
                            var par = $(this);
                            var clickText = $(this).find('a').attr('onclick');
                            if (clickText !== null && clickText !== undefined) {
                                var arrParameters = clickText.split(',');
                                var _menuId = data.menuId === 0 ? arrParameters[5] : "'" + data.menuId + "'";
                                if (arrParameters[1] === "'" + data.formId + "'" && arrParameters[4] === "'" + data.formKey + "'" && arrParameters[5] === _menuId)//1=formid 4-formkey
                                {
                                    //$('ul.nav-tabs li').removeClass('active');
                                    $('ul.nav-tabs li').find('div').find('li').removeClass('active');
                                    $('ul.nav-tabs li').find('ul.dropdown-menu li').removeClass('active');

                                    par.addClass('active');
                                    return false;
                                }
                            }
                        });
                    }
                    else {
                        $(element).find('li').find('li').each(function () {
                            var par = $(this);
                            var clickText = $(this).find('a').attr('onclick');
                            if (clickText !== null && clickText !== undefined) {
                                var arrParameters = clickText.split(',');
                                var _menuId = data.menuId === 0 ? arrParameters[5] : "'" + data.menuId + "'";
                                if (arrParameters[1] === "'" + data.formId + "'" && arrParameters[4] === "'" + data.formKey + "'" && arrParameters[5] === _menuId)//1=formid 4-formkey
                                {
                                    //$('ul.nav-tabs li').removeClass('active');
                                    $('ul.nav-tabs li').find('div').find('li').removeClass('active');
                                    $('ul.nav-tabs li').find('ul.dropdown-menu li').removeClass('active');

                                    par.addClass('active');
                                    return false;
                                }
                            }
                        });
                    }
                });
                var content = data.formData;
                var selectedLanguageCode = $("#ddlLanguageCode").attr('lang-code');
                if (selectedLanguageCode === undefined || selectedLanguageCode === null) {
                    selectedLanguageCode = $('#hdnLanguageCode').val();
                }
                fsi.LanguageData = {};
                if (data.translations) {
                    $.each(data.translations, function (key, value) {
                        if (value["Code"].trim() === selectedLanguageCode) {
                            fsi.LanguageData = JSON.parse(value["Translations"]);
                        }
                    });
                }
                if (data.formData && data.isPageUnauthorize) {
                    $('#HtmlContentDiv').empty();
                    $('#HtmlContentDiv').html(data.formData);
                    $('#HtmlContentDiv').css('font-size', '18px');
                    $('#HtmlContentDiv').css('font-weight', 'bold');
                    $.unblockUI();
                    return;
                }
                $(document).find('#BodyThemeDiv').attr('data-theme', data.theme);
                var temp = $("#BodyThemeDiv").parents('body').find(".ui-page").attr('class').split(' ');
                var removingClass = null;
                $(temp).each(function (index, value) {
                    if (value.indexOf('ui-body-') > -1) {
                        removingClass = value;
                    }
                });
                $('#BodyThemeDiv').parents('body').find('.ui-page').removeClass(removingClass);
                $('#BodyThemeDiv').parents('body').find('.ui-page').addClass("ui-body-" + data.theme);
                var bodyHeight = $('#BodyThemeDiv').parents('body').find('.ui-page').css('min-height');
                var backgroundAttr = $('#BodyThemeDiv').parents('body').find('.ui-page').attr('style');

                $('#BodyThemeDiv').parents('body').find('.ui-page').attr('style', backgroundAttr + ';overflow:auto !important;');

                $('#BodyThemeDiv').parents('body').find('.ui-page').css("overflow", "auto !important");
                $('#HtmlContentDiv').empty();
                $('#HtmlContentDiv').hide();
                $('#HtmlContentDiv').append($(content));
                readyControl();
                $("form").trigger("create");
                if ($("form").data('padding') !== undefined) {
                    var padding = $("form").data('padding').split(',');
                    $('#content').attr('style', 'padding:' + padding[0] + 'px ' + padding[1] + 'px ' + padding[2] + 'px ' + padding[3] + 'px;');
                }
                if ($("form").data('margin') !== undefined) {
                    var margin = $("form").data('margin').split(',');
                    var paddingAttr = $('#content').attr('style');
                    $('#content').attr('style', paddingAttr + 'margin:' + margin[0] + 'px ' + margin[1] + 'px ' + margin[2] + 'px ' + margin[3] + 'px; ');
                }
                var controls = $('form [data-control-type]')
                ;
                for (var i = 0; i < controls.length; i++) {
                    fsi.renderControlLanguage($(controls[i]));
                };
                var isPageLoad = !fsi.WorkflowReady();
                checkPageEvents('pagechange');
                if (isPageLoad) {
                    renderPage($('form'));
                }
            },
            complete: function () {
                checkPageEvents('load');
                $.unblockUI();
                multidirection();
            },
            error: function () {
                $.unblockUI();
            }
        });
    }
    catch (e) {
        $.unblockUI();
    }
}

/// <summary>
/// check page events
/// </summary>
/// <param name="eventName" type="type">event name</param>
function checkPageEvents(eventName) {
    var pageEvent = $._data(window, 'events');
    if (pageEvent.load !== undefined && eventName === 'load') {
        $(window).trigger("load");
        if ($._data(window, 'events').load !== undefined) {
            $._data(window, 'events').load.pop();
        }
    }
    if (pageEvent.unload !== undefined && eventName === 'unload') {
        $(window).trigger("unload");
        if ($._data(window, 'events').unload !== undefined) {
            $._data(window, 'events').unload.pop();
        }
    }
    if (pageEvent.beforeunload !== undefined && eventName === 'beforeunload') {
        $(window).trigger("beforeunload");
        if ($._data(window, 'events').beforeunload !== undefined) {
            $._data(window, 'events').beforeunload.pop();
        }
    }
    if (pageEvent.pagechange !== undefined && eventName === 'pagechange') {
        $(window).trigger("pagechange");
        if ($._data(window, 'events').pagechange !== undefined) {
            $._data(window, 'events').pagechange.pop();
        }
    }
}

/// <summary>
/// multi direction
/// </summary>
function multidirection() {
    if (isMultidirection === "True") {
        $('form input[type="text"]').css({ "text-align": "right" });
        $('form textarea').css({ "text-align": "right" });
        //   $('.ui-checkbox').css({ "padding-right": "140px" });
        $('.ui-checkbox').attr({
            "dir": "rtl"
        });
        // $('.ui-radio').css({ "padding-right": "110px" });
        $('.ui-radio').attr({
            "dir": "rtl"
        });
    }
}

/// <summary>
/// register event
/// </summary>
/// <param name="target" type="type">target</param>
/// <param name="eventName" type="type">event name</param>
/// <param name="callFunction" type="type">call function</param>
fsi.prototype.registerEvent = function (target, eventName, callFunction) {
    function handlerExists(eventName, theHandler) {
        function getFunctionName(callFunction) {
            var rgx = /^function\s+([^\(\s]+)/
            var matches = rgx.exec(callFunction.toString());
            return matches ? matches[1] : "(anonymous)"
        }
        exists = false;
        var handlerName = getFunctionName(theHandler);
        if ($._data(target, "events") !== undefined) {
            var event = $._data(target, "events")[eventName];
            if (event !== undefined) {
                $.each(event, function (i, evt) {
                    if (getFunctionName(evt.handler) === handlerName) {
                        exists = true;
                    }
                });
            }
        }
        return exists;
    }
    if (!handlerExists(eventName, callFunction)) {
        $(target).off(eventName);
        $(target).on(eventName, callFunction);
    }
}

/// <summary>
/// page event
/// </summary>
/// <param name="eventName" type="type">event name</param>
/// <param name="callback" type="type">callback</param>
fsi.prototype.pageEvent = function (eventName, callback) {
    if (eventName === 'scroll') {
        $('div[data-role=page]').off(eventName);
        $('div[data-role=page]').on(eventName, callback);
    }
    else {
        fsi.registerEvent(window, eventName, callback);
    }
}

/// <summary>
/// load background
/// </summary>
/// <param name="pageName" type="type">page name</param>
/// <param name="from" type="type">from</param>
fsi.prototype.loadBackground = function (pageName, from) {
    // $($('body').children()[0]).attr('style', "background:none !important");
    var loadBackgroundUrl = null;
    if (from === 'versionPreview') {

        if (pageName !== undefined && pageName !== 'startPage') {
            loadBackgroundUrl = fsi.tenant + '/LoadBackground/?id=0&pageName=' + pageName;
        }
        else {
            loadBackgroundUrl = fsi.tenant + '/LoadBackground/' + fsi.formId;
        }
    }
    else {
        loadBackgroundUrl = fsi.tenantForDesign + '/LoadBackground/' + pageName;
    }

    var request = $.ajax({
        url: loadBackgroundUrl,
        type: 'GET',
        cache: false
    });
    request.done(function (data) {
        if (data.isSuccess) {
            if (data.bgColor !== undefined && data.bgColor !== null && data.bgColor !== '') {
                $($('body').children()[0]).attr('style', "background-color:" + data.bgColor + " !important");
            }
            else {

                $($('body').children()[0]).removeAttr('style');

                $('#BodyThemeDiv').parents('body').find('.ui-page').attr('style', 'overflow:auto !important;');

                $('#BodyThemeDiv').parents('body').find('.ui-page').css("overflow", "auto !important");
            }
        }
        var page = $('#backgroundImageContainer').parent();
        if (data.isSuccess && data.bacgroundImage !== null && data.bacgroundImage !== '') {
            // $('#backgroundImageContainer').parent().addClass('bg-none');
            //var page = $('#master-view');
            var styles = page.attr('style');
            styles = (styles == undefined || styles == null) ? '' : styles + ';';

            if (data.bgSize === 'original') {
                if (data.posY === 'top') {
                    page.attr('style', styles + " background-position:" + data.posX + " " + data.posY + " 66px" + ";background-image:url(" + data.bacgroundImage + ");background-repeat: no-repeat;");
                } else if (data.posY === 'bottom') {
                    page.attr('style', styles + " background-position:" + data.posX + " " + data.posY + " 50px" + ";background-image:url(" + data.bacgroundImage + ");background-repeat: no-repeat;");
                }

                else {
                    page.attr('style', styles + " background-position:" + data.posX + " " + data.posY + ";background-image:url(" + data.bacgroundImage + ");background-repeat: no-repeat;");
                }
            }
            else if (data.bgSize === 'fill') {
                if (data.posY === 'top') {
                    page.attr('style', styles + " background-position:" + data.posX + " " + data.posY + " 66px" + ";background-image:url(" + data.bacgroundImage + ");background-size:cover;");
                } else {
                    page.attr('style', styles + " background-position:" + data.posX + " " + data.posY + ";background-image:url(" + data.bacgroundImage + ");background-size:cover;");
                }
            }
            else if (data.bgSize === 'fit') {
                if (data.posY === 'top') {
                    page.attr('style', styles + " background-position:" + data.posX + " " + data.posY + " 66px" + ";background-image:url(" + data.bacgroundImage + ");background-repeat:no-repeat;background-size:contain;");
                } else {
                    page.attr('style', styles + " background-position:" + data.posX + " " + data.posY + ";background-image:url(" + data.bacgroundImage + ");background-repeat:no-repeat;background-size:contain;");
                }
            }
            else if (data.bgSize === 'stretch') {
                if (data.posY === 'top') {
                    page.attr('style', styles + " background-position:" + data.posX + " " + data.posY + " 66px" + ";background-image:url(" + data.bacgroundImage + ");background-size: 100% 100%;");
                } else {
                    page.attr('style', styles + " background-position:" + data.posX + " " + data.posY + ";background-image:url(" + data.bacgroundImage + ");background-size: 100% 100%;");
                }
            }
            else if (data.bgSize === 'tile') {
                if (data.posY === 'top') {
                    page.attr('style', styles + " background-position:" + data.posX + " " + data.posY + " 66px" + ";background-image:url(" + data.bacgroundImage + ");background-repeat:repeat;");
                } else {
                    page.attr('style', styles + " background-position:" + data.posX + " " + data.posY + ";background-image:url(" + data.bacgroundImage + ");background-repeat:repeat;");
                }
            }
        }
        else {
            //page.removeAttr('style');
            //$('#backgroundImageContainer').parent().removeClass('bg-none');
        }
    });
    request.error(function (x, y, z) {
    });
}

/// <summary>
/// page parameter
/// </summary>
/// <param name="key" type="type">key</param>
/// <param name="value" type="type">value</param>
fsi.prototype.pageParameter = function (key, value) {
    try {
        var currentDate = new Date();
        var existingParameters = JSON.parse(localStorage.getItem("pageParameters"));
        if (existingParameters === null) {
            existingParameters = [];
        }
        if (key !== undefined && value !== undefined) {
            var expireTime = Math.round((currentDate.setSeconds(currentDate.getSeconds() + 60 * 20)) / 1000);
            parameters.key = key.toUpperCase();
            parameters.value = value;
            parameters.expire = expireTime;
            var isExists = false;
            $.each(existingParameters, function (i) {
                if (existingParameters[i].key === key.toUpperCase() && key !== '') {
                    existingParameters[i].value = value;
                    existingParameters[i].expire = expireTime;
                    isExists = true;
                    return isExists;
                }
            })
            if (!isExists && key !== '') {
                existingParameters.push(parameters);
            }
            localStorage.setItem('pageParameters', JSON.stringify(existingParameters));
        }
        else if (key !== undefined && value === undefined) {
            for (var i = 0; i < existingParameters.length; i++) {
                if (existingParameters[i].key.toUpperCase() === key.toUpperCase()) {
                    var currentTime = Math.round((currentDate.setSeconds(currentDate.getSeconds())) / 1000);
                    if (currentTime < existingParameters[i].expire) {
                        return existingParameters[i].value;
                    }
                }
            }
        }
    }
    catch (ex) {
        console.log(ex);
        return;
    }
}

/// <summary>
/// parameters object declaration
/// </summary>
var parameters = {
    key: '',
    value: '',
    expire: ''
};

/// <summary>
/// set system parameters
/// </summary>
/// <param name="currentForm" type="type">current form</param>
fsi.prototype.setSystemParameters = function (currentForm) {
    var systemkeyParameters = $(currentForm).data('systemkeyParameters');
    if (systemkeyParameters) {
        try {
            var systemParameter = systemkeyParameters.split(',');
            $.each(systemParameter, function (idx) {
                var paramData = systemParameter[idx].split(':');
                if (paramData[0] === true || paramData[0] === 'true') {
                    fsi.pageParameter('SYSTEMID', fsi.getDataKey());
                }
                //if (paramData[1] !== '')
                //{
                //    fsi.setById(paramData[1], fsi.getDataKey());
                //}
            });
        } catch (ex) {
            console.log(ex);
            return;
        }
    };
};

/// <summary>
/// get system parameters
/// </summary>
/// <param name="currentForm" type="type">current form</param>
fsi.prototype.getSystemParameters = function (currentForm) {
    var systemkeyParameters = $(currentForm).data('systemkeyParameters');
    if (systemkeyParameters) {
        try {
            var systemParameter = systemkeyParameters.split(',');
            $.each(systemParameter, function (idx) {
                var paramData = systemParameter[idx].split(':');
                //if (paramData[0] === true || paramData[0] === 'true')
                //{
                //    fsi.setDataKey(fsi.pageParameter('SYSTEMID'));
                //}
                if (paramData[1] !== '') {
                    fsi.setById(paramData[1], fsi.pageParameter('SYSTEMID'));
                }
            });
        } catch (ex) {
            console.log(ex);
            return;
        }
    };
};

/// <summary>
/// set page parameters
/// </summary>
/// <param name="currentForm" type="type">current form</param>
fsi.prototype.setPageParameters = function (currentForm) {
    var inputParameterAttr = $(currentForm).data('inputParameters');
    if (inputParameterAttr) {
        try {
            var inputParameterAttr = inputParameterAttr.split(',');
            $.each(inputParameterAttr, function (idx) {
                var paramData = inputParameterAttr[idx].split(':');
                var controlValue = fsi.getById(paramData[1]);
                fsi.pageParameter(paramData[0], controlValue);
            });
        } catch (ex) {
            console.log(ex);
            return;
        }
    }
}

/// <summary>
/// get page parameters
/// </summary>
/// <param name="currentForm" type="type">current form</param>
fsi.prototype.getPageParameters = function (currentForm) {
    var oututParameterAttr = $(currentForm).data('outputParameters');
    if (oututParameterAttr) {
        var oututParameterAttr = oututParameterAttr.split(',');
        $.each(oututParameterAttr, function (idx) {
            var paramData = oututParameterAttr[idx].split(':');
            var controlValue = fsi.pageParameter(paramData[0]);
            fsi.setById(paramData[1], controlValue);
        });
    }
};

/// <summary>
/// remove parameter
/// </summary>
/// <param name="key" type="type">key</param>
fsi.prototype.removeParameter = function (key) {
    var existingParameters = JSON.parse(localStorage.getItem("pageParameters"));
    if (existingParameters === null) existingParameters = [];
    $.each(existingParameters, function (i) {
        if (existingParameters[i] !== undefined) {
            if (existingParameters[i].key === key.toUpperCase() && existingParameters[i].key !== '') {
                existingParameters.splice(i, 1)
            }
        }
    })

    localStorage.setItem('pageParameters', JSON.stringify(existingParameters))
}

/// <summary>
/// redirect page
/// </summary>
/// <param name="pageName" type="type">page name</param>
fsi.prototype.redirectPage = function (pageName) {
    $(document).ajaxStop($.unblockUI);
    $.blockUI({ message: '<h1><img src="' + loadingImageUrl + 'loader.gif" /> Loading... </h1>' });
    if (pageName === -1) {
        fsi.goBack();
    }
    else {
        checkPageEvents('beforeunload');
        checkPageEvents('unload');
        fsi.changePage(pageName);
    }
}

/// <summary>
/// on 
/// </summary>
/// <param name="event" type="type">event</param>
/// <param name="callback" type="type">callback</param>
fsi.prototype.on = function (event, callback) {
    $(document).off(event);
    $(document).on(event, callback);
}

/// <summary>
/// Get IE Version
/// </summary>
/// <returns type=""></returns>
fsi.prototype.GetIEVersion = function () {
    var sAgent = window.navigator.userAgent;
    var Idx = sAgent.indexOf("MSIE");

    // If IE, return version number.
    if (Idx > 0)
        return parseInt(sAgent.substring(Idx + 5, sAgent.indexOf(".", Idx)));

        // If IE 11 then look for Updated user agent string.
    else if (!!navigator.userAgent.match(/Trident\/7\./))
        return 11;

    else
        return 0; //It is not IE
}

/// <summary>
/// on
/// </summary>
/// <param name="event" type="type">event</param>
/// <param name="selector" type="type">selector</param>
/// <param name="callback" type="type">callback</param>
fsi.prototype.on = function (event, selector, callback) {
    var type = $(selector).closest('div[data-control-type]').data('control-type');
    $(selector).on(event, function (e) {
        //e.stopImmediatePropagation();
        //e.stopPropagation();
        if (!(fsi.GetIEVersion() > 0)) {
            // e.stopImmediatePropagation();
            // e.preventDefault();
            // e.stopPropagation();
        }
        if (event === "click") {
            $(selector).trigger('beforeClick');
        }
        if (type === 'button' && event === "click" && !$(selector).closest('div[data-control-type]').data('validbefore') && $(selector).closest('div[data-control-type]').data('validbefore') !== undefined) {
            return;
        }
        var result = callback();
        if (event === "beforeClick" && result !== undefined) {
            $(selector).closest('div[data-control-type]').data('validbefore', result);
        }
        if (type === 'button') {
            var action = $(selector).closest('div[data-control-type]').find('button').attr('data-action');
            if (action === 'Other') {
                fsiPrivate.buttonEvent(e, selector);
            }
        }
        if (type === 'combo' && event === "change") {
            $(selector).siblings('span').find('.ui-btn-text').html('<span>' + $(selector).find('option:selected').text() + '</span>');
        }
        if (type === 'documentlinker' && event === "click") {
            $(selector).off('click');
            $(selector).trigger('click');
            fsi.on(event, selector, callback);
        }
        if (event === "click") {
            $(selector).trigger('afterClick');
        }
    });
}

/// <summary>
/// button event
/// </summary>
/// <param name="e" type="type">e</param>
/// <param name="selector" type="type">selector</param>
fsiPrivate.prototype.buttonEvent = function (e, selector) {
    var form = $(selector).parents('form:first')[0];
    fsi.setPageParameters($(form));
    fsi.setSystemParameters($(form));
    var _this = $(selector).find('[type="button"]');
    if (_this.data('action').toLowerCase() === "save") {
        _this.attr('disabled', 'disabled');
        var isValid = ValidateForm();
        if (isValid) {
            fsi.saveForm();
            e.stopImmediatePropagation();
        }
        else {
            _this.removeAttr('disabled');
            var errorControls = $(form).find('[data-error-control-id]');
            $.each(errorControls, function (i) {
            });
        }
    }
    else if (_this.data('action').toLowerCase() === "delete") {
        if (confirm('Are you sure you want to delete?')) {
            fsi.deleteFormData();
            e.stopImmediatePropagation();
        }
    }
    else if (_this.data('action').toLowerCase() === "validate") {
        ValidateForm();
    }
    else if (_this.data('action').toLowerCase() === "clear") {
        fsi.clearForm(form);
    }
    else if (_this.data('action').toLowerCase() === "refresh") {
        fsi.refreshPage();
    }
    else if (_this.data('action') === "back") {
        fsi.goBack();
    }
    else if (_this.data('action').toLowerCase() === "link") {
        var linkPage = $(_this).data('goto-form');
        fsi.redirectPage(linkPage);
    }
}
/// <summary>
/// get combobox text
/// </summary>
/// <param name="selector" type="type">selector</param>
/// <returns type=""></returns>
fsi.prototype.getComboText = function (selector) {
    var element = $('div[data-control-id=' + selector + ']');
    return $(element).find('select').find('option:selected').text();
}

/// <summary>
/// get combobox value
/// </summary>
/// <param name="selector" type="type">selector</param>
/// <returns type=""></returns>
fsi.prototype.getComboValue = function (selector) {
    var element = $('div[data-control-id=' + selector + ']');
    return $(element).find('select').find('option:selected').val();
}

/// <summary>
/// get element By Id
/// </summary>
/// <param name="selector" type="type">selector</param>
/// <returns type=""></returns>
fsi.prototype.getById = function (selector) {
    if (selector !== '') {
        var element = $('div[data-control-id=' + selector + ']');
        var controlType = element.data('controlType');
        if (controlType === 'label') {
            return $(element).find('label').text();
        }
        else if (controlType === 'textbox') {
            return $(element).find('input[type=text],input[type=password],input[type=email]').val()
        }
        else if (controlType === 'textarea') {
            return $(element).find('textarea').val();
        }
        else if (controlType === 'checkbox') {
            return $(element).find('input[type="checkbox"]').is(":checked");;
        }
        else if (controlType === 'radio') {
            var radioValue;
            $(element).find('input[type="radio"]').each(function () {
                if ($(this).is(':checked')) {
                    radioValue = $(this).val();
                }
            });
            return radioValue;
        }
        else if (controlType === 'combo') {
            if ($(element).data('datakey') === 'text') {
                if ($(element).find('option:selected').index() === 0 && $(element).attr('data-default-option')) {
                    return '';
                } else {
                    return $(element).find('option:selected').text();
                }
            } else {
                return $(element).find('option:selected').val()
            }
        }
        else if (controlType === 'currency') {
            var p = $(element).data('decimalplaces');
            var num = $(element).find('input[type="text"]').val();
            if (num !== '' && num !== undefined) {
                if ($(element).data('base-currency') !== undefined && $(element).data('base-currency') !== '') {
                    if ($(element).data('base-currency').trim() === 'EUR') {
                        var numCheckDot = num.split('.');
                        var numCheckComma = num.split(',');
                        if (numCheckDot.length > 1 && numCheckComma.length > 1) {
                            num = accounting.unformat(num, ',');
                        }
                        num = parseFloat(num).toFixed(p);
                        return num;
                    }
                    else {
                        num = accounting.unformat(num);
                        num = parseFloat(num).toFixed(p);
                        return num;
                    }
                }
                else {
                    if (localCulture === 'de-DE') {
                        var numCheckDot = num.split('.');
                        var numCheckComma = num.split(',');
                        if (numCheckDot.length > 1 && numCheckComma.length > 1) {
                            num = accounting.unformat(num, ',');
                        }
                        return num;
                    }
                    else {
                        num = accounting.unformat(num);
                        num = parseFloat(num).toFixed(p);
                        return num;
                    }
                }
            }
            else {
                return $(element).find('input[type="text"]').val();
            }
        }
        else if (controlType === 'datepicker') {
            var value = $(element).find('input[type="text"]').val();
            var calType = $(element).data('displayFormat')
            var calFormat = $(element).data('dateformat')
            var dateObject = getDateTimeObject(calType, calFormat, value)
            return dateObject;
        }
        else if (controlType === 'timepicker') {
            return $(element).find('input[type="text"]').val();
        }
        else if (controlType === 'link') {
            return $(element).find('a').attr('href');
        }
        else if (controlType === 'color') {
            return $(element).find('input[type=text]').val();
        }
        else if (controlType === 'numberbox') {
            return $(element).find('input[type=number]').val();
        }
        else if (controlType === 'calendar') {
            return $(element).parent().find('input[type="text"]').val();
        }
        else if (controlType === 'datatag') {
            var tags = '';
            $(element).find('#CustomTagEdit li').each(function (key, value) {
                if (tags === '') {
                    tags = $(value).find('div').text();
                }
                else {
                    tags += ',' + $(value).find('div').text();
                }
                console.log($(value).find('div').text());
            })
            return tags;
        }
        else if (controlType === 'htmlpanel') {
            return $(element).find('.nicEdit-main').html();
        }
        else if (controlType === 'imagepanel') {
            return $(element).attr('data-image-content');
        }
        else if (controlType === 'map') {
            //not implemented
        }
        else if (controlType === 'treeview') {
            //not implemented
        }
        else if (controlType === 'documentlinker') {
            //not implemented
        }
        else if (controlType === 'rssfeed') {
            //not implemented
        }
        else if (controlType === 'chart') {
            //not implemented
        }
        else if (controlType === 'pivot') {
            //not implemented
        }
        else if (controlType === 'slider') {
            return $(element).find('input[type="number"]').val();
        }
        else if (controlType === 'togglebutton') {
            return $(element).find('input[type="checkbox"]').is(":checked");
        }
        else if (controlType === 'help') {
            //not implemented
        }
        else {
            return $("form #" + selector).val(value);
        }
    } else {
        return '';
    }
}

/// <summary>
/// set element By Id
/// </summary>
/// <param name="selector" type="type">selector</param>
/// <param name="value" type="type">value</param>
/// <returns type=""></returns>
fsi.prototype.setById = function (selector, value) {
    if (selector !== '') {
        var element = $('div[data-control-id=' + selector + ']');
        var controlType = element.data('controlType');
        if (controlType === 'label') {
            return $(element).find('label').text(value);
        }
        else if (controlType === 'textbox') {
            return $(element).find(':input').val(value);
        }
        else if (controlType === 'button') {
            return $(element).find('.ui-btn-text').html(value);
        }
        else if (controlType === 'textarea') {
            return $(element).find('textarea').html(value);
        }
        else if (controlType === 'checkbox') {
            $(element).find(':input[type="checkbox"]').attr('checked', (value === null ? false : value));
            if (value === true || value === 'true') {
                $(element).find(':input[type="checkbox"]').siblings('label').removeClass('ui-checkbox-off').addClass('ui-checkbox-on');
                $(element).find(':input[type="checkbox"]').siblings('label').find('.ui-icon').removeClass('ui-icon-checkbox-off').addClass('ui-icon-checkbox-on');
            }
            return;
        }
        else if (controlType === "radio") {
            $(element).find('input[type="radio"]').each(function () {
                if ($(this).val() === value) {
                    $(this).siblings('label').removeClass('ui-radio-off').addClass('ui-radio-on');
                    $(this).attr('checked', 'checked');
                }
                else {
                    $(this).siblings('label').removeClass('ui-radio-on').addClass('ui-radio-off');
                    $(this).removeAttr('checked');
                }
            });

        }
        else if (controlType === 'combo') {
            if ($(element).data('datakey') === 'text') {
                $(element).find('option').each(function () {
                    if ($(this).text() === value) {
                        $(this).attr('selected', 'selected');
                    }
                });
            } else {
                $(element).find('select').val(value);
            }
            var selectedText = $(element).find('option:selected').text();
            return $(element).find('select').siblings('span').find('.ui-btn-text').html('<span>' + selectedText + '</span>');
        }
        else if (controlType === 'currency') {
            var p = $(element).data('decimalplaces');
            var num = value;
            if (num !== '' && num !== undefined) {
                if ($(element).data('base-currency') !== undefined && $(element).data('base-currency') !== '') {
                    if ($(element).data('base-currency').trim() === 'EUR') {
                        var numCheckDot = num.split('.');
                        var numCheckComma = num.split(',');
                        if (numCheckDot.length > 1 && numCheckComma.length > 1) {
                            num = accounting.unformat(num, ',');
                        }
                        num = parseFloat(num).toFixed(p);
                        return $(element).find(':input').val(num.toLocaleString('de-DE'));
                    }
                    else {
                        num = accounting.unformat(num);
                        num = parseFloat(num).toFixed(p);
                        return $(element).find(':input').val(num.toLocaleString());
                    }
                }
                else {
                    if (localCulture === 'de-DE') {
                        var numCheckDot = num.split('.');
                        var numCheckComma = num.split(',');
                        if (numCheckDot.length > 1 && numCheckComma.length > 1) {
                            num = accounting.unformat(num, ',');
                        }
                        num = parseFloat(num).toFixed(p);
                        $(element).find(':input').val(num.toLocaleString('de-DE'));
                    }
                    else {
                        num = accounting.unformat(num);
                        num = parseFloat(num).toFixed(p);
                        $(element).find(':input').val(num.toLocaleString());
                    }
                }
            }
            else {
                return $(element).find('input[type="text"]').val(value);
            }
        }
        else if (controlType === 'datepicker') {
            var calType = $(element).data('displayFormat')
            var calFormat = $(element).data('dateformat')
            var formatedDate = getDateTimeString(calType, calFormat, new Date(value))
            $(element).find(':input[type="text"]').val(formatedDate);
            $(element).find(':input[type="text"]').trigger('change');
        }
        else if (controlType === 'timepicker') {
            $(element).find('input[type="text"]').val(value);
        }
        else if (controlType === 'link') {
            if (value.indexOf('http') === -1) {
                return $(element).find('a').attr("href", 'http://' + value);
            }
            else {
                return $(element).find('a').attr("href", value);
            }
        }
        else if (controlType === 'color') {
            $(element).find(':input').val(value);
            jscolor.init();
            return;
        }
        else if (controlType === 'numberbox') {
            $(element).find(':input').val(value);
            return $(element).find(':input').trigger('change');
        }
        else if (controlType === 'calendar') {
            //not implemented
        }
        else if (controlType === 'datatag') {
            var tags = value.split(',');
            return $(element).find('#CustomTagEdit').tagit({ initialTags: tags });
        }
        else if (controlType === 'htmlpanel') {
            return $(element).find('.nicEdit-main').text(value);
        }
        else if (controlType === 'imagepanel') {
            //not implemented
        }
        else if (controlType === 'map') {
            //not implemented
        }
        else if (controlType === 'treeview') {
            //not implemented
        }
        else if (controlType === 'documentlinker') {
            //not implemented
        }
        else if (controlType === 'rssfeed') {
            //not implemented
        }
        else if (controlType === 'chart') {
            //not implemented
        }
        else if (controlType === 'pivot') {
            //not implemented
        }
        else if (controlType === 'slider') {
            $(element).find('input[type="number"]').val(value);
            var a_tag = $(element).find('a');
            a_tag.attr('aria-valuenow', value);
            a_tag.attr('aria-valuetext', value);
            a_tag.attr('title', value);
            a_tag.css('left', value + "%")
        }
        else if (controlType === 'togglebutton') {
            $(element).find(':input[type="checkbox"]').attr('checked', (value === null ? false : value));
            var isChecked = value === null ? false : value;
            if (isChecked) {
                $(element).find('label').removeClass('ui-checkbox-off').addClass('ui-checkbox-on');
            } else {
                $(element).find('label').removeClass('ui-checkbox-on').addClass('ui-checkbox-off');
            }
            return;
        }
        else if (controlType === 'help') {
            //not implemented
        }
        else {
            return $("form #" + selector).val(value);
        }
    }
}

/// <summary>
/// get element By Name
/// </summary>
/// <param name="selector" type="type">selector</param>
/// <returns type=""></returns>
fsi.prototype.getByName = function (selector) {
    return $('#' + selector).val();
}

/// <summary>
/// get base path
/// </summary>
/// <returns type=""></returns>
fsi.prototype.basePath = function () {
    return "http://" + location.host;
    //return $('#' + id).val();
}

/// <summary>
/// alert
/// </summary>
/// <param name="message" type="type">message</param>
/// <param name="okCallback" type="type">okCallback</param>
/// <param name="options" type="type">options</param>
fsi.prototype.alert = function (message, okCallback, options) {
    alert(message);
    //var data;
    //options = $.extend({
    //    ok: 'OK'
    //}, options || {
    //});
    //data = {
    //    message: message,
    //    buttons: {
    //        ok: options.ok
    //    }
    //};
    //return displayPopup(data, function (popup) {
    //    popup.find('.button-ok').click(okCallback);
    //});
};

/// <summary>
/// confirm
/// </summary>
/// <param name="message" type="type">message</param>
/// <returns type=""></returns>
fsi.prototype.confirm = function (message) {
    var result = confirm(message);
    return result;
};

/// <summary>
/// refresh page
/// </summary>
fsi.prototype.refreshPage = function () {
    var pageHistory = JSON.parse(sessionStorage.getItem("pageHistory"));
    if (pageHistory) {
        var goPage = pageHistory[pageHistory.length - 1]
        pageHistory.splice(pageHistory.length, 1);
        sessionStorage.setItem("pageHistory", JSON.stringify(pageHistory));
        fsi.redirectPage(goPage);
    } else {
        fsi.changePage();
    }
};

/// <summary>
/// hide element by id
/// </summary>
/// <param name="id" type="type">id</param>
fsi.prototype.hide = function (id) {
    var element = $('div[data-control-id=' + id + ']');
    element.hide();
    element.attr('')
    element.attr('data-hidden', 'hidden');
    $('#colorPopupBlock').remove();
    return;
}

/// <summary>
/// show element by id
/// </summary>
/// <param name="id" type="type">id</param>
fsi.prototype.show = function (id) {
    var element = $('div[data-control-id=' + id + ']');
    element.show();
    element.attr('data-hidden', 'visible');
    return;
}
$(document).ready(function () {
    $('*').on('click change', function (e) {
        var element = $(e.target);
        if ($(element).attr('disabled') === 'disabled' || $(element).attr('disabled') === 'true') {
            return false;
        }
    })
});

/// <summary>
/// disable element by id
/// </summary>
/// <param name="id" type="type">id</param>
fsi.prototype.disable = function (id) {
    var element = $('div[data-control-id=' + id + ']');
    var node = element.find('*');
    $.each(node, function (i, v) {
        $(v).prop("disabled", true);
        $(v).attr("disabled", 'disabled');
        $(v).css("pointer-events", "none");
        $(v).css("cursor", "not-allowed");
    });
    //$(element).on("click", makeDisable(element));
    //$(element).on("click", function ()
    //{
    //    console.log('click');
    //});
    element.prop("disabled", true);
    element.attr("disabled", 'disabled');
    element.css("pointer-events", "none");
    element.css("cursor", "not-allowed");
    element.attr("data-disabled", 'true');
}

/// <summary>
/// enable element by id
/// </summary>
/// <param name="id" type="type"></param>
fsi.prototype.enable = function (id) {
    var element = $('div[data-control-id=' + id + ']');
    var node = element.find('*');
    $.each(node, function (i, v) {
        $(v).prop("disabled", false);
        $(v).removeAttr("disabled");
        $(v).css("pointer-events", "auto");
        $(v).css("cursor", "default");
    });
    element.prop("disabled", false);
    element.removeAttr("disabled");
    element.css("pointer-events", "auto");
    element.css("cursor", "default");
    element.removeAttr("data-disabled");
}

/// <summary>
/// disable document browse by id
/// </summary>
/// <param name="id" type="type">id</param>
fsi.prototype.disableDocumentBrowse = function (id) {
    var element = $('div[data-control-id=' + id + ']').find('div[data-role=documentlinker]');
    var node = element.find('*');
    $.each(node, function (i, v) {
        $(v).prop("disabled", true);
        $(v).attr("disabled", 'disabled');
        $(v).css("pointer-events", "none");
        $(v).css("cursor", "not-allowed");
    });
    element.prop("disabled", true);
    element.attr("disabled", 'disabled');
    element.css("pointer-events", "none");
    element.css("cursor", "not-allowed");
    element.attr("data-disabled", 'true');
}
/// <summary>
/// enable document browse by id
/// </summary>
/// <param name="id" type="type">id</param>
fsi.prototype.enableDocumentBrowse = function (id) {
    var element = $('div[data-control-id=' + id + ']').find('div[data-role=documentlinker]');
    var node = element.find('*');
    $.each(node, function (i, v) {
        $(v).prop("disabled", false);
        $(v).removeAttr("disabled");
        $(v).css("pointer-events", "auto");
        $(v).css("cursor", "default");
    });
    element.prop("disabled", false);
    element.removeAttr("disabled");
    element.css("pointer-events", "auto");
    element.css("cursor", "default");
    element.removeAttr("data-disabled");
}

/// <summary>
/// hide document grid by id
/// </summary>
/// <param name="id" type="type">id</param>
fsi.prototype.hideDocumentGrid = function (id) {
    var element = $('div[data-control-id=' + id + ']').find('div[id=tblDocument_' + id + ']');
    element.hide();
    return;
}

/// <summary>
/// show document grid by id
/// </summary>
/// <param name="id" type="type">id</param>
fsi.prototype.showDocumentGrid = function (id) {
    var element = $('div[data-control-id=' + id + ']').find('div[id=tblDocument_' + id + ']');
    element.show();
    return;
}

/// <summary>
/// get tenant live url
/// </summary>
/// <returns type=""></returns>
var getTenantLiveUrl = function () {
    var regex = /\/CustomPage.*/i;
    var result = window.location.href.replace(regex, '');
    return result;
};

/// <summary>
/// save form
/// </summary>
/// <param name="successCallBack" type="type">success call back</param>
/// <param name="errorCallBack" type="type">error call back</param>
fsi.prototype.saveForm = function (successCallBack, errorCallBack) {
    $(document).ajaxStop($.unblockUI);
    $.blockUI({
        message: '<h1><img src="' + loadingImageUrl + 'loader.gif" /> Loading... </h1>'
    });
    var eventFlag = true;
    var eventTarget;
    if (!successCallBack) {
        eventTarget = $(arguments.callee.caller.arguments[0].target);
    }
    else {
        eventTarget = $(event.target);
    }
    if (eventTarget !== undefined && eventTarget[0].tagName === "SPAN") {
        eventTarget = eventTarget.parent().parent().find('button');
    }
    var form = eventTarget.closest('form');
    var controlSection = eventTarget.closest('div [data-control-section]');
    var formMessage = form.find('.form-message');
    if (eventFlag) {
        var regex = /\/webdesigner.*/i;
        var tenantUrl = window.location.href.replace(regex, '');
        var tenant = getTenantLiveUrl();
        eventFlag = false;
        var currentJSON = {
        };
        var fd = new FormData();
        var gotoForm = eventTarget.closest('div[data-control-type=button]').find('button').data('goto-form');
        var responseMessage = eventTarget.data('response-message');
        if (form) {
            currentJSON["type"] = "form";
            if (form.attr('id') !== '' && form.attr('id') !== undefined) {
                currentJSON["id"] = form.attr('id');
            }
            if (form.attr('data-object-table') !== '' && form.attr('data-object-table') !== undefined) {
                currentJSON["tableColumn"] = form.attr('data-object-table');
            }
            currentJSON['value'] = "";
            fd.append('form', JSON.stringify(currentJSON));
        }
        var systemId = $(form).find("#fsiSystemId").val();
        if (systemId) {
            currentJSON["type"] = "SYSTEMID";
            currentJSON["id"] = "SYSTEMID";
            currentJSON["tableColumn"] = "";
            currentJSON['value'] = systemId;
            fd.append('SYSTEMID', JSON.stringify(currentJSON));
        }
        var controls = fsi.GetControls(controlSection);
        //var controls = $(controlSection).find('[data-control-type]');
        //var controls = form.elements;
        $.map(controls, function (ctr, i) {
            currentJSON = {
            };
            type = $(ctr).data('control-type');
            if (type) {
                if (type === 'documentlinker') {
                    $.each(filedictionary, function (key, value) {
                        fd.append(key, value);
                        //currentJSON["fileDocument"] = value;
                        //fd.append('fileDocument', value)
                    });
                    filedictionary = {
                    };
                    dictionary = {
                    };
                }
                currentJSON = getControlValue(ctr);
                if (!$.isEmptyObject(currentJSON)) {
                    fd.append('input-' + i, JSON.stringify(currentJSON));
                }
            }
        });
        var regex = /\/Web.*/i;
        var tenantUrl = window.location.href.replace(regex, '');
        var myurl = tenantUrl + '/DataObject/SaveCustomPageData';
        $.ajax({
            cache: false,
            async: true,
            url: myurl,
            data: fd,
            processData: false,
            contentType: false,
            type: 'POST',
            success: function (data) {
                eventTarget.removeAttr('disabled');
                if (data.isValid === false) {
                    var strErrorKeys = "";
                    var strErrorMsg = "";
                    $.map(data.errorMessage, function (elem, key) {
                        var errMsg = '';
                        strErrorKeys = $('form').find('div[data-object-column=' + key + ']').data('control-id');
                        errMsg = strErrorKeys + '  - ' + elem;
                        strErrorMsg = strErrorMsg + errMsg + '<br/>';

                    });
                    formMessage.html(strErrorMsg);
                }
                else {
                    if (data.status === 'success') {
                        $(form).find("#fsiSystemId").val(data.systemId);
                        fsi.setSystemParameters(form);
                        if (gotoForm) {
                            if (gotoForm === 1) {
                                fsi.clearForm(form);
                            }
                            else if (gotoForm === -1) {
                                fsi.goBack();
                            }
                            else {
                                fsi.redirectPage(gotoForm);
                            }
                        }
                        if (responseMessage) {
                            formMessage.text(responseMessage).addClass('form-success');
                            fsi.clearSuccessAndErrorMessage(formMessage);
                        }
                        if (successCallBack) {
                            successCallBack(data.systemId);
                        }
                    }
                    else if (data.status === 'error') {
                        formMessage.html(data.errorMessage).addClass('form-error');
                        fsi.clearSuccessAndErrorMessage(formMessage);
                        if (errorCallBack) {
                            errorCallBack(data);
                        }
                    }
                }

            },
            complete: function (data) {
                filedictionary = {
                };
                $.unblockUI();
            },
            error: function (error) {
                errorCallBack(error);
                formMessage.html(error.statusText).addClass('form-error');
                fsi.clearSuccessAndErrorMessage(formMessage);
            }
        });

    }
}

/// <summary>
/// saveForm
/// </summary>
/// <param name="evt" type="type">event</param>
/// <param name="successCallBack" type="type">successCallBack</param>
/// <param name="errorCallBack" type="type">errorCallBack</param>
fsi.prototype.saveForm = function (evt, successCallBack, errorCallBack) {
    $(document).ajaxStop($.unblockUI);
    $.blockUI({
        message: '<h1><img src="' + loadingImageUrl + 'loader.gif" /> Loading... </h1>'
    });
    var eventFlag = true;
    var eventTarget;
    if (evt === undefined || evt === null || evt === '') {
        if (!successCallBack) {
            eventTarget = $(arguments.callee.caller.arguments[0].target);
        }
        else {
            eventTarget = $(event.target);
        }
    }
    else {
        eventTarget = $(evt.arguments[0].target);
    }
    if (eventTarget !== undefined && eventTarget[0].tagName === "SPAN") {
        eventTarget = eventTarget.parent().parent().find('button');
    }
    var form = eventTarget.closest('form');
    var controlSection = eventTarget.closest('div [data-control-section]');
    var formMessage = form.find('.form-message');
    if (eventFlag) {
        var regex = /\/webdesigner.*/i;
        var tenantUrl = window.location.href.replace(regex, '');
        var tenant = getTenantLiveUrl();
        eventFlag = false;
        var currentJSON = {
        };
        var fd = new FormData();
        var gotoForm = eventTarget.closest('div[data-control-type=button]').find('button').data('goto-form');
        var responseMessage = eventTarget.data('response-message');
        if (form) {
            currentJSON["type"] = "form";
            if (form.attr('id') !== '' && form.attr('id') !== undefined) {
                currentJSON["id"] = form.attr('id');
            }
            if (form.attr('data-object-table') !== '' && form.attr('data-object-table') !== undefined) {
                currentJSON["tableColumn"] = form.attr('data-object-table');
            }
            currentJSON['value'] = "";
            fd.append('form', JSON.stringify(currentJSON));
        }
        var systemId = $(form).find("#fsiSystemId").val();
        if (systemId) {
            currentJSON["type"] = "SYSTEMID";
            currentJSON["id"] = "SYSTEMID";
            currentJSON["tableColumn"] = "";
            currentJSON['value'] = systemId;
            fd.append('SYSTEMID', JSON.stringify(currentJSON));
        }
        var controls = fsi.GetControls(controlSection);
        //var controls = $(controlSection).find('[data-control-type]');
        //var controls = form.elements;
        $.map(controls, function (ctr, i) {
            currentJSON = {
            };
            type = $(ctr).data('control-type');
            if (type) {
                if (type === 'documentlinker') {
                    $.each(filedictionary, function (key, value) {
                        fd.append(key, value);
                        //currentJSON["fileDocument"] = value;
                        //fd.append('fileDocument', value)
                    });
                    filedictionary = {
                    };
                    dictionary = {
                    };
                }
                currentJSON = getControlValue(ctr);
                if (!$.isEmptyObject(currentJSON)) {
                    fd.append('input-' + i, JSON.stringify(currentJSON));
                }
            }
        });
        var regex = /\/Web.*/i;
        var tenantUrl = window.location.href.replace(regex, '');
        var myurl = tenantUrl + '/DataObject/SaveCustomPageData';
        $.ajax({
            cache: false,
            async: true,
            url: myurl,
            data: fd,
            processData: false,
            contentType: false,
            type: 'POST',
            success: function (data) {
                eventTarget.removeAttr('disabled');
                if (data.isValid === false) {
                    var strErrorKeys = "";
                    var strErrorMsg = "";
                    $.map(data.errorMessage, function (elem, key) {
                        var errMsg = '';
                        strErrorKeys = $('form').find('div[data-object-column=' + key + ']').data('control-id');
                        errMsg = strErrorKeys + '  - ' + elem;
                        strErrorMsg = strErrorMsg + errMsg + '<br/>';

                    });
                    formMessage.html(strErrorMsg);
                }
                else {
                    if (data.status === 'success') {
                        $(form).find("#fsiSystemId").val(data.systemId);
                        fsi.setSystemParameters(form);
                        if (gotoForm) {
                            if (gotoForm === 1) {
                                fsi.clearForm(form);
                            }
                            else if (gotoForm === -1) {
                                fsi.goBack();
                            }
                            else {
                                fsi.redirectPage(gotoForm);
                            }
                        }
                        if (responseMessage) {
                            formMessage.text(responseMessage).addClass('form-success');
                            fsi.clearSuccessAndErrorMessage(formMessage);
                        }
                        if (successCallBack) {
                            successCallBack(data.systemId);
                        }
                    }
                    else if (data.status === 'error') {
                        formMessage.html(data.errorMessage).addClass('form-error');
                        fsi.clearSuccessAndErrorMessage(formMessage);
                        if (errorCallBack) {
                            errorCallBack(data);
                        }
                    }
                }

            },
            complete: function (data) {
                filedictionary = {
                };
                $.unblockUI();
            },
            error: function (error) {
                errorCallBack(error);
                formMessage.html(error.statusText).addClass('form-error');
                fsi.clearSuccessAndErrorMessage(formMessage);
            }
        });

    }
}

/// <summary>
/// get data key
/// </summary>
/// <returns type=""></returns>
fsi.prototype.getDataKey = function () {
    return $('form').find("#fsiSystemId").val();
}

/// <summary>
/// set data key
/// </summary>
/// <returns type=""></returns>
fsi.prototype.setDataKey = function (value) {
    return $('form').find("#fsiSystemId").val(value);
}

/// <summary>
/// get controls
/// </summary>
/// <param name="element" type="type">element</param>
/// <param name="outElementArr" type="type">out element array</param>
/// <returns type=""></returns>
fsi.prototype.GetControls = function (element, outElementArr) {
    var elementArr = element.children();
    outElementArr === undefined ? outElementArr = [] : outElementArr;
    if (elementArr !== undefined && elementArr.length > 0) {
        $.each(elementArr, function (i) {
            if ($(elementArr[i]).attr('data-control-section')) {
                return;
            }
            else if ($(elementArr[i]).attr('data-control-type')) {
                outElementArr.push($(elementArr[i]));
                GetControls($(elementArr[i]), outElementArr);
            }
            else {
                GetControls($(elementArr[i]), outElementArr);
            }
        })
    }
    return outElementArr;
}

/// <summary>
/// clear success and error mgessage
/// </summary>
/// <param name="objectId" type="type">objectId</param>
fsi.prototype.clearSuccessAndErrorMessage = function (objectId) {
    var timeOut = 1000;
    if (!objectId) {
        objectId = $('form').find('.form-message');
        timeOut = 0;
    }
    setTimeout(function () {
        $(objectId).html('');
        $(objectId).removeClass('form-error');
        $(objectId).removeClass('form-error');
    }, timeOut);
}
fsi.prototype.clearForm = function (form) {
    $(form).find("#fsiSystemId").val('');
    fsi.removeParameter('SYSTEMID');
    var controls = $(form).find('[data-control-type]');
    $.map(controls, function (ctr, i) {
        type = $(ctr).data('control-type');
        $(ctr).find(':input[type=text]').val('')
        if (type === 'combo') {
            $(ctr).find('select').prop('selectedIndex', 0);
            var cmboStartValue = $(ctr).find('select option').eq(0).text();
            $(ctr).find('select').siblings('span').find('.ui-btn-text').html('<span>' + cmboStartValue + '</span>');
        }
        else if (type === 'numberbox') {
            $(ctr).find('input[type=number]').val('');
        }
        else if (type === 'color') {
            $(ctr).find('input[type=color]').val('');
        }
        else if (type === 'textarea') {
            $(ctr).find('textarea').val('');
        }
        else if (type === 'radio') {
            $(ctr).find('input[type=radio]').each(function () {
                $(this).prop('checked', false);
                $(this).siblings('label').removeClass('ui-radio-on').addClass('ui-radio-off');
                $(this).siblings('label').find('.ui-icon-shadow').removeClass('ui-icon-radio-on').addClass('ui-icon-radio-off');
            });
        }
        else if (type === 'checkbox') {
            $(ctr).find('input[type=checkbox]').each(function () {
                $(this).prop('checked', false);
                $(this).siblings('label').removeClass('ui-checkbox-on').addClass('ui-checkbox-off');
                $(this).siblings('label').find('.ui-icon-shadow').removeClass('ui-icon-checkbox-on').addClass('ui-icon-checkbox-off');
            });
        }
        else if (type === 'datalist') {
            fsi.renderDataList($(ctr), true);
        }
    });

}
getControlValue = function (element) {
    var currentAttr = {
    };
    var type, column;
    type = $(element).data('control-type');
    column = $(element).data("object-column");
    if (column !== undefined && column !== null && column !== '' && column.toLowerCase() === 'systemid') {
        return;
    }
    if (type !== 'container' && type !== 'button') {
        currentAttr['type'] = $(element).data('control-type');
        currentAttr['id'] = $(element).data('control-id');
        if (type === 'label') {
            currentAttr['value'] = '' + $(element).find('label').text();
        }
        if (type !== 'documentlinker') {
            currentAttr['tableColumn'] = '' + $(element).data("object-column");
        }
        if (type === 'textbox') {
            currentAttr['value'] = '' + $(element).find('input[type=text],input[type=password],input[type=email]').val()
        }
        if (type === 'color') {
            currentAttr['value'] = '' + $(element).find('input[type=text]').val();
        }
        if (type === 'numberbox') {
            currentAttr['value'] = '' + $(element).find('input[type=number]').val();
        }
        else if (type === 'textarea') {
            currentAttr['value'] = '' + $(element).find('textarea').val()
        }
        else if (type === 'combo') {
            currentAttr['value'] = '' + $(element).find('select').val();
        }
        else if (type === 'datepicker') {
            var type = $(element).data('display-format');
            var dateFormat = $(element).data('dateformat');
            //currentAttr['value'] = '' + $(element).find('input[type="text"]').val();
            currentAttr['value'] = '' + getDateTimestamp($(element).find('input[type="text"]').val(), type, dateFormat);
            if ($(element).data('timezone') !== undefined && $(element).data('timezone') === 'on') {
                currentAttr['timeZone'] = '' + $(element).find('select').val();
            }
        }
        else if (type === 'timepicker') {
            currentAttr['value'] = '' + $(element).find('input[type="text"]').val();
        }
        else if (type === 'calendar') {
            var type = $(element).data('display-format');
            var dateFormat = 'yyyy-mm-dd';
            //currentAttr['value'] = '' + $(element).parent().find('input[type="text"]').val();
            currentAttr['value'] = '' + getDateTimestampForCalendar($(element).parent().find('input[type="text"]').val(), type, dateFormat);//$(element).find('input[type="text"]').val();
            if ($(element).data('timezone') !== undefined && $(element).data('timezone') === 'on') {
                if ($(element).siblings().find('.timezone select').val() !== null && $(element).siblings().find('.timezone select').val() !== undefined) {
                    currentAttr['timeZone'] = '' + $(element).siblings().find('.timezone select').val();
                }
            }
        }
        else if (type === "checkbox") {

            currentAttr['value'] = '' + $(element).find('input[type="checkbox"]').is(":checked");
        }
        else if (type === "datatag") {
            var tags = '';
            $(element).find('#CustomTagEdit li').each(function (key, value) {
                if (tags === '') {
                    tags = $(value).find('div').text();
                }
                else {
                    tags += ',' + $(value).find('div').text();
                }
                console.log($(value).find('div').text());
            })
            currentAttr['value'] = '' + tags;
        }
        else if (type === "htmlpanel") {
            currentAttr['value'] = '' + $(element).find('.nicEdit-main').html();
        }
        else if (type === "imagepanel") {
            currentAttr['value'] = '' + $(element).attr('data-image-content');
            currentAttr['imageName'] = '' + $(element).attr('data-image-name');
        }
        else if (type === 'slider') {
            currentAttr['value'] = '' + $(element).find('input[type="number"]').val();
        }
        else if (type === 'documentlinker') {
            currentAttr['value'] = '' + "";
        }
        else if (type === 'currency') {
            var p = $(element).data('decimalplaces');
            var num = '';
            if ($(element).data('base-currency') !== undefined && $(element).data('base-currency') !== '') {
                if ($(element).data('base-currency') === 'EUR') {
                    if ($(element).find('input[type="text"]').val() !== '') {
                        num = $(element).find('input[type="text"]').val();
                        var numCheckDot = num.split('.');
                        var numCheckComma = num.split(',');
                        if (numCheckDot.length > 1 && numCheckComma.length > 1) {
                            num = accounting.unformat(num, ',');
                        }
                        else if (numCheckDot.length > 1 && numCheckComma.length <= 1) {
                            num = accounting.unformat(num, ',');
                        }
                        num = parseFloat(num).toFixed(p);
                    }
                }
                else {
                    if ($(element).find('input[type="text"]').val() !== '') {
                        num = $(element).find('input[type="text"]').val();
                        num = accounting.unformat(num);
                        num = parseFloat(num).toFixed(p);
                    }
                }
            }
            else {
                if (localCulture === 'de-DE') {
                    num = $(element).find('input[type="text"]').val();
                    var numCheckDot = num.split('.');
                    var numCheckComma = num.split(',');
                    if (numCheckDot.length > 1 && numCheckComma.length > 1) {
                        num = accounting.unformat(num, ',');
                    }
                    else if (numCheckDot.length > 1 && numCheckComma.length <= 1) {
                        num = accounting.unformat(num, ',');
                    }
                    num = parseFloat(num).toFixed(p);
                }
                else {
                    num = $(element).find('input[type="text"]').val();
                    num = accounting.unformat(num);
                    num = parseFloat(num).toFixed(p);
                }
            }
            currentAttr['value'] = '' + num;
            if ($(element).data('base-currency') !== undefined) {
                currentAttr['basecurrency'] = '' + $(element).data('base-currency');
            }
            if ($(element).data('conversion-currency') !== undefined) {
                currentAttr['conversioncurrency'] = '' + $(element).data('conversion-currency');
            }
        }
        else if (type === "radio") {
            $(element).find('input[type="radio"]').each(function () {
                if ($(this).is(':checked')) {
                    currentAttr['value'] = $(this).val();
                }
            });
        }
        else if (type === "togglebutton") {
            currentAttr['value'] = '' + $(element).find('input[type="checkbox"]').is(":checked");
        }
    }
    return currentAttr;
};
fsi.prototype.deleteFormData = function (successCallBack, errorCallBack) {
    var eventFlag = true;
    var eventTarget;
    if (!successCallBack) {
        eventTarget = $(arguments.callee.caller.arguments[0].target);
    } else {
        eventTarget = $(event.target);
    }
    var form = eventTarget.closest('form');
    var controlSection = eventTarget.closest('div [data-control-section]');
    var formMessage = form.find('.form-message');
    if (eventFlag) {
        var regex = /\/webdesigner.*/i;
        var tenantUrl = window.location.href.replace(regex, '');
        var tenant = getTenantLiveUrl();
        var responseMessage = eventTarget.data('response-message');
        var gotoForm = eventTarget.closest('div[data-control-type=button]').find('button').data('goto-form');

        eventFlag = false;
        var currentJSON = {
        };
        var fd = new FormData();

        if (form) {
            currentJSON["type"] = "form";

            if (form.attr('id') !== '' && form.attr('id') !== undefined) {
                currentJSON["id"] = form.attr('id');
            }
            if (form.attr('data-object-table') !== '' && form.attr('data-object-table') !== undefined) {
                currentJSON["tableColumn"] = form.attr('data-object-table');
            }
            currentJSON['value'] = "";
            fd.append('form', JSON.stringify(currentJSON));
        }
        var systemId = $(form).find("#fsiSystemId").val();
        if (systemId) {
            currentJSON["type"] = "SYSTEMID";
            currentJSON["id"] = "SYSTEMID";
            currentJSON["tableColumn"] = "";
            currentJSON['value'] = systemId;
            fd.append('SYSTEMID', JSON.stringify(currentJSON));
        }
        var regex = /\/Web.*/i;
        var tenantUrl = window.location.href.replace(regex, '');
        var myurl = tenantUrl + '/DataObject/DeleteCustomPageData';

        $.ajax({
            cache: false,
            url: myurl,
            data: fd,
            processData: false,
            contentType: false,
            type: 'POST',
            success: function (data) {
                if (data.status === 'success') {
                    fsi.setSystemParameters(data.systemId);
                    if (gotoForm) {
                        if (gotoForm === 1) {
                            fsi.clearForm(form);
                        }
                        else if (gotoForm === -1) {
                            fsi.goBack();
                        }
                        else {
                            fsi.redirectPage(gotoForm);
                        }
                    }
                    if (responseMessage) {
                        formMessage.text(responseMessage).addClass('form-success');
                        fsi.clearSuccessAndErrorMessage(formMessage);
                    }
                    if (!successCallBack && successCallBack !== undefined) {
                        successCallBack(data.systemId);
                    }
                }
                else if (data.status === 'error') {
                    formMessage.html("Server Error").addClass('form-error');
                    //formMessage.html(data.errorMessage).addClass('form-error');
                    fsi.clearSuccessAndErrorMessage(formMessage);
                    if (errorCallBack) {
                        errorCallBack(data);
                    }
                }

            },
            error: function (error) {
                formMessage.text(responseMessage).addClass('form-error');
                fsi.clearSuccessAndErrorMessage(error.statusText);
                if (!errorCallBack) {
                    errorCallBack(error);
                }
            }
        });
    }
}
fsi.prototype.checkDocumentFile = function (controlId) {
    var isExist = false;
    var element = $('div[data-control-id=' + controlId + ']');
    var totalFiles = element.find('#hdnTotalFiles').val();
    // var uploadedDOc = $("#tblDocument_" + controlId + " > table> tbody > tr").length - 1;
    var systemId = element.parents().find('form').find('#fsiSystemId').val();
    if (systemId !== 0) {
        fsi.CheckDataObjectForDocumentLinker(systemId, 0, '', function (data) {
            if ((totalFiles !== undefined && parseInt(totalFiles) > 0) || (parseInt(data.length) > 0)) {
                isExist = true;
            }
            else {
                isExist = false;
            }
        });
    }
    else {
        if ((totalFiles !== undefined && parseInt(totalFiles) > 0)) {
            isExist = true;
        }
    }
    return isExist;

}

fsi.prototype.CheckDataObjectForDocumentLinker = function (systemId, formId, controlId, success, error) {
    var myurl = getTenantUrl() + '/DataObject/SelectDataObjectForDocumentLinker';
    var postData;
    postData = {
        systemId: systemId, formId: formId, documentId: controlId
    };
    $.ajax({
        cache: false,
        url: myurl,
        data: postData,
        async: true,
        beforeSend: function () {

        },
        success: success,
        complete: function () {

        },
        error: error,
    });
}

fsi.prototype.clearDocumentFile = function (controlId) {
    var element = $('div[data-control-id=' + controlId + ']');
    $('#files' + "_" + controlId).html('');
    $('#hdnTotalFiles').val(0);
    filedictionary = {
    };
    dictionary = {
    };
}

fsi.prototype.webservice = function (service, method, inputParameter, outputParameter) {
    var tenantUrl = getTenantUrl();
    var myurl = tenantUrl + '/Web/ExecuteWebService';
    var inputParams = {
    };
    if (inputParameter !== "") {
        var inputArray = inputParameter.split(',');
        console.log(inputArray);
        $.each(inputArray, function (i) {
            var params = inputArray[i].split('/');
            var inputValue = getInputValue(params[1], params[2]);
            if (inputValue === '') {
                inputValue = params[3];
            }
            inputParams[params[0]] = inputValue;
        });
    }
    else {
        inputParams["NULL"] = 'null';
    }
    console.log(inputParams);
    var postData = {
        service: service, method: method, list: inputParams
    };
    $(document).ajaxStop($.unblockUI);
    $.blockUI({
        message: '<h1><img src="' + loadingImageUrl + 'loader.gif" /> Loading... </h1>'
    });
    $.ajax({
        cache: false,
        url: myurl,
        data: postData,
        type: 'POST',
        beforeSend: function () {
        },
        success: function (data) {
            console.log(data);
            var webOutputControl = outputParameter.split('/')[0];
            var webOutputControlType = outputParameter.split('/')[1];
            if (webOutputControlType === 'button') {
                $("#" + webOutputControl).text(data)
            }
            else if (webOutputControlType === 'textbox') {
                $("#" + webOutputControl).val(data)
            }
            else if (webOutputControlType === 'checkbox') {
                $("#" + webOutputControl).val(data)
            }
            else if (webOutputControlType === 'text') {
                $("#" + webOutputControl).text(data)
            }
            else if (webOutputControlType === 'textarea') {
                $("#" + webOutputControl).val(data)
            }
            else if (webOutputControlType === 'label') {
                $("#" + webOutputControl).text(data)
            }
            else if (webOutputControlType === 'datalist') {
                var newData = ArrayFromData(JSON.parse(data));
                var columns = Object.keys(newData[0]);
                var tableTag = $('#' + webOutputControl).find('.dynamic-datalist');
                tableTag.empty();
                var str = '';
                str += '<div class="bootstrap-table">';
                str += '<div class="fixed-table-toolbar"></div>   ';
                str += '<div class="fixed-table-container" style="height: 299px; padding-bottom: 37px;">';
                //str += '<div class="fixed-table-header" style="height: 37px; border-bottom-width: 1px; border-bottom-style: solid; border-bottom-color: rgb(221, 221, 221); margin-right: 0px;">';
                //str += '<table class="table table-hover" style="width: 796px;">';
                ////head
                //str += ' <thead> <tr> ';
                //for (var i = 0; i < splitColumnName.length; i++)
                //{
                //    str += ' <th style=""><div class="th-inner ">' + splitColumnName[i] + '</div>   ';
                //    str += ' <div class="fht-cell" style="width: 213px;"></div>            ';
                //    str += ' </th>';
                //}
                //str += ' </tr></thead></table></div>  ';
                //head
                str += '<div class="fixed-table-body">';
                str += '<table width="100%" data-toggle="table" data-url="data1.json" data-cache="false" data-height="299" class="table table-hover tblDataList">';
                str += '<thead><tr> ';
                for (var i = 0; i < columns.length; i++) {
                    str += ' <th> <div class="th-inner ">' + columns[i] + '</div>';
                    str += ' <div class="fht-cell"></div>';
                    str += ' </th>';
                }
                str += '</tr></thead>';

                str += '<tbody>';
                for (var i = 0; i < newData.length; i++) {
                    str += '<tr style="cursor:pointer;" data-index="0" data-url="">';
                    str += ' <td style="display:none">' + newData[i]['SystemID'] + '</td>';
                    for (var j = 0; j < columns.length; j++) {
                        str += ' <td style="">' + newData[i][columns[j].trim()] + '</td>';
                    }
                    str += '</tr>';
                }
                str += '</tbody></table></div>';
                str += '<div class="fixed-table-pagination"></div>';
                str += '</div></div>';
                tableTag.append(str);

            }
            else if (webOutputControlType === 'grid') {

                BindGridByWebService(data, webOutputControl);
            }
            else if (webOutputControlType === "pivot") {
                var data = JSON.parse(data);
                //pivot control
                $('.pivot-table').each(function () {
                    $('#' + this.id).pivotUI(data,
                               {
                                   rows: '',
                                   cols: ''
                               });

                });
            }
        },
        complete: function (data) {
            $.unblockUI();
        },
        error: function (error) {
            $.unblockUI();
            $("#formMessage").html('Error :' + error.errorText);
        }
    });
}
function getInputValue(controlId, controlType) {
    if (controlType === 'pageParameters') {
        return $.map((JSON.parse(localStorage.pageParameters)), function (a, b, c) {
            if (a['key'] === controlId) {
                return a['value'];
            }
        })[0];
    }
    else {
        if (controlId !== undefined && controlId !== "undefined") {
            var value = fsi.getById(controlId);
            return value
        }
        else {
            return '';
        }
    }

}
fsi.prototype.workflow = function (workflowName, parameter, outputControl, outputVariable, successCallback, errorCallBack) {
    var outputPara = outputControl;
    var outputControlType = {
    };
    var outputControlObject = {
    };
    var outputVariableObject = {
    };
    var outVar = {
    };
    for (var key in outputControl) {
        var control = $("[data-control-id=" + key + "]").data('controlType');
        if (control) {
            outputControlType[key] = $("[data-control-id=" + key + "]").data('controlType');
            outputControlObject[outputControl[key]] = key;
        }
        else {
            outputVariableObject[outputControl[key]] = key;
            outVar[key] = '';
        }
    }
    //var outputControlType = $('*[data-control-id="' + outputControl + '"]').data('controlType');
    parameter = Object.keys(parameter).length > 0 ? parameter : {
        'NULL': 'NULL'
    };
    var data = {
        workflowName: workflowName, list: parameter
    };
    $(document).ajaxStop($.unblockUI);
    $.blockUI({
        message: '<h1><img src="' + loadingImageUrl + 'loader.gif" /> Loading... </h1>'
    });
    var tenantUrl = getTenantUrl();
    var myurl = tenantUrl + '/Web/ExecuteWorkflowWithJavascript';
    $.ajax({
        cache: false,
        async: true,
        url: myurl,
        data: data,
        type: 'POST',
        beforeSend: function () {
        },
        complete: function () {
            $.unblockUI();
            //if (isPageLoad)
            //{
            //    renderPage($('form'));
            //    multidirection();
            //    isPageLoad = false;

            //}
        },
        success: function (data) {
            try {
                var result;
                if ($.type(data) === 'string') {
                    result = JSON.parse(data);
                }
                else {
                    result = data;
                    var errorkey = Object.keys(data);
                    if (errorkey.indexOf("executionError") > -1) {
                        alert('Workflow: ' + data[errorkey[errorkey.indexOf("executionError")]]);
                        errorCallBack(data[errorkey[errorkey.indexOf("executionError")]]);
                        return false;
                    }
                }
                if (Object.keys(result).length > 1) {
                    for (var dataKey in result) {
                        if (outputControlObject.hasOwnProperty(dataKey)) {
                            for (var key in outputControlType) {
                                if (outputControlType[key] === 'button' && dataKey.toLowerCase().trim() === outputPara[key].toLowerCase().trim()) {
                                    $("[type=button]", "[data-control-id=" + key + "]").text(arrayToString(result[dataKey]));
                                }
                                else if (outputControlType[key] === 'textbox' && dataKey.toLowerCase().trim() === outputPara[key].toLowerCase().trim()) {
                                    $("[type=text]", "[data-control-id=" + key + "]").val(arrayToString(result[dataKey]));
                                }
                                else if (outputControlType[key] === 'checkbox' && dataKey.toLowerCase().trim() === outputPara[key].toLowerCase().trim()) {
                                    $("[type=checkbox]", "[data-control-id=" + key + "]").val(JSON.stringify(result[dataKey]));
                                }
                                else if (outputControlType[key] === 'text' && dataKey.toLowerCase().trim() === outputPara[key].toLowerCase().trim()) {
                                    $("[type=text]", "[data-control-id=" + key + "]").text(arrayToString(result[dataKey]));
                                }
                                else if (outputControlType[key] === 'numberbox' && dataKey.toLowerCase().trim() === outputPara[key].toLowerCase().trim()) {
                                    var ctrlValue = arrayToString(result[dataKey]);
                                    fsi.setById(key, ctrlValue);
                                }
                                else if (outputControlType[key] === 'slider' && dataKey.toLowerCase().trim() === outputPara[key].toLowerCase().trim()) {
                                    $("[type=number]", "[data-control-id=" + key + "]").val(arrayToString(result[dataKey]));
                                }
                                else if (outputControlType[key] === 'textarea' && dataKey.toLowerCase().trim() === outputPara[key].toLowerCase().trim()) {
                                    $("textarea", "[data-control-id=" + key + "]").val(arrayToString(result[dataKey]));
                                }
                                else if (outputControlType[key] === 'combo' && dataKey.toLowerCase().trim() === outputPara[key].toLowerCase().trim()) {
                                    var comboData = {
                                    };
                                    if ($.type(result[dataKey]) === 'string') {
                                        var tempComboData = JSON.parse(result[dataKey]);
                                        var objectKeysk = Object.keys(tempComboData);
                                        if (objectKeysk.length > 0) {
                                            comboData = tempComboData[objectKeysk[0]];
                                        }
                                    }
                                    else {
                                        comboData = result[dataKey];
                                    }
                                    var html = '';
                                    var fieldString = '';
                                    if (comboData.length > 0) {
                                        $.each(comboData[0], function (colName, b) {
                                            if (fieldString === '') {
                                                fieldString = colName;
                                            }
                                            else {
                                                fieldString += ',' + colName;
                                            }
                                        });
                                        var fields = fieldString.split(',');
                                        $.each(comboData, function (a, b) {
                                            if (fields.length > 0) {
                                                if (fields.length > 1) {
                                                    $("select", "[data-control-id=" + key + "]").append('<option value="' + b[fields[0]] + '">' + b[fields[1]] + '</option>');
                                                }
                                                else {
                                                    $("select", "[data-control-id=" + key + "]").append('<option value="' + b[fields[0]] + '">' + b[fields[0]] + '</option>');
                                                }
                                            }
                                        });
                                        $(".ui-btn-text", "[data-control-id=" + key + "]").html($("select option:selected", "[data-control-id=" + key + "]").text());
                                    }
                                }
                                else if (outputControlType[key] === 'label' && dataKey.toLowerCase().trim() === outputPara[key].toLowerCase().trim()) {
                                    $("label", "[data-control-id=" + key + "]").text('');
                                    $("label", "[data-control-id=" + key + "]").text(arrayToString(result[dataKey]));
                                }
                                else if (outputControlType[key] === 'datalist' && dataKey.toLowerCase().trim() === outputPara[key].toLowerCase().trim()) {
                                    var datalistData = {
                                    };
                                    if ($.type(result[dataKey]) === 'string') {
                                        var tempDatalistData = JSON.parse(result[dataKey]);
                                        var objectKeysl = Object.keys(tempDatalistData);
                                        if (objectKeysl.length > 0) {
                                            datalistData = tempDatalistData[objectKeysl[0]];
                                        }
                                    }
                                    else {
                                        datalistData = result[dataKey];
                                    }
                                    $("[data-control-id=" + key + "]").attr('isBindWorkflow', 'true');
                                    if (datalistData.length > 0) {
                                        var table = '<div class="row fixed-table" style="height: 299px; padding-bottom: 37px; position:relative;top:-37px;margin-left:0px;"><div id="content-' + key + '" class="table-content"><table data-toggle="table" data-url="data1.json" data-cache="false" data-height="299" class="table table-striped table-fixed-header table-hover tblDataList" style="margin:0px;">';
                                        if ($("[data-control-id=" + key + "]").data('headervisible').toLowerCase() === 'on') {
                                            table += '<thead class="header"><tr>';
                                        }
                                        else {
                                            table += '<thead class="header" style="display:none;"><tr>';
                                        }
                                        var thCount = 0;
                                        $.each(datalistData[0], function (colName, b) {
                                            if ($("[data-control-id=" + key + "]").data('hidefirstcolumn') === 'yes' && thCount === 0) {
                                                table += ('<th style="display:none;"> ' + colName + '</th>');
                                            }
                                            else {
                                                table += ('<th> ' + colName + '</th>');
                                            }
                                            thCount++;
                                        });
                                        table += '</tr></thead>';

                                        table += '<tbody>';
                                        $.each(datalistData, function (a, row) {
                                            table += '<tr>';
                                            var tdCount = 0;
                                            $.each(row, function (p, rowData) {
                                                if ($("[data-control-id=" + key + "]").data('hidefirstcolumn') === 'yes' && tdCount === 0) {
                                                    if (rowData !== '' && rowData !== null) {
                                                        table += ('<td style="display:none;">' + rowData + '</td>');
                                                    }
                                                    else {
                                                        table += ('<td style="display:none;">&nbsp;</td>');
                                                    }
                                                }
                                                else {
                                                    if (rowData !== '' && rowData !== null) {
                                                        table += ('<td>' + rowData + '</td>');
                                                    }
                                                    else {
                                                        table += ('<td>&nbsp;</td>');
                                                    }
                                                }
                                                tdCount++;
                                            });
                                            table += '</tr>';
                                        });
                                        table += '</tbody></table></div><div class="fixed-table-pagination"></div></div>';
                                        $('#tbl_' + $("[data-control-id=" + key + "]").data('control-id')).html(table);
                                        $('#tbl_' + $("[data-control-id=" + key + "]").data('control-id')).parent().siblings('li').find('.ui-li-count').html(datalistData.length);
                                        setTimeout(function () {
                                            // $('.table-fixed-header').fixedHeader();
                                        }, 100);
                                        if ($("[data-control-id=" + key + "]").attr('data-redirect-url') !== "select" && $("[data-control-id=" + key + "]").attr('data-redirect-url') !== undefined) {
                                            fsi.dataListRowClickEvent($("[data-control-id=" + key + "]"), $("[data-control-id=" + key + "]").attr('data-redirect-url'), $("[data-control-id=" + key + "]").attr('data-url'));
                                        }
                                    }
                                    else {
                                        var table = '<div class="bootstrap-table"><div class="fixed-table-toolbar"></div>  <div class="fixed-table-container" style="height: 299px; padding-bottom: 37px;"><div class="fixed-table-body"><table data-toggle="table" data-url="data1.json" data-cache="false" data-height="299" class="table table-hover" style="margin-top:0px;"><tr><td>No records found!</td></tr></table></div><div class="fixed-table-pagination"></div></div></div>';
                                        $('#tbl_' + $("[data-control-id=" + key + "]").data('control-id')).html(table);
                                    }
                                }
                                else if (outputControlType[key] === 'grid' && dataKey.toLowerCase().trim() === outputPara[key].toLowerCase().trim()) {
                                    try {
                                        var gridData = {
                                        };
                                        if ($.type(result[dataKey]) === 'string') {
                                            var tempgridData = JSON.parse(result[dataKey]);
                                            var objectKeysm = Object.keys(tempgridData);
                                            if (objectKeysm.length > 0) {
                                                gridData = tempgridData[objectKeysm[0]];
                                            }
                                        }
                                        else {
                                            gridData = result[dataKey];
                                        }
                                    }
                                    catch (e) {
                                        $.unblockUI();
                                        alert(gridData + "=> Incorrect data format");
                                        return;
                                    }

                                    var dynamicColumns = [];
                                    var i = 0;
                                    var colList = '';
                                    $.each(gridData[0], function (key, value) {
                                        var obj = {
                                            sTitle: key
                                        };
                                        dynamicColumns[i] = obj;
                                        colList += key + ",";
                                        i++;
                                    });
                                    //fetch all records from JSON result and make row data set.
                                    var rowDataSet = [];
                                    var i = 0;
                                    $.each(gridData, function (key, value) {
                                        var rowData = [];
                                        var j = 0;
                                        $.each(gridData[i], function (key, value) {
                                            rowData[j] = value;
                                            j++;
                                        });
                                        rowDataSet[i] = rowData;
                                        i++;
                                    });

                                    var tableObj = $('table', $("[data-control-id=" + key + "]"));
                                    setTimeout(function () {
                                        BindGridWithWorkflow(tableObj[0], rowDataSet, dynamicColumns);
                                    }, 100);
                                }
                                else if (outputControlType[key] === "pivot" && dataKey.toLowerCase().trim() === outputPara[key].toLowerCase().trim()) {
                                    var pivotData = {
                                    };
                                    if ($.type(result[dataKey]) === 'string') {
                                        var tempPivotData = JSON.parse(result[dataKey]);
                                        var objectKeysn = Object.keys(tempPivotData);
                                        if (objectKeysn.length > 0) {
                                            pivotData = tempPivotData[objectKeysn[0]];
                                        }
                                    }
                                    else {
                                        pivotData = result[dataKey];
                                    }
                                    //pivot control
                                    $('.pivot-table').each(function () {
                                        $('#' + this.id).pivotUI(pivotData,
                            {
                                rows: '',
                                cols: ''
                            });
                                    });
                                }
                                else if (outputControlType[key] === 'datepicker' && dataKey.toLowerCase().trim() === outputPara[key].toLowerCase().trim()) {
                                    var pattern = /Date\(([^)]+)\)/;
                                    var dateResults = pattern.exec(arrayToString(result[dataKey]));
                                    var dt = new Date(parseFloat(dateResults[1]));
                                    var formatted = $.datepicker.formatDate("mm/dd/yy", dt);
                                    $("[type=text]", "[data-control-id=" + key + "]").calendarsPicker('setDate', formatted);
                                    $("[type=text]", "[data-control-id=" + key + "]").val(JSON.stringify(result[dataKey]));
                                }
                                else if (outputControlType[key] === 'chart' && dataKey.toLowerCase().trim() === outputPara[key].toLowerCase().trim()) {
                                    var chartData = {
                                    };
                                    if ($.type(result[dataKey]) === 'string') {
                                        var tempChartData = JSON.parse(result[dataKey]);
                                        var objectKeyso = Object.keys(tempChartData);
                                        if (objectKeyso.length > 0) {
                                            chartData = tempChartData[objectKeyso[0]];
                                        }
                                    }
                                    else {
                                        chartData = result[dataKey];
                                    }
                                    var elementDiv = $("div[data-control-id=" + key + "]");
                                    loadChardOnPageLoad(elementDiv, chartData);
                                }
                            }
                        }
                        else if (outputVariableObject.hasOwnProperty(dataKey)) {
                            outVar[outputVariableObject[dataKey]] = result[dataKey]
                        }
                    }
                }
                else {
                    for (var key in outputControlType) {
                        if (outputControlType[key] === 'button') {
                            $("[type=button]", "[data-control-id=" + key + "]").text(singleKeyToString(data));
                        }
                        else if (outputControlType[key] === 'textbox') {
                            $("[type=text]", "[data-control-id=" + key + "]").val(singleKeyToString(data));
                        }
                        else if (outputControlType[key] === 'checkbox') {
                            $("[type=checkbox]", "[data-control-id=" + key + "]").val(singleKeyToString(data));
                        }
                        else if (outputControlType[key] === 'text') {
                            $("[type=text]", "[data-control-id=" + key + "]").text(singleKeyToString(data));
                        }
                        else if (outputControlType[key] === 'numberbox') {
                            var ctrlValue = singleKeyToString(data);
                            fsi.setById(key, ctrlValue);
                        }
                        else if (outputControlType[key] === 'slider') {
                            $("[type=number]", "[data-control-id=" + key + "]").val(singleKeyToString(data));
                        }
                        else if (outputControlType[key] === 'textarea') {
                            $("textarea", "[data-control-id=" + key + "]").val(singleKeyToString(data));
                        }
                        else if (outputControlType[key] === 'label') {
                            $("label", "[data-control-id=" + key + "]").text('');
                            $("label", "[data-control-id=" + key + "]").text(singleKeyToString(data));
                            //$("form").find("[data-control-id=" + key + "]").find('label').html(data)
                        }
                        else if (outputControlType[key] === 'combo') {
                            var comboData = {
                            };
                            var tempcomboDataData = result;
                            var objectKeysp = Object.keys(tempcomboDataData);
                            if (objectKeysp.length > 0) {
                                try {
                                    comboData = JSON.parse(tempcomboDataData[objectKeysp[0]]);
                                }
                                catch (e) {
                                    comboData = result;
                                }
                            }
                            var html = '';
                            var fieldString = '';
                            if (comboData.Output.length > 0) {
                                $.each(comboData.Output[0], function (colName, b) {
                                    if (fieldString === '') {
                                        fieldString = colName;
                                    }
                                    else {
                                        fieldString += ',' + colName;
                                    }
                                });
                                var fields = fieldString.split(',');
                                $.each(comboData.Output, function (a, b) {
                                    if (fields.length > 0) {
                                        if (fields.length > 1) {
                                            $("select", "[data-control-id=" + key + "]").append('<option value="' + b[fields[0]] + '">' + b[fields[1]] + '</option>');
                                        }
                                        else {
                                            $("select", "[data-control-id=" + key + "]").append('<option value="' + b[fields[0]] + '">' + b[fields[0]] + '</option>');
                                        }
                                    }
                                });
                                $(".ui-btn-text", "[data-control-id=" + key + "]").html($("select option:selected", "[data-control-id=" + key + "]").text());
                            }
                        }
                        else if (outputControlType[key] === 'datalist') {
                            $("[data-control-id=" + key + "]").attr('isBindWorkflow', 'true');
                            var datalistData = {
                            };
                            var tempdatalistData = result;
                            var objectKeysr = Object.keys(tempdatalistData);
                            if (objectKeysr.length > 0) {
                                try {
                                    datalistData = JSON.parse(tempdatalistData[objectKeysr[0]]);
                                }
                                catch (e) {
                                    $.unblockUI();
                                    datalistData = result;
                                }
                            }
                            if (datalistData.Output.length > 0) {
                                var table = '<div class="row fixed-table" style="height: 299px; padding-bottom: 37px; position:relative;top:-37px;margin-left:0px;"><div id="content-' + key + '" class="table-content"><table data-toggle="table" data-url="data1.json" data-cache="false" data-height="299" class="table table-striped table-fixed-header table-hover tblDataList" style="margin:0px;">';
                                if ($("[data-control-id=" + key + "]").data('headervisible').toLowerCase() === 'on') {
                                    table += '<thead class="header"><tr>';
                                }
                                else {
                                    table += '<thead class="header" style="display:none;"><tr>';
                                }
                                var thCount = 0;
                                $.each(datalistData.Output[0], function (colName, b) {
                                    if ($("[data-control-id=" + key + "]").data('hidefirstcolumn') === 'yes' && thCount === 0) {
                                        table += ('<th style="display:none;"> ' + colName + '</th>');
                                    }
                                    else {
                                        table += ('<th> ' + colName + '</th>');
                                    }
                                    thCount++;
                                });
                                table += '</tr></thead>';

                                table += '<tbody>';
                                $.each(datalistData.Output, function (a, row) {
                                    table += '<tr>';
                                    var tdCount = 0;
                                    $.each(row, function (p, rowData) {
                                        if ($("[data-control-id=" + key + "]").data('hidefirstcolumn') === 'yes' && tdCount === 0) {
                                            if (rowData !== '' && rowData !== null) {
                                                table += ('<td style="display:none;">' + rowData + '</td>');
                                            }
                                            else {
                                                table += ('<td style="display:none;">&nbsp;</td>');
                                            }
                                        }
                                        else {
                                            if (rowData !== '' && rowData !== null) {
                                                table += ('<td>' + rowData + '</td>');
                                            }
                                            else {
                                                table += ('<td>&nbsp;</td>');
                                            }
                                        }
                                        tdCount++;
                                    });
                                    table += '</tr>';
                                });
                                table += '</tbody></table></div><div class="fixed-table-pagination"></div></div>';
                                $('#tbl_' + $("[data-control-id=" + key + "]").data('control-id')).html(table);
                                $('#tbl_' + $("[data-control-id=" + key + "]").data('control-id')).parent().siblings('li').find('.ui-li-count').html(datalistData.Output.length);
                                setTimeout(function () {
                                    // $('.table-fixed-header').fixedHeader();
                                }, 100);

                                if ($("[data-control-id=" + key + "]").attr('data-redirect-url') !== "select" && $("[data-control-id=" + key + "]").attr('data-redirect-url') !== undefined) {
                                    fsi.dataListRowClickEvent($("[data-control-id=" + key + "]"), $("[data-control-id=" + key + "]").attr('data-redirect-url'), $("[data-control-id=" + key + "]").attr('data-url'));
                                }
                            }
                            else {
                                var table = '<div class="bootstrap-table"><div class="fixed-table-toolbar"></div>  <div class="fixed-table-container" style="height: 299px; padding-bottom: 37px;"><div class="fixed-table-body"><table data-toggle="table" data-url="data1.json" data-cache="false" data-height="299" class="table table-hover" style="margin-top:0px;"><tr><td>No records found!</td></tr></table></div><div class="fixed-table-pagination"></div></div></div>';
                                $('#tbl_' + $("[data-control-id=" + key + "]").data('control-id')).html(table);
                            }
                        }
                        else if (outputControlType[key] === 'grid') {
                            var path = location.protocol + '//' + (location.host.match('localhost') ? location.host : location.host + '/FSITenant');
                            try {
                                var gridData = {
                                };
                                var tempgridDataData = result;
                                var objectKeyst = Object.keys(tempgridDataData);
                                if (objectKeyst.length > 0) {
                                    try {
                                        gridData = JSON.parse(tempgridDataData[objectKeyst[0]]);
                                    }
                                    catch (e) {
                                        $.unblockUI();
                                        gridData = result;
                                    }
                                }
                            }
                            catch (e) {
                                $.unblockUI();
                                alert(gridData + "=> Incorrect data format");
                                return;
                            }
                            //var table = '';
                            //var thead = "<thead>";
                            //$.each(gridData.Output[0], function (key, value) {
                            //    thead += "<th  class='sorting'>" + key + "</th>";
                            //});
                            //thead += "</thead>";

                            //table = thead+'<tbody>';
                            //$.each(gridData.Output, function (index, node) {
                            //    table += '<tr>';
                            //    $.each(node, function (key, value) {                                              
                            //        table += ('<td>' + (value === null ? '' : value) + '</td>');
                            //    });
                            //    table += '</tr>';
                            //});                                       
                            //table += '</tbody>';
                            var dynamicColumns = [];
                            var i = 0;
                            var colList = '';
                            $.each(gridData.Output[0], function (key, value) {
                                var obj = {
                                    sTitle: key
                                };
                                dynamicColumns[i] = obj;
                                colList += key + ",";
                                i++;
                            });
                            //fetch all records from JSON result and make row data set.
                            var rowDataSet = [];
                            var i = 0;
                            $.each(gridData.Output, function (key, value) {
                                var rowData = [];
                                var j = 0;
                                $.each(gridData.Output[i], function (key, value) {
                                    rowData[j] = value;
                                    j++;
                                });
                                rowDataSet[i] = rowData;
                                i++;
                            });

                            var tableObj = $('table', $("[data-control-id=" + key + "]"));
                            BindGridWithWorkflow(tableObj[0], rowDataSet, dynamicColumns);
                        }
                        else if (outputControlType[key] === "pivot") {
                            var pivotData = {
                            };
                            var temppivotDataData = result;
                            var objectKeysu = Object.keys(temppivotDataData);
                            if (objectKeysu.length > 0) {
                                try {
                                    pivotData = JSON.parse(temppivotDataData[objectKeysu[0]]);
                                }
                                catch (e) {
                                    $.unblockUI();
                                    pivotData = result;
                                }
                            }

                            //pivot control
                            $('.pivot-table').each(function () {
                                $('#' + this.id).pivotUI(pivotData,
                                   {
                                       rows: '',
                                       cols: ''
                                   });

                            });
                        }
                        else if (outputControlType[key] === 'datepicker') {
                            var pattern = /Date\(([^)]+)\)/;
                            var dateResults = pattern.exec(singleKeyToString(data));
                            var dt = new Date(parseFloat(dateResults[1]));
                            var formatted = $.datepicker.formatDate("mm/dd/yy", dt);
                            $("[type=text]", "[data-control-id=" + key + "]").calendarsPicker('setDate', formatted);
                            $("[type=text]", "[data-control-id=" + key + "]").val(formatted);
                        }
                        else if (outputControlType[key] === 'chart') {
                            var chartData = {
                            };
                            var tempchartDataData = result;
                            var objectKeysv = Object.keys(tempchartDataData);
                            if (objectKeysv.length > 0) {
                                try {
                                    chartData = JSON.parse(tempchartDataData[objectKeysv[0]]);
                                }
                                catch (e) {
                                    $.unblockUI();
                                    chartData = result;
                                }
                            }
                            var elementDiv = $("div[data-control-id=" + key + "]");
                            loadChardOnPageLoad(elementDiv, chartData.Output);
                        }
                    }
                }
                $.each(outVar, function (i) {
                    $.each(outputVariable, function (j) {
                        if (i === j) {
                            outputVariable[i] = outVar[j];
                        }
                    });
                });
                successCallback(data, outputVariable);
            }
            catch (e) {
                $.unblockUI();
                for (var key in outputControlType) {
                    if (outputControlType[key] === 'button') {
                        $("[type=button]", "[data-control-id=" + key + "]").text(singleKeyToString(data));
                    }
                    else if (outputControlType[key] === 'textbox') {
                        $("[type=text]", "[data-control-id=" + key + "]").val(singleKeyToString(data));
                    }
                    else if (outputControlType[key] === 'checkbox') {
                        $("[type=checkbox]", "[data-control-id=" + key + "]").val(singleKeyToString(data));
                    }
                    else if (outputControlType[key] === 'text') {
                        $("[type=text]", "[data-control-id=" + key + "]").text(singleKeyToString(data));
                    }
                    else if (outputControlType[key] === 'numberbox') {
                        $("[type=number]", "[data-control-id=" + key + "]").val(singleKeyToString(data));
                    }
                    else if (outputControlType[key] === 'textarea') {
                        $("textarea", "[data-control-id=" + key + "]").val(singleKeyToString(data));
                    }
                    else if (outputControlType[key] === 'label') {
                        $("form").find("[data-control-id=" + key + "]").find('label').html('');
                        $("form").find("[data-control-id=" + key + "]").find('label').html(singleKeyToString(data));
                        //$("lable", "[data-control-id=" + key + "]").text(data);
                    }
                    else if (outputControlType[key] === 'datepicker') {
                        var pattern = /Date\(([^)]+)\)/;
                        var dateResults = pattern.exec(singleKeyToString(data));
                        var dt = new Date(parseFloat(dateResults[1]));
                        var formatted = $.datepicker.formatDate("mm/dd/yy", dt);
                        $("[type=text]", "[data-control-id=" + key + "]").calendarsPicker('setDate', formatted);
                        $("[type=text]", "[data-control-id=" + key + "]").val(formatted);
                    }
                    else if (outputControlType[key] === 'grid') {
                        console.log(e);
                    }
                    else if (outputControlType[key] === 'imagepanel') {
                        $("[data-control-id=" + key + "]").find("[id^=ui-imagepanel-]").css('background-image', 'url(data:image/jpeg;base64,' + singleKeyToString(data) + ')');
                        $("[data-control-id=" + key + "]").attr('data-image-content', 'data:image/jpeg;base64,' + singleKeyToString(data));
                    }
                }
                $.each(outVar, function (i) {
                    $.each(outputVariable, function (j) {
                        if (i === j) {
                            outputVariable[i] = outVar[j];
                        }
                    });
                });
                successCallback(data, outputVariable);
            }
        },
        error: function (a, b, c) {
            $.unblockUI();
            errorCallBack(a);
            alert(a);
        }
    });
}

fsi.prototype.convertDateTimeFormat = function (datetime, formatType) {
    var formattedDateTime = '';
    var tenantUrl = fsi.tenant
    var myurl = tenantUrl + '/ConvertDateTimeFormat?datetime=' + datetime + '&formatType=' + formatType;
    $.ajax({
        cache: false,
        async: true,
        url: myurl,
        type: 'GET',
        beforeSend: function () {

        },
        success: function (data) {
            if (data.isSuccess && data.formattedDateTime.length > 0) {
                formattedDateTime = data.formattedDateTime;
            }
        },
        error: function (x, y, z) {
        },
    });
    return formattedDateTime;
}

fsi.prototype.convertDateTime = function (datetime, formatType, element) {
    var tenantUrl = fsi.tenant
    var myurl = tenantUrl + '/ConvertDateTime?datetime=' + datetime + '&formatType=' + formatType;
    $.ajax({
        cache: false,
        async: true,
        url: myurl,
        type: 'GET',
        beforeSend: function () {

        },
        success: function (data) {
            if (data.isSuccess && data.formattedDateTime.length > 0) {
                var dateFormat = $(element).data('dateformat');
                if (dateFormat === 'dd/mm/yyyy') {
                    dateFormat = 'dd/mm/yy';
                }
                else if (dateFormat === 'yyyy/mm/dd') {
                    dateFormat = 'yy/mm/dd';
                }
                else if (dateFormat === 'mm/dd/yyyy') {
                    dateFormat = 'mm/dd/yy';
                }
                var formatted = $.datepicker.formatDate(dateFormat, new Date(data.formattedDateTime));
                $(element).find(':input[type="text"]').calendarsPicker('setDate', formatted);
                $(element).find(':input[type="text"]').val(formatted);
            }
        },
        error: function (x, y, z) {
        },
    });
    return formattedDateTime;
}

function ArrayFromData(data) {
    var arrayData = null;
    if (typeof (data) === 'object') {
        if (!data.length) {
            arrayData = data[Object.getOwnPropertyNames(data)]
            return ArrayFromData(arrayData);
        }
        else {
            return data;
        }
    }
}
function BindGridByWebService(newData, webOutputControl) {
    var tableObj = $('#' + webOutputControl).parent().find('#dataTable');
    var data = ArrayFromData(JSON.parse(newData));
    var columns = Object.keys(data[0]);

    var table = '<thead><tr>';
    $.each(columns, function (i) {
        table += ('<th style=""> <div class="th-inner ">' + columns[i] + '</div><div class="fht-cell" style="width: 213px;"></div></th>');
    });
    table += '</tr><tr>';
    $.each(columns, function (i) {
        table += ('<th style=""> <div class="th-inner ">' + columns[i] + '</div><div class="fht-cell" style="width: 213px;"></div></th>');
    });
    table += '</tr></thead><tbody>';
    $.each(data, function (a, row) {
        table += '<tr>';
        $.each(row, function (p, rowData) {
            table += ('<td>' + rowData + '</td>');
        });
        table += '</tr>';
    });
    table += '</tbody>';

    tableObj.html('');
    if ($(tableObj).hasClass('dataTable')) {
        dataTable.fnDestroy();
        //  dataTable.fnClearTable(0).fnDraw();
        //  dataTable.fnFilterClear();
        $('#feedback-datatable').empty();
    }
    else {
        dataTable = tableObj;
    }
    tableObj.html(table);
    var columns = $('thead tr:first th', tableObj).map(function (a, b) {
        return a;
    }).get();
    var fields = $('thead tr:first th', tableObj).map(function () {
        return {
            label: $(this).text(), name: $(this).text()
        }
    }).get();
    editor = new $.fn.dataTable.Editor({
        ajax: "../../Test/Post",
        table: tableObj,
        fields: fields
    });
    var config = {
        //  "dom": 'C<"clear">lfrtip',
        "pagingType": "full_numbers",
        //    "dom": 'RC<"clear">lfrtip',
        "sDom": '<"top"i>rt<"bottom"flp><"clear">',
        tableTools: {
            sRowSelect: "os",
            sRowSelector: 'td:first-child',
            "sSwfPath": "~/Designer/extensions/grid/extensions/TableTools/swf/copy_csv_xls_pdf.swf"
        },
        responsive: true,
        "scrollY": "200px",
        ///dom: '<"clear">Rfrtlip',//Rfrtlip
        "bSort": true
    };
    attributes = {
    };
    $.each(tableObj.get(0).attributes, function (i, attrib) {
        if (attrib.name.indexOf('is') !== -1)
            attributes[attrib.name] = attrib.value;
    });
    console.log(attributes);
    console.log(columns);
    if (attributes.iseditable === "true") {                   //attributes.iseditable
        console.log('isEditable');
        editor.on('open', function (e, type) {
            if (type === 'inline') {
                // Listen for a tab key event when inline editing
                $(document).off().on('keydown.editable', function (e) {

                    if (e.keyCode === 9) {
                        e.preventDefault();

                        // Find the cell that is currently being edited
                        var cell = $('div.DTE').parent();

                        if (e.shiftKey && cell.prev().length && cell.prev().index() !== 0) {
                            // One cell to the left (skipping the first column)
                            cell.prev().click();
                        }
                        else if (e.shiftKey) {
                            // Up to the previous row
                            cell.parent().prev().children().last(0).click();
                        }
                        else if (cell.next().length) {
                            // One cell to the right
                            cell.next().click();
                        }
                        else {
                            // Down to the next row
                            cell.parent().next().children().eq(1).click();
                        }
                    }
                });
            }
        }).on('close', function () {
            $(document).off('keydown.editor');
        });
        $(tableObj).off().on('click', 'tbody td:not(:first-child)', function (e) {
            editor.inline(this, {
                submitOnBlur: true
            });
        });
        config.tableTools.aButtons =
                   [{
                       sExtends: "editor_create", editor: editor
                   },
               {
                   sExtends: "editor_edit", editor: editor
               },
               {
                   sExtends: "editor_remove", editor: editor
               }];
        config.tableTools.sSwfPath = "~/Designer/extensions/grid/extensions/TableTools/swf/copy_csv_xls_pdf.swf";
        config.dom = 'T' + config.dom;
    }
    else {
        console.log('nonisEditable');
    }
    if (attributes.isprintoptions === 'true') { //attributes.isprintoptions    
        if (!(attributes.iseditable === "true")) {
            config.dom = 'T' + config.dom;
        }
    }
    else {

    }
    if (attributes.iscolumnshowhide === 'true') { //attributes.iscolumnshowhide      
        config.dom = 'C' + config.dom
    }
    if (!(attributes.isshowpaging === 'true')) {
        config.paging = false;
    }
    if (attributes.isreordercolumn === 'true') {
        config.dom = 'R' + config.dom
    }
    if (attributes.issortable === 'true') {
        config.bSort = true;
        config.aoColumnDefs = [{
            "bSortable": true, "aTargets": columns
        }]
    }
    else {
        config.bSort = false;
        config.aoColumnDefs = [{
            "bSortable": false, "aTargets": []
        }]
    }

    try {
        dataTable = $(dataTable).dataTable(config);
    }
    catch (e) {
        alert('Error : ' + e);
    }

    if (attributes.iscoumnfilter === 'true') {
        console.log('iscoumnfilter');
        dataTable = dataTable.columnFilter({
            sPlaceHolder: "head:before"
        });
        $("#dataTable_filter", table).hide();
    }
    console.log(attributes);
    console.log(config);
    new $.fn.dataTable.FixedHeader(dataTable);  //To see the columns header when scrolling
    console.log(attributes);

}

fsi.prototype.expireLastPage = function () {
    sessionStorage.removeItem("lastPageId");
    sessionStorage.removeItem("lastPage");
    sessionStorage.removeItem('lastPageExpireTime');
}
function setLastPage(pageKey) {
    var lastPage = [];
    var currentDate = new Date();
    var expires = Math.round((currentDate.setSeconds(currentDate.getSeconds() + 60)) / 1000);
    sessionStorage.setItem("lastPageId", fsi.formId);
    sessionStorage.setItem("lastPage", pageKey);
    sessionStorage.setItem('lastPageExpireTime', expires);
}
fsi.prototype.getLastPage = function () {
    if (sessionStorage.getItem("lastPage") !== undefined) {
        var date = new Date();
        var current = Math.round(+date / 1000);
        console.log('loacation  ' + location);
        var lastPageExpireTime = sessionStorage.getItem("lastPageExpireTime");
        if (parseInt(lastPageExpireTime) < current && sessionStorage.getItem("lastPageId") !== fsi.formId) {
            return false;
        }
        else {
            return sessionStorage.getItem("lastPage");
        }
    }
}

function ConvertTimeformat(format, time) {
    var hours = Number(time.match(/^(\d+)/)[1]);
    var minutes = Number(time.match(/:(\d+)/)[1]);
    var AMPM = time.match(/\s(.*)$/) === null ? '' : time.match(/\s(.*)$/)[1];
    if (AMPM === "PM" && hours < 12) hours = hours + 12;
    if (AMPM === "AM" && hours === 12) hours = hours - 12;
    var sHours = hours.toString();
    var sMinutes = minutes.toString();
    if (hours < 10) sHours = "0" + sHours;
    if (minutes < 10) sMinutes = "0" + sMinutes;
    if (format === 'M') return minutes;
    if (format === 'H') return hours;
}
function ConvertTimeTo12format(time) {
    var isAMPM = time.match(/\s(.*)$/) === null ? '' : time.match(/\s(.*)$/)[1];
    if (isAMPM === null || isAMPM === undefined) {
        var hours = Number(time.match(/^(\d+)/)[1]);
        var minutes = Number(time.match(/:(\d+)/)[1]);
        var AMPM = (hours >= 12) ? ' PM' : ' AM';
        hours = ((hours + 11) % 12 + 1);
        var sHours = hours.toString();
        var sMinutes = minutes.toString();
        if (hours < 10) sHours = "0" + sHours;
        if (minutes < 10) sMinutes = "0" + sMinutes;
        return (sHours + ':' + sMinutes + AMPM);
    }
    else {
        return time;
    }
}
fsi.prototype.getLoggedUserId = function () {
    return loggedUserId;
}
fsi.prototype.getLoggedUserName = function () {
    return loggedUserName;
}
fsi.prototype.getComboText = function (selector) {
    var element = $('div[data-control-id=' + selector + ']');
    return $(element).find('select').find('option:selected').text();
}
fsi.prototype.getPageNameByKey = function (pageKey, successCallback, errorCallback) {
    var requestData = {
        pageKey: pageKey
    };
    var tenantUrl = getTenantUrl();
    var myurl = tenantUrl + '/Web/GetPageNameWithPageKey';
    $.ajax({
        cache: false,
        url: myurl,
        type: "GET",
        data: requestData,
        success: successCallback,
        error: errorCallback
    });
};

fsi.prototype.changePageKey = function (pageKey) {
    try {
        fsi.getPageNameByKey(pageKey, function (data) {
            fsi.redirectPage(data.formName);
        },
        function (error) {
            console.log(error);
        });
    }
    catch (e) {
        console.log(e);
    }
}
//--------------------- Start Api Function ---------------------

//----commmon Api----
fsi.prototype.readOnly = function (id, isReadOnly) {
    var element = $('div[data-control-id=' + id + ']');
    var type = element.data('controlType');
    if (type === 'checkbox') {

    } else {
        if (isReadOnly === true || isReadOnly === 'true' || isReadOnly.toString().toLowerCase() === 'readonly') {
            $(element).find('input').attr('readOnly', 'readonly');
        } else {
            $(element).find('input').removeAttr('readOnly');
        }
    }
}
fsi.prototype.border = function (controlName, width, style, color) {
    var element = $('div[data-control-id=' + controlName + ']');
    var type = element.data('controlType');
    if (type === 'button') {
        $(element).find('.ui-btn-inner.ui-btn-corner-all')[0].attr('style', ' border:' + width + ' ' + style + ' ' + color);
    } else if (type === 'checkbox') {
        var attr = $(element).find(".ui-checkbox label").attr('style');
        $(element).find(".ui-checkbox label").attr('style', attr + ' border:' + width + ' ' + style + ' ' + color + ' !important; ');
    } else if (type === 'color') {
        var attr = $(element).find(".piker-wrapper").attr('style');
        $(element).find(".piker-wrapper").attr('style', attr + ' border:' + width + ' ' + style + ' ' + color + ' !important; ');

    } else if (type === 'currency') {
        var attr = $(element).find("input").attr('style');
        $(element).find("input").attr('style', attr + ' border:' + width + ' ' + style + ' ' + color + ' !important; ');

    } else if (type === 'datalist') {
        var attr = $(element).attr('style');
        $(element).attr('style', attr + ' border:' + width + ' ' + style + ' ' + color + ' !important; ');

    } else if (type === 'datepicker') {
        var attr = $(element).find("input.datepicker").attr('style');
        $(element).find("input.datepicker").attr('style', attr + ' border:' + width + ' ' + style + ' ' + color + ' !important; ');

    } else if (type === 'documentlinker') {
        var attr = $(element).find(".js-comp").attr('style');
        $(element).find(".js-comp").attr('style', attr + ' border:' + width + ' ' + style + ' ' + color + ' !important; ');

    } else if (type === 'link') {
        var attr = $(element).attr('style');
        $(element).attr('style', attr + ' border:' + width + ' ' + style + ' ' + color + ' !important; ');

    } else if (type === 'imagepanel') {
        var attr = $(element).attr('style');
        $(element).attr('style', attr + ' border:' + width + ' ' + style + ' ' + color + ' !important; ');

    } else if (type === 'label') {
        var attr = $(element).find('.js-bdr').attr('style');
        $(element).find('.js-bdr').attr('style', attr + ' border:' + width + ' ' + style + ' ' + color + ' !important; ');

    } else if (type === 'numberbox') {
        var attr = $(element).find('input.ui-input-text').attr('style');
        $(element).find('input.ui-input-text').attr('style', attr + ' border:' + width + ' ' + style + ' ' + color + ' !important; ');

    } else if (type === 'radio') {
        var attr = $(element).find('.js-cmpo-radio').attr('style');
        $(element).find('.js-cmpo-radio').attr('style', attr + ' border:' + width + ' ' + style + ' ' + color + ' !important; ');

    } else if (type === 'slider') {
        var attr = $(element).find('.js-comp-slider').attr('style');
        $(element).find('.js-comp-slider').attr('style', attr + ' border:' + width + ' ' + style + ' ' + color + ' !important; ');

    } else if (type === 'textarea') {
        var attr = $(element).find('.js-comp-textarea').attr('style');
        $(element).find('.js-comp-textarea').attr('style', attr + ' border:' + width + ' ' + style + ' ' + color + ' !important; ');

    } else if (type === 'textbox') {
        var attr = $(element).find('.ui-input-text').attr('style');
        $(element).find('.ui-input-text').attr('style', attr + ' border:' + width + ' ' + style + ' ' + color + ' !important; ');

    } else if (type === 'timepicker') {
        var attr = $(element).find('.timepicker').attr('style');
        $(element).find('.timepicker').attr('style', attr + ' border:' + width + ' ' + style + ' ' + color + ' !important; ');

    } else if (type === 'togglebutton') {
        var attr = $(element).attr('style');
        $(element).attr('style', attr + ' border:' + width + ' ' + style + ' ' + color + ' !important; ');

    } else if (type === 'calendar') {
        var attr = $(element).find('.calendars').attr('style');
        $(element).find('.calendars').attr('style', attr + ' border:' + width + ' ' + style + ' ' + color + ' !important; ');

    } else if (type === 'chart') {
        var attr = $(element).find('.js-comp-chart').attr('style');
        $(element).find('.js-comp-chart').attr('style', attr + ' border:' + width + ' ' + style + ' ' + color + ' !important; ');

    } else if (type === 'datatag') {
        var attr = $(element).attr('style');
        $(element).attr('style', attr + ' border:' + width + ' ' + style + ' ' + color + ' !important; ');

    } else if (type === 'grid') {
        var attr = $(element).find('.gridContainer').attr('style');
        $(element).find('.gridContainer').attr('style', attr + ' border:' + width + ' ' + style + ' ' + color + ' !important; ');

    } else if (type === 'map') {
        var attr = $(element).attr('style');
        $(element).attr('style', attr + ' border:' + width + ' ' + style + ' ' + color + ' !important; ');

    } else if (type === 'pivot') {
        var attr = $(element).find('.js-comp-pivot').attr('style');
        $(element).find('.js-comp-pivot').attr('style', attr + ' border:' + width + ' ' + style + ' ' + color + ' !important; ');

    } else if (type === 'progressbar') {
        var attr = $(element).find('.progressbar').attr('style');
        $(element).find('.progressbar').attr('style', attr + ' border:' + width + ' ' + style + ' ' + color + ' !important; ');

    } else if (type === 'rssfeed') {
        var attr = $(element).attr('style');
        $(element).attr('style', attr + ' border:' + width + ' ' + style + ' ' + color + ' !important; ');

    } else if (type === 'report') {
        var attr = $(element).attr('style');
        $(element).attr('style', attr + ' border:' + width + ' ' + style + ' ' + color + ' !important; ');

    } else if (type === 'social') {
        var attr = $(element).find('.js-comp-social').attr('style');
        $(element).find('.js-comp-social').attr('style', attr + ' border:' + width + ' ' + style + ' ' + color + ' !important; ');

    } else if (type === 'treeview') {
        var attr = $(element).attr('style');
        $(element).attr('style', attr + ' border:' + width + ' ' + style + ' ' + color + ' !important; ');

    } else if (type === 'accordion') {
        var attr = $(element).attr('style');
        $(element).attr('style', attr + ' border:' + width + ' ' + style + ' ' + color + ' !important; ');

    } else if (type === 'collapsible') {
        var attr = $(element).attr('style');
        $(element).attr('style', attr + ' border:' + width + ' ' + style + ' ' + color + ' !important; ');

    } else if (type === 'tabs') {
        var attr = $(element).attr('style');
        $(element).attr('style', attr + ' border:' + width + ' ' + style + ' ' + color + ' !important; ');

    }

}

fsi.prototype.borderRadius = function (controlName, width) {
    var element = $('div[data-control-id=' + controlName + ']');

    var type = element.data('controlType');

    if (type === 'button') {
        $(element).find('.ui-btn-inner.ui-btn-corner-all')[0].attr('style', ' border-radius:' + width + ' ' + rightWidth + ' ' + bottomWidth + ' ' + leftWidth);

    } else if (type === 'checkbox') {
        var attr = $(element).find(".ui-checkbox label").attr('style');
        $(element).find(".ui-checkbox label").attr('style', attr + ' border-radius:' + width + ' !important; ');

    } else if (type === 'color') {
        var attr = $(element).find(".piker-wrapper").attr('style');
        $(element).find(".piker-wrapper").attr('style', attr + ' border-radius:' + width + ' !important; ');

    } else if (type === 'combo') {
        var attr = $(element).find("input").attr('style');
        $(element).find("input").attr('style', attr + ' border-radius:' + width + ' !important; ');

    } else if (type === 'currency') {
        var attr = $(element).find("input").attr('style');
        $(element).find("input").attr('style', attr + ' border-radius:' + width + ' !important; ');

    } else if (type === 'datalist') {
        var attr = $(element).attr('style');
        $(element).attr('style', attr + ' border-radius:' + width + ' !important; ');

    } else if (type === 'datepicker') {
        var attr = $(element).find("input.datepicker").attr('style');
        $(element).find("input.datepicker").attr('style', attr + ' border-radius:' + width + ' !important; ');

    } else if (type === 'documentlinker') {
        var attr = $(element).find(".js-comp").attr('style');
        $(element).find(".js-comp").attr('style', attr + ' border-radius:' + width + ' !important; ');

    } else if (type === 'link') {
        var attr = $(element).attr('style');
        $(element).attr('style', attr + ' border-radius:' + width + ' !important; ');

    } else if (type === 'imagepanel') {
        var attr = $(element).attr('style');
        $(element).attr('style', attr + ' border-radius:' + width + ' !important; ');

    } else if (type === 'label') {
        var attr = $(element).find('.js-bdr').attr('style');
        $(element).find('.js-bdr').attr('style', attr + ' border-radius:' + width + ' !important; ');

    } else if (type === 'numberbox') {
        var attr = $(element).find('input.ui-input-text').attr('style');
        $(element).find('input.ui-input-text').attr('style', attr + ' border-radius:' + width + ' !important; ');

    } else if (type === 'radio') {
        var attr = $(element).find('.js-cmpo-radio').attr('style');
        $(element).find('.js-cmpo-radio').attr('style', attr + ' border-radius:' + width + ' !important; ');

    } else if (type === 'slider') {
        var attr = $(element).find('.js-comp-slider').attr('style');
        $(element).find('.js-comp-slider').attr('style', attr + ' border-radius:' + width + ' !important; ');

    } else if (type === 'textarea') {
        var attr = $(element).find('.js-comp-textarea').attr('style');
        $(element).find('.js-comp-textarea').attr('style', attr + ' border:' + width + ' ' + style + ' ' + color + ' !important; ');

    } else if (type === 'textbox') {
        var attr = $(element).find('.ui-input-text').attr('style');
        $(element).find('.ui-input-text').attr('style', attr + ' border-radius:' + width + ' !important; ');

    } else if (type === 'timepicker') {
        var attr = $(element).find('.timepicker').attr('style');
        $(element).find('.timepicker').attr('style', attr + ' border-radius:' + width + ' !important; ');

    } else if (type === 'togglebutton') {
        var attr = $(element).attr('style');
        $(element).attr('style', attr + ' border-radius:' + width + ' !important; ');

    } else if (type === 'calendar') {
        var attr = $(element).find('.calendars').attr('style');
        $(element).find('.calendars').attr('style', attr + ' border-radius:' + width + ' !important; ');

    } else if (type === 'chart') {
        var attr = $(element).find('.js-comp-chart').attr('style');
        $(element).find('.js-comp-chart').attr('style', attr + ' border-radius:' + width + ' !important; ');

    } else if (type === 'datatag') {
        var attr = $(element).attr('style');
        $(element).attr('style', attr + ' border-radius:' + width + ' !important; ');

    } else if (type === 'grid') {
        var attr = $(element).find('.gridContainer').attr('style');
        $(element).find('.gridContainer').attr('style', attr + ' border-radius:' + width + ' !important; ');

    } else if (type === 'map') {
        var attr = $(element).attr('style');
        $(element).attr('style', attr + ' border-radius:' + width + ' !important; ');

    } else if (type === 'pivot') {
        var attr = $(element).find('.js-comp-pivot').attr('style');
        $(element).find('.js-comp-pivot').attr('style', attr + ' border-radius:' + width + ' !important; ');

    } else if (type === 'progressbar') {
        var attr = $(element).find('.progressbar').attr('style');
        $(element).find('.progressbar').attr('style', attr + ' border-radius:' + width + ' !important; ');

    } else if (type === 'rssfeed') {
        var attr = $(element).attr('style');
        $(element).attr('style', attr + ' border-radius:' + width + ' !important; ');

    } else if (type === 'report') {
        var attr = $(element).attr('style');
        $(element).attr('style', attr + ' border-radius:' + width + ' !important; ');

    } else if (type === 'social') {
        var attr = $(element).find('.js-comp-social').attr('style');
        $(element).find('.js-comp-social').attr('style', attr + ' border-radius:' + width + ' !important; ');

    } else if (type === 'treeview') {
        var attr = $(element).attr('style');
        $(element).attr('style', attr + ' border-radius:' + width + ' !important; ');

    } else if (type === 'accordion') {
        var attr = $(element).attr('style');
        $(element).attr('style', attr + ' border-radius:' + width + ' !important; ');

    } else if (type === 'collapsible') {
        var attr = $(element).attr('style');
        $(element).attr('style', attr + ' border-radius:' + width + ' !important; ');

    } else if (type === 'tabs') {
        var attr = $(element).attr('style');
        $(element).attr('style', attr + ' border-radius:' + width + ' !important; ');

    }



}

fsi.prototype.color = function (controlName, color) {
    var element = $('div[data-control-id=' + controlName + ']');
    var type = element.data('controlType');
    if (type === 'button') {
        $(element).find('.ui-btn-inner.ui-btn-corner-all').find('.ui-btn-text').attr('style', ' color:' + color + ' !important; ');

    } else if (type === 'checkbox') {
        var attr = $(element).find(".ui-checkbox label").attr('style');
        $(element).find(".ui-checkbox label").attr('style', attr + ' color:' + color + ' !important; ');

    } else if (type === 'color') {
        var attr = $(element).find(".piker-wrapper").attr('style');
        $(element).find(".piker-wrapper").attr('style', attr + ' color:' + color + ' !important; ');

    } else if (type === 'currency') {
        var attr = $(element).find("input").attr('style');
        $(element).find("input").attr('style', attr + ' color:' + color + ' !important; ');

    } else if (type === 'datalist') {
        var attr = $(element).attr('style');
        $(element).attr('style', attr + ' color:' + color + ' !important; ');

    } else if (type === 'datepicker') {
        var attr = $(element).find("input.datepicker").attr('style');
        $(element).find("input.datepicker").attr('style', attr + ' color:' + color + ' !important; ');

    } else if (type === 'documentlinker') {
        var attr = $(element).find(".js-comp .btn-browse").attr('style');
        $(element).find(".js-comp .btn-browse").attr('style', attr + ' color:' + color + ' !important; ');

    } else if (type === 'link') {
        var attr = $(element).find('a.property-link').attr('style');
        $(element).find('a.property-link').attr('style', attr + ' color:' + color + ' !important; ');

    } else if (type === 'imagepanel') {
        var attr = $(element).find('panel-heading').find('span.btn-file').attr('style');
        $(element).find('panel-heading').find('span.btn-file').attr('style', attr + ' color:' + color + ' !important;');

    } else if (type === 'label') {
        var attr = $(element).find('.js-bdr .ui-label-theme-c').attr('style');
        $(element).find('.js-bdr .ui-label-theme-c').attr('style', attr + ' color:' + color + ' !important; ');

    } else if (type === 'numberbox') {
        var attr = $(element).find('input.ui-input-text').attr('style');
        $(element).find('input.ui-input-text').attr('style', attr + ' color:' + color + ' !important; ');

    } else if (type === 'radio') {
        var attr = $(element).find('.js-cmpo-radio').attr('style');
        $(element).find('.js-cmpo-radio').attr('style', attr + ' color:' + color + ' !important; ');

    } else if (type === 'slider') {
        var attr = $(element).find('.js-comp-slider .ui-input-text').attr('style');
        $(element).find('.js-comp-slider .ui-input-text').attr('style', attr + ' color:' + color + ' !important; ');

    } else if (type === 'textarea') {
        var attr = $(element).find('.js-comp-textarea .ui-input-text').attr('style');
        $(element).find('.js-comp-textarea .ui-input-text').attr('style', attr + ' color:' + color + ' !important; ');

    } else if (type === 'textbox') {
        var attr = $(element).find('.ui-input-text').attr('style');
        $(element).find('.ui-input-text').attr('style', attr + ' color:' + color + ' !important; ');

    } else if (type === 'timepicker') {
        var attr = $(element).find('.timepicker').attr('style');
        $(element).find('.timepicker').attr('style', attr + ' color:' + color + ' !important; ');

    } else if (type === 'togglebutton') {
        var attr = $(element).find('.onoffswitch-inner').attr('style');
        $(element).find('.onoffswitch-inner').attr('style', attr + ' color:' + color + ' !important; ');
        // document.getstyleSheets[0].addRule('.onoffswitch-inner:after', 'color:' + color + '!important');

    } else if (type === 'calendar') {
        var attr = $(element).find('.calendars').attr('style');
        $(element).find('.calendars').attr('style', attr + ' color:' + color + ' !important; ');

    } else if (type === 'chart') {
        var attr = $(element).find('.js-comp-chart').attr('style');
        $(element).find('.js-comp-chart').attr('style', attr + ' color:' + color + ' !important; ');

    } else if (type === 'datatag') {
        var attr = $(element).find('.property-label').attr('style');
        $(element).find('.property-label').attr('style', attr + ' color:' + color + ' !important; ');

    } else if (type === 'grid') {
        var attr = $(element).find('.gridContainer').attr('style');
        $(element).find('.gridContainer').attr('style', attr + ' color:' + color + ' !important; ');

    } else if (type === 'map') {
        var attr = $(element).attr('style');
        $(element).attr('style', attr + ' color:' + color + ' !important; ');

    } else if (type === 'pivot') {
        var attr = $(element).find('.js-comp-pivot').find('ul.ui-listview:eq(1)').next('a').attr('style');
        $(element).find('.js-comp-pivot').find('ul.ui-listview:eq(1)').next('a').attr('style', ' color:' + color + ' !important; ');

    } else if (type === 'progressbar') {
        var attr = $(element).find('.progressbar').attr('style');
        $(element).find('.progressbar').attr('style', attr + ' color:' + color + ' !important; ');

    } else if (type === 'rssfeed') {
        var attr = $(element).find('h2.rssfeed-header').attr('style');
        $(element).find('h2.rssfeed-header').attr('style', attr + ' color:' + color + ' !important; ');

    } else if (type === 'report') {

        var attr = $(element).find('header span').attr('style');
        if (attr === undefined) {
            attr = ';'
        }
        $(element).find('header span').attr('style', attr + ' color:' + color + ' !important; ');

    } else if (type === 'social') {
        var attr = $(element).find('.js-comp-social').attr('style');
        $(element).find('.js-comp-social').attr('style', attr + ' color:' + color + ' !important; ');

    } else if (type === 'treeview') {
        var attr = $(element).attr('style');
        $(element).attr('style', attr + ' color:' + color + ' !important; ');

    } else if (type === 'accordion') {
        var attr = $(element).find('.collapsible-content').attr('style');
        //alert(attr);
        $(element).find('.collapsible-content').attr('style', attr + ' color:' + color + ' !important; ');
        // $(element).find('.collapsible-content').css('cssText','color: '+color+' !important;')
        //alert($(element).find('.collapsible-content').attr('style'));

    } else if (type === 'collapsible') {
        var attr = $(element).find('.ui-btn-text').attr('style');
        $(element).find('.ui-btn-text').attr('style', attr + ' color:' + color + ' !important; ');

    } else if (type === 'tabs') {
        var attr = $(element).find('span.ui-btn-inner').attr('style');
        $(element).find('span.ui-btn-inner').attr('style', attr + '; color:' + color + ' !important; ');

    }

}

fsi.prototype.font = function (controlName, fontFamily, fontStyle, fontWeight, fontSize) {

    var element = $('div[data-control-id=' + controlName + ']');
    var type = element.data('controlType');
    /*style = style !== undefined ? style : '';
    size = size !== undefined ? size : '';
    family = family !== undefined ? family : '';*/
    if (type === 'button') {
        $(element).find('.ui-btn-inner.ui-btn-corner-all').find('.ui-btn-text').attr('style', ' font-family:' + fontFamily + ' !important; font-style:' + fontStyle + ' !important; font-weight: ' + fontWeight + ' !important; font-size:' + fontSize + ' !important;');

    } else if (type === 'checkbox') {
        var attr = $(element).find(".ui-checkbox label").attr('style');
        $(element).find(".ui-checkbox label").attr('style', attr + ' font-family:' + fontFamily + ' !important; font-style:' + fontStyle + ' !important;');
        $(element).find(".ui-checkbox label").find('.ui-btn-text').attr('style', 'font-size:' + fontSize + ' !important;')
    } else if (type === 'color') {
        var attr = $(element).find(".piker-wrapper .color-picker-input").attr('style');
        $(element).find(".piker-wrapper .color-picker-input").attr('style', attr + ' font-family:' + fontFamily + ' !important; font-style:' + fontStyle + ' !important; font-weight: ' + fontWeight + ' !important; font-size:' + fontSize + ' !important;');

    } else if (type === 'currency') {
        var attr = $(element).find("input").attr('style');
        $(element).find("input").attr('style', attr + ' font-family:' + fontFamily + ' !important; font-style:' + fontStyle + ' !important; font-weight: ' + fontWeight + ' !important; font-size:' + fontSize + ' !important;');

    } else if (type === 'datalist') {
        var attr = $(element).attr('style');
        $(element).attr('style', attr + ' font-family:' + fontFamily + ' !important; font-style:' + fontStyle + ' !important; font-weight: ' + fontWeight + ' !important; font-size:' + fontSize + ' !important;');

    } else if (type === 'datepicker') {
        var attr = $(element).find("label.label-reponsive").attr('style');
        $(element).find("label.label-reponsive").attr('style', attr + ' font-family:' + fontFamily + ' !important; font-style:' + fontStyle + ' !important; font-weight: ' + fontWeight + ' !important; font-size:' + fontSize + ' !important;');

    } else if (type === 'documentlinker') {
        var attr = $(element).find(".js-comp .btn-browse").attr('style');
        $(element).find(".js-comp .btn-browse").attr('style', attr + ' font-family:' + fontFamily + ' !important; font-style:' + fontStyle + ' !important; font-weight: ' + fontWeight + ' !important; font-size:' + fontSize + ' !important;');

    } else if (type === 'link') {
        var attr = $(element).find('a.property-link').attr('style');
        $(element).find('a.property-link').attr('style', attr + ' font-family:' + fontFamily + ' !important; font-style:' + fontStyle + ' !important; font-weight: ' + fontWeight + ' !important; font-size:' + fontSize + ' !important;');

    } else if (type === 'imagepanel') {
        var attr = $(element).find('.file-input').attr('style');
        $(element).find('.file-input').attr('style', attr + ' font-family:' + fontFamily + ' !important; font-style:' + fontStyle + ' !important; font-weight: ' + fontWeight + ' !important; font-size:' + fontSize + ' !important;');

    } else if (type === 'label') {
        var attr = $(element).find('.js-bdr .ui-label-theme-c').attr('style');
        $(element).find('.js-bdr .ui-label-theme-c').attr('style', attr + ' font-family:' + fontFamily + ' !important; font-style:' + fontStyle + ' !important; font-weight: ' + fontWeight + ' !important; font-size:' + fontSize + ' !important;');

    } else if (type === 'numberbox') {
        var attr = $(element).find('input.ui-input-text').attr('style');
        $(element).find('input.ui-input-text').attr('style', attr + ' font-family:' + fontFamily + ' !important; font-style:' + fontStyle + ' !important; font-weight: ' + fontWeight + ' !important; font-size:' + fontSize + ' !important;');

    } else if (type === 'radio') {
        var attr = $(element).find('.js-cmpo-radio').attr('style');
        $(element).find('.js-cmpo-radio').attr('style', attr + ' font-family:' + fontFamily + ' !important; font-style:' + fontStyle + ' !important; font-weight: ' + fontWeight + ' !important; font-size:' + fontSize + ' !important;');

    } else if (type === 'slider') {
        var attr = $(element).find('.js-comp-slider .ui-input-text').attr('style');
        $(element).find('.js-comp-slider .ui-input-text').attr('style', attr + ' font-family:' + fontFamily + ' !important; font-style:' + fontStyle + ' !important; font-weight: ' + fontWeight + ' !important; font-size:' + fontSize + ' !important;');

    } else if (type === 'textarea') {
        var attr = $(element).find('.js-comp-textarea .ui-input-text').attr('style');
        $(element).find('.js-comp-textarea .ui-input-text').attr('style', attr + ' font-family:' + fontFamily + ' !important; font-style:' + fontStyle + ' !important; font-weight: ' + fontWeight + ' !important; font-size:' + fontSize + ' !important;');

    } else if (type === 'textbox') {
        var attr = $(element).find('.ui-input-text').attr('style');
        $(element).find('.ui-input-text').attr('style', attr + ' font-family:' + fontFamily + ' !important; font-style:' + fontStyle + ' !important; font-weight: ' + fontWeight + ' !important; font-size:' + fontSize + ' !important;');

    } else if (type === 'timepicker') {
        var attr = $(element).find('.timepicker').attr('style');
        $(element).find('.timepicker').attr('style', attr + ' font-family:' + fontFamily + ' !important; font-style:' + fontStyle + ' !important; font-weight: ' + fontWeight + ' !important; font-size:' + fontSize + ' !important;');

    } else if (type === 'togglebutton') {

        var attr = $(element).find('.onoffswitch-inner').attr('style');
        $(element).find('.onoffswitch-inner').attr('style', attr + ' font-family:' + fontFamily + ' !important; font-style:' + fontStyle + ' !important; font-weight: ' + fontWeight + ' !important; font-size:' + fontSize + ' !important;');

    } else if (type === 'calendar') {
        var attr = $(element).find('.calendars').attr('style');
        $(element).find('.calendars').attr('style', attr + ' font-family:' + fontFamily + ' !important; font-style:' + fontStyle + ' !important; font-weight: ' + fontWeight + ' !important; font-size:' + fontSize + ' !important;');
        $(element).find('.calendars').find('.calendars-month th').attr('style', attr + ' font-family:' + fontFamily + ' !important; font-style:' + fontStyle + ' !important; font-weight: ' + fontWeight + ' !important; font-size:' + fontSize + ' !important;');
        $(element).find('.calendars').find('.calendars-month td').attr('style', attr + ' font-family:' + fontFamily + ' !important; font-style:' + fontStyle + ' !important; font-weight: ' + fontWeight + ' !important; font-size:' + fontSize + ' !important;');

    } /*else if (type === 'chart') {
        var attr = $(element).find('.js-comp-chart').attr('style');
        $(element).find('.js-comp-chart').attr('style', attr + ' font-family:' + fontFamily + ' !important; font-style:' + fontStyle + ' !important; font-weight: ' + fontWeight + ' !important; font-size:' + fontSize + ' !important;');

    } */
    else if (type === 'datatag') {
        var attr = $(element).find('.property-label').attr('style');
        $(element).find('.property-label').attr('style', attr + ' font-family:' + fontFamily + ' !important; font-style:' + fontStyle + ' !important; font-weight: ' + fontWeight + ' !important; font-size:' + fontSize + ' !important;');

    } else if (type === 'grid') {
        var attr = $(element).find('.gridContainer').attr('style');
        $(element).find('.gridContainer').attr('style', attr + ' font-family:' + fontFamily + ' !important; font-style:' + fontStyle + ' !important; font-weight: ' + fontWeight + ' !important; font-size:' + fontSize + ' !important;');

    }/* else if (type === 'map') {
        var attr = $(element).attr('style');
        $(element).attr('style', attr + ' height:' + height + ' !important; ');

    } */
    else if (type === 'pivot') {
        var attr = $(element).find('.js-comp-pivot').attr('style');
        $(element).find('.js-comp-pivot').attr('style', attr + ' font-family:' + fontFamily + ' !important; font-style:' + fontStyle + ' !important; font-weight: ' + fontWeight + ' !important; font-size:' + fontSize + ' !important;');

    } else if (type === 'progressbar') {
        var attr = $(element).find('.progressbar').attr('style');
        $(element).find('.progressbar').attr('style', attr + ' font-family:' + fontFamily + ' !important; font-style:' + fontStyle + ' !important; font-weight: ' + fontWeight + ' !important; font-size:' + fontSize + ' !important;');

    } else if (type === 'rssfeed') {
        var attr = $(element).find('h2.rssfeed-header').attr('style');
        $(element).find('h2.rssfeed-header').attr('style', attr + ' font-family:' + fontFamily + ' !important; font-style:' + fontStyle + ' !important; font-weight: ' + fontWeight + ' !important; font-size:' + fontSize + ' !important;');

    } else if (type === 'report') {
        var attr = $(element).find('header span').attr('style');
        $(element).find('header span').attr('style', attr + ' font-family:' + fontFamily + ' !important; font-style:' + fontStyle + ' !important; font-weight: ' + fontWeight + ' !important; font-size:' + fontSize + ' !important;');


    } else if (type === 'social') {
        var attr = $(element).find('.js-comp-social').attr('style');
        $(element).find('.js-comp-social').attr('style', attr + ' font-family:' + fontFamily + ' !important; font-style:' + fontStyle + ' !important; font-weight: ' + fontWeight + ' !important; font-size:' + fontSize + ' !important;');

    } else if (type === 'treeview') {
        var attr = $(element).attr('style');
        $(element).attr('style', attr + ' font-family:' + fontFamily + ' !important; font-style:' + fontStyle + ' !important; font-weight: ' + fontWeight + ' !important; font-size:' + fontSize + ' !important;');

    } else if (type === 'accordion') {
        var attr = $(element).find('.collapsible-content').attr('style');
        $(element).find('.collapsible-content').attr('style', attr + ' font-family:' + fontFamily + ' !important; font-style:' + fontStyle + ' !important; font-weight: ' + fontWeight + ' !important; font-size:' + fontSize + ' !important;');

    } else if (type === 'collapsible') {
        var attr = $(element).find('.ui-btn-text').attr('style');
        $(element).find('.ui-btn-text').attr('style', attr + ' font-family:' + fontFamily + ' !important; font-style:' + fontStyle + ' !important; font-weight: ' + fontWeight + ' !important; font-size:' + fontSize + ' !important;');

    } else if (type === 'tabs') {
        var attr = $(element).find('span.ui-btn-inner').attr('style');
        $(element).find('span.ui-btn-inner').attr('style', attr + '; font-family:' + fontFamily + ' !important; font-style:' + fontStyle + ' !important; font-weight: ' + fontWeight + ' !important; font-size:' + fontSize + ' !important;');

    }

}
fsi.prototype.height = function (controlName, height) {
    var element = $('div[data-control-id=' + controlName + ']');
    var type = element.data('controlType');
    if (type === 'button') {
        $(element).find('.ui-btn-inner.ui-btn-corner-all')[0].attr('style', ' height:' + height + ' !important');

    } else if (type === 'checkbox') {
        var attr = $(element).find(".ui-checkbox label").attr('style');
        $(element).find(".ui-checkbox label").attr('style', attr + ' height:' + height + ' !important; ');

    } else if (type === 'color') {
        var attr = $(element).find(".piker-wrapper").attr('style');
        $(element).find(".piker-wrapper").attr('style', attr + ' height:' + height + ' !important; ');

    } else if (type === 'currency') {
        var attr = $(element).find("input").attr('style');
        $(element).find("input").attr('style', attr + ' height:' + height + ' !important; ');

    } else if (type === 'datalist') {
        var attr = $(element).attr('style');
        $(element).attr('style', attr + ' height:' + height + ' !important; ');

    } else if (type === 'datepicker') {
        var attr = $(element).find("input.datepicker").attr('style');
        $(element).find("input.datepicker").attr('style', attr + ' height:' + height + ' !important; ');

    } else if (type === 'documentlinker') {
        var attr = $(element).find(".js-comp").attr('style');
        $(element).find(".js-comp").attr('style', attr + ' height:' + height + ' !important; ');

    } else if (type === 'link') {
        var attr = $(element).attr('style');
        $(element).attr('style', attr + ' height:' + height + ' !important; ');

    } else if (type === 'imagepanel') {
        var attr = $(element).find('.image-panel-container').attr('style');
        $(element).find('.image-panel-container').attr('style', attr + ' height:' + height + ' !important; ');

    } else if (type === 'label') {
        var attr = $(element).find('.js-bdr').attr('style');
        $(element).find('.js-bdr').attr('style', attr + ' height:' + height + ' !important; ');

    } else if (type === 'numberbox') {
        var attr = $(element).find('input.ui-input-text').attr('style');
        $(element).find('input.ui-input-text').attr('style', attr + ' height:' + height + ' !important; ');

    } else if (type === 'radio') {
        var attr = $(element).find('.js-cmpo-radio').attr('style');
        $(element).find('.js-cmpo-radio').attr('style', attr + ' height:' + height + ' !important; ');

    } else if (type === 'slider') {
        var attr = $(element).find('.js-comp-slider .ui-input-text').attr('style');
        $(element).find('.js-comp-slider .ui-input-text').attr('style', attr + ' height:' + height + ' !important; ');

    } else if (type === 'textarea') {
        var attr = $(element).find('.js-comp-textarea .ui-input-text').attr('style');
        $(element).find('.js-comp-textarea .ui-input-text').attr('style', attr + ' height:' + height + ' !important; max-height:' + height + ' !important; ');

    } else if (type === 'textbox') {
        var attr = $(element).find('.ui-input-text').attr('style');
        $(element).find('.ui-input-text').attr('style', attr + ' height:' + height + ' !important; ');

    } else if (type === 'timepicker') {
        var attr = $(element).find('.timepicker').attr('style');
        $(element).find('.timepicker').attr('style', attr + ' height:' + height + ' !important; ');

    } else if (type === 'togglebutton') {
        var attr = $(element).attr('style');
        $(element).attr('style', attr + ' height:' + height + ' !important; ');

    } else if (type === 'calendar') {
        var attr = $(element).find('.calendars-month table').attr('style');
        $(element).find('.calendars-month table').attr('style', ' height:' + height + ' !important; ');

    } else if (type === 'chart') {
        var attr = $(element).find('.js-comp-chart table').attr('style');
        $(element).find('.js-comp-chart table').attr('style', attr + ' height:' + height + ' !important; ').attr('height', height);

    } else if (type === 'datatag') {
        var attr = $(element).attr('style');
        $(element).attr('style', attr + ' height:' + height + ' !important; ');

    } else if (type === 'grid') {
        var attr = $(element).find('.gridContainer').attr('style');
        $(element).find('.gridContainer').attr('style', attr + ' height:' + height + ' !important; ');

    } else if (type === 'map') {
        var attr = $(element).attr('style');
        $(element).attr('style', attr + ' height:' + height + ' !important; ');

    } else if (type === 'pivot') {
        var attr = $(element).find('.js-comp-pivot').find('ul.ui-listview:eq(1)').attr('style');
        $(element).find('.js-comp-pivot').find('ul.ui-listview:eq(1)').attr('style', attr + '; height:' + height + ' !important; ');


    } else if (type === 'progressbar') {
        var attr = $(element).find('.progressbar').attr('style');
        $(element).find('.progressbar').attr('style', attr + ' height:' + height + ' !important; ');

    } else if (type === 'rssfeed') {
        var attr = $(element).attr('style');
        $(element).attr('style', attr + ' height:' + height + ' !important; ');

    } else if (type === 'report') {
        var attr = $(element).attr('style');
        $(element).attr('style', attr + ' height:' + height + ' !important; ');

    } else if (type === 'social') {
        var attr = $(element).find('.js-comp-social').attr('style');
        $(element).find('.js-comp-social').attr('style', attr + ' height:' + height + ' !important; ');

    } else if (type === 'treeview') {
        var attr = $(element).attr('style');
        $(element).css('cssText', 'height:' + height + ' !important;');

    } else if (type === 'accordion') {
        var attr = $(element).find('.container-row').find('.collapsible-content').attr('style');

        $(element).find('.container-row').find('.collapsible-content').attr('style', attr + ' height:' + height + ' !important; ');
        //$(element).find('.container-row').find('.collapsible-content').css('cssText','height:'+height+' !important;')

    } else if (type === 'collapsible') {
        var attr = $(element).attr('style');
        $(element).attr('style', attr + ' height:' + height + ' !important; ');

    } else if (type === 'tabs') {
        var attr = $(element).find('.tab-content').attr('style');
        $(element).find('.tab-content').attr('style', attr + ' height:' + height + ' !important; ');

    }
}
fsi.prototype.width = function (controlName, width, unit) {
    var element = $('div[data-control-id=' + controlName + ']');
    var type = element.data('controlType');
    $(element).css('width', width + unit, '!important');
}
fsi.prototype.backColor = function (controlName, backColor) {
    var element = $('div[data-control-id=' + controlName + ']');
    var type = element.data('controlType');
    if (type === 'combo') {
        $(element).find('.ui-btn').css('background-color', backColor, '!important');

    } else if (type === 'datalist') {
        $(element).find('.ui-listview').css('background-color', backColor, '!important');

    } else if (type === 'datepicker') {
        $(element).find('input.datepicker').css('background-color', backColor, '!important');

    } else if (type === 'numberbox') {
        $(element).find('input.ui-input-text').css('background-color', backColor, '!important');

    } else if (type === 'radio') {
        $(element).css('background-color', backColor, '!important');

    } else if (type === 'slider') {
        $(element).find('.js-comp-slider').css('background-color', backColor, '!important');

    } else if (type === 'textarea') {
        $(element).find('textarea').css('background-color', backColor, '!important');

    } else if (type === 'textbox') {
        $(element).find('input[type=text]').css('background-color', backColor, '!important');

    } else if (type === 'timepicker') {
        $(element).find('input.timepicker').css('background-color', backColor, '!important');
    } else if (type === 'pivot') {
        alert('pivot');
        $(element).css('background-color', backColor, '!important');
    } else if (type === 'treeview') {
        alert('tree');
        $(element).css('background-color', backColor, '!important');
    }





}
fsi.prototype.alternate = function (controlName, backColor, fontColor, fontSize, fontFamily, fontStyle, fontWeight) {
    var element = $('div[data-control-id=' + controlName + ']');
    var type = element.data('controlType');
    if (type === 'grid') {

        $(element).find('table tr.odd').css('background-color', backColor, '!important');
        $(element).find('table tr.odd').css('color', fontColor, '!important');
        $(element).find('table tr.odd').css('font-size', fontSize, '!important');
        $(element).find('table tr.odd').css('font-family', fontFamily, '!important');
        $(element).find('table tr.odd').css('font-style', fontStyle, '!important');
        $(element).find('table tr.odd').css('font-weight', fontWeight, '!important');



    } else if (type === 'datalist') {
        $(element).find('.ui-listview').css('background-color', backColor, '!important');

    } else if (type === 'datepicker') {
        $(element).find('input.datepicker').css('background-color', backColor, '!important');

    } else if (type === 'numberbox') {
        $(element).find('input.ui-input-text').css('background-color', backColor, '!important');

    } else if (type === 'radio') {
        $(element).css('background-color', backColor, '!important');

    } else if (type === 'slider') {
        $(element).find('.js-comp-slider').css('background-color', backColor, '!important');

    } else if (type === 'textarea') {
        $(element).find('textarea').css('background-color', backColor, '!important');

    } else if (type === 'textbox') {
        $(element).find('input[type=text]').css('background-color', backColor, '!important');

    } else if (type === 'timepicker') {
        $(element).find('input.timepicker').css('background-color', backColor, '!important');
    } else if (type === 'pivot') {
        alert('pivot');
        $(element).css('background-color', backColor, '!important');
    } else if (type === 'treeview') {
        alert('tree');
        $(element).css('background-color', backColor, '!important');
    }





}
fsi.prototype.text = function (controlName, Text) {
    var element = $('div[data-control-id=' + controlName + ']');
    var type = element.data('controlType');
    if (type = 'button') {
        $(element).find('span.ui-btn-text').text(Text);
    }
    else if (type === 'checkbox') {
        $(element).find('span.ui-btn-text').text(Text);

    }
}
fsi.prototype.textAlign = function (controlName, textAlign) {
    var element = $('div[data-control-id=' + controlName + ']');
    var type = element.data('controlType');
    if (type === 'button') {
        $(element).find('.ui-btn-inner.ui-btn-corner-all').css('cssText', ' text-align:' + textAlign + ' !important');

    } else if (type === 'checkbox') {
        $(element).find(".ui-checkbox label").css('cssText', ' text-align:' + textAlign + ' !important; ');

    } else if (type === 'color') {
        $(element).find(".piker-wrapper .color-picker-input").css('cssText', ' text-align:' + textAlign + ' !important; ');

    } else if (type === 'currency') {
        $(element).find("input").css('cssText', ' text-align:' + textAlign + ' !important; ');

    } else if (type === 'datalist') {
        // var attr = $(element).attr('style');
        // $(element).attr('style', attr + ' height:' + height + ' !important; ');


    } else if (type === 'datepicker') {
        $(element).find("input.datepicker").css('text-align', textAlign, '!important; ');

    } else if (type === 'documentlinker') {
        $(element).find(".js-comp .btn-browse").css('text-align', textAlign, '!important; ');

    } else if (type === 'link') {
        $(element).css('text-align', textAlign, '!important; ');

    } else if (type === 'imagepanel') {
        //NA

    } else if (type === 'label') {
        $(element).find('.js-bdr').css('text-align', textAlign, '!important; ');

    } else if (type === 'numberbox') {
        $(element).find('label.label-reponsive').css('text-align', textAlign, '!important; ');

    } else if (type === 'radio') {
        $(element).find('.label.label-reponsive').css('text-align', textAlign, '!important; ');

    } else if (type === 'slider') {
        $(element).find('.js-comp-slider .ui-input-text').css('text-align', textAlign, '!important; ');

    } else if (type === 'textarea') {
        $(element).find('.js-comp-textarea .ui-input-text').css('text-align', textAlign, '!important; ');


    } else if (type === 'textbox') {
        $(element).find('.ui-input-text').css('text-align', textAlign, '!important; ');

    } else if (type === 'timepicker') {
        $(element).find('.timepicker').css('text-align', textAlign, '!important; ');

    } else if (type === 'togglebutton') {
        $(element).find('.onoffswitch-inner').css('text-align', textAlign, '!important; ');

    } else if (type === 'calendar') {
        //NA
    } else if (type === 'chart') {
        // NA

    } else if (type === 'datatag') {
        // NA

    } else if (type === 'grid') {
        // NA

    } else if (type === 'map') {
        // NA

    } else if (type === 'pivot') {
        // NA

    } else if (type === 'progressbar') {
        $(element).find('.progress-label').css('text-align', textAlign, '!important; ');

    } else if (type === 'rssfeed') {
        $(element).find('h2.rssfeed-header').css('text-align', textAlign, '!important; ');

    } else if (type === 'report') {
        //NA

    } else if (type === 'social') {
        // NA

    } else if (type === 'treeview') {
        // NA

    } else if (type === 'accordion') {
        // Text align for header
        $(element).find('.collapsible-content').css('text-align', textAlign, '!important; ');


    } else if (type === 'collapsible') {
        //Collapsible header
        $(element).find('.ui-btn-inner').css('text-align', textAlign, '!important; ');

    } else if (type === 'tabs') {
        //NA

    }
}
fsi.prototype.theme = function (controlName, themeName) {
    var element = $('div[data-control-id=' + controlName + ']');
    var type = $(element).data('controlType');
    //var dataTheme = $(element).attr('data-theme');


    if (type === 'button') {
        var dataTheme = $(element).find('button').data('theme');

        $(element).removeClass('ui-btn-up-' + dataTheme).addClass('ui-btn-up-' + themeName);
        $(element).attr('data-theme', themeName);
        $(element).find('.ui-btn').removeClass('ui-btn-up-' + dataTheme).addClass('ui-btn-up-' + themeName);
        $(element).find('.ui-btn').attr('data-theme', themeName);



    } else if (type === 'checkbox') {
        var dataTheme = $(element).find('label').data('theme');
        $(element).find(".ui-checkbox label").removeClass('ui-btn-up-' + dataTheme).addClass('ui-btn-up-' + themeName);

    } else if (type === 'color') {
        var dataTheme = $(element).find(".piker-wrapper").data('theme');
        $(element).find(".piker-wrapper").removeClass('ui-btn-up-' + dataTheme).addClass('ui-btn-up-' + themeName);

    }
    else if (type === 'combo') {
        var dataTheme = $(element).find(".ui-btn").data('theme');
        $(element).find(".ui-btn").removeClass('ui-btn-up-' + dataTheme).addClass('ui-btn-up-' + themeName);

    }

    else if (type === 'currency') {
        var dataTheme = $(element).find(".ui-input-text").data('theme');
        $(element).removeClass('ui-body-' + dataTheme).addClass('ui-currency-theme-' + themeName);
        $(element).find(".ui-input-text").removeClass('ui-btn-up-' + dataTheme).addClass('ui-btn-up-' + themeName).removeClass('ui-body-' + dataTheme).addClass('ui-currency-theme-' + themeName);

    } else if (type === 'datalist') {
        var dataTheme = $(element).data('theme');
        $(element).attr('data-theme', themeName);
        $(element).find('ul.ui-listview').attr('data-theme', themeName);
        $(element).removeClass('ui-dataList-theme-' + dataTheme).addClass('ui-dataList-theme-' + themeName);
        $(element).find('span.ui-li-count').removeClass('ui-btn-up-' + dataTheme).addClass('ui-btn-up-' + themeName);


    } else if (type === 'datepicker') {
        var dataTheme = $(element).data('theme');
        $(element).attr('data-theme', 'ui-cal-' + themeName);
        $(element).find("input.datepicker").removeClass('ui-body-' + dataTheme).addClass('ui-body-' + themeName);
        $(element).find(".calendars").removeClass('ui-cal-' + dataTheme).addClass('ui-cal-' + themeName);

    } else if (type === 'documentlinker') {
        var dataTheme = $(element).find(".js-comp").data('theme');
        $(element).removeClass('ui-body-gen-' + dataTheme).addClass('ui-body-gen-' + themeName);
        $(element).find(".js-comp").removeClass('ui-btn-up-' + dataTheme).addClass('ui-btn-up-' + themeName).attr('data-theme', themeName);


    } else if (type === 'link') {
        var dataTheme = $(element).find('a').data('theme');
        $(element).find('a').removeClass('ui-link-theme-' + dataTheme).addClass('ui-link-theme-' + themeName).attr('data-theme', themeName);

    } /*else if (type === 'imagepanel') {
       var dataTheme = $(element).find('a').data('theme');
        $(element).find('.image-panel-container').attr('style', attr + ' height:' + height + ' !important; ');

   }*/ else if (type === 'label') {
       var dataTheme = $(element).find('label').data('theme');
       $(element).find('label').removeClass('ui-label-theme-' + dataTheme).addClass('ui-label-theme-' + themeName).attr('data-theme', themeName);
   } else if (type === 'numberbox') {
       var dataTheme = $(element).find('input.ui-input-text').data('theme');
       $(element).find("input.ui-input-text").removeClass('ui-body-' + dataTheme).addClass('ui-body-' + themeName).attr('data-theme', themeName);


   } else if (type === 'radio') {
       var dataTheme = $(element).find('.js-cmpo-radio').data('theme');
       $(element).find(".js-cmpo-radio").removeClass('ui-btn-up-' + dataTheme).addClass('ui-btn-up-' + themeName).attr('data-theme', themeName);

   } else if (type === 'slider') {
       var dataTheme = $(element).data('theme');

       $(element).removeClass('slider-control-theme-' + dataTheme).addClass('slider-control-theme-' + themeName).attr('data-theme', themeName);
       $(element).find(".ui-input-text").removeClass('ui-body-' + dataTheme).addClass('ui-body-' + themeName);
       $(element).find(".ui-slider").removeClass('ui-btn-down-' + dataTheme).addClass('ui-btn-down-' + themeName);
       $(element).find(".ui-slider-handle").removeClass('ui-btn-up-' + dataTheme).addClass('ui-btn-up-' + themeName).attr('data-theme', themeName);

   } else if (type === 'textarea') {
       var dataTheme = $(element).find('textarea').data('theme');
       $(element).find('textarea').removeClass('ui-body-' + dataTheme).addClass('ui-body-' + themeName).attr('data-theme', themeName);

   } else if (type === 'textbox') {
       var dataTheme = $(element).find('.ui-input-text').data('theme');
       $(element).find('.ui-input-text').removeClass('ui-body-' + dataTheme).addClass('ui-body-' + themeName).attr('data-theme', themeName);

   } else if (type === 'timepicker') {
       var dataTheme = $(element).find('.timepicker').data('theme');
       $(element).find('.timepicker').removeClass('ui-body-' + dataTheme).addClass('ui-body-' + themeName).attr('data-theme', themeName);

   } else if (type === 'togglebutton') {
       var dataTheme = $(element).data('theme');
       $(element).attr('data-theme', themeName);
       $(element).find('.onoffswitch-label').removeClass('ui-btn-up-' + dataTheme).addClass('ui-btn-up-' + themeName).attr('data-theme', themeName);

   } else if (type === 'calendar') {

       var dataTheme = $(element).data('theme');
       $(element).removeClass('ui-cal-' + dataTheme).addClass('ui-cal-' + themeName).attr('data-theme', themeName);

   } /*else if (type === 'chart') {
        var dataTheme = $(element).data('theme');
        $(element).removeClass('ui-cal-' + dataTheme).addClass('ui-cal-' + themeName).attr('data-theme', themeName);

    }*/ else if (type === 'datatag') {
        var dataTheme = $(element).data('theme');
        $(element).removeClass('ui-datatag-theme-' + dataTheme).addClass('ui-datatag-theme-' + themeName).attr('data-theme', themeName);
    }
    else if (type === 'grid') {

        var dataTheme = $(element).data('theme');
        $(element).removeClass('ui-bar-' + dataTheme).addClass('ui-bar-' + themeName).attr('data-theme', themeName);
        $(element).find('.ui-btn').removeClass('ui-btn-up-' + dataTheme).addClass('ui-btn-up-' + themeName).attr('data-theme', themeName);

    } else if (type === 'map') {
        var dataTheme = $(element).data('theme');
        $(element).removeClass('ui-map-theme-' + dataTheme).addClass('ui-map-theme-' + themeName).attr('data-theme', themeName);
    } else if (type === 'pivot') {
        var dataTheme = $(element).data('theme');
        $(element).removeClass('ui-pivot-' + dataTheme).addClass('ui-pivot-' + themeName).attr('data-theme', themeName);
        $(element).find('ul.ui-listview').attr('data-theme', themeName);
        $(element).find('.ui-btn').removeClass('ui-btn-up-' + dataTheme).addClass('ui-btn-up-' + themeName);

    } else if (type === 'progressbar') {
        var dataTheme = $(element).data('theme');
        $(element).removeClass('ui-progressbar-theme-' + dataTheme).addClass('ui-progressbar-theme-' + themeName).attr('data-theme', themeName);
        $(element).find('.progressbar').removeClass('ui-progressbar-theme-' + dataTheme).addClass('ui-progressbar-theme-' + themeName).attr('data-theme', themeName);
    } else if (type === 'rssfeed') {
        var dataTheme = $(element).data('theme');
        $(element).removeClass('ui-rss-theme-' + dataTheme).addClass('ui-rss-theme-' + themeName).attr('data-theme', themeName);

    } else if (type === 'report') {

        var dataTheme = $(element).data('theme');
        $(element).removeClass('ui-report-theme-' + dataTheme).addClass('ui-report-theme-' + themeName).attr('data-theme', themeName);

    } else if (type === 'social') {
        var dataTheme = $(element).data('theme');
        $(element).removeClass('ui-social-' + dataTheme).addClass('ui-social-' + themeName).attr('data-theme', themeName);

    } else if (type === 'treeview') {
        var dataTheme = $(element).data('theme');
        $(element).removeClass('ui-bar-' + dataTheme).addClass('ui-bar-' + themeName).attr('data-theme', themeName);

    } else if (type === 'accordion') {
        var dataTheme = $(element).data('theme');
        $(element).removeClass('ui-accordion-theme-' + dataTheme).addClass('ui-accordion-theme-' + themeName).attr('data-theme', themeName);
        $(element).removeClass('ui-accordion-theme-' + dataTheme).addClass('ui-accordion-theme-' + themeName);


    } else if (type === 'collapsible') {
        var dataTheme = $(element).data('theme');
        $(element).removeClass('ui-clpsable-theme-' + dataTheme).addClass('ui-clpsable-theme-' + themeName).attr('data-theme', themeName);

    } else if (type === 'tabs') {
        var dataTheme = $(element).data('theme');
        $(element).removeClass('ui-tabs-' + dataTheme).addClass('ui-tabs-' + themeName).attr('data-theme', themeName);
        $(element).find('.tab-content').removeClass('ui-body-' + dataTheme).addClass('ui-body-' + themeName);
        $(element).find('.ui-btn-inner').removeClass('ui-btn-tab-' + dataTheme).addClass('ui-btn-tab-' + themeName);



    }


}
fsi.prototype.transparent = function (controlName, isTransparent) {
    var element = $('div[data-control-id=' + controlName + ']');
    var type = element.data('controlType');
    if (type === 'button') {

        $(element).attr('data-hidden', isTransparent);

    }
}
/*fsi.prototype.verticalAlign = function (controlName, verticalAlign)
{
    var element = $('div[data-control-id=' + controlName + ']');
    var type = element.data('controlType');
    if (type = 'button')
    {
        element.text(text);
    } else if (type = 'checkbox')
    {

    }
    else if (type = 'checkbox')
    {

    }
}*/

fsi.prototype.verticalAlign = function (controlName, verticalAlign) {
    var element = $('div[data-control-id=' + controlName + ']');
    var type = element.data('controlType');
    if (type === 'button') {

        $(element).css('vertical-align', verticalAlign, '!important; ');

    }
}
fsi.prototype.boxShadow = function (controlName, blurRadius, color, h_Length, v_Length, spread) {
    var element = $('div[data-control-id=' + controlName + ']');
    var type = element.data('controlType');
    if (type === 'button') {
        $(element).css('box-shadow', h_Length + ' ' + v_Length + ' ' + blurRadius + ' ' + spread + ' ' + color, ' !important');
    } else if (type === 'checkbox') {
        $(element).css('box-shadow', h_Length + ' ' + v_Length + ' ' + blurRadius + ' ' + spread + ' ' + color, ' !important');

    } else if (type === 'color') {
        $(element).css('box-shadow', h_Length + ' ' + v_Length + ' ' + blurRadius + ' ' + spread + ' ' + color, ' !important');

    }
    else if (type === 'combo') {
        $(element).css('box-shadow', h_Length + ' ' + v_Length + ' ' + blurRadius + ' ' + spread + ' ' + color, ' !important');

    } else if (type === 'currency') {
        $(element).css('box-shadow', h_Length + ' ' + v_Length + ' ' + blurRadius + ' ' + spread + ' ' + color, ' !important');

    } else if (type === 'datalist') {
        $(element).css('box-shadow', h_Length + ' ' + v_Length + ' ' + blurRadius + ' ' + spread + ' ' + color, ' !important');

    } else if (type === 'datepicker') {
        $(element).css('box-shadow', h_Length + ' ' + v_Length + ' ' + blurRadius + ' ' + spread + ' ' + color, ' !important');
    } else if (type === 'documentlinker') {
        $(element).css('box-shadow', h_Length + ' ' + v_Length + ' ' + blurRadius + ' ' + spread + ' ' + color, ' !important');

    } else if (type === 'link') {
        $(element).css('box-shadow', h_Length + ' ' + v_Length + ' ' + blurRadius + ' ' + spread + ' ' + color, ' !important');

    } else if (type === 'imagepanel') {
        $(element).css('box-shadow', h_Length + ' ' + v_Length + ' ' + blurRadius + ' ' + spread + ' ' + color, ' !important');

    } else if (type === 'label') {
        //$(element).css('box-shadow', h_Length + ' ' + v_Length + ' ' + blurRadius + ' ' + spread + ' ' + color, ' !important');

    } else if (type === 'numberbox') {
        $(element).css('box-shadow', h_Length + ' ' + v_Length + ' ' + blurRadius + ' ' + spread + ' ' + color, ' !important');

    } else if (type === 'radio') {
        $(element).css('box-shadow', h_Length + ' ' + v_Length + ' ' + blurRadius + ' ' + spread + ' ' + color, ' !important');

    } else if (type === 'slider') {
        $(element).css('box-shadow', h_Length + ' ' + v_Length + ' ' + blurRadius + ' ' + spread + ' ' + color, ' !important');

    } else if (type === 'textarea') {
        $(element).css('box-shadow', h_Length + ' ' + v_Length + ' ' + blurRadius + ' ' + spread + ' ' + color, ' !important');

    } else if (type === 'textbox') {
        $(element).css('box-shadow', h_Length + ' ' + v_Length + ' ' + blurRadius + ' ' + spread + ' ' + color, ' !important');

    } else if (type === 'timepicker') {
        $(element).css('box-shadow', h_Length + ' ' + v_Length + ' ' + blurRadius + ' ' + spread + ' ' + color, ' !important');

    } else if (type === 'togglebutton') {
        $(element).css('box-shadow', h_Length + ' ' + v_Length + ' ' + blurRadius + ' ' + spread + ' ' + color, ' !important');

    } else if (type === 'calendar') {
        $(element).closest('.cal-parent').css('box-shadow', h_Length + ' ' + v_Length + ' ' + blurRadius + ' ' + spread + ' ' + color, ' !important');

    } else if (type === 'chart') {
        $(element).css('box-shadow', h_Length + ' ' + v_Length + ' ' + blurRadius + ' ' + spread + ' ' + color, ' !important');

    } else if (type === 'datatag') {
        $(element).css('box-shadow', h_Length + ' ' + v_Length + ' ' + blurRadius + ' ' + spread + ' ' + color, ' !important');

    } else if (type === 'grid') {
        $(element).css('box-shadow', h_Length + ' ' + v_Length + ' ' + blurRadius + ' ' + spread + ' ' + color, ' !important');

    } else if (type === 'map') {
        $(element).css('box-shadow', h_Length + ' ' + v_Length + ' ' + blurRadius + ' ' + spread + ' ' + color, ' !important');

    } else if (type === 'pivot') {
        $(element).css('box-shadow', h_Length + ' ' + v_Length + ' ' + blurRadius + ' ' + spread + ' ' + color, ' !important');


    } else if (type === 'progressbar') {
        $(element).css('box-shadow', h_Length + ' ' + v_Length + ' ' + blurRadius + ' ' + spread + ' ' + color, ' !important');

    } else if (type === 'rssfeed') {
        $(element).css('box-shadow', h_Length + ' ' + v_Length + ' ' + blurRadius + ' ' + spread + ' ' + color, ' !important');

    } else if (type === 'report') {
        $(element).css('box-shadow', h_Length + ' ' + v_Length + ' ' + blurRadius + ' ' + spread + ' ' + color, ' !important');

    } else if (type === 'social') {
        $(element).css('box-shadow', h_Length + ' ' + v_Length + ' ' + blurRadius + ' ' + spread + ' ' + color, ' !important');

    } else if (type === 'treeview') {
        $(element).css('box-shadow', h_Length + ' ' + v_Length + ' ' + blurRadius + ' ' + spread + ' ' + color, ' !important');

    } else if (type === 'accordion') {
        $(element).css('box-shadow', h_Length + ' ' + v_Length + ' ' + blurRadius + ' ' + spread + ' ' + color, ' !important');

    } else if (type === 'collapsible') {
        $(element).css('box-shadow', h_Length + ' ' + v_Length + ' ' + blurRadius + ' ' + spread + ' ' + color, ' !important');

    } else if (type === 'container') {
        $(element).css('box-shadow', h_Length + ' ' + v_Length + ' ' + blurRadius + ' ' + spread + ' ' + color, ' !important');

    }
    else if (type === 'tabs') {
        $(element).css('box-shadow', h_Length + ' ' + v_Length + ' ' + blurRadius + ' ' + spread + ' ' + color, ' !important');

    }
}
fsi.prototype.upState = function (controlName, color, position_X, position_Y, size) {
    var element = $('div[data-control-id=' + controlName + ']');
    var type = element.data('controlType');
    if (type = 'button') {
        element.text(text);
    } else if (type = 'checkbox') {

    }
    else if (type = 'checkbox') {

    }
}
fsi.prototype.downState = function (controlName, color, position_X, position_Y, size) {
    var element = $('div[data-control-id=' + controlName + ']');
    var type = element.data('controlType');
    if (type = 'button') {
        element.text(text);
    } else if (type = 'checkbox') {

    }
    else if (type = 'checkbox') {

    }
}
fsi.prototype.hoverState = function (controlName, color, position_X, position_Y, size) {
    var element = $('div[data-control-id=' + controlName + ']');
    var type = element.data('controlType');
    if (type = 'button') {
        element.text(text);
    } else if (type = 'checkbox') {

    }
    else if (type = 'checkbox') {

    }
}
fsi.prototype.checkboxOnState = function (controlName, color, position_X, position_Y, size) {
    var element = $('div[data-control-id=' + controlName + ']');
    var type = element.data('controlType');

    if (type === 'checkbox') {


        $(element).find('.ui-btn').css('background-color', color, ' !important');
        $(element).find('.ui-btn').css('background-image', '', ' !important');
        $(element).find('.ui-btn').css('background-position', position_X + ' ' + position_Y, ' !important');

        if (size === "fill") {
            $(element).find('.ui-btn').css('background-size', 'cover', ' !important');
        }
        else if (size.toLowerCase() === "tile") {
            $(element).find('.ui-btn').css('background-repeat', 'repeat', ' !important');
        }
        else if (size.toLowerCase() === "stretch") {
            $(element).find('.ui-btn').css('background-size', '100% 100%', ' !important');
        }
        else if (size.toLowerCase() === "original") {
            $(element).find('.ui-btn').css('background-repeat', 'no-repeat', ' !important');
        }
        if (size.toLowerCase() === 'fit') {
            $(element).find('.ui-btn').css('background-size', 'contain', ' !important');
        }

    }
}
fsi.prototype.checkboxOffState = function (controlName, color, position_X, position_Y, size) {
    if (type === 'checkbox') {


        $(element).find('.ui-btn').css('background-color', color, ' !important');
        $(element).find('.ui-btn').css('background-image', '', ' !important');
        $(element).find('.ui-btn').css('background-position', position_X + ' ' + position_Y, ' !important');

        if (size === "fill") {
            $(element).find('.ui-btn').css('background-size', 'cover', ' !important');
        }
        else if (size.toLowerCase() === "tile") {
            $(element).find('.ui-btn').css('background-repeat', 'repeat', ' !important');
        }
        else if (size.toLowerCase() === "stretch") {
            $(element).find('.ui-btn').css('background-size', '100% 100%', ' !important');
        }
        else if (size.toLowerCase() === "original") {
            $(element).find('.ui-btn').css('background-repeat', 'no-repeat', ' !important');
        }
        if (size.toLowerCase() === 'fit') {
            $(element).find('.ui-btn').css('background-size', 'contain', ' !important');
        }

    }
}
fsi.prototype.padding = function (controlName, top, right, bottom, left) {
    var element = $('div[data-control-id=' + controlName + ']');
    var type = element.data('controlType');

    if (type === 'button') {
        $(element).find('span.ui-btn-inner').css('padding', top + ' ' + right + ' ' + bottom + ' ' + left, ' !important');

    }
}
fsi.prototype.dataColumn = function (controlName, dataColumn) {
    var element = $('div[data-control-id=' + controlName + ']');
    $(element).attr('data-object-column', dataColumn);
}
fsi.prototype.checkBoxStatus = function (controlName, isStatus) {
    var element = $('div[data-control-id=' + controlName + ']');
    $(element).attr('data-object-column', dataColumn);
}
fsi.prototype.decimalPlaces = function (controlName, decimalValue) {
    var element = $('div[data-control-id=' + controlName + ']');
    var type = element.data('controlType');
    if (type = 'currency') {
        $(element).attr('data-decimalplaces', decimalValue);
    }
    else if (type = 'checkbox') {

    };
}
fsi.prototype.Placeholder = function (controlName, placeholderText) {
    var element = $('div[data-control-id=' + controlName + ']');
    $(element).find('input[type=text]').attr('placeholder', placeholderText);
}
fsi.prototype.required = function (controlName, isRequired, requiredMessage) {
    var element = $('div[data-control-id=' + controlName + ']');
    var type = element.data('controlType');
    if (type = 'checkbox') {
        $(element).find('input[type=checkbox]').attr('required');
        $(element).find('div[class=error-message]').html(requiredMessage);
    }
    else if (type = 'checkbox') {

    };
}
fsi.prototype.currency = function (controlName, baseCurrency, conversionCurrency) {
    var element = $('div[data-control-id=' + controlName + ']');
    var type = element.data('controlType');
    if (type = 'currency') {
        $(element).find('input[type=text]').attr('data-base-currency', baseCurrency);
        $(element).find('input[type=text]').attr('data-conversion-currency', conversionCurrency);
    }
}
fsi.prototype.rowCount = function (controlName, isRowCount) {
    var element = $('div[data-control-id=' + controlName + ']');
    var type = element.data('controlType');
    if (type = 'datalist') {
        if (isRowCount === 'true' || isRowCount === true || isRowCount === 'show') {
            $(element).find('ul').find('header').find('.ui-li-count').css('display', 'block');
        } else {
            $(element).find('ul').find('header').find('.ui-li-count').css('display', 'none');
        }
    }
}
fsi.prototype.controlLable = function (controlName, defaultValue, backColor, fontColor, fontFamily, fontSize, fontStyle, fontWeight) {
    var element = $('div[data-control-id=' + controlName + ']');
    var type = element.data('controlType');
    defaultValue = defaultValue !== undefined ? defaultValue : '';
    backColor = backColor !== undefined ? backColor : '';
    fontColor = fontColor !== undefined ? fontColor : '';
    fontFamily = fontFamily !== undefined ? fontFamily : '';
    fontSize = fontSize !== undefined ? fontSize : '';
    fontStyle = fontStyle !== undefined ? fontStyle : '';
    fontWeight = fontWeight !== undefined ? fontWeight : '';
    if (type = 'button') {
        $(element).CSS('font', style + ' ' + width + ' ' + family);
    } else if (type = 'checkbox') {

    }
    else if (type = 'checkbox') {

    }
}
fsi.prototype.comboDefaultText = function (controlName, showDefaultOption) {
    var element = $('div[data-control-id=' + controlName + ']');
    var type = element.data('controlType');
    if (type = 'datalist') {
        if (isRowCount === 'true' || isRowCount === true || isRowCount === 'show') {
            $(element).find('ul').find('header').find('.ui-li-count').css('display', 'block');
        } else {
            $(element).find('ul').find('header').find('.ui-li-count').css('display', 'none');
        }
    }
}
fsi.prototype.label = function (controlName, backColor, defValue, fontColor, fontFamily, fontSize, fontStyle, fontWeight) {
    var element = $('div[data-control-id=' + controlName + ']');
    var type = element.data('controlType');
    if (type === 'combo') {
        $(element).find('.label-reponsive').css('font-family', fontFamily, ' !important');
        $(element).find('.label-reponsive').css('background-color', backColor, ' !important');
        $(element).find('.label-reponsive').css('color', fontColor, ' !important');
        $(element).find('.label-reponsive').css('font-size', fontSize, ' !important');
        $(element).find('.label-reponsive').css('font-style', fontStyle, ' !important');
        $(element).find('.label-reponsive').css('font-weight', fontWeight, ' !important');
        $(element).find('.label-reponsive').text(defValue);
    } else if (type === 'datepicker') {
        $(element).find('.label-reponsive').css('font-family', fontFamily, ' !important');
        $(element).find('.label-reponsive').css('background-color', backColor, ' !important');
        $(element).find('.label-reponsive').css('color', fontColor, ' !important');
        $(element).find('.label-reponsive').css('font-size', fontSize, ' !important');
        $(element).find('.label-reponsive').css('font-style', fontStyle, ' !important');
        $(element).find('.label-reponsive').css('font-weight', fontWeight, ' !important');
        $(element).find('.label-reponsive').text(defValue);
    } else if (type === 'numberbox') {
        $(element).find('.label-reponsive').css('font-family', fontFamily, ' !important');
        $(element).find('.label-reponsive').css('background-color', backColor, ' !important');
        $(element).find('.label-reponsive').css('color', fontColor, ' !important');
        $(element).find('.label-reponsive').css('font-size', fontSize, ' !important');
        $(element).find('.label-reponsive').css('font-style', fontStyle, ' !important');
        $(element).find('.label-reponsive').css('font-weight', fontWeight, ' !important');
        $(element).find('.label-reponsive').text(defValue);
    } else if (type === 'radio') {
        $(element).find('.label-reponsive').css('font-family', fontFamily, ' !important');
        $(element).find('.label-reponsive').css('background-color', backColor, ' !important');
        $(element).find('.label-reponsive').css('color', fontColor, ' !important');
        $(element).find('.label-reponsive').css('font-size', fontSize, ' !important');
        $(element).find('.label-reponsive').css('font-style', fontStyle, ' !important');
        $(element).find('.label-reponsive').css('font-weight', fontWeight, ' !important');
        $(element).find('.label-reponsive').text(defValue);
    } else if (type === 'textarea') {
        $(element).find('.label-reponsive').css('font-family', fontFamily, ' !important');
        $(element).find('.label-reponsive').css('background-color', backColor, ' !important');
        $(element).find('.label-reponsive').css('color', fontColor, ' !important');
        $(element).find('.label-reponsive').css('font-size', fontSize, ' !important');
        $(element).find('.label-reponsive').css('font-style', fontStyle, ' !important');
        $(element).find('.label-reponsive').css('font-weight', fontWeight, ' !important');
        $(element).find('.label-reponsive').text(defValue);
    } else if (type === 'timepicker') {
        $(element).prev('div').find('label').css('font-family', fontFamily, ' !important');
        $(element).prev('div').find('label').css('background-color', backColor, ' !important');
        $(element).prev('div').find('label').css('color', fontColor, ' !important');
        $(element).prev('div').find('label').css('font-size', fontSize, ' !important');
        $(element).prev('div').find('label').css('font-style', fontStyle, ' !important');
        $(element).prev('div').find('label').css('font-weight', fontWeight, ' !important');
        $(element).prev('div').find('label').text(defValue);
    }



}
fsi.prototype.clearImagePanel = function (controlName) {
    var element = $('div[data-control-id=' + controlName + ']');
    $(element).attr('data-image-content', '')
    $(element).find('#ui-imagepanel-' + controlName).css('background-image', 'none');
    $(element).find('input[type=hidden]').val('');
}

fsi.prototype.validateImageFile = function (controlName) {
    var element = $('div[data-control-id=' + controlName + ']');
    var validExtensions = ['.jpg', '.jpeg', '.gif', '.png', '.x-png'];
    $.fn.hasExtension = function (exts) {
        return (new RegExp('(' + exts.join('|').replace(/\./g, '\\.') + ')$')).test($(this).val());
    }
    if ($(element).find('input[type=file]').hasExtension(validExtensions)) {
        return true;
    } else {
        return false;
    }
}

fsi.prototype.validateDocumentFile = function (controlName) {
    var element = $('div[data-control-id=' + controlName + ']');
    var validExtensions = ['jpg', 'jpeg', 'gif', 'doc', 'docx', 'pdf', 'png', 'txt', 'xls', 'xlsx'];
    $.fn.hasExtension = function (exts) {
        return (new RegExp('(' + exts.join('|').replace(/\./g, '\\.') + ')$')).test($(this).val());
    }
    if ($(element).find('input[type=file]').hasExtension(validExtensions)) {
        return true;
    } else {
        return false;
    }
}

fsi.prototype.window = function () {
    var win = $(window);
    return win;
}

fsi.prototype.document = function () {
    var doc = $(document);
    return doc;
}

fsi.prototype.deleteDataObject = function (dataObject, rowId, successCallBack, errorCallBack) {

    if (dataObject !== null && dataObject !== undefined && dataObject !== '' && rowId !== null && rowId !== undefined && rowId !== '') {
        var currentJSON = {
            dataObject: dataObject,
            rowId: rowId
        };

        var regex = /\/Web.*/i;
        var tenantUrl = window.location.href.replace(regex, '');
        var myurl = tenantUrl + '/DataObject/DeleteRow';

        $.ajax({
            cache: false,
            url: myurl,
            data: currentJSON,
            type: 'POST',
            success: successCallBack,
            error: errorCallBack
        });
    }
}

fsi.prototype.createDataObject = function (dataObject, inputParams, successCallBack, errorCallBack) {

    if (dataObject !== null && dataObject !== undefined && dataObject !== '' && inputParams !== null && inputParams !== undefined && inputParams !== '') {
        var currentJSON = {
            dataObject: dataObject,
            inputParameter: inputParams
        };

        var regex = /\/Web.*/i;
        var tenantUrl = window.location.href.replace(regex, '');
        var myurl = tenantUrl + '/DataObject/InsertData';

        $.ajax({
            cache: false,
            url: myurl,
            data: currentJSON,
            type: 'POST',
            success: successCallBack,
            error: errorCallBack
        });
    }
}

fsi.prototype.updateDataObject = function (dataObject, inputParams, successCallBack, errorCallBack) {

    if (dataObject !== null && dataObject !== undefined && dataObject !== '' && inputParams !== null && inputParams !== undefined && inputParams !== '') {
        var currentJSON = {
            dataObject: dataObject,
            inputParameter: inputParams
        };

        var regex = /\/Web.*/i;
        var tenantUrl = window.location.href.replace(regex, '');
        var myurl = tenantUrl + '/DataObject/InsertData';

        $.ajax({
            cache: false,
            url: myurl,
            data: currentJSON,
            type: 'POST',
            success: successCallBack,
            error: errorCallBack
        });
    }
}

/// <summary>
/// page parameter
/// </summary>
/// <param name="key" type="type">key</param>
/// <param name="value" type="type">value</param>
fsi.prototype.globalVariable = function (key, value) {
    try {
        var currentDate = new Date();
        var existingVariables = JSON.parse(localStorage.getItem("globalVariable"));
        if (existingVariables === null) {
            existingVariables = [];
        }
        if (key !== undefined && value !== undefined) {
            var expireTime = Math.round((currentDate.setSeconds(currentDate.getSeconds() + 60 * 20)) / 1000);
            parameters.key = key.toUpperCase();
            parameters.value = value;
            parameters.expire = expireTime;
            var isExists = false;
            $.each(existingVariables, function (i) {
                if (existingVariables[i].key === key.toUpperCase() && key !== '') {
                    existingVariables[i].value = value;
                    existingVariables[i].expire = expireTime;
                    isExists = true;
                    return isExists;
                }
            })
            if (!isExists && key !== '') {
                existingVariables.push(parameters);
            }
            localStorage.setItem('globalVariable', JSON.stringify(existingVariables));
        }
        else if (key !== undefined && value === undefined) {
            for (var i = 0; i < existingVariables.length; i++) {
                if (existingVariables[i].key.toUpperCase() === key.toUpperCase()) {
                    var currentTime = Math.round((currentDate.setSeconds(currentDate.getSeconds())) / 1000);
                    if (currentTime < existingVariables[i].expire) {
                        return existingVariables[i].value;
                    }
                }
            }
        }
    }
    catch (ex) {
        console.log(ex);
        return;
    }
}

//--------------------- End Api Function ---------------------

var fsi = new fsi();
var fsiPrivate = new fsiPrivate();
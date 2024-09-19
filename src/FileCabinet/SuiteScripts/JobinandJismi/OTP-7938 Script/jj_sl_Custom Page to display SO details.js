/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/email', 'N/file', 'N/format', 'N/record', 'N/search', 'N/ui/serverWidget', 'N/runtime', 'N/xml', 'N/encode'],
    /**
 * @param{email} email
 * @param{file} file
 * @param{format} format
 * @param{record} record
 * @param{search} search
 * @param{serverWidget} serverWidget
 */
    (email, file, format, record, search, serverWidget, runtime, xml, encode) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        function getEmployeeName(internalId) {
            try {
                let employeeRecord = record.load({
                    type: record.Type.EMPLOYEE,
                    id: internalId
                });
                let employeeName = employeeRecord.getValue({ fieldId: 'entityid' });
                return employeeName;
            } catch (e) {
                log.error('Error', e.message);
                return null;
            }
        }
        function getCustomerName(internalId) {
            try {
                let customerRecord = record.load({
                    type: record.Type.CUSTOMER,
                    id: internalId
                });
                let customerName = customerRecord.getValue({ fieldId: 'companyname' });
                return customerName;
            } catch (e) {
                log.error('Error', e.message);
                return null;
            }
        }
        function getSalesOrderDetails(salesRepId) {
            try {
                let salesorderSearchObj = search.create({
                    type: "salesorder",
                    settings: [{ "name": "consolidationtype", "value": "ACCTTYPE" }],
                    filters:
                        [
                            ["type", "anyof", "SalesOrd"],
                            "AND",
                            ["mainline", "is", "T"],
                            "AND",
                            ["datecreated", "within", "thismonth"],
                            "AND",
                            ["salesrep", "anyof", salesRepId]
                        ],
                    columns:
                        [
                            search.createColumn({ name: "datecreated", label: "Date Created" }),
                            search.createColumn({ name: "tranid", label: "Document Number" }),
                            search.createColumn({ name: "entity", label: "Name" }),
                            search.createColumn({ name: "memo", label: "Memo" }),
                            search.createColumn({ name: "amount", label: "Amount" })
                        ]
                });
                let searchResult = salesorderSearchObj.run().getRange({ start: 0, end: 1000 });
                return searchResult;
            }
            catch (e) {
                log.debug('Error@getSalesOrderDetails', e.stack + '\n' + e.message);
            }
        }
        function createcsv(selected, repId){
            try{
                let csvContent = 'Document Number,Memo,Customer,Sales Order Amount,Reason for Delay\n';
                log.debug('length', selected.length);
                for(let i = 0; i < selected.length; i++){
                    let dn = selected[i].documentnumber;
                    let cn = selected[i].customername;
                    let m = selected[i].memo;
                    let am = selected[i].amount;
                    let re = selected[i].reason;
                    csvContent += dn + ',' + m + ',' + cn + ',' + am + ',' + re + '\n';
                }
                log.debug('CSV Content', csvContent);
                let csvFile = file.create({
                    name: 'Open Sales Orders - Sales Rep: ' + repId + '.csv',
                    fileType: file.Type.CSV,
                    contents: csvContent,
                    folder: -15,
                });
 
                let csvFileId = csvFile.save();
                return csvFileId;
            }
            catch(e){
                log.debug('Error@createcsv', e.stach + '\n' + e.message);
            }
        }
        function createExcelFile(selected, repId) {
            let xmlstring = '';
            xmlstring += '<?xml version="1.0"?>\n';
            xmlstring += '<?mso-application progid="Excel.Sheet"?>\n';
            xmlstring += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
            xmlstring += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
            xmlstring += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
            xmlstring += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ';
            xmlstring += 'xmlns:html="http://www.w3.org/TR/REC-html40">\n';
            xmlstring += '<Worksheet ss:Name="Sheet1">\n';
            xmlstring += '<Styles>\n';
            xmlstring += '<Style ss:ID="Default" ss:Name="Normal">\n';
            xmlstring += '<Alignment ss:Vertical="Bottom"/>\n';
            xmlstring += '<Font ss:FontName="Arial" ss:Size="11" ss:Color="#000000"/>\n';
            xmlstring += '</Style>\n';
            xmlstring += '<Style ss:ID="Header">\n';
            xmlstring += '<Alignment ss:Horizontal="Center" ss:Vertical="Center"/>\n';
            xmlstring += '<Font ss:Bold="1" ss:Color="#FFFFFF"/>\n';
            xmlstring += '<Interior ss:Color="#AAAAAA" ss:Pattern="Solid"/>\n';
            xmlstring += '</Style>\n';
            xmlstring += '<Style ss:ID="s156">\n';
            xmlstring += '<Alignment ss:Horizontal="Center" ss:Vertical="Center"/>\n';
            xmlstring += '<Borders/>\n';
            xmlstring += '<Font ss:FontName="Times New Roman" x:Family="Roman" ss:Color="#000000"/>\n';
            xmlstring += '<Interior/>\n';
            xmlstring += '</Style>\n';
            xmlstring += '</Styles>\n';
            xmlstring += '<Table>\n';
            xmlstring += '<Row>\n';
            xmlstring += '<Cell ss:StyleID="Header"><Data ss:Type="String">Document Number</Data></Cell>\n';
            xmlstring += '<Cell ss:StyleID="Header"><Data ss:Type="String">Memo</Data></Cell>\n';
            xmlstring += '<Cell ss:StyleID="Header"><Data ss:Type="String">Customer Name</Data></Cell>\n';
            xmlstring += '<Cell ss:StyleID="Header"><Data ss:Type="String">Sales Order Amount</Data></Cell>\n';
            xmlstring += '<Cell ss:StyleID="Header"><Data ss:Type="String">Reason for Delay</Data></Cell>\n';
            xmlstring += '</Row>\n';
        
            for (let i = 0; i < selected.length; i++) {
                xmlstring += '<Row>\n';
                xmlstring += '<Cell ss:StyleID="s156"><Data ss:Type="String">' + selected[i].documentnumber + '</Data></Cell>\n';
                xmlstring += '<Cell ss:StyleID="s156"><Data ss:Type="String">' + selected[i].memo + '</Data></Cell>\n';
                xmlstring += '<Cell ss:StyleID="s156"><Data ss:Type="String">' + selected[i].customername + '</Data></Cell>\n';
                xmlstring += '<Cell ss:StyleID="s156"><Data ss:Type="Number">' + selected[i].amount + '</Data></Cell>\n';
                xmlstring += '<Cell ss:StyleID="s156"><Data ss:Type="String">' + selected[i].reason + '</Data></Cell>\n';
                xmlstring += '</Row>\n';
            }
        
            xmlstring += '</Table>\n';
            xmlstring += '</Worksheet>\n';
            xmlstring += '</Workbook>';
        
            log.debug('XML String', xmlstring);
        
            let base64EncodedString = encode.convert({
                string: xmlstring,
                inputEncoding: encode.Encoding.UTF_8,
                outputEncoding: encode.Encoding.BASE_64
            });
        
            let xlsFile = file.create({
                name: 'Open_SO of EmpId: ' + repId + '.xls',
                fileType: 'EXCEL',
                contents: base64EncodedString,
                folder: -15,
                isOnline: true
            });
        
            let xlsFileId = xlsFile.save();
            return xlsFileId;
        }        
        const onRequest = (scriptContext) => {
            try {
                let pageSize = 25;
                let pageIndex = parseInt(scriptContext.request.parameters.pageIndex) || 0;
                if (scriptContext.request.method === 'GET') {
                    let form = serverWidget.createForm({
                        title: 'Email Open Sales Orders to Sales Supervisors'
                    });
                    let salesRepId = scriptContext.request.parameters.salesRepId;
                    let salesRepIdField = form.addField({
                        id: 'custpage_salesrepid',
                        label: 'Sales Rep ID',
                        type: serverWidget.FieldType.TEXT
                    });
                    salesRepIdField.defaultValue = salesRepId;
                    salesRepIdField.updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.HIDDEN
                    });
                    let s1 = getEmployeeName(salesRepId);
                    let employeeName = form.addField({
                        id: 'custpage_empname',
                        label: 'Employee Name',
                        type: serverWidget.FieldType.TEXT
                    });
                    employeeName.defaultValue = s1;
                    employeeName.updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.DISABLED
                    });
                    let subList1 = form.addSublist({ id: 'custpage_sublist1', label: 'Sales Orders', type: serverWidget.SublistType.LIST });
                    subList1.addField({ id: 'custpage_docno', label: 'Document Number', type: serverWidget.FieldType.INTEGER });
                    subList1.addField({ id: 'custpage_name', label: 'Customer Name', type: serverWidget.FieldType.TEXT });
                    subList1.addField({ id: 'custpage_memo', label: 'Memo', type: serverWidget.FieldType.TEXT });
                    subList1.addField({ id: 'custpage_amount', label: 'Sales Order Amount', type: serverWidget.FieldType.TEXT });
                    subList1.addField({ id: 'custpage_reason', label: 'Reason for Delay', type: serverWidget.FieldType.TEXT 
                    }).updateDisplayType({displayType: serverWidget.FieldDisplayType.ENTRY });
                    subList1.addField({ id: 'custpage_select', label: 'Select', type: serverWidget.FieldType.CHECKBOX });
                    let result = getSalesOrderDetails(salesRepId);
                    for (let i = 0; i < result.length; i++) {
                        let documentNumber = result[i].getValue('tranid');
                        let customerId = result[i].getValue('entity');
                        let customerName = getCustomerName(customerId);
                        let memo = result[i].getValue('memo') || 'N/A';
                        // let dacteCreated = result[i].getValue('datecreated');
                        let amount = result[i].getValue('amount');
                        subList1.setSublistValue({ id: 'custpage_docno', line: i, value: documentNumber });
                        subList1.setSublistValue({ id: 'custpage_name', line: i, value: customerName });
                        subList1.setSublistValue({ id: 'custpage_memo', line: i, value: memo });
                        subList1.setSublistValue({ id: 'custpage_amount', line: i, value: amount });
                    }
                    let submitButton = form.addSubmitButton({
                        label: 'Send Email'
                    });
                    scriptContext.response.writePage(form);
                }
                else if (scriptContext.request.method === 'POST') {
                    let selected = [];
                    let sublistLines = scriptContext.request.getLineCount({ group: 'custpage_sublist1' });
                    for (let i = 0; i < sublistLines; i++) {
                        let isSelected = scriptContext.request.getSublistValue({ group: 'custpage_sublist1', name: 'custpage_select', line: i });
                        if (isSelected === 'T') {
                            selected.push({
                                documentnumber: scriptContext.request.getSublistValue({ group: 'custpage_sublist1', name: 'custpage_docno', line: i }),
                                customername: scriptContext.request.getSublistValue({ group: 'custpage_sublist1', name: 'custpage_name', line: i }),
                                reason: scriptContext.request.getSublistValue({ group: 'custpage_sublist1', name: 'custpage_reason', line: i }),
                                memo: scriptContext.request.getSublistValue({ group: 'custpage_sublist1', name: 'custpage_memo', line: i }),
                                amount: scriptContext.request.getSublistValue({ group: 'custpage_sublist1', name: 'custpage_amount', line: i })
                            });
                        }
                    }
                    log.debug('Details of the selected Sales Orders', selected);
                    let out = '';
                    if(selected.length > 0){
                        let sRepId = scriptContext.request.parameters.custpage_salesrepid;
                        let csvfileId = createcsv(selected, sRepId);
                        if(csvfileId){
                            out += 'CSV File has been created. \n';
                        }
                        else{
                            out += 'CSV File creation failed. \n';
                        }
                        let xlsfileId = createExcelFile(selected, sRepId);
                        if(xlsfileId){
                            out += 'Excel file has been created. \n';
                        }
                        else{
                            out += 'Excel file creation failed.\n';
                        }
                        let salesRepRecord = record.load({ type: 'employee', id: sRepId });
                        let spvsr = salesRepRecord.getValue('supervisor');
                        if(spvsr){
                            supervisorId = salesRepRecord.getValue('supervisor');
                        }
                        else{
                            supervisorId = -5;
                        }
                        let author = runtime.getCurrentUser().id;
                        email.send({
                            author: author,
                            recipients: supervisorId,
                            subject: 'Open Sales Orders of this month',
                            body: 'Dear employee, \n\n Details of the Open Sales Orders of this month are listed in the file attached. Kindly verify.\n\n Thank you.',
                            attachments: [file.load({ id: csvfileId }), file.load({ id: xlsfileId })]
                        });
                        out += 'Email sent.\n';
                    }
                    scriptContext.response.write(out);
                }
            }
            catch (e) {
                log.debug('Error@onRequest', e.stack + '\n' + e.message);
            }
        }

        return { onRequest, getEmployeeName, createcsv, createExcelFile }

    });

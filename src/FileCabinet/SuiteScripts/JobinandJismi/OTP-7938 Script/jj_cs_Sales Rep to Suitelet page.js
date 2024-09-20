/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
/*****************************************************************************************************************************************
 * OTP
 *
 * OTP-7938:Build a Page for Sending Emails to Sales Rep Supervisors
 *
 *******************************************************************************************************************************************
 *
 * Author: Jobin & Jismi IT Services
 *
 * Date Created : 20-September-2024
 *
 *  Description :Create a script for streamlining communication between sales reps and their supervisors by adding an "Email" button to the 
    sales rep's record in NetSuite. Upon clicking this button, users will be redirected to a new page that displays all open sales orders for 
    the selected sales rep.
    This page should list sales orders with a "Pending Approval" status and those marked as "Open" with a creation date older than one month. 
    Users can select multiple sales orders using checkboxes. Users should be able to select sales orders and provide reasons for each.

    Upon submission, the selected sales orders and reasons should be listed under each respective sales order as a sublist. All selected sales 
    orders should be compiled into an Excel file and sent to the sales rep's supervisor via email. This file should contain columns like 
    Document Number, Memo, Customer, and Sales Order Amount.
 *
 * REVISION HISTORY
 *
 * @version 1.0 OTP-7938 : 20-September-2024 : Created the initial build by JJ0340
 *********************************************************************************************************************************************/
define(['N/url', 'N/currentRecord'],
    /**
     * @param{url} url
     */
    function (url, currentRecord) {
        function redirectToSalesOrdersPage(salesRepId) {
            try {
                let suiteletUrl = url.resolveScript({
                    scriptId: 'customscript_jj_sl_display_openso_srepid',
                    deploymentId: 'customdeploy_jj_sl_display_openso_srepid'
                });
                window.location.href = suiteletUrl + '&salesRepId=' + salesRepId;
            }
            catch(e){
                log.debug('Error@redirectToSalesOrdersPage', e.stack + '\n' + e.message);
            }
        }

        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        function pageInit(scriptContext) {
            window.onbeforeunload = null;
        }

        /**
         * Function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @since 2015.2
         */
        function fieldChanged(scriptContext) {
            try{
                // let fields = currentRecord.get();
                let page = scriptContext.currentRecord.getValue({fieldId: 'custpage_pagenumber'});
                let srepid = scriptContext.currentRecord.getValue({fieldId: 'custpage_salesrepid'});
                // log.debug('Page Number Changed', page);
                if(scriptContext.fieldId === 'custpage_pagenumber'){
                    let suiteletUrl = url.resolveScript({
                        scriptId: 'customscript_jj_sl_display_openso_srepid',
                        deploymentId: 'customdeploy_jj_sl_display_openso_srepid',
                        params: {
                            pageIndex: page,
                            salesRepId: srepid
                        }
                    });
                    window.location.href = suiteletUrl;
                }
            }
            catch(e){
                log.debug('Error@fieldChanged', e.stack + '\n' + e.message);
            }
        }

        /**
         * Function to be executed when field is slaved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         *
         * @since 2015.2
         */
        // function postSourcing(scriptContext) {

        // }

        /**
         * Function to be executed after sublist is inserted, removed, or edited.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @since 2015.2
         */
        // function sublistChanged(scriptContext) {

        // }

        /**
         * Function to be executed after line is selected.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @since 2015.2
         */
        // function lineInit(scriptContext) {

        // }

        /**
         * Validation function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @returns {boolean} Return true if field is valid
         *
         * @since 2015.2
         */
        // function validateField(scriptContext) {

        // }

        /**
         * Validation function to be executed when sublist line is committed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        // function validateLine(scriptContext) {

        // }

        /**
         * Validation function to be executed when sublist line is inserted.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        // function validateInsert(scriptContext) {

        // }

        /**
         * Validation function to be executed when record is deleted.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        // function validateDelete(scriptContext) {

        // }

        /**
         * Validation function to be executed when record is saved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @returns {boolean} Return true if record is valid
         *
         * @since 2015.2
         */
        // function saveRecord(scriptContext) {

        // }

        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            // postSourcing: postSourcing,
            // sublistChanged: sublistChanged,
            // lineInit: lineInit,
            // validateField: validateField,
            // validateLine: validateLine,
            // validateInsert: validateInsert,
            // validateDelete: validateDelete,
            // saveRecord: saveRecord,
            redirectToSalesOrdersPage: redirectToSalesOrdersPage
        };

    });

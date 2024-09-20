/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
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
define(['N/ui/serverWidget', 'N/url', 'N/record', 'N/redirect'],
  /**
* @param{record} record
*/
  (serverWidget, url, record, redirect) => {
    /**
     * Defines the function definition that is executed before record is loaded.
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
     * @param {Form} scriptContext.form - Current form
     * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
     * @since 2015.2
     */
    const beforeLoad = (scriptContext) => {
      try{
        if (scriptContext.type === scriptContext.UserEventType.VIEW) {
          let form = scriptContext.form;
          let id = scriptContext.newRecord.id;
          let employeeRecord = record.load({
            type: record.Type.EMPLOYEE,
            id: id
          });
          let salesrep = employeeRecord.getValue({ fieldId: 'issalesrep' });
          if(salesrep === true){
            let email = form.addButton({
              id: 'custpage_email_button',
              label: 'Email',
              functionName: 'redirectToSalesOrdersPage(' + id + ')'
            });
          }
          form.clientScriptModulePath = './jj_cs_Sales Rep to Suitelet page.js';
        }
      }
      catch(e){
        log.debug('Error@beforeload', e.stack + '\n' + e.message);
      }
    }

    return { beforeLoad }

  });

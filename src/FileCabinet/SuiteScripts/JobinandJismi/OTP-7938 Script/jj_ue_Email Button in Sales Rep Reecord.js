/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
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
          log.debug('Sales Rep?',salesrep);
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

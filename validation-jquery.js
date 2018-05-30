'use strict';
class Validator {
  constructor(info) {
    this.env = true;
    this.form = info.form;
    this.needsValidation = info.needsValidation || [];
    this.settings = {
      displayErrorAt: info.settings.displayErrorAt || 'element',
      maxErrorToDisplay: info.settings.maxErrorCount || 1,
    };
    this.pendingElements = [];
    this.errors = {
      template: '',
    }
  }
  //Initialization.
  init() {
    var t = this;
    // console.log(this.form[0].nodeName);
    // if (this.env) {
    //   if (this.form.nodeName !== "FORM") {
    //     throw "Form is not a proper form.";
    //   }
    // }

    //Foeach validation. type.
    if (t.needsValidation.length > 0) {
      t.needsValidation.forEach(function(item) {
        //add item as pending to be validated.
        t.pendingElements.push(item);
        // console.log(item.listeners.split("|").length);
        item.listeners.split("|").forEach((listener) => {
          $(t.form).find('[name="' + item.name + '"]').on(listener, function(e) {
            t.validate(item.validate, this.value, this);
          })
        });

        // //for required i have chose focous out.
        //Change it to which ever feeds your needs.
        if (typeof item.validate.required !== "undefined" && item.validate.required) {
          $(t.form).find('[name="' + item.name + '"]').on('focusout', function(e) {
            t.validate(item.validate, this.value, this);
          })
        }

      })
    }
  }
  //Switch case.
  options(rule, ruleParameters, input, element) {
    var t = this;
    switch (rule) {
      case 'required':
        t.handleErrors(t.validateRequired(input, element), element);
        break;
      case 'email':
        t.handleErrors(t.validateEmail(input), element);
        break;
      case 'min':
        t.handleErrors(t.validateMinLength(input, ruleParameters), element);
        break;
      case 'max':
        t.handleErrors(t.validateMaxLength(input, ruleParameters), element);
        break;
      case 'type':
      t.handleErrors(t.validateType(input,ruleParameters),element);
      break;
    }
  }
  validate(validationRules, input, element) {
    // console.log(element);
    var t = this;
    // console.log(validationRules,input);
    for (var rule in validationRules) {
      // console.log(rule);parentElement;
      t.options(rule, validationRules[rule], input, element);
    }
  }

  checkProgress(){
  }
  //Notify that everything has been validated.
  validationSuccess(){
    $(window).trigger('validation-successful');
  }

  errorTemplate(validationSettings) {

  }
  handleErrors(action, element) {
    var t = this;
    var target = (t.settings.displayErrorAt === 'element') ? $(t.form).find('[name="' + element.name + '"]') : $(t.form).find('[name="' + element.name + '"]').parent();

    if (action || action === 'success') {
      $(target).removeClass('validator-error').addClass('validator-success');
    } else if (!action || action === "failed") {
      $(target).removeClass('validator-success').addClass('validator-error');
      //add message based on the option

    }
  }

  /**
   * Validation Functions.
   * Place below all the necessary functions,
   * That validate the fields.
   **/
  validateEmail(input) {
    var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(input);
  }

  validateRequired(input, element) {
    if (element.nodeName === "INPUT") {
      return (input.length > 0);
    }
  }
  //min length.
  validateMinLength(input, length) {
    return (input.length > length);
  }
  //max length
  validateMaxLength(input, length) {
    return (input.length < length);
  }
  //
  validateType(input,type){
    return (typeof input === type);
  }

  //regex
  validateRegex(input,regex){
    return input.test(regex);
  }
}

'use strict';
class Validator {
  constructor(info) {
    this.env = true;
    this.form = info.form;
    this.needsValidation = info.needsValidation || [];
    this.pendingElements = [];
    this.settings = {
      displayErrorAt: info.settings.displayErrorAt || 'element',
      maxErrorToDisplay: info.settings.maxErrorCount || 1,
    };
    this.errors = {
      pending : [],
      template: '',
    }
    this.messages = {
      min: info.messages.min || 'Min value',
      max: info.messages.max || 'Max value',
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
        t.pendingElements.push({
          'name': item.name,
          'validate': item.validate,
          'status' : false,
        });
        // console.log(item.listeners.split("|").length);
        item.listeners.split("|").forEach((listener) => {
          $(t.form).find('[name="' + item.name + '"]').on(listener, function(e) {
            t.validate(item.validate, this.value, this);
          })
        });

        // //for required i have chose focous out.
        //Change it to which ever feeds your needs.
        // if (typeof item.validate.required !== "undefined" && item.validate.required) {
        //   $(t.form).find('[name="' + item.name + '"]').on('focusout', function(e) {
        //     t.validate(item.validate, this.value, this);
        //   })
        // }

      })
    }
  }
  //Switch case.
  options(rule, ruleParameters, input, element) {
    var t = this;
    switch (rule) {
      case 'required':
        t.checkProgress(rule, t.validateRequired(input, element), element);
        break;
      case 'email':
        t.checkProgress(rule, t.validateEmail(input), element);
        break;
      case 'min':
        t.checkProgress(rule, t.validateMinLength(input, ruleParameters), element);
        break;
      case 'max':
        t.checkProgress(rule, t.validateMaxLength(input, ruleParameters), element);
        break;
      case 'type':
        t.checkProgress(rule, t.validateType(input, ruleParameters), element);
        break;
      default:
        throw Error('Not a valid validatior setting. Check your validate:{} parameters')
        break;
    }
  }
  validate(validationRules, input, element) {
    var t = this;
    // console.log(validationRules,input);
    for (var rule in validationRules) {
      let ruleParameter = validationRules[rule];
      if (typeof ruleParameter === "string") {
        let tempArray = ruleParameter.split("|");
        //tempArray > 1
        if (tempArray.length > 0) {
          tempArray.map((value) => {
            if (value.indexOf('when:') === -1) {
              t.handleWhen(value);
            } else if (value.indexOf('whenNot:') === 0) {
              t.handleWhenNot(value);
            }
          })
        }
      }
      t.options(rule, ruleParameter, input, element);
    }
  }

  handleWhen(value) {
    // /    console.log('When');

  }
  handleWhenNot(value) {
    // console.log('whenNot');
  }

  checkProgress(rule, action, element) {
    var index = this.pendingElements.findIndex((item) => {
      return item.name === element.name;
    });

    this.pendingElements[index].validate[rule] = action;

    if(!action || action === 'failed'){
      // this.errors.pending.push({'element':element.name,'rule':rule,'status':false})
    }else{
      this.errors.pending.map(item =>{
        console.log(item.element === element.name && item.rule === rule);
        if(item.element === element.name && item.rule === rule){
        }
      })
    }
    var status = this.pendingElements.every(item => {
      return item.status;
    });

    var elementStatus = '';

    if(status){
      this.handleErrors(rule,action,element);
      return validationSuccess();
    }else{
      this.handleErrors(rule,action,element);
    }

  }

  //Notify that everything has been validated.
  validationSuccess() {
    $(window).trigger('validation-successful');
    console.log('successful');
  }

  errorTemplate(validationSettings) {

  }

  handleErrors(rule, action, element) {
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
  validateType(input, type) {
    return (typeof input === type);
  }

  //regex
  validateRegex(input, regex) {
    return input.test(regex);
  }
}

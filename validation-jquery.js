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
        //bind the listeners
        if (item.type === 'text' || item.type === 'email') {
          $(t.form).find('[name="'+ item.name + '"]').on('input', function(e) {
            console.log('xx');
            t.validate(item.validate, this.value, this);
          })
        }

        //for required i have chose focous out.
        //Change it to which ever feeds your needs.
        if (typeof item.validate.required !== "undefined" && item.validate.required) {
          $(t.form).find('[name="'+ item.name + '"]').on('focusout', function(e) {
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
        t.validateRequired(input, element);
        break;
      case 'email':
        t.validateEmail(input, element);
        break;
      default:

    }
  }
  validate(validationRules, input, element) {
    var t = this;
    // console.log(validationRules,input);
    for (var rule in validationRules) {
      // console.log(rule);parentElement;
      t.options(rule, validationRules[rule], input, element);
    }
  }

  handleErrors(action, element,validationSettings) {
    var t = this;
    var target = (t.settings.displayErrorAt === 'element') ?   $(t.form).find('[name="'+ element.name + '"]') :   $(t.form).find('[name="'+ element.name + '"]').parent();
    if (action || action === 'success') {
      $(target).removeClass('validator-error').addClass('validator-success');
    } else if (!action || action === "failed") {
      $(target).removeClass('validator-success').addClass('validator-error');
      //add message based on the option

    }
  }
  validateEmail(input, element) {
    var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    this.handleErrors(emailRegex.test(input), element);
  }
  validateRequired(input, element) {
    this.handleErrors((input.length > 0), element);
  }

  classList(elt) {
    var list = elt.classList;

    return {
      toggle: function(c) {
        list.toggle(c);
        return this;
      },
      add: function(c) {
        list.add(c);
        return this;
      },
      remove: function(c) {
        list.remove(c);
        return this;
      }
    };

  }
}
